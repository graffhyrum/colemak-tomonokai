var wordLists = {
	lvl1: [],
	lvl2: [],
	lvl3: [],
	lvl4: [],
	lvl5: [],
	lvl6: [],
	lvl7: [],
};

var alphabet = "abcdefghijklmnopqrstuvwxyz',.-";

// generate new list that includes certain letters and excludes others
var customList = [];

// returns the index of the nth occurance of a char or string
function getPosition(target, subString, n) {
	return target.split(subString, n).join(subString).length;
}

// returns true if target (a string) contains at least one letter from
// pattern (an array of chars)
function contains(target, pattern) {
	let value = 0;
	pattern.forEach((letter) => {
		value = value + target.includes(letter);
	});
	return value >= 1;
}

// generates a list of words containing only the given letters
function generateList(lettersToInclude, requiredLetters) {
	const excludes = [];

	// create the list of letters to exclude from final list so
	// at the end you have only desired letters
	alphabet.split("").forEach((l) => {
		if (!lettersToInclude.includes(l)) {
			excludes.push(l);
		}
	});

	const wordList = [];

	masterList.forEach((word) => {
		if (
			!contains(word.toLowerCase(), excludes) &&
			contains(word, requiredLetters.split(""))
		) {
			wordList.push(word);
		}
	});

	return wordList;
}
