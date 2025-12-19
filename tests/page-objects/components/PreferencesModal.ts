import { expect, type Page } from "@playwright/test";
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

	const open = async () => {
		// Check if modal is already open
		const isModalOpen = await locators.closePreferenceButton.isEnabled();
		if (!isModalOpen) {
			await locators.preferenceButton.click();
		}
		await expect(locators.preferenceButton).not.toBeEnabled();
		await expect(locators.closePreferenceButton).toBeVisible();
		await expect(locators.closePreferenceButton).toBeEnabled();
	};

	const close = async () => {
		// Check if modal is already closed
		const isModalClosed = await locators.preferenceButton.isEnabled();
		if (!isModalClosed) {
			await locators.closePreferenceButton.click();
		}
		await expect(locators.closePreferenceButton).not.toBeEnabled();
		await expect(locators.preferenceButton).toBeVisible();
		await expect(locators.preferenceButton).toBeEnabled();
	};

	return {
		page,
		actions: {
			open,
			close,
			setWordLimit: async (wordLimit: number) => {
				if (wordLimit % 10 !== 0 || wordLimit < 10 || wordLimit > 200) {
					throw new Error(
						"Word limit must be between 10 and 200 and a multiple of 10",
					);
				}
				await open();
				await locators.spinButton.fill(wordLimit.toString());
				await locators.spinButton.press("Enter");
				// Trigger change event
				await locators.spinButton.evaluate((el) =>
					el.dispatchEvent(new Event("change", { bubbles: true })),
				);
				await close();
			},

			setWordScrollingMode: async (mode: "enable" | "disable") => {
				await open();
				const wordScrollingButton = page.locator(".wordScrollingModeButton");
				const isChecked = await wordScrollingButton.isChecked();
				const shouldBeChecked = mode === "enable";
				if (isChecked !== shouldBeChecked) {
					await wordScrollingButton.click();
				}
				await close();
			},

			toggleFullSentenceMode: async () => {
				await open();
				const fullSentenceButton = page.locator(".fullSentenceMode");
				await fullSentenceButton.click();
				await close();
			},
		},

		assertions: {},
	} as const satisfies ComponentObject;
}

export const createPreferencesModal =
	createPreferencesModalComponent satisfies ComponentFactory;
