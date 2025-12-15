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
