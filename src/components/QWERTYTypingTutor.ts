import type { GameState, KeyboardLayout, LevelDictionary } from "../types";
import { DOMUtils } from "../utils/DOM";
import { Component } from "./BaseComponent";

export class QWERTYTypingTutor extends Component {
	private gameState: GameState;
	private promptElement!: HTMLElement;
	private inputElement!: HTMLInputElement;
	private keyboardElement!: HTMLElement;
	private statsElement!: HTMLElement;

	// QWERTY layout mapping
	private qwertyLayout: KeyboardLayout = {
		KeyQ: "q",
		KeyW: "w",
		KeyE: "e",
		KeyR: "r",
		KeyT: "t",
		KeyY: "y",
		KeyU: "u",
		KeyI: "i",
		KeyO: "o",
		KeyP: "p",
		KeyA: "a",
		KeyS: "s",
		KeyD: "d",
		KeyF: "f",
		KeyG: "g",
		KeyH: "h",
		KeyJ: "j",
		KeyK: "k",
		KeyL: "l",
		KeyZ: "z",
		KeyX: "x",
		KeyC: "c",
		KeyV: "v",
		KeyB: "b",
		KeyN: "n",
		KeyM: "m",
		Space: " ",
		shiftLayer: "default",
	};

	// QWERTY level dictionary
	private qwertyLevels: LevelDictionary = {
		qwerty: {
			lvl1: "asdfjkl",
			lvl2: "asdfjkl;",
			lvl3: "asdferjkliuo",
			lvl4: "qwertyuiopasdf",
			lvl5: "zxcvbnm,./",
			lvl6: "qwertyuiopasdfghjklzxcvbnm",
			lvl7: "abcdefghijklmnopqrstuvwxyz",
		},
	};

	constructor() {
		super("div", "qwerty-typing-tutor");

		// Initialize game state
		this.gameState = {
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
			keyboardMap: this.qwertyLayout,
			letterDictionary: this.qwertyLevels,
			currentLayout: "qwerty",
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
				27, 9, 20, 17, 18, 93, 36, 37, 38, 39, 40, 144, 36, 8, 16, 30, 32, 13,
				91, 92, 224, 225,
			],
			punctuation: "",
			requiredLetters: [],
			initialCustomKeyboardState: {},
			initialCustomLevelsState: {},
		};

