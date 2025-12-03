/**
 * Word generation and selection system for the typing tutor
 * Handles word filtering by level, game modes, and randomization
 */

import { filterWordsByLevel, masterWordList } from "../data/words";
import type { LayoutName } from "../types";
import {assertDefined} from "./validation.ts";

export type GameMode = "all-words" | "full-sentences";

export interface WordGenerator {
	getNextWord(): string;
	getWordList(): string[];
	reset(): void;
	setLevel(level: number): void;
	setGameMode(mode: GameMode): void;
	getAvailableWords(): number;
}

/**
 * Create a word generator for a specific layout and level
 */
export function createWordGenerator(
	layout: LayoutName,
	initialLevel = 1,
	gameMode: GameMode = "all-words",
): WordGenerator {
	let currentLevel = initialLevel;
	let _currentGameMode = gameMode;
	let availableWords: string[] = [];
	const usedWords: Set<string> = new Set();
	let currentIndex = 0;

	// Initialize with current settings
	updateAvailableWords();

	function updateAvailableWords(): void {
		availableWords = filterWordsByLevel(masterWordList, layout, currentLevel);
		usedWords.clear();
		currentIndex = 0;

		// Shuffle the words for randomization
		shuffleArray(availableWords);
	}

	function getNextWord(): string {
		if (availableWords.length === 0) {
			return "error"; // Fallback word
		}

		// If we've used all words, reset and start over
		if (usedWords.size >= availableWords.length) {
			usedWords.clear();
		}

		// Find an unused word
		let attempts = 0;
		while (attempts < availableWords.length) {
			const word = availableWords[currentIndex % availableWords.length];
			if (!word) {
				currentIndex = (currentIndex + 1) % availableWords.length;
				attempts++;
				continue;
			}

			currentIndex = (currentIndex + 1) % availableWords.length;

			if (!usedWords.has(word)) {
				usedWords.add(word);
				return word;
			}
			attempts++;
		}

		// If we can't find an unused word (shouldn't happen), return the first available
		const firstWord = availableWords[0];
		return firstWord || "error";
	}

	function getWordList(): string[] {
		return [...availableWords];
	}

	function reset(): void {
		usedWords.clear();
		currentIndex = 0;
		shuffleArray(availableWords);
	}

	function setLevel(level: number): void {
		if (level < 1 || level > 6) {
			throw new Error(`Invalid level: ${level}`);
		}
		currentLevel = level;
		updateAvailableWords();
	}

	function setGameMode(mode: GameMode): void {
		_currentGameMode = mode;
		// For now, both modes use the same word selection logic
		// Full sentences mode would need additional sentence generation logic
		updateAvailableWords();
	}

	function getAvailableWords(): number {
		return availableWords.length;
	}

	return {
		getNextWord,
		getWordList,
		reset,
		setLevel,
		setGameMode,
		getAvailableWords,
	};
}

/**
 * Generate a sentence from available words
 * This is a basic implementation that could be enhanced
 */
export function generateSentence(
	wordGenerator: WordGenerator,
	wordCount = 5,
): string {
	const words: string[] = [];
	for (let i = 0; i < wordCount; i++) {
		words.push(wordGenerator.getNextWord());
	}
	return `${words.join(" ")}.`;
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): void {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		assertDefined(temp)
		assertDefined(array[j])
		array[i] = array[j];
		array[j] = temp;
	}
}

/**
 * Get statistics about word availability for a layout and level
 */
export function getWordStats(
	layout: LayoutName,
	level: number,
): {
	totalWords: number;
	availableWords: number;
	coverage: number;
} {
	const allWords = masterWordList.length;
	const availableWords = filterWordsByLevel(
		masterWordList,
		layout,
		level,
	).length;
	const coverage = allWords > 0 ? (availableWords / allWords) * 100 : 0;

	return {
		totalWords: allWords,
		availableWords,
		coverage: Math.round(coverage * 100) / 100, // Round to 2 decimal places
	};
}
