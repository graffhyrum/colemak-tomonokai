import { LAYOUT_DICTIONARIES, type LayoutName } from "../entities/layouts.ts";
import { assertLevel, type Level, type LevelKey } from "../entities/levels.ts";

/**
 * Get the character set for a specific layout and level
 */
export function filterWordsByLevel(
	words: string[],
	layout: LayoutName,
	level: Level,
): string[] {
	const allowedChars = getCumulativeCharacters(layout, level);
	const allowedSet = new Set(allowedChars.toLowerCase());

	return words.filter((word) => {
		return word.split("").every((char) => allowedSet.has(char.toLowerCase()));
	});
}

export function getCumulativeCharacters(
	layout: LayoutName,
	level: Level,
): string {
	let characters = "";

	for (let i = 1; i <= level; i++) {
		assertLevel(i);
		characters += getLevelCharacters(layout, i);
	}

	return characters;
}

export function getLevelCharacters(layout: LayoutName, level: Level): string {
	const levelKey: LevelKey = `lvl${level}`;
	if (!LAYOUT_DICTIONARIES[layout]) {
		throw new Error(`Unknown layout: ${layout}`);
	}

	if (!LAYOUT_DICTIONARIES[layout][levelKey]) {
		throw new Error(`Unknown level ${level} for layout ${layout}`);
	}

	return LAYOUT_DICTIONARIES[layout][levelKey];
}
