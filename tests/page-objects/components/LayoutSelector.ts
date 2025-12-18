import {expect, type Page} from "@playwright/test";
import type {ComponentObject} from "../types";

function createLayoutSelector(page: Page) {
	const locators = {
		layoutSelect: page.locator("#layout"),
		layoutName: page.locator("#layoutName"),
	} as const;

	// Map layout values to display names
	const layoutDisplayNames = {
		colemak: "Colemak",
		colemakdh: "Colemak-DH",
		tarmak: "Tarmak",
		tarmakdh: "Tarmak-DH",
		azerty: "AZERTY",
		dvorak: "Dvorak",
		lefthandeddvorak: "Left-handed Dvorak",
		qwerty: "QWERTY",
		workman: "Workman",
		canary: "Canary",
		custom: "Custom",
	} as const satisfies Record<string, string>;

	return {
		page,
		actions: {
			select: async (layoutName: keyof typeof layoutDisplayNames) => {
				await locators.layoutSelect.selectOption(layoutDisplayNames[layoutName]);
				// Ensure change event is triggered
				await locators.layoutSelect.evaluate((el) =>
					el.dispatchEvent(new Event("change", {bubbles: true})),
				);
			},
			getCurrentName: () => locators.layoutName.textContent(),
		},
		assertions: {
			hasName: (expectedName: keyof typeof layoutDisplayNames) =>
				expect(locators.layoutName).toHaveText(layoutDisplayNames[expectedName]),
		},
	} as const satisfies ComponentObject;
}

export {createLayoutSelector};
