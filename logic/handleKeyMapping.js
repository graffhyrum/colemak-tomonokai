function handleKeyMapping(e) {
	// get rid of default key press. We'll handle it ourselves
	e.preventDefault();

	// this is the actual character typed by the user
	const char = e.code;

	// prevent default char from being typed and replace new char from keyboard map
	if (StateManager.get('keyRemapping') === "true") {
		if (char in keyboardMap && gameOn) {
			if (!e.shiftKey) {
				input.value += keyboardMap[char];
			} else {
				// if shift key is pressed, get final input from
				// keymap shift layer. If shiftlayer doesn't exist
				// use a simple toUpperCase
				if (keyboardMap.shiftLayer === "default") {
					input.value += keyboardMap[char].toUpperCase();
				} else {
					// get char from shiftLayer
					input.value += keyboardMap.shiftLayer[char];
				}
			}
		}
	} else {
		//console.log(e.keyCode);
		//console.log(specialKeyCodes.includes(e.keyCode));
		// there is a bug on firefox that occassionally reads e.key as process, hence the boolean expression below
		if (!specialKeyCodes.includes(e.keyCode) && e.key !== "Process") {
			//console.log('Key: ' +e.key);
			//console.log('Code: ' +e.code);
			if (e.key !== "Process") {
				input.value += e.key;
			} else {
				letterIndex--;
			}
		} else {
			//console.log('special Key');
		}
		if (e.keyCode === 32) {
			//console.log('space bar');
			//input.value += " ";
		}
	}
}
