/*_____________dom elements_________*/
const prompt = document.querySelector(".prompt"),
	//

	//
	scoreText = document.querySelector("#scoreText"),
	//
	timeText = document.querySelector("#timeText"),
	//
	resetButton = document.querySelector("#resetButton"),
	//
	accuracyText = document.querySelector("#accuracyText"),
	//
	wpmText = document.querySelector("#wpmText"),
	//
	testResults = document.querySelector("#testResults"),
	//
	input = document.querySelector("#userInput"),
	// the main typing area
	inputKeyboard = document.querySelector("#inputKeyboard"),
	// keyboard layout customization ui
	inputShiftKeyboard = document.querySelector("#inputShiftKeyboard"),
	// the dom element representing the shift keys in customization ui
	customInput = document.querySelector(".customInput"),
	//

	buttons = document.querySelector("nav").children,
	//

	// layout select menu
	select = document.querySelector("select"),
	//
	mappingStatusButton = document.querySelector("#mappingToggle label input"),
	//
	mappingStatusText = document.querySelector("#mappingToggle h6 span"),
	// save button on the custom layout ui
	saveButton = document.querySelector(".saveButton"),
	// discard button on the custom layout ui
	discardButton = document.querySelector(".discardButton"),
	// open button for the custom layout ui
	openUIButton = document.querySelector(".openUIButton"),
	// custom ui input field for custom keys
	customUIKeyInput = document.querySelector("#customUIKeyInput");

// Game state variables managed by StateManager
let promptOffset = 0;
let score;
let seconds = 0;
let minutes = 0;
let gameOn = false;
let correct = 0;
let errors = 0;
let correctAnswer;
let letterIndex = 0;
let answerString = "";
let shiftDown = false;
let fullSentenceMode = false;
let deleteFirstLine = false;
let deleteLatestWord = false;
let sentenceStartIndex = -1;
let sentenceEndIndex;
let lineLength = 23;
let lineIndex = 0;
let wordIndex = 0;
let idCount = 0;
let answerWordArray = [];
let specialKeyCodes = [
	27, 9, 20, 17, 18, 93, 36, 37, 38, 39, 40, 144, 36, 8, 16, 30, 32, 13, 91, 92,
	224, 225,
];


// Get state from StateManager
let scoreMax = StateManager.get('scoreMax') || 50;
let currentLevel = StateManager.get('currentLevel') || 1;
let onlyLower = StateManager.get('onlyLower') !== false;
let currentLayout = StateManager.get('currentLayout') || "colemak";
let currentKeyboard = StateManager.get('currentKeyboard') || "ansi";
let fullSentenceModeEnabled = StateManager.get('fullSentenceModeEnabled') === "true";
let requireBackspaceCorrection = StateManager.get('requireBackspaceCorrection') !== false;
let timeLimitMode = StateManager.get('timeLimitMode') === "true";
let wordScrollingMode = StateManager.get('wordScrollingMode') !== false;
let showCheatsheet = StateManager.get('showCheatsheet') !== false;
let playSoundOnClick = StateManager.get('playSoundOnClick') === "true";
let playSoundOnError = StateManager.get('playSoundOnError') === "true";
let punctuation = StateManager.get('punctuation') || "";

// Get layout and dictionary from LayoutService
let keyboardMap = layoutMaps["colemak"];
let letterDictionary = levelDictionaries["colemak"];
let initialCustomKeyboardState = "";
let initialCustomLevelsState = "";

// Dependencies for LevelService
const levelServiceDependencies = {
	StateManager,
	setGameOn: (value) => gameOn = value,
	clearCurrentLevelStyle,
	setFullSentenceMode: (value) => fullSentenceMode = value,
	setCurrentLevel: (value) => currentLevel = value,
	reset,
	updateCheatsheetStyling: (level) => CheatsheetService.updateCheatsheetStyling(level, { letterDictionary, keyboardMap, punctuation }),
	regenerateWordPool: (newLevel) => {
		try {
			if (typeof WordPool !== 'undefined') {
				WordPool.generatePool(currentLayout, newLevel);
				console.log(`WordPool regenerated for level change ${currentLayout}/${newLevel}: ${WordPool.getStats().poolSize} words`);
			}
		} catch (error) {
			// Crash as requested
			throw new Error(`Failed to regenerate word pool on level change: ${error.message}`);
		}
	}
};

// Dependencies for CheatsheetService
const cheatsheetServiceDependencies = {
	letterDictionary,
	keyboardMap,
	punctuation
};



// preference menu dom elements
let preferenceButton = document.querySelector(".preferenceButton"),
	preferenceMenu = document.querySelector(".preferenceMenu"),
	closePreferenceButton = document.querySelector(".closePreferenceButton"),
	capitalLettersAllowed = document.querySelector(".capitalLettersAllowed"),
	fullSentenceModeToggle = document.querySelector(".fullSentenceMode"),
	fullSentenceModeLevelButton = document.querySelector(".lvl8"),
	requireBackspaceCorrectionToggle = document.querySelector(
		".requireBackspaceCorrectionToggle",
	),
	wordLimitModeButton = document.querySelector(".wordLimitModeButton"),
	wordLimitModeInput = document.querySelector(".wordLimitModeInput"),
	timeLimitModeButton = document.querySelector(".timeLimitModeButton"),
	timeLimitModeInput = document.querySelector(".timeLimitModeInput"),
	wordScrollingModeButton = document.querySelector(".wordScrollingModeButton"),
	punctuationModeButton = document.querySelector(".punctuationModeButton"),
	showCheatsheetButton = document.querySelector(".showCheatsheetButton"),
	playSoundOnClickButton = document.querySelector(".playSoundOnClick"),
	playSoundOnErrorButton = document.querySelector(".playSoundOnError");

