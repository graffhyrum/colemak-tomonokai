import { expect, type Page } from "@playwright/test";
import type { ComponentObject } from "../types";

export const createTypingInput = (page: Page) => {
	const locators = {
		typingArea: page.locator(".typingArea"),
		currentWord: page.locator(".current-word"),
		nextWords: page.locator(".next-words"),
		score: page.locator(".score"),
		wpm: page.locator(".wpm"),
		accuracy: page.locator(".accuracy"),
	};

	return {
		page,
		actions: {
			focus: async () => {
				await locators.typingArea.focus();
			},
			typeText: async (text: string) => {
				await locators.typingArea.fill(text);
			},
			typeCorrectKeys: async (text: string) => {
				await locators.typingArea.type(text);
			},
			clearInput: async () => {
				await locators.typingArea.clear();
			},
			getCurrentInput: async (): Promise<string> => {
				return await locators.typingArea.inputValue();
			},
		},
		assertions: {
			isVisible: async () => {
				await expect(locators.typingArea).toBeVisible();
			},
			hasInput: async (expectedText: string) => {
				await expect(locators.typingArea).toHaveValue(expectedText);
			},
			hasCurrentWord: async (word: string) => {
				await expect(locators.currentWord).toContainText(word);
			},
			hasScore: async (score: number) => {
				await expect(locators.score).toContainText(score.toString());
			},
			hasWPM: async (wpm: number) => {
				await expect(locators.wpm).toContainText(wpm.toString());
			},
			hasAccuracy: async (accuracy: number) => {
				await expect(locators.accuracy).toContainText(`${accuracy}%`);
			},
		},
	} as const satisfies ComponentObject;
};
