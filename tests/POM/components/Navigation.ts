import { expect, type Page } from "@playwright/test";
import type { ComponentObject } from "../types";

export const createNavigation = (page: Page) => {
	const locators = {
		nav: page.locator("nav"),
	};

	return {
		page,
		actions: {},
		assertions: {
			isVisible: async () => {
				await expect(locators.nav).toBeVisible();
			},
		},
	} as const satisfies ComponentObject;
};