start();
init();

// this is the true init, which is only called once. Init will have to be renamed
// Call to initialize
function start() {
	//document.querySelector('.cheatsheet').innerHTML = keyboardDivs;
	inputKeyboard.innerHTML = customLayout;
	// scoreMax = wordLimitModeInput.value;
	customInput.style.display = "flex";

	if (!wordScrollingMode) {
		toggleWordScrollingModeUI();
	}

	if (fullSentenceModeEnabled) {
		toggleFullSentenceModeUI();
	}

	if (timeLimitMode) {
		toggleTimeLimitModeUI();
	}

	// if true, user keyboard input will be mapped to the chosen layout. No mapping otherwise
	if (StateManager.get('keyRemapping') === "true") {
		mappingStatusButton.checked = "checked";
		mappingStatusText.innerText = "on";
	}

	layout.value = currentLayout;
	keyboard.value = currentKeyboard;
	capitalLettersAllowed.checked = !onlyLower;
	punctuationModeButton.checked = punctuation;
	requireBackspaceCorrectionToggle.checked = requireBackspaceCorrection;
	fullSentenceModeToggle.checked = fullSentenceModeEnabled;
	wordScrollingModeButton.checked = wordScrollingMode;
	timeLimitModeButton.checked = timeLimitMode;
	wordLimitModeButton.checked = !timeLimitMode;
	wordLimitModeInput.value = scoreMax;
	showCheatsheetButton.checked = showCheatsheet;
	playSoundOnClickButton.checked = playSoundOnClick;
	playSoundOnErrorButton.checked = playSoundOnError;

	if (StorageService.get("preferenceMenu")) {
		openMenu();
	}

	if (!showCheatsheet) {
		document.querySelector(".cheatsheet").classList.add("noDisplay");
	}

	LevelService.switchLevel(currentLevel, levelServiceDependencies);

	updateLayoutUI();
}

// some of the stuff in this function should probably be put into reset and we should examine when reset is called
// the rest should be in start(), which works like an actual init function should
// RENAME AND REFACTOR THIS PLEASE
function init() {
	createTestSets();
	reset();
	CheatsheetService.updateCheatsheetStyling(currentLevel, cheatsheetServiceDependencies);
	updateLayoutNameDisplay();
}

/*________________Timers and Listeners___________________*/

// makes the clock tic
setInterval(() => {
	if (gameOn) {
		if (!timeLimitMode) {
			seconds++;
			if (seconds >= 60) {
				seconds = 0;
				minutes++;
			}
		} else {
			// clock counting down
			seconds--;
			if (seconds <= 0 && minutes <= 0) {
				endGame();
			}
			if (seconds < 0) {
				seconds = 59;
				minutes--;
			}
		}
		resetTimeText();
	}
}, 1000);

// starts the timer when there is any change to the input field
input.addEventListener("keydown", (e) => {
	gameOn = true;
});

/*___________________________________________________________*/
/*____________________preference menu________________________*/

function openMenu() {
	preferenceMenu.style.right = 0;
	StorageService.set("preferenceMenu", "open");
}

function closeMenu() {
	preferenceMenu.style.right = "-37vh";
	StorageService.remove("preferenceMenu");
}

// close preference menu on escape key. While we're at it, also close custom
// ui menu
document.addEventListener("keydown", (e) => {
	if (e.keyCode === 27) {
		closeMenu();

		// close custom ui menu
		if (customInput.style.transform !== "scaleX(0)") {
			customInput.style.transform = "scaleX(0)";
			// remove active class from current key
			clearSelectedInput();
			init();
		}
	}
});

// listener for preference menu button
preferenceButton.addEventListener("click", () => {
	openMenu();
});

// listener for preference menu close button
closePreferenceButton.addEventListener("click", () => {
	closeMenu();
});

// capital letters allowed
capitalLettersAllowed.addEventListener("click", () => {
	onlyLower = !onlyLower;
	StorageService.set("onlyLower", onlyLower);
	createTestSets(currentLayout, punctuation, onlyLower);
	reset();
});

requireBackspaceCorrectionToggle.addEventListener("click", () => {
	requireBackspaceCorrection = !requireBackspaceCorrection;
	StorageService.set("requiredLetters", requiredLetters);
	reset();
});

// full sentence mode
function toggleFullSentenceModeUI() {
	fullSentenceModeLevelButton.classList.toggle("visible");
}

fullSentenceModeToggle.addEventListener("click", () => {
	fullSentenceModeEnabled = !fullSentenceModeEnabled;
	StorageService.set("fullSentenceModeEnabled", fullSentenceModeEnabled);
	toggleFullSentenceModeUI();
	if (fullSentenceModeEnabled) {
		LevelService.switchLevel(8, levelServiceDependencies);
	} else {
		LevelService.switchLevel(1, levelServiceDependencies);
	}
	reset();
});

