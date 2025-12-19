// seed: tests/seed.spec.ts

import { expect, test } from "./fixtures";
import { assertDefined } from "./util/assertDefined.ts";

test.describe("Core Typing Functionality", () => {
	test("basic typing interface loads and displays words", async ({
		homePage,
	}) => {
		// Verify page title contains Colemak
		await homePage.assertions.hasTitle();

		// Verify typing input field is present and visible through POM
		await homePage.actions.typingArea.focus();

		// Verify words are displayed by getting the first word
		const firstWord = await homePage.actions.typingArea.getWord(0);
		expect(firstWord).toBeTruthy();
		assertDefined(firstWord);
		expect(firstWord.length).toBeGreaterThan(0);
	});

	test("letter-by-letter coloring feedback works correctly", async ({
		homePage,
	}) => {
		// Focus the typing input field using POM
		await homePage.actions.typingArea.focus();

		// Get the first word to type using POM
		const firstWord = await homePage.actions.typingArea.getWord(0);
		expect(firstWord).toBeTruthy();
		assertDefined(firstWord);
		const letters = firstWord.split("");

		// Type first letter correctly - should turn green
		await homePage.actions.typingArea.typeLetter(letters[0] || "a");
		await homePage.assertions.typingArea.letterColor(0, 0, "rgb(0, 128, 0)"); // green

		// Type incorrect letter at position 1 - should turn red
		const incorrectLetter = (letters[1] || "a") === "a" ? "b" : "a";
		await homePage.actions.typingArea.typeLetter(incorrectLetter);
		await homePage.assertions.typingArea.letterColor(0, 1, "rgb(255, 0, 0)"); // red

		// Input field should also turn red on error
		await homePage.assertions.typingArea.inputFieldColor("rgb(255, 0, 0)"); // red

		// Press backspace - incorrect letter should turn gray
		await homePage.actions.typingArea.pressBackspace();
		await homePage.assertions.typingArea.letterColor(
			0,
			1,
			"rgb(128, 128, 128)",
		); // gray

		// Input field should return to black
		await homePage.assertions.typingArea.inputFieldColor("rgb(0, 0, 0)"); // black

		// Type correct letter - should turn green
		await homePage.actions.typingArea.typeLetter(letters[1] || "b");
		await homePage.assertions.typingArea.letterColor(0, 1, "rgb(0, 128, 0)"); // green
	});

	test("word completion on space advances to next word", async ({
		homePage,
	}) => {
		// Ensure word scrolling mode is enabled
		await homePage.actions.preferences.setWordScrollingMode("enable");

		await homePage.actions.typingArea.focus();
		const firstWord = await homePage.actions.typingArea.getWord(0);
		assertDefined(firstWord);

		// Type the complete word using POM
		await homePage.actions.typingArea.typeWord(firstWord);

		// Verify input shows the complete word
		await homePage.assertions.typingArea.wordCompletion(0, firstWord);

		// Verify score incremented
		const currentScore = await homePage.actions.score.getCurrentScore();
		expect(currentScore).toBe(1);

		// Verify next word is fully visible (completed words should be scrolled/faded)
		await homePage.assertions.typingArea.nextWordFullyVisible(1);
	});

	test("progress tracking shows score and timer progression", async ({
		homePage,
	}) => {
		// Ensure word scrolling mode is enabled for this test
		await homePage.actions.preferences.setWordScrollingMode("enable");

		// Check initial score is 0
		let currentScore = await homePage.actions.score.getCurrentScore();
		expect(currentScore).toBe(0);

		// Get the words that will be typed before any completion
		await homePage.actions.typingArea.focus();
		const firstWord = await homePage.actions.typingArea.getWord(0);
		assertDefined(firstWord);
		const secondWord = await homePage.actions.typingArea.getWord(1);
		assertDefined(secondWord);

		// Complete first word
		await homePage.actions.typingArea.typeWord(firstWord);
		await homePage.actions.typingArea.pressSpace();

		// Check score incremented to 1
		currentScore = await homePage.actions.score.getCurrentScore();
		expect(currentScore).toBe(1);

		// Check timer is running (greater than 0)
		const timerText = await homePage.actions.ui.getTimerText();
		expect(timerText).toMatch(/\d+/); // Should contain digits

		// Wait for DOM updates
		await homePage.page.waitForTimeout(200);

		// Complete second word
		await homePage.actions.typingArea.focus();
		await homePage.actions.typingArea.typeWord(secondWord);
		await homePage.actions.typingArea.pressSpace();

		// Wait for score to update asynchronously
		await expect(async () => {
			currentScore = await homePage.actions.score.getCurrentScore();
			expect(currentScore).toBe(2);
		}).toPass({ timeout: 1000 });

		// Check score incremented to 2
		currentScore = await homePage.actions.score.getCurrentScore();
		expect(currentScore).toBe(2);
	});

	test("WPM and accuracy calculations display on completion", async ({
		homePage,
	}) => {
		// Focus input and complete words to reach completion
		await homePage.actions.typingArea.focus();

		// Complete 10 words to trigger results display
		for (let i = 0; i < 10; i++) {
			const word = await homePage.actions.typingArea.getWord(0);
			if (!word) break;
			await homePage.actions.typingArea.typeWord(word);
			await homePage.actions.typingArea.pressSpace();
		}

		// Verify test results are visible and show perfect game
		await homePage.assertions.testResults.validateFinalGameState();
	});
});
