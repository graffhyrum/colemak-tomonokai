/**
 * Prompt Service - DOM manipulation for prompt text
 * Extracted from app.js to separate concerns
 * Uses revealing module pattern
 */

const PromptService = (function() {
	let idCount = 0;

	/**
	 * Add a new line to the prompt
	 */
	function addLineToPrompt() {
		const scoreMax = StateManager.get('scoreMax');
		const score = StateManager.get('score');
		const answerWordArray = StateManager.get('answerWordArray');

		const lineToAdd = generateLine(scoreMax - score - answerWordArray.length - 1);

		// Update answer string
		const currentAnswerString = StateManager.get('answerString') || '';
		StateManager.set('answerString', currentAnswerString + lineToAdd);

		// Update DOM
		const prompt = document.querySelector('.prompt');
		if (prompt) {
			prompt.innerHTML += convertLineToHTML(lineToAdd);
		}

		// Update answer word array
		const currentArray = StateManager.get('answerWordArray') || [];
		const newWords = lineToAdd.split(" ");
		const updatedArray = currentArray.concat(newWords);
		StateManager.set('answerWordArray', updatedArray);

		// Update global variable for backward compatibility with app.js
		if (typeof window !== 'undefined' && window.answerWordArray) {
			window.answerWordArray = window.answerWordArray.concat(newWords);
		}
	}

	/**
	 * Add words to the word pool without visual changes (for lazy loading)
	 * @param {number} wordCount - Number of words to add
	 */
	function addWordsToPool(wordCount = 20) {
		try {
			// Validate word count
			const wordsToGenerate = Math.max(1, Math.floor(wordCount) || 20);

			// Get words from WordPool
			if (typeof WordPool === 'undefined') {
				throw new Error('WordPool service not available');
			}

			const newWords = WordPool.getRandomWords(wordsToGenerate);
			const lineToAdd = newWords.join(' ');

			// Update answer string
			const currentAnswerString = StateManager.get('answerString') || '';
			StateManager.set('answerString', currentAnswerString + lineToAdd + ' ');

			// Update answer word array
			const currentArray = StateManager.get('answerWordArray') || [];
			const updatedArray = currentArray.concat(newWords);
			StateManager.set('answerWordArray', updatedArray);

			// Update global variable for backward compatibility with app.js
			if (typeof window !== 'undefined' && window.answerWordArray) {
				window.answerWordArray = window.answerWordArray.concat(newWords);
			}
		} catch (error) {
			// Crash as requested - no fallbacks
			throw new Error(`Failed to add words to pool: ${error.message}`);
		}
	}



	// Public API
	return {
		addLineToPrompt,
		addWordsToPool
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = PromptService;
} else if (typeof window !== 'undefined') {
	// Make globally available for backward compatibility
	window.addLineToPrompt = PromptService.addLineToPrompt;
	window.PromptService = PromptService;
}