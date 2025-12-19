function handleKeyMapping(e) {
	// Only prevent default for key remapping, allow normal input otherwise
	const char = e.code;
	const inputElement = DOMService.getElement('input');

	// Handle key remapping
	if (StateManager.get('keyRemapping') === "true") {
		// Prevent default only for remapped keys
		if (char in keyboardMap && gameOn) {
			e.preventDefault();
			if (!e.shiftKey) {
				if (inputElement) inputElement.value += keyboardMap[char];
			} else {
				// if shift key is pressed, get final input from
				// keymap shift layer. If shiftlayer doesn't exist
				// use a simple toUpperCase
				if (keyboardMap.shiftLayer === "default") {
					if (inputElement) inputElement.value += keyboardMap[char].toUpperCase();
				} else {
					// get char from shiftLayer
					if (inputElement) inputElement.value += keyboardMap.shiftLayer[char];
				}
			}
		}
		// For non-remapped keys in remapping mode, allow default behavior
	} else {
		// For normal mode, allow all default behavior except special keys
		if (specialKeyCodes.includes(e.keyCode) || e.key === "Process") {
			// Prevent default for special keys
			e.preventDefault();
		} else {
			// For normal keys, check accuracy and update visual feedback
			setTimeout(() => {
				const inputElement = DOMService.getElement('input');
				if (inputElement) {
					const currentInput = inputElement.value;
					const correctAnswer = StateManager.get('correctAnswer') || '';
					// Use current input length as the position to check
					const currentPosition = currentInput.length;

					if (currentPosition > 0 && correctAnswer.length >= currentPosition) {
						const typedChar = currentInput[currentPosition - 1];
						const expectedChar = correctAnswer[currentPosition - 1];

						if (typedChar === expectedChar) {
							// Correct - turn green
							if (window.VisualFeedback) {
								window.VisualFeedback.updateLetterColor(StateManager.get('wordIndex') || 0, currentPosition - 1, 'green');
							}
							// Also update input color
							inputElement.style.color = "black";
						} else {
							// Incorrect - turn red
							if (window.VisualFeedback) {
								window.VisualFeedback.updateLetterColor(StateManager.get('wordIndex') || 0, currentPosition - 1, 'red');
							}
							// Also update input color
							inputElement.style.color = "red";
						}
					}
				}
			}, 0); // Allow input to update
		}
	}
}
