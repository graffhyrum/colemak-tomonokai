import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { createDisplayComponent } from "./components/displayComponent.ts";
import { createInputComponent } from "./components/inputComponent.ts";
import { createKeyboardComponent } from "./components/keyboardComponent.ts";
import { createLinkComponent } from "./components/linkComponent.ts";
import { createSelectComponent } from "./components/selectComponent.ts";
import type { PageObject } from "./types.ts";

export function createColemakTutorPage(page: Page) {
	// Component instances
	const layoutSelect = createSelectComponent(page, "#layout");
	const keyboardSelect = createSelectComponent(page, "#keyboard");
	const userInput = createInputComponent(page, "#userInput");
	const wordLimitInput = createInputComponent(page, ".wordLimitModeInput");
	const wordLimitCheckbox = page.locator(".wordLimitModeButton");
	const timeLimitInput = createInputComponent(page, ".timeLimitModeInput");
	const timeLimitCheckbox = page.locator(".timeLimitModeButton");
	const customKeyInput = createInputComponent(page, "#customUIKeyInput");
	const scoreDisplay = createDisplayComponent(page, "#scoreText");
	const timeDisplay = createDisplayComponent(page, "#timeText");
	const githubLink = createLinkComponent(page, 'a[href*="github.com"]');
	const petitionLink = createLinkComponent(page, 'a[href*="change.org"]');
	const keyboard = createKeyboardComponent(page);

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const fileUrl = pathToFileURL(join(__dirname, "../../index.html")).href;

	return {
		page,
		goto: async () => {
			await page.goto(fileUrl);
			await page.waitForLoadState("networkidle");
		},
		actions: {
			layout: {
				selectOption: async (value: string) => {
					await layoutSelect.actions.selectOption(value);
				},
			},
			keyboard: {
				selectOption: async (value: string) => {
					await keyboardSelect.actions.selectOption(value);
				},
			},
			input: {
				fill: async (text: string) => {
					await userInput.actions.fill(text);
				},
				clear: async () => {
					await userInput.actions.clear();
				},
				focus: async () => {
					await userInput.actions.focus();
				},
			},
			settings: {
				wordLimit: {
					toggle: async () => {
						await wordLimitCheckbox.click({ force: true });
						await page.waitForTimeout(100);
					},
					isChecked: async () => {
						return await wordLimitCheckbox.isChecked();
					},
					fill: async (text: string) => {
						await wordLimitInput.actions.fill(text);
						await page.keyboard.press("Enter");
					},
					clear: async () => {
						await wordLimitInput.actions.clear();
					},
					focus: async () => {
						await wordLimitInput.actions.focus();
					},
				},
				timeLimit: {
					toggle: async () => {
						await timeLimitCheckbox.click({ force: true });
						await page.waitForTimeout(100);
					},
					isChecked: async () => {
						return await timeLimitCheckbox.isChecked();
					},
					fill: async (text: string) => {
						await timeLimitInput.actions.fill(text);
					},
					clear: async () => {
						await timeLimitInput.actions.clear();
					},
					focus: async () => {
						await timeLimitInput.actions.focus();
					},
				},
				customKey: {
					fill: async (text: string) => {
						await customKeyInput.actions.fill(text);
						await page.keyboard.press("Enter");
					},
					clear: async () => {
						await customKeyInput.actions.clear();
					},
					focus: async () => {
						await customKeyInput.actions.focus();
					},
				},
				open: async () => {
					await page.locator("body > button.preferenceButton").click();
				},
			},
			reset: {
				tab: async () => {
					await keyboard.actions.tab();
				},
				escape: async () => {
					await keyboard.actions.escape();
				},
			},
			links: {
				github: {
					click: async () => {
						await githubLink.actions.click();
					},
				},
				petition: {
					click: async () => {
						await petitionLink.actions.click();
					},
				},
			},
		},
		assertions: {
			layout: {
				hasValue: async (expectedValue: string) => {
					await layoutSelect.assertions.hasValue(expectedValue);
				},
				hasOptionsCount: async (expectedCount: number) => {
					await layoutSelect.assertions.hasOptionsCount(expectedCount);
				},
				optionExists: async (value: string) => {
					await layoutSelect.assertions.optionExists(value);
				},
			},
			keyboard: {
				hasValue: async (expectedValue: string) => {
					await keyboardSelect.assertions.hasValue(expectedValue);
				},
				hasOptionsCount: async (expectedCount: number) => {
					await keyboardSelect.assertions.hasOptionsCount(expectedCount);
				},
				optionExists: async (value: string) => {
					await keyboardSelect.assertions.optionExists(value);
				},
			},
			input: {
				hasValue: async (expectedValue: string) => {
					await userInput.assertions.hasValue(expectedValue);
				},
				isAttached: async () => {
					await userInput.assertions.isAttached();
				},
				isVisible: async () => {
					await userInput.assertions.isVisible();
				},
			},
			settings: {
				wordLimit: {
					isChecked: async () => {
						await expect(wordLimitCheckbox).toBeChecked();
					},
					isNotChecked: async () => {
						await expect(wordLimitCheckbox).not.toBeChecked();
					},
					hasValue: async (expectedValue: string) => {
						await wordLimitInput.assertions.hasValue(expectedValue);
					},
					isAttached: async () => {
						await wordLimitInput.assertions.isAttached();
					},
					isVisible: async () => {
						await wordLimitInput.assertions.isVisible();
					},
				},
				timeLimit: {
					isChecked: async () => {
						await expect(timeLimitCheckbox).toBeChecked();
					},
					isNotChecked: async () => {
						await expect(timeLimitCheckbox).not.toBeChecked();
					},
					hasValue: async (expectedValue: string) => {
						await timeLimitInput.assertions.hasValue(expectedValue);
					},
					isAttached: async () => {
						await timeLimitInput.assertions.isAttached();
					},
					isVisible: async () => {
						await timeLimitInput.assertions.isVisible();
					},
				},
				customKey: {
					hasValue: async (expectedValue: string) => {
						await customKeyInput.assertions.hasValue(expectedValue);
					},
					isAttached: async () => {
						await customKeyInput.assertions.isAttached();
					},
					isVisible: async () => {
						await customKeyInput.assertions.isVisible();
					},
				},
			},
			display: {
				score: {
					containsText: async (expectedText: string) => {
						await scoreDisplay.assertions.containsText(expectedText);
					},
					isVisible: async () => {
						await scoreDisplay.assertions.isVisible();
					},
				},
				time: {
					containsText: async (expectedText: string) => {
						await timeDisplay.assertions.containsText(expectedText);
					},
					isVisible: async () => {
						await timeDisplay.assertions.isVisible();
					},
				},
			},
			page: {
				title: async (expected: RegExp | string) => {
					await expect(page).toHaveTitle(expected);
				},
				header: async (expected: string) => {
					await expect(page.locator("h1")).toContainText(expected);
				},
			},
		},
	} as const satisfies PageObject;
}

export const createColemakTutor = createColemakTutorPage;
