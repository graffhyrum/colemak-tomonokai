/**
 * Word Service - Handle word generation and filtering
 * Manages word lists, trie operations, and test set creation
 * Uses revealing module pattern
 */

const WordService = (function() {
	// Private state
	let wordLists = {
		lvl1: [],
		lvl2: [],
		lvl3: [],
		lvl4: [],
		lvl5: [],
		lvl6: [],
		lvl7: [],
	};
	let isInitialized = false;

	/**
	 * Initialize word service
	 */
	function initialize() {
		if (isInitialized) return;

		try {
			// Initialize if trie is available
			if (typeof generateList === 'function') {
				isInitialized = true;
			}
		} catch (error) {
			console.error('Error initializing WordService:', error);
		}
	}

	/**
	 * Check if word contains at least one letter from pattern
	 * @param {string} target - Word to check
	 * @param {Array<string>} pattern - Array of letters to check for
	 * @returns {boolean} Whether word contains any pattern letters
	 */
	function contains(target, pattern) {
		if (!target || !pattern) return false;

		return pattern.some(letter => target.includes(letter));
	}

	/**
	 * Check if word contains uppercase letters
	 * @param {string} word - Word to check
	 * @returns {boolean} Whether word contains uppercase letters
	 */
	function containsUpperCase(word) {
		if (!word) return false;

		const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		return [...word].some(letter => upperCase.includes(letter));
	}

	/**
	 * Generate a random letter jumble as fallback
	 * @param {string} levelLetters - Letters to use for jumble
	 * @param {number} maxLength - Maximum word length
	 * @returns {string} Random letter jumble
	 */
	function randomLetterJumble(levelLetters = 'abcdefghijklmnopqrstuvwxyz', maxLength = 5) {
		const randWordLength = Math.floor(Math.random() * maxLength) + 1;
		let jumble = '';

		for (let i = 0; i < randWordLength; i++) {
			const rand = Math.floor(Math.random() * levelLetters.length);
			jumble += levelLetters[rand];
		}

		return jumble;
	}

	/**
	 * Remove letters from required letters array
	 * @param {Array<string>} requiredLetters - Array to modify
	 * @param {string} word - Word with letters to remove
	 */
	function removeIncludedLetters(requiredLetters, word) {
		if (!requiredLetters || !word) return;

		[...word].forEach(letter => {
			const index = requiredLetters.indexOf(letter);
			if (index > -1) {
				requiredLetters.splice(index, 1);
			}
		});
	}

	/**
	 * Generate test sets for all levels
	 * @param {string} currentLayout - Current keyboard layout
	 * @param {string} punctuation - Punctuation to include
	 * @param {boolean} onlyLower - Whether to exclude uppercase words
	 */
	function createTestSets(currentLayout, punctuation = '', onlyLower = true) {
		if (!isInitialized) {
			console.warn('WordService not initialized, using fallback method');
			return createFallbackTestSets(currentLayout, punctuation, onlyLower);
		}

		try {
			const objKeys = Object.keys(wordLists);
			let includedLetters = punctuation;

			// For each level, add new letters to test set and create new list
			for (let i = 0; i < objKeys.length; i++) {
				let requiredLetters;
				let levelLetters = levelDictionaries[currentLayout][objKeys[i]];

				// Special handling for custom layout level 7
				if (currentLayout !== 'custom' || i !== 6) {
					requiredLetters = levelDictionaries[currentLayout][`lvl${i + 1}`] + punctuation;
					includedLetters += levelLetters;

					// Add uppercase letters if capital letters are allowed
					if (!onlyLower) {
						includedLetters += levelLetters.toUpperCase();
					}
				} else {
					requiredLetters = includedLetters;
				}

				wordLists[objKeys[i]] = [];

				// Generate list using trie if available, otherwise fallback
				if (typeof generateList === 'function') {
					wordLists[objKeys[i]] = generateList(includedLetters, requiredLetters);
				} else {
					wordLists[objKeys[i]] = generateFallbackList(includedLetters, requiredLetters, onlyLower);
				}
			}
		} catch (error) {
			console.error('Error creating test sets:', error);
			// Fallback to simple method
			createFallbackTestSets(currentLayout, punctuation, onlyLower);
		}
	}

	/**
	 * Fallback method for generating word lists without trie
	 * @param {string} lettersToInclude - Letters that can be used
	 * @param {string} requiredLetters - Letters that must be included
	 * @param {boolean} onlyLower - Whether to exclude uppercase words
	 * @returns {Array<string>} Generated word list
	 */
	function generateFallbackList(lettersToInclude, requiredLetters, onlyLower = true) {
		if (typeof masterList === 'undefined' || !masterList.length) {
				return [];
			}

			const lettersSet = new Set(lettersToInclude.split(''));
			const requiredSet = new Set(requiredLetters.split(''));

			return masterList.filter(word => {
				// Check if word has any required letters
				const hasRequired = [...word].some(letter => requiredSet.has(letter));

				// Check if word only uses allowed letters
				const usesOnlyAllowed = [...word].every(letter => lettersSet.has(letter));

				// Check uppercase constraint
				const passesUpperCheck = !onlyLower || !containsUpperCase(word);

				return hasRequired && usesOnlyAllowed && passesUpperCheck;
			});
		}

	/**
	 * Fallback method for creating test sets
	 * @param {string} currentLayout - Current keyboard layout
	 * @param {string} punctuation - Punctuation to include
	 * @param {boolean} onlyLower - Whether to exclude uppercase words
	 */
	function createFallbackTestSets(currentLayout, punctuation = '', onlyLower = true) {
			const objKeys = Object.keys(wordLists);
			let includedLetters = punctuation;

			for (let i = 0; i < objKeys.length; i++) {
				let requiredLetters;
				let levelLetters = levelDictionaries[currentLayout][objKeys[i]];

				if (currentLayout !== 'custom' || i !== 6) {
					requiredLetters = levelDictionaries[currentLayout][`lvl${i + 1}`] + punctuation;
					includedLetters += levelLetters;

					// Add uppercase letters if capital letters are allowed
					if (!onlyLower) {
						includedLetters += levelLetters.toUpperCase();
					}
				} else {
					requiredLetters = includedLetters;
				}

				wordLists[objKeys[i]] = generateFallbackList(includedLetters, requiredLetters, onlyLower);
			}
		}

	/**
	 * Generate a line of text for typing practice
	 * @param {number} maxWords - Maximum number of words
	 * @param {number} currentLevel - Current difficulty level
	 * @param {string} currentLayout - Current keyboard layout
	 * @param {boolean} fullSentenceMode - Whether to use sentence mode
	 * @param {boolean} onlyLower - Whether to exclude uppercase words
	 * @param {string} punctuation - Punctuation to include
	 * @returns {string} Generated text line
	 */
	function generateLine(maxWords, currentLevel, currentLayout, fullSentenceMode = false, onlyLower = true, punctuation = '') {
			if (fullSentenceMode) {
				return generateSentenceLine();
			}

			if (typeof wordLists !== 'undefined' && wordLists[`lvl${currentLevel}`].length > 0) {
				return generateWordLine(maxWords, currentLevel, onlyLower, punctuation);
			}

			// Fallback to letter jumble
			return generateLetterJumbleLine(currentLevel, currentLayout, maxWords);
		}

	/**
	 * Generate a line from sentences
	 * @returns {string} Sentence fragment
	 */
	function generateSentenceLine() {
			// This is a simplified version - the full implementation would track sentence state
			if (typeof sentence !== 'undefined') {
				const words = sentence.split(' ').slice(0, 10).join(' ');
				return words + ' ';
			}
			return 'the quick brown fox ';
		}

		/**
	 * Generate a line from word lists
	 * @param {number} maxWords - Maximum words
	 * @param {number} currentLevel - Level for word filtering
	 * @param {boolean} onlyLower - Exclude uppercase words
	 * @param {string} punctuation - Punctuation to include
	 * @returns {string} Generated word line
	 */
	function generateWordLine(maxWords, currentLevel, onlyLower, punctuation) {
			const words = wordLists[`lvl${currentLevel}`];
			if (!words || words.length === 0) {
				return generateLetterJumbleLine(currentLevel, currentLayout, maxWords);
			}

			const startingLetters = levelDictionaries[currentLayout][`lvl${currentLevel}`] + punctuation;
			const requiredLettersArray = startingLetters.split('');
			let str = '';
			let wordsCreated = 0;

			for (let i = 0; i < 23; i = i) { // lineLength
				if (wordsCreated >= maxWords) break;

				const rand = Math.floor(Math.random() * words.length);
				let wordToAdd = words[rand];

				// Simple filtering logic
				if (contains(wordToAdd, requiredLettersArray) &&
					(!onlyLower || !containsUpperCase(wordToAdd))) {
					str += wordToAdd + ' ';
					i += wordToAdd.length + 1; // +1 for space
					wordsCreated++;
					removeIncludedLetters(requiredLettersArray, wordToAdd);

					if (requiredLettersArray.length === 0) {
						requiredLettersArray.push(...startingLetters.split(''));
					}
				}
			}

			return str.trim();
		}

		/**
	 * Generate line from letter jumbles
	 * @param {number} currentLevel - Current level
	 * @param {string} currentLayout - Current layout
	 * @param {number} maxWords - Maximum words
	 * @returns {string} Generated letter jumble line
	 */
	function generateLetterJumbleLine(currentLevel, currentLayout, maxWords) {
			const levelLetters = levelDictionaries[currentLayout][`lvl${currentLevel}`];
			if (!levelLetters || levelLetters.length === 0) {
				return 'test typing ';
			}

			let str = '';
			let wordsCreated = 0;

			for (let i = 0; i < 23; i = i) { // lineLength
				if (wordsCreated >= maxWords) break;

				const wordToAdd = randomLetterJumble(levelLetters);
				str += wordToAdd + ' ';
				i += wordToAdd.length + 1; // +1 for space
				wordsCreated++;
			}

			return str.trim();
		}

	/**
	 * Get word list for specific level
	 * @param {number} level - Level number
	 * @returns {Array<string>} Word list for level
	 */
	function getWordList(level) {
			return wordLists[`lvl${level}`] || [];
		}

	/**
	 * Get all word lists
	 * @returns {Object} All word lists
	 */
	function getAllWordLists() {
			return { ...wordLists };
		}

	/**
	 * Check if word service is ready
	 * @returns {boolean} Initialization status
	 */
	function isReady() {
		return isInitialized;
	}

	/**
	 * Reset all word lists
	 */
	function reset() {
		wordLists = {
			lvl1: [],
			lvl2: [],
			lvl3: [],
			lvl4: [],
			lvl5: [],
			lvl6: [],
			lvl7: [],
		};
	}

	/**
	 * Get statistics about word lists
	 * @returns {Object} Word list statistics
	 */
	function getStats() {
		const totalWords = Object.values(wordLists).reduce((sum, list) => sum + list.length, 0);

		return {
			totalWords,
			levels: Object.keys(wordLists).length,
			wordsPerLevel: Object.keys(wordLists).reduce((obj, key) => {
				obj[key] = wordLists[key].length;
				return obj;
			}, {}),
			isInitialized: isInitialized
		};
	}

	// Initialize service
	initialize();

	// Public API
	return {
		contains,
		containsUpperCase,
		randomLetterJumble,
		createTestSets,
		generateLine,
		getWordList,
		getAllWordLists,
		isReady,
		reset,
		getStats
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = WordService;
} else if (typeof globalThis.window !== 'undefined') {
	window.WordService = WordService;
}
