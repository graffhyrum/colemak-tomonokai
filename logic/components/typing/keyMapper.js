/**
 * Key Mapper - Handle key mapping and remapping logic
 * Extracted from TypingArea for focused key processing
 * Uses revealing module pattern
 */

const KeyMapper = (function() {
	/**
	 * Map a keyboard event to the appropriate character
	 * Handles key remapping and shift layer logic
	 * @param {Event} event - Keyboard event
	 * @returns {string|null} Mapped character or null if not mappable
	 */
	function mapKey(event) {
		const shouldMap = StorageService && StorageService.get ?
			StorageService.get('keyRemapping') === 'true' : false;

		let inputChar;

		if (shouldMap && LayoutService && LayoutService.getKeyboardMap) {
			const keyboardMap = LayoutService.getKeyboardMap();
			const code = event.code;

			if (code in keyboardMap) {
				if (!event.shiftKey) {
					inputChar = keyboardMap[code];
				} else {
					const shiftLayer = LayoutService.getShiftLayer ?
						LayoutService.getShiftLayer() : null;

					if (shiftLayer === 'default') {
						inputChar = keyboardMap[code].toUpperCase();
					} else if (shiftLayer && code in shiftLayer) {
						inputChar = shiftLayer[code];
					} else {
						inputChar = keyboardMap[code].toUpperCase();
					}
				}
			}
		} else {
			// Direct input without mapping
			const specialKeyCodes = [27, 9, 20, 17, 18, 93, 36, 37, 38, 39, 40, 144, 36, 8, 16, 30, 32, 13, 91, 92, 224, 225];
			if (!specialKeyCodes.includes(event.keyCode) && event.key !== 'Process') {
				inputChar = event.key;
			}
		}

		return inputChar || null;
	}



	// Public API
	return {
		mapKey
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = KeyMapper;
} else if (typeof window !== 'undefined') {
	window.KeyMapper = KeyMapper;
}