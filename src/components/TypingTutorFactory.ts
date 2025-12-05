import type { KeyboardTemplate } from "../entities/keyTemplates.ts";
import { getKeyboardTemplate } from "../entities/keyTemplates.ts";
import type { LayoutMap, LayoutName } from "../entities/layouts.ts";
import type { LevelDictionary } from "../entities/levels.ts";
import type { GameState } from "../types";
import { DOMUtils } from "../utils/DOM";
import type { LevelManager } from "../utils/levelManager";

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
	const element = document.createElement("div");
	element.className = config.className || "typing-tutor";

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

	let promptElement: HTMLElement;
	let inputElement: HTMLInputElement;
	let keyboardElement: HTMLElement;
	let statsElement: HTMLElement;
	let keyboardTemplate: KeyboardTemplate;

	function initializeElements(): void {
		promptElement = DOMUtils.createElement("div", {
			className: "prompt",
			textContent: "Type words below...",
		});

		inputElement = DOMUtils.createElement("input", {
			className: "user-input",
			attributes: {
				type: "text",
				id: "userInput",
				placeholder: "Start typing here...",
			},
		});

		keyboardElement = DOMUtils.createElement("div", {
			className: "cheatsheet",
		});

		statsElement = DOMUtils.createElement("div", {
			className: "stats",
		});

		// Get keyboard template for current shape
		keyboardTemplate = getKeyboardTemplate(gameState.currentKeyboardShape);

		// Create cheatsheet container like archive
		const cheatsheetContainer = DOMUtils.createElement("div", {
			className: "cheatsheetContainer",
		});
		cheatsheetContainer.appendChild(keyboardElement);

		element.appendChild(promptElement);
		element.appendChild(inputElement);
		element.appendChild(statsElement);
		element.appendChild(cheatsheetContainer);
	}

	function setupEventListeners(): void {
		inputElement.addEventListener("keydown", handleKeyDown);
		inputElement.addEventListener("keyup", handleKeyUp);
		element.addEventListener("click", () => {
			inputElement.focus();
		});
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (!gameState.gameOn) {
			gameState.gameOn = true;
			startTimer();
		}

		// Handle modifier keys
		if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
			gameState.shiftDown = true;
			updateModifierVisuals();
			renderKeyboard();
			return;
		}

		if (event.code === "CapsLock") {
			event.preventDefault();
			gameState.capsLockOn = !gameState.capsLockOn;
			updateModifierVisuals();
			renderKeyboard();
			return;
		}

		// Handle functional keys
		if (event.code === "Space") {
			event.preventDefault();
			handleSpacebar();
			return;
		}

		if (gameState.specialKeyCodes.includes(event.keyCode)) {
			handleSpecialKey(event);
			return;
		}

		handleTyping(event);
	}

	function handleKeyUp(event: KeyboardEvent): void {
		if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
			gameState.shiftDown = false;
			updateModifierVisuals();
			renderKeyboard();
		}
	}

	function handleSpacebar(): void {
		const currentInput = inputElement.value;
		const currentWord = gameState.correctAnswer.trim();

		// Add space if it matches the expected word
		if (currentInput.trim() === currentWord) {
			inputElement.value = `${currentInput} `;
			checkWordCompletion();
		}
	}

	function updateModifierVisuals(): void {
		// Update shift key visuals
		const shiftKeys = keyboardElement.querySelectorAll(
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
		const capsLockKey = keyboardElement.querySelector(
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
		const currentInput = inputElement.value;
		const currentWord = gameState.correctAnswer;
		const currentPosition = currentInput.length;

		if (currentPosition < currentWord.length) {
			const expectedChar = currentWord[currentPosition];

			if (typedChar === expectedChar) {
				gameState.correct++;
				inputElement.value += typedChar;
				inputElement.classList.remove("error");
				updateVisualFeedback(currentPosition, "correct");
			} else {
				gameState.errors++;
				updateVisualFeedback(currentPosition, "error");
				inputElement.classList.add("error");
				if (gameState.requireBackspaceCorrection) {
					return;
				} else {
					inputElement.value += typedChar;
				}
			}
		}

		updateStats();
	}

	function handleBackspace(): void {
		const input = inputElement.value;
		if (input.length > 0) {
			inputElement.value = input.slice(0, -1);
			updateVisualFeedback(input.length - 1, "neutral");
		}
	}

	function checkWordCompletion(): void {
		const input = inputElement.value.trim();
		const expected = gameState.correctAnswer.trim();

		if (input === expected) {
			gameState.score++;
			nextWord();
			inputElement.value = "";
			updateStats();

			if (gameState.score >= gameState.scoreMax) {
				endGame();
			}
		}
	}

	function nextWord(): void {
		const words = config.levelManager
			? config.levelManager.getFilteredWords(gameState.currentLevel)
			: config.words;
		const randomIndex = Math.floor(Math.random() * words.length);
		const randomWord = words[randomIndex] ?? words[0] ?? "";
		gameState.correctAnswer = randomWord;
		updatePrompt();
	}

	function updatePrompt(): void {
		const word = gameState.correctAnswer;
		const spans = word
			.split("")
			.map((char: string) => `<span class="letter">${char}</span>`)
			.join("");

		promptElement.innerHTML = `<div class="word">${spans}</div>`;
	}

	function updateVisualFeedback(
		position: number,
		status: "correct" | "error" | "neutral",
	): void {
		const letters = promptElement.querySelectorAll(".letter");
		if (letters[position]) {
			letters[position].className = "letter";

			switch (status) {
				case "correct":
					letters[position].classList.add("green");
					break;
				case "error":
					letters[position].classList.add("red");
					break;
				case "neutral":
					letters[position].classList.add("gray");
					break;
			}
		}
	}

	function updateStats(): void {
		const accuracy =
			gameState.correct + gameState.errors > 0
				? Math.round(
						(gameState.correct / (gameState.correct + gameState.errors)) * 100,
					)
				: 100;

		statsElement.innerHTML = `
			<div class="stat">
				<div class="stat-label">Score</div>
				<div class="stat-value">${gameState.score}/${gameState.scoreMax}</div>
			</div>
			<div class="stat">
				<div class="stat-label">Accuracy</div>
				<div class="stat-value">${accuracy}%</div>
			</div>
			<div class="stat">
				<div class="stat-label">Time</div>
				<div class="stat-value">${gameState.minutes}:${gameState.seconds.toString().padStart(2, "0")}</div>
			</div>
		`;
	}

	function startTimer(): void {
		const timer = setInterval(() => {
			if (!gameState.gameOn) {
				clearInterval(timer);
				return;
			}

			gameState.seconds++;
			if (gameState.seconds >= 60) {
				gameState.seconds = 0;
				gameState.minutes++;
			}
			updateStats();
		}, 1000);
	}

	function endGame(): void {
		gameState.gameOn = false;
		const totalKeystrokes = gameState.correct + gameState.errors;
		const accuracy =
			totalKeystrokes > 0
				? Math.round((gameState.correct / totalKeystrokes) * 100)
				: 100;
		const totalTimeInMinutes =
			(gameState.minutes * 60 + gameState.seconds) / 60;
		const wpm =
			totalTimeInMinutes > 0
				? Math.round(totalKeystrokes / 5 / totalTimeInMinutes)
				: 0;

		promptElement.innerHTML = `
			<div class="results">
				<h3>Game Complete!</h3>
				<p>Words Typed: ${gameState.score}</p>
				<p>Accuracy: ${accuracy}%</p>
				<p>WPM: ${wpm}</p>
				<p>Time: ${gameState.minutes}:${gameState.seconds.toString().padStart(2, "0")}</p>
			</div>
		`;
	}

	function reset(): void {
		gameState.score = 0;
		gameState.seconds = 0;
		gameState.minutes = 0;
		gameState.gameOn = false;
		gameState.correct = 0;
		gameState.errors = 0;
		gameState.letterIndex = 0;

		inputElement.value = "";
		nextWord();
		updateStats();
		inputElement.focus();
	}

	function getEnabledLetters(currentLevel: number): string {
		const layoutDict = config.levelDictionary[config.layoutName];
		if (!layoutDict) return "";

		let enabledLetters = "";
		for (let level = 1; level <= currentLevel; level++) {
			const levelKey = `lvl${level}` as keyof typeof layoutDict;
			enabledLetters += layoutDict[levelKey] || "";
		}
		return enabledLetters;
	}

	function getKeyHighlighting(
		character: string,
		currentLevel: number,
	): {
		isActive: boolean;
		isHomeRow: boolean;
		isInactive: boolean;
	} {
		if (!character || character.trim() === "") {
			return { isActive: false, isHomeRow: false, isInactive: false };
		}

		const enabledLetters = getEnabledLetters(currentLevel);
		const level1Letters = config.levelDictionary[config.layoutName]?.lvl1 || "";

		// Level 7 special case: all keys active
		if (currentLevel === 7) {
			return {
				isActive: true,
				isHomeRow: level1Letters.includes(character),
				isInactive: false,
			};
		}

		const isInEnabled = enabledLetters.includes(character);
		const isInCurrentLevel = (
			(config.levelDictionary[config.layoutName]?.[
				`lvl${currentLevel}` as keyof (typeof config.levelDictionary)[typeof config.layoutName]
			] as string) || ""
		).includes(character);
		const isHomeRow = level1Letters.includes(character);

		return {
			isActive: isInCurrentLevel,
			isHomeRow,
			isInactive: isInEnabled && !isInCurrentLevel,
		};
	}

	function getCharacterForKey(keyId: string): string {
		// Find the key in the keyboard characters array
		for (const row of config.keyboardCharacters) {
			for (const keyInfo of row) {
				if (keyInfo.keyId === keyId) {
					// Apply shift if needed
					if (
						gameState.shiftDown &&
						config.layoutMap.shiftLayer &&
						typeof config.layoutMap.shiftLayer === "object"
					) {
						const shifted = (
							config.layoutMap.shiftLayer as Record<string, string>
						)[keyId];
						if (shifted) return shifted;
					}
					return keyInfo.character;
				}
			}
		}
		return "";
	}

	function renderKeyboard(): void {
		let keyboardHTML = "";

		keyboardTemplate.rows.forEach((row) => {
			keyboardHTML += '<div class="row">';
			row.forEach((keyTemplate) => {
				let classes = "key";
				let widthClass = "";

				// Add width classes based on template
				switch (keyTemplate.width) {
					case "1u":
						widthClass = "";
						break;
					case "1.25u":
						widthClass = " onepointtwofiveu";
						break;
					case "1.5u":
						widthClass = " onepointfiveu";
						break;
					case "1.75u":
						widthClass = " onepointsevenfiveu";
						break;
					case "2u":
						widthClass = " twou";
						break;
					case "2.25u":
						widthClass = " twopointtwofiveu";
						break;
					case "2.75u":
						widthClass = " twopointsevenfiveu";
						break;
					case "6.25u":
						widthClass = " sixpointtwofiveu";
						break;
				}

				// Add custom classes
				if (keyTemplate.classes) {
					classes += ` ${keyTemplate.classes.join(" ")}`;
				}

				// Add functional class for modifier keys
				if (keyTemplate.isFunctional) {
					classes += " cKey";
				}

				// Add empty class for placeholders
				if (keyTemplate.isEmpty) {
					classes += " empty";
				}

				// Get character for highlighting
				let character = "";
				if (keyTemplate.id) {
					character = getCharacterForKey(keyTemplate.id);
				}

				// Apply level highlighting for non-empty keys
				if (!keyTemplate.isEmpty && character) {
					const highlighting = getKeyHighlighting(
						character,
						gameState.currentLevel,
					);
					if (highlighting.isActive) classes += " currentLevelKeys";
					else if (highlighting.isInactive) classes += " inactive";
					if (highlighting.isHomeRow) classes += " homeRow";
				}

				// Add data attributes
				const dataId = keyTemplate.id ? `id='${keyTemplate.id}'` : "";
				const displayChar = keyTemplate.isEmpty
					? ""
					: `<span class="letter">${character}</span>`;

				keyboardHTML += `<div class="${classes}${widthClass}" ${dataId}>${displayChar}</div>`;
			});
			keyboardHTML += "</div>";
		});

		keyboardElement.innerHTML = keyboardHTML;
		keyboardElement.className = "cheatsheet";
		updateModifierVisuals();
	}

	function render(): void {
		renderKeyboard();
		updateStats();
	}

	function destroy(): void {
		gameState.gameOn = false;
		element.remove();
	}

	function updateLevel(level: number): void {
		if (config.levelManager?.validateLevel(level)) {
			gameState.currentLevel = level;
			reset();
		}
	}

	function updateKeyboardShape(shape: string): void {
		gameState.currentKeyboardShape = shape as "ansi" | "iso" | "ortho";
		keyboardTemplate = getKeyboardTemplate(gameState.currentKeyboardShape);
		renderKeyboard();
	}

	initializeElements();
	setupEventListeners();
	render();
	reset();

	return {
		element,
		render,
		destroy,
		updateLevel,
		updateKeyboardShape,
	};
}

export const TypingTutorFactory = {
	create: createTypingTutor,
};
