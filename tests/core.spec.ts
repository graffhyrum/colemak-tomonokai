import { expect, test } from "./fixtures";

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

		// Wait for sliding animation to complete
		await homePage.page.waitForTimeout(200);

		// Verify that the next word is fully visible (completed words are faded)
		await homePage.assertions.typingArea.nextWordFullyVisible(i + 1);
	}
});
