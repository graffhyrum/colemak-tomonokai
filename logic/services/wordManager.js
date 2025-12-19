/**
 * Word Manager - Handles lazy loading of words for time limit mode
 * Prevents word exhaustion by monitoring answerWordArray and adding words proactively
 * Uses revealing module pattern
 */

const WordManager = (function() {
	// Configuration
	const LAZY_LOAD_CHUNK_SIZE = 20; // Fixed amount to load each time
	let initialWordCount = 0; // Track initial word count for threshold calculation

	/**
	 * Set the initial word count for threshold calculations
	 * @param {number} wordCount - Number of words loaded initially
	 */
	function setInitialWordCount(wordCount) {
		initialWordCount = Math.max(0, wordCount);
	}

	/**
	 * Calculate dynamic lazy loading threshold based on initial load
	 * @returns {number} Minimum words to keep in buffer
	 */
	function getLazyLoadThreshold() {
		if (!StateManager) return 20; // Fallback

		// Use initial word count if available, otherwise estimate
		const timeLimitSeconds = StateManager.get('timeLimitSeconds') || 60;
		const estimatedInitialLoad = timeLimitSeconds * 3; // 3 words per second
		const initialLoad = initialWordCount > 0 ? initialWordCount : estimatedInitialLoad;

		return Math.max(10, Math.floor(initialLoad / 3));
	}

	/**
	 * Check if lazy loading is needed and trigger it if appropriate
	 * Called after each word completion in time limit mode
	 */
	function checkAndLoadWords() {
		// Only load lazily in time limit mode
		if (!StateManager || !StateManager.get('timeLimitMode')) {
			return;
		}

		const answerWordArray = StateManager.get('answerWordArray') || [];
		const threshold = getLazyLoadThreshold();

		// If we have fewer than threshold words remaining, load more
		if (answerWordArray.length < threshold) {
			loadMoreWords(LAZY_LOAD_CHUNK_SIZE);
		}
	}

	/**
	 * Load additional words into the answerWordArray
	 * Adds a fixed number of words to prevent word exhaustion
	 * @param {number} wordCount - Number of words to load (default: LAZY_LOAD_CHUNK_SIZE)
	 */
	function loadMoreWords(wordCount = LAZY_LOAD_CHUNK_SIZE) {
		if (!StateManager) {
			console.warn('WordManager: Cannot load words - StateManager not available');
			return;
		}

		try {
			// Validate word count
			const wordsToLoad = Math.max(1, Math.floor(wordCount) || LAZY_LOAD_CHUNK_SIZE);

			// Use PromptService to add words to the pool (lazy loading)
			if (typeof PromptService !== 'undefined' && PromptService.addWordsToPool) {
				PromptService.addWordsToPool(wordsToLoad);
			} else {
				console.warn('WordManager: PromptService not available, cannot load words');
			}

		} catch (error) {
			console.error('WordManager: Error loading words:', error);
		}
	}

	/**
	 * Get current word count statistics
	 * @returns {Object} Statistics about word loading
	 */
	function getStats() {
		if (!StateManager) return { error: 'StateManager not available' };

		const answerWordArray = StateManager.get('answerWordArray') || [];
		const timeLimitMode = StateManager.get('timeLimitMode');

		const threshold = timeLimitMode ? getLazyLoadThreshold() : 0;

		return {
			wordCount: answerWordArray.length,
			threshold: threshold,
			needsLoading: timeLimitMode && answerWordArray.length < threshold,
			timeLimitMode: timeLimitMode,
			timeLimitSeconds: StateManager.get('timeLimitSeconds')
		};
	}

	/**
	 * Force load words regardless of threshold (for testing/debugging)
	 * @param {number} wordCount - Number of words to load
	 */
	function forceLoadWords(wordCount = 20) {
		if (!StateManager || !StateManager.get('timeLimitMode')) {
			console.warn('WordManager: Force loading only available in time limit mode');
			return;
		}

		try {
			const newLine = generateLine(wordCount);
			const newWords = newLine.split(' ').filter(word => word.length > 0);

			const answerWordArray = StateManager.get('answerWordArray') || [];
			const updatedArray = answerWordArray.concat(newWords);

			StateManager.set('answerWordArray', updatedArray);

			const currentAnswerString = StateManager.get('answerString') || '';
			StateManager.set('answerString', currentAnswerString + newLine + ' ');

			console.log(`WordManager: Force loaded ${newWords.length} words`);
		} catch (error) {
			console.error('WordManager: Error force loading words:', error);
		}
	}

	// Public API
	return {
		checkAndLoadWords,
		loadMoreWords,
		getStats,
		forceLoadWords,
		setInitialWordCount
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = WordManager;
} else if (typeof window !== 'undefined') {
	window.WordManager = WordManager;
}
