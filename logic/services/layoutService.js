/**
 * Layout Service - Manage keyboard layouts and mappings
 * Handles layout switching, custom layout management, and keyboard mapping
 * Uses revealing module pattern
 */

const LayoutService = (function() {
	// Private state
	let currentLayout = 'colemak';
	let currentKeyboard = 'ansi';
	let layoutMaps = null;
	let levelDictionaries = null;

	/**
	 * Initialize layout service with global layout data
	 */
	function initialize() {
		if (typeof window.layoutMaps !== 'undefined') {
			layoutMaps = window.layoutMaps;
		}
		if (typeof window.levelDictionaries !== 'undefined') {
			levelDictionaries = window.levelDictionaries;
		}
	}

	/**
	 * Get current layout
	 * @returns {string} Current layout name
	 */
	function getCurrentLayout() {
		return currentLayout;
	}

	/**
	 * Get current keyboard type
	 * @returns {string} Current keyboard type (ansi/iso/ortho)
	 */
	function getCurrentKeyboard() {
		return currentKeyboard;
	}

	/**
	 * Set current layout
	 * @param {string} layoutName - Layout name to set
	 * @returns {boolean} Success status
	 */
	function setLayout(layoutName) {
		if (!layoutMaps || !layoutMaps[layoutName]) {
			console.error(`Layout ${layoutName} not found`);
			return false;
		}

		currentLayout = layoutName;
		return true;
	}

	/**
	 * Set current keyboard type
	 * @param {string} keyboardType - Keyboard type to set
	 * @returns {boolean} Success status
	 */
	function setKeyboard(keyboardType) {
		if (!['ansi', 'iso', 'ortho'].includes(keyboardType)) {
			console.error(`Invalid keyboard type: ${keyboardType}`);
			return false;
		}

		currentKeyboard = keyboardType;
		return true;
	}

	/**
	 * Get keyboard map for current layout
	 * @returns {Object|null} Current keyboard mapping or null
	 */
	function getKeyboardMap() {
		return layoutMaps && layoutMaps[currentLayout] ? layoutMaps[currentLayout] : null;
	}

	/**
	 * Get level dictionary for current layout
	 * @returns {Object|null} Current level dictionary or null
	 */
	function getLevelDictionary() {
		return levelDictionaries && levelDictionaries[currentLayout] ? levelDictionaries[currentLayout] : null;
	}

	/**
	 * Get letters for specific level
	 * @param {number} level - Level number (1-7)
	 * @returns {string} Letters for the level
	 */
	function getLevelLetters(level) {
		const dict = getLevelDictionary();
		return dict && dict[`lvl${level}`] ? dict[`lvl${level}`] : '';
	}

	/**
	 * Get all available layouts
	 * @returns {Array<string>} Array of layout names
	 */
	function getAvailableLayouts() {
		return layoutMaps ? Object.keys(layoutMaps) : [];
	}

	/**
	 * Get all available keyboard types
	 * @returns {Array<string>} Array of keyboard types
	 */
	function getAvailableKeyboards() {
		return ['ansi', 'iso', 'ortho'];
	}

	/**
	 * Apply keyboard-specific layout modifications
	 * Some layouts need different mappings for different keyboard types
	 */
	function applyKeyboardSpecificModifications() {
		if (!layoutMaps || !layoutMaps[currentLayout]) return;

		const layout = layoutMaps[currentLayout];

		switch (currentKeyboard) {
			case 'ansi':
				// ANSI layout modifications
				if (currentLayout === 'colemakdh' || currentLayout === 'tarmakdh') {
					layout.KeyZ = 'x';
					layout.KeyX = 'c';
					layout.KeyC = 'd';
					layout.KeyV = 'v';
					layout.KeyB = 'z';
				}
				if (currentLayout === 'tarmakdh') {
					levelDictionaries.tarmakdh.lvl1 = 'qwagv';
					levelDictionaries.tarmakdh.lvl3 = 'ftbzxc';
				}
				if (currentLayout === 'canary') {
					layout.KeyZ = 'j';
					layout.KeyX = 'v';
					layout.KeyC = 'd';
					layout.KeyV = 'g';
					layout.KeyB = 'q';
					layout.KeyN = 'm';
					layout.KeyG = 'b';
					layout.KeyH = 'f';
					layout.KeyT = 'k';
					layout.KeyU = 'x';
				}
				break;

			case 'iso':
				// ISO layout modifications
				if (currentLayout === 'colemakdh' || currentLayout === 'tarmakdh') {
					layout.IntlBackslash = 'z';
					layout.KeyZ = 'x';
					layout.KeyX = 'c';
					layout.KeyC = 'd';
					layout.KeyV = 'v';
					delete layout.KeyB;
				}
				if (currentLayout === 'tarmakdh') {
					levelDictionaries.tarmakdh.lvl1 = 'qwagv';
					levelDictionaries.tarmakdh.lvl3 = 'ftbzxc';
				}
				if (currentLayout === 'canary') {
					layout.IntlBackslash = 'q';
					layout.KeyZ = 'j';
					layout.KeyX = 'v';
					layout.KeyC = 'd';
					layout.KeyV = 'g';
					delete layout.KeyB;
					layout.KeyN = 'm';
					layout.KeyG = 'b';
					layout.KeyH = 'f';
					layout.KeyT = 'k';
					layout.KeyU = 'x';
				}
				break;

			case 'ortho':
				// Ortho layout modifications
				if (currentLayout === 'colemakdh' || currentLayout === 'tarmakdh') {
					layout.KeyZ = 'z';
					layout.KeyX = 'x';
					layout.KeyC = 'c';
					layout.KeyV = 'd';
					layout.KeyB = 'v';
				}
				if (currentLayout === 'tarmakdh') {
					levelDictionaries.tarmakdh.lvl1 = 'qwagzxc';
					levelDictionaries.tarmakdh.lvl3 = 'ftbv';
				}
				if (currentLayout === 'canary') {
					layout.KeyZ = 'q';
					layout.KeyX = 'j';
					layout.KeyC = 'v';
					layout.KeyV = 'd';
					layout.KeyB = 'k';
					layout.KeyN = 'x';
					layout.KeyG = 'g';
					layout.KeyH = 'm';
					layout.KeyT = 'b';
					layout.KeyU = 'f';
				}
				break;
		}
	}

	/**
	 * Get keyboard HTML for current keyboard type
	 * @returns {string} HTML string for keyboard display
	 */
	function getKeyboardHTML() {
		switch (currentKeyboard) {
			case 'ansi':
				return typeof ansiDivs !== 'undefined' ? ansiDivs : '';
			case 'iso':
				return typeof isoDivs !== 'undefined' ? isoDivs : '';
			case 'ortho':
				return typeof orthoDivs !== 'undefined' ? orthoDivs : '';
			default:
				return '';
		}
	}

	/**
	 * Get custom layout HTML
	 * @returns {string} HTML string for custom keyboard
	 */
	function getCustomKeyboardHTML() {
		return typeof customLayout !== 'undefined' ? customLayout : '';
	}

	/**
	 * Save custom layout changes
	 * @param {Object} customLayout - Custom layout object
	 * @returns {boolean} Success status
	 */
	function saveCustomLayout(customLayout) {
		try {
			if (!layoutMaps || !layoutMaps.custom) {
				console.error('Custom layout not available');
				return false;
			}

			// Merge custom layout with existing
			Object.assign(layoutMaps.custom, customLayout);
			return true;
		} catch (error) {
			console.error('Error saving custom layout:', error);
			return false;
		}
	}

	/**
	 * Reset custom layout to defaults
	 * @returns {boolean} Success status
	 */
	function resetCustomLayout() {
		try {
			if (!layoutMaps || !layoutMaps.custom) {
				console.error('Custom layout not available');
				return false;
			}

			// Reset to default empty layout
			Object.keys(layoutMaps.custom).forEach(key => {
				if (key !== 'shiftLayer') {
					layoutMaps.custom[key] = ' ';
				}
			});
			return true;
		} catch (error) {
			console.error('Error resetting custom layout:', error);
			return false;
		}
	}

	/**
	 * Get level description based on layout type
	 * @param {number} level - Level number
	 * @returns {string} Level description
	 */
	function getLevelDescription(level) {
		if (currentLayout === 'tarmak' || currentLayout === 'tarmakdh') {
			return `Step ${level - 1}`;
		}
		return `Level ${level}`;
	}

	/**
	 * Check if layout is custom
	 * @param {string} layoutName - Layout name to check
	 * @returns {boolean} Whether layout is custom
	 */
	function isCustomLayout(layoutName = currentLayout) {
		return layoutName === 'custom';
	}

	/**
	 * Get shift layer mapping
	 * @param {string} layoutName - Layout name (optional, uses current)
	 * @returns {Object|string} Shift layer mapping
	 */
	function getShiftLayer(layoutName = currentLayout) {
		if (!layoutMaps || !layoutMaps[layoutName]) {
			return {};
		}

		const layout = layoutMaps[layoutName];
		return layout.shiftLayer || 'default';
	}

	/**
	 * Validate layout object structure
	 * @param {Object} layout - Layout object to validate
	 * @returns {boolean} Whether layout is valid
	 */
	function validateLayout(layout) {
		if (!layout || typeof layout !== 'object') {
			return false;
		}

		// Basic validation - check for common keys
		const requiredKeys = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT'];
		return requiredKeys.every(key => layout.hasOwnProperty(key));
	}

	/**
	 * Get layout statistics
	 * @param {string} layoutName - Layout name (optional, uses current)
	 * @returns {Object} Layout statistics
	 */
	function getLayoutStats(layoutName = currentLayout) {
		if (!layoutMaps || !layoutMaps[layoutName]) {
			return {
				name: layoutName,
				valid: false,
				keyCount: 0,
				hasShiftLayer: false
			};
		}

		const layout = layoutMaps[layoutName];
		const keyCount = Object.keys(layout).filter(key => key !== 'shiftLayer').length;
		const hasShiftLayer = layout.shiftLayer && layout.shiftLayer !== 'default';

		return {
			name: layoutName,
			valid: validateLayout(layout),
			keyCount,
			hasShiftLayer,
			isCustom: isCustomLayout(layoutName)
		};
	}

	// Initialize service
	initialize();

	// Public API
	return {
		getCurrentLayout,
		getCurrentKeyboard,
		setLayout,
		setKeyboard,
		getKeyboardMap,
		getLevelDictionary,
		getLevelLetters,
		getAvailableLayouts,
		getAvailableKeyboards,
		applyKeyboardSpecificModifications,
		getKeyboardHTML,
		getCustomKeyboardHTML,
		saveCustomLayout,
		resetCustomLayout,
		getLevelDescription,
		isCustomLayout,
		getShiftLayer,
		validateLayout,
		getLayoutStats
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = LayoutService;
} else if (typeof window !== 'undefined') {
	window.LayoutService = LayoutService;
}
