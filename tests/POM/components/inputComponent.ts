import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { ComponentObject } from "../types.ts";

export function createInputComponent(
	page: Page,
	...selectorArgs: Parameters<(typeof page)["locator"]>
) {
	const locators = {
		input: page.locator(...selectorArgs),
	} as const satisfies Record<string, Locator>;

	return {
		page,
		actions: {
			fill: async (text: string) => {
				await locators.input.fill(text);
			},
			clear: async () => {
				await locators.input.focus();
				await locators.input.press("Control+a");
				await locators.input.press("Delete");
			},
			focus: async () => {
				await locators.input.focus();
			},
			blur: async () => {
				await locators.input.blur();
			},
		},
		assertions: {
			hasValue: async (expectedValue: string) => {
				await expect(locators.input).toHaveValue(expectedValue);
			},
			isAttached: async () => {
				await expect(locators.input).toBeAttached();
			},
			isVisible: async () => {
				await expect(locators.input).toBeVisible();
			},
		},
	} as const satisfies ComponentObject;
}
