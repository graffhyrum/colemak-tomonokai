/**
 * Word Completer - Handle word completion and navigation logic
 * Extracted from TypingArea for focused completion handling
 * Uses revealing module pattern
 */

const WordCompleter = (function() {
	let visualFeedback;

	/**
	 * Initialize word completer with dependencies
	 * @param {Object} visualFeedback - Visual feedback instance
	 */
	function initialize(vf) {
		visualFeedback = vf;
	}

	/**
	 * Handle word completion based on key code
	 * @param {number} keyCode - Key code that triggered completion
	 * @returns {Object} Completion result
	 */
	function handleCompletion(keyCode) {
		// Only handle space and enter
		if (keyCode !== 13 && keyCode !== 32) {
			return { handled: false };
		}

		// Check if completion is correct using global validation
		const isCorrect = ValidationService ? ValidationService.checkAnswer() : false;

		if (isCorrect) {
			handleCorrectCompletion();
			return { handled: true, correct: true };
		} else {
			handleIncorrectCompletion();
			return { handled: true, correct: false };
		}
	}

	/**
	 * Handle correct word completion
	 */
	function handleCorrectCompletion() {
		if (!StateManager) return;

		// Reset input color
		if (visualFeedback) {
			visualFeedback.updateInputColor('black');
		}

		// Update answer tracking
		const answerWordArray = StateManager.get('answerWordArray') || [];
		answerWordArray.shift();
		StateManager.set('answerWordArray', answerWordArray);

		// Check if lazy loading is needed (time limit mode only)
		if (typeof WordManager !== 'undefined' && WordManager.checkAndLoadWords) {
			WordManager.checkAndLoadWords();
		}

		// Update answerWordArray reference after potential lazy loading
		const updatedAnswerWordArray = StateManager.get('answerWordArray') || [];

		// Set new correct answer
		const newCorrectAnswer = updatedAnswerWordArray[0] || '';
		StateManager.set('correctAnswer', newCorrectAnswer);

		// Update global variable for backward compatibility with app.js
		if (typeof window !== 'undefined') {
			window.correctAnswer = newCorrectAnswer;
		}

		// Navigate after completion
		navigateAfterCompletion();

		// Update score
		updateScore();
	}

	/**
	 * Handle incorrect word completion
	 */
	function handleIncorrectCompletion() {
		if (!StateManager) return;

		// Add space to input for incorrect completion
		const input = document.querySelector('#userInput');
		if (input) {
			input.value += ' ';
		}

		// Increment letter index
		StateManager.set('letterIndex', StateManager.get('letterIndex') + 1);
	}

	/**
	 * Navigate after word completion (handle scrolling/paragraph modes)
	 */
	function navigateAfterCompletion() {
		if (!StateManager) return;

		const currentLevel = StateManager.get('currentLevel');
		const wordIndex = StateManager.get('wordIndex');
		const prompt = document.querySelector('.prompt');
		const answerWordArray = StateManager.get('answerWordArray') || [];

		// Check if we need to add a new line
		const needsNewLine = (!prompt || !prompt.children || !prompt.children[0] ||
			prompt.children[0].children.length - 1 === 0 ||
			wordIndex >= prompt.children[0].children.length - 1);

		if (needsNewLine) {
			StateManager.set('lineIndex', StateManager.get('lineIndex') + 1);

			// Add new line if available
			if (typeof addLineToPrompt === 'function') {
				addLineToPrompt();
			}

			// Handle paragraph mode line removal
			if (!StateManager.get('wordScrollingMode') && prompt && prompt.children && prompt.children[0]) {
				prompt.removeChild(prompt.children[0]);
				StateManager.set('wordIndex', -1);
			}
		}

		// Handle scrolling vs paragraph modes
		if (StateManager.get('wordScrollingMode')) {
			StateManager.set('deleteLatestWord', true);

			if (visualFeedback) {
				visualFeedback.enableSmoothScrolling();
			}

			// Update scroll offset
			const promptOffset = StateManager.get('promptOffset') || 0;
			if (prompt && prompt.children && prompt.children[0] && prompt.children[0].firstChild) {
				const newOffset = promptOffset + prompt.children[0].firstChild.offsetWidth;
				StateManager.set('promptOffset', newOffset);

				if (visualFeedback) {
					visualFeedback.updateScrollOffset(newOffset);
				}
			}

			// Fade completed word
			if (visualFeedback) {
				visualFeedback.fadeCompletedWord(StateManager.get('wordIndex'));
			}

			// Increment word index for word scrolling mode
			StateManager.set('wordIndex', StateManager.get('wordIndex') + 1);
		} else {
			// Paragraph mode - increment word index
			StateManager.set('wordIndex', StateManager.get('wordIndex') + 1);
		}
	}

	/**
	 * Update score after correct completion
	 */
	function updateScore() {
		if (!StateManager || !visualFeedback) return;

		const score = StateManager.get('score') + 1;
		const scoreMax = StateManager.get('scoreMax');

		StateManager.set('score', score);
		visualFeedback.updateScoreDisplay(score, scoreMax);
	}

	/**
	 * Check if game should end after completion
	 * @returns {boolean} Whether game should end
	 */
	function shouldEndGame() {
		if (!StateManager) return false;

		const score = StateManager.get('score');
		const scoreMax = StateManager.get('scoreMax');

		return score >= scoreMax;
	}



	// Public API
	return {
		initialize,
		handleCompletion,
		shouldEndGame
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = WordCompleter;
} else if (typeof window !== 'undefined') {
	window.WordCompleter = WordCompleter;
}
