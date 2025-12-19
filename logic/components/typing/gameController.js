/**
 * Game Controller - Manage game state transitions and UI updates
 * Extracted from TypingArea for focused game state management
 * Uses revealing module pattern
 */

const GameController = (function() {
	let elementManager;
	let scoreCalculator;

	/**
	 * Initialize game controller with dependencies
	 * @param {Object} elementManager - Element manager instance
	 * @param {Object} scoreCalculator - Score calculator instance
	 */
	function initialize(em, sc) {
		elementManager = em;
		scoreCalculator = sc;
	}

	/**
	 * Start the game
	 */
	function startGame() {
		if (StateManager) {
			StateManager.set('gameOn', true);
		}
	}

	/**
	 * End the game and show results
	 */
	function endGame() {
		if (!StateManager || !elementManager || !scoreCalculator) return;

		// Stop timer
		StateManager.set('gameOn', false);

		// Calculate final results
		const results = scoreCalculator.getFormattedResults();

		// Update displays
		const accuracyText = elementManager.get('accuracyText');
		const wpmText = elementManager.get('wpmText');

		if (accuracyText) {
			accuracyText.innerHTML = `Accuracy: ${results.accuracy}%`;
		}
		if (wpmText) {
			wpmText.innerHTML = `WPM: ${results.wpm}`;
		}

		// Show results
		showResults();

		// Reset counters for next game
		StateManager.set('correct', 0);
		StateManager.set('errors', 0);

		// Focus reset button
		const resetButton = elementManager.get('resetButton');
		if (resetButton && resetButton.focus) {
			resetButton.focus();
		}
	}



	/**
	 * Reset game state (preserves settings)
	 */
	function resetGameState() {
		if (!StateManager) return;

		// Reset game-specific state
		StateManager.set('gameOn', false);
		StateManager.set('score', 0);
		StateManager.set('correct', 0);
		StateManager.set('errors', 0);
		StateManager.set('letterIndex', 0);
		StateManager.set('answerString', '');
		StateManager.set('answerWordArray', []);
		StateManager.set('answerLetterArray', []);
		StateManager.set('promptOffset', 0);
		StateManager.set('deleteFirstLine', false);
		StateManager.set('deleteLatestWord', false);
		StateManager.set('sentenceStartIndex', -1);
		StateManager.set('sentenceEndIndex', 0);
		StateManager.set('lineIndex', 0);
		StateManager.set('wordIndex', 0);
		StateManager.set('idCount', 0);
		StateManager.set('requiredLetters', '');
		StateManager.set('correctAnswer', '');

		// Hide results and reset UI
		hideResults();

		// Clear input
		const input = elementManager ? elementManager.get('input') : null;
		if (input) {
			input.value = '';
			StateManager.set('letterIndex', 0);
		}
	}



	// Public API
	return {
		initialize,
		startGame,
		endGame,
		resetGameState
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = GameController;
} else if (typeof window !== 'undefined') {
	window.GameController = GameController;
}
