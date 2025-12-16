/**
 * TypingArea - Main orchestrator for typing functionality
 * Refactored into modular components while maintaining backward compatibility
 * Uses revealing module pattern
 */

const TypingArea = (function() {
	// Module instances
	const modules = {};

	/**
	 * Initialize all typing area modules
	 * @param {Object} domElements - Pre-cached DOM elements (optional)
	 * @returns {boolean} Success status
	 */
	function initialize(domElements = {}) {
		try {
			// Initialize core modules (no dependencies)
			modules.elementManager = ElementManager;
			modules.keyMapper = KeyMapper;
			modules.scoreCalculator = ScoreCalculator;
			modules.soundController = SoundController;

			// Initialize element manager first (others depend on it)
			const elementsReady = modules.elementManager.initialize(domElements);
			if (!elementsReady) {
				console.error('TypingArea: Failed to initialize element manager');
				return false;
			}

			// Initialize visual feedback (depends on element manager)
			modules.visualFeedback = VisualFeedback;
			modules.visualFeedback.initialize(modules.elementManager);

			// Initialize input handler (depends on element manager and key mapper)
			modules.inputHandler = InputHandler;
			modules.inputHandler.initialize(modules.elementManager, modules.keyMapper);

			// Initialize accuracy checker (depends on visual feedback)
			modules.accuracyChecker = AccuracyChecker;
			modules.accuracyChecker.initialize(modules.visualFeedback);

			// Initialize word completer (depends on visual feedback)
			modules.wordCompleter = WordCompleter;
			modules.wordCompleter.initialize(modules.visualFeedback);

			// Initialize game controller (depends on element manager and score calculator)
			modules.gameController = GameController;
			modules.gameController.initialize(modules.elementManager, modules.scoreCalculator);

			return true;
		} catch (error) {
			console.error('Error initializing TypingArea:', error);
			return false;
		}
	}

	/**
	 * Handle input events (main entry point for keyboard input)
	 * @param {Event} event - Keyboard event
	 */
	function handleInput(event) {
		if (!modules.inputHandler) return;

		// Process the key event
		const processedEvent = modules.inputHandler.handleKeydown(event);

		// Route based on event type
		switch (processedEvent.type) {
			case 'special':
				_handleSpecialKey(processedEvent.keyCode);
				break;

			case 'reset':
				_handleResetKey(processedEvent.keyCode);
				break;

			case 'word_completion':
				_handleWordCompletion(processedEvent.keyCode);
				break;

			case 'character':
				_handleCharacterInput(processedEvent);
				break;

			case 'unhandled':
			default:
				// Ignore unhandled keys
				break;
		}
	}

	/**
	 * Handle special keys (currently no actions)
	 * @param {number} keyCode - Key code
	 */
	function _handleSpecialKey(keyCode) {
		// Currently no special actions needed
		// Placeholder for future features
	}

	/**
	 * Handle reset keys (TAB, ESC)
	 * @param {number} keyCode - Key code
	 */
	function _handleResetKey(keyCode) {
		// F5 reload
		if (keyCode === 116) {
			window.location.reload();
			return;
		}

		// Other reset keys - delegate to global reset function
		if (typeof reset === 'function') {
			reset();
		}
	}

	/**
	 * Handle word completion (space, enter)
	 * @param {number} keyCode - Key code
	 */
	function _handleWordCompletion(keyCode) {
		if (!modules.wordCompleter || !StateManager) return;

		// Check if game is active
		if (!StateManager.get('gameOn')) return;

		// Handle completion
		const result = modules.wordCompleter.handleCompletion(keyCode);

		if (result.handled) {
			// Clear input and reset letter index
			modules.inputHandler.clearInput();
			StateManager.set('letterIndex', 0);

			// Check if game should end
			if (modules.wordCompleter.shouldEndGame()) {
				modules.gameController.endGame();
			}
		}
	}

	/**
	 * Handle character input
	 * @param {Object} processedEvent - Processed event data
	 */
	function _handleCharacterInput(processedEvent) {
		if (!modules.accuracyChecker || !modules.soundController || !StateManager) return;

		// Check if game is active
		if (!StateManager.get('gameOn')) {
			// Start game on first input
			modules.gameController.startGame();
		}

		// Update input value
		const currentInput = modules.inputHandler.getInputValue() + processedEvent.character;
		modules.inputHandler.setInputValue(currentInput);

		// Increment letter index
		StateManager.set('letterIndex', StateManager.get('letterIndex') + 1);

		// Check accuracy
		const correctAnswer = StateManager.get('correctAnswer') || '';
		const letterIndex = StateManager.get('letterIndex') - 1;
		const expectedChar = correctAnswer[letterIndex];

		const isCorrect = modules.accuracyChecker.checkAccuracy(
			currentInput[letterIndex],
			expectedChar,
			StateManager.get('letterIndex')
		);

		// Play appropriate sound
		if (isCorrect) {
			modules.soundController.playClick();
		} else {
			modules.soundController.playError();
		}

		// Handle ignore error mode
		if (!isCorrect && StateManager.get('requireBackspaceCorrection') === false) {
			const isStillCorrect = ValidationService ?
				ValidationService.checkAnswerToIndex(currentInput) : false;

			if (!isStillCorrect) {
				StateManager.set('letterIndex', StateManager.get('letterIndex') - 1);
				modules.inputHandler.setInputValue(currentInput.slice(0, -1));

				if (StateManager.get('letterIndex') < 0) {
					StateManager.set('letterIndex', 0);
				}
			}
		}

		// Check for last word completion without space
		const timeLimitMode = StateManager.get('timeLimitMode');
		const score = StateManager.get('score');
		const scoreMax = StateManager.get('scoreMax');

		if (!timeLimitMode && score === scoreMax - 1) {
			const isComplete = ValidationService ? ValidationService.checkAnswer(currentInput) : false;
			if (isComplete && StateManager.get('gameOn')) {
				modules.gameController.endGame();
			}
		}
	}

	// Public API (maintains exact same interface as original)
	return {
		initialize,
		handleInput,
		focus: () => modules.inputHandler && modules.inputHandler.focus(),
		getInputValue: () => modules.inputHandler ? modules.inputHandler.getInputValue() : '',
		setInputValue: (val) => modules.inputHandler && modules.inputHandler.setInputValue(val),
		clearInput: () => modules.inputHandler && modules.inputHandler.clearInput(),
		isReady: () => modules.elementManager ? modules.elementManager.isReady() : false,
		getElements: () => modules.elementManager ? modules.elementManager.getAll() : {},
		reset: () => modules.gameController && modules.gameController.resetGameState()
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = TypingArea;
} else if (typeof window !== 'undefined') {
	window.TypingArea = TypingArea;
}