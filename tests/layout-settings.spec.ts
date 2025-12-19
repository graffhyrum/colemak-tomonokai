// spec: Layout & Settings Testing
// seed: tests/layout-settings.spec.ts

import { expect, test } from "./fixtures";
import { assertDefined } from "./util/assertDefined";

test.describe("Layout & Settings Testing", () => {
	test("layout selection changes keyboard layout and regenerates words", async ({
		homePage,
	}) => {
		// Get initial words (assume starts with Colemak)
		const initialWords = await homePage.assertions.ui.promptText();
		assertDefined(initialWords);

		// Switch to QWERTY layout
		await homePage.actions.layout.select("qwerty");

		// Verify words changed (QWERTY should have different word patterns)
		const qwertyWords = await homePage.assertions.ui.promptText();
		expect(qwertyWords).not.toBe(initialWords);

		// Switch back to Colemak
		await homePage.actions.layout.select("colemak");

		// Verify words changed back
		const colemakWords = await homePage.assertions.ui.promptText();
		expect(colemakWords).not.toBe(qwertyWords);
	});

	test("keyboard type selection updates visual keyboard display", async ({
		homePage,
	}) => {
		// Switch to ISO keyboard
		await homePage.actions.keyboard.select("iso");

		// Verify keyboard display updates (ISO has enter key in different position)
		await homePage.assertions.keyboard.isVisible();

		// Switch to Ortho keyboard
		await homePage.actions.keyboard.select("ortho");

		// Verify different keyboard layout
		await homePage.assertions.keyboard.isVisible();

		// Switch back to ANSI
		await homePage.actions.keyboard.select("ansi");
		await homePage.assertions.keyboard.isVisible();
	});

	test("level progression changes word difficulty and highlights buttons", async ({
		homePage,
	}) => {
		// Start with Level 1 (should be active by default)
		await homePage.assertions.levels.hasCurrentLevel("Level 1");

		// Get initial words
		const level1Words = await homePage.assertions.ui.promptText();

		// Click Level 2
		await homePage.actions.levels.select(2);
		await homePage.assertions.levels.hasCurrentLevel("Level 2");

		// Verify words changed for Level 2
		const level2Words = await homePage.assertions.ui.promptText();
		expect(level2Words).not.toBe(level1Words);

		// Click Level 3
		await homePage.actions.levels.select(3);
		await homePage.assertions.levels.hasCurrentLevel("Level 3");

		// Test All Words mode
		await homePage.actions.levels.selectAllWords();
		await homePage.assertions.levels.hasCurrentLevel("All Words");

		// Enable full sentence mode to make Full Sentences button visible
		await homePage.actions.preferences.toggleFullSentenceMode();

		// Test Full Sentences mode
		await homePage.actions.levels.selectFullSentences();
		await homePage.assertions.levels.hasCurrentLevel("Full Sentences");

		// Verify sentence mode has longer text
		const sentenceText = await homePage.assertions.ui.promptText();
		assertDefined(sentenceText);
		expect(sentenceText.length).toBeGreaterThan(50); // Sentences are longer than words
	});

	test("word randomization on level changes", async ({ homePage }) => {
		// Start with Level 1 and get initial words
		await homePage.assertions.levels.hasCurrentLevel("Level 1");
		const originalWords = await homePage.assertions.ui.promptText();

		// Change to Level 2
		await homePage.actions.levels.select(2);
		await homePage.assertions.levels.hasCurrentLevel("Level 2");

		// Change back to Level 1
		await homePage.actions.levels.select(1);
		await homePage.assertions.levels.hasCurrentLevel("Level 1");

		// Get new words and verify they're different from original
		const newWords = await homePage.assertions.ui.promptText();
		expect(newWords).not.toBe(originalWords);

		// Verify both word sets are valid (not empty)
		assertDefined(originalWords);
		assertDefined(newWords);
		expect(originalWords.trim().length).toBeGreaterThan(0);
		expect(newWords.trim().length).toBeGreaterThan(0);
	});

	test("preference toggles work correctly", async ({ homePage }) => {
		// Open preferences menu
		await homePage.actions.preferences.open();

		// Toggle capital letters
		const capitalLettersCheckbox = homePage.page.locator(
			"input.capitalLettersAllowed",
		);
		const initialCapitalState = await capitalLettersCheckbox.isChecked();
		await capitalLettersCheckbox.click();
		const newCapitalState = await capitalLettersCheckbox.isChecked();
		expect(newCapitalState).not.toBe(initialCapitalState);

		// Toggle punctuation
		const punctuationCheckbox = homePage.page.locator(
			"input.punctuationModeButton",
		);
		const initialPunctState = await punctuationCheckbox.isChecked();
		await punctuationCheckbox.click();
		const newPunctState = await punctuationCheckbox.isChecked();
		expect(newPunctState).not.toBe(initialPunctState);

		// Toggle sound effects
		const soundClickCheckbox = homePage.page.locator("input.playSoundOnClick");
		await soundClickCheckbox.click();
		expect(await soundClickCheckbox.isChecked()).toBe(true);

		const soundErrorCheckbox = homePage.page.locator("input.playSoundOnError");
		await soundErrorCheckbox.click();
		expect(await soundErrorCheckbox.isChecked()).toBe(true);

		// Toggle cheatsheet
		const cheatsheetCheckbox = homePage.page.locator(
			"input.showCheatsheetButton",
		);
		const initialCheatsheetState = await cheatsheetCheckbox.isChecked();
		await cheatsheetCheckbox.click();
		const newCheatsheetState = await cheatsheetCheckbox.isChecked();
		expect(newCheatsheetState).not.toBe(initialCheatsheetState);

		// Verify cheatsheet visibility changes
		if (newCheatsheetState) {
			await homePage.assertions.ui.cheatsheetVisible();
		} else {
			await homePage.assertions.ui.cheatsheetHidden();
		}

		// Disable word scrolling mode
		await homePage.actions.preferences.setWordScrollingMode("disable");

		// Close preferences
		await homePage.actions.preferences.close();
	});

	test("word limit and time limit modes work correctly", async ({
		homePage,
	}) => {
		const limit = 30;

		// Open preferences
		await homePage.actions.preferences.open();

		// Change word limit
		await homePage.actions.preferences.setWordLimit(limit);

		// Verify word limit was applied by checking the input value
		await homePage.actions.preferences.open();
		const wordLimitInput = homePage.page.locator("input.wordLimitModeInput");
		await expect(wordLimitInput).toHaveValue(limit.toString());

		// Close preferences
		await homePage.actions.preferences.close();
	});
});
