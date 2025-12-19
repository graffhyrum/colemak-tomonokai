/**
 * Preference Menu Component - Handle settings management
 * Extracted from app.js to separate preferences logic
 * Uses revealing module pattern
 */

const PreferenceMenu = (function() {
	// Private state
	let elements = {};
	let isInitialized = false;
	let preferenceMenuOpen = false;

	/**
	 * Initialize preference menu component
	 * @param {Object} domElements - DOM elements to cache
	 */
	function initialize(domElements = {}) {
		if (isInitialized) return false;

		try {
			// Cache DOM elements
			elements = {
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
			if (!elements.preferenceButton || !elements.preferenceMenu) {
				console.error('PreferenceMenu: Required elements not found');
				return false;
			}

			// Set up event listeners
			setupEventListeners();

			// Load initial state from localStorage
			loadSettingsFromStorage();

			// Set initial visibility state
			setInitialVisibility();

			isInitialized = true;
			return true;
		} catch (error) {
			console.error('Error initializing PreferenceMenu:', error);
			return false;
		}
	}

	/**
	 * Set initial visibility state based on stored preference
	 */
	function setInitialVisibility() {
		const menuWasOpen = StorageService.get('preferenceMenu') === 'open';

		if (menuWasOpen) {
			openMenu();
		} else {
			closeMenu();
		}

		// Ensure preference button starts visible and enabled, close button starts hidden and disabled
		if (elements.preferenceButton) {
			elements.preferenceButton.style.display = 'block';
			elements.preferenceButton.disabled = false;
		}
		if (elements.closePreferenceButton) {
			elements.closePreferenceButton.style.display = 'none';
			elements.closePreferenceButton.disabled = true;
		}
	}

	/**
	 * Set up all event listeners
	 */
	function setupEventListeners() {
		// Menu controls
		if (elements.preferenceButton) {
			elements.preferenceButton.addEventListener('click', handlePreferenceButtonClick);
		}
		if (elements.closePreferenceButton) {
			elements.closePreferenceButton.addEventListener('click', handleClosePreferenceButtonClick);
		}

		// Setting toggles
		if (elements.capitalLettersAllowed) {
			elements.capitalLettersAllowed.addEventListener('click', handleCapitalLettersToggle);
		}
		if (elements.requireBackspaceCorrectionToggle) {
			elements.requireBackspaceCorrectionToggle.addEventListener('click', handleRequireBackspaceCorrectionToggle);
		}
		if (elements.fullSentenceModeToggle) {
			elements.fullSentenceModeToggle.addEventListener('click', handleFullSentenceModeToggle);
		}
		if (elements.wordLimitModeButton) {
			elements.wordLimitModeButton.addEventListener('click', handleWordLimitModeButtonClick);
		}
		if (elements.wordLimitModeInput) {
			elements.wordLimitModeInput.addEventListener('change', handleWordLimitModeInputChange);
		}
		if (elements.timeLimitModeButton) {
			elements.timeLimitModeButton.addEventListener('click', handleTimeLimitModeButtonClick);
		}
		if (elements.timeLimitModeInput) {
			elements.timeLimitModeInput.addEventListener('change', handleTimeLimitModeInputChange);
			elements.timeLimitModeInput.addEventListener('input', handleTimeLimitModeInputChange);
		}
		if (elements.wordScrollingModeButton) {
			elements.wordScrollingModeButton.addEventListener('click', handleWordScrollingModeToggle);
		}
		if (elements.punctuationModeButton) {
			elements.punctuationModeButton.addEventListener('click', handlePunctuationModeToggle);
		}
		if (elements.showCheatsheetButton) {
			elements.showCheatsheetButton.addEventListener('click', handleShowCheatsheetToggle);
		}
		if (elements.playSoundOnClickButton) {
			elements.playSoundOnClickButton.addEventListener('click', handlePlaySoundOnClickToggle);
		}
		if (elements.playSoundOnErrorButton) {
			elements.playSoundOnErrorButton.addEventListener('click', handlePlaySoundOnErrorToggle);
		}

		// Layout and keyboard selection
		if (elements.layout) {
			elements.layout.addEventListener('change', handleLayoutChange);
		}
		if (elements.keyboard) {
			elements.keyboard.addEventListener('change', handleKeyboardChange);
		}

		// Mapping toggle
		if (elements.mappingStatusButton) {
			elements.mappingStatusButton.addEventListener('click', handleMappingToggle);
		}

		// Close on escape key
		document.addEventListener('keydown', handleEscapeKey);
	}

	/**
	 * Load settings from localStorage into state and UI
	 */
	function loadSettingsFromStorage() {
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
			updateUIFromSettings(settings);
		} catch (error) {
			console.error('Error loading settings:', error);
		}
	}

	/**
	 * Update UI elements from settings
	 * @param {Object} settings - Settings object
	 */
	function updateUIFromSettings(settings) {
		// Update checkboxes
		if (elements.capitalLettersAllowed) {
			elements.capitalLettersAllowed.checked = !settings.onlyLower;
		}
		if (elements.requireBackspaceCorrectionToggle) {
			elements.requireBackspaceCorrectionToggle.checked = settings.requireBackspaceCorrection;
		}
		if (elements.fullSentenceModeToggle) {
			elements.fullSentenceModeToggle.checked = settings.fullSentenceModeEnabled;
		}
		if (elements.wordScrollingModeButton) {
			elements.wordScrollingModeButton.checked = settings.wordScrollingMode;
		}
		if (elements.punctuationModeButton) {
			elements.punctuationModeButton.checked = settings.punctuation !== '';
		}
		if (elements.showCheatsheetButton) {
			elements.showCheatsheetButton.checked = settings.showCheatsheet;
		}
		if (elements.playSoundOnClickButton) {
			elements.playSoundOnClickButton.checked = settings.playSoundOnClick;
		}
		if (elements.playSoundOnErrorButton) {
			elements.playSoundOnErrorButton.checked = settings.playSoundOnError;
		}

		// Update selects and inputs
		if (elements.layout) {
			elements.layout.value = settings.currentLayout;
		}
		if (elements.keyboard) {
			elements.keyboard.value = settings.currentKeyboard;
		}
		if (elements.wordLimitModeInput) {
			elements.wordLimitModeInput.value = settings.scoreMax;
		}
		if (elements.timeLimitModeInput) {
			elements.timeLimitModeInput.value = 60; // Default time limit
		}

		// Update mapping toggle
		if (elements.mappingStatusButton) {
			elements.mappingStatusButton.checked = StorageService.get('keyRemapping') === 'true';
		}
		if (elements.mappingStatusText) {
			elements.mappingStatusText.innerText = StorageService.get('keyRemapping') === 'true' ? 'on' : 'off';
		}

		// Update mode-specific UI
		updateModeSpecificUI(settings);
	}

	/**
	 * Update mode-specific UI elements
	 * @param {Object} settings - Current settings
	 */
	function updateModeSpecificUI(settings) {
		// Full sentence mode UI
		if (settings.fullSentenceModeEnabled) {
			toggleFullSentenceModeUI();
		}

		// Time limit mode UI
		if (settings.timeLimitMode) {
			toggleTimeLimitModeUI();
		}

		// Word scrolling mode UI
		if (!settings.wordScrollingMode) {
			toggleWordScrollingModeUI();
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
	function handlePreferenceButtonClick() {
		openMenu();
	}

	/**
	 * Handle close preference button click
	 */
	function handleClosePreferenceButtonClick() {
		closeMenu();
	}

	/**
	 * Handle escape key
	 * @param {Event} e - Keyboard event
	 */
	function handleEscapeKey(e) {
		if (e.keyCode === 27) {
			closeMenu();
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
	function handleCapitalLettersToggle() {
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
	function handleRequireBackspaceCorrectionToggle() {
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
	function handleFullSentenceModeToggle() {
		const fullSentenceModeEnabled = !StateManager.get('fullSentenceModeEnabled');
		StateManager.set('fullSentenceModeEnabled', fullSentenceModeEnabled);
		StorageService.set('fullSentenceModeEnabled', fullSentenceModeEnabled);

		toggleFullSentenceModeUI();

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
	function handleWordLimitModeButtonClick() {
		switchToWordLimitMode();
	}

	/**
	 * Handle word limit mode input change
	 */
	function handleWordLimitModeInputChange() {
		let value = parseInt(elements.wordLimitModeInput.value);

		// Validate and clamp value
		if (value > 10 && value <= 500) {
			value = Math.ceil(value / 10) * 10; // Round to nearest 10
		} else if (value > 500) {
			value = 500;
		} else {
			value = 10;
		}

		elements.wordLimitModeInput.value = value;
		StateManager.set('scoreMax', value);
		StorageService.set('scoreMax', value);

		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle time limit mode button click
	 */
	function handleTimeLimitModeButtonClick() {
		// Switch to time limit mode
		StateManager.set('timeLimitMode', true);
		StorageService.set('timeLimitMode', true);

		// Ensure time limit seconds is initialized
		const currentTimeLimit = StateManager.get('timeLimitSeconds') || 60;
		if (elements.timeLimitModeInput) {
			elements.timeLimitModeInput.value = currentTimeLimit;
		}

		toggleTimeLimitModeUI();

		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle time limit mode input change
	 */
	function handleTimeLimitModeInputChange() {
		let value = parseInt(elements.timeLimitModeInput.value);

		// Validate value with reasonable bounds
		if (isNaN(value) || value < 1) {
			value = 60; // Default
		} else if (value > 3600) {
			value = 3600; // Maximum 1 hour
		}

		elements.timeLimitModeInput.value = value;

		// Update game state for time limit
		StateManager.set('timeLimitSeconds', value);
		StateManager.set('scoreMax', value); // Score max equals time limit in seconds
		StateManager.set('seconds', value % 60);
		StateManager.set('minutes', Math.floor(value / 60));

		if (typeof resetTimeText === 'function') {
			resetTimeText();
		}
	}

	/**
	 * Handle word scrolling mode toggle
	 */
	function handleWordScrollingModeToggle() {
		const wordScrollingMode = !StateManager.get('wordScrollingMode');
		StateManager.set('wordScrollingMode', wordScrollingMode);
		StorageService.set('wordScrollingMode', wordScrollingMode);

		toggleWordScrollingModeUI();

		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle punctuation mode toggle
	 */
	function handlePunctuationModeToggle() {
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
	function handleShowCheatsheetToggle() {
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
	function handlePlaySoundOnClickToggle() {
		const playSoundOnClick = !StateManager.get('playSoundOnClick');
		StateManager.set('playSoundOnClick', playSoundOnClick);
		StorageService.set('playSoundOnClick', playSoundOnClick);
	}

	/**
	 * Handle play sound on error toggle
	 */
	function handlePlaySoundOnErrorToggle() {
		const playSoundOnError = !StateManager.get('playSoundOnError');
		StateManager.set('playSoundOnError', playSoundOnError);
		StorageService.set('playSoundOnError', playSoundOnError);
	}

	/**
	 * Handle layout change
	 * @param {Event} e - Change event
	 */
	function handleLayoutChange(e) {
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
	function handleKeyboardChange(e) {
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
	function handleMappingToggle() {
		const keyRemapping = StorageService.get('keyRemapping') === 'true' ? 'false' : 'true';
		StorageService.set('keyRemapping', keyRemapping);

		if (elements.mappingStatusText) {
			elements.mappingStatusText.innerText = keyRemapping === 'true' ? 'on' : 'off';
		}

		// Focus back to input
		if (StateManager && elements.input) {
			const input = StateManager.getElement ? StateManager.getElement('input') : document.querySelector('#userInput');
			if (input) {
				input.focus();
			}
		}
	}

	/**
	 * Open preference menu
	 */
	function openMenu() {
		if (elements.preferenceMenu) {
			elements.preferenceMenu.style.display = 'block';
			elements.preferenceMenu.disabled = false;
			StorageService.set('preferenceMenu', 'open');
			preferenceMenuOpen = true;

			// Hide and disable preference button, show and enable close button when menu is open
			if (elements.preferenceButton) {
				elements.preferenceButton.style.display = 'none';
				elements.preferenceButton.disabled = true;
			}
			if (elements.closePreferenceButton) {
				elements.closePreferenceButton.style.display = 'block';
				elements.closePreferenceButton.disabled = false;
			}
		}
	}

	/**
	 * Close preference menu
	 */
	function closeMenu() {
		if (elements.preferenceMenu) {
			elements.preferenceMenu.style.display = 'none';
			elements.preferenceMenu.disabled = true;
			StorageService.removeItem('preferenceMenu');
			preferenceMenuOpen = false;

			// Show and enable preference button, hide and disable close button when menu is closed
			if (elements.preferenceButton) {
				elements.preferenceButton.style.display = 'block';
				elements.preferenceButton.disabled = false;
			}
			if (elements.closePreferenceButton) {
				elements.closePreferenceButton.style.display = 'none';
				elements.closePreferenceButton.disabled = true;
			}
		}
	}

	/**
	 * Switch to word limit mode
	 */
	function switchToWordLimitMode() {
		StateManager.set('timeLimitMode', false);
		StorageService.set('timeLimitMode', false);

		StateManager.set('seconds', 0);
		StateManager.set('minutes', 0);

		if (elements.scoreText && elements.scoreText.style) {
			elements.scoreText.style.display = 'flex';
		}

		toggleTimeLimitModeUI();

		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Toggle full sentence mode UI
	 */
	function toggleFullSentenceModeUI() {
		if (elements.fullSentenceModeLevelButton) {
			elements.fullSentenceModeLevelButton.classList.toggle('visible');
		}
	}

	/**
	 * Toggle time limit mode UI
	 */
	function toggleTimeLimitModeUI() {
		const timeLimitMode = StateManager.get('timeLimitMode');
		const timeLimitSeconds = StateManager.get('timeLimitSeconds') || 60;
		const seconds = timeLimitSeconds % 60;
		const minutes = Math.floor(timeLimitSeconds / 60);

		StateManager.set('seconds', seconds);
		StateManager.set('minutes', minutes);

		if (elements.scoreText && elements.scoreText.style) {
			elements.scoreText.style.display = timeLimitMode ? 'none' : 'flex';
		}

		// Toggle input fields
		if (elements.timeLimitModeInput && elements.wordLimitModeInput) {
			if (timeLimitMode) {
				elements.timeLimitModeInput.classList.remove('noDisplay');
				elements.wordLimitModeInput.classList.add('noDisplay');
			} else {
				elements.timeLimitModeInput.classList.add('noDisplay');
				elements.wordLimitModeInput.classList.remove('noDisplay');
			}
		}

		// Update button states to be mutually exclusive
		if (elements.timeLimitModeButton && elements.wordLimitModeButton) {
			elements.timeLimitModeButton.checked = timeLimitMode;
			elements.wordLimitModeButton.checked = !timeLimitMode;
		}
	}

	/**
	 * Toggle word scrolling mode UI
	 */
	function toggleWordScrollingModeUI() {
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
		return preferenceMenuOpen;
	}

	/**
	 * Get cached DOM elements
	 * @returns {Object} Cached elements
	 */
	function getElements() {
		return { ...elements };
	}

	/**
	 * Check if component is initialized
	 * @returns {boolean} Initialization status
	 */
	function isReady() {
		return isInitialized;
	}

	// Public API
	return {
		initialize,
		isMenuOpen,
		getElements,
		isReady,
		openMenu,
		toggleWordScrollingModeUI: toggleWordScrollingModeUI,
		toggleFullSentenceModeUI: toggleFullSentenceModeUI
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = PreferenceMenu;
} else if (typeof window !== 'undefined') {
	window.PreferenceMenu = PreferenceMenu;
}
