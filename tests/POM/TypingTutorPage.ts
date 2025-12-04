import { expect, type Page } from "@playwright/test";
import type { LayoutName } from "../../src/entities/layouts";
import { LAYOUT_DICTIONARIES } from "../../src/entities/layouts";
import type { Level } from "../../src/entities/levels";
import type { KeyboardShape } from "../../src/entities/shapes";
import { createSelectComponentObject } from "./components/genericSelect.ts";
import { createKeyboardDisplay } from "./components/KeyboardDisplay";
import { createNavigation } from "./components/Navigation";
import { createPageHeader } from "./components/PageHeader";

import type { PageObject } from "./types.ts";

export const createTypingTutorPage = (page: Page) => {
	const layoutSelectComponent = createSelectComponentObject(page, "layout");
	const keyboardSelectComponent = createSelectComponentObject(page, "shape");
	const keyboardDisplay = createKeyboardDisplay(page);
	const pageHeader = createPageHeader(page);
	const navigation = createNavigation(page);

	const actions = {
		selectLayout: async (layout: LayoutName) => {
			await layoutSelectComponent.actions.selectOption(layout);
		},
		selectKeyboardShape: async (shape: KeyboardShape) => {
			await keyboardSelectComponent.actions.selectOption(shape);
		},
		selectLevel: async (level: Level) => {
			await navigation.actions.selectLevel(level);
		},
		navigateThroughLevels: async (levels: Level[]) => {
			for (const level of levels) {
				await navigation.actions.selectLevel(level);
				await navigation.assertions.hasCurrentLevel(level);
			}
		},
	};

	const assertions = {
		isLoaded: async () => {
			await pageHeader.assertions.isVisible();
			await navigation.assertions.isVisible();
			await layoutSelectComponent.assertions.isLoaded();
			await keyboardSelectComponent.assertions.isLoaded();
			await keyboardDisplay.assertions.isVisible();
		},
		hasCorrectLayout: async (layout: LayoutName) => {
			await layoutSelectComponent.assertions.hasSelectedValue(layout);
		},
		hasCorrectShape: async (shape: KeyboardShape) => {
			await keyboardSelectComponent.assertions.hasSelectedValue(shape);
		},
		hasCorrectLayoutAndShape: async (
			layout: LayoutName,
			shape: KeyboardShape,
		) => {
			await layoutSelectComponent.assertions.hasSelectedValue(layout);
			await keyboardSelectComponent.assertions.hasSelectedValue(shape);
		},
		hasCurrentLevel: async (level: Level) => {
			await navigation.assertions.hasCurrentLevel(level);
		},
		hasNavigationWithLevelCount: async (count: number) => {
			await navigation.assertions.isVisible();
			await navigation.assertions.hasLevelCount(count);
		},
		hasHighlightedKeys: async () => {
			const highlightedKeys =
				await keyboardDisplay.actions.getHighlightedKeys();
			expect(highlightedKeys.length).toBeGreaterThan(0);
		},
		hasLevelHighlighting: async (layout: LayoutName, level: Level) => {
			const levelLetters = getLevelLetters(layout, level);
			const letterArray = levelLetters.split("");
			const nonEmptyLetters = letterArray.filter((letter) => letter.trim());

			// Verify keyboard contains the letters for this level
			for (const letter of nonEmptyLetters) {
				await keyboardDisplay.assertions.containsLetter(letter);
			}

			// Verify there are some highlighted keys (don't check specific letters as they may vary)
			await assertions.hasHighlightedKeys();
		},
	};

	return {
		page,
		goto: async () => await page.goto("/"),
		actions,
		assertions,
	} as const satisfies PageObject;
};

function getLevelLetters(layout: LayoutName, level: Level): string {
	const layoutDict = LAYOUT_DICTIONARIES[layout];
	if (!layoutDict) return "";
	const levelKey = `lvl${level}` as const;
	return layoutDict[levelKey] || "";
}

export type TypingTutorPage = ReturnType<typeof createTypingTutorPage>;
