import type {
	LayoutMap,
	LayoutName,
	LevelDictionary,
} from "../config/layouts.ts";

export interface GameState {
	score: number;
	scoreMax: number;
	seconds: number;
	minutes: number;
	gameOn: boolean;
	correct: number;
	errors: number;
	currentLevel: number;
	correctAnswer: string;
	letterIndex: number;
	onlyLower: boolean;
	answerString: string;
	layoutMap: LayoutMap;
	letterDictionary: LevelDictionary;
	currentLayout: LayoutName;
	currentKeyboardShape: KeyboardShape;
	shiftDown: boolean;
	fullSentenceMode: boolean;
	fullSentenceModeEnabled: boolean;
	requireBackspaceCorrection: boolean;
	timeLimitMode: boolean;
	wordScrollingMode: boolean;
	showCheatsheet: boolean;
	playSoundOnClick: boolean;
	playSoundOnError: boolean;
	deleteFirstLine: boolean;
	deleteLatestWord: boolean;
	sentenceStartIndex: number;
	sentenceEndIndex: number;
	lineLength: number;
	lineIndex: number;
	wordIndex: number;
	idCount: number;
	answerWordArray: string[];
	specialKeyCodes: number[];
	punctuation: string;
	requiredLetters: string[];
	initialCustomKeyboardState: Record<string, string>;
	initialCustomLevelsState: Record<string, string>;
}

export type KeyboardShape = "ansi" | "iso" | "ortho";

export interface Settings {
	onlyLower: boolean;
	requireBackspaceCorrection: boolean;
	fullSentenceModeEnabled: boolean;
	timeLimitMode: boolean;
	wordScrollingMode: boolean;
	showCheatsheet: boolean;
	playSoundOnClick: boolean;
	playSoundOnError: boolean;
	scoreMax: number;
	timeLimitValue: number;
	punctuation: string;
	currentLayout: LayoutName;
	currentKeyboardShape: KeyboardShape;
	currentLevel: number;
}
