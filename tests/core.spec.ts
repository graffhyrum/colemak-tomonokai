import {expect, test} from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto(
		"file:///C:/Users/graff/WebstormProjects/colemak-tomonokai/index.html",
	);
});

test("has title", async ({ page }) => {
	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Colemak/);
});

test("screenshot", async ({ page }) => {
	await expect(page).toHaveScreenshot({
		mask: [page.locator("h2.prompt")],
	});
});

test("complete a perfect game", async ({ page }) => {
	// Focus on input field
	await page.focus("#userInput");
	await page.waitForTimeout(500); // Let game fully initialize

	// Get initial score and target
	const scoreTextLocator = page.locator("#scoreText");
	const scoreText = await scoreTextLocator.textContent();
	assertDefined(scoreText);
	const [_currentScore, targetScore] = scoreText.split("/").map(Number);

	// Type words and demonstrate perfect typing until game ends
	let wordsTyped = 0;

	for (let i = 0; i < targetScore; i++) {
		// Get current word to type
		const wordElement = page.locator(".prompt .word").first();
		const wordText = await wordElement.textContent();

		if (!wordText || !wordText.trim()) {
			break;
		}

		const word = wordText.trim();

		// Type word perfectly
		await page.keyboard.type(word);
		await page.waitForTimeout(30);

		// Press space to complete the word
		await page.keyboard.press("Space");
		await page.waitForTimeout(100); // Wait for game processing

		wordsTyped++;

		// Check if game is actually complete by looking at score text
		const currentScoreText = await scoreTextLocator.textContent();
		assertDefined(currentScoreText);

		const [currentScore, targetScore] = currentScoreText.split("/").map(Number);

		// Game is truly complete when we reach the target number of words
		if (currentScore >= targetScore) {
			break;
		}
	}

	// Get final game state
	const testResultsLocator = page.locator("#testResults");
	await expect(testResultsLocator).toBeVisible();
	const finalScoreText = await scoreTextLocator.textContent();
	const finalAccuracyText = await page.locator("#accuracyText").textContent();
	const finalWpmText = await page.locator("#wpmText").textContent();

	// Parse final statistics
	const finalScore = parseInt(finalScoreText?.split("/")[0] || "0", 10);

	// Core assertions for perfect game completion
	expect(finalScore).toBeGreaterThan(0);
	expect(wordsTyped).toBeGreaterThan(0);

	// If accuracy statistics are available, they should show 100% for perfect typing
	if (finalAccuracyText?.trim()) {
		expect(finalAccuracyText).toContain("100.00%");
	}

	// If WPM statistics are available, they should be calculated
	if (finalWpmText?.trim()) {
		expect(finalWpmText).toMatch(/WPM: \d+\.\d+/);
	}
	expect(wordsTyped).toBeGreaterThan(0);
});

function assertDefined<T>(x: T): asserts x is NonNullable<T> {
	expect(x).toBeDefined();
}

