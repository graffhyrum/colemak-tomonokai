/**
 * Keyboard Display Component - Handle visual keyboard representation
 * Extracted from app.js to separate keyboard UI logic
 * Uses revealing module pattern
 */

const KeyboardDisplay = (function() {
	// Private state
	let _elements = {};
	let _isInitialized = false;
	let _currentSelectedKey = null;

	/**
	 * Initialize keyboard display component
	 * @param {Object} domElements - DOM elements to cache
	 */
	function initialize(domElements = {}) {
		if (_isInitialized) return false;

		try {
			// Cache required DOM elements
			_elements = {
				cheatsheet: domElements.cheatsheet || document.querySelector('.cheatsheet'),
				inputKeyboard: domElements.inputKeyboard || document.querySelector('#inputKeyboard'),
				inputShiftKeyboard: domElements.inputShiftKeyboard || document.querySelector('#inputShiftKeyboard'),
				openUIButton: domElements.openUIButton || document.querySelector('.openUIButton'),
				customInput: domElements.customInput || document.querySelector('.customInput'),
				saveButton: domElements.saveButton || document.querySelector('.saveButton'),
				discardButton: domElements.discardButton || document.querySelector('.discardButton'),
				customUIKeyInput: domElements.customUIKeyInput || document.querySelector('#customUIKeyInput'),
				customUILevelButtons: null // Will be populated later
			};

			// Cache custom UI level buttons
			if (document.querySelectorAll('.customUILevelButton')) {
				_elements.customUILevelButtons = Array.from(document.querySelectorAll('.customUILevelButton'));
			}

			// Set up event listeners
			_setupEventListeners();
			_isInitialized = true;
			return true;
		} catch (error) {
			console.error('Error initializing KeyboardDisplay:', error);
			return false;
		}
	}

	/**
	 * Set up all event listeners
	 */
	function _setupEventListeners() {
		// Custom UI open button
		if (_elements.openUIButton) {
			_elements.openUIButton.addEventListener('click', _handleOpenUIButtonClick);
		}

		// Custom UI save button
		if (_elements.saveButton) {
			_elements.saveButton.addEventListener('click', _handleSaveButtonClick);
		}

		// Custom UI discard button
		if (_elements.discardButton) {
			_elements.discardButton.addEventListener('click', _handleDiscardButtonClick);
		}

		// Custom UI key input
		if (_elements.customUIKeyInput) {
			_elements.customUIKeyInput.addEventListener('keydown', _handleCustomUIKeyInput);
		}

		// General click listener for key selection and level buttons
		document.addEventListener('click', _handleGeneralClick);
	}

	/**
	 * Handle open custom UI button click
	 */
	function _handleOpenUIButtonClick() {
		if (typeof startCustomKeyboardEditing === 'function') {
			startCustomKeyboardEditing();
		}
	}

	/**
	 * Handle save custom layout button click
	 */
	function _handleSaveButtonClick() {
		if (StateManager) {
			StateManager.set('initialCustomKeyboardState', '');
			StateManager.set('initialCustomLevelsState', '');
		}

		_closeCustomUI();
		if (typeof init === 'function') {
			init();
		}
	}

	/**
	 * Handle discard custom layout button click
	 */
	function _handleDiscardButtonClick() {
		if (!StateManager || !LayoutService) {
			console.warn('StateManager or LayoutService not available');
			return;
		}

		const initialKeyboardState = StateManager.get('initialCustomKeyboardState');
		const initialLevelsState = StateManager.get('initialCustomLevelsState');

		if (initialKeyboardState && initialLevelsState) {
			// Load the old layout to revert changes
			if (typeof loadCustomLayout === 'function') {
				loadCustomLayout(initialKeyboardState);
			}
			if (typeof loadCustomLevels === 'function') {
				loadCustomLevels(initialLevelsState);
			}
		}

		_closeCustomUI();
		if (typeof init === 'function') {
			init();
		}
	}

	/**
	 * Close custom UI interface
	 */
	function _closeCustomUI() {
		if (_elements.customInput) {
			_elements.customInput.style.transform = 'scaleX(0)';
		}

		if (typeof clearSelectedInput === 'function') {
			clearSelectedInput();
		}
	}

	/**
	 * Handle custom UI key input
	 * @param {Event} e - Keyboard event
	 */
	function _handleCustomUIKeyInput(e) {
		const selectedKey = _getSelectedInputKey();
		if (!selectedKey) return;

		// Handle navigation keys
		if (_handleNavigationKeys(e)) return;

		// Handle delete/backspace
		if (_handleDeleteKeys(e)) return;

		// Handle character input
		_handleCharacterInput(e, selectedKey);
	}

	/**
	 * Get currently selected key element
	 * @returns {Element|null} Selected key element
	 */
	function _getSelectedInputKey() {
		if (!_elements.customUIKeyInput) return null;
		
		const customUIKeyInput = _elements.customUIKeyInput;
		if (customUIKeyInput && customUIKeyInput.focus) {
			return document.querySelector('.selectedInputKey');
		}
		return null;
	}

	/**
	 * Handle navigation key input
	 * @param {Event} e - Keyboard event
	 * @returns {boolean} Whether key was handled
	 */
	function _handleNavigationKeys(e) {
		const keyMap = {
			37: 'left',   // Left arrow
			38: 'up',     // Up arrow
			39: 'right',  // Right arrow
			40: 'down'    // Down arrow
		};

		const direction = keyMap[e.keyCode];
		if (direction && typeof switchSelectedInputKey === 'function') {
			switchSelectedInputKey(direction);
			return true;
		}

		return false;
	}

	/**
	 * Handle delete keys
	 * @param {Event} e - Keyboard event
	 * @returns {boolean} Whether key was handled
	 */
	function _handleDeleteKeys(e) {
		if (e.keyCode === 8 || e.keyCode === 46) { // Backspace or Delete
			const selectedKey = _getSelectedInputKey();
			if (selectedKey && selectedKey.children[0]) {
				selectedKey.children[0].innerHTML = '_';
				selectedKey.classList.remove('active');
				
				if (StateManager && LayoutService) {
					const layoutMaps = typeof layoutMaps !== 'undefined' ? layoutMaps : {};
					const customLayoutKey = selectedKey.id.replace('custom', '');
					if (layoutMaps.custom && layoutMaps.custom[customLayoutKey]) {
						layoutMaps.custom[customLayoutKey] = ' ';
					}
				}
			}

			// Clear input field
			if (_elements.customUIKeyInput) {
				_elements.customUIKeyInput.value = '';
			}

			return true;
		}

		return false;
	}

	/**
	 * Handle character input for selected key
	 * @param {Event} e - Keyboard event
	 * @param {Element} selectedKey - Currently selected key element
	 */
	function _handleCharacterInput(e, selectedKey) {
		// Ignore special keys
		if ([16, 17, 18, 20, 27, 32, 37, 38, 39, 40].includes(e.keyCode)) return;
		if ([13, 46].includes(e.keyCode)) return; // Enter and Delete

		const char = e.key;
		if (!char || char.length !== 1) return;

		// Remove old letter from all levels
		if (selectedKey && selectedKey.children[0]) {
			const oldLetter = selectedKey.children[0].innerHTML;
			if (oldLetter && oldLetter !== '_') {
				_removeKeyFromLevels(oldLetter);
			}
		}

		// Update key display
		if (selectedKey && selectedKey.children[0]) {
			selectedKey.children[0].innerHTML = char;
			selectedKey.classList.add('active');
		}

		// Add to current level
		const currentLevel = _getCurrentSelectedLevel();
		if (currentLevel && StateManager && LayoutService) {
			const levelKey = `lvl${currentLevel}`;
			if (StateManager.set && LayoutService.saveCustomLayout) {
				const layoutMaps = typeof layoutMaps !== 'undefined' ? layoutMaps : {};
				if (layoutMaps.custom) {
					const customLayoutKey = selectedKey.id.replace('custom', '');
					layoutMaps.custom[customLayoutKey] = char;
				}
			}

			const levelDictionaries = typeof levelDictionaries !== 'undefined' ? levelDictionaries : {};
			if (levelDictionaries.custom) {
				if (!levelDictionaries.custom[levelKey]) {
					levelDictionaries.custom[levelKey] = '';
				}
				if (!levelDictionaries.custom[levelKey].includes(char)) {
					levelDictionaries.custom[levelKey] += char;
				}
			}

			if (StateManager.set) {
				StateManager.set('letterDictionary', levelDictionaries.custom);
			}
		}

		// Move to next key
		if (typeof switchSelectedInputKey === 'function') {
			switchSelectedInputKey('right');
		}

		// Update cheatsheet if available
		if (typeof updateCheatsheetStyling === 'function') {
			updateCheatsheetStyling(StateManager.get('currentLevel'));
		}

		// Clear input field
		if (_elements.customUIKeyInput) {
			_elements.customUIKeyInput.value = '';
		}
	}

	/**
	 * Get currently selected level button
	 * @returns {number|null} Level number or null
	 */
	function _getCurrentSelectedLevel() {
		if (!_elements.customUILevelButtons || _elements.customUILevelButtons.length === 0) return null;

		const currentSelected = _elements.customUILevelButtons.find(button => 
			button.classList.contains('currentCustomUILevel')
		);

		if (currentSelected) {
			// Extract level number from button text
			const buttonText = currentSelected.innerHTML;
			const levelMatch = buttonText.match(/lvl(\d+)/);
			if (levelMatch) {
				return parseInt(levelMatch[1]);
			}
		}

		return null;
	}

	/**
	 * Remove key from all custom levels
	 * @param {string} letter - Letter to remove
	 */
	function _removeKeyFromLevels(letter) {
		if (!StateManager || !LayoutService) return;

		const layoutMaps = typeof layoutMaps !== 'undefined' ? layoutMaps : {};
		const levelDictionaries = typeof levelDictionaries !== 'undefined' ? levelDictionaries : {};

		if (layoutMaps.custom && levelDictionaries.custom) {
			// Remove from all levels
			Object.keys(levelDictionaries.custom).forEach(levelKey => {
				levelDictionaries.custom[levelKey] = levelDictionaries.custom[levelKey].replace(letter, '');
			});

			if (StateManager.set) {
				StateManager.set('letterDictionary', levelDictionaries.custom);
			}
		}
	}

	/**
	 * Handle general click events for key selection and level buttons
	 * @param {Event} e - Click event
	 */
	function _handleGeneralClick(e) {
		const clickedKey = e.target.closest('.cKey');
		const clickedLevelButton = e.target.closest('.customUILevelButton');

		if (clickedKey) {
			_selectInputKey(clickedKey);
			_elements.customUIKeyInput.focus();
		}

		if (clickedLevelButton) {
			_selectLevelButton(clickedLevelButton);
			_updateKeyHighlighting();
		}
	}

	/**
	 * Select a key for editing
	 * @param {Element} keyElement - Key element to select
	 */
	function _selectInputKey(keyElement) {
		// Clear previous selection
		if (typeof clearSelectedInput === 'function') {
			clearSelectedInput();
		}

		// Select new key
		if (keyElement && keyElement.children[0]) {
			keyElement.classList.add('selectedInputKey');
			if (keyElement.children[0].innerHTML === '') {
				keyElement.children[0].innerHTML = '_';
			}
			keyElement.children[0].classList.add('pulse');
		}

		_currentSelectedKey = keyElement;
	}

	/**
	 * Select a level button
	 * @param {Element} levelButton - Level button element
	 */
	function _selectLevelButton(levelButton) {
		if (!_elements.customUILevelButtons) return;

		// Clear previous selection
		_elements.customUILevelButtons.forEach(button => {
			button.classList.remove('currentCustomUILevel');
		});

		// Select new button
		levelButton.classList.add('currentCustomUILevel');
	}

	/**
	 * Update key highlighting based on current level
	 */
	function _updateKeyHighlighting() {
		if (!_elements.customUIKeyInput || !_elements.customUILevelButtons) return;

		const currentLevel = _getCurrentSelectedLevel();
		if (currentLevel === null) return;

		const allKeys = document.querySelectorAll('.cKey');
		const levelKey = `lvl${currentLevel}`;

		if (StateManager && LayoutService) {
			const levelDictionaries = typeof levelDictionaries !== 'undefined' ? levelDictionaries : {};
			const currentLevelLetters = levelDictionaries.custom && levelDictionaries.custom[levelKey] ? 
				levelDictionaries.custom[levelKey] : '';

			allKeys.forEach(key => {
				const keyLetter = key.children[0] ? key.children[0].innerHTML : '';
				if (keyLetter && keyLetter !== '_') {
					if (currentLevelLetters.includes(keyLetter)) {
						key.classList.add('active');
						key.classList.remove('inactive');
					} else {
						key.classList.remove('active');
						key.classList.add('inactive');
					}
				} else {
					key.classList.remove('active');
					key.classList.remove('inactive');
				}
			});
		}
	}

	/**
	 * Update keyboard display HTML
	 * @param {string} layoutName - Current layout name
	 */
	function updateKeyboardHTML(layoutName) {
		if (!_elements.cheatsheet) return;

		if (typeof LayoutService !== 'undefined' && LayoutService.getKeyboardHTML) {
			const keyboardHTML = layoutName === 'custom' ? 
				LayoutService.getCustomKeyboardHTML() : 
				LayoutService.getKeyboardHTML();

			_elements.cheatsheet.innerHTML = keyboardHTML;
		}
	}

	/**
	 * Show/hide open UI button for custom layouts
	 * @param {string} layoutName - Current layout name
	 */
	function updateOpenUIButton(layoutName) {
		if (!_elements.openUIButton) return;

		if (layoutName === 'custom') {
			_elements.openUIButton.style.display = 'block';
		} else {
			_elements.openUIButton.style.display = 'none';
		}
	}

	/**
	 * Update cheatsheet styling
	 * @param {number} level - Current level
	 */
	function updateCheatsheetStyling(level) {
		// This would use the existing global function
		if (typeof updateCheatsheetStyling === 'function') {
			updateCheatsheetStyling(level);
		}
	}

	/**
	 * Apply keyboard-specific modifications
	 * @param {string} keyboardType - Keyboard type (ansi/iso/ortho)
	 */
	function applyKeyboardSpecificModifications(keyboardType) {
		if (StateManager && LayoutService) {
			const currentLayout = StateManager.get('currentLayout');
			const currentKeyboard = keyboardType;

			// Update keyboard type
			StateManager.set('currentKeyboard', currentKeyboard);
			if (StorageService) {
				StorageService.set('currentKeyboard', currentKeyboard);
			}

			// Apply keyboard-specific layout changes
			if (LayoutService && LayoutService.applyKeyboardSpecificModifications) {
				LayoutService.applyKeyboardSpecificModifications();

				// Update keyboard display
				updateKeyboardHTML(currentLayout);

				// Update cheatsheet
				if (typeof updateCheatsheetStyling === 'function') {
					updateCheatsheetStyling(level);
				}
			}

			// Update level descriptions
			if (_elements.customUILevelButtons) {
				const levelButtons = _elements.customUILevelButtons;
				levelButtons.forEach((button, index) => {
					if (LayoutService && LayoutService.getLevelDescription) {
						button.innerHTML = LayoutService.getLevelDescription(index + 1);
					}
				});
			}
		}
	}

	/**
	 * Focus custom UI key input
	 */
	function focusCustomUIKeyInput() {
		if (_elements.customUIKeyInput) {
			_elements.customUIKeyInput.focus();
		}
	}

	/**
	 * Check if component is initialized
	 * @returns {boolean} Initialization status
	 */
	function isReady() {
		return _isInitialized;
	}

	/**
	 * Get cached DOM elements
	 * @returns {Object} Cached elements
	 */
	function getElements() {
		return { ..._elements };
	}

	/**
	 * Reset component state
	 */
	function reset() {
		_currentSelectedKey = null;
		
		// Clear selection if needed
		if (typeof clearSelectedInput === 'function') {
			clearSelectedInput();
		}
	}

	// Public API
	return {
		initialize,
		updateKeyboardHTML,
		updateOpenUIButton,
		updateCheatsheetStyling,
		applyKeyboardSpecificModifications,
		focusCustomUIKeyInput,
		isReady,
		getElements,
		reset
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = KeyboardDisplay;
} else if (typeof window !== 'undefined') {
	window.KeyboardDisplay = KeyboardDisplay;
}