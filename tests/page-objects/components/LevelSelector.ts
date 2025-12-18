import { expect, type Page } from "@playwright/test";
import type { ComponentObject } from "../types";

function createLevelSelector(page: Page) {
	const locators = {
		levelButton: (level: number) => page.locator(`button.lvl${level}`),
		allWordsButton: page.locator("button.lvl7"),
		fullSentencesButton: page.locator("button.lvl8"),
		currentLevelButton: page.locator("button.currentLevel"),
	} as const;

	return {
		page,
		actions: {
			select: (levelNumber: number) =>
				locators.levelButton(levelNumber).click(),
			selectAllWords: () => locators.allWordsButton.click(),
			selectFullSentences: () => locators.fullSentencesButton.click(),
			getCurrentLevelText: () => locators.currentLevelButton.textContent(),
		},
		assertions: {
			hasCurrentLevel: (expectedLevel: string) =>
				expect(locators.currentLevelButton).toHaveText(expectedLevel),
			isNotHighlighted: (levelNumber: number) =>
				expect(locators.levelButton(levelNumber)).not.toHaveClass(
					"currentLevel",
				),
		},
	} as const satisfies ComponentObject;
}

export { createLevelSelector };
