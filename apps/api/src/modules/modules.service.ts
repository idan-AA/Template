import type { Db } from "@app/db";
import { writeAudit } from "@app/db/audit";
import { readModuleSwitches } from "@app/db/module-switches";
import { enabledModules } from "@app/modules";
import { isDeveloper } from "@app/modules/developer";
import {
	ALL_MODULES,
	isModuleId,
	MODULE_IDS,
	type ModuleId,
} from "@app/modules/registry";
import {
	applyModuleSwitches,
	ensureModuleState,
	registerModuleSwitchLoader,
	resolveModuleIds,
	startingModuleIds,
} from "@app/modules/state";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	type OnModuleInit,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { getRequestContext } from "../logging/request-context";
import { MODULE_SETUP } from "./module-setup";
import type {
	ModulesList,
	ModulesState,
	SetModuleInput,
} from "./modules.contracts";

type Caller = { id: string; email: string; name?: string | null };

/** The setup can touch many rows the first time a module goes on, so the transaction gets more than the default 5 seconds. */
const SWITCH_TRANSACTION_MS = 30_000;

@Injectable()
export class ModulesService implements OnModuleInit {
	private readonly logger = new Logger(ModulesService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	/** The API reads switches from its own database; every guard then reads the cached answer. */
	async onModuleInit(): Promise<void> {
		registerModuleSwitchLoader(() => readModuleSwitches(this.db));
		await this.setUpEnabledModules();
	}

	/**
	 * A module that is on from the client config (or ENABLED_MODULES) was never
	 * switched on, so `set` never ran its setup. Run every enabled module's setup
	 * at boot. Setup is idempotent, so this changes nothing once it has run. A
	 * failure is logged and does not stop the API from starting.
	 */
	private async setUpEnabledModules(): Promise<void> {
		try {
			await ensureModuleState(0);
		} catch (error) {
			this.logger.error(`Could not read the module switches at boot: ${String(error)}`);
		}

		for (const module of enabledModules()) {
			const setup = MODULE_SETUP[module.id];
			if (!setup) continue;
			try {
				await this.db.$transaction((tx) => setup(tx), {
					maxWait: 10_000,
					timeout: SWITCH_TRANSACTION_MS,
				});
			} catch (error) {
				this.logger.error(`Setup for module "${module.id}" failed at boot: ${String(error)}`);
			}
		}
	}

	/** Which modules are on, and whether the caller is the developer. Any signed-in person. */
	async state(caller: Caller): Promise<ModulesState> {
		await ensureModuleState();

		return {
			enabled: enabledModules().map((module) => module.id),
			isDeveloper: await isDeveloper(this.db, caller),
		};
	}

	/** Every module with its switch. Developer only. */
	async list(caller: Caller): Promise<ModulesList> {
		await this.requireDeveloper(caller);
		await ensureModuleState();

		return this.snapshot();
	}

	async set(caller: Caller, input: SetModuleInput): Promise<ModulesList> {
		await this.requireDeveloper(caller);

		if (process.env.ENABLED_MODULES?.trim()) {
			throw new ConflictException(
				"This deploy fixes its features with ENABLED_MODULES, so they cannot be switched here.",
			);
		}

		if (!isModuleId(input.moduleId)) {
			throw new BadRequestException(
				`"${input.moduleId}" is not a feature this product has.`,
			);
		}

		const moduleId = input.moduleId;

		const switches = await this.db.$transaction(
			async (tx) => {
				const rows = await readModuleSwitches(tx);
				const before = resolveModuleIds(startingModuleIds(), rows);

				const next = [
					...rows.filter((row) => row.moduleId !== moduleId),
					{ moduleId, enabled: input.enabled },
				];

				let after: ModuleId[];

				try {
					after = resolveModuleIds(startingModuleIds(), next);
				} catch (error) {
					throw new ConflictException(
						this.explain(moduleId, input.enabled, error),
					);
				}

				await tx.moduleSwitch.upsert({
					where: { moduleId },
					create: {
						moduleId,
						enabled: input.enabled,
						changedById: caller.id,
					},
					update: { enabled: input.enabled, changedById: caller.id },
				});

				// Going on: make sure what the module needs exists (never demo data).
				// Setup is idempotent, so switching on again later is harmless.
				if (input.enabled && !before.includes(moduleId)) {
					await MODULE_SETUP[moduleId]?.(tx);
				}

				await writeAudit(tx, {
					module: "core",
					actorType: "USER",
					actorId: caller.id,
					actorLabel: caller.name
						? `${caller.name} <${caller.email}>`
						: caller.email,
					action: "MODULE_SWITCHED",
					entityType: "module",
					entityId: moduleId,
					summary: `${ALL_MODULES[moduleId].label} switched ${input.enabled ? "on" : "off"}`,
					before: { enabled: before.includes(moduleId) },
					after: { enabled: after.includes(moduleId) },
					requestId: getRequestContext()?.requestId ?? null,
				});

				return next;
			},
			{ timeout: SWITCH_TRANSACTION_MS },
		);

		// This process sees it now; the others catch up within the refresh interval.
		applyModuleSwitches(switches);

		this.logger.log({
			message: "Module switched",
			userId: caller.id,
			moduleId,
			enabled: input.enabled,
		});

		return this.snapshot();
	}

	private async requireDeveloper(caller: Caller): Promise<void> {
		if (!(await isDeveloper(this.db, caller))) {
			throw new ForbiddenException(
				"Only the developer account can change which features are switched on.",
			);
		}
	}

	/** A plain sentence for a switch that would leave a module without what it needs. */
	private explain(moduleId: ModuleId, enabled: boolean, error: unknown): string {
		const label = ALL_MODULES[moduleId].label;
		const detail = error instanceof Error ? ` ${error.message}` : "";

		return enabled
			? `${label} cannot be switched on yet: something it needs is off.${detail}`
			: `${label} cannot be switched off: another feature that is on needs it.${detail}`;
	}

	private async snapshot(): Promise<ModulesList> {
		const rows = await readModuleSwitches(this.db);
		const byId = new Map(rows.map((row) => [row.moduleId, row]));
		const starting = new Set<string>(startingModuleIds());
		const on = new Set<string>(enabledModules().map((module) => module.id));

		const people = await this.db.user.findMany({
			where: {
				id: {
					in: rows.flatMap((row) => (row.changedById ? [row.changedById] : [])),
				},
			},
			select: { id: true, name: true },
		});
		const names = new Map(people.map((person) => [person.id, person.name]));

		const modules = await Promise.all(
			MODULE_IDS.map(async (id) => {
				const definition = ALL_MODULES[id];
				const row = byId.get(id);

				return {
					id,
					label: definition.label,
					description: definition.description ?? null,
					requires: [...definition.requires],
					enabled: on.has(id),
					startingEnabled: starting.has(id),
					source: row ? ("switch" as const) : ("config" as const),
					changedAt: row ? row.changedAt.toISOString() : null,
					changedBy: row?.changedById
						? (names.get(row.changedById) ?? null)
						: null,
					dataHint: await this.dataHint(id),
				};
			}),
		);

		return {
			modules,
			lockedByEnvironment: Boolean(process.env.ENABLED_MODULES?.trim()),
		};
	}

	/** What stays in the database whatever the switch says, so the page can reassure the developer. */
	private async dataHint(id: ModuleId): Promise<string | null> {
		try {
			if (id === "crm") {
				const [companies, contacts, deals] = await Promise.all([
					this.db.company.count(),
					this.db.contact.count(),
					this.db.deal.count(),
				]);

				return companies + contacts + deals === 0
					? null
					: `${companies} companies, ${contacts} contacts, ${deals} deals`;
			}

			if (id === "bookkeeping") {
				const entries = await this.db.journalEntry.count();
				return entries === 0 ? null : `${entries} journal entries`;
			}
		} catch (error) {
			// A hint is a nicety; never fail the page for it.
			this.logger.warn({
				message: "Could not count a module's data",
				moduleId: id,
				error: error instanceof Error ? error.message : String(error),
			});
		}

		return null;
	}
}
