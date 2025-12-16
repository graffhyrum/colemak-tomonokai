// Level switching functionality extracted from app.js
const LevelService = {
	switchLevel: function(lev, dependencies) {
		const {
			StateManager,
			setGameOn,
			clearCurrentLevelStyle,
			setFullSentenceMode,
			setCurrentLevel,
			reset,
			updateCheatsheetStyling
		} = dependencies;

		StateManager.set("currentLevel", lev);
		// stop timer
		setGameOn(false);

		// clear input field
		document.querySelector("#userInput").value = "";

		// clear highlighted buttons
		clearCurrentLevelStyle();
		document.querySelector(".lvl" + lev).classList.add("currentLevel");

		// set full sentence mode to true
		if (lev === 8) {
			setFullSentenceMode(true);
		} else {
			setFullSentenceMode(false);
		}

		if (lev === 8) {
			lev = 7;
		}

		// window[] here allows us to select the variable levelN, instead of
		// setting currentLevelList to a string
		setCurrentLevel(lev);

		// reset everything
		reset();

		// take care of styling for the cheatsheet
		updateCheatsheetStyling(lev);
	}
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = LevelService;
} else {
	window.LevelService = LevelService;
}
