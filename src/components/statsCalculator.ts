interface StatsData {
	correct: number;
	errors: number;
	minutes: number;
	seconds: number;
	score: number;
	scoreMax: number;
}

function calculateAccuracy(correct: number, errors: number): number {
	const total = correct + errors;
	return total > 0 ? Math.round((correct / total) * 100) : 100;
}

function calculateWPM(
	totalKeystrokes: number,
	totalTimeInMinutes: number,
): number {
	return totalTimeInMinutes > 0
		? Math.round(totalKeystrokes / 5 / totalTimeInMinutes)
		: 0;
}

function formatTime(minutes: number, seconds: number): string {
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function generateStatsHTML(stats: StatsData): string {
	const accuracy = calculateAccuracy(stats.correct, stats.errors);

	return `
		<div class="stat">
			<div class="stat-label">Score</div>
			<div class="stat-value">${stats.score}/${stats.scoreMax}</div>
		</div>
		<div class="stat">
			<div class="stat-label">Accuracy</div>
			<div class="stat-value">${accuracy}%</div>
		</div>
		<div class="stat">
			<div class="stat-label">Time</div>
			<div class="stat-value">${formatTime(stats.minutes, stats.seconds)}</div>
		</div>
	`;
}

function generateResultsHTML(gameState: StatsData): string {
	const totalKeystrokes = gameState.correct + gameState.errors;
	const accuracy = calculateAccuracy(gameState.correct, gameState.errors);
	const totalTimeInMinutes = (gameState.minutes * 60 + gameState.seconds) / 60;
	const wpm = calculateWPM(totalKeystrokes, totalTimeInMinutes);

	return `
		<div class="results">
			<h3>Game Complete!</h3>
			<p>Words Typed: ${gameState.score}</p>
			<p>Accuracy: ${accuracy}%</p>
			<p>WPM: ${wpm}</p>
			<p>Time: ${formatTime(gameState.minutes, gameState.seconds)}</p>
		</div>
	`;
}

export const statsCalculator = {
	calculateAccuracy,
	calculateWPM,
	formatTime,
	generateStatsHTML,
	generateResultsHTML,
};
