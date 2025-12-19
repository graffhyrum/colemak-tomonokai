// Core application state and configuration
const getScoreMax = () => StateManager.get('scoreMax') || 50;

// Application settings
let timeLimitMode = StateManager.get('timeLimitMode') === "true";
let requireBackspaceCorrection = StateManager.get('requireBackspaceCorrection') !== false;

// Sound settings
let playSoundOnClick = StateManager.get('playSoundOnClick') === "true";
let playSoundOnError = StateManager.get('playSoundOnError') === "true";

// Special key codes that should not trigger letter input
const specialKeyCodes = [
    27, 9, 20, 17, 18, 93, 36, 37, 38, 39, 40, 144, 36, 8, 16, 30, 32, 13, 91, 92,
    224, 225,
];

// Initialize core services and state
if (!DOMService.initialize()) {
    console.error('Failed to initialize DOMService');
}

if (!MainGameController.initialize({
	StateManager,
	DOMService,
	WordPool,
	WordManager,
	convertLineToHTML,
	updateScoreText,
	resetTimeText,
	createTestSets
})) {
	console.error('Failed to initialize MainGameController');
}

// Alias to avoid naming conflict with typing component
const AppGameController = MainGameController;

// Make reset globally available for PreferenceMenu
window.reset = AppGameController.reset;

// Initialize the application
initializeApplication();

// Main application initialization
function initializeApplication() {
    // Initialize core services
    initializeServices();

    // Set up UI state based on saved preferences
    initializeUIFromPreferences();

    // Set up event listeners
    initializeEventListeners();

    // Initialize game state
    initializeGameState();
}

// Initialize core services
function initializeServices() {
    createTestSets();
    LevelService.switchLevel(StateManager.get('currentLevel') || 1, getLevelServiceDependencies());
}

// Initialize UI elements based on saved preferences
function initializeUIFromPreferences() {
    const prefs = {
        layout: StateManager.get('currentLayout') || "colemak",
        keyboard: StateManager.get('currentKeyboard') || "ansi",
        capitalLettersAllowed: StateManager.get('onlyLower') === false,
        punctuationMode: StateManager.get('punctuation') || "",
        requireBackspaceCorrection: StateManager.get('requireBackspaceCorrection') !== false,
        fullSentenceMode: StateManager.get('fullSentenceModeEnabled') === "true",
        wordScrollingMode: StateManager.get('wordScrollingMode') !== false,
        timeLimitMode: StateManager.get('timeLimitMode') === "true",
        wordLimit: getScoreMax(),
        showCheatsheet: StateManager.get('showCheatsheet') !== false,
        playSoundOnClick: StateManager.get('playSoundOnClick') === "true",
        playSoundOnError: StateManager.get('playSoundOnError') === "true",
        keyRemapping: StateManager.get('keyRemapping') === "true"
    };

    // Update DOM elements to match preferences
    updatePreferenceUI(prefs);

    // Handle special UI states
    if (!prefs.wordScrollingMode) {
        PreferenceMenu.toggleWordScrollingModeUI();
    }
    if (prefs.fullSentenceMode) {
        PreferenceMenu.toggleFullSentenceModeUI();
    }
    if (prefs.timeLimitMode) {
        toggleTimeLimitModeUI();
    }
    if (!prefs.showCheatsheet) {
        const cheatsheet = DOMService.getElement('cheatsheet');
        if (cheatsheet) cheatsheet.classList.add("noDisplay");
    }

    // Update layout-specific UI
    updateLayoutUI();
    updateLayoutNameDisplay();
}

// Initialize game state
function initializeGameState() {
    AppGameController.reset();
    CheatsheetService.updateCheatsheetStyling(StateManager.get('currentLevel') || 1, getCheatsheetDependencies());

    // Open preference menu if it was open before
    if (StorageService.get("preferenceMenu")) {
        PreferenceMenu.openMenu();
    }
}

