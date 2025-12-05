import { expect, type Page } from "@playwright/test";
import { assertLevel, type Level } from "../../../src/entities/levels";
import type { ComponentObject } from "../types";

export const createNavigation = (page: Page) => {
	const locators = {
		nav: page.locator("nav").filter({ hasText: /Level \d/ }),
		levelButtons: page.locator("nav button"),
		currentLevelButton: page.locator("nav button.currentLevel"),
	};

	return {
		page,
		actions: {
			selectLevel: async (level: Level) => {
				const levelText = level === 7 ? "All Words" : `Level ${level}`;
				const levelButton = locators.levelButtons.filter({
					hasText: levelText,
				});
				await levelButton.click({ timeout: 500 });
			},
			getCurrentLevel: async (): Promise<Level> => {
				const text = await locators.currentLevelButton.innerText();
				if (text.includes("All Words")) return 7;
				const match = text.match(/Level (\d)/);
				const maybelevel = Number.parseInt(match?.[1] || "1", 10);
				assertLevel(maybelevel);
				return maybelevel;
			},
		},
		assertions: {
			isVisible: async () => {
				await expect(locators.nav).toBeVisible();
			},
			hasLevelCount: async (count: number) => {
				await expect(locators.levelButtons).toHaveCount(count);
			},
			hasCurrentLevel: async (level: Level) => {
				const expectedText = level === 7 ? "All Words" : `Level ${level}`;
				await expect(locators.currentLevelButton).toContainText(expectedText);
			},
		},
	} as const satisfies ComponentObject;
};
