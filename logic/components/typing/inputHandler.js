/**
 * Input Handler - Keyboard event processing and routing
 * Extracted from TypingArea for focused input management
 * Uses revealing module pattern
 */

const InputHandler = (function() {
	let elementManager;
	let keyMapper;

	/**
	 * Initialize input handler with dependencies
	 * @param {Object} elementManager - Element manager instance
	 * @param {Object} keyMapper - Key mapper instance
	 */
	function initialize(em, km) {
		elementManager = em;
		keyMapper = km;
		// Note: Event listeners are set up by the parent TypingArea component
	}

	/**
	 * Set up keyboard event listeners
	 */
	function setupEventListeners() {
		const input = elementManager.get('input');
		if (input) {
			input.addEventListener('keydown', handleKeydown);
		}
	}

	/**
	 * Handle keydown events and route to appropriate handlers
	 * @param {Event} event - Keyboard event
	 * @returns {Object} Processed event result
	 */
	function handleKeydown(event) {
		// Prevent default to avoid unwanted behavior
		event.preventDefault();

		const keyCode = event.keyCode;

		// Handle special keys first
		if (isSpecialKey(keyCode)) {
			return { type: 'special', keyCode };
		}

		// Handle reset keys
		if (isResetKey(keyCode)) {
			return { type: 'reset', keyCode };
		}

		// Handle word completion keys
		if (isWordCompletionKey(keyCode)) {
			return { type: 'word_completion', keyCode };
		}

		// Handle regular typing
		const mappedChar = keyMapper.mapKey(event);
		if (mappedChar !== null) {
			return {
				type: 'character',
				character: mappedChar,
				keyCode,
				originalEvent: event
			};
		}

		// Unhandled key
		return { type: 'unhandled', keyCode };
	}

	/**
	 * Check if key code is a special key
	 * @param {number} keyCode - Key code to check
	 * @returns {boolean} Whether key is special
	 */
	function isSpecialKey(keyCode) {
		const specialKeys = [27, 9, 20, 17, 18, 93, 36, 37, 38, 39, 40, 144, 36, 8, 16, 30, 91, 92, 224, 225];
		return specialKeys.includes(keyCode);
	}

	/**
	 * Check if key code triggers reset
	 * @param {number} keyCode - Key code to check
	 * @returns {boolean} Whether key triggers reset
	 */
	function isResetKey(keyCode) {
		return keyCode === 9 || keyCode === 27; // TAB or ESC
	}

	/**
	 * Check if key code triggers word completion
	 * @param {number} keyCode - Key code to check
	 * @returns {boolean} Whether key triggers word completion
	 */
	function isWordCompletionKey(keyCode) {
		return keyCode === 13 || keyCode === 32; // ENTER or SPACE
	}

	/**
	 * Get current input value
	 * @returns {string} Current input value
	 */
	function getInputValue() {
		const input = elementManager.get('input');
		return input ? input.value : '';
	}

	/**
	 * Set input value
	 * @param {string} value - Value to set
	 */
	function setInputValue(value) {
		const input = elementManager.get('input');
		if (input) {
			input.value = value;
		}
	}

	/**
	 * Clear input field
	 */
	function clearInput() {
		setInputValue('');
	}

	/**
	 * Focus input field
	 */
	function focus() {
		const input = elementManager.get('input');
		if (input && input.focus) {
			input.focus();
		}
	}

	/**
	 * Check if input handler is ready
	 * @returns {boolean} Whether input handler is initialized
	 */
	function isReady() {
		return !!(elementManager && elementManager.get('input'));
	}

	// Public API
	return {
		initialize,
		handleKeydown,
		getInputValue,
		setInputValue,
		clearInput,
		focus,
		isReady
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = InputHandler;
} else if (typeof window !== 'undefined') {
	window.InputHandler = InputHandler;
}
