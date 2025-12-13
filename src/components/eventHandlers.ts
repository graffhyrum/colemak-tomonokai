import type { GameState } from "../types";

interface GameActions {
	handleTyping: (event: KeyboardEvent) => void;
	handleSpacebar: () => void;
	handleBackspace: () => void;
	handleSpecialKey: (event: KeyboardEvent) => void;
	updateModifierVisuals: () => void;
	checkWordCompletion: () => void;
	nextWord: () => void;
	reset: () => void;
	endGame: () => void;
}

interface EventHandlers {
	keyDown: (event: KeyboardEvent) => void;
	keyUp: (event: KeyboardEvent) => void;
	click: () => void;
}

function createKeyDownHandler(
	gameState: GameState,
	actions: GameActions,
): (event: KeyboardEvent) => void {
	return (event: KeyboardEvent): void => {
		if (!gameState.gameOn) {
			gameState.gameOn = true;
			// Note: timer starting is handled in the main component
		}

		// Handle modifier keys
		if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
			gameState.shiftDown = true;
			actions.updateModifierVisuals();
			return;
		}

		if (event.code === "CapsLock") {
			event.preventDefault();
			gameState.capsLockOn = !gameState.capsLockOn;
			actions.updateModifierVisuals();
			return;
		}

		// Handle functional keys
		if (event.code === "Space") {
			event.preventDefault();
			actions.handleSpacebar();
			return;
		}

		if (gameState.specialKeyCodes.includes(event.keyCode)) {
			actions.handleSpecialKey(event);
			return;
		}

		actions.handleTyping(event);
	};
}

function createKeyUpHandler(
	gameState: GameState,
	actions: GameActions,
): (event: KeyboardEvent) => void {
	return (event: KeyboardEvent): void => {
		if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
			gameState.shiftDown = false;
			actions.updateModifierVisuals();
		}
	};
}

function createClickHandler(inputElement: HTMLInputElement): () => void {
	return () => {
		inputElement.focus();
	};
}

function setupEventListeners(
	container: HTMLElement,
	inputElement: HTMLInputElement,
	handlers: EventHandlers,
): () => void {
	inputElement.addEventListener("keydown", handlers.keyDown);
	inputElement.addEventListener("keyup", handlers.keyUp);
	container.addEventListener("click", handlers.click);

	return () => {
		inputElement.removeEventListener("keydown", handlers.keyDown);
		inputElement.removeEventListener("keyup", handlers.keyUp);
		container.removeEventListener("click", handlers.click);
	};
}

export const eventHandlers = {
	createKeyDownHandler,
	createKeyUpHandler,
	createClickHandler,
	setupEventListeners,
};

export type { GameActions, EventHandlers };
