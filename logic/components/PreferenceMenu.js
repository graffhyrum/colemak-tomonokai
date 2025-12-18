/**
 * Preference Menu Component - Handle settings management
 * Extracted from app.js to separate preferences logic
 * Uses revealing module pattern
 */

const PreferenceMenu = (function() {
	// Private state
	let _elements = {};
	let _isInitialized = false;
	let _preferenceMenuOpen = false;

	/**
	 * Initialize preference menu component
	 * @param {Object} domElements - DOM elements to cache
	 */
	function initialize(domElements = {}) {
		if (_isInitialized) return false;

		try {
			// Cache DOM elements
			_elements = {
				preferenceButton: domElements.preferenceButton || document.querySelector('.preferenceButton'),
				preferenceMenu: domElements.preferenceMenu || document.querySelector('.preferenceMenu'),
				closePreferenceButton: domElements.closePreferenceButton || document.querySelector('.closePreferenceButton'),
				capitalLettersAllowed: domElements.capitalLettersAllowed || document.querySelector('.capitalLettersAllowed'),
				fullSentenceModeToggle: domElements.fullSentenceModeToggle || document.querySelector('.fullSentenceMode'),
				fullSentenceModeLevelButton: domElements.fullSentenceModeLevelButton || document.querySelector('.lvl8'),
				requireBackspaceCorrectionToggle: domElements.requireBackspaceCorrectionToggle || document.querySelector('.requireBackspaceCorrectionToggle'),
				wordLimitModeButton: domElements.wordLimitModeButton || document.querySelector('.wordLimitModeButton'),
				wordLimitModeInput: domElements.wordLimitModeInput || document.querySelector('.wordLimitModeInput'),
				timeLimitModeButton: domElements.timeLimitModeButton || document.querySelector('.timeLimitModeButton'),
				timeLimitModeInput: domElements.timeLimitModeInput || document.querySelector('.timeLimitModeInput'),
				wordScrollingModeButton: domElements.wordScrollingModeButton || document.querySelector('.wordScrollingModeButton'),
				punctuationModeButton: domElements.punctuationModeButton || document.querySelector('.punctuationModeButton'),
				showCheatsheetButton: domElements.showCheatsheetButton || document.querySelector('.showCheatsheetButton'),
				playSoundOnClickButton: domElements.playSoundOnClickButton || document.querySelector('.playSoundOnClick'),
				playSoundOnErrorButton: domElements.playSoundOnErrorButton || document.querySelector('.playSoundOnError'),
				mappingStatusButton: domElements.mappingStatusButton || document.querySelector('#mappingToggle label input'),
				mappingStatusText: domElements.mappingStatusText || document.querySelector('#mappingToggle h6 span'),
				layout: domElements.layout || document.querySelector('#layout'),
				keyboard: domElements.keyboard || document.querySelector('#keyboard')
			};

			// Validate required elements
			if (!_elements.preferenceButton || !_elements.preferenceMenu) {
				console.error('PreferenceMenu: Required elements not found');
				return false;
			}

			// Set up event listeners
			_setupEventListeners();
			
			// Load initial state from localStorage
			_loadSettingsFromStorage();
			
			_isInitialized = true;
			return true;
		} catch (error) {
			console.error('Error initializing PreferenceMenu:', error);
			return false;
		}
	}

	/**
	 * Set up all event listeners
	 */
	function _setupEventListeners() {
		// Menu controls
		if (_elements.preferenceButton) {
			_elements.preferenceButton.addEventListener('click', _handlePreferenceButtonClick);
		}
		if (_elements.closePreferenceButton) {
			_elements.closePreferenceButton.addEventListener('click', _handleClosePreferenceButtonClick);
		}

		// Setting toggles
		if (_elements.capitalLettersAllowed) {
			_elements.capitalLettersAllowed.addEventListener('click', _handleCapitalLettersToggle);
		}
		if (_elements.requireBackspaceCorrectionToggle) {
			_elements.requireBackspaceCorrectionToggle.addEventListener('click', _handleRequireBackspaceCorrectionToggle);
		}
		if (_elements.fullSentenceModeToggle) {
			_elements.fullSentenceModeToggle.addEventListener('click', _handleFullSentenceModeToggle);
		}
		if (_elements.wordLimitModeButton) {
			_elements.wordLimitModeButton.addEventListener('click', _handleWordLimitModeButtonClick);
		}
		if (_elements.wordLimitModeInput) {
			_elements.wordLimitModeInput.addEventListener('change', _handleWordLimitModeInputChange);
		}
		if (_elements.timeLimitModeButton) {
			_elements.timeLimitModeButton.addEventListener('click', _handleTimeLimitModeButtonClick);
		}
		if (_elements.timeLimitModeInput) {
			_elements.timeLimitModeInput.addEventListener('change', _handleTimeLimitModeInputChange);
		}
		if (_elements.wordScrollingModeButton) {
			_elements.wordScrollingModeButton.addEventListener('click', _handleWordScrollingModeToggle);
		}
		if (_elements.punctuationModeButton) {
			_elements.punctuationModeButton.addEventListener('click', _handlePunctuationModeToggle);
		}
		if (_elements.showCheatsheetButton) {
			_elements.showCheatsheetButton.addEventListener('click', _handleShowCheatsheetToggle);
		}
		if (_elements.playSoundOnClickButton) {
			_elements.playSoundOnClickButton.addEventListener('click', _handlePlaySoundOnClickToggle);
		}
		if (_elements.playSoundOnErrorButton) {
			_elements.playSoundOnErrorButton.addEventListener('click', _handlePlaySoundOnErrorToggle);
		}

		// Layout and keyboard selection
		if (_elements.layout) {
			_elements.layout.addEventListener('change', _handleLayoutChange);
		}
		if (_elements.keyboard) {
			_elements.keyboard.addEventListener('change', _handleKeyboardChange);
		}

		// Mapping toggle
		if (_elements.mappingStatusButton) {
			_elements.mappingStatusButton.addEventListener('click', _handleMappingToggle);
		}

		// Close on escape key
		document.addEventListener('keydown', _handleEscapeKey);
	}

	/**
	 * Load settings from localStorage into state and UI
	 */
	function _loadSettingsFromStorage() {
		if (!StorageService || !StateManager) return;

		try {
			// Load saved preferences
			const settings = {
				onlyLower: StorageService.get('onlyLower', true),
				fullSentenceModeEnabled: StorageService.get('fullSentenceModeEnabled', false),
				requireBackspaceCorrection: StorageService.get('requireBackspaceCorrection', true),
				timeLimitMode: StorageService.get('timeLimitMode', false),
				wordScrollingMode: StorageService.get('wordScrollingMode', true),
				punctuation: StorageService.get('punctuation', ''),
				showCheatsheet: StorageService.get('showCheatsheet', true),
				playSoundOnClick: StorageService.get('playSoundOnClick', false),
				playSoundOnError: StorageService.get('playSoundOnError', false),
				scoreMax: StorageService.get('scoreMax', 50),
				currentLayout: StorageService.get('currentLayout', 'colemak'),
				currentKeyboard: StorageService.get('currentKeyboard', 'ansi')
			};

			// Update StateManager
			if (StateManager.set) {
				Object.keys(settings).forEach(key => {
					StateManager.set(key, settings[key]);
				});
			}

			// Update UI elements
			_updateUIFromSettings(settings);
		} catch (error) {
			console.error('Error loading settings:', error);
		}
	}

	/**
	 * Update UI elements from settings
	 * @param {Object} settings - Settings object
	 */
	function _updateUIFromSettings(settings) {
		// Update checkboxes
		if (_elements.capitalLettersAllowed) {
			_elements.capitalLettersAllowed.checked = !settings.onlyLower;
		}
		if (_elements.requireBackspaceCorrectionToggle) {
			_elements.requireBackspaceCorrectionToggle.checked = settings.requireBackspaceCorrection;
		}
		if (_elements.fullSentenceModeToggle) {
			_elements.fullSentenceModeToggle.checked = settings.fullSentenceModeEnabled;
		}
		if (_elements.wordScrollingModeButton) {
			_elements.wordScrollingModeButton.checked = settings.wordScrollingMode;
		}
		if (_elements.punctuationModeButton) {
			_elements.punctuationModeButton.checked = settings.punctuation !== '';
		}
		if (_elements.showCheatsheetButton) {
			_elements.showCheatsheetButton.checked = settings.showCheatsheet;
		}
		if (_elements.playSoundOnClickButton) {
			_elements.playSoundOnClickButton.checked = settings.playSoundOnClick;
		}
		if (_elements.playSoundOnErrorButton) {
			_elements.playSoundOnErrorButton.checked = settings.playSoundOnError;
		}

		// Update selects and inputs
		if (_elements.layout) {
			_elements.layout.value = settings.currentLayout;
		}
		if (_elements.keyboard) {
			_elements.keyboard.value = settings.currentKeyboard;
		}
		if (_elements.wordLimitModeInput) {
			_elements.wordLimitModeInput.value = settings.scoreMax;
		}
		if (_elements.timeLimitModeInput) {
			_elements.timeLimitModeInput.value = 60; // Default time limit
		}

		// Update mapping toggle
		if (_elements.mappingStatusButton) {
			_elements.mappingStatusButton.checked = StorageService.get('keyRemapping') === 'true';
		}
		if (_elements.mappingStatusText) {
			_elements.mappingStatusText.innerText = StorageService.get('keyRemapping') === 'true' ? 'on' : 'off';
		}

		// Update mode-specific UI
		_updateModeSpecificUI(settings);
	}

	/**
	 * Update mode-specific UI elements
	 * @param {Object} settings - Current settings
	 */
	function _updateModeSpecificUI(settings) {
		// Full sentence mode UI
		if (settings.fullSentenceModeEnabled) {
			_toggleFullSentenceModeUI();
		}

		// Time limit mode UI
		if (settings.timeLimitMode) {
			_toggleTimeLimitModeUI();
		}

		// Word scrolling mode UI
		if (!settings.wordScrollingMode) {
			_toggleWordScrollingModeUI();
		}

		// Cheatsheet visibility
		if (!settings.showCheatsheet) {
			const cheatsheet = document.querySelector('.cheatsheet');
			if (cheatsheet) {
				cheatsheet.classList.add('noDisplay');
			}
		}
	}

	/**
	 * Handle preference button click
	 */
	function _handlePreferenceButtonClick() {
		_openMenu();
	}

	/**
	 * Handle close preference button click
	 */
	function _handleClosePreferenceButtonClick() {
		_closeMenu();
	}

	/**
	 * Handle escape key
	 * @param {Event} e - Keyboard event
	 */
	function _handleEscapeKey(e) {
		if (e.keyCode === 27) {
			_closeMenu();
			// Also close custom UI menu if open
			const customInput = document.querySelector('.customInput');
			if (customInput && customInput.style.transform !== 'scaleX(0)') {
				customInput.style.transform = 'scaleX(0)';
				if (typeof clearSelectedInput === 'function') {
					clearSelectedInput();
				}
				if (typeof init === 'function') {
					init();
				}
			}
		}
	}

	/**
	 * Handle capital letters toggle
	 */
	function _handleCapitalLettersToggle() {
		const onlyLower = !StateManager.get('onlyLower');
		StateManager.set('onlyLower', onlyLower);
		StorageService.set('onlyLower', onlyLower);
		
		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle require backspace correction toggle
	 */
	function _handleRequireBackspaceCorrectionToggle() {
		const requireBackspaceCorrection = !StateManager.get('requireBackspaceCorrection');
		StateManager.set('requireBackspaceCorrection', requireBackspaceCorrection);
		StorageService.set('requireBackspaceCorrection', requireBackspaceCorrection);
		
		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle full sentence mode toggle
	 */
	function _handleFullSentenceModeToggle() {
		const fullSentenceModeEnabled = !StateManager.get('fullSentenceModeEnabled');
		StateManager.set('fullSentenceModeEnabled', fullSentenceModeEnabled);
		StorageService.set('fullSentenceModeEnabled', fullSentenceModeEnabled);
		
		_toggleFullSentenceModeUI();
		
		if (fullSentenceModeEnabled) {
			if (typeof switchLevel === 'function') {
				switchLevel(8);
			}
		} else {
			if (typeof switchLevel === 'function') {
				switchLevel(1);
			}
		}
		
		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle word limit mode button click
	 */
	function _handleWordLimitModeButtonClick() {
		if (StateManager.get('timeLimitMode') === true) {
			_timeLimitModeButton.checked = true;
			_switchToWordLimitMode();
		}
	}

	/**
	 * Handle word limit mode input change
	 */
	function _handleWordLimitModeInputChange() {
		let value = parseInt(_elements.wordLimitModeInput.value);
		
		// Validate and clamp value
		if (value > 10 && value <= 500) {
			value = Math.ceil(value / 10) * 10; // Round to nearest 10
		} else if (value > 500) {
			value = 500;
		} else {
			value = 10;
		}
		
		_elements.wordLimitModeInput.value = value;
		StateManager.set('scoreMax', value);
		StorageService.set('scoreMax', value);
		
		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle time limit mode button click
	 */
	function _handleTimeLimitModeButtonClick() {
		if (StateManager.get('timeLimitMode') === true) {
			_timeLimitModeButton.checked = true;
			return;
		}
		
		// Switch to time limit mode
		StateManager.set('timeLimitMode', true);
		StorageService.set('timeLimitMode', true);

		// Ensure time limit seconds is initialized
		const currentTimeLimit = StateManager.get('timeLimitSeconds') || 60;
		if (_elements.timeLimitModeInput) {
			_elements.timeLimitModeInput.value = currentTimeLimit;
		}

		_toggleTimeLimitModeUI();
		
		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle time limit mode input change
	 */
	function _handleTimeLimitModeInputChange() {
		let value = parseInt(_elements.timeLimitModeInput.value);

		// Validate value with reasonable bounds
		if (isNaN(value) || value < 1) {
			value = 60; // Default
		} else if (value > 3600) {
			value = 3600; // Maximum 1 hour
		}

		_elements.timeLimitModeInput.value = value;

		// Update game state for time limit
		StateManager.set('timeLimitSeconds', value);
		StateManager.set('scoreMax', value * 4); // Extended for time mode (maintains backward compatibility)
		StateManager.set('seconds', value % 60);
		StateManager.set('minutes', Math.floor(value / 60));
		
		if (typeof resetTimeText === 'function') {
			resetTimeText();
		}
	}

	/**
	 * Handle word scrolling mode toggle
	 */
	function _handleWordScrollingModeToggle() {
		const wordScrollingMode = !StateManager.get('wordScrollingMode');
		StateManager.set('wordScrollingMode', wordScrollingMode);
		StorageService.set('wordScrollingMode', wordScrollingMode);
		
		_toggleWordScrollingModeUI();
		
		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle punctuation mode toggle
	 */
	function _handlePunctuationModeToggle() {
		const punctuation = StateManager.get('punctuation') === '' ? "'.-": '';
		StateManager.set('punctuation', punctuation);
		StorageService.set('punctuation', punctuation);
		
		if (typeof createTestSets === 'function') {
			createTestSets();
		}
		if (typeof updateCheatsheetStyling === 'function') {
			updateCheatsheetStyling(StateManager.get('currentLevel'));
		}
		
		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle show cheatsheet toggle
	 */
	function _handleShowCheatsheetToggle() {
		const showCheatsheet = !StateManager.get('showCheatsheet');
		StateManager.set('showCheatsheet', showCheatsheet);
		StorageService.set('showCheatsheet', showCheatsheet);
		
		const cheatsheet = document.querySelector('.cheatsheet');
		if (cheatsheet) {
			if (showCheatsheet) {
				cheatsheet.classList.remove('noDisplay');
			} else {
				cheatsheet.classList.add('noDisplay');
			}
		}
	}

	/**
	 * Handle play sound on click toggle
	 */
	function _handlePlaySoundOnClickToggle() {
		const playSoundOnClick = !StateManager.get('playSoundOnClick');
		StateManager.set('playSoundOnClick', playSoundOnClick);
		StorageService.set('playSoundOnClick', playSoundOnClick);
	}

	/**
	 * Handle play sound on error toggle
	 */
	function _handlePlaySoundOnErrorToggle() {
		const playSoundOnError = !StateManager.get('playSoundOnError');
		StateManager.set('playSoundOnError', playSoundOnError);
		StorageService.set('playSoundOnError', playSoundOnError);
	}

	/**
	 * Handle layout change
	 * @param {Event} e - Change event
	 */
	function _handleLayoutChange(e) {
		const currentLayout = e.target.value;
		StateManager.set('currentLayout', currentLayout);
		StorageService.set('currentLayout', currentLayout);
		
		if (typeof updateLayoutUI === 'function') {
			updateLayoutUI();
		}
		if (typeof init === 'function') {
			init();
		}
	}

	/**
	 * Handle keyboard change
	 * @param {Event} e - Change event
	 */
	function _handleKeyboardChange(e) {
		const currentKeyboard = e.target.value;
		StateManager.set('currentKeyboard', currentKeyboard);
		StorageService.set('currentKeyboard', currentKeyboard);
		
		if (typeof updateLayoutUI === 'function') {
			updateLayoutUI();
		}
		if (typeof init === 'function') {
			init();
		}
	}

	/**
	 * Handle mapping toggle
	 */
	function _handleMappingToggle() {
		const keyRemapping = StorageService.get('keyRemapping') === 'true' ? 'false' : 'true';
		StorageService.set('keyRemapping', keyRemapping);
		
		if (_elements.mappingStatusText) {
			_elements.mappingStatusText.innerText = keyRemapping === 'true' ? 'on' : 'off';
		}
		
		// Focus back to input
		if (StateManager && _elements.input) {
			const input = StateManager.getElement ? StateManager.getElement('input') : document.querySelector('#userInput');
			if (input) {
				input.focus();
			}
		}
	}

	/**
	 * Open preference menu
	 */
	function _openMenu() {
		if (_elements.preferenceMenu) {
			_elements.preferenceMenu.style.right = '0';
			StorageService.set('preferenceMenu', 'open');
			_preferenceMenuOpen = true;
		}
	}

	/**
	 * Close preference menu
	 */
	function _closeMenu() {
		if (_elements.preferenceMenu) {
			_elements.preferenceMenu.style.right = '-37vh';
			StorageService.removeItem('preferenceMenu');
			_preferenceMenuOpen = false;
		}
	}

	/**
	 * Switch to word limit mode
	 */
	function _switchToWordLimitMode() {
		StateManager.set('timeLimitMode', false);
		StorageService.set('timeLimitMode', false);
		
		StateManager.set('seconds', 0);
		StateManager.set('minutes', 0);
		
		if (_elements.scoreText && _elements.scoreText.style) {
			_elements.scoreText.style.display = 'flex';
		}
		
		_toggleTimeLimitModeUI();
		
		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Toggle full sentence mode UI
	 */
	function _toggleFullSentenceModeUI() {
		if (_elements.fullSentenceModeLevelButton) {
			_elements.fullSentenceModeLevelButton.classList.toggle('visible');
		}
	}

	/**
	 * Toggle time limit mode UI
	 */
	function _toggleTimeLimitModeUI() {
		const timeLimitSeconds = StateManager.get('timeLimitSeconds') || 60;
		const seconds = timeLimitSeconds % 60;
		const minutes = Math.floor(timeLimitSeconds / 60);

		StateManager.set('seconds', seconds);
		StateManager.set('minutes', minutes);
		
		if (_elements.scoreText && _elements.scoreText.style) {
			_elements.scoreText.style.display = StateManager.get('timeLimitMode') ? 'none' : 'flex';
		}
		
		// Toggle input fields
		if (_elements.timeLimitModeInput && _elements.wordLimitModeInput) {
			_elements.timeLimitModeInput.classList.toggle('noDisplay');
			_elements.wordLimitModeInput.classList.toggle('noDisplay');
		}
		
		// Toggle buttons
		if (_elements.timeLimitModeButton && _elements.wordLimitModeButton) {
			_elements.timeLimitModeButton.checked = !_elements.timeLimitModeButton.checked;
		}
	}

	/**
	 * Toggle word scrolling mode UI
	 */
	function _toggleWordScrollingModeUI() {
		const prompt = document.querySelector('.prompt');
		const fadeElement = document.querySelector('#fadeElement');
		
		if (prompt && prompt.classList) {
			prompt.classList.toggle('paragraph');
		}
		if (fadeElement && fadeElement.classList) {
			fadeElement.classList.toggle('fade');
		}
	}

	/**
	 * Check if menu is open
	 * @returns {boolean} Menu open status
	 */
	function isMenuOpen() {
		return _preferenceMenuOpen;
	}

	/**
	 * Get cached DOM elements
	 * @returns {Object} Cached elements
	 */
	function getElements() {
		return { ..._elements };
	}

	/**
	 * Check if component is initialized
	 * @returns {boolean} Initialization status
	 */
	function isReady() {
		return _isInitialized;
	}

	// Public API
	return {
		initialize,
		isMenuOpen,
		getElements,
		isReady
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = PreferenceMenu;
} else if (typeof window !== 'undefined') {
	window.PreferenceMenu = PreferenceMenu;
}