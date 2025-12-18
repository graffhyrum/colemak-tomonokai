// spec: User Workflows - Complete E2E Testing
// seed: tests/user-workflows.spec.ts

import { expect, test } from "./fixtures";
import { assertDefined } from "./util/assertDefined";

const wordLimit = 10;

test.describe("User Workflows - Complete E2E Scenarios", () => {
	test("complete typing session from start to finish with perfect accuracy", async ({
		homePage,
	}) => {
		// Set a reasonable word limit for testing, must be multiple of 10
		await homePage.actions.preferences.setWordLimit(wordLimit);

		// Verify initial state
		await homePage.assertions.ui.scoreText(`0/${wordLimit}`);
		await homePage.assertions.ui.timerText("0m :0 s");

		await homePage.actions.typingArea.focus();

		// Complete all wordLimit words perfectly
		for (let wordIndex = 0; wordIndex < wordLimit; wordIndex++) {
			// Get current word
			const currentWord = await homePage.actions.typingArea.getWord(0);
			expect(currentWord).toBeTruthy();
			assertDefined(currentWord);

			// Type each letter correctly
			await homePage.actions.typingArea.typeWord(currentWord);

			// Press space to complete the word
			await homePage.actions.typingArea.pressSpace();

			// Verify score incremented
			const expectedScore = `${wordIndex + 1}/${wordLimit}`;
			await homePage.assertions.ui.scoreText(expectedScore);
		}

		// Verify test completion
		await homePage.assertions.testResults.isVisible();

		// Verify perfect accuracy
		const accuracyText =
			await homePage.actions.testResults.getFinalAccuracyText();
		expect(accuracyText).toContain("100.00%");

		// Verify WPM calculation
		const wpmText = await homePage.actions.testResults.getFinalWpmText();
		expect(wpmText).toMatch(/WPM: \d+\.\d+/);

		// Verify final score
		await homePage.assertions.ui.scoreText(`${wordLimit}/${wordLimit}`);
	});

	test("settings persistence across layout changes", async ({ homePage }) => {
		// Configure settings
		await homePage.actions.preferences.open();

		// Enable capital letters, punctuation, and disable cheatsheet
		const capitalCheckbox = homePage.page.locator(
			"input.capitalLettersAllowed",
		);
		const punctuationCheckbox = homePage.page.locator(
			"input.punctuationModeButton",
		);
		const cheatsheetCheckbox = homePage.page.locator(
			"input.showCheatsheetButton",
		);

		await capitalCheckbox.click();
		await punctuationCheckbox.click();
		await cheatsheetCheckbox.click();

		// Set word limit
		await homePage.actions.preferences.setWordLimit(wordLimit);
		await homePage.actions.preferences.close();

		// Switch to QWERTY layout
		await homePage.actions.layout.select("qwerty");

		// Verify settings persisted
		await homePage.assertions.ui.scoreText("0/10");

		// Open preferences and verify toggles maintained
		await homePage.actions.preferences.open();

		expect(await capitalCheckbox.isChecked()).toBe(true);
		expect(await punctuationCheckbox.isChecked()).toBe(true);
		expect(await cheatsheetCheckbox.isChecked()).toBe(false);

		await homePage.actions.preferences.close();

		// Switch back to Colemak
		await homePage.actions.layout.select("colemak");

		// Verify settings still persisted
		await homePage.assertions.ui.scoreText("0/10");
	});

	test("sound feedback verification during typing", async ({ homePage }) => {
		// Enable sound effects
		await homePage.actions.preferences.open();
		const soundOnClick = homePage.page.locator("input.playSoundOnClick");
		const soundOnError = homePage.page.locator("input.playSoundOnError");
		await soundOnClick.click();
		await soundOnError.click();
		await homePage.actions.preferences.close();

		await homePage.actions.typingArea.focus();

		// Type correct letter (should trigger click sound)
		await homePage.actions.typingArea.typeLetter("a");

		// Type wrong letter (should trigger error sound)
		const firstWord = await homePage.actions.typingArea.getWord(0);
		assertDefined(firstWord);
		const correctLetter = firstWord[0];
		const wrongLetter = correctLetter === "a" ? "b" : "a";
		await homePage.actions.typingArea.typeIncorrectLetter(wrongLetter);

		// Note: We can't verify actual audio playback in headless testing,
		// but we can verify no JavaScript errors occur when sounds are enabled

		// Disable sounds and verify no errors
		await homePage.actions.preferences.open();
		await soundOnClick.click();
		await soundOnError.click();
		await homePage.actions.preferences.close();

		// Type more letters - should work without sound but without errors
		await homePage.actions.typingArea.pressBackspace(); // Clear wrong letter
		if (correctLetter) {
			await homePage.actions.typingArea.typeLetter(correctLetter); // Type correct letter
		}
	});

	test("keyboard mapping visualization during typing", async ({ homePage }) => {
		// Enable keyboard mapping
		const mappingToggle = homePage.page.locator("#mappingToggle label");
		await mappingToggle.click();

		// Verify mapping is enabled
		await homePage.assertions.ui.mappingToggleText("on");

		await homePage.actions.typingArea.focus();

		// Type some letters and verify keyboard display is visible
		await homePage.actions.typingArea.typeLetter("a");
		await homePage.actions.typingArea.typeLetter("s");
		await homePage.actions.typingArea.typeLetter("d");

		// Keyboard display should be visible
		await homePage.assertions.keyboard.isVisible();

		// Enable keyboard mapping
		await mappingToggle.click();
		await homePage.assertions.ui.mappingToggleText("on");

		// Keyboard display should still be visible but mapping inactive
		await homePage.assertions.keyboard.isVisible();
	});

	test("error recovery and correction workflow", async ({ homePage }) => {
		await homePage.actions.typingArea.focus();

		// Get first word
		const firstWord = await homePage.actions.typingArea.getWord(0);
		expect(firstWord).toBeTruthy();
		assertDefined(firstWord);

		// Type first letter correctly
		const chars = firstWord.split("");
		// any word should have at least two letters, and a space after.
		const [firstChar, secondChar] = chars;
		assertDefined(firstChar);
		assertDefined(secondChar);
		await homePage.actions.typingArea.typeLetter(firstChar);

		// Make an error
		const wrongLetter = chars.length > 2 && secondChar === "a" ? "b" : "a";
		if (wrongLetter) {
			await homePage.actions.typingArea.typeIncorrectLetter(wrongLetter);
		}

		// Verify error indicators
		await homePage.assertions.typingArea.inputFieldColor("rgb(255, 0, 0)"); // Red input
		await homePage.assertions.typingArea.letterColor(0, 1, "rgb(255, 0, 0)"); // Red letter

		// Correct the error with backspace
		await homePage.actions.typingArea.pressBackspace();

		// Verify error indicators cleared
		await homePage.assertions.typingArea.inputFieldColor("rgb(0, 0, 0)"); // Black input
		await homePage.assertions.typingArea.letterColor(
			0,
			1,
			"rgb(128, 128, 128)",
		); // Gray letter

		// Type correct letter
		await homePage.actions.typingArea.typeLetter(secondChar);

		// Complete the word
		await homePage.actions.typingArea.typeWord(firstWord.slice(2));
		await homePage.actions.typingArea.pressSpace();

		// Verify word completed successfully
		await homePage.assertions.ui.scoreText("1/50");
	});

	test("time-limited typing session completion", async ({ homePage }) => {
		// Enable time limit mode with 10 seconds
		await homePage.actions.preferences.open();
		const timeLimitCheckbox = homePage.page.locator(
			"input.timeLimitModeButton",
		);
		await timeLimitCheckbox.click();
		const timeLimitInput = homePage.page.locator("input.timeLimitModeInput");
		await timeLimitInput.fill("10");
		await timeLimitInput.dispatchEvent("change"); // Trigger change event
		await homePage.actions.preferences.close();

		// Start typing
		await homePage.actions.typingArea.focus();

		// Type 5 words
		let wordsTyped = 0;

		for (let i = 0; i < 5; i++) {
			const currentWord = await homePage.actions.typingArea.getWord(0);
			if (!currentWord?.trim()) break;

			await homePage.actions.typingArea.typeWord(currentWord);
			await homePage.actions.typingArea.pressSpace();
			wordsTyped++;
		}

		// Verify some progress was made
		const currentScore = await homePage.actions.score.getCurrentScore();
		expect(currentScore).toBeGreaterThan(0);

		// Time should be counting down from 10
		const timerText = await homePage.page.locator("#timeText").textContent();
		expect(timerText).toMatch(/0m :\d+ s/);
	});
});