// Toggle display of time limit mode input field
function toggleTimeLimitModeUI() {
	seconds = timeLimitModeInput.value % 60;
	minutes = Math.floor(timeLimitModeInput.value / 60);
	scoreText.style.display = "none";

	// make the word list long enough so that no human typer can reach the end
	scoreMax = timeLimitModeInput.value * 4;

	// toggle value of word limit mode button
	wordLimitModeButton.checked = !wordLimitModeButton.checked;

	// toggle display of input fields
	timeLimitModeInput.classList.toggle("noDisplay");
	wordLimitModeInput.classList.toggle("noDisplay");
}

// time limit mode button; if this is checked, uncheck button for word limit and vice versa
timeLimitModeButton.addEventListener("click", () => {
	if (timeLimitMode === true) {
		timeLimitModeButton.checked = true;
	} else {
		// change mode logic here
		timeLimitMode = true;
		toggleTimeLimitModeUI();
	StorageService.set("timeLimitMode", timeLimitMode);
		reset();
	}
});

// time limit mode field
timeLimitModeInput.addEventListener("change", () => {
	let wholeSecond = Math.floor(timeLimitModeInput.value);

	scoreMax = wholeSecond * 10;

	if (wholeSecond < 1 || wholeSecond > 10000) {
		wholeSecond = 60;
	}

	// set the dom element to a whole number (in case the user puts in a decimal)
	timeLimitModeInput.value = wholeSecond;

	seconds = wholeSecond % 60;
	minutes = Math.floor(wholeSecond / 60);

	gameOn = false;
	resetTimeText();
});

// word Limit mode butto; if this is checked, uncheck button for time limit and vice versa
// Toggle display of word limit mode input field
wordLimitModeButton.addEventListener("click", () => {
	if (timeLimitMode === false) {
		wordLimitModeButton.checked = true;
	} else {
		// change mode logic here
		timeLimitMode = false;
		seconds = 0;
		minutes = 0;
		scoreText.style.display = "flex";

		// set score max back to the chosen value
		scoreMax = wordLimitModeInput.value;

		// toggle value of time limit mode button
		timeLimitModeButton.checked = !timeLimitModeButton.checked;

		// toggle display of input fields
		timeLimitModeInput.classList.toggle("noDisplay");
		wordLimitModeInput.classList.toggle("noDisplay");

	StorageService.set("timeLimitMode", timeLimitMode);

		reset();
	}
});

// word Limit input field
wordLimitModeInput.addEventListener("change", () => {
	let value = parseInt(wordLimitModeInput.value);
	if (value > 500) {
		scoreMax = 500;
		wordLimitModeInput.value = 500;
	} else if (value >= 1) {
		scoreMax = value;
	} else {
		scoreMax = 10;
		wordLimitModeInput.value = 10;
	}

	StorageService.set("scoreMax", scoreMax);

	reset();
});

// word scrolling mode
function toggleWordScrollingModeUI() {
	prompt.classList.toggle("paragraph");
	// remove fade from parent
	document.querySelector("#fadeElement").classList.toggle("fade");
}

wordScrollingModeButton.addEventListener("click", () => {
	wordScrollingMode = !wordScrollingMode;
	StorageService.set("wordScrollingMode", wordScrollingMode);
	toggleWordScrollingModeUI();
	reset();
});

// punctuation mode
punctuationModeButton.addEventListener("click", () => {
	console.log("punctuation mode toggled");
	// if turning punctuation mode on
	if (punctuation === "") {
		punctuation = "'.-";
	} else {
		// if turning punctuation mode off
		punctuation = "";
	}

	StorageService.set("punctuation", punctuation);

	createTestSets();
	CheatsheetService.updateCheatsheetStyling(currentLevel, cheatsheetServiceDependencies);
	reset();
});

// show cheatsheet toggle
showCheatsheetButton.addEventListener("click", () => {
	if (showCheatsheet) {
		// hide display for cheatsheet
		document.querySelector(".cheatsheet").classList.add("noDisplay");
	} else {
		// show display for cheatsheet
		document.querySelector(".cheatsheet").classList.remove("noDisplay");
	}

	showCheatsheet = !showCheatsheet;
	StorageService.set("showCheatsheet", showCheatsheet);
});

// play sound on click toggle
playSoundOnClickButton.addEventListener("click", () => {
	playSoundOnClick = !playSoundOnClick;
	StorageService.set("playSoundOnClick", playSoundOnClick);
});

// play sound on error toggle
playSoundOnErrorButton.addEventListener("click", () => {
	playSoundOnError = !playSoundOnError;
	StorageService.set("playSoundOnError", playSoundOnError);
});

/*______________________preference menu______________________*/
/*___________________________________________________________*/

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
/*______________listeners for custom ui input________________*/

function setupCustomLayoutUI() {
	// if custom input is selected, show the ui for custom keyboards
	if (currentLayout === "custom") {
		openUIButton.style.display = "block";
		startCustomKeyboardEditing();
		customUIKeyInput.focus();
	} else {
		customInput.style.transform = "scaleX(0)";
		openUIButton.style.display = "none";
	}
}

