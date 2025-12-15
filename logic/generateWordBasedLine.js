let requiredLetters = "";

function generateWordBasedLine(maxWords) {
	const words = WordService.getWordList(currentLevel);
	let str = "";

	if (words && words.length > 0) {
		const startingLetters =
			(LayoutService.getLevelLetters(currentLevel) || '') + punctuation;



		// if this counter hits a high enough number, there are likely no words matching the search
		// criteria. If that happens, reset required letters
		let circuitBreaker = 0;

		let wordsCreated = 0;

		for (let i = 0; i < lineLength; i = i) {
			if (wordsCreated >= maxWords) {
				break;
			}

			const wordToAdd = selectValidWord(words, startingLetters, circuitBreaker);

			const circuitResult = handleCircuitBreakerLogic(circuitBreaker, startingLetters, str, wordToAdd);
			str = circuitResult.str;
			circuitBreaker = circuitResult.circuitBreaker;
			if (circuitResult.shouldContinue) {
				i += wordToAdd.length;
				wordsCreated++;
				continue;
			}

			if (wordToAdd) {
				str = addWordToLine(str, wordToAdd, startingLetters);
				i += wordToAdd.length;
				wordsCreated++;
			}

			circuitBreaker++;
			// if we're having trouble finding a word with a require letter, reset 'required letters'
			if (shouldUseCircuitBreakerFallback(circuitBreaker)) {
				const fallbackWord = randomLetterJumble();
				str += fallbackWord + " ";
				i += fallbackWord.length;
				wordsCreated++;
				requiredLetters = startingLetters.split("");
			}
		}
	} else {
		const startingLetters =
			levelDictionaries[currentLayout]["lvl" + currentLevel] + punctuation;
		// if there are no words with the required letters, all words should be set to the
		// current list of required letters
		let wordsCreated = 0;
		if (levelDictionaries[currentLayout]["lvl" + currentLevel].length === 0) {
			str = "";
		} else {
			for (let i = 0; i < lineLength; i = i) {
				const wordToAdd = randomLetterJumble();
				str += wordToAdd + " ";
				i += wordToAdd.length;
				console.log("i: " + i);
				wordsCreated++;
				if (wordsCreated >= maxWords) {
					break;
				}
			}
		}
	}

	return str;
}

// creates a random jumble of letters to be used when no words are found for a target letter
function randomLetterJumble() {
	const randWordLength = Math.floor(Math.random() * 5) + 1;
	let jumble = "";
	for (let i = 0; i < randWordLength; i++) {
		const rand = Math.floor(
			Math.random() *
			levelDictionaries[currentLayout]["lvl" + currentLevel].length,
		);
		jumble += levelDictionaries[currentLayout]["lvl" + currentLevel][rand];
	}

	return jumble;
}
