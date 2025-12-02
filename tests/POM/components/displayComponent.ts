import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { ComponentObject } from "../types.ts";

export function createDisplayComponent(
	page: Page,
	selector: string,
) {
	const locators = {
		display: page.locator(selector),
	} as const satisfies Record<string, Locator>;

	return {
		page,
		actions: {
			getText: async () => {
				return await locators.display.textContent();
			},
		},
		assertions: {
			containsText: async (expectedText: string) => {
				await expect(locators.display).toContainText(expectedText);
			},
			isVisible: async () => {
				await expect(locators.display).toBeVisible();
			},
		},
	} as const satisfies ComponentObject;
}