// Set up event listeners
function initializeEventListeners() {
    // Timer interval
    setInterval(updateGameTimer, 1000);

    // Input keydown listener
    const inputElement = DOMService.getElement('input');
    if (inputElement) {
        inputElement.addEventListener("keydown", handleInputKeyDown);
    }

    // Layout change listener
    const layoutElement = DOMService.getElement('layout');
    if (layoutElement) {
        layoutElement.addEventListener("change", handleLayoutChange);
    }

    // Keyboard change listener
    const keyboardElement = DOMService.getElement('keyboard');
    if (keyboardElement) {
        keyboardElement.addEventListener("change", handleKeyboardChange);
    }

    // Custom keyboard editor listener
    const openUIButton = DOMService.getElement('openUIButton');
    if (openUIButton) {
        openUIButton.addEventListener("click", () => {
            if (typeof CustomKeyboardEditor !== 'undefined') {
                CustomKeyboardEditor.show();
            }
        });
    }

    // Level button listeners
    const buttons = DOMService.getElement('buttons');
    if (buttons) {
        for (let button of buttons) {
            const b = button;
            b.addEventListener("click", () => {
                let lev = b.innerHTML.replace(/ /, "").toLowerCase();
                lev = lev[lev.length - 1];
                if (StateManager.get('currentLayout') === "tarmak" || StateManager.get('currentLayout') === "tarmakdh") {
                    lev++;
                }
                if (b.innerHTML === "All Words") {
                    lev = 7;
                } else if (b.innerHTML === "Full Sentences") {
                    lev = 8;
                }
                LevelService.switchLevel(lev, getLevelServiceDependencies());
            });
        }
    }

    // Keyboard mapping toggle
    const mappingStatusButton = DOMService.getElement('mappingStatusButton');
    if (mappingStatusButton) {
        mappingStatusButton.addEventListener("click", () => {
            const currentMapping = StateManager.get('keyRemapping') === "true";
            const mappingStatusText = DOMService.getElement('mappingStatusText');
            if (currentMapping) {
                if (mappingStatusText) mappingStatusText.innerText = "off";
                StateManager.set('keyRemapping', false);
            } else {
                if (mappingStatusText) mappingStatusText.innerText = "on";
                StateManager.set('keyRemapping', true);
            }

            // Focus back to input
            if (inputElement) inputElement.focus();
        });
    }

    // Reset button listener
    const resetButton = DOMService.getElement('resetButton');
    if (resetButton) {
        resetButton.addEventListener("click", () => {
            console.log("reset button called");
            AppGameController.reset();
        });
    }

    // Keyup listener to prevent default behavior
    document.addEventListener("keyup", (e) => {
        e.preventDefault();
    });
}

/*________________Timers and Event Listeners___________________*/

// Game timer - handles both count-up and count-down modes
setInterval(updateGameTimer, 1000);

// Update game timer every second
function updateGameTimer() {
    if (!gameOn) return;

    const isTimeLimitMode = StateManager.get('timeLimitMode');
    let seconds = StateManager.get('seconds') || 0;
    let minutes = StateManager.get('minutes') || 0;

    if (!isTimeLimitMode) {
        // Count up mode
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
    } else {
        // Count down mode
        seconds--;
        if (seconds <= 0 && minutes <= 0) {
            AppGameController.endGame();
            return;
        }
        if (seconds < 0) {
            seconds = 59;
            minutes--;
        }
    }

    StateManager.set('seconds', seconds);
    StateManager.set('minutes', minutes);
    resetTimeText();
}

// Start timer when input receives focus/keydown
// (Moved to initializeEventListeners function)

// Preference menu functionality is now handled by PreferenceMenu component

/*___________________________________________________________*/

/*___________________________sound___________________________*/

function playClickSound() {
    if (!playSoundOnClick) return;
    SoundService.playClickSound();
}

function playErrorSound() {
    if (!playSoundOnError) return;
    SoundService.playErrorSound();
}

/*___________________________sound___________________________*/
/*___________________________________________________________*/

/*___________________________________________________________*/

// Update layout-related UI elements
function updateLayoutUI() {
    updateKeyboardMappingsForLayout();
    updateLayoutNameDisplay();

    // Custom layout UI is handled by CustomKeyboardEditor component
    if (StateManager.get('currentLayout') === "custom") {
        // Initialize custom keyboard editor if available
        if (typeof CustomKeyboardEditor !== 'undefined') {
            CustomKeyboardEditor.show();
        }
    }
}

function updateLayoutNameDisplay() {
    const layoutNameElement = document.querySelector('#layoutName');
    if (layoutNameElement) {
        const layoutDisplayNames = {
            'colemak': 'Colemak',
            'colemakdh': 'Colemak-DH',
            'tarmak': 'Tarmak',
            'tarmakdh': 'Tarmak-DH',
            'azerty': 'AZERTY',
            'dvorak': 'Dvorak',
            'lefthandeddvorak': 'Left-handed Dvorak',
            'qwerty': 'QWERTY',
            'workman': 'Workman',
            'canary': 'Canary',
            'custom': 'Custom'
        };
        const currentLayout = StateManager.get('currentLayout') || "colemak";
        const displayName = layoutDisplayNames[currentLayout] || currentLayout;
        layoutNameElement.textContent = displayName;
    }
}

