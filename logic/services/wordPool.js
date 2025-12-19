/**
 * Word Pool Service - Manages comprehensive word pools for layouts and levels
 * Provides unique-then-repeat sampling with no fallbacks
 * Uses revealing module pattern
 */

const WordPool = (function() {
    // Private state
    let currentPool = [];
    let currentLayout = null;
    let currentLevel = null;
    let recentIndices = new Set(); // Track recently used indices to avoid immediate repetition

    /**
     * Check if word is valid for given letter set
     * @param {string} word - Word to validate
     * @param {string} allowedLetters - String of allowed letters
     * @returns {boolean} Whether word uses only allowed letters
     */
    function isValidWord(word, allowedLetters) {
        const allowedSet = new Set(allowedLetters);
        return [...word].every(char => allowedSet.has(char));
    }

    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Get cumulative letters available for layout/level combination
     * Levels are cumulative - each level includes letters from previous levels
     * @param {string} layout - Keyboard layout
     * @param {number} level - Difficulty level
     * @returns {Object|null} Object with includedLetters and requiredLetters, or null if not found
     */
    function getLevelLetters(layout, level) {
        if (!levelDictionaries || !levelDictionaries[layout]) {
            return null;
        }

        let includedLetters = '';
        let requiredLetters = '';

        // Build cumulative included letters up to current level
        for (let i = 1; i <= level; i++) {
            const levelKey = `lvl${i}`;
            if (levelDictionaries[layout][levelKey]) {
                includedLetters += levelDictionaries[layout][levelKey];
            }
        }

        // Required letters are just the current level
        const currentLevelKey = `lvl${level}`;
        if (levelDictionaries[layout][currentLevelKey]) {
            requiredLetters = levelDictionaries[layout][currentLevelKey];
        }

        return {
            includedLetters,
            requiredLetters
        };
    }

    /**
     * Generate word pool for given layout/level
     * Uses cumulative level system - words must use only included letters and contain at least one required letter
     * Throws on any failure - no fallbacks
     * @param {string} layout - Keyboard layout
     * @param {number} level - Difficulty level
     * @returns {number} Number of words in pool
     * @throws {Error} If pool generation fails
     */
    function generatePool(layout, level) {
        // Validate masterList availability
        if (!masterList || !Array.isArray(masterList) || masterList.length === 0) {
            throw new Error('WordPool: masterList not available or empty');
        }

        // Get level letters (cumulative included, current level required)
        const levelData = getLevelLetters(layout, level);
        if (!levelData || !levelData.includedLetters) {
            throw new Error(`WordPool: No letters defined for layout '${layout}' level ${level}`);
        }

        const { includedLetters, requiredLetters } = levelData;
        const includedSet = new Set(includedLetters);
        const requiredSet = new Set(requiredLetters.split(''));

        // Filter masterList to valid words for this level
        const validWords = masterList.filter(word => {
            if (typeof word !== 'string' || word.length === 0) {
                return false; // Skip invalid entries
            }

            // Word must only use allowed letters (cumulative)
            if (![...word].every(char => includedSet.has(char))) {
                return false;
            }

            // Word must contain at least one required letter (current level)
            if (requiredSet.size > 0 && ![...word].some(char => requiredSet.has(char))) {
                return false;
            }

            // Additional filters could go here (uppercase, etc.)
            return true;
        });

        if (validWords.length === 0) {
            throw new Error(`WordPool: No valid words found for ${layout}/${level} (included: ${includedLetters}, required: ${requiredLetters})`);
        }

        // Create pool with all valid words, shuffled for randomization
        currentPool = shuffleArray(validWords);
        currentLayout = layout;
        currentLevel = level;
        recentIndices.clear(); // Reset repetition tracking

        return currentPool.length;
    }

    /**
     * Get random words using true randomization with repetition avoidance
     * @param {number} count - Number of words to get
     * @returns {string[]} Array of random words
     * @throws {Error} If pool not initialized
     */
    function getRandomWords(count) {
        if (currentPool.length === 0) {
            throw new Error('WordPool: Pool not initialized. Call generatePool() first.');
        }

        if (!count || count < 1) {
            throw new Error('WordPool: Invalid word count requested');
        }

        const result = [];

        for (let i = 0; i < count; i++) {
            let randomIndex;
            let attempts = 0;
            const maxAttempts = Math.min(3, currentPool.length); // Don't try harder than pool size

            // Try to avoid immediate repetition (up to maxAttempts)
            do {
                randomIndex = Math.floor(Math.random() * currentPool.length);
                attempts++;
            } while (recentIndices.has(randomIndex) && attempts < maxAttempts);

            result.push(currentPool[randomIndex]);
            recentIndices.add(randomIndex);

            // Clear tracking when it gets too large (memory management)
            if (recentIndices.size > currentPool.length * 0.8) {
                recentIndices.clear();
            }
        }

        return result;
    }

    /**
     * Check if pool needs regeneration for given layout/level
     * @param {string} layout - Layout to check
     * @param {number} level - Level to check
     * @returns {boolean} Whether regeneration is needed
     */
    function needsRegeneration(layout, level) {
        return currentLayout !== layout || currentLevel !== level;
    }

    /**
     * Get current pool statistics
     * @returns {Object} Pool statistics
     */
    function getStats() {
        return {
            poolSize: currentPool.length,
            currentLayout: currentLayout,
            currentLevel: currentLevel,
            recentIndicesCount: recentIndices.size,
            isInitialized: currentPool.length > 0
        };
    }

    /**
     * Force regeneration (for testing/debugging)
     * @param {string} layout - Layout to regenerate for
     * @param {number} level - Level to regenerate for
     */
    function forceRegeneration(layout, level) {
        generatePool(layout, level);
    }

    // Public API
    return {
        generatePool,
        getRandomWords,
        needsRegeneration,
        getStats,
        forceRegeneration,
        // Utility functions for testing
        isValidWord,
        getLevelLetters
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordPool;
} else if (typeof window !== 'undefined') {
    window.WordPool = WordPool;
}
