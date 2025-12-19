/**
 * DOM Service - Centralized DOM element caching and access
 * Provides cached access to DOM elements used throughout the application
 * Uses revealing module pattern
 */

const DOMService = (function() {
  // Private DOM element cache
  let elements = {};
  let isInitialized = false;

  /**
   * Initialize DOM service and cache all elements
   * @returns {boolean} Success status
   */
  function initialize() {
    if (isInitialized) return true;

    try {
      // Main UI elements
      elements.prompt = document.querySelector(".prompt");
      elements.scoreText = document.querySelector("#scoreText");
      elements.timeText = document.querySelector("#timeText");
      elements.resetButton = document.querySelector("#resetButton");
      elements.accuracyText = document.querySelector("#accuracyText");
      elements.wpmText = document.querySelector("#wpmText");
      elements.testResults = document.querySelector("#testResults");
      elements.input = document.querySelector("#userInput");
      elements.inputKeyboard = document.querySelector("#inputKeyboard");
      elements.inputShiftKeyboard = document.querySelector("#inputShiftKeyboard");
      elements.customInput = document.querySelector(".customInput");
      elements.buttons = document.querySelector("nav").children;
      elements.select = document.querySelector("select");
      elements.mappingStatusButton = document.querySelector("#mappingToggle label input");
      elements.mappingStatusText = document.querySelector("#mappingToggle h6 span");
      elements.saveButton = document.querySelector(".saveButton");
      elements.discardButton = document.querySelector(".discardButton");
      elements.openUIButton = document.querySelector(".openUIButton");
      elements.customUIKeyInput = document.querySelector("#customUIKeyInput");

      // Preference menu elements
      elements.preferenceButton = document.querySelector(".preferenceButton");
      elements.preferenceMenu = document.querySelector(".preferenceMenu");
      elements.closePreferenceButton = document.querySelector(".closePreferenceButton");
      elements.capitalLettersAllowed = document.querySelector(".capitalLettersAllowed");
      elements.fullSentenceModeToggle = document.querySelector(".fullSentenceMode");
      elements.fullSentenceModeLevelButton = document.querySelector(".lvl8");
      elements.requireBackspaceCorrectionToggle = document.querySelector(".requireBackspaceCorrectionToggle");
      elements.wordLimitModeButton = document.querySelector(".wordLimitModeButton");
      elements.wordLimitModeInput = document.querySelector(".wordLimitModeInput");
      elements.timeLimitModeButton = document.querySelector(".timeLimitModeButton");
      elements.timeLimitModeInput = document.querySelector(".timeLimitModeInput");
      elements.wordScrollingModeButton = document.querySelector(".wordScrollingModeButton");
      elements.punctuationModeButton = document.querySelector(".punctuationModeButton");
      elements.showCheatsheetButton = document.querySelector(".showCheatsheetButton");
      elements.playSoundOnClickButton = document.querySelector(".playSoundOnClick");
      elements.playSoundOnErrorButton = document.querySelector(".playSoundOnError");

      // Layout elements
      elements.layout = document.querySelector("#layout");
      elements.keyboard = document.querySelector("#keyboard");
      elements.layoutName = document.querySelector('#layoutName');

      // Additional elements that may be needed
      elements.cheatsheet = document.querySelector('.cheatsheet');
      elements.fadeElement = document.querySelector('#fadeElement');

      // Validate critical elements
      const criticalElements = [
        'prompt', 'input', 'resetButton', 'preferenceButton', 'preferenceMenu'
      ];

      const missingElements = criticalElements.filter(key => !elements[key]);
      if (missingElements.length > 0) {
        console.error('DOMService: Critical elements not found:', missingElements);
        return false;
      }

      isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing DOMService:', error);
      return false;
    }
  }

  /**
   * Get a cached DOM element
   * @param {string} key - Element identifier
   * @returns {Element|null} Cached element or null
   */
  function getElement(key) {
    return elements[key] || null;
  }

  /**
   * Get all cached elements
   * @returns {Object} Copy of cached elements object
   */
  function getAllElements() {
    return { ...elements };
  }

  /**
   * Check if element exists in cache
   * @param {string} key - Element identifier
   * @returns {boolean} Whether element exists
   */
  function hasElement(key) {
    return key in elements && elements[key] !== null;
  }

  /**
   * Refresh a specific element in the cache
   * @param {string} key - Element identifier
   * @param {string} selector - CSS selector to find element
   * @returns {boolean} Success status
   */
  function refreshElement(key, selector) {
    try {
      elements[key] = document.querySelector(selector);
      return elements[key] !== null;
    } catch (error) {
      console.error(`Error refreshing element ${key}:`, error);
      return false;
    }
  }

  /**
   * Add a new element to the cache
   * @param {string} key - Element identifier
   * @param {Element} element - DOM element to cache
   */
  function addElement(key, element) {
    elements[key] = element;
  }

  /**
   * Remove an element from the cache
   * @param {string} key - Element identifier
   * @returns {boolean} Success status
   */
  function removeElement(key) {
    if (key in elements) {
      delete elements[key];
      return true;
    }
    return false;
  }

  /**
   * Check if service is initialized
   * @returns {boolean} Initialization status
   */
  function isReady() {
    return isInitialized;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  function getStats() {
    const totalElements = Object.keys(elements).length;
    const validElements = Object.values(elements).filter(el => el !== null).length;

    return {
      totalElements,
      validElements,
      invalidElements: totalElements - validElements,
      isInitialized: isInitialized
    };
  }

  // Public API
  return {
    initialize,
    getElement,
    getAllElements,
    hasElement,
    refreshElement,
    addElement,
    removeElement,
    isReady,
    getStats
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMService;
} else if (typeof window !== 'undefined') {
  window.DOMService = DOMService;
}
