import { test as base } from "playwright/test";
import {
	createTypingTutorPage,
	type TypingTutorPage,
} from "./POM/TypingTutorPage.ts";
import type { ProjectOptions } from "./utils/getProjects.ts";

type Fixtures = ProjectOptions & {
	homePage: TypingTutorPage;
};

export const test = base.extend<Fixtures>({
	layout: ["qwerty", { option: true }],
	homePage: async ({ page }, use) => {
		await use(createTypingTutorPage(page));
	},
});

// Export test.step for use in tests
export const step = test.step;