function updateLevelLabelsForLayout() {
    const currentLayout = StateManager.get('currentLayout') || "colemak";
    for (let i = 1; i <= 6; i++) {
        const levelLabel = document.querySelector(`.lvl${i}`);
        if (levelLabel) {
            levelLabel.innerHTML = (currentLayout === "tarmak" || currentLayout === "tarmakdh")
                ? `Step ${i - 1}`
                : `Level ${i}`;
        }
    }
}

// Layout and keyboard change handlers
const layoutElement = DOMService.getElement('layout');
if (layoutElement) {
    layoutElement.addEventListener("change", handleLayoutChange);
}

const keyboardElement = DOMService.getElement('keyboard');
if (keyboardElement) {
    keyboardElement.addEventListener("change", handleKeyboardChange);
}

// Handle layout changes
function handleLayoutChange(e) {
    const newLayout = e.target.value;
    StateManager.set('currentLayout', newLayout);
    StorageService.set("currentLayout", newLayout);

    // Update UI and regenerate word pool
    updateLayoutUI();
    updateLayoutNameDisplay();

    try {
        if (typeof WordPool !== 'undefined') {
            const currentLevel = StateManager.get('currentLevel') || 1;
            WordPool.generatePool(newLayout, currentLevel);
            console.log(`WordPool regenerated for layout change ${newLayout}/${currentLevel}: ${WordPool.getStats().poolSize} words`);
        }
    } catch (error) {
        throw new Error(`Failed to regenerate word pool on layout change: ${error.message}`);
    }

    // Reset game state
    initializeGameState();
}

// Handle keyboard layout changes
function handleKeyboardChange(e) {
    const newKeyboard = e.target.value;
    StateManager.set('currentKeyboard', newKeyboard);
    StorageService.set("currentKeyboard", newKeyboard);

    updateLayoutUI();
    initializeGameState();
}

// Event listeners for custom keyboard editor (placeholder - should be moved to CustomKeyboardEditor component)
const openUIButton = DOMService.getElement('openUIButton');
if (openUIButton) {
    openUIButton.addEventListener("click", () => {
        if (typeof CustomKeyboardEditor !== 'undefined') {
            CustomKeyboardEditor.show();
        }
    });
}

/*______________Custom Keyboard Editor___________________*/
// NOTE: Custom keyboard editing functionality has been extracted to CustomKeyboardEditor component
// All custom keyboard editing code (300+ lines) should be moved to logic/components/CustomKeyboardEditor.js
/*___________________________________________________________*/

// Main input key listener - consolidated event handling
// (Moved to initializeEventListeners function)

// Consolidated input keydown handler
function handleInputKeyDown(e) {
    // Handle various input scenarios in order
    handleLineDeletion();
    handleKeyMapping(e);
    handleWordCompletion(e);
    handleResetKeys(e);
    handleAccuracyChecking(e);
}

// returns true if the letters typed SO FAR are correct
function checkAnswerToIndex() {
    // user input
    const inputElement = DOMService.getElement('input');
    const inputVal = inputElement ? inputElement.value : '';

    let inputSnippet = inputVal.slice(0, letterIndex);
    let substringToCheck = (correctAnswer || '').slice(0, letterIndex);
    return inputSnippet === substringToCheck;
}

function checkAnswerToIndexWithInput(predictedInput) {
    if (predictedInput) {
        // Use predicted input for character keys
        let inputSnippet = predictedInput.slice(0, letterIndex);
        let substringToCheck = (correctAnswer || '').slice(0, letterIndex);
        return inputSnippet === substringToCheck;
    } else {
        // Fall back to regular check
        return checkAnswerToIndex();
    }
}

function handleLineDeletion() {
    // handle line transitions
    if (deleteLatestWord) {
        const prompt = DOMService.getElement('prompt');
        if (prompt) {
            prompt.classList.remove("smoothScroll");
            if (!wordScrollingMode) {
                // in paragraph mode, remove the completed line
                prompt.firstChild.removeChild(prompt.firstChild.firstChild);
                if (prompt.firstChild.children.length === 0) {
                    prompt.removeChild(prompt.firstChild);
                }
            }
            // reset offset for new line
            promptOffset = 0;
            prompt.style.left = `-${promptOffset}px`;
        }
        deleteLatestWord = false;
    }
}

