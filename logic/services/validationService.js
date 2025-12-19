/**
 * Validation Service - Pure validation logic
 * Extracted from app.js to separate concerns
 * Uses revealing module pattern
 */

const ValidationService = (function() {
	/**
	 * Check if letters typed so far are correct
	 * @param {string} inputVal - Input value to check (optional, uses DOM if not provided)
	 * @returns {boolean} Whether input matches expected text so far
	 */
 	function checkAnswerToIndex(inputVal = null) {
 		// Use provided input or get from DOM
 		const input = inputVal || (document.querySelector('#userInput')?.value || '');

 		// Get current state from StateManager
 		const letterIndex = StateManager.get('letterIndex');
 		const correctAnswer = window.correctAnswer || '';

 		return input.slice(0, letterIndex) === correctAnswer.slice(0, letterIndex);
 	}

	/**
	 * Check if complete input matches the expected word
	 * @param {string} inputVal - Input value to check (optional, uses DOM if not provided)
	 * @returns {boolean} Whether input exactly matches expected word
	 */
 	function checkAnswer(inputVal = null) {
 		// Use provided input or get from DOM
 		const input = inputVal || (document.querySelector('#userInput')?.value || '');

 		// Get expected answer from global
 		const correctAnswer = window.correctAnswer || '';

 		return input === correctAnswer;
 	}

	// Public API
	return {
		checkAnswerToIndex,
		checkAnswer
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ValidationService;
} else if (typeof window !== 'undefined') {
	// Make globally available for backward compatibility
	window.checkAnswerToIndex = ValidationService.checkAnswerToIndex;
	window.checkAnswer = ValidationService.checkAnswer;
	window.ValidationService = ValidationService;
}