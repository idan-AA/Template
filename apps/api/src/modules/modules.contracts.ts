import { z } from "zod";

/** What every signed-in person's app needs: which modules are on, and whether they are the developer. */
export const modulesStateOutput = z.object({
	enabled: z.array(z.string()),
	isDeveloper: z.boolean(),
});

export type ModulesState = z.infer<typeof modulesStateOutput>;

export const moduleStatusOutput = z.object({
	id: z.string(),
	label: z.string(),
	description: z.string().nullable(),
	/** Ids of the modules that must be on for this one to be on. */
	requires: z.array(z.string()),
	/** Ids of the modules that cannot be on at the same time as this one (symmetric). */
	conflicts: z.array(z.string()),
	/** A plain sentence to add when the switch is blocked by a conflict, or null. */
	conflictNote: z.string().nullable(),
	enabled: z.boolean(),
	/** Whether the client's starting config has it on. */
	startingEnabled: z.boolean(),
	/** "switch" when the developer has switched it, "config" when the starting set decides. */
	source: z.enum(["config", "switch"]),
	changedAt: z.string().nullable(),
	changedBy: z.string().nullable(),
	/** What switching it off keeps, in plain words, e.g. "128 companies". Null when there is nothing to say. */
	dataHint: z.string().nullable(),
});

export const modulesListOutput = z.object({
	modules: z.array(moduleStatusOutput),
	/** True when ENABLED_MODULES is set on this deploy: the switches cannot be used. */
	lockedByEnvironment: z.boolean(),
});

export type ModulesList = z.infer<typeof modulesListOutput>;

export const setModuleInput = z.object({
	moduleId: z.string().min(1).max(64),
	enabled: z.boolean(),
});

export type SetModuleInput = z.infer<typeof setModuleInput>;
