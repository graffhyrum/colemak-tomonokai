import { expect, type Page } from "@playwright/test";
import { LAYOUT_NAMES, type LayoutName } from "../../../src/entities/layouts";
import type { ComponentObject } from "../types";

export const createLayoutSelect = (page: Page) => {
	const locators = {
		select: page.locator('select[name="layout"]'),
		options: page.locator('select[name="layout"] option'),
	};

	return {
		page,
		actions: {
			selectLayout: async (layout: LayoutName) => {
				await locators.select.selectOption(layout);
			},
			getSelectedValue: async (): Promise<string> => {
				return await locators.select.inputValue();
			},
			getAvailableOptions: async (): Promise<string[]> => {
				return await locators.options.allInnerTexts();
			},
		},
		assertions: {
			isLoaded: async () => {
				await isVisible();
				await hasSomeValue();
				await hasOptionCount(LAYOUT_NAMES.length);
			},
			hasSelectedValue: async (layout: LayoutName) => {
				await expect(locators.select).toHaveValue(layout);
			},
			hasOptionCount,
			hasSomeValue,
			isVisible,
		},
	} as const satisfies ComponentObject;

	async function isVisible() {
		await expect(locators.select).toBeVisible();
	}

	async function hasSomeValue() {
		await expect(locators.select).toHaveValue(/\w+/);
	}

	async function hasOptionCount(count: number) {
		await expect(locators.options).toHaveCount(count);
	}
};
