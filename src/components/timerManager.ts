import type { GameState } from "../types";

function startTimer(gameState: GameState, onTick: () => void): () => void {
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
		onTick();
	}, 1000);

	return () => clearInterval(timer);
}

function stopTimer(cleanup: () => void): void {
	cleanup();
}

export const timerManager = {
	startTimer,
	stopTimer,
};
