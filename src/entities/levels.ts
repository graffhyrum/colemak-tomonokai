import type { LayoutName } from "./layouts.ts";

export const LEVELS = [1, 2, 3, 4, 5, 6, 7] as const;
export type Level = (typeof LEVELS)[number];
export type LevelKey = `lvl${Level}`;
export type LevelDictionary = Record<LayoutName, Record<LevelKey, string>>;

export function isLevel(x: unknown): x is Level {
	return LEVELS.includes(x as Level);
}

export function assertLevel(x: unknown): asserts x is Level {
	if (!isLevel(x)) {
		throw new Error(`Invalid level: ${x}`);
	}
}
