/**
 * Score Calculator - Performance metrics calculation
 * Extracted from TypingArea for pure calculation logic
 * Uses revealing module pattern
 */

const ScoreCalculator = (function() {
	/**
	 * Calculate Words Per Minute
	 * @returns {string} WPM value formatted to 2 decimal places
	 */
	function calculateWPM() {
		if (!StateManager) return '0.00';

		const correct = StateManager.get('correct') || 0;
		const errors = StateManager.get('errors') || 0;
		const minutes = StateManager.get('minutes') || 0;
		const seconds = StateManager.get('seconds') || 0;

		const totalKeystrokes = correct + errors;
		const totalMinutes = minutes + (seconds / 60);

		if (totalMinutes === 0) return '0.00';

		return ((totalKeystrokes / 5) / totalMinutes).toFixed(2);
	}

	/**
	 * Calculate accuracy percentage
	 * @returns {string} Accuracy percentage formatted to 2 decimal places
	 */
	function calculateAccuracy() {
		if (!StateManager) return '0.00';

		const correct = StateManager.get('correct') || 0;
		const errors = StateManager.get('errors') || 0;

		const total = correct + errors;
		if (total === 0) return '100.00';

		return ((100 * correct) / total).toFixed(2);
	}

	/**
	 * Get formatted results for display
	 * @returns {Object} Object with wpm and accuracy
	 */
	function getFormattedResults() {
		return {
			wpm: calculateWPM(),
			accuracy: calculateAccuracy()
		};
	}



	// Public API
	return {
		calculateWPM,
		calculateAccuracy,
		getFormattedResults
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ScoreCalculator;
} else if (typeof window !== 'undefined') {
	window.ScoreCalculator = ScoreCalculator;
}