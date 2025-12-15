import { expect, type Locator, type Page, test } from "@playwright/test";
import type { ComponentFactory, ComponentObject } from "../types";

function createTypingAreaComponent(page: Page) {
	const locators = {
		userInput: page.locator("#userInput"),
		word: (id: number) => page.locator(`.prompt #id${id}.word`),
		firstLetterSpan: (wordIndex: number) =>
			page.locator(`.prompt #id${wordIndex}.word span:first-child`),
	} as const satisfies Record<string, Locator | ((id: number) => Locator)>;

	const getWords = async (...ids: number[]) => {
		const words = await Promise.all(
			ids.map((id) => locators.word(id).textContent()),
		);
		return words.map((word) => word?.trim());
	};

	return {
		page,
		actions: {
			focus: async () => {
				await expect(locators.userInput).toBeVisible();
				await locators.userInput.focus();
			},

			typeWord: async (word: string) => {
				await test.step(`input word "${word}"`, async () => {
					await page.keyboard.type(word, { delay: 10 });
				});
			},

			typeIncorrectLetter: async (incorrectLetter: string) => {
				await test.step(`type incorrect letter "${incorrectLetter}"`, async () => {
					await page.keyboard.type(incorrectLetter, { delay: 10 });
				});
			},

			completeAllWords: async (targetScore: number) => {
				for (let i = 0; i < targetScore; i++) {
					const word = await locators.word(i).textContent();
					if (!word?.trim()) continue;

					await test.step(`type word "${word.trim()}"`, async () => {
						await page.keyboard.type(word.trim(), { delay: 10 });
					});

					const notLastWord = i < targetScore - 1;
					if (notLastWord) {
						await expect(locators.userInput).toHaveValue(word.trim());
						await expect(async () => {
							await page.keyboard.press("Space", { delay: 10 });
							await expect(locators.userInput).toHaveValue("", {
								timeout: 100,
							});
						}).toPass({ timeout: 500 });

						const nextWord = await locators.word(i + 1).textContent();
						expect(nextWord).not.toBe(word);
					}
				}
			},

			getWords,

			getWord: async (id: number) => {
				const [word] = await getWords(id);
				return word;
			},

			pressSpace: async () => {
				await page.keyboard.press("Space", { delay: 10 });
			},

			getInputValue: async () => {
				return await locators.userInput.inputValue();
			},
		},

		assertions: {
			mistakeIndicators: async (wordIndex: number) => {
				await test.step("assert mistake indicators", async () => {
					const [inputColor, letterColor] = await Promise.all([
						locators.userInput.evaluate((el) => {
							return globalThis.getComputedStyle(el).color;
						}),
						locators.firstLetterSpan(wordIndex).evaluate((el) => {
							return globalThis.getComputedStyle(el).color;
						}),
					]);
					expect(inputColor).toBe("rgb(255, 0, 0)");
					expect(letterColor).toBe("rgb(255, 0, 0)");
				});
			},

			inputNotClearedOnMistake: async () => {
				await test.step("assert input not cleared on space with mistake", async () => {
					const inputBeforeSpace = await locators.userInput.inputValue();

					await page.keyboard.press("Space", { delay: 10 });

					const inputAfterSpace = await locators.userInput.inputValue();
					expect(inputAfterSpace).toBe(`${inputBeforeSpace} `);

					const currentWord = await locators.word(0).textContent();
					expect(currentWord?.trim()).toBeTruthy();
				});
			},

			wordCompletion: async (wordIndex: number, currentWord: string) => {
				await expect(locators.userInput).toHaveValue(currentWord);
				await expect(async () => {
					await page.keyboard.press("Space", { delay: 10 });
					await expect(locators.userInput).toHaveValue("", {
						timeout: 30,
					});
				}).toPass({ timeout: 130 });

				const nextWord = await locators.word(wordIndex + 1).textContent();
				expect(nextWord).not.toBe(currentWord);
			},
		},
	} as const satisfies ComponentObject;
}

export const createTypingArea =
	createTypingAreaComponent satisfies ComponentFactory;