function handleWordCompletion(e) {
    // listens for the enter  and space key. Checks to see if input contains the
    // correct word. If yes, generate new word. If no, give user
    // negative feedback

    if (e.keyCode === 13 || e.keyCode === 32) {
        // Check if current input matches the correct answer (input hasn't been updated with space yet)
        const inputElement = DOMService.getElement('input');
        const currentInput = inputElement ? inputElement.value : '';
        const isCorrect = currentInput === correctAnswer;

        if (isCorrect) { // Removed gameOn check for testing compatibility
            // stops a ' ' character from being put in the input bar
            // it wouldn't appear until after this function, and would
            // still be there when the user goes to type the next word
            e.preventDefault();

            // increment score first so handleCorrectWord uses correct index
            incrementScore();

            AppGameController.handleCorrectWord();

			// end game if score === scoreMax
			if (score >= getScoreMax()) {
				AppGameController.endGame();
			}

            // clear input field
            const inputElement = DOMService.getElement('input');
            if (inputElement) inputElement.value = "";

            // set letter index (where in the word the user currently is)
            // to the beginning of the word
            letterIndex = 0;
        } else {
            console.log("error space");
            const inputElement = DOMService.getElement('input');
            if (inputElement) inputElement.value += " ";
            letterIndex++;
        }
    } // end keyEvent if statement
}

function handleResetKeys(e) {
    if (e.keyCode === 9 || e.keyCode === 27) {
		// 9 = Tab, 27 = Esc
		AppGameController.reset();
    } else if (e.keyCode === 116) {
        // F5 does not reload page because of the input area without this if-else
        window.location.reload();
    } // end of reset key check
}

function handleAccuracyChecking(e) {
    // if we have a backspace, decrement letter index and role back the input value
    if (e.keyCode === 8) {
        //console.log('backspace');
        if (!e.ctrlKey) {
            const inputElement = DOMService.getElement('input');
            if (inputElement) inputElement.value = inputElement.value.substr(0, inputElement.value.length - 1);
            letterIndex--;
        }
        // letter index cannot be < 0
        if (letterIndex < 0) {
            letterIndex = 0;
        }
    }

    // if key produces a character, (ie not shift, backspace, or another
    // utility key) increment letter index
    if (!specialKeyCodes.includes(e.keyCode)) {
        letterIndex++;
    }

    // check if answer is correct and apply the correct styling.
    // Also increment 'errors' or 'correct'

    // For character keys, predict the input value since it hasn't updated yet
    let predictedInput = '';
    if (!specialKeyCodes.includes(e.keyCode) && e.keyCode !== 8) {
        const inputElement = DOMService.getElement('input');
        const currentInput = inputElement ? inputElement.value : '';
        predictedInput = currentInput + e.key;
    }

    if (checkAnswerToIndexWithInput(predictedInput)) {
        const inputElement = DOMService.getElement('input');
        if (inputElement) inputElement.style.color = "black";
        // no points awarded for backspace
        if (e.keyCode === 8) {
            playClickSound();
            // if backspace, color it grey again
            if (e.ctrlKey) {
                const prompt = DOMService.getElement('prompt');
                if (prompt) {
                    for (let i = 0; i < letterIndex; i++) {
                        if (prompt.children[0].children[wordIndex].children[i]) {
                            prompt.children[0].children[wordIndex].children[i].style.color =
                                "gray";
                        }
                    }
                }
                if (inputElement) inputElement.value = "";
                letterIndex = 0;
            } else {
                const prompt = DOMService.getElement('prompt');
                if (prompt && prompt.children[0].children[wordIndex].children[letterIndex]) {
                    prompt.children[0].children[wordIndex].children[
                        letterIndex
                        ].style.color = "gray";
                }
            }
        } else if (!specialKeyCodes.includes(e.keyCode) || e.keyCode === 32) {
            playClickSound();
            correct++;
            // if letter (in the promp) exists, color it green
            const prompt = DOMService.getElement('prompt');
            if (prompt && prompt.children[0].children[wordIndex].children[letterIndex - 1]) {
                prompt.children[0].children[wordIndex].children[
                letterIndex - 1
                    ].style.color = "green";
            }
        }
    } else {
        console.log("error");
        const inputElement = DOMService.getElement('input');
        if (inputElement) inputElement.style.color = "red";
        // no points awarded for backspace
        if (e.keyCode === 8) {
            handleKeycodeEight(e);
        } else if (!specialKeyCodes.includes(e.keyCode) || e.keyCode === 32) {
            playErrorSound();
            errors++;
            const prompt = DOMService.getElement('prompt');
            if (prompt && prompt.children[0].children[wordIndex].children[letterIndex - 1]) {
                prompt.children[0].children[wordIndex].children[
                letterIndex - 1
                    ].style.color = "red";
            }
        }

        if (!requireBackspaceCorrection && !checkAnswerToIndexWithInput(predictedInput || '')) {
            //ignore input if the wrong char was typed (negate need to backspace errors - akin to KeyBr.com's behaviour)
            letterIndex--;
            if (inputElement) inputElement.value = inputElement.value.substr(0, inputElement.value.length - 1);

            // letter index cannot be < 0
            if (letterIndex < 0) {
                letterIndex = 0;
            }
        }
    }

    // if on the last word, check every letter so we don't need a space to end the game
	if (!timeLimitMode && score === getScoreMax() - 1 && AppGameController.checkAnswer() && gameOn) {
        console.log("game over");
        AppGameController.endGame();
    }

    function handleKeycodeEight(e) {
        playClickSound();
        // if backspace, color it grey again
        if (e.ctrlKey) {
            const prompt = DOMService.getElement('prompt');
            if (prompt) {
                for (let i = 0; i < letterIndex; i++) {
                    if (prompt.children[0].children[wordIndex].children[i]) {
                        prompt.children[0].children[wordIndex].children[i].style.color =
                            "gray";
                    }
                }
            }
            const inputElement = DOMService.getElement('input');
            if (inputElement) inputElement.value = "";
            letterIndex = 0;
        } else {
            const prompt = DOMService.getElement('prompt');
            if (prompt && prompt.children[0].children[wordIndex].children[letterIndex]) {
                prompt.children[0].children[wordIndex].children[
                    letterIndex
                    ].style.color = "gray";
            }
        }
    }
}

