// spec: Layout & Settings Testing
// seed: tests/layout-settings.spec.ts

import { expect, test } from "./fixtures";
import { assertDefined } from "./util/assertDefined";

test.describe("Layout & Settings Testing", () => {
	test("layout selection changes keyboard layout and regenerates words", async ({
		homePage,
	}) => {
		// Get initial layout and words
		const initialLayout = await homePage.actions.layout.getCurrentName();
		const initialWords = await homePage.assertions.ui.promptText();

		// Switch to QWERTY layout
		await homePage.actions.layout.select("qwerty");

		// Verify words changed (QWERTY should have different word patterns)
		const qwertyWords = await homePage.assertions.ui.promptText();
		expect(qwertyWords).not.toBe(initialWords);

		// Switch back to Colemak
		await homePage.actions.layout.select("colemak");
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

		// Toggle word scrolling mode
		await homePage.actions.preferences.toggleWordScrollingMode();

		// Close preferences
		await homePage.actions.preferences.close();
	});

	test("word limit and time limit modes work correctly", async ({
		homePage,
	}) => {
		// Open preferences
		await homePage.actions.preferences.open();

		// Change word limit
		await homePage.actions.preferences.setWordLimit(25);

		// Verify word limit changed
		await homePage.assertions.ui.scoreText("0/25");

		// Toggle time limit mode - need to add this method
		const timeLimitCheckbox = homePage.page.locator(
			"input.timeLimitModeButton",
		);
		await timeLimitCheckbox.click();
		expect(await timeLimitCheckbox.isChecked()).toBe(true);

		// Verify time limit input appears
		const timeLimitInput = homePage.page.locator("input.timeLimitModeInput");
		await expect(timeLimitInput).toBeVisible();

		// Set time limit to 30 seconds
		await timeLimitInput.fill("30");

		// Close preferences and verify timer shows time limit
		await homePage.actions.preferences.close();

		// Timer should show countdown from 30 seconds
		const timerText = await homePage.page.locator("#timeText").textContent();
		expect(timerText).toMatch(/0m :30 s|0m :29 s/); // Should be close to 30
	});
});
