/**
 * Element Manager - DOM element caching and management
 * Extracted from TypingArea component for better separation of concerns
 * Uses revealing module pattern
 */

const ElementManager = (function() {
	// Private state
	let elements = {};
	let isInitialized = false;

	/**
	 * Initialize element manager with DOM elements
	 * @param {Object} domElements - Pre-cached DOM elements (optional)
	 * @returns {boolean} Success status
	 */
	function initialize(domElements = {}) {
		if (isInitialized) return true;

		try {
			// Cache required DOM elements with fallbacks to querySelector
			elements = {
				input: domElements.input || document.querySelector('#userInput'),
				prompt: domElements.prompt || document.querySelector('.prompt'),
				scoreText: domElements.scoreText || document.querySelector('#scoreText'),
				timeText: domElements.timeText || document.querySelector('#timeText'),
				resetButton: domElements.resetButton || document.querySelector('#resetButton'),
				accuracyText: domElements.accuracyText || document.querySelector('#accuracyText'),
				wpmText: domElements.wpmText || document.querySelector('#wpmText'),
				testResults: domElements.testResults || document.querySelector('#testResults'),
				fadeElement: domElements.fadeElement || document.querySelector('#fadeElement')
			};

			// Validate required elements
			if (!elements.input) {
				console.error('ElementManager: Required input element not found');
				return false;
			}

			isInitialized = true;
			return true;
		} catch (error) {
			console.error('Error initializing ElementManager:', error);
			return false;
		}
	}

	/**
	 * Get a cached DOM element by name
	 * @param {string} name - Element name (input, prompt, scoreText, etc.)
	 * @returns {Element|null} The cached element or null
	 */
	function get(name) {
		return elements[name] || null;
	}

	/**
	 * Get all cached elements
	 * @returns {Object} Copy of cached elements object
	 */
	function getAll() {
		return { ...elements };
	}

	/**
	 * Check if element manager is initialized
	 * @returns {boolean} Initialization status
	 */
	function isReady() {
		return isInitialized;
	}

	/**
	 * Reset element manager state
	 */
	function reset() {
		isInitialized = false;
		elements = {};
	}

	// Public API
	return {
		initialize,
		get,
		getAll,
		isReady,
		reset
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ElementManager;
} else if (typeof window !== 'undefined') {
	window.ElementManager = ElementManager;
}
