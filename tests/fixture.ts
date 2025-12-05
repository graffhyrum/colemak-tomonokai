import { test as base } from "playwright/test";
import type { LayoutName } from "../src/entities/layouts";
import {
	createTypingTutorPage,
	type TypingTutorPage,
} from "./POM/TypingTutorPage.ts";

type Fixtures = {
	homePage: TypingTutorPage;
	layout: LayoutName;
};

export const test = base.extend<Fixtures>({
	layout: ["qwerty", { option: true }],
	homePage: async ({ page }, use) => {
		await use(createTypingTutorPage(page));
	},
});

// Export test.step for use in tests
export const step = test.step;
