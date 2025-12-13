import type { LevelManager } from "../utils/levelManager";

interface GameLogicConfig {
	words: readonly string[];
	levelManager?: LevelManager;
}

function checkWordCompletion(input: string, expected: string): boolean {
	return input.trim() === expected.trim();
}

function calculateNextWord(config: GameLogicConfig): string {
	const words = config.levelManager
		? config.levelManager.getFilteredWords(1) // Default to level 1 for initial word
		: config.words;
	const randomIndex = Math.floor(Math.random() * words.length);
	const randomWord = words[randomIndex] ?? words[0] ?? "";
	return randomWord;
}

function calculateNextWordForLevel(
	config: GameLogicConfig,
	currentLevel: number,
): string {
	const words = config.levelManager
		? config.levelManager.getFilteredWords(currentLevel)
		: config.words;
	const randomIndex = Math.floor(Math.random() * words.length);
	const randomWord = words[randomIndex] ?? words[0] ?? "";
	return randomWord;
}

function handleBackspace(input: string): string {
	return input.length > 0 ? input.slice(0, -1) : input;
}

function shouldEndGame(score: number, scoreMax: number): boolean {
	return score >= scoreMax;
}

function validateLevel(
	levelManager: LevelManager | undefined,
	level: number,
): boolean {
	return levelManager?.validateLevel(level) ?? true;
}

export const gameLogic = {
	checkWordCompletion,
	calculateNextWord,
	calculateNextWordForLevel,
	handleBackspace,
	shouldEndGame,
	validateLevel,
};

export type { GameLogicConfig };