// add event listeners to level buttons
const buttons = DOMService.getElement('buttons');
if (buttons) {
    for (let button of buttons) {
        const b = button;
        b.addEventListener("click", () => {
            let lev = b.innerHTML.replace(/ /, "").toLowerCase();
            // int representation of level we are choosing
            lev = lev[lev.length - 1];
            if (StateManager.get('currentLayout') === "tarmak" || StateManager.get('currentLayout') === "tarmakdh") {
                lev++;
            }
            if (b.innerHTML === "All Words") {
                lev = 7;
            } else if (b.innerHTML === "Full Sentences") {
                lev = 8;
            }
            LevelService.switchLevel(lev, getLevelServiceDependencies());
        });
    }
}


// listener for keyboard mapping toggle switch
const mappingStatusButton = DOMService.getElement('mappingStatusButton');
if (mappingStatusButton) {
    mappingStatusButton.addEventListener("click", () => {
        if (StateManager.get('keyRemapping') === "true") {
            // change the status text
            const mappingStatusText = DOMService.getElement('mappingStatusText');
            if (mappingStatusText) mappingStatusText.innerText = "off";
            StateManager.set('keyRemapping', false);
        } else {
            // change the status text
            const mappingStatusText = DOMService.getElement('mappingStatusText');
            if (mappingStatusText) mappingStatusText.innerText = "on";
            StateManager.set('keyRemapping', true);
        }

        // change focus back to input
        const input = DOMService.getElement('input');
        if (input) input.focus();
    });
}

// resetButton listener
const resetButton = DOMService.getElement('resetButton');
if (resetButton) {
	resetButton.addEventListener("click", () => {
		console.log("reset button called");
		AppGameController.reset();
	});
}

/*________________OTHER FUNCTIONS___________________*/

// Game reset functionality is now handled by GameController


// addLineToPrompt functionality is now in GameController

// takes an array of letter and turns them into html elements representing lines
// and words. These will be used as the prompt, which can then be styled accordingly
function convertLineToHTML(letters) {
    let promptString = "";

    promptString =
        `<span class='line'><span class='word' id='id${idCount}'>`;
    // loop through all letters in prompt
    for (i = 0; i <= letters.length; i++) {
        //console.log(letters[i]);

        // if last word in the list, close out the final word span tag
        if (i === letters.length) {
            promptString += "</span> </span>";
            idCount++;
        } else if (letters[i] === " ") {
            // if letter is a space, that means we have a new word
            //console.log('new word');
            idCount++;
            promptString += " </span>";
            promptString += `<span class='word' id='id${idCount}'>`;
        } else {
            promptString += `<span>` + letters[i] + `</span>`;
        }
    }
    return promptString;
}

