import { expect, type Page } from "@playwright/test";
import type { ComponentObject } from "../types";

export const createKeyboardDisplay = (page: Page) => {
	const locators = {
		keyboard: page.locator(".cheatsheet"),
		activeKeys: page.locator(".key.currentLevelKeys"),
	};

	return {
		page,
		actions: {
			getHighlightedKeys: async (): Promise<string[]> => {
				return await locators.activeKeys.allInnerTexts();
			},
			findKeyByText: async (letter: string) => {
				return locators.keyboard.locator(`.key:has-text("${letter}")`);
			},
		},
		assertions: {
			containsLetter: async (letter: string) => {
				await expect(locators.keyboard).toContainText(letter);
			},
			hasHighlightedKey: async (letter: string) => {
				const highlightedKey = locators.keyboard.locator(
					`.key.currentLevelKeys:has-text("${letter}")`,
				);
				await expect(highlightedKey).toBeVisible();
			},
			isVisible: async () => {
				await expect(locators.keyboard).toBeVisible();
			},
		},
	} as const satisfies ComponentObject;
};
