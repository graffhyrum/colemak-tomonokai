import { expect, type Page } from "@playwright/test";
import type { ComponentObject } from "../types";

function createKeyboardSelector(page: Page) {
	const locators = {
		keyboardSelect: page.locator("#keyboard"),
		keyboardDisplay: page.locator(".cheatsheet"),
	} as const;

	return {
		page,
		actions: {
			select: (keyboardType: string) =>
				locators.keyboardSelect.selectOption(keyboardType),
		},
		assertions: {
			isVisible: () => expect(locators.keyboardDisplay).toBeVisible(),
		},
	} as const satisfies ComponentObject;
}

export { createKeyboardSelector };
