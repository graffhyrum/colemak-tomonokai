import { expect, type Page } from "@playwright/test";
import type {
	ComponentFactory,
	ComponentObject,
	LocatorConfigMap,
} from "../types";

function createTestResultsComponent(page: Page) {
	const locators = {
		testResults: page.locator("#testResults"),
		accuracyText: page.locator("#accuracyText"),
		wpmText: page.locator("#wpmText"),
	} as const satisfies LocatorConfigMap;

	return {
		page,
		actions: {
			getAllResults: async () => {
				const [accuracyText, wpmText] = await Promise.all([
					locators.accuracyText.textContent(),
					locators.wpmText.textContent(),
				]);
				return { accuracyText, wpmText };
			},

			getFinalAccuracyText: async () => {
				return await locators.accuracyText.textContent();
			},

			getFinalWpmText: async () => {
				return await locators.wpmText.textContent();
			},
		},

		assertions: {
			isVisible: async () => {
				await expect(locators.testResults).toBeVisible();
			},

			validateScoreData: (
				score: number,
				accuracy?: string | null,
				wpm?: string | null,
			) => {
				expect(score).toBeGreaterThan(0);

				if (accuracy?.trim()) {
					expect(accuracy).toContain("100.00%");
				}

				if (wpm?.trim()) {
					expect(wpm).toMatch(/WPM: \d+\.\d+/);
				}
			},

			perfectGameResults: (
				finalScore: number,
				finalAccuracyText: string | null,
				finalWpmText: string | null,
			) => {
				expect(finalScore).toBeGreaterThan(0);

				if (finalAccuracyText?.trim()) {
					expect(finalAccuracyText).toContain("100.00%");
				}

				if (finalWpmText?.trim()) {
					expect(finalWpmText).toMatch(/WPM: \d+\.\d+/);
				}
			},

			validateFinalGameState: async (finalScore: number) => {
				await expect(locators.testResults).toBeVisible();

				const [accuracyText, wpmText] = await Promise.all([
					locators.accuracyText.textContent(),
					locators.wpmText.textContent(),
				]);

				expect(finalScore).toBeGreaterThan(0);

				if (accuracyText?.trim()) {
					expect(accuracyText).toContain("100.00%");
				}

				if (wpmText?.trim()) {
					expect(wpmText).toMatch(/WPM: \d+\.\d+/);
				}
			},
		},
	} as const satisfies ComponentObject;
}

export const createTestResults =
	createTestResultsComponent satisfies ComponentFactory;
