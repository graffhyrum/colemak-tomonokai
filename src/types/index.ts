// Core type definitions for Colemak Typing Tutor

export const LAYOUT_NAMES = [
	"azerty",
	"dvorak",
	"colemak",
	"colemakdh",
	"lefthandeddvorak",
	"qwerty",
	"tarmak",
	"tarmakdh",
	"workman",
	"canary",
	"custom",
] as const;

export type LayoutName = (typeof LAYOUT_NAMES)[number];

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
	keyboardMap: KeyboardLayout;
	letterDictionary: LevelDictionary;
	currentLayout: LayoutName;
	currentKeyboard: KeyboardFormat;
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

export interface KeyboardLayout {
	[key: string]: string | Record<string, string>;
	shiftLayer: string | Record<string, string>;
}

export type LevelDictionary = Record<LayoutName, Record<string, string>>;

export type KeyboardFormat = "ansi" | "iso" | "ortho";

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
	currentKeyboard: KeyboardFormat;
	currentLevel: number;
}

export interface DOMElements {
	prompt: HTMLElement;
	scoreText: HTMLElement;
	timeText: HTMLElement;
	resetButton: HTMLElement;
	accuracyText: HTMLElement;
	wpmText: HTMLElement;
	testResults: HTMLElement;
	input: HTMLInputElement;
	inputKeyboard: HTMLElement;
	inputShiftKeyboard: HTMLElement;
	customInput: HTMLElement;
	buttons: HTMLCollection;
	select: HTMLSelectElement;
	mappingStatusButton: HTMLInputElement;
	mappingStatusText: HTMLElement;
	saveButton: HTMLElement;
	discardButton: HTMLElement;
	openUIButton: HTMLElement;
	customUIKeyInput: HTMLInputElement;
	preferenceButton: HTMLElement;
	preferenceMenu: HTMLElement;
	closePreferenceButton: HTMLElement;
	capitalLettersAllowed: HTMLInputElement;
	fullSentenceModeToggle: HTMLInputElement;
	fullSentenceModeLevelButton: HTMLElement;
	requireBackspaceCorrectionToggle: HTMLInputElement;
	wordLimitModeButton: HTMLInputElement;
	wordLimitModeInput: HTMLInputElement;
	timeLimitModeButton: HTMLInputElement;
	timeLimitModeInput: HTMLInputElement;
	wordScrollingModeButton: HTMLInputElement;
	punctuationModeButton: HTMLInputElement;
	showCheatsheetButton: HTMLInputElement;
	playSoundOnClickButton: HTMLInputElement;
	playSoundOnErrorButton: HTMLInputElement;
}

export interface EventHandlers {
	onKeyDown: (event: KeyboardEvent) => void;
	onReset: () => void;
	onLevelChange: (level: number) => void;
	onLayoutChange: (layout: LayoutName) => void;
	onKeyboardChange: (format: KeyboardFormat) => void;
	onSettingsChange: (settings: Partial<Settings>) => void;
}

export interface WordList {
	[level: string]: string[];
}

export interface SoundManager {
	playClick: () => void;
	playError: () => void;
}
