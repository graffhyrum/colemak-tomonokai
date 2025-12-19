import { expect, type Page } from "@playwright/test";
import { assertDefined } from "../../util/AssertDefined";
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
		actions: {
			getTimerText: async () => {
				const timerText = await locators.timerText.textContent();
				assertDefined(timerText);
				return timerText;
			},
		},
		assertions: {
			promptText: () => locators.prompt.textContent(),
			scoreText: async (expectedText: string) => {
				await expect(locators.scoreText).toHaveText(expectedText);
			},
			timerText: async (expectedText: string) => {
				await expect(locators.timerText).toHaveText(expectedText);
			},
			inputValue: async (expectedValue: string) => {
				await expect(locators.userInput).toHaveValue(expectedValue);
			},
			mappingToggleText: async (expectedText: string) => {
				await expect(locators.mappingToggle).toHaveText(expectedText);
			},
			cheatsheetVisible: async () => {
				await expect(locators.cheatsheetContainer).toBeVisible();
			},
			cheatsheetHidden: async () => {
				await expect(locators.cheatsheetContainer).not.toBeVisible();
			},
			preferencesMenuVisible: async () => {
				await expect(locators.preferenceMenu).toBeVisible();
			},
			preferencesMenuHidden: async () => {
				await expect(locators.preferenceMenu).not.toBeVisible();
			},
		},
	} as const satisfies ComponentObject;
}

export { createUIElements };
