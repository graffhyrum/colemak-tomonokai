/**
 * Accuracy Checker - Real-time input validation and feedback
 * Extracted from TypingArea for focused validation logic
 * Uses revealing module pattern
 */

let AccuracyChecker = (function() {
	let _visualFeedback;

	/**
	 * Initialize accuracy checker with visual feedback
	 * @param {Object} visualFeedback - Visual feedback instance
	 */
	function initialize(visualFeedback) {
		_visualFeedback = visualFeedback;
	}

	/**
	 * Check accuracy of current input against expected text
	 * @param {string} input - Current input text
	 * @param {string} expected - Expected text at current position
	 * @param {number} position - Current position in text
	 * @returns {boolean} Whether input is correct
	 */
	function checkAccuracy(input, expected, position) {
		const isCorrect = input === expected;

		// Update visual feedback
		if (_visualFeedback) {
			if (isCorrect) {
				_visualFeedback.updateInputColor('black');
				_visualFeedback.updateLetterColor(0, position - 1, 'green');
			} else {
				_visualFeedback.updateInputColor('red');
				_visualFeedback.updateLetterColor(0, position - 1, 'red');
			}
		}

		// Update state counters
		if (StateManager) {
			if (isCorrect) {
				StateManager.set('correct', StateManager.get('correct') + 1);
			} else {
				StateManager.set('errors', StateManager.get('errors') + 1);
			}
		}

		return isCorrect;
	}



	// Public API
	return {
		initialize,
		checkAccuracy
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = AccuracyChecker;
} else if (typeof window !== 'undefined') {
	window.AccuracyChecker = AccuracyChecker;
}
