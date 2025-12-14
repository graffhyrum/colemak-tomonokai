import { expect, type Locator, type Page, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await navigateToHomePage(page);
});

test("has title", async ({ page }) => {
	await expect(page).toHaveTitle(/Colemak/);
});

test("screenshot", async ({ page }) => {
	await expect(page).toHaveScreenshot({
		mask: [page.locator("h2.prompt")],
	});
});

test("complete a perfect game", async ({ page }) => {
	const inputLocator = page.locator("#userInput");

	await setWordLimit(page, 10);
	await focusInputField(inputLocator);

	const { getCurrentScore, getTargetScore } = createScoreComponent(page);
	const targetScore = await getTargetScore();

	await completeAllWords(page, inputLocator, targetScore);
	await validateFinalGameState(page, getCurrentScore);
});

test("handles typing mistakes correctly", async ({ page }) => {
	const inputLocator = page.locator("#userInput");

	await focusInputField(inputLocator);

	const firstWord = await getWord(page, 0);
	assertDefined(firstWord);
	const correctFirstLetter = firstWord[0]?.toLowerCase();
	const incorrectLetter = correctFirstLetter === "a" ? "b" : "a";

	await typeIncorrectLetter(page, incorrectLetter);
	await assertMistakeIndicators(page, inputLocator, 0);
	await assertInputNotClearedOnSpaceWithMistake(
		page,
		inputLocator,
	);
});

// Entry Point Functions (Highest Abstraction)
async function navigateToHomePage(page: Page) {
	await page.goto(
		"file:///C:/Users/graff/WebstormProjects/colemak-tomonokai/index.html",
	);
}

async function focusInputField(inputLocator: Locator) {
	await expect(inputLocator).toBeVisible();
	await inputLocator.focus();
}

// Orchestrator Functions (Medium Abstraction)
async function completeAllWords(
	page: Page,
	inputLocator: Locator,
	targetScore: number,
) {
	for (let i = 0; i < targetScore; i++) {
		const word = await getWord(page, i);
		assertDefined(word);

		await typeWord(page, word);

		const notLastWord = i < targetScore - 1;
		if (notLastWord) {
			await assertWordCompletion(inputLocator, page, i, word);
		}
	}
}

async function validateFinalGameState(
	page: Page,
	getCurrentScore: () => Promise<number>,
) {
	const testResultsLocator = page.locator("#testResults");
	await expect(testResultsLocator).toBeVisible();

	const finalScore = await getCurrentScore();
	const finalAccuracyText = await page.locator("#accuracyText").textContent();
	const finalWpmText = await page.locator("#wpmText").textContent();

	assertPerfectGameResults(finalScore, finalAccuracyText, finalWpmText);
}

// Business Logic Functions (Core Functionality)
async function typeWord(page: Page, word: string) {
	await test.step(`input word "${word}"`, async () => {
		await page.keyboard.type(word, { delay: 10 });
	});
}

async function assertWordCompletion(
	inputLocator: Locator,
	page: Page,
	wordIndex: number,
	currentWord: string,
) {
	await test.step("assert", async () => {
		await expect(inputLocator).toHaveValue(currentWord);
		await expect(async () => {
			await page.keyboard.press("Space", { delay: 10 });
			await expect(inputLocator).toHaveValue("", { timeout: 30 });
		}).toPass({ timeout: 130 });

		const nextWord = await getWord(page, wordIndex + 1);
		expect(nextWord).not.toBe(currentWord);
	});
}

function assertPerfectGameResults(
	finalScore: number,
	finalAccuracyText: string | null,
	finalWpmText: string | null,
) {
	expect(finalScore).toBeGreaterThan(0);

	if (finalAccuracyText?.trim()) {
		expect(finalAccuracyText).toContain("100.00%");
	}

	if (finalWpmText?.trim()) {
		expect(finalWpmText).toMatch(/WPM: \d+\.\d+/);
	}
}

async function typeIncorrectLetter(page: Page, incorrectLetter: string) {
	await test.step(`type incorrect letter "${incorrectLetter}"`, async () => {
		await page.keyboard.type(incorrectLetter, { delay: 10 });
	});
}

async function assertMistakeIndicators(
	page: Page,
	inputLocator: Locator,
	wordIndex: number,
) {
	await test.step("assert mistake indicators", async () => {
		const inputColor = await inputLocator.evaluate((el) => {
			return window.getComputedStyle(el).color;
		});
		expect(inputColor).toBe("rgb(255, 0, 0)");

		const firstLetterSpan = page.locator(
			`.prompt #id${wordIndex}.word span:first-child`,
		);
		const letterColor = await firstLetterSpan.evaluate((el) => {
			return window.getComputedStyle(el).color;
		});
		expect(letterColor).toBe("rgb(255, 0, 0)");
	});
}

async function assertInputNotClearedOnSpaceWithMistake(
	page: Page,
	inputLocator: Locator,
) {
	await test.step("assert input not cleared on space with mistake", async () => {
		const inputBeforeSpace = await inputLocator.inputValue();

		await page.keyboard.press("Space", { delay: 10 });

		const inputAfterSpace = await inputLocator.inputValue();
		expect(inputAfterSpace).toBe(`${inputBeforeSpace} `);

		const currentWord = await getWord(page, 0);
		assertDefined(currentWord);
		expect(currentWord).toBeTruthy();
	});
}

// Helper/Utility Functions (Lowest Abstraction)
async function getWord(page: Page, id: number) {
	const nextWordLocator = page.locator(`.prompt #id${id}.word`);
	const nextWordContent = await nextWordLocator.textContent();
	return nextWordContent?.trim();
}

function createScoreComponent(page: Page) {
	const scoreTextLocator = page.locator("#scoreText");

	return {
		getCurrentScore: async () => {
			const scoreText = await scoreTextLocator.textContent();
			assertDefined(scoreText);
			const [currentScore] = scoreText.split("/").map(Number);
			assertDefined(currentScore);
			return currentScore;
		},
		getTargetScore: async () => {
			const scoreText = await scoreTextLocator.textContent();
			assertDefined(scoreText);
			const [_currentScore, targetScore] = scoreText.split("/").map(Number);
			assertDefined(targetScore);
			return targetScore;
		},
	};
}

function assertDefined<T>(value: T): asserts value is NonNullable<T> {
	expect(value).toBeDefined();
}

async function setWordLimit(page: Page, wordLimit: number) {
	await page.locator("button.preferenceButton").click();
	const spinButton = page.getByRole("spinbutton");
	await spinButton.click();
	await spinButton.fill(wordLimit.toString());
	await spinButton.press("Enter");
	await page.locator("button.closePreferenceButton").click();
}
