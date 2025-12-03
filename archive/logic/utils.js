// Utility functions extracted from app.js
// Lines 637-657 and related helper functions

export function contains(word, letters) {
    return letters.some(letter => word.includes(letter));
}

export function containsUpperCase(word) {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return word.split('').some((letter) => {
        return upperCase.includes(letter);
    });
}

export function removeIncludedLetters(requiredLetters, word) {
    word.split('').forEach((l) => {
        const index = requiredLetters.indexOf(l);
        if (index > -1) {
            requiredLetters.splice(index, 1);
        }
    });
}

export function getPosition(str, char, n) {
    return str.split(char, n).join(char).length;
}

export function randomLetterJumble(levelDictionaries, currentLayout, currentLevel) {
    const randWordLength = Math.floor(Math.random() * 5) + 1;
    let jumble = "";
    for (let i = 0; i < randWordLength; i++) {
        const letters = levelDictionaries[currentLayout]['lvl' + currentLevel];
        const rand = Math.floor(Math.random() * letters.length);
        jumble += letters[rand];
    }
    return jumble;
}