function updateLevelLabelsForLayout() {
	// level labels
	for (let i = 1; i <= 6; i++) {
		if (currentLayout === "tarmak" || currentLayout === "tarmakdh") {
			document.querySelector(`.lvl${i}`).innerHTML = `Step ${i - 1}`;
		} else {
			document.querySelector(`.lvl${i}`).innerHTML = `Level ${i}`;
		}
	}
}

function updateKeyboardReferences() {
	// change keyboard map and key dictionary
	LayoutService.setLayout(currentLayout);
	keyboardMap = LayoutService.getKeyboardMap();
	letterDictionary = LayoutService.getLevelDictionary();
}

function updateLayoutUI() {
	updateKeyboardMappingsForLayout();
	setupCustomLayoutUI();
	updateLevelLabelsForLayout();
	updateKeyboardReferences();
	updateLayoutNameDisplay();
}

function updateLayoutNameDisplay() {
	const layoutNameElement = document.querySelector('#layoutName');
	if (layoutNameElement) {
		// Map layout values to display names
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
		const displayName = layoutDisplayNames[currentLayout] || currentLayout;
		console.log('Updating layout name to:', displayName, 'for layout:', currentLayout);
		layoutNameElement.textContent = displayName;
	}
}

// listens for layout change
layout.addEventListener("change", (e) => {
	currentLayout = layout.value;
	StorageService.set("currentLayout", currentLayout);
	updateLayoutUI();
	updateLayoutNameDisplay(); // Update immediately

	// Regenerate word pool for new layout
	try {
		if (typeof WordPool !== 'undefined') {
			WordPool.generatePool(currentLayout, currentLevel);
			console.log(`WordPool regenerated for layout change ${currentLayout}/${currentLevel}: ${WordPool.getStats().poolSize} words`);
		}
	} catch (error) {
		// Crash as requested
		throw new Error(`Failed to regenerate word pool on layout change: ${error.message}`);
	}

	// reset everything
	init();
});

// listens for keyboard change
keyboard.addEventListener("change", (e) => {
	currentKeyboard = keyboard.value;
	StorageService.set("currentKeyboard", currentKeyboard);
	updateLayoutUI();
	// reset everything
	init();
});

// listener for custom layout ui open button
openUIButton.addEventListener("click", () => {
	startCustomKeyboardEditing();
});

// called whenever a user opens the custom editor. Sets correct displays and saves an initial state
// of the keyboard to refer back to if the user wants to discard changes
function startCustomKeyboardEditing() {
	const currentLayoutMaps = typeof layoutMaps !== 'undefined' ? layoutMaps : {};
	const currentLevelDictionaries = typeof levelDictionaries !== 'undefined' ? levelDictionaries : {};
	initialCustomKeyboardState = Object.assign({}, currentLayoutMaps["custom"]);
	initialCustomLevelsState = Object.assign({}, currentLevelDictionaries["custom"]);
	// customInput.style.display = 'flex';
	customInput.style.transform = "scaleX(1)";
	const k = document.querySelector(".defaultSelectedKey");
	selectInputKey(k);
}

// selects an input key on the custom keyboard and applies the correct styling
function selectInputKey(k) {
	// clear previous styling
	clearSelectedInput();

	k.classList.add("selectedInputKey");
	if (k.children[0].innerHTML === "") {
		k.children[0].innerHTML = "_";
	}
	k.children[0].classList.add("pulse");
	customUIKeyInput.focus();
}

// listener for the custom layout ui 'done' button
saveButton.addEventListener("click", () => {
	customInput.style.transform = "scaleX(0)";
	// remove active class from current key
	clearSelectedInput();
	init();
});

// listener for the custom layout ui 'done' button
discardButton.addEventListener("click", () => {
	customInput.style.transform = "scaleX(0)";
	// remove active class from current key
	clearSelectedInput();

	// load the old layout to revert changes, aka discard changes
	loadCustomLayout(initialCustomKeyboardState);
	loadCustomLevels(initialCustomLevelsState);

	console.log(levelDictionaries.custom);

	init();
});

// general click listener
document.addEventListener(
	"click",
	(e) => {
		// close preference menu if click is anywhere other than the preference menu
		let k = e.target.closest(".preferenceMenu");
		if (!k) {
			k = e.target.closest(".preferenceButton");
		}
		if (!k) {
			closeMenu();
		}

		// add key listeners for each of the keys the custom input ui
		// When clicked, a key becomes 'selectedInputKey' and all others lose
		// this class.
		k = e.target.closest(".cKey");
		if (k) {
			// change focus to the customUIKeyInput field
			customUIKeyInput.focus();

			// remove 'selectedInputKey' from any keys previously clicked
			clearSelectedInput();

			k.classList.add("selectedInputKey");
			if (k.children[0].innerHTML === "") {
				k.children[0].innerHTML = "_";
			}
			k.children[0].classList.add("pulse");
		}

		k = e.target.closest(".customUILevelButton");

		// listener for customUILevelButtons
		if (k) {
			// remove styling from other buttons
			let currentSelectedLevel = document.querySelector(
				".currentCustomUILevel",
			);
			if (currentSelectedLevel) {
				currentSelectedLevel.classList.remove("currentCustomUILevel");
			}

			// add styling to selected button
			customUIKeyInput.focus();
			k.classList.add("currentCustomUILevel");
			// set new dom element
			currentSelectedLevel = document.querySelector(".currentCustomUILevel");

			// remove styling from all keys that don't correspond with selected level button
			// add styling to keys that correspond with selected level button
			const allCKeys = document.querySelectorAll(".cKey");
			for (n of allCKeys) {
				if (
					n.children[0].innerHTML !== 0 &&
					levelDictionaries["custom"][currentSelectedLevel.innerHTML].includes(
						n.children[0].innerHTML,
					)
				) {
					n.classList.add("active");
				} else {
					n.classList.remove("active");
				}
			}
		}
	},
	false,
);

