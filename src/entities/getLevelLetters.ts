import { LAYOUT_DICTIONARIES, type LayoutName } from "./layouts.ts";
import type { Level } from "./levels.ts";

export function getLevelLetters(layout: LayoutName, level: Level): string {
	const layoutDict = LAYOUT_DICTIONARIES[layout];
	if (!layoutDict) return "";
	const levelKey = `lvl${level}` as const;
	return layoutDict[levelKey] || "";
}
