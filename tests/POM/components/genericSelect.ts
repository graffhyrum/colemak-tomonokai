import { expect, type Page } from "@playwright/test";
import { LAYOUT_NAMES } from "../../../src/entities/layouts.ts";
import { KEYBOARD_SHAPES } from "../../../src/entities/shapes.ts";
import type { ComponentObject } from "../types";

const selectConfigs = {
	layout: LAYOUT_NAMES,
	shape: KEYBOARD_SHAPES,
} as const;

export const createSelectComponentObject = (
	page: Page,
	name: keyof typeof selectConfigs,
) => {
	const selectLocator = page.locator(`select[name="${name}"]`);
	const optionsLocator = selectLocator.locator("option");

	return {
		page,
		actions: {
			selectOption: async (
				value: (typeof selectConfigs)[typeof name][number],
			) => {
				await selectLocator.selectOption(value);
			},
			getCurrentValue,
			getAvailableOptions: async () => {
				return await optionsLocator.allInnerTexts();
			},
		},
		assertions: {
			isLoaded: async () => {
				await isVisible();
				await hasSomeValue();
				await hasOptionCount(selectConfigs[name].length);
			},
			hasSelectedValue: async (
				value: (typeof selectConfigs)[typeof name][number],
			) => {
				await expect(selectLocator).toHaveValue(value);
			},
			hasOptionCount,
			hasSomeValue,
			isVisible,
		},
	} as const satisfies ComponentObject;

	async function getCurrentValue() {
		return await selectLocator.inputValue();
	}

	async function isVisible() {
		await expect(selectLocator).toBeVisible();
	}

	async function hasSomeValue() {
		await expect(selectLocator).toHaveValue(/\w+/);
	}

	async function hasOptionCount(count: number) {
		await expect(optionsLocator).toHaveCount(count);
	}
};