// listener for custom input field. Updates on any input, clearing the current selected
// input key, and setting the new value
customUIKeyInput.addEventListener("keydown", (e) => {
	const k = document.querySelector(".selectedInputKey");

	// if there was already a value for this key, remove it from all levels
	if (k.children[0].innerHTML !== "_") {
		removeKeyFromLevels(k);
	}

	if (isValidCustomKeyInput(e.keyCode)) {
		handleCustomKeyAddition(e, k);
	} else if (e.keyCode === 8 || e.keyCode === 46) {
		handleCustomKeyDeletion(k);
	} else {
		handleCustomKeyNavigation(e);
	}

	// clear input field
	customUIKeyInput.value = "";
});

// given a key object, k, remove a value of the letter on k from all levels
function removeKeyFromLevels(k) {
	const lvls = Object.keys(levelDictionaries["custom"]);
	for (lvl of lvls) {
		const keyCode = k.id.toString().replace("custom", "");
		//console.log(levelDictionaries.custom.lvl[keyCode]);
		// replace any instances of letter previously found on key
		levelDictionaries["custom"][lvl] = levelDictionaries["custom"][lvl].replace(
			k.children[0].innerHTML,
			"",
		);
		// replace mapping for letter previously found on key
		layoutMaps["custom"][keyCode] = " ";
	}
}

// sets the custom keyboard layout to be equal to the json parameter passed in
function loadCustomLayout(newCustomLayout) {
	layoutMaps.custom = Object.assign({}, newCustomLayout);
	keyboardMap = layoutMaps.custom;

	const customKeys = document.querySelectorAll(".cKey");
	// load letters onto the custom ui input keyboard
	customKeys.forEach((cKey) => {
		const currentKeyName = cKey.id.substring(6);

		// if the value of the new layout key is not undefined, set it to the corresponding dom element
		if (keyboardMap[currentKeyName]) {
			// if key is blank, remove active styling
			if (keyboardMap[currentKeyName] === " ") {
				cKey.classList.remove("active");
			}
			cKey.innerHTML =
				`
				<span class='letter'>` +
				keyboardMap[currentKeyName] +
				`</span>
			`;
		}
	});
}

// sets the custom levels to be equal to the json parameter passed in
function loadCustomLevels(newCustomLevels) {
	levelDictionaries.custom = Object.assign({}, newCustomLevels);
	letterDictionary = levelDictionaries["custom"];
}

// switches the focus to the next input key, determined by the direction parameter
// Parameter is either left, right, up, or down
function switchSelectedInputKey(direction) {
	let k; // the key to jump to
	if (direction === "right") {
		k = document.querySelector(".selectedInputKey").nextElementSibling;
	} else if (direction === "left") {
		k = document.querySelector(".selectedInputKey").previousElementSibling;
	} else if (direction === "up") {
		let keyPosition;
		const currentKey = document.querySelector(".selectedInputKey");
		for (let i = 0; i < currentKey.parentElement.children.length; i++) {
			if (currentKey.parentElement.children[i] === currentKey) {
				console.log("found! " + i);
				keyPosition = i;
				break;
			}
		}
		k =
			document.querySelector(".selectedInputKey").parentElement
				.previousElementSibling.children[keyPosition];
	} else if (direction === "down") {
		let keyPosition;
		const currentKey = document.querySelector(".selectedInputKey");
		for (let i = 0; i < currentKey.parentElement.children.length; i++) {
			if (currentKey.parentElement.children[i] === currentKey) {
				console.log("found! " + i);
				keyPosition = i;
				break;
			}
		}
		k =
			document.querySelector(".selectedInputKey").parentElement
				.nextElementSibling.children[keyPosition];
	}

	if (k.classList.contains("finalKey")) {
		//if last valid key on keyboard, don't change keysz
		k = document.querySelector(".selectedInputKey");
	} else if (k.classList.contains("rowEnd")) {
		// if last valid key on row, move down a row
		k =
			document.querySelector(".selectedInputKey").parentElement
				.nextElementSibling.children[1];
	} else if (k.classList.contains("rowStart")) {
		// if first valid key on row, move up a row
		k =
			document.querySelector(".selectedInputKey").parentElement
				.previousElementSibling.children[11];
	}

	clearSelectedInput();
	k.classList.add("selectedInputKey");
	if (k.children[0].innerHTML === "") {
		k.children[0].innerHTML = "_";
	}
	k.children[0].classList.add("pulse");
}

// remove 'selectedInputKey' from any keys previously clicked
function clearSelectedInput() {
	const k = document.querySelector(".selectedInputKey");
	if (k) {
		k.classList.remove("selectedInputKey");
		k.children[0].classList.remove("pulse");
		console.log(k.children[0].innerHTML);
		if (k.children[0].innerHTML === "_") {
			k.children[0].innerHTML = "";
		}
	}
}

