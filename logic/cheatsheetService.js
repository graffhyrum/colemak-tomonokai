// Cheatsheet styling functionality extracted from app.js
const CheatsheetService = {
	updateCheatsheetStyling: function(level, dependencies) {
		const { letterDictionary, keyboardMap, punctuation } = dependencies;

		// loop through all buttons
		const allKeys = document.querySelectorAll(".key");
		for (n of allKeys) {
			//reset all keys to default
			n.classList.add("inactive");
			n.classList.remove("active");
			n.classList.remove("homeRow");
			n.classList.remove("currentLevelKeys");
			n.classList.remove("punctuation");
			n.innerHTML = `
				<span class='letter'></span>
			`;

			// set of keys to loop through the letter dictionary, which
			// contains info about which levels each key appears at
			const objKeys = Object.keys(letterDictionary);

			// check active levels and apply styling
			for (let i = 0; i < level; i++) {
				// the letter that will appear on the key
				const letter = keyboardMap[n.id];

				const lettersToCheck = letterDictionary[objKeys[i]] + punctuation;

				const containsLetter = lettersToCheck.includes(letter);
				if (containsLetter) {
					n.innerHTML =
						`
						<span class='letter'>` +
						letter +
						`</span>
					`;
					n.classList.remove("inactive");
					if (punctuation.includes(letter)) {
						n.classList.remove("active");
						n.classList.add("punctuation");
					} else if (i === 0) {
						n.classList.add("homeRow");
					} else if (i === 6) {
						// all words selected
					} else if (i === level - 1) {
						n.classList.remove("active");
						n.classList.add("currentLevelKeys");
					} else {
						n.classList.add("active");
					}
				}
			}
		}
	}
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = CheatsheetService;
} else {
	window.CheatsheetService = CheatsheetService;
}
