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
				// Close menu first if open
				const closeButton = page.locator("button.closePreferenceButton");
				if (await closeButton.isVisible()) {
					await closeButton.click();
				}
				await locators.preferenceButton.click();
				await locators.spinButton.fill(wordLimit.toString());
				await locators.spinButton.press("Enter");
				// Trigger change event
				await locators.spinButton.evaluate((el) =>
					el.dispatchEvent(new Event("change", { bubbles: true })),
				);
				await locators.closePreferenceButton.click();
			},

			toggleWordScrollingMode: async () => {
				// Close menu first if open
				const closeButton = page.locator("button.closePreferenceButton");
				if (await closeButton.isVisible()) {
					await closeButton.click();
				}
				await locators.preferenceButton.click();
				const wordScrollingButton = page.locator(".wordScrollingModeButton");
				await wordScrollingButton.click();
				await locators.closePreferenceButton.click();
			},

			toggleFullSentenceMode: async () => {
				// Close menu first if open
				const closeButton = page.locator("button.closePreferenceButton");
				if (await closeButton.isVisible()) {
					await closeButton.click();
				}
				await locators.preferenceButton.click();
				const fullSentenceButton = page.locator(".fullSentenceMode");
				await fullSentenceButton.click();
				await locators.closePreferenceButton.click();
			},
		},

		assertions: {},
	} as const satisfies ComponentObject;
}

export const createPreferencesModal =
	createPreferencesModalComponent satisfies ComponentFactory;
