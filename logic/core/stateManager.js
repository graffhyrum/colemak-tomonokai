/**
 * State Manager - Centralized application state
 * Replaces global variables with a managed state object
 * Uses revealing module pattern as requested
 */

const StateManager = (function() {
	// Private state object
	let _state = {
		// Game state
		gameOn: false,
		score: -1,
		scoreMax: 50,
		correct: 0,
		errors: 0,
		letterIndex: 0,
		currentLevel: 1,
		correctAnswer: '',
		
		// Timing state
		seconds: 0,
		minutes: 0,
		
		// Text and prompts
		answerString: '',
		answerWordArray: [],
		answerLetterArray: [],
		promptOffset: 0,
		deleteFirstLine: false,
		deleteLatestWord: false,
		sentenceStartIndex: -1,
		sentenceEndIndex: 0,
		lineIndex: 0,
		wordIndex: 0,
		idCount: 0,
		
		// Layout and keyboard state
		currentLayout: 'colemak',
		currentKeyboard: 'ansi',
		keyboardMap: null,
		letterDictionary: null,
		shiftDown: false,
		
		// Mode settings
		fullSentenceMode: false,
		fullSentenceModeEnabled: false,
		timeLimitMode: false,
		wordScrollingMode: true,
		onlyLower: true,
		requireBackspaceCorrection: true,
		showCheatsheet: true,
		playSoundOnClick: false,
		playSoundOnError: false,
		
		// Text generation
		lineLength: 23,
		requiredLetters: '',
		punctuation: '',
		
		// Custom layout state
		initialCustomKeyboardState: '',
		initialCustomLevelsState: '',
		
		// DOM element cache
		domElements: {}
	};

	// Private state change listeners
	let _listeners = {};

	/**
	 * Get state value
	 * @param {string} key - State key to retrieve
	 * @returns {*} State value
	 */
	function get(key) {
		return _state[key];
	}

	/**
	 * Set state value and trigger listeners
	 * @param {string} key - State key to update
	 * @param {*} value - New value
	 */
	function set(key, value) {
		const oldValue = _state[key];
		_state[key] = value;
		
		// Notify listeners of change
		if (_listeners[key]) {
			_listeners[key].forEach(callback => {
				try {
					callback(value, oldValue, key);
				} catch (error) {
					console.error(`Error in state listener for ${key}:`, error);
				}
			});
		}
	}

	/**
	 * Get entire state object (read-only)
	 * @returns {Object} Current state copy
	 */
	function getAll() {
		return { ..._state };
	}

	/**
	 * Update multiple state properties at once
	 * @param {Object} updates - Object with key-value pairs to update
	 */
	function update(updates) {
		Object.keys(updates).forEach(key => {
			set(key, updates[key]);
		});
	}

	/**
	 * Subscribe to state changes
	 * @param {string} key - State key to watch
	 * @param {function} callback - Function to call when state changes
	 * @returns {function} Unsubscribe function
	 */
	function subscribe(key, callback) {
		if (!_listeners[key]) {
			_listeners[key] = [];
		}
		_listeners[key].push(callback);
		
		// Return unsubscribe function
		return () => {
			_listeners[key] = _listeners[key].filter(cb => cb !== callback);
		};
	}

	/**
	 * Initialize state from localStorage
	 */
	function loadFromStorage() {
		try {
			// Load saved preferences
			const savedState = {
				scoreMax: localStorage.getItem('scoreMax') || 50,
				currentLevel: localStorage.getItem('currentLevel') || 1,
				currentLayout: localStorage.getItem('currentLayout') || 'colemak',
				currentKeyboard: localStorage.getItem('currentKeyboard') || 'ansi',
				onlyLower: localStorage.getItem('onlyLower') !== 'false',
				fullSentenceModeEnabled: localStorage.getItem('fullSentenceModeEnabled') === 'true',
				requireBackspaceCorrection: localStorage.getItem('requireBackspaceCorrection') !== 'false',
				timeLimitMode: localStorage.getItem('timeLimitMode') === 'true',
				wordScrollingMode: localStorage.getItem('wordScrollingMode') !== 'false',
				showCheatsheet: localStorage.getItem('showCheatsheet') !== 'false',
				playSoundOnClick: localStorage.getItem('playSoundOnClick') === 'true',
				playSoundOnError: localStorage.getItem('playSoundOnError') === 'true',
				punctuation: localStorage.getItem('punctuation') || ''
			};

			// Merge with existing state
			update(savedState);
		} catch (error) {
			console.error('Error loading state from localStorage:', error);
		}
	}

	/**
	 * Save state to localStorage
	 * @param {string} key - Specific key to save (optional, saves all if not provided)
	 */
	function saveToStorage(key) {
		try {
			if (key && _state.hasOwnProperty(key)) {
				localStorage.setItem(key, _state[key]);
			} else {
				// Save all persistent state
				const persistentKeys = [
					'scoreMax', 'currentLevel', 'currentLayout', 'currentKeyboard',
					'onlyLower', 'fullSentenceModeEnabled', 'requireBackspaceCorrection',
					'timeLimitMode', 'wordScrollingMode', 'showCheatsheet',
					'playSoundOnClick', 'playSoundOnError', 'punctuation'
				];
				
				persistentKeys.forEach(persistentKey => {
					if (_state[persistentKey] !== null && _state[persistentKey] !== undefined) {
						localStorage.setItem(persistentKey, _state[persistentKey]);
					}
				});
			}
		} catch (error) {
			console.error('Error saving state to localStorage:', error);
		}
	}

	/**
	 * Reset game state (preserves preferences)
	 */
	function resetGameState() {
		const gameKeys = [
			'gameOn', 'score', 'correct', 'errors', 'letterIndex', 
			'answerString', 'answerWordArray', 'answerLetterArray',
			'promptOffset', 'deleteFirstLine', 'deleteLatestWord',
			'sentenceStartIndex', 'sentenceEndIndex', 'lineIndex', 'wordIndex',
			'idCount', 'requiredLetters', 'correctAnswer'
		];
		
		const resetValues = {
			gameOn: false,
			score: -1,
			correct: 0,
			errors: 0,
			letterIndex: 0,
			answerString: '',
			answerWordArray: [],
			answerLetterArray: [],
			promptOffset: 0,
			deleteFirstLine: false,
			deleteLatestWord: false,
			sentenceStartIndex: -1,
			sentenceEndIndex: 0,
			lineIndex: 0,
			wordIndex: 0,
			idCount: 0,
			requiredLetters: '',
			correctAnswer: ''
		};
		
		gameKeys.forEach(key => {
			if (resetValues.hasOwnProperty(key)) {
				set(key, resetValues[key]);
			}
		});
	}

	/**
	 * Cache DOM elements for performance
	 * @param {string} name - Element identifier
	 * @param {Element} element - DOM element to cache
	 */
	function cacheElement(name, element) {
		_state.domElements[name] = element;
	}

	/**
	 * Get cached DOM element
	 * @param {string} name - Element identifier
	 * @returns {Element|null} Cached element or null
	 */
	function getElement(name) {
		return _state.domElements[name] || null;
	}

	// Initialize from localStorage on load
	loadFromStorage();

	// Public API
	return {
		get,
		set,
		getAll,
		update,
		subscribe,
		loadFromStorage,
		saveToStorage,
		resetGameState,
		cacheElement,
		getElement
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = StateManager;
} else if (typeof window !== 'undefined') {
	window.StateManager = StateManager;
}