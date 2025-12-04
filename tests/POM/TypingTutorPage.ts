import type { Page } from "@playwright/test";
import type { LayoutName } from "../../src/entities/layouts";
import type { KeyboardShape } from "../../src/entities/shapes";
import { createSelectComponentObject } from "./components/genericSelect.ts";
import { createKeyboardDisplay } from "./components/KeyboardDisplay";
import { createNavigation } from "./components/Navigation";
import { createPageHeader } from "./components/PageHeader";
import type { PageObject } from "./types.ts";

export const createTypingTutorPage = (page: Page) => {
	const layoutSelectComponent = createSelectComponentObject(page, "layout");
	const shapeSelectComponent = createSelectComponentObject(page, "shape");
	const _keyboardDisplay = createKeyboardDisplay(page);
	const pageHeader = createPageHeader(page);
	const navigation = createNavigation(page);

	return {
		page,
		goto: async () => await page.goto("/"),
		actions: {
			selectLayout: async (layout: LayoutName) => {
				await layoutSelectComponent.actions.selectOption(layout);
			},
			selectKeyboardShape: async (shape: KeyboardShape) => {
				await shapeSelectComponent.actions.selectOption(shape);
			},
		},
		assertions: {
			isLoaded: async () => {
				await pageHeader.assertions.isVisible();
				await navigation.assertions.isVisible();
				await layoutSelectComponent.assertions.isLoaded();
				await shapeSelectComponent.assertions.isLoaded();
			},
			hasCorrectLayoutAndShape: async (
				layout: LayoutName,
				shape: KeyboardShape,
			) => {
				await layoutSelectComponent.assertions.hasSelectedValue(layout);
				await shapeSelectComponent.assertions.hasSelectedValue(shape);
			},
		},
	} as const satisfies PageObject;
};
export type TypingTutorPage = ReturnType<typeof createTypingTutorPage>;
