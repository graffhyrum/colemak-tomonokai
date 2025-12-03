/**
 * Level management system for the typing tutor
 * Handles level progression, word filtering, and level-based game logic
 */

import {
	filterWordsByLevel,
	getCumulativeCharacters,
	masterWordList,
} from "../data/words";
import type { LayoutName } from "../entities/layouts.ts";
import { LEVELS } from "../entities/levels.ts";

export interface LevelInfo {
	number: number;
	characters: string;
	wordCount: number;
}

export interface LevelManager {
	getCurrentLevel(): number;

	setCurrentLevel(level: number): void;

	getLevelInfo(level: number): LevelInfo;

	getAvailableLevels(): number[];

	getFilteredWords(level: number): string[];

	canProgressToLevel(level: number): boolean;

	getNextLevel(): number | null;

	getPreviousLevel(): number | null;

	validateLevel(level: number): boolean;
}

/**
 * Create a level manager for a specific layout
 */
export function createLevelManager(layout: LayoutName): LevelManager {
	let currentLevel = 1;

	const getCurrentLevel = (): number => currentLevel;

	const setCurrentLevel = (level: number): void => {
		if (!validateLevel(level)) {
			throw new Error(`Invalid level: ${level}`);
		}
		currentLevel = level;
	};

	const getLevelInfo = (level: number): LevelInfo => {
		if (!validateLevel(level)) {
			throw new Error(`Invalid level: ${level}`);
		}

		const characters = getCumulativeCharacters(layout, level);
		const filteredWords = filterWordsByLevel(masterWordList, layout, level);

		return {
			number: level,
			characters,
			wordCount: filteredWords.length,
		};
	};

	const getAvailableLevels = (): number[] => {
		return [1, 2, 3, 4, 5, 6, 7];
	};

	const getFilteredWords = (level: number): string[] => {
		if (!validateLevel(level)) {
			throw new Error(`Invalid level: ${level}`);
		}
		return filterWordsByLevel(masterWordList, layout, level);
	};

	const canProgressToLevel = (level: number): boolean => {
		// For now, allow progression to any valid level
		// In the future, this could check user progress/stats
		return validateLevel(level);
	};

	const getNextLevel = (): number | null => {
		const nextLevel = currentLevel + 1;
		return validateLevel(nextLevel) ? nextLevel : null;
	};

	const getPreviousLevel = (): number | null => {
		const prevLevel = currentLevel - 1;
		return validateLevel(prevLevel) ? prevLevel : null;
	};

	const validateLevel = (level: number): boolean => {
		return Number.isInteger(level) && level >= 1 && level <= 7;
	};

	return {
		getCurrentLevel,
		setCurrentLevel,
		getLevelInfo,
		getAvailableLevels,
		getFilteredWords,
		canProgressToLevel,
		getNextLevel,
		getPreviousLevel,
		validateLevel,
	};
}

/**
 * Get the maximum level available
 */
export const MAX_LEVEL = LEVELS.reduce((max, level) => {
	return Math.max(max, level);
}, 0);

/**
 * Get the minimum level available
 */
export const MIN_LEVEL = LEVELS.reduce((max, level) => {
	return Math.min(max, level);
}, 0);
