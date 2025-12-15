/**
 * Typing Area Component - Handle input, validation, and scoring
 * Extracted from app.js to separate typing logic
 * Uses revealing module pattern
 */

const TypingArea = (function() {
	// Private state
	let _elements = {};
	let _isInitialized = false;
	let _specialKeyCodes = [
		27, 9, 20, 17, 18, 93, 36, 37, 38, 39, 40, 144, 36, 8, 16, 30, 32, 13, 91, 92,
		224, 225,
	];

	/**
	 * Initialize typing area component
	 * @param {Object} domElements - DOM elements to cache
	 */
	function initialize(domElements = {}) {
		if (_isInitialized) return false;

		try {
			// Cache required DOM elements
			_elements = {
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

			if (!_elements.input) {
				console.error('TypingArea: Required input element not found');
				return false;
			}

			// Set up input event listeners
			_setupInputListeners();
			_isInitialized = true;
			return true;
		} catch (error) {
			console.error('Error initializing TypingArea:', error);
			return false;
		}
	}

	/**
	 * Set up input event listeners
	 */
	function _setupInputListeners() {
		// Start timer on any input
		_elements.input.addEventListener('keydown', _handleGameStart);

		// Handle typing input
		_elements.input.addEventListener('keydown', _handleInput);
	}

	/**
	 * Handle game start on first keydown
	 * @param {Event} e - Keyboard event
	 */
	function _handleGameStart(e) {
		if (StateManager && StateManager.get) {
			StateManager.set('gameOn', true);
		}
	}

	/**
	 * Handle keyboard input
	 * @param {Event} e - Keyboard event
	 */
	function _handleInput(e) {
		e.preventDefault();

		// Handle special key codes first
		if (_handleSpecialKeys(e)) return;

		// Handle reset keys
		if (_handleResetKeys(e)) return;

		// Handle space and enter (word completion)
		if (_handleWordCompletion(e)) return;

		// Handle regular typing
		_handleRegularTyping(e);
	}

	/**
	 * Handle special keys (ESC, TAB, etc.)
	 * @param {Event} e - Keyboard event
	 * @returns {boolean} Whether key was handled
	 */
	function _handleSpecialKeys(e) {
		// Currently no special actions needed, but placeholder for future features
		return false;
	}

	/**
	 * Handle reset keys (TAB, ESC)
	 * @param {Event} e - Keyboard event
	 * @returns {boolean} Whether reset was triggered
	 */
	function _handleResetKeys(e) {
		if (e.keyCode === 9 || e.keyCode === 27) {
			if (_elements.resetButton && typeof reset === 'function') {
				reset();
			}
			return true;
		}

		// F5 reload prevention
		if (e.keyCode === 116) {
			window.location.reload();
			return true;
		}

		return false;
	}

	/**
	 * Handle word completion (space, enter)
	 * @param {Event} e - Keyboard event
	 * @returns {boolean} Whether completion was handled
	 */
	function _handleWordCompletion(e) {
		if (e.keyCode === 13 || e.keyCode === 32) {
			if (StateManager && StateManager.get && checkAnswer()) {
				if (StateManager.get('gameOn')) {
					e.preventDefault();
					_handleCorrectWord();
					_updateScoreText();
					
					// Check for game end
					if (StateManager.get('score') >= StateManager.get('scoreMax')) {
						_handleGameEnd();
					}
				}

				// Clear input and reset for next word
				_elements.input.value = '';
				if (StateManager) {
					StateManager.set('letterIndex', 0);
				}
			} else {
				// Incorrect word completion
				_elements.input.value += ' ';
				if (StateManager) {
					StateManager.set('letterIndex', StateManager.get('letterIndex') + 1);
				}
			}
			return true;
		}
		return false;
	}

	/**
	 * Handle regular character typing
	 * @param {Event} e - Keyboard event
	 */
	function _handleRegularTyping(e) {
		const char = e.code;
		const shouldMapKey = StorageService && StorageService.get ? 
			StorageService.get('keyRemapping') === 'true' : false;

		let inputChar;
		if (shouldMapKey && LayoutService && LayoutService.getKeyboardMap) {
			const keyboardMap = LayoutService.getKeyboardMap();
			if (char in keyboardMap) {
				if (!e.shiftKey) {
					inputChar = keyboardMap[char];
				} else {
					const shiftLayer = LayoutService.getShiftLayer ? LayoutService.getShiftLayer() : null;
					if (shiftLayer === 'default') {
						inputChar = keyboardMap[char].toUpperCase();
					} else {
						inputChar = shiftLayer[char];
					}
				}
			}
		} else {
			// Direct input without mapping
			if (!_specialKeyCodes.includes(e.keyCode) && e.key !== 'Process') {
				inputChar = e.key;
			}
		}

		// Add character to input if valid
		if (inputChar !== undefined) {
			_elements.input.value += inputChar;
		}

		// Handle backspace
		if (e.keyCode === 8) {
			_handleBackspace(e);
		} else {
			// Increment letter index for non-backspace
			if (StateManager) {
				StateManager.set('letterIndex', StateManager.get('letterIndex') + 1);
			}
		}

		// Check accuracy and provide feedback
		_handleAccuracyCheck(e);
	}

	/**
	 * Handle backspace key
	 * @param {Event} e - Keyboard event
	 */
	function _handleBackspace(e) {
		if (!e.ctrlKey) {
			_elements.input.value = _elements.input.value.substr(0, _elements.input.value.length - 1);
			if (StateManager) {
				StateManager.set('letterIndex', Math.max(0, StateManager.get('letterIndex') - 1));
			}
		} else {
			// Ctrl+backspace clears everything
			_elements.input.value = '';
			if (StateManager) {
				StateManager.set('letterIndex', 0);
			}
		}
	}

	/**
	 * Handle accuracy checking and visual feedback
	 * @param {Event} e - Keyboard event
	 */
	function _handleAccuracyCheck(e) {
		if (!StateManager || !checkAnswerToIndex) return;

		const isCorrect = checkAnswerToIndex();
		
		if (isCorrect) {
			_elements.input.style.color = 'black';
			
			if (e.keyCode === 8) {
				// Backspace feedback
				_playClickSound();
				_handleBackspaceFeedback(true);
			} else if (!_specialKeyCodes.includes(e.keyCode) || e.keyCode === 32) {
				_playClickSound();
				if (StateManager) {
					StateManager.set('correct', StateManager.get('correct') + 1);
				}
				_handleCorrectLetterFeedback();
			}
		} else {
			// Error feedback
			console.log('error');
			_elements.input.style.color = 'red';
			
			if (e.keyCode === 8) {
				_playClickSound();
				_handleBackspaceFeedback(false);
			} else if (!_specialKeyCodes.includes(e.keyCode) || e.keyCode === 32) {
				_playErrorSound();
				if (StateManager) {
					StateManager.set('errors', StateManager.get('errors') + 1);
				}
				_handleIncorrectLetterFeedback();
			}

			// Handle ignore error mode
			if (StateManager.get && StorageService.get && 
				!StateManager.get('requireBackspaceCorrection') && !checkAnswerToIndex()) {
				StateManager.set('letterIndex', StateManager.get('letterIndex') - 1);
				_elements.input.value = _elements.input.value.substr(0, _elements.input.value.length - 1);
				if (StateManager.get('letterIndex') < 0) {
					StateManager.set('letterIndex', 0);
				}
			}
		}

		// Check for last word completion without space
		if (!StateManager.get('timeLimitMode') && 
			StateManager.get('score') === StateManager.get('scoreMax') - 1 && 
			checkAnswer() && 
			StateManager.get('gameOn')) {
			_handleGameEnd();
		}
	}

	/**
	 * Handle correct word completion
	 */
	function _handleCorrectWord() {
		if (!StateManager) return;

		// Reset input color
		_elements.input.style.color = 'black';

		// Update answer tracking
		const answerWordArray = StateManager.get('answerWordArray') || [];
		answerWordArray.shift();
		StateManager.set('answerWordArray', answerWordArray);

		// Handle line/word navigation
		_handleNavigationAfterWord();
		
		// Update current word
		StateManager.set('correctAnswer', answerWordArray[0]);
	}

	/**
	 * Handle navigation after completing a word
	 */
	function _handleNavigationAfterWord() {
		if (!StateManager) return;

		const currentLevel = StateManager.get('currentLevel');
		const prompt = _elements.prompt;
		const answerWordArray = StateManager.get('answerWordArray') || [];

		// Check if we need to add a new line
		if ((!prompt.children[0].children.length - 1 === 0 || 
				StateManager.get('wordIndex') >= prompt.children[0].children.length - 1)) {
			StateManager.set('lineIndex', StateManager.get('lineIndex') + 1);

			// Add new line if not near end
			if (typeof addLineToPrompt === 'function') {
				addLineToPrompt();
			}

			// Remove line in paragraph mode
			if (!StateManager.get('wordScrollingMode')) {
				if (prompt.removeChild) {
					prompt.removeChild(prompt.children[0]);
				}
				StateManager.set('wordIndex', -1);
			}
		}

		// Handle scrolling vs paragraph modes
		if (StateManager.get('wordScrollingMode')) {
			StateManager.set('deleteLatestWord', true);
			if (prompt.classList && prompt.classList.add) {
				prompt.classList.add('smoothScroll');
			}
			
			// Update scroll offset
			const promptOffset = StateManager.get('promptOffset') || 0;
			if (prompt.children[0] && prompt.children[0].firstChild) {
				const newOffset = promptOffset + prompt.children[0].firstChild.offsetWidth;
				StateManager.set('promptOffset', newOffset);
				if (prompt.style) {
					prompt.style.left = `-${newOffset}px`;
				}
			}
			
			// Fade completed word
			if (prompt.children[0] && prompt.children[0].firstChild) {
				prompt.children[0].firstChild.style.opacity = 0;
			}
		} else {
			StateManager.set('wordIndex', StateManager.get('wordIndex') + 1);
		}
	}

	/**
	 * Handle game end
	 */
	function _handleGameEnd() {
		if (!StateManager) return;

		// Stop timer
		StateManager.set('gameOn', false);

		// Calculate and display results
		const wpm = _calculateWPM();
		const accuracy = _calculateAccuracy();

		// Update display
		if (_elements.accuracyText) {
			_elements.accuracyText.innerHTML = `Accuracy: ${accuracy}%`;
		}
		if (_elements.wpmText) {
			_elements.wpmText.innerHTML = `WPM: ${wpm}`;
		}

		// Show results
		if (_elements.testResults && _elements.testResults.classList) {
			_elements.testResults.classList.remove('transparent');
		}

		// Show reset button
		if (_elements.resetButton && _elements.resetButton.classList) {
			_elements.resetButton.classList.remove('noDisplay');
		}

		// Reset counters
		StateManager.set('correct', 0);
		StateManager.set('errors', 0);

		// Focus reset button
		if (_elements.resetButton && _elements.resetButton.focus) {
			_elements.resetButton.focus();
		}

		// Update score and clear input
		_updateScoreText();
		_elements.input.value = '';
		StateManager.set('letterIndex', 0);
	}

	/**
	 * Calculate WPM
	 * @returns {string} WPM value
	 */
	function _calculateWPM() {
		if (!StateManager) return '0.00';

		const correct = StateManager.get('correct') || 0;
		const errors = StateManager.get('errors') || 0;
		const minutes = StateManager.get('minutes') || 0;
		const seconds = StateManager.get('seconds') || 0;

		const totalKeystrokes = correct + errors;
		const totalMinutes = minutes + (seconds / 60);

		if (totalMinutes === 0) return '0.00';

		return ((totalKeystrokes / 5) / totalMinutes).toFixed(2);
	}

	/**
	 * Calculate accuracy
	 * @returns {string} Accuracy percentage
	 */
	function _calculateAccuracy() {
		if (!StateManager) return '0.00';

		const correct = StateManager.get('correct') || 0;
		const errors = StateManager.get('errors') || 0;

		const total = correct + errors;
		if (total === 0) return '100.00';

		return ((100 * correct) / total).toFixed(2);
	}

	/**
	 * Handle backspace visual feedback
	 * @param {boolean} isCorrectColor - Whether to apply correct color
	 */
	function _handleBackspaceFeedback(isCorrectColor) {
		const wordIndex = StateManager.get('wordIndex');
		const letterIndex = StateManager.get('letterIndex');
		const prompt = _elements.prompt;

		if (!prompt || !prompt.children || !prompt.children[0] || !prompt.children[0].children) return;

		if (isCorrectColor) {
			// Apply correct color
			if (e.ctrlKey) {
				// Ctrl+backspace - color all letters gray
				for (let i = 0; i < letterIndex; i++) {
					const letterElement = prompt.children[0].children[wordIndex].children[i];
					if (letterElement) {
						letterElement.style.color = 'gray';
					}
				}
				_elements.input.value = '';
				StateManager.set('letterIndex', 0);
			} else {
				// Single backspace - color current letter gray
				const letterElement = prompt.children[0].children[wordIndex].children[letterIndex];
				if (letterElement) {
					letterElement.style.color = 'gray';
				}
			}
		} else {
			// Error handling
			if (e.ctrlKey) {
				for (let i = 0; i < letterIndex; i++) {
					const letterElement = prompt.children[0].children[wordIndex].children[i];
					if (letterElement) {
						letterElement.style.color = 'gray';
					}
				}
				_elements.input.value = '';
				StateManager.set('letterIndex', 0);
			} else {
				const letterElement = prompt.children[0].children[wordIndex].children[letterIndex];
				if (letterElement) {
					letterElement.style.color = 'gray';
				}
			}
		}
	}

	/**
	 * Handle correct letter feedback
	 */
	function _handleCorrectLetterFeedback() {
		const letterIndex = StateManager.get('letterIndex') - 1;
		const wordIndex = StateManager.get('wordIndex');
		const prompt = _elements.prompt;

		if (!prompt || !prompt.children || !prompt.children[0] || !prompt.children[0].children) return;

		const letterElement = prompt.children[0].children[wordIndex].children[letterIndex];
		if (letterElement) {
			letterElement.style.color = 'green';
		}
	}

	/**
	 * Handle incorrect letter feedback
	 */
	function _handleIncorrectLetterFeedback() {
		const letterIndex = StateManager.get('letterIndex') - 1;
		const wordIndex = StateManager.get('wordIndex');
		const prompt = _elements.prompt;

		if (!prompt || !prompt.children || !prompt.children[0] || !prompt.children[0].children) return;

		const letterElement = prompt.children[0].children[wordIndex].children[letterIndex];
		if (letterElement) {
			letterElement.style.color = 'red';
		}
	}

	/**
	 * Play click sound
	 */
	function _playClickSound() {
		if (SoundService && SoundService.playClickSound) {
			SoundService.playClickSound(StateManager.get('playSoundOnClick'));
		}
	}

	/**
	 * Play error sound
	 */
	function _playErrorSound() {
		if (SoundService && SoundService.playErrorSound) {
			SoundService.playErrorSound(StateManager.get('playSoundOnError'));
		}
	}

	/**
	 * Update score text
	 */
	function _updateScoreText() {
		if (_elements.scoreText && StateManager) {
			const score = StateManager.get('score') + 1;
			const scoreMax = StateManager.get('scoreMax');
			_elements.scoreText.innerHTML = `${score}/${scoreMax}`;
			StateManager.set('score', score);
		}
	}

	/**
	 * Focus the input field
	 */
	function focus() {
		if (_elements.input && _elements.input.focus) {
			_elements.input.focus();
		}
	}

	/**
	 * Get current input value
	 * @returns {string} Current input text
	 */
	function getInputValue() {
		return _elements.input ? _elements.input.value : '';
	}

	/**
	 * Set input value
	 * @param {string} value - Value to set
	 */
	function setInputValue(value) {
		if (_elements.input) {
			_elements.input.value = value;
		}
	}

	/**
	 * Clear input field
	 */
	function clearInput() {
		if (_elements.input) {
			_elements.input.value = '';
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
		if (_elements.input) {
			_elements.input.value = '';
		}
		// Additional reset logic would be handled by parent component
	}

	// Public API
	return {
		initialize,
		handleInput: _handleInput,
		focus,
		getInputValue,
		setInputValue,
		clearInput,
		isReady,
		getElements,
		reset
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = TypingArea;
} else if (typeof window !== 'undefined') {
	window.TypingArea = TypingArea;
}