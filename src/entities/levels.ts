import type { LayoutName } from "./layouts.ts";

export const LEVELS = [1, 2, 3, 4, 5, 6, 7] as const;
export type Level = (typeof LEVELS)[number];
export type LevelKey = `lvl${Level}`;
export type LevelDictionary = Record<LayoutName, Record<LevelKey, string>>;
