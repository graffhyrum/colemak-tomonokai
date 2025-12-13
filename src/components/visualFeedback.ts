type FeedbackStatus = "correct" | "error" | "neutral";

function updatePrompt(promptElement: HTMLElement, word: string): void {
	const spans = word
		.split("")
		.map((char: string) => `<span class="letter">${char}</span>`)
		.join("");

	promptElement.innerHTML = `<div class="word">${spans}</div>`;
}

function updateVisualFeedback(
	promptElement: HTMLElement,
	position: number,
	status: FeedbackStatus,
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

function showGameResults(
	promptElement: HTMLElement,
	gameState: {
		score: number;
		correct: number;
		errors: number;
		minutes: number;
		seconds: number;
	},
): void {
	const totalKeystrokes = gameState.correct + gameState.errors;
	const accuracy =
		totalKeystrokes > 0
			? Math.round((gameState.correct / totalKeystrokes) * 100)
			: 100;
	const totalTimeInMinutes = (gameState.minutes * 60 + gameState.seconds) / 60;
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

export const visualFeedback = {
	updatePrompt,
	updateVisualFeedback,
	showGameResults,
};

export type { FeedbackStatus };
