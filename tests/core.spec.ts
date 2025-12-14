import {expect, type Page, test} from "@playwright/test";

test.beforeEach(async ({page}) => {
	await page.goto(
		"file:///C:/Users/graff/WebstormProjects/colemak-tomonokai/index.html",
	);
});

test("has title", async ({page}) => {
	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Colemak/);
});

test("screenshot", async ({page}) => {
	await expect(page).toHaveScreenshot({
		mask: [page.locator("h2.prompt")],
	});
});

function getScoreComponent(page: Page) {
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
		}
	}
}

test("complete a perfect game", async ({page}) => {
	const inputLocator = page.locator('#userInput');
	await setWordLimit(page,10);

	// Focus on input field
	await expect(inputLocator).toBeVisible();
	await inputLocator.focus();

	// Get initial score and target
	const {getCurrentScore, getTargetScore} = getScoreComponent(page);
	const targetScore = await getTargetScore();

	const getWord = async (id: number) => {
		const nextWordLocator = page.locator(`.prompt #id${id}.word`);
		const nextWordContent = await nextWordLocator.textContent();
		// assertDefined(nextWordContent);
		const word = nextWordContent?.trim();
		// assertDefined(word);
		return word;
	}

	for (let i = 0; i < targetScore; i++) {
		// Get current word to type
		const word = await getWord(i);
		assertDefined(word);
		await test.step(`input word "${word}"`, async () => {
			// Type word perfectly
			await page.keyboard.type(word, {delay: 10});
		})
		const notLastWord = i < targetScore - 1;
		if (notLastWord) {
			await test.step("assert", async () => {
				await expect(inputLocator).toHaveValue(word);
				await expect(async () => {
					// Press space to complete the word
					await page.keyboard.press("Space", {delay: 10});
					await expect(inputLocator).toHaveValue("", {timeout: 30});
				}).toPass({timeout: 130});
				const nextWord = await getWord(i + 1);
				expect(nextWord).not.toBe(word);
			})
		}
	}

	// Get final game state
	const testResultsLocator = page.locator("#testResults");
	await expect(testResultsLocator).toBeVisible();
	const finalScore = await getCurrentScore();
	const finalAccuracyText = await page.locator("#accuracyText").textContent();
	const finalWpmText = await page.locator("#wpmText").textContent();

	// Core assertions for perfect game completion
	expect(finalScore).toBeGreaterThan(0);

	// If accuracy statistics are available, they should show 100% for perfect typing
	if (finalAccuracyText?.trim()) {
		expect(finalAccuracyText).toContain("100.00%");
	}

	// If WPM statistics are available, they should be calculated
	if (finalWpmText?.trim()) {
		expect(finalWpmText).toMatch(/WPM: \d+\.\d+/);
	}
});

function assertDefined<T>(x: T): asserts x is NonNullable<T> {
	expect(x).toBeDefined();
}

async function setWordLimit(page: Page, wordLimit: number) {
	await page.getByRole('button').first().click();
	await page.getByRole('spinbutton').click();
	await page.getByRole('spinbutton').fill(wordLimit.toString());
	await page.getByRole('spinbutton').press('Enter');
	await page.locator('div').filter({hasText: 'Capital Letters Allowed'}).getByRole('button').click();
}
