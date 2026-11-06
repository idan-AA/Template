import { z } from "zod";
import { CORE_ROLES } from "./roles";

/**
 * A module is one switchable slice of the product (crm, bookkeeping, ...). Each
 * module's `meta.ts` is PURE DATA built with `defineModule`: no Nest, no React,
 * no database, no environment. That is what makes it safe to read in the browser.
 * Anything that needs a database or a framework lives in the module's
 * `server.ts`, loaded only by the side that needs it.
 *
 * Widget components cannot live here (a package cannot import app code), so a
 * widget is declared by id and the app maps the id to a component.
 */

/** Icons a module may ask for. The app maps each key to a real icon component. */
export const NAV_ICON_KEYS = ["company", "contact", "deal", "ledger"] as const;

export type NavIconKey = (typeof NAV_ICON_KEYS)[number];

/** Places a module can put a widget. */
export const WIDGET_SLOTS = ["overview"] as const;

export type WidgetSlot = (typeof WIDGET_SLOTS)[number];

const MODULE_ID = /^[a-z][a-z0-9-]*$/;
const ROLE_ID = /^[a-z][a-z0-9_]*$/;
const PERMISSION_KEY = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9_-]*)+$/;
const WIDGET_ID = /^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/;
const PATH = /^\/[a-z0-9/_-]*$/;
const FIELD_ENTITY = /^[A-Z][A-Z_]*$/;
const ROUTER_ALIAS = /^[a-z][A-Za-z0-9]*$/;

const path = z.string().regex(PATH, "must be a path such as /companies");

const navItemSchema = z
	.object({
		title: z.string().min(1),
		href: path,
		icon: z.enum(NAV_ICON_KEYS),
		match: z.enum(["exact", "prefix"]),
		related: z.array(path).default([]),
	})
	.strict();

const settingsItemSchema = z
	.object({
		title: z.string().min(1),
		href: path,
		/** The settings page (by href) this item should sit directly after. */
		after: path.optional(),
	})
	.strict();

const widgetSchema = z
	.object({
		id: z.string().regex(WIDGET_ID, "must look like <module>.<name>"),
		slot: z.enum(WIDGET_SLOTS),
	})
	.strict();

const roleSchema = z
	.object({
		id: z.string().regex(ROLE_ID),
		label: z.string().min(1),
	})
	.strict();

const NO_OPTIONS = z.object({}).strict();

const moduleSchema = z
	.object({
		id: z.string().regex(MODULE_ID),
		label: z.string().min(1),
		/** One plain sentence for the Features page: what switching this on gives the client. */
		description: z.string().min(1).optional(),
		/**
		 * The tRPC router aliases this module owns (`companies` for
		 * `companies.list`). The API refuses calls to them while the module is
		 * off. A module may have none yet.
		 */
		routers: z.array(z.string().regex(ROUTER_ALIAS)).default([]),
		requires: z.array(z.string().regex(MODULE_ID)).default([]),
		nav: z.array(navItemSchema).default([]),
		settings: z.array(settingsItemSchema).default([]),
		widgets: z.array(widgetSchema).default([]),
		roles: z.array(roleSchema).default([]),
		permissions: z
			.record(z.string().regex(PERMISSION_KEY), z.array(z.string()))
			.default({}),
		fieldEntities: z.array(z.string().regex(FIELD_ENTITY)).default([]),
		optionsSchema: z.custom<z.ZodType>((value) => value instanceof z.ZodType),
	})
	.strict()
	.superRefine((module, ctx) => {
		const issue = (message: string) =>
			ctx.addIssue({ code: "custom", message });

		if (module.requires.includes(module.id)) {
			issue(`module "${module.id}" cannot require itself`);
		}

		const ownRoles = new Set(module.roles.map((role) => role.id));

		for (const role of module.roles) {
			if ((CORE_ROLES as readonly string[]).includes(role.id)) {
				issue(`role "${role.id}" is a core role; a module cannot redeclare it`);
			}
		}

		if (ownRoles.size !== module.roles.length) {
			issue("a role id is declared twice");
		}

		const allowed = new Set<string>([...CORE_ROLES, ...ownRoles]);

		for (const [key, roles] of Object.entries(module.permissions)) {
			if (!key.startsWith(`${module.id}.`)) {
				issue(`permission "${key}" must start with "${module.id}."`);
			}

			for (const role of roles) {
				if (!allowed.has(role)) {
					issue(
						`permission "${key}" names role "${role}", which is neither a core role nor declared by this module`,
					);
				}
			}
		}

		for (const widget of module.widgets) {
			if (!widget.id.startsWith(`${module.id}.`)) {
				issue(`widget "${widget.id}" must start with "${module.id}."`);
			}
		}

		const unique = (label: string, values: readonly string[]) => {
			if (new Set(values).size !== values.length) {
				issue(`${label} must not repeat`);
			}
		};

		unique(
			"nav hrefs",
			module.nav.map((item) => item.href),
		);
		unique(
			"settings hrefs",
			module.settings.map((item) => item.href),
		);
		unique(
			"widget ids",
			module.widgets.map((widget) => widget.id),
		);
		unique("fieldEntities", module.fieldEntities);
		unique("routers", module.routers);
		unique("requires", module.requires);
	});

export type NavItem = z.output<typeof navItemSchema>;
export type SettingsItem = z.output<typeof settingsItemSchema>;
export type WidgetDeclaration = z.output<typeof widgetSchema>;
export type ModuleRole = z.output<typeof roleSchema>;

type Parsed = z.output<typeof moduleSchema>;

export type ModuleInput<
	Id extends string = string,
	Options extends z.ZodType = typeof NO_OPTIONS,
> = Omit<z.input<typeof moduleSchema>, "id" | "optionsSchema"> & {
	id: Id;
	/** Shape of this module's `modules.options.<id>` block in a client config. */
	optionsSchema?: Options;
};

export type ModuleDefinition<
	Id extends string = string,
	Options extends z.ZodType = z.ZodType,
> = Omit<Parsed, "id" | "optionsSchema"> & {
	readonly id: Id;
	readonly optionsSchema: Options;
};

export function defineModule<
	const Id extends string,
	Options extends z.ZodType = typeof NO_OPTIONS,
>(input: ModuleInput<Id, Options>): ModuleDefinition<Id, Options> {
	const parsed = moduleSchema.safeParse({
		...input,
		optionsSchema: input.optionsSchema ?? NO_OPTIONS,
	});

	if (!parsed.success) {
		throw new Error(
			`Module "${input.id}" is not valid:\n${parsed.error.issues
				.map(
					(item) => `  - ${item.path.join(".") || "(module)"}: ${item.message}`,
				)
				.join("\n")}`,
		);
	}

	return parsed.data as ModuleDefinition<Id, Options>;
}