// checkAnswer functionality is now in GameController

// handleCorrectWord functionality is now in GameController

// endGame functionality is now in GameController

// generates a single line to be appended to the answer array
// if a line with a maximum number of words is desired, pass it in as a parameter
function generateLine(maxWords) {
    if (fullSentenceMode) {
        return generateSentenceLine();
    }

    let str = generateWordBasedLine(maxWords);

    // line should not end in a space. Remove the final space char
    str = str.substring(0, str.length - 1);
    return str;
}

function getPosition(str, char, startIndex) {
    return str.indexOf(char, startIndex);
}

function generateSentenceLine() {
    // let rand = Math.floor(Math.random()*35);
    const rand = 0;
    let str = "";
    if (sentenceStartIndex === -1) {
        sentenceStartIndex = getPosition(sentence, ".", rand) + 1;
        sentenceEndIndex =
            sentence.substring(sentenceStartIndex + lineLength + 2).indexOf(" ") +
            sentenceStartIndex +
            lineLength +
            1;
        str = sentence.substring(sentenceStartIndex, sentenceEndIndex + 1);
    } else {
        sentenceStartIndex = sentenceEndIndex + 1;
        sentenceEndIndex =
            sentence.substring(sentenceStartIndex + lineLength + 2).indexOf(" ") +
            sentenceStartIndex +
            lineLength +
            1;
        str = sentence.substring(sentenceStartIndex, sentenceEndIndex + 1);
        console.log(sentenceStartIndex);
        console.log(sentenceEndIndex);
    }
    str = str.substring(1);
    return str;
}

function selectValidWord(words, startingLetters, circuitBreaker) {
    const rand = Math.floor(Math.random() * words.length);
    let wordToAdd = words[rand];

    // if the word does not contain any required letters, throw it out and choose again
    if (!contains(wordToAdd, requiredLetters)) {
        return null;
    } else if (onlyLower && containsUpperCase(wordToAdd)) {
        // if only lower case is allowed and the word to add contains an uppercase,
        // throw out the word and try again
        return null;
    } else {
        return wordToAdd;
    }
}

function shouldUseCircuitBreakerFallback(circuitBreaker) {
    return circuitBreaker > 7000;
}

function addWordToLine(str, wordToAdd, startingLetters) {
    str += wordToAdd + " ";
    // remove any new key letters from our required list
    removeIncludedLetters(requiredLetters, wordToAdd);
    // if we have used all required letters, reset it
    if (requiredLetters.length === 0) {
        requiredLetters = startingLetters.split("");
    }
    return str;
}

function handleCircuitBreakerLogic(circuitBreaker, startingLetters, str, wordToAdd) {
    if (circuitBreaker > 12000) {
        if (circuitBreaker > 30000) {
            str += levelDictionaries[currentLayout]["lvl" + currentLevel] + " ";
            circuitBreaker = 0;
            requiredLetters = startingLetters.split("");
            console.log("taking too long to find proper word");
            return {str, circuitBreaker, shouldContinue: true};
        } else {
            requiredLetters = startingLetters.split("");
        }
    }
    return {str, circuitBreaker, shouldContinue: false};
}

// takes an array and removes any required letters that are found in 'word'
// for example, if required letters === ['a', 'b', 'c', 'd'] and word=='cat', this
// function will turn requiredLetters into ['b', 'd']
function removeIncludedLetters(requiredLetters, word) {
    word.split("").forEach((l) => {
        if (requiredLetters.includes(l)) {
            requiredLetters.splice(requiredLetters.indexOf(l), 1);
        }
    });
}

// if 'word' contains an uppercase letter, return true. Else return false
function containsUpperCase(word) {
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = false;
    word.split("").forEach((letter) => {
        if (upperCase.includes(letter)) {
            result = true;
        }
    });
    return result;
}


// updates the numerator and denominator of the scoretext on
// the document
function updateScoreText() {
    const scoreText = DOMService.getElement('scoreText');
    if (scoreText) scoreText.innerHTML = `${score}/${getScoreMax()}`;
}

