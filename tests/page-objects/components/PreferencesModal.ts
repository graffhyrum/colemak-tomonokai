import type { Page } from "@playwright/test";
import type {
	ComponentFactory,
	ComponentObject,
	LocatorConfigMap,
} from "../types";

function createPreferencesModalComponent(page: Page) {
	const locators = {
		preferenceButton: page.locator("button.preferenceButton"),
		closePreferenceButton: page.locator("button.closePreferenceButton"),
		spinButton: page.getByRole("spinbutton"),
	} as const satisfies LocatorConfigMap;

	return {
		page,
		actions: {
			open: async () => {
				await locators.preferenceButton.click();
			},

			close: async () => {
				await locators.closePreferenceButton.click();
			},

			setWordLimit: async (wordLimit: number) => {
				await locators.preferenceButton.click();
				await locators.spinButton.click();
				await locators.spinButton.fill(wordLimit.toString());
				await locators.spinButton.press("Enter");
				await locators.closePreferenceButton.click();
			},
		},

		assertions: {},
	} as const satisfies ComponentObject;
}

export const createPreferencesModal =
	createPreferencesModalComponent satisfies ComponentFactory;
