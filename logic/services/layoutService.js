/**
 * Layout Service - Manage keyboard layouts and mappings
 * Handles layout switching, custom layout management, and keyboard mapping
 * Uses revealing module pattern
 */

const LayoutService = (function() {
	// Private state
	let _currentLayout = 'colemak';
	let _currentKeyboard = 'ansi';
	let _layoutMaps = null;
	let _levelDictionaries = null;

	/**
	 * Initialize layout service with global layout data
	 */
	function initialize() {
		if (typeof layoutMaps !== 'undefined') {
			_layoutMaps = layoutMaps;
		}
		if (typeof levelDictionaries !== 'undefined') {
			_levelDictionaries = levelDictionaries;
		}
	}

	/**
	 * Get current layout
	 * @returns {string} Current layout name
	 */
	function getCurrentLayout() {
		return _currentLayout;
	}

	/**
	 * Get current keyboard type
	 * @returns {string} Current keyboard type (ansi/iso/ortho)
	 */
	function getCurrentKeyboard() {
		return _currentKeyboard;
	}

	/**
	 * Set current layout
	 * @param {string} layoutName - Layout name to set
	 * @returns {boolean} Success status
	 */
	function setLayout(layoutName) {
		if (!_layoutMaps || !_layoutMaps[layoutName]) {
			console.error(`Layout ${layoutName} not found`);
			return false;
		}
		
		_currentLayout = layoutName;
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
		
		_currentKeyboard = keyboardType;
		return true;
	}

	/**
	 * Get keyboard map for current layout
	 * @returns {Object|null} Current keyboard mapping or null
	 */
	function getKeyboardMap() {
		return _layoutMaps && _layoutMaps[_currentLayout] ? _layoutMaps[_currentLayout] : null;
	}

	/**
	 * Get level dictionary for current layout
	 * @returns {Object|null} Current level dictionary or null
	 */
	function getLevelDictionary() {
		return _levelDictionaries && _levelDictionaries[_currentLayout] ? _levelDictionaries[_currentLayout] : null;
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
		return _layoutMaps ? Object.keys(_layoutMaps) : [];
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
		if (!_layoutMaps || !_layoutMaps[_currentLayout]) return;

		const layout = _layoutMaps[_currentLayout];

		switch (_currentKeyboard) {
			case 'ansi':
				// ANSI layout modifications
				if (_currentLayout === 'colemakdh' || _currentLayout === 'tarmakdh') {
					layout.KeyZ = 'x';
					layout.KeyX = 'c';
					layout.KeyC = 'd';
					layout.KeyV = 'v';
					layout.KeyB = 'z';
				}
				if (_currentLayout === 'tarmakdh') {
					levelDictionaries.tarmakdh.lvl1 = 'qwagv';
					levelDictionaries.tarmakdh.lvl3 = 'ftbzxc';
				}
				if (_currentLayout === 'canary') {
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
				if (_currentLayout === 'colemakdh' || _currentLayout === 'tarmakdh') {
					layout.IntlBackslash = 'z';
					layout.KeyZ = 'x';
					layout.KeyX = 'c';
					layout.KeyC = 'd';
					layout.KeyV = 'v';
					delete layout.KeyB;
				}
				if (_currentLayout === 'tarmakdh') {
					levelDictionaries.tarmakdh.lvl1 = 'qwagv';
					levelDictionaries.tarmakdh.lvl3 = 'ftbzxc';
				}
				if (_currentLayout === 'canary') {
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
				if (_currentLayout === 'colemakdh' || _currentLayout === 'tarmakdh') {
					layout.KeyZ = 'z';
					layout.KeyX = 'x';
					layout.KeyC = 'c';
					layout.KeyV = 'd';
					layout.KeyB = 'v';
				}
				if (_currentLayout === 'tarmakdh') {
					levelDictionaries.tarmakdh.lvl1 = 'qwagzxc';
					levelDictionaries.tarmakdh.lvl3 = 'ftbv';
				}
				if (_currentLayout === 'canary') {
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
		switch (_currentKeyboard) {
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
			if (!_layoutMaps || !_layoutMaps.custom) {
				console.error('Custom layout not available');
				return false;
			}

			// Merge custom layout with existing
			Object.assign(_layoutMaps.custom, customLayout);
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
			if (!_layoutMaps || !_layoutMaps.custom) {
				console.error('Custom layout not available');
				return false;
			}

			// Reset to default empty layout
			Object.keys(_layoutMaps.custom).forEach(key => {
				if (key !== 'shiftLayer') {
					_layoutMaps.custom[key] = ' ';
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
		if (_currentLayout === 'tarmak' || _currentLayout === 'tarmakdh') {
			return `Step ${level - 1}`;
		}
		return `Level ${level}`;
	}

	/**
	 * Check if layout is custom
	 * @param {string} layoutName - Layout name to check
	 * @returns {boolean} Whether layout is custom
	 */
	function isCustomLayout(layoutName = _currentLayout) {
		return layoutName === 'custom';
	}

	/**
	 * Get shift layer mapping
	 * @param {string} layoutName - Layout name (optional, uses current)
	 * @returns {Object|string} Shift layer mapping
	 */
	function getShiftLayer(layoutName = _currentLayout) {
		if (!_layoutMaps || !_layoutMaps[layoutName]) {
			return {};
		}
		
		const layout = _layoutMaps[layoutName];
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
	function getLayoutStats(layoutName = _currentLayout) {
		if (!_layoutMaps || !_layoutMaps[layoutName]) {
			return {
				name: layoutName,
				valid: false,
				keyCount: 0,
				hasShiftLayer: false
			};
		}

		const layout = _layoutMaps[layoutName];
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