/*______________listeners for custom ui input________________*/
/*___________________________________________________________*/

// input key listener
input.addEventListener("keydown", (e) => {
	handleLineDeletion();
	handleKeyMapping(e);
	handleWordCompletion(e);
	handleResetKeys(e);
	handleAccuracyChecking(e);
}); // end input key listner

// returns true if the letters typed SO FAR are correct
function checkAnswerToIndex() {
	// user input
	const inputVal = input.value;

	let inputSnippet = inputVal.slice(0, letterIndex);
	let substringToCheck = (correctAnswer || '').slice(0, letterIndex);
	return inputSnippet === substringToCheck;
}

function handleLineDeletion() {
	// handle line transitions
	if (deleteLatestWord) {
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
		deleteLatestWord = false;
	}
}

function handleWordCompletion(e) {
	// listens for the enter  and space key. Checks to see if input contains the
	// correct word. If yes, generate new word. If no, give user
	// negative feedback

	if (e.keyCode === 13 || e.keyCode === 32) {
		if (checkAnswer()) { // Removed gameOn check for testing compatibility
			// stops a ' ' character from being put in the input bar
			// it wouldn't appear until after this function, and would
			// still be there when the user goes to type the next word
			e.preventDefault();

			handleCorrectWord();

			// update scoreText
			updateScoreText();

			// end game if score === scoreMax
			if (score >= scoreMax) {
				endGame();
			}

			// clear input field
			document.querySelector("#userInput").value = "";

			// set letter index (where in the word the user currently is)
			// to the beginning of the word
			letterIndex = 0;
		} else {
			console.log("error space");
			input.value += " ";
			letterIndex++;
		}
	} // end keyEvent if statement
}