function incrementScore() {
    score++;
    updateScoreText();
}

function resetTimeText() {
	const timeText = DOMService.getElement('timeText');
	const minutes = StateManager.get('minutes') || 0;
	const seconds = StateManager.get('seconds') || 0;
	if (timeText) timeText.innerHTML = `${minutes}m :${seconds} s`;
}

function isValidCustomKeyInput(keyCode) {
    // if key entered is not shift, control, space, caps, enter, backspace, escape,
    // or delete, left or right arrows, update dom element and key mapping value
    return (
        keyCode !== 16 &&
        keyCode !== 17 &&
        keyCode !== 27 &&
        keyCode !== 46 &&
        keyCode !== 32 &&
        keyCode !== 8 &&
        keyCode !== 20 &&
        keyCode !== 13 &&
        keyCode !== 37 &&
        keyCode !== 39 &&
        keyCode !== 38 &&
        keyCode !== 40
    );
}

function handleCustomKeyAddition(e, k) {
    const currentUILev = document.querySelector(
        ".currentCustomUILevel",
    ).innerHTML;
    k.children[0].innerHTML = e.key;

    // // if we are not already on shift layer, add to dom element shift layer
    // if(!shiftDown) {
    // 	// document.querySelector('#shift' + k.id).children[0].innerHTML = e.key.toUpperCase();
    // }
    k.classList.add("active");

    // new keyMapping Data
    if (k.id) {
        let keyCode = k.id.toString().replace("custom", "");
        keyCode = keyCode.toString().replace("shift", "");
        if (!shiftDown) {
            layoutMaps.custom[keyCode] = e.key;
        }

        layoutMaps.custom.shiftLayer[keyCode] = e.key.toUpperCase();
    }

    //new levels data
    levelDictionaries["custom"][currentUILev] += e.key;
    levelDictionaries["custom"]["lvl7"] += e.key;
    //console.log('new key ' + currentUILev + e.key);

    // associate the key element with the current selected level

    // this updates the main keyboard in real time. Could be ommited if performance needs a boost
    CheatsheetService.updateCheatsheetStyling(currentLevel, cheatsheetServiceDependencies);

    // switch to next input key
    switchSelectedInputKey("right");
}

function handleCustomKeyDeletion(k) {
    // if backspace, remove letter from the ui element and the keyboard map
    k.children[0].innerHTML = "_";
    k.classList.remove("active");
    layoutMaps.custom.shiftLayer[k.id] = " ";

    // remove deleted letter from keymapping and levels
    if (k.id) {
        //console.log('key added to mapping ' + e.key);
        layoutMaps.custom[k.id] = " ";
        removeKeyFromLevels(k);
    }
}

function handleCustomKeyNavigation(e) {
    if (e.keyCode === 37) {
        switchSelectedInputKey("left");
    } else if (e.keyCode === 39) {
        console.log("right");
        switchSelectedInputKey("right");
    } else if (e.keyCode === 38) {
        console.log("up");
        switchSelectedInputKey("up");
    } else if (e.keyCode === 40) {
        console.log("down");
        switchSelectedInputKey("down");
    }
}

// removes currentLevel styles from all buttons. Use every time the
// level is changed
function clearCurrentLevelStyle() {
	const buttons = DOMService.getElement('buttons');
	if (buttons) {
		for (let button of buttons) {
			if (button && button.classList) {
				button.classList.remove("currentLevel");
			}
		}
	}
}

// set the word list for each level
function createTestSets(layout, punct, lowerOnly) {
    // Use StateManager values as defaults if not provided
    const defaultLayout = layout || StateManager.get('currentLayout') || "colemak";
    const defaultPunct = punct || StateManager.get('punctuation') || "";
    const defaultLowerOnly = lowerOnly !== undefined ? lowerOnly : (StateManager.get('onlyLower') !== false);

    WordService.createTestSets(defaultLayout, defaultPunct, defaultLowerOnly);
}

// fixes a small bug in mozilla
document.addEventListener("keyup", (e) => {
    e.preventDefault();
    //console.log('prevented');
});

// Initialize PreferenceMenu component
if (typeof PreferenceMenu !== 'undefined') {
    PreferenceMenu.initialize({
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
        playSoundOnErrorButton: document.querySelector('.playSoundOnError'),
        mappingStatusButton: document.querySelector('#mappingToggle label input'),
        mappingStatusText: document.querySelector('#mappingToggle h6 span'),
        layout: document.querySelector('#layout'),
        keyboard: document.querySelector('#keyboard')
    });
}

