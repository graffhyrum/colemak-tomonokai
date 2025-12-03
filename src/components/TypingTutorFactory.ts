import type {
	GameState,
	KeyboardLayout,
	LayoutName,
	LevelDictionary,
} from "../types";
import { DOMUtils } from "../utils/DOM";
import type { LevelManager } from "../utils/levelManager";

interface TypingTutorConfig {
	layoutName: LayoutName;
	keyboardMap: KeyboardLayout;
	levelDictionary: LevelDictionary;
	words: readonly string[];
	keyboardLayout: readonly (readonly string[])[];
	levelManager?: LevelManager;
	className?: string;
}

function createTypingTutor(config: TypingTutorConfig) {
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
		keyboardMap: config.keyboardMap,
		letterDictionary: config.levelDictionary,
		currentLayout: config.layoutName,
		currentKeyboard: "ansi",
		shiftDown: false,
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

	function initializeElements(): void {
		promptElement = DOMUtils.createElement("div", {
			className: "prompt",
			textContent: "Type the words below...",
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
			className: "keyboard",
		});

		statsElement = DOMUtils.createElement("div", {
			className: "stats",
		});

		element.appendChild(promptElement);
		element.appendChild(inputElement);
		element.appendChild(statsElement);
		element.appendChild(keyboardElement);
	}

	function setupEventListeners(): void {
		inputElement.addEventListener("keydown", handleKeyDown);
		element.addEventListener("click", () => {
			inputElement.focus();
		});
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (!gameState.gameOn) {
			gameState.gameOn = true;
			startTimer();
		}

		if (gameState.specialKeyCodes.includes(event.keyCode)) {
			handleSpecialKey(event);
			return;
		}

		handleTyping(event);
	}

	function handleSpecialKey(event: KeyboardEvent): void {
		switch (event.keyCode) {
			case 32:
			case 13:
				event.preventDefault();
				checkWordCompletion();
				break;
			case 8:
				handleBackspace();
				break;
			case 27:
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

	function renderKeyboard(): void {
		let keyboardHTML = "";
		config.keyboardLayout.forEach((row) => {
			keyboardHTML += '<div class="keyboard-row">';
			row.forEach((key: string) => {
				const level1Letters =
					config.levelDictionary[config.layoutName]?.lvl1 || "";
				const isActive = level1Letters.includes(key);
				keyboardHTML += `<span class="key ${isActive ? "active" : "inactive"}">${key}</span>`;
			});
			keyboardHTML += "</div>";
		});

		keyboardElement.innerHTML = keyboardHTML;
	}

	function render(): void {
		renderKeyboard();
		updateStats();
	}

	function destroy(): void {
		gameState.gameOn = false;
		element.remove();
	}

	initializeElements();
	setupEventListeners();
	render();
	reset();

	function updateLevel(level: number): void {
		if (config.levelManager?.validateLevel(level)) {
			gameState.currentLevel = level;
			reset();
		}
	}

	return {
		element,
		render,
		destroy,
		updateLevel,
	};
}

export const TypingTutorFactory = {
	create: createTypingTutor,
};
