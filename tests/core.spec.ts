import {expect, type Locator, type Page, test} from "@playwright/test";

test.beforeEach(async ({page}) => {
	await navigateToHomePage(page);
});

test("has title", async ({page}) => {
	await expect(page).toHaveTitle(/Colemak/);
});

test("screenshot", async ({page}) => {
	await expect(page).toHaveScreenshot({
		mask: [page.locator("h2.prompt")],
	});
});

test("complete a perfect game", async ({page}) => {
	const inputLocator = page.locator("#userInput");

	await setWordLimit(page, 10);
	await focusInputField(inputLocator);

	const {getCurrentScore, getTargetScore} = createScoreComponent(page);
	const targetScore = await getTargetScore();

	await completeAllWords(page, inputLocator, targetScore);
	await validateFinalGameState(page, getCurrentScore);
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
		await page.keyboard.type(word, {delay: 10});
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
			await page.keyboard.press("Space", {delay: 10});
			await expect(inputLocator).toHaveValue("", {timeout: 30});
		}).toPass({timeout: 130});

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
	await page.locator('button.preferenceButton').click();
	const spinButton = page.getByRole("spinbutton");
	await spinButton.click();
	await spinButton.fill(wordLimit.toString());
	await spinButton.press("Enter");
	await page.locator('button.closePreferenceButton').click();
}
