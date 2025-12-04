import { expect, type Page } from "@playwright/test";
import type { ComponentObject } from "../types";

export const createPageHeader = (page: Page) => {
	const locators = {
		header: page.locator("header"),
		title: page.locator("h1"),
	};

	return {
		page,
		actions: {},
		assertions: {
			hasTitle: async (title: string) => {
				await expect(locators.title).toContainText(title);
			},
			isVisible: async () => {
				await expect(locators.header).toBeVisible();
			},
		},
	} as const satisfies ComponentObject;
};
