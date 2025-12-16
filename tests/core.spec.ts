import { expect, test } from "./fixtures";
import { assertDefined } from "./util/assertDefined.ts";

test("has title", async ({ homePage }) => {
	await homePage.assertions.hasTitle();
});

test("screenshot", async ({ homePage }) => {
	await expect(homePage.page).toHaveScreenshot({
		mask: [homePage.page.locator("h2.prompt")],
	});
});

test("complete a perfect game", async ({ homePage }) => {
	await homePage.actions.preferences.setWordLimit(10);
	await homePage.actions.typingArea.focus();

	const targetScore = await homePage.actions.score.getTargetScore();

	await homePage.actions.typingArea.completeAllWords(targetScore);
	await homePage.assertions.testResults.validateFinalGameState();
});

test("handles typing mistakes correctly", async ({ homePage }) => {
	await homePage.actions.typingArea.focus();

	const firstWord = await homePage.actions.typingArea.getWord(0);
	const correctFirstLetter = firstWord?.[0]?.toLowerCase();
	const incorrectLetter = correctFirstLetter === "a" ? "b" : "a";

	await homePage.actions.typingArea.typeIncorrectLetter(incorrectLetter);
	await homePage.assertions.typingArea.mistakeIndicators(0);
	await homePage.assertions.typingArea.inputNotClearedOnMistake();
});

test("prompt does not slide too far in word scrolling mode", async ({
	homePage,
}) => {
	// Ensure word scrolling mode is enabled (not paragraph mode)
	await homePage.actions.preferences.toggleWordScrollingMode();
	await homePage.actions.preferences.toggleWordScrollingMode(); // Toggle twice to ensure enabled
	await homePage.actions.preferences.setWordLimit(10);
	await homePage.actions.typingArea.focus();

	// Type through several words to trigger prompt sliding
	for (let i = 0; i < 5; i++) {
		const currentWord = await homePage.actions.typingArea.getWord(0);
		if (!currentWord?.trim()) continue;

		await homePage.actions.typingArea.typeWord(currentWord.trim());
		await homePage.actions.typingArea.pressSpace();

		// Verify that the next word is fully visible (completed words are faded)
		await homePage.assertions.typingArea.nextWordFullyVisible(i + 1);
	}
});

test("letter coloring works during typing", async ({ homePage }) => {
	// Ensure word scrolling mode is enabled
	await homePage.actions.preferences.toggleWordScrollingMode();
	await homePage.actions.preferences.toggleWordScrollingMode(); // Toggle twice to ensure enabled

	await homePage.actions.typingArea.focus();

	const completedWords = 0;

	const firstWord = await homePage.actions.typingArea.getWord(completedWords);
	assertDefined(firstWord);
	expect(firstWord.length).toBeGreaterThan(1);

	const letters = firstWord.split("");

	// Test 1: Type first letter correctly - should turn green
	const firstLetter = letters[0];
	assertDefined(firstLetter);
	await homePage.actions.typingArea.typeLetter(firstLetter as string);
	await homePage.assertions.typingArea.letterColor(
		completedWords,
		0,
		"rgb(0, 128, 0)",
	); // green
	await homePage.assertions.typingArea.inputFieldColor("rgb(0, 0, 0)"); // black

	// Test 2: Type second letter correctly - should turn green
	const secondLetter = letters[1];
	expect(secondLetter).toBeTruthy();
	await homePage.actions.typingArea.typeLetter(secondLetter as string);
	await homePage.assertions.typingArea.letterColor(
		completedWords,
		0,
		"rgb(0, 128, 0)",
	); // green
	await homePage.assertions.typingArea.letterColor(
		completedWords,
		1,
		"rgb(0, 128, 0)",
	); // green
	await homePage.assertions.typingArea.inputFieldColor("rgb(0, 0, 0)"); // black

	// Test 3: Backspace on second letter - should turn gray
	await homePage.actions.typingArea.pressBackspace();
	await homePage.assertions.typingArea.letterColor(
		completedWords,
		0,
		"rgb(0, 128, 0)",
	); // green
	await homePage.assertions.typingArea.letterColor(
		completedWords,
		1,
		"rgb(128, 128, 128)",
	); // gray
	await homePage.assertions.typingArea.inputFieldColor("rgb(0, 0, 0)"); // black

	// Test 4: Backspace on first letter - should turn gray
	await homePage.actions.typingArea.pressBackspace();
	await homePage.assertions.typingArea.letterColor(
		completedWords,
		0,
		"rgb(128, 128, 128)",
	); // gray
	await homePage.assertions.typingArea.inputFieldColor("rgb(0, 0, 0)"); // black

	// Test 5: Type incorrect letter - should turn red and input field red
	const incorrectLetter = firstLetter === "a" ? "b" : "a";
	await homePage.actions.typingArea.typeLetter(incorrectLetter);
	await homePage.assertions.typingArea.letterColor(
		completedWords,
		0,
		"rgb(255, 0, 0)",
	); // red
	await homePage.assertions.typingArea.inputFieldColor("rgb(255, 0, 0)"); // red

	// Test 6: Press backspace on incorrect letter - should turn gray, input field black
	await homePage.actions.typingArea.pressBackspace();
	await homePage.assertions.typingArea.letterColor(
		completedWords,
		0,
		"rgb(128, 128, 128)",
	); // gray
	await homePage.assertions.typingArea.inputFieldColor("rgb(0, 0, 0)"); // black

	// Test 7: Type correct letter after mistake - should turn green
	await homePage.actions.typingArea.typeLetter(firstLetter as string);
	await homePage.assertions.typingArea.letterColor(
		completedWords,
		0,
		"rgb(0, 128, 0)",
	); // green
	await homePage.assertions.typingArea.inputFieldColor("rgb(0, 0, 0)"); // black
});
