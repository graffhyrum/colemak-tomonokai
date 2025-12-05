import { expect, type Page } from "@playwright/test";

export function createQWERTYTypingTutorPage(page: Page) {
	// Component selectors for our new Phase 1 structure
	const promptElement = page.locator(".prompt");
	const inputElement = page.locator("#userInput");
	const keyboardElement = page.locator(".keyboard");
	const statsElement = page.locator(".stats");
	const resultsElement = page.locator(".results");

	return {
		page,
		goto: async () => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");
		},

		actions: {
			input: {
				focus: async () => {
					await inputElement.focus();
				},
				type: async (text: string) => {
					await inputElement.type(text);
				},
				fill: async (text: string) => {
					await inputElement.fill(text);
				},
				press: async (key: string) => {
					await inputElement.press(key);
				},
				clear: async () => {
					await inputElement.clear();
				},
			},
		},

		assertions: {
			isVisible: async () => {
				await page.locator(".qwerty-typing-tutor").waitFor();
			},

			prompt: {
				hasText: async () => {
					await expect(promptElement).toBeVisible();
					const text = await promptElement.textContent();
					expect(text?.trim()).not.toBe("");
				},
				characterIsCorrect: async (index: number) => {
					const charElement = promptElement.locator(".letter").nth(index);
					await expect(charElement).toHaveClass(/green/);
				},
				characterIsIncorrect: async (index: number) => {
					const charElement = promptElement.locator(".letter").nth(index);
					await expect(charElement).toHaveClass(/red/);
				},
			},

			input: {
				isVisible: async () => {
					await expect(inputElement).toBeVisible();
				},
				isFocused: async () => {
					await expect(inputElement).toBeFocused();
				},
				hasValue: async (expectedValue: string) => {
					await expect(inputElement).toHaveValue(expectedValue);
				},
				hasRedBackground: async () => {
					await expect(inputElement).toHaveCSS(
						"border-color",
						/rgb\(220, 53, 69\)/,
					);
				},
			},

			keyboard: {
				isVisible: async () => {
					await expect(keyboardElement).toBeVisible();
				},
				hasQWERTYKeys: async () => {
					const keys = keyboardElement.locator(".key");
					await expect(keys).toHaveCount(26); // 26 letters
				},
				keyIsActive: async (key: string) => {
					const keyElement = keyboardElement.locator(`.key:has-text("${key}")`);
					await expect(keyElement).toHaveClass(/active/);
				},
				keyIsInactive: async (key: string) => {
					const keyElement = keyboardElement.locator(`.key:has-text("${key}")`);
					await expect(keyElement).toHaveClass(/inactive/);
				},
			},

			stats: {
				showsScore: async (expectedScore: string) => {
					const scoreElement = statsElement.locator(".stat").first();
					await expect(scoreElement).toContainText(expectedScore);
				},
				showsAccuracy: async (expectedAccuracy: string) => {
					const accuracyElement = statsElement.locator(".stat").nth(1);
					await expect(accuracyElement).toContainText(expectedAccuracy);
				},
				showsAccuracyLessThan: async (maxAccuracy: string) => {
					const accuracyElement = statsElement.locator(".stat").nth(1);
					const accuracyText = await accuracyElement.textContent();
					expect(accuracyText).not.toBe(maxAccuracy);
				},
				showsTime: async (expectedTime: string) => {
					const timeElement = statsElement.locator(".stat").nth(2);
					await expect(timeElement).toContainText(expectedTime);
				},
			},

			results: {
				isVisible: async () => {
					await expect(resultsElement).toBeVisible();
				},
				showsFinalScore: async (expectedScore: string) => {
					await expect(resultsElement).toContainText(expectedScore);
				},
			},
		},

		getters: {
			getCurrentWord: async () => {
				const wordText = await promptElement.locator(".word").textContent();
				return wordText?.trim() || "";
			},
			getTimeText: async () => {
				const timeElement = statsElement.locator(".stat").nth(2);
				return (await timeElement.textContent()) || "";
			},
		},
	};
}
