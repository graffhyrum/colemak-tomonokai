/**
 * Visual Feedback - DOM visual updates and animations
 * Extracted from TypingArea for focused UI manipulation
 * Uses revealing module pattern
 */

const VisualFeedback = (function() {
	let _elementManager;

	/**
	 * Initialize visual feedback with element manager
	 * @param {Object} elementManager - Element manager instance
	 */
	function initialize(elementManager) {
		_elementManager = elementManager;
	}

	/**
	 * Update letter color at specific position
	 * @param {number} wordIndex - Index of word in prompt
	 * @param {number} letterIndex - Index of letter in word
	 * @param {string} color - Color to apply ('green', 'red', 'gray')
	 */
	function updateLetterColor(wordIndex, letterIndex, color) {
		if (!_elementManager) return;

		const prompt = _elementManager.get('prompt');
		if (!prompt || !prompt.children || !prompt.children[0]) return;

		const wordElement = prompt.children[0].children[wordIndex];
		if (!wordElement || !wordElement.children) return;

		const letterElement = wordElement.children[letterIndex];
		if (letterElement) {
			letterElement.style.color = color;
		}
	}



	/**
	 * Update input field color
	 * @param {string} color - Color to apply ('black', 'red')
	 */
	function updateInputColor(color) {
		if (!_elementManager) return;

		const input = _elementManager.get('input');
		if (input) {
			input.style.color = color;
		}
	}



	// Public API
	return {
		initialize,
		updateLetterColor,
		updateInputColor
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = VisualFeedback;
} else if (typeof window !== 'undefined') {
	window.VisualFeedback = VisualFeedback;
}