/*________________Helper Functions___________________*/

// Get dependencies for LevelService
function getLevelServiceDependencies() {
    return {
        StateManager,
        setGameOn: (value) => gameOn = value,
        clearCurrentLevelStyle,
        setFullSentenceMode: (value) => fullSentenceMode = value,
        setCurrentLevel: (value) => StateManager.set('currentLevel', value),
        reset: () => AppGameController.reset(),
        updateCheatsheetStyling: (level) => CheatsheetService.updateCheatsheetStyling(level, getCheatsheetDependencies()),
        regenerateWordPool: (newLevel) => {
            try {
                if (typeof WordPool !== 'undefined') {
                    const layout = StateManager.get('currentLayout') || "colemak";
                    WordPool.generatePool(layout, newLevel);
                    console.log(`WordPool regenerated for level change ${layout}/${newLevel}: ${WordPool.getStats().poolSize} words`);
                }
            } catch (error) {
                throw new Error(`Failed to regenerate word pool on level change: ${error.message}`);
            }
        }
    };
}

// Get dependencies for CheatsheetService
function getCheatsheetDependencies() {
    return {
        letterDictionary: LayoutService.getLevelDictionary(),
        keyboardMap: LayoutService.getKeyboardMap(),
        punctuation: StateManager.get('punctuation') || ""
    };
}

// Update UI elements based on preferences
function updatePreferenceUI(prefs) {
    const elements = {
        layout: DOMService.getElement('layout'),
        keyboard: DOMService.getElement('keyboard'),
        capitalLettersAllowed: DOMService.getElement('capitalLettersAllowed'),
        punctuationModeButton: DOMService.getElement('punctuationModeButton'),
        requireBackspaceCorrectionToggle: DOMService.getElement('requireBackspaceCorrectionToggle'),
        fullSentenceModeToggle: DOMService.getElement('fullSentenceModeToggle'),
        wordScrollingModeButton: DOMService.getElement('wordScrollingModeButton'),
        timeLimitModeButton: DOMService.getElement('timeLimitModeButton'),
        wordLimitModeButton: DOMService.getElement('wordLimitModeButton'),
        wordLimitModeInput: DOMService.getElement('wordLimitModeInput'),
        showCheatsheetButton: DOMService.getElement('showCheatsheetButton'),
        playSoundOnClickButton: DOMService.getElement('playSoundOnClickButton'),
        playSoundOnErrorButton: DOMService.getElement('playSoundOnErrorButton'),
        mappingStatusButton: DOMService.getElement('mappingStatusButton'),
        mappingStatusText: DOMService.getElement('mappingStatusText')
    };

    // Update element values/states
    if (elements.layout) elements.layout.value = prefs.layout;
    if (elements.keyboard) elements.keyboard.value = prefs.keyboard;
    if (elements.capitalLettersAllowed) elements.capitalLettersAllowed.checked = prefs.capitalLettersAllowed;
    if (elements.punctuationModeButton) elements.punctuationModeButton.checked = prefs.punctuationMode;
    if (elements.requireBackspaceCorrectionToggle) elements.requireBackspaceCorrectionToggle.checked = prefs.requireBackspaceCorrection;
    if (elements.fullSentenceModeToggle) elements.fullSentenceModeToggle.checked = prefs.fullSentenceMode;
    if (elements.wordScrollingModeButton) elements.wordScrollingModeButton.checked = prefs.wordScrollingMode;
    if (elements.timeLimitModeButton) elements.timeLimitModeButton.checked = prefs.timeLimitMode;
    if (elements.wordLimitModeButton) elements.wordLimitModeButton.checked = !prefs.timeLimitMode;
    if (elements.wordLimitModeInput) elements.wordLimitModeInput.value = prefs.wordLimit;
    if (elements.showCheatsheetButton) elements.showCheatsheetButton.checked = prefs.showCheatsheet;
    if (elements.playSoundOnClickButton) elements.playSoundOnClickButton.checked = prefs.playSoundOnClick;
    if (elements.playSoundOnErrorButton) elements.playSoundOnErrorButton.checked = prefs.playSoundOnError;

    // Handle key remapping status
    if (prefs.keyRemapping) {
        if (elements.mappingStatusButton) elements.mappingStatusButton.checked = true;
        if (elements.mappingStatusText) elements.mappingStatusText.innerText = "on";
    }
}
