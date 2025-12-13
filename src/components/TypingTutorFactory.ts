import { getKeyboardTemplate } from "../entities/keyTemplates.ts";
import type { LayoutMap, LayoutName } from "../entities/layouts.ts";
import type { LevelDictionary } from "../entities/levels.ts";
import type { GameState } from "../types";
import type { LevelManager } from "../utils/levelManager";

import { domElements } from "./domElements.ts";
import { eventHandlers } from "./eventHandlers.ts";
import { gameLogic } from "./gameLogic.ts";
import { keyboardRenderer } from "./keyboardRenderer.ts";
import { statsCalculator } from "./statsCalculator.ts";
import { timerManager } from "./timerManager.ts";
import { visualFeedback } from "./visualFeedback.ts";

function createTypingTutor(config: {
	layoutName: LayoutName;
	layoutMap: LayoutMap;
	levelDictionary: LevelDictionary;
	words: readonly string[];
	keyboardCharacters: Array<
		Array<{ keyId: string; character: string; isEmpty: boolean }>
	>;
	levelManager?: LevelManager;
	className?: string;
}) {
	const gameState: GameState = {
		score: 0,
		scoreMax: 10,
		seconds: 0,
		minutes: 0,
		gameOn: false,
		correct: 0,
		errors: 0,
		currentLevel: 1,
		correctAnswer: "",
		letterIndex: 0,
		onlyLower: true,
		answerString: "",
		layoutMap: config.layoutMap,
		letterDictionary: config.levelDictionary,
		currentLayout: config.layoutName,
		currentKeyboardShape: "ansi",
		shiftDown: false,
		capsLockOn: false,
		fullSentenceMode: false,
		fullSentenceModeEnabled: false,
		requireBackspaceCorrection: true,
		timeLimitMode: false,
		wordScrollingMode: true,
		showCheatsheet: true,
		playSoundOnClick: false,
		playSoundOnError: false,
		deleteFirstLine: false,
		deleteLatestWord: false,
		sentenceStartIndex: -1,
		sentenceEndIndex: 0,
		lineLength: 23,
		lineIndex: 0,
		wordIndex: 0,
		idCount: 0,
		answerWordArray: [],
		specialKeyCodes: [
			27, 9, 20, 17, 18, 93, 36, 37, 38, 39, 40, 144, 36, 8, 16, 30, 32, 13, 91,
			92, 224, 225,
		],
		punctuation: "",
		requiredLetters: [],
		initialCustomKeyboardState: {},
		initialCustomLevelsState: {},
	};

	// Create DOM elements using the extracted module
	const elements = domElements.createDOMElements({
		layoutName: config.layoutName,
		className: config.className,
	});

	let keyboardTemplate = getKeyboardTemplate(gameState.currentKeyboardShape);

	// Create action handlers that use extracted modules
	const actions = {
		handleTyping: handleTyping,
		handleSpacebar: handleSpacebar,
		handleBackspace: handleBackspace,
		handleSpecialKey: handleSpecialKey,
		updateModifierVisuals: updateModifierVisuals,
		checkWordCompletion: checkWordCompletion,
		nextWord: nextWord,
		reset: reset,
		endGame: endGame,
	};

	// Setup event handlers using extracted module
	const eventHandlerInstances = eventHandlers.createKeyDownHandler(
		gameState,
		actions,
	);
	const keyUpHandler = eventHandlers.createKeyUpHandler(gameState, actions);
	const clickHandler = eventHandlers.createClickHandler(elements.input);

	const _cleanup = eventHandlers.setupEventListeners(
		elements.container,
		elements.input,
		{
			keyDown: eventHandlerInstances,
			keyUp: keyUpHandler,
			click: clickHandler,
		},
	);

	// Timer management
	let timerCleanup: (() => void) | null = null;

	function handleSpacebar(): void {
		const currentInput = elements.input.value;
		const currentWord = gameState.correctAnswer.trim();

		// Add space if it matches the expected word
		if (currentInput.trim() === currentWord) {
			elements.input.value = `${currentInput} `;
			checkWordCompletion();
		}
	}

	function updateModifierVisuals(): void {
		// Update shift key visuals
		const shiftKeys = elements.keyboard.querySelectorAll(
			'[data-key-id*="Shift"]',
		);
		shiftKeys.forEach((key) => {
			if (gameState.shiftDown) {
				key.classList.add("active", "indicator-active");
			} else {
				key.classList.remove("active", "indicator-active");
			}
		});

		// Update caps lock visuals
		const capsLockKey = elements.keyboard.querySelector(
			'[data-key-id="CapsLock"]',
		);
		if (capsLockKey) {
			if (gameState.capsLockOn) {
				capsLockKey.classList.add("indicator-active");
			} else {
				capsLockKey.classList.remove("indicator-active");
			}
		}
	}

	function handleSpecialKey(event: KeyboardEvent): void {
		switch (event.keyCode) {
			case 13: // Enter
				event.preventDefault();
				checkWordCompletion();
				break;
			case 8: // Backspace
				handleBackspace();
				break;
			case 27: // Escape
				reset();
				break;
		}
	}

	function handleTyping(event: KeyboardEvent): void {
		event.preventDefault();

		const typedChar = event.key;
		const currentInput = elements.input.value;
		const currentWord = gameState.correctAnswer;
		const currentPosition = currentInput.length;

		if (currentPosition < currentWord.length) {
			const expectedChar = currentWord[currentPosition];

			if (typedChar === expectedChar) {
				gameState.correct++;
				elements.input.value += typedChar;
				elements.input.classList.remove("error");
				visualFeedback.updateVisualFeedback(
					elements.prompt,
					currentPosition,
					"correct",
				);
			} else {
				gameState.errors++;
				visualFeedback.updateVisualFeedback(
					elements.prompt,
					currentPosition,
					"error",
				);
				elements.input.classList.add("error");
				if (gameState.requireBackspaceCorrection) {
					return;
				} else {
					elements.input.value += typedChar;
				}
			}
		}

		updateStats();
	}

	function handleBackspace(): void {
		const input = elements.input.value;
		if (input.length > 0) {
			elements.input.value = gameLogic.handleBackspace(input);
			visualFeedback.updateVisualFeedback(
				elements.prompt,
				input.length - 1,
				"neutral",
			);
		}
	}

	function checkWordCompletion(): void {
		const input = elements.input.value.trim();
		const expected = gameState.correctAnswer.trim();

		if (gameLogic.checkWordCompletion(input, expected)) {
			gameState.score++;
			nextWord();
			elements.input.value = "";
			updateStats();

			if (gameLogic.shouldEndGame(gameState.score, gameState.scoreMax)) {
				endGame();
			}
		}
	}

	function nextWord(): void {
		gameState.correctAnswer = gameLogic.calculateNextWordForLevel(
			{ words: config.words, levelManager: config.levelManager },
			gameState.currentLevel,
		);
		visualFeedback.updatePrompt(elements.prompt, gameState.correctAnswer);
	}

	// updatePrompt is now handled by visualFeedback.updatePrompt

	// updateVisualFeedback is now handled by visualFeedback.updateVisualFeedback

	function updateStats(): void {
		elements.stats.innerHTML = statsCalculator.generateStatsHTML({
			correct: gameState.correct,
			errors: gameState.errors,
			minutes: gameState.minutes,
			seconds: gameState.seconds,
			score: gameState.score,
			scoreMax: gameState.scoreMax,
		});
	}

	function endGame(): void {
		gameState.gameOn = false;
		if (timerCleanup) {
			timerManager.stopTimer(timerCleanup);
			timerCleanup = null;
		}
		visualFeedback.showGameResults(elements.prompt, gameState);
	}

	function reset(): void {
		gameState.score = 0;
		gameState.seconds = 0;
		gameState.minutes = 0;
		gameState.gameOn = false;
		gameState.correct = 0;
		gameState.errors = 0;
		gameState.letterIndex = 0;

		if (timerCleanup) {
			timerManager.stopTimer(timerCleanup);
			timerCleanup = null;
		}

		elements.input.value = "";
		nextWord();
		updateStats();
		elements.input.focus();
	}

	function renderKeyboard(): void {
		const keyboardHTML = keyboardRenderer.generateKeyboardHTML(
			keyboardTemplate,
			gameState,
			{
				layoutName: config.layoutName,
				levelDictionary: config.levelDictionary,
				keyboardCharacters: config.keyboardCharacters,
				layoutMap: config.layoutMap,
			},
		);

		elements.keyboard.innerHTML = keyboardHTML;
		elements.keyboard.className = "cheatsheet";
		updateModifierVisuals();
	}

	function render(): void {
		renderKeyboard();
		updateStats();
	}

	function destroy(): void {
		gameState.gameOn = false;
		if (timerCleanup) {
			timerManager.stopTimer(timerCleanup);
			timerCleanup = null;
		}
		elements.container.remove();
	}

	function updateLevel(level: number): void {
		if (gameLogic.validateLevel(config.levelManager, level)) {
			gameState.currentLevel = level;
			reset();
		}
	}

	function updateKeyboardShape(shape: string): void {
		gameState.currentKeyboardShape = shape as "ansi" | "iso" | "ortho";
		keyboardTemplate = getKeyboardTemplate(gameState.currentKeyboardShape);
		renderKeyboard();
	}

	render();
	reset();

	return {
		element: elements.container,
		render,
		destroy,
		updateLevel,
		updateKeyboardShape,
	};
}

export const TypingTutorFactory = {
	create: createTypingTutor,
};
