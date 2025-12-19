import { expect, type Locator, type Page, test } from "@playwright/test";
import { TYPING_DELAY } from "../../util/global-config.ts";
import type { ComponentFactory, ComponentObject } from "../types";

function createTypingAreaComponent(page: Page) {
	const locators = {
		userInput: page.locator("#userInput"),
		word: (id: number) => page.locator(`.prompt #id${id}.word`),
		firstLetterSpan: (wordIndex: number) =>
			page.locator(`.prompt #id${wordIndex}.word span:first-child`),
		characterSpans: (wordIndex: number) =>
			page.locator(`.prompt #id${wordIndex}.word span`),
	} as const satisfies Record<string, Locator | ((id: number) => Locator)>;

	const getWords = async (...ids: number[]) => {
		const words = await Promise.all(
			ids.map((id) => locators.word(id).textContent()),
		);
		return words.map((word) => word?.trim());
	};

	const inputIsEmpty = async () => {
		await expect(locators.userInput, {
			message: `Expected typing area to be empty.\n Got: "${await locators.userInput.inputValue()}"`,
		}).toHaveValue("", {
			timeout: 200,
		});
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
					for (const letter of word) {
						await page.keyboard.type(letter, { delay: TYPING_DELAY });
					}
				});
			},

			typeIncorrectLetter: async (incorrectLetter: string) => {
				await test.step(`type incorrect letter "${incorrectLetter}"`, async () => {
					await page.keyboard.type(incorrectLetter, { delay: TYPING_DELAY });
				});
			},

			completeAllWords: async (targetScore: number) => {
				for (let i = 0; i < targetScore; i++) {
					const word = await locators.word(i).textContent();
					if (!word?.trim()) continue;

					await test.step(`type word "${word.trim()}"`, async () => {
						await page.keyboard.type(word.trim(), { delay: TYPING_DELAY });
					});

					const notLastWord = i < targetScore - 1;
					if (notLastWord) {
						await expect(locators.userInput).toHaveValue(word.trim());
						await page.keyboard.press("Space", { delay: TYPING_DELAY });
						await inputIsEmpty();

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
				await page.keyboard.press("Space", { delay: TYPING_DELAY });
			},

			getInputValue: async () => {
				return await locators.userInput.inputValue();
			},

			typeLetter: async (letter: string) => {
				await test.step(`type letter "${letter}"`, async () => {
					await page.keyboard.type(letter, { delay: TYPING_DELAY });
				});
			},

			pressBackspace: async () => {
				await test.step("press backspace", async () => {
					await page.keyboard.press("Backspace", { delay: TYPING_DELAY });
				});
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
					await page.keyboard.press("Space", { delay: TYPING_DELAY });
					await expect(locators.userInput).toHaveValue(`${inputBeforeSpace} `);
					const currentWord = await locators.word(0).textContent();
					expect(currentWord?.trim()).toBeTruthy();
				});
			},

			wordCompletion: async (wordIndex: number, currentWord: string) => {
				await expect(locators.userInput).toHaveValue(currentWord);
				await page.keyboard.press("Space", { delay: TYPING_DELAY });
				await inputIsEmpty();
				const nextWord = await locators.word(wordIndex + 1).textContent();
				expect(nextWord).not.toBe(currentWord);
			},

			wordHidden: async (wordIndex: number) => {
				await test.step("assert word is faded (in scrolling mode)", async () => {
					// In scrolling mode, completed words become transparent but stay in DOM
					const word = locators.word(wordIndex);
					// Wait for opacity transition to complete
					await page.waitForFunction((index) => {
						const element = document.querySelector(`.prompt #id${index}.word`);
						return element && window.getComputedStyle(element).opacity === "0";
					}, wordIndex);
					// Check that opacity style is set
					await expect(word).toHaveCSS("opacity", "0");
				});
			},

			nextWordFullyVisible: async (wordIndex: number) => {
				await test.step("assert next word is fully visible", async () => {
					const nextWord = locators.word(wordIndex);
					await expect(nextWord).toBeVisible();
					// Check that every character span of the word is fully visible
					const spanLocator = locators.characterSpans(wordIndex);
					const spans = await spanLocator.all();
					for (const span of spans) {
						await expect(span).toBeVisible();
					}
				});
			},

			letterColor: async (
				wordIndex: number,
				letterIndex: number,
				expectedColor: string,
			) => {
				await test.step(`assert letter ${letterIndex} of word ${wordIndex} is ${expectedColor}`, async () => {
					const spanLocator = locators.characterSpans(wordIndex);
					const spans = await spanLocator.all();
					const letterSpan = spans[letterIndex];
					expect(letterSpan).toBeTruthy();
					if (letterSpan) {
						await expect(letterSpan).toBeVisible();
						const color = await letterSpan.evaluate(
							(el) => getComputedStyle(el).color,
						);
						expect(color).toBe(expectedColor);
					}
				});
			},

			inputFieldColor: async (expectedColor: string) => {
				await test.step(`assert input field color is ${expectedColor}`, async () => {
					const color = await locators.userInput.evaluate(
						(el) => getComputedStyle(el).color,
					);
					expect(color).toBe(expectedColor);
				});
			},

			inputIsEmpty,
		},
	} as const satisfies ComponentObject;
}

export const createTypingArea =
	createTypingAreaComponent satisfies ComponentFactory;
