import { expect, type Page } from "@playwright/test";
import type { ComponentObject } from "../types";

function createUIElements(page: Page) {
	const locators = {
		prompt: page.locator("h2.prompt"),
		scoreText: page.locator("#scoreText"),
		timerText: page.locator("#timeText"),
		userInput: page.locator("#userInput"),
		mappingToggle: page.locator("#mappingToggle h6 span"),
		cheatsheetContainer: page.locator(".cheatsheetContainer"),
		preferenceMenu: page.locator(".preferenceMenu"),
	} as const;

	return {
		page,
		actions: {},
		assertions: {
			promptText: () => locators.prompt.textContent(),
			scoreText: (expectedText: string) =>
				expect(locators.scoreText).toHaveText(expectedText),
			timerText: (expectedText: string) =>
				expect(locators.timerText).toHaveText(expectedText),
			inputValue: (expectedValue: string) =>
				expect(locators.userInput).toHaveValue(expectedValue),
			mappingToggleText: (expectedText: string) =>
				expect(locators.mappingToggle).toHaveText(expectedText),
			cheatsheetVisible: () =>
				expect(locators.cheatsheetContainer).toBeVisible(),
			cheatsheetHidden: () =>
				expect(locators.cheatsheetContainer).not.toBeVisible(),
			preferencesMenuVisible: () =>
				expect(locators.preferenceMenu).toBeVisible(),
			preferencesMenuHidden: () =>
				expect(locators.preferenceMenu).not.toBeVisible(),
		},
	} as const satisfies ComponentObject;
}

export { createUIElements };