		this.initializeElements();
		this.setupEventListeners();
		this.render();
		this.reset();
	}

	private initializeElements(): void {
		// Create prompt display
		this.promptElement = DOMUtils.createElement("div", {
			className: "prompt",
			textContent: "Type the words below...",
		});

		// Create input field
		this.inputElement = DOMUtils.createElement("input", {
			className: "user-input",
			attributes: {
				type: "text",
				id: "userInput",
				placeholder: "Start typing here...",
			},
		});

		// Create keyboard display
		this.keyboardElement = DOMUtils.createElement("div", {
			className: "keyboard",
		});

		// Create stats display
		this.statsElement = DOMUtils.createElement("div", {
			className: "stats",
		});

		// Add elements to component
		this.element.appendChild(this.promptElement);
		this.element.appendChild(this.inputElement);
		this.element.appendChild(this.statsElement);
		this.element.appendChild(this.keyboardElement);
	}

	private setupEventListeners(): void {
		// Input event listener
		this.inputElement.addEventListener("keydown", (e) => {
			this.handleKeyDown(e);
		});

		// Focus input on click anywhere in the component
		this.element.addEventListener("click", () => {
			this.inputElement.focus();
		});
	}

	private handleKeyDown(event: KeyboardEvent): void {
		// Start game on first keystroke
		if (!this.gameState.gameOn) {
			this.gameState.gameOn = true;
			this.startTimer();
		}

		// Handle special keys
		if (this.gameState.specialKeyCodes.includes(event.keyCode)) {
			this.handleSpecialKey(event);
			return;
		}

		// Handle regular typing
		this.handleTyping(event);
	}

	private handleSpecialKey(event: KeyboardEvent): void {
		switch (event.keyCode) {
			case 32: // Space
			case 13: // Enter
				event.preventDefault();
				this.checkWordCompletion();
				break;
			case 8: // Backspace
				this.handleBackspace();
				break;
			case 27: // Escape
				this.reset();
				break;
		}
	}

	private handleTyping(event: KeyboardEvent): void {
		// Prevent default to handle input manually
		event.preventDefault();

		const typedChar = event.key;
		const currentInput = this.inputElement.value;
		const currentWord = this.gameState.correctAnswer;
		const currentPosition = currentInput.length;

		// Check if we're still within the word bounds
		if (currentPosition < currentWord.length) {
			const expectedChar = currentWord[currentPosition];

			if (typedChar === expectedChar) {
				this.gameState.correct++;
				this.inputElement.value += typedChar;
				this.inputElement.classList.remove("error");
				this.updateVisualFeedback(currentPosition, "correct");
			} else {
				this.gameState.errors++;
				this.updateVisualFeedback(currentPosition, "error");
				this.inputElement.classList.add("error");
				if (this.gameState.requireBackspaceCorrection) {
					// Don't add incorrect character
					return;
				} else {
					// Allow incorrect character but mark as error
					this.inputElement.value += typedChar;
				}
			}
		}

		this.updateStats();
	}

	private handleBackspace(): void {
		const input = this.inputElement.value;
		if (input.length > 0) {
			this.inputElement.value = input.slice(0, -1);
			this.updateVisualFeedback(input.length - 1, "neutral");
		}
	}

	private checkWordCompletion(): void {
		const input = this.inputElement.value.trim();
		const expected = this.gameState.correctAnswer.trim();

		if (input === expected) {
			this.gameState.score++;
			this.nextWord();
			this.inputElement.value = "";
			this.updateStats();

			if (this.gameState.score >= this.gameState.scoreMax) {
				this.endGame();
			}
		}
	}

	private nextWord(): void {
		// Simple word generation for QWERTY level 1
		const words: readonly string[] = [
			"as",
			"df",
			"jk",
			"kl",
			"sa",
			"fd",
			"jl",
			"lk",
		];
		const randomIndex = Math.floor(Math.random() * words.length);
		const randomWord = words[randomIndex] ?? "as"; // Fallback to first word
		this.gameState.correctAnswer = randomWord;
		this.updatePrompt();
	}

	private updatePrompt(): void {
		const word = this.gameState.correctAnswer;
		const spans = word
			.split("")
			.map((char) => `<span class="letter">${char}</span>`)
			.join("");

		this.promptElement.innerHTML = `<div class="word">${spans}</div>`;
	}

	private updateVisualFeedback(
		position: number,
		status: "correct" | "error" | "neutral",
	): void {
		const letters = this.promptElement.querySelectorAll(".letter");
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

	private updateStats(): void {
		const accuracy =
			this.gameState.correct + this.gameState.errors > 0
				? Math.round(
						(this.gameState.correct /
							(this.gameState.correct + this.gameState.errors)) *
							100,
					)
				: 100;

		this.statsElement.innerHTML = `
			<div class="stat">
				<div class="stat-label">Score</div>
				<div class="stat-value">${this.gameState.score}/${this.gameState.scoreMax}</div>
			</div>
			<div class="stat">
				<div class="stat-label">Accuracy</div>
				<div class="stat-value">${accuracy}%</div>
			</div>
			<div class="stat">
				<div class="stat-label">Time</div>
				<div class="stat-value">${this.gameState.minutes}:${this.gameState.seconds.toString().padStart(2, "0")}</div>
			</div>
		`;
	}

	private startTimer(): void {
		const timer = setInterval(() => {
			if (!this.gameState.gameOn) {
				clearInterval(timer);
				return;
			}

			this.gameState.seconds++;
			if (this.gameState.seconds >= 60) {
				this.gameState.seconds = 0;
				this.gameState.minutes++;
			}
			this.updateStats();
		}, 1000);
	}

	private endGame(): void {
		this.gameState.gameOn = false;
		const totalKeystrokes = this.gameState.correct + this.gameState.errors;
		const accuracy =
			totalKeystrokes > 0
				? Math.round((this.gameState.correct / totalKeystrokes) * 100)
				: 100;
		const totalTimeInMinutes =
			(this.gameState.minutes * 60 + this.gameState.seconds) / 60;
		const wpm =
			totalTimeInMinutes > 0
				? Math.round(totalKeystrokes / 5 / totalTimeInMinutes)
				: 0;

		this.promptElement.innerHTML = `
			<div class="results">
				<h3>Game Complete!</h3>
				<p>Words Typed: ${this.gameState.score}</p>
				<p>Accuracy: ${accuracy}%</p>
				<p>WPM: ${wpm}</p>
				<p>Time: ${this.gameState.minutes}:${this.gameState.seconds.toString().padStart(2, "0")}</p>
			</div>
		`;
	}

	private reset(): void {
		this.gameState.score = 0;
		this.gameState.seconds = 0;
		this.gameState.minutes = 0;
		this.gameState.gameOn = false;
		this.gameState.correct = 0;
		this.gameState.errors = 0;
		this.gameState.letterIndex = 0;

		this.inputElement.value = "";
		this.nextWord();
		this.updateStats();
		this.inputElement.focus();
	}

	render(): void {
		// Render keyboard
		this.renderKeyboard();

		// Initial stats update
		this.updateStats();
	}

	private renderKeyboard(): void {
		const keyboardLayout = [
			["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
			["a", "s", "d", "f", "g", "h", "j", "k", "l"],
			["z", "x", "c", "v", "b", "n", "m"],
		];

		let keyboardHTML = "";
		keyboardLayout.forEach((row) => {
			keyboardHTML += '<div class="keyboard-row">';
			row.forEach((key) => {
				const level1Letters = this.qwertyLevels.qwerty?.lvl1 || "";
				const isActive = level1Letters.includes(key);
				keyboardHTML += `<span class="key ${isActive ? "active" : "inactive"}">${key}</span>`;
			});
			keyboardHTML += "</div>";
		});

		this.keyboardElement.innerHTML = keyboardHTML;
	}

	destroy(): void {
		this.gameState.gameOn = false;
		// Clean up event listeners and remove element
		this.element.remove();
	}
}
