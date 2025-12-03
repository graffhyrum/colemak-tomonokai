/**
 * Level management system for the typing tutor
 * Handles level progression, word filtering, and level-based game logic
 */

import { masterWordList } from "../data/masterWordList.ts";
import { filterWordsByLevel, getCumulativeCharacters } from "../data/words";
import type { LayoutName } from "../entities/layouts.ts";
import { assertLevel, isLevel, type Level } from "../entities/levels.ts";

export interface LevelInfo {
	number: number;
	characters: string;
	wordCount: number;
}

/**
 * Create a level manager for a specific layout
 */
export function createLevelManager(layout: LayoutName) {
	let currentLevel: Level = 1;

	return {
		getCurrentLevel: (): Level => currentLevel,
		setCurrentLevel: (level: Level): void => {
			currentLevel = level;
		},
		getLevelInfo: (level: Level): LevelInfo => {
			assertLevel(level);
			const characters = getCumulativeCharacters(layout, level);
			const filteredWords = filterWordsByLevel(masterWordList, layout, level);
			return {
				number: level,
				characters,
				wordCount: filteredWords.length,
			};
		},
		getFilteredWords: (level: Level): string[] => {
			assertLevel(level);
			return filterWordsByLevel(masterWordList, layout, level);
		},
		canProgressToLevel: (level: Level): boolean => {
			// For now, allow progression to any valid level
			// In the future, this could check user progress/stats
			return isLevel(level);
		},
		getNextLevel: (): number | null => {
			const nextLevel = currentLevel + 1;
			assertLevel(nextLevel);
			return isLevel(nextLevel) ? nextLevel : null;
		},
		getPreviousLevel: (): number | null => {
			const prevLevel = currentLevel - 1;
			assertLevel(prevLevel);
			return isLevel(prevLevel) ? prevLevel : null;
		},
	};
}

export type LevelManager = ReturnType<typeof createLevelManager>;
