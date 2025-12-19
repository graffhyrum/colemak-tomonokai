/**
 * Game Controller - Core game logic and state management
 * Handles game initialization, resets, word completion, and game ending
 * Uses revealing module pattern
 */

const MainGameController = (function() {
  // Private state
  let isInitialized = false;
  let dependencies = {};

  /**
   * Initialize game controller with dependencies
   * @param {Object} dependencies - Required dependencies
   * @returns {boolean} Success status
   */
  function initialize(inputDeps = {}) {
    if (isInitialized) return true;

    dependencies = {
      StateManager: inputDeps.StateManager || window.StateManager,
      DOMService: inputDeps.DOMService || window.DOMService,
      WordPool: inputDeps.WordPool || window.WordPool,
      WordManager: inputDeps.WordManager || window.WordManager,
      convertLineToHTML: inputDeps.convertLineToHTML || window.convertLineToHTML,
      updateScoreText: inputDeps.updateScoreText || window.updateScoreText,
      resetTimeText: inputDeps.resetTimeText || window.resetTimeText,
      createTestSets: inputDeps.createTestSets || window.createTestSets,
      ...inputDeps
    };

    // Validate required dependencies
    const requiredDeps = ['StateManager', 'DOMService'];
    const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
    if (missingDeps.length > 0) {
      console.error('GameController: Missing dependencies:', missingDeps);
      return false;
    }

    isInitialized = true;
    return true;
  }

  /**
   * Reset the game state and initialize a new game
   * @param {Object} config - Game configuration
   */
  function reset(config = {}) {
    const StateManager = dependencies.StateManager;
    const DOMService = dependencies.DOMService;

    // Reset game state variables
    deleteFirstLine = false;
    deleteLatestWord = false;
    promptOffset = 0;
    sentenceStartIndex = -1;
    lineIndex = 0;
    wordIndex = 0;
    idCount = 0;

    // Clear prompt and input
    const prompt = DOMService.getElement('prompt');
    const input = DOMService.getElement('input');
    if (prompt) {
      prompt.innerHTML = "";
      prompt.style.left = "0";
      prompt.classList.remove("noDisplay");
    }
    if (input) input.value = "";

    // Reset state arrays
    answerString = "";
    answerWordArray = [];

    // Stop timer
    gameOn = false;

    // Reset indices
    letterIndex = 0;

    // Reset counts
    correct = 0;
    errors = 0;
    score = 0;

    // Load required letters for current level
    requiredLetters = (
      (LayoutService ? LayoutService.getLevelLetters(StateManager.get('currentLevel')) : '') +
      StateManager.get('punctuation')
    ).split("");

    // Reset timing
    if (!StateManager.get('timeLimitMode')) {
      StateManager.set('minutes', 0);
      StateManager.set('seconds', 0);
    } else {
      const timeLimitSeconds = StateManager.get('timeLimitSeconds') || 60;
      StateManager.set('seconds', timeLimitSeconds % 60);
      StateManager.set('minutes', Math.floor(timeLimitSeconds / 60));
      // Score max is set by PreferenceMenu when time limit changes
    }

    // Reset UI elements
    const testResults = DOMService.getElement('testResults');
    if (testResults) testResults.classList.add("transparent");

    // Load words based on mode
    if (StateManager.get('timeLimitMode')) {
      loadTimeLimitMode();
    } else {
      loadWordLimitMode();
    }

    // Ensure correctAnswer is defined
    if (!correctAnswer && answerWordArray.length > 0) {
      correctAnswer = answerWordArray[0];
    } else if (!correctAnswer) {
      correctAnswer = 'a';
    }
    StateManager.set('correctAnswer', correctAnswer);
    window.correctAnswer = correctAnswer;

    // Create answer letter array
    answerLetterArray = answerString.split("");

    // Update UI
    if (dependencies.updateScoreText) dependencies.updateScoreText();
    if (dependencies.resetTimeText) dependencies.resetTimeText();

    // Focus input
    if (input) input.focus();
  }

  /**
   * Load words for time limit mode
   * @private
   */
  function loadTimeLimitMode() {
    const StateManager = dependencies.StateManager;
    const DOMService = dependencies.DOMService;
    const WordPool = dependencies.WordPool;
    const convertLineToHTML = dependencies.convertLineToHTML;

    try {
      const timeLimitSeconds = StateManager.get('timeLimitSeconds') || 60;
      const targetWords = timeLimitSeconds * 3;
      const chunkSize = 20;

      let wordsLoaded = 0;
      let chunksLoaded = 0;

      while (wordsLoaded < targetWords && chunksLoaded < 10) {
        const wordsNeeded = Math.min(chunkSize, targetWords - wordsLoaded);
        const words = WordPool.getRandomWords(wordsNeeded);
        const lineToAdd = words.join(' ');

        answerString += lineToAdd + ' ';
        answerWordArray = answerWordArray.concat(words);

        wordsLoaded += words.length;
        chunksLoaded++;

        const prompt = DOMService.getElement('prompt');
        if (prompt && convertLineToHTML) {
          prompt.innerHTML += convertLineToHTML(lineToAdd);
        }
      }

      if (answerWordArray.length > 0) {
        correctAnswer = answerWordArray[0];
      }

      // Track word count for lazy loading
      if (dependencies.WordManager && dependencies.WordManager.setInitialWordCount) {
        dependencies.WordManager.setInitialWordCount(wordsLoaded);
      }
    } catch (error) {
      throw new Error(`Failed to load words for time limit mode: ${error.message}`);
    }
  }

  /**
   * Load words for word limit mode
   * @private
   */
  function loadWordLimitMode() {
    const DOMService = dependencies.DOMService;
    const WordPool = dependencies.WordPool;
    const convertLineToHTML = dependencies.convertLineToHTML;

    try {
      let allWords = [];
      for (let i = 1; i <= 3; i++) {
        const words = WordPool.getRandomWords(10);
        allWords = allWords.concat(words);
      }

      const lineToAdd = allWords.join(' ');
      answerString = lineToAdd;
      answerWordArray = allWords;

      const prompt = DOMService.getElement('prompt');
      if (prompt && convertLineToHTML) {
        prompt.innerHTML = convertLineToHTML(lineToAdd);
      }

      if (answerWordArray.length > 0) {
        correctAnswer = answerWordArray[0];
      }
    } catch (error) {
      throw new Error(`Failed to load words for word limit mode: ${error.message}`);
    }
  }

  /**
   * Handle correct word completion
   */
  function handleCorrectWord() {
    const StateManager = dependencies.StateManager;
    const DOMService = dependencies.DOMService;

    // Clear incorrect styling
    const input = DOMService.getElement('input');
    if (input) input.style.color = "black";

    // Remove completed word
    answerWordArray.shift();

    // Check if we need a new line
    const prompt = DOMService.getElement('prompt');
    if (prompt && prompt.children[0]) {
      const needsNewLine = prompt.children[0].children.length - 1 === 0 ||
                         wordIndex >= prompt.children[0].children.length - 1;

      if (needsNewLine) {
        lineIndex++;
        addLineToPrompt();

        if (!StateManager.get('wordScrollingMode')) {
          if (prompt && prompt.children && prompt.children[0]) {
            prompt.removeChild(prompt.children[0]);
          }
          wordIndex = -1;
        }
      }
    }

    // Handle scrolling modes
    if (StateManager.get('wordScrollingMode')) {
      if (prompt) prompt.classList.add("smoothScroll");

      const completedWord = document.querySelector(`#id${wordIndex}.word`);
      if (completedWord) {
        promptOffset += completedWord.offsetWidth;
        if (prompt) prompt.style.left = `-${promptOffset}px`;
        completedWord.style.opacity = '0';
      } else {
        // Reset offset if word not found
        promptOffset = 0;
        if (prompt) prompt.style.left = `-${promptOffset}px`;
      }
      wordIndex++;
    } else {
      wordIndex++;
    }

    // Update correct answer
    correctAnswer = answerWordArray[0];
    StateManager.set('correctAnswer', correctAnswer);
  }

  /**
   * Add a new line to the prompt
   */
  function addLineToPrompt() {
    const StateManager = dependencies.StateManager;
    const WordPool = dependencies.WordPool;
    const DOMService = dependencies.DOMService;
    const convertLineToHTML = dependencies.convertLineToHTML;

    try {
      const remainingWords = Math.max(1, StateManager.get('scoreMax') - score - answerWordArray.length);
      const words = WordPool.getRandomWords(Math.min(10, remainingWords));
      const lineToAdd = words.join(' ');

      answerString += lineToAdd;
      answerWordArray = answerWordArray.concat(words);

      const prompt = DOMService.getElement('prompt');
      if (prompt && convertLineToHTML) {
        prompt.innerHTML += convertLineToHTML(lineToAdd);
      }
    } catch (error) {
      throw new Error(`Failed to add line to prompt: ${error.message}`);
    }
  }

  /**
   * End the current game
   */
  function endGame() {
    const StateManager = dependencies.StateManager;
    const DOMService = dependencies.DOMService;

    // Hide prompt
    const prompt = DOMService.getElement('prompt');
    if (prompt) prompt.classList.toggle("noDisplay");

    // Show reset button
    const resetButton = DOMService.getElement('resetButton');
    if (resetButton) {
      resetButton.classList.remove("noDisplay");
      resetButton.focus();
    }

    // Stop timer
    gameOn = false;

    // Calculate WPM
    let wpm;
    if (!StateManager.get('timeLimitMode')) {
      const totalMinutes = StateManager.get('minutes') + StateManager.get('seconds') / 60;
      wpm = totalMinutes === 0 ? '0.00' : ((correct + errors) / 5 / totalMinutes).toFixed(2);
    } else {
      const timeLimitSeconds = StateManager.get('timeLimitSeconds') || 60;
      wpm = ((correct + errors) / 5 / (timeLimitSeconds / 60)).toFixed(2);
    }

    // Update results display
    const accuracyText = DOMService.getElement('accuracyText');
    const wpmText = DOMService.getElement('wpmText');
    const testResults = DOMService.getElement('testResults');

    if (accuracyText) {
      accuracyText.innerHTML = `Accuracy: ${((100 * correct) / (correct + errors)).toFixed(2)}%`;
    }
    if (wpmText) {
      wpmText.innerHTML = `WPM: ${wpm}`;
    }
    if (testResults) {
      testResults.classList.toggle("transparent");
    }

    // Reset counters
    correct = 0;
    errors = 0;
    letterIndex = 0;

    // Update score and clear input
    if (dependencies.updateScoreText) dependencies.updateScoreText();

    const input = DOMService.getElement('input');
    if (input) input.value = "";
  }

  /**
   * Check if the current input matches the correct answer
   * @returns {boolean} Whether the answer is correct
   */
  function checkAnswer() {
    const DOMService = dependencies.DOMService;
    const input = DOMService.getElement('input');
    const inputVal = input ? input.value : '';
    return inputVal === correctAnswer;
  }

  /**
   * Get current game statistics
   * @returns {Object} Game statistics
   */
  function getGameStats() {
    const StateManager = dependencies.StateManager;
    return {
      score: StateManager.get('score'),
      correct: StateManager.get('correct'),
      errors: StateManager.get('errors'),
      accuracy: StateManager.get('correct') + StateManager.get('errors') > 0 ?
        (StateManager.get('correct') / (StateManager.get('correct') + StateManager.get('errors'))) * 100 : 0,
      wordsCompleted: StateManager.get('score'),
      timeElapsed: StateManager.get('minutes') * 60 + StateManager.get('seconds'),
      currentWord: correctAnswer,
      wordsRemaining: answerWordArray.length
    };
  }

  /**
   * Check if game controller is initialized
   * @returns {boolean} Initialization status
   */
  function isReady() {
    return isInitialized;
  }

  // Public API
  return {
    initialize,
    reset,
    handleCorrectWord,
    addLineToPrompt,
    endGame,
    checkAnswer,
    getGameStats,
    isReady
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainGameController;
} else if (typeof window !== 'undefined') {
  window.MainGameController = MainGameController;
}
