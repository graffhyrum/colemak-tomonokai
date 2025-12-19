/**
 * Visual Feedback - DOM visual updates and animations
 * Extracted from TypingArea for focused UI manipulation
 * Uses revealing module pattern
 */

const VisualFeedback = (function() {
	let elementManager;

	/**
	 * Initialize visual feedback with element manager
	 * @param {Object} elementManager - Element manager instance
	 */
	function initialize(em) {
		elementManager = em;
	}

	/**
	 * Update letter color at specific position
	 * @param {number} wordIndex - Index of word in prompt
	 * @param {number} letterIndex - Index of letter in word
	 * @param {string} color - Color to apply ('green', 'red', 'gray')
	 */
	function updateLetterColor(wordIndex, letterIndex, color) {
		if (!elementManager) return;

		const prompt = elementManager.get('prompt');
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
		if (!elementManager) return;

		const input = elementManager.get('input');
		if (input) {
			input.style.color = color;
		}
	}

	/**
	 * Enable smooth scrolling for word scrolling mode
	 */
	function enableSmoothScrolling() {
		if (!elementManager) return;

		const prompt = elementManager.get('prompt');
		if (prompt) {
			prompt.classList.add('smoothScroll');
		}
	}

	/**
	 * Update scroll offset for word scrolling mode
	 * @param {number} offset - New scroll offset in pixels
	 */
	function updateScrollOffset(offset) {
		if (!elementManager) return;

		const prompt = elementManager.get('prompt');
		if (prompt) {
			prompt.style.left = `-${offset}px`;
		}
	}

	/**
	 * Remove a completed word in word scrolling mode
	 * @param {number} wordIndex - Index of the word to remove
	 */
	function fadeCompletedWord(wordIndex) {
		if (!elementManager) return;

		const prompt = elementManager.get('prompt');
		if (!prompt || !prompt.children || !prompt.children[0]) return;

		const wordElement = prompt.children[0].children[wordIndex];
		if (wordElement) {
			wordElement.remove();
		}
	}

	/**
	 * Update score display
	 * @param {number} score - Current score
	 * @param {number} scoreMax - Maximum score
	 */
	function updateScoreDisplay(score, scoreMax) {
		if (!elementManager) return;

		const scoreText = elementManager.get('scoreText');
		if (scoreText) {
			scoreText.innerHTML = `${score}/${scoreMax}`;
		}
	}

	// Public API
	return {
		initialize,
		updateLetterColor,
		updateInputColor,
		enableSmoothScrolling,
		updateScrollOffset,
		fadeCompletedWord,
		updateScoreDisplay
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = VisualFeedback;
} else if (typeof window !== 'undefined') {
	window.VisualFeedback = VisualFeedback;
}
