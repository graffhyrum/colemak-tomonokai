// DOM element cache and utilities
// Hybrid approach: centralized cache for frequently used elements + utility functions

// Central cache for frequently used elements
export const elements = {
    prompt: document.querySelector('.prompt'),
    scoreText: document.querySelector('#scoreText'),
    timeText: document.querySelector('#timeText'),
    resetButton: document.querySelector('#resetButton'),
    accuracyText: document.querySelector('#accuracyText'),
    wpmText: document.querySelector('#wpmText'),
    testResults: document.querySelector('#testResults'),
    input: document.querySelector('#userInput'),
    inputKeyboard: document.querySelector('#inputKeyboard'),
    inputShiftKeyboard: document.querySelector('#inputShiftKeyboard'),
    customInput: document.querySelector('.customInput'),
    buttons: document.querySelector('nav').children,
    select: document.querySelector('select'),
    mappingStatusButton: document.querySelector('#mappingToggle label input'),
    mappingStatusText: document.querySelector('#mappingToggle h6 span'),
    saveButton: document.querySelector('.saveButton'),
    discardButton: document.querySelector('.discardButton'),
    openUIButton: document.querySelector('.openUIButton'),
    customUIKeyInput: document.querySelector('#customUIKeyInput'),
    
    // Preference menu elements
    preferenceButton: document.querySelector('.preferenceButton'),
    preferenceMenu: document.querySelector('.preferenceMenu'),
    closePreferenceButton: document.querySelector('.closePreferenceButton'),
    capitalLettersAllowed: document.querySelector('.capitalLettersAllowed'),
    fullSentenceModeToggle: document.querySelector('.fullSentenceMode'),
    fullSentenceModeLevelButton: document.querySelector('.lvl8'),
    requireBackspaceCorrectionToggle: document.querySelector('.requireBackspaceCorrectionToggle'),
    wordLimitModeButton: document.querySelector('.wordLimitModeButton'),
    wordLimitModeInput: document.querySelector('.wordLimitModeInput'),
    timeLimitModeButton: document.querySelector('.timeLimitModeButton'),
    timeLimitModeInput: document.querySelector('.timeLimitModeInput'),
    wordScrollingModeButton: document.querySelector('.wordScrollingModeButton'),
    punctuationModeButton: document.querySelector('.punctuationModeButton'),
    showCheatsheetButton: document.querySelector('.showCheatsheetButton'),
    playSoundOnClickButton: document.querySelector('.playSoundOnClick'),
    playSoundOnErrorButton: document.querySelector('.playSoundOnError')
};

// Utility functions for module-specific DOM queries
export function getElement(selector) {
    return document.querySelector(selector);
}

export function getElements(selector) {
    return document.querySelectorAll(selector);
}

// Helper function to safely get elements that might not exist
export function safeGetElement(selector) {
    try {
        return document.querySelector(selector);
    } catch (e) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
}

// Helper function to get elements with context
export function getElementInContext(selector, context = document) {
    return context.querySelector(selector);
}

export function getElementsInContext(selector, context = document) {
    return context.querySelectorAll(selector);
}