function handleResetKeys(e) {
	if (e.keyCode === 9 || e.keyCode === 27) {
		// 9 = Tab, 27 = Esc
		reset();
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
			input.value = input.value.substr(0, input.value.length - 1);
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
	if (checkAnswerToIndex()) {
		input.style.color = "black";
		// no points awarded for backspace
		if (e.keyCode === 8) {
			playClickSound();
			// if backspace, color it grey again
			if (e.ctrlKey) {
				for (let i = 0; i < letterIndex; i++) {
					if (prompt.children[0].children[wordIndex].children[i]) {
						prompt.children[0].children[wordIndex].children[i].style.color =
							"gray";
					}
				}
				input.value = "";
				letterIndex = 0;
			} else {
				if (prompt.children[0].children[wordIndex].children[letterIndex]) {
					prompt.children[0].children[wordIndex].children[
						letterIndex
					].style.color = "gray";
				}
			}
		} else if (!specialKeyCodes.includes(e.keyCode) || e.keyCode === 32) {
			playClickSound();
			correct++;
			// if letter (in the promp) exists, color it green
			if (prompt.children[0].children[wordIndex].children[letterIndex - 1]) {
				prompt.children[0].children[wordIndex].children[
					letterIndex - 1
				].style.color = "green";
			}
		}
	} else {
		console.log("error");
		input.style.color = "red";
		// no points awarded for backspace
		if (e.keyCode === 8) {
			handleKeycodeEight(e);
		} else if (!specialKeyCodes.includes(e.keyCode) || e.keyCode === 32) {
			playErrorSound();
			errors++;
			if (prompt.children[0].children[wordIndex].children[letterIndex - 1]) {
				prompt.children[0].children[wordIndex].children[
					letterIndex - 1
				].style.color = "red";
			}
		}

		if (!requireBackspaceCorrection && !checkAnswerToIndex()) {
			//ignore input if the wrong char was typed (negate need to backspace errors - akin to KeyBr.com's behaviour)
			letterIndex--;
			input.value = input.value.substr(0, input.value.length - 1);

			// letter index cannot be < 0
			if (letterIndex < 0) {
				letterIndex = 0;
			}
		}
	}

	// if on the last word, check every letter so we don't need a space to end the game
	if (!timeLimitMode && score === scoreMax - 1 && checkAnswer() && gameOn) {
		console.log("game over");
		endGame();
	}

	function handleKeycodeEight(e) {
		playClickSound();
		// if backspace, color it grey again
		if (e.ctrlKey) {
			for (let i = 0; i < letterIndex; i++) {
				if (prompt.children[0].children[wordIndex].children[i]) {
					prompt.children[0].children[wordIndex].children[i].style.color =
						"gray";
				}
			}
			input.value = "";
			letterIndex = 0;
		} else {
			if (prompt.children[0].children[wordIndex].children[letterIndex]) {
				prompt.children[0].children[wordIndex].children[
					letterIndex
					].style.color = "gray";
			}
		}
	}
}

// add event listeners to level buttons
for (button of buttons) {
	const b = button;
	b.addEventListener("click", () => {
		let lev = b.innerHTML.replace(/ /, "").toLowerCase();
		// int representation of level we are choosing
		lev = lev[lev.length - 1];
		if (currentLayout === "tarmak" || currentLayout === "tarmakdh") {
			lev++;
		}
		if (b.innerHTML === "All Words") {
			lev = 7;
		} else if (b.innerHTML === "Full Sentences") {
			lev = 8;
		}
		LevelService.switchLevel(lev, levelServiceDependencies);
	});
}





// listener for keyboard mapping toggle switch
mappingStatusButton.addEventListener("click", () => {
	if (StateManager.get('keyRemapping') === "true") {
		// change the status text
		mappingStatusText.innerText = "off";
		StateManager.set('keyRemapping', false);
	} else {
		// change the status text
		mappingStatusText.innerText = "on";
		StateManager.set('keyRemapping', true);
	}

	// change focus back to input
	input.focus();
});

// resetButton listener
resetButton.addEventListener("click", () => {
	console.log("reset button called");
	reset();
});

/*________________OTHER FUNCTIONS___________________*/

// resets everything to the beginning of game state. Run when the reset
// button is called or when a level is changed
// Set a new prompt word and change variable text
function reset() {
	deleteFirstLine = false; // make this true every time we finish typing a line
	deleteLatestWord = false;

	prompt.innerHTML = "";
	answerString = "";
	input.value = "";
	answerWordArray = [];

	idCount = 0;

	sentenceStartIndex = -1;

	// stop the timer
	gameOn = false;

	// set current letter index back to 0
	letterIndex = 0;
	wordIndex = 0;
	lineIndex = 0;

	// prompt offset back to 0
	promptOffset = 0;
	prompt.style.left = 0;

	// set correct and errors counts to 0
	correct = 0;
	errors = 0;

	// set to -1 before each game because score is incremented every time we call
	// updateScoreText(), including on first load
	score = -1;

	requiredLetters = (
		(LayoutService.getLevelLetters(currentLevel) || '') + punctuation
	).split("");

	// reset clock
	if (!timeLimitMode) {
		minutes = 0;
		seconds = 0;
	} else {
		seconds = timeLimitModeInput.value % 60;
		minutes = Math.floor(timeLimitModeInput.value / 60);
	}

	// reset timeText
	resetTimeText();

	// set mapping to off

	// set accuracyText to be transparent
	testResults.classList.add("transparent");

	// reset button should be available during game
	// resetButton.classList.add("noDisplay");

	//set prompt to visible
	prompt.classList.remove("noDisplay");

	// Initialize or update word pool for current layout/level
	try {
		if (typeof WordPool !== 'undefined') {
			if (WordPool.needsRegeneration(currentLayout, currentLevel)) {
				WordPool.generatePool(currentLayout, currentLevel);
				console.log(`WordPool initialized/updated for ${currentLayout}/${currentLevel}: ${WordPool.getStats().poolSize} words`);
			}
		} else {
			throw new Error('WordPool service not available');
		}
	} catch (error) {
		// Crash as requested - testing will catch this
		throw new Error(`Failed to initialize word pool: ${error.message}`);
	}

	if (timeLimitMode) {
		// Time limit mode: Load dynamic word count based on time limit
		const timeLimitSeconds = StateManager.get('timeLimitSeconds') || 60;
		const targetWords = timeLimitSeconds * 3; // 3 words per second
		const chunkSize = 20; // Load in chunks to prevent UI blocking

		let wordsLoaded = 0;
		let chunksLoaded = 0;

		// Load words in chunks until we reach target (max 10 chunks to prevent infinite loops)
		while (wordsLoaded < targetWords && chunksLoaded < 10) {
			const wordsNeeded = Math.min(chunkSize, targetWords - wordsLoaded);

			try {
				const words = WordPool.getRandomWords(wordsNeeded);
				const lineToAdd = words.join(' ');

				answerString += lineToAdd + ' ';
				answerWordArray = answerWordArray.concat(words);

				wordsLoaded += words.length;
				chunksLoaded++;

				// Add each chunk to visual prompt for immediate availability
				prompt.innerHTML += convertLineToHTML(lineToAdd);
			} catch (error) {
				// Crash as requested
				throw new Error(`Failed to load words for time limit mode: ${error.message}`);
			}
		}

		// Track initial word count for lazy loading threshold
		if (typeof WordManager !== 'undefined' && WordManager.setInitialWordCount) {
			WordManager.setInitialWordCount(wordsLoaded);
		}

		// Set correct answer from first word
		if (answerWordArray.length > 0) {
			correctAnswer = answerWordArray[0];
		}

		// Track initial word count for lazy loading threshold
		if (typeof WordManager !== 'undefined' && WordManager.setInitialWordCount) {
			WordManager.setInitialWordCount(wordsLoaded);
		}

		// Set correct answer from first word
		if (answerWordArray.length > 0) {
			correctAnswer = answerWordArray[0];
		} else {
			// Fallback to word limit mode loading if no words were loaded
			console.warn('Time limit mode: No words loaded, falling back to word limit mode loading');
			for (let i = 1; i <= 3; i++) {
				addLineToPrompt();
				if (i === 1 && answerWordArray.length > 0) {
					correctAnswer = answerWordArray[0];
				}
			}
		}
		// Ensure correctAnswer is always defined
		if (!correctAnswer) {
			correctAnswer = 'a';
		}
		StateManager.set('correctAnswer', correctAnswer);
	} else {
		// Word limit mode: Load 3 lines using WordPool
		try {
			for (let i = 1; i <= 3; i++) {
				const words = WordPool.getRandomWords(10); // Approximate words per line
				const lineToAdd = words.join(' ');

				answerString += lineToAdd;
				prompt.innerHTML += convertLineToHTML(lineToAdd);
				answerWordArray = answerWordArray.concat(words);

				if (i === 1 && answerWordArray.length > 0) {
					correctAnswer = answerWordArray[0];
				}
			}
		} catch (error) {
			// Crash as requested
			throw new Error(`Failed to load words for word limit mode: ${error.message}`);
		}
	}

	// Ensure correctAnswer is always defined
	if (!correctAnswer) {
		correctAnswer = 'a';
	}
	StateManager.set('correctAnswer', correctAnswer);

	answerLetterArray = answerString.split("");
	//reset prompt

	// change the 0/50 text
	updateScoreText();

	// change focus to the input field
	input.focus();
}

// generates a new line, adds it to prompt, and to answerWordArray
function addLineToPrompt() {
	try {
		const remainingWords = Math.max(1, scoreMax - score - answerWordArray.length);
		const words = WordPool.getRandomWords(Math.min(10, remainingWords)); // Limit to ~10 words per line
		const lineToAdd = words.join(' ');

		answerString += lineToAdd;
		prompt.innerHTML += convertLineToHTML(lineToAdd);
		answerWordArray = answerWordArray.concat(words);
	} catch (error) {
		// Crash as requested
		throw new Error(`Failed to add line to prompt: ${error.message}`);
	}
}

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

function checkAnswer() {
	// user input
	const inputVal = input.value;

	return inputVal === correctAnswer;
}

// updates the correct answer and manipulates the dom
// called every time a correct word is typed
function handleCorrectWord() {
	// make sure no 'incorrect' styling still exists
	input.style.color = "black";

	//remove the first word from the answer string
	answerWordArray.shift();

	if (
		prompt.children[0].children.length - 1 === 0 ||
		wordIndex >= prompt.children[0].children.length - 1
	) {
		console.log("new line " + prompt);
		lineIndex++;

		// when we reach the end of a line, generate a new one IF
		// we are more than  2 lines from from the end. This ensures that
		// no extra words are generated when we near the end of the test

		addLineToPrompt();

		//make the first line of the prompt transparent
		if (!wordScrollingMode) {
			prompt.removeChild(prompt.children[0]);
			wordIndex = -1;
		}
	}

	const cur = document.querySelector(`#id${score + 1}`);

	if (wordScrollingMode) {
		// update display
		prompt.classList.add("smoothScroll");
		// find the completed word
		const completedWord = document.querySelector(`#id${score}.word`);
		if (completedWord) {
			// slide by the width of the completed word
			promptOffset += completedWord.offsetWidth;
			// move prompt left
			prompt.style.left = `-${promptOffset}px`;
			// make the completed word transparent (effectively "deleted" from view)
			completedWord.style.opacity = '0';
		}
		// In word scrolling mode, wordIndex stays 0, sliding brings next word into position
	} else {
		// if in paragraph mode, increase word index
		wordIndex++;
	}

	// save the correct answer to a variable before removing it
	// from the answer string
	correctAnswer = answerWordArray[0];
	StateManager.set('correctAnswer', correctAnswer);
}

function endGame() {
	// erase prompt
	prompt.classList.toggle("noDisplay");

	// make resetButton visible
	resetButton.classList.remove("noDisplay");

	// pause timer
	gameOn = false;

	// calculate wpm
	let wpm;
	if (!timeLimitMode) {
		const totalMinutes = minutes + seconds / 60;
		wpm = totalMinutes === 0 ? '0.00' : ((correct + errors) / 5 / totalMinutes).toFixed(2);
	} else {
		wpm = ((correct + errors) / 5 / (timeLimitModeInput.value / 60)).toFixed(2);
	}
	// set accuracyText
	accuracyText.innerHTML =
		`Accuracy: ${((100 * correct) / (correct + errors)).toFixed(2)}%`;
	wpmText.innerHTML = `WPM: ${wpm}`;
	// make accuracy visible
	testResults.classList.toggle("transparent");

	// set correct and errors counts to 0
	correct = 0;
	errors = 0;

	// change focus to resetButton
	resetButton.focus();

	// update scoreText
	updateScoreText();
	// clear input field
	document.querySelector("#userInput").value = "";
	// set letter index (where in the word the user currently is)
	// to the beginning of the word
	letterIndex = 0;
}

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
			return { str, circuitBreaker, shouldContinue: true };
		} else {
			requiredLetters = startingLetters.split("");
		}
	}
	return { str, circuitBreaker, shouldContinue: false };
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
	scoreText.innerHTML = `${++score}/${scoreMax}`;
}

function resetTimeText() {
	timeText.innerHTML = `${minutes}m :${seconds} s`;
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
	for (button of buttons) {
		button.classList.remove("currentLevel");
	}
}

// set the word list for each level
function createTestSets(layout = currentLayout, punct = punctuation, lowerOnly = onlyLower) {
	WordService.createTestSets(layout, punct, lowerOnly);
}

// fixes a small bug in mozilla
document.addEventListener("keyup", (e) => {
	e.preventDefault();
	//console.log('prevented');
});
