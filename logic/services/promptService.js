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
		StateManager.set('answerWordArray', currentArray.concat(lineToAdd.split(" ")));
	}



	// Public API
	return {
		addLineToPrompt
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