import { z } from "zod";
import { ALL_MODULES, isModuleId, MODULE_IDS, type ModuleId } from "./registry";

/**
 * A client is one deployment of the template: its brand, its switched-on modules
 * and its locale. Each lives in `clients/<id>/client.config.ts` and is chosen at
 * boot by the `CLIENT_ID` environment variable. No secrets belong in a config:
 * name the environment variable instead.
 */

export class ClientConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ClientConfigError";
	}
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const IMAGE_FILE = /\.(svg|png)$/i;

function isTimeZone(value: string): boolean {
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: value });
		return true;
	} catch {
		return false;
	}
}

const brandSchema = z
	.object({
		name: z.string().min(1),
		shortName: z.string().min(1).max(24),
		tagline: z.string().min(1).optional(),
		/** Path relative to the client's own folder, e.g. `brand/logo.svg`. */
		logo: z.string().regex(IMAGE_FILE, "must be an .svg or .png file"),
		favicon: z.string().regex(IMAGE_FILE, "must be an .svg or .png file"),
		primaryColor: z
			.string()
			.regex(HEX_COLOR, "must be a hex colour like #006b4f"),
		supportEmail: z.email(),
		emailFromName: z.string().min(1),
		domain: z.string().min(1),
	})
	.strict();

const localeSchema = z
	.object({
		currency: z.string().regex(/^[A-Z]{3}$/, "must be a 3-letter ISO code"),
		timezone: z.string().refine(isTimeZone, "must be an IANA time zone"),
	})
	.strict();

const featuresSchema = z
	.object({
		telemetry: z.boolean().default(false),
		landing: z.boolean().default(false),
	})
	.strict();

const modulesSchema = z.union([
	z.array(z.string()),
	z
		.object({
			enabled: z.array(z.string()),
			options: z.record(z.string(), z.unknown()).optional(),
		})
		.strict(),
]);

const clientSchema = z
	.object({
		brand: brandSchema,
		modules: modulesSchema,
		locale: localeSchema,
		features: featuresSchema.default({ telemetry: false, landing: false }),
	})
	.strict();

type ModuleOptionsInput = {
	[K in ModuleId]?: z.input<(typeof ALL_MODULES)[K]["optionsSchema"]>;
};

export type ClientConfigInput = {
	brand: z.input<typeof brandSchema>;
	/** Either the list of module ids, or `{ enabled, options }`. */
	modules: ModuleId[] | { enabled: ModuleId[]; options?: ModuleOptionsInput };
	locale: z.input<typeof localeSchema>;
	features?: z.input<typeof featuresSchema>;
};

export type ClientConfig = {
	brand: z.output<typeof brandSchema>;
	modules: {
		enabled: ModuleId[];
		/** Each enabled module's options, already parsed by that module's schema. */
		options: Partial<Record<ModuleId, unknown>>;
	};
	locale: z.output<typeof localeSchema>;
	features: z.output<typeof featuresSchema>;
};

type Catalog = Readonly<
	Record<string, { readonly requires: readonly string[] }>
>;

/**
 * Throws a plain-language error when a module id is unknown or a module's
 * `requires` is not switched on. `where` names the source of the list. The
 * catalog is the real registry unless a test passes its own.
 */
export function assertModuleSet(
	enabled: readonly string[],
	where: string,
	catalog: Catalog = ALL_MODULES,
): asserts enabled is ModuleId[] {
	for (const id of enabled) {
		if (!Object.hasOwn(catalog, id)) {
			throw new ClientConfigError(
				`${where} turns on the module "${id}", which does not exist. Known modules: ${Object.keys(catalog).join(", ")}.`,
			);
		}
	}

	const on = new Set(enabled);

	if (on.size !== enabled.length) {
		throw new ClientConfigError(`${where} lists the same module twice.`);
	}

	for (const id of enabled) {
		for (const required of catalog[id]?.requires ?? []) {
			if (!on.has(required)) {
				throw new ClientConfigError(
					`${where} turns on "${id}", which needs "${required}". Add "${required}" to the list.`,
				);
			}
		}
	}
}

export function defineClient(input: ClientConfigInput): ClientConfig {
	const parsed = clientSchema.safeParse(input);

	if (!parsed.success) {
		throw new ClientConfigError(
			`The client config is not valid:\n${parsed.error.issues
				.map(
					(item) => `  - ${item.path.join(".") || "(config)"}: ${item.message}`,
				)
				.join("\n")}`,
		);
	}

	const { modules } = parsed.data;
	const enabled = Array.isArray(modules) ? modules : modules.enabled;
	const rawOptions = Array.isArray(modules) ? {} : (modules.options ?? {});

	assertModuleSet(enabled, "The client config");

	const options: Partial<Record<ModuleId, unknown>> = {};

	for (const [id, value] of Object.entries(rawOptions)) {
		if (!isModuleId(id)) {
			throw new ClientConfigError(
				`modules.options has settings for "${id}", which is not a known module. Known modules: ${MODULE_IDS.join(", ")}.`,
			);
		}

		if (!enabled.includes(id)) {
			throw new ClientConfigError(
				`modules.options has settings for "${id}", but "${id}" is not in the enabled list.`,
			);
		}

		const checked = ALL_MODULES[id].optionsSchema.safeParse(value);

		if (!checked.success) {
			throw new ClientConfigError(
				`modules.options.${id} is not valid:\n${checked.error.issues
					.map(
						(item) =>
							`  - ${item.path.join(".") || "(options)"}: ${item.message}`,
					)
					.join("\n")}`,
			);
		}

		options[id] = checked.data;
	}

	return {
		brand: parsed.data.brand,
		modules: { enabled, options },
		locale: parsed.data.locale,
		features: parsed.data.features,
	};
}
