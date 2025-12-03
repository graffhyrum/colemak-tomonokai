import { test as base } from "playwright/test";
import { createQWERTYTypingTutorPage } from "./POM/qwertyTutorPage.ts";

type QWERTYTypingTutorPage = ReturnType<typeof createQWERTYTypingTutorPage>;
// noinspection JSUnusedGlobalSymbols : false positive
export const test = base.extend<{
	qwertyPage: QWERTYTypingTutorPage;
}>({
	qwertyPage: async ({ page }, use) => {
		const qwertyPage = createQWERTYTypingTutorPage(page);
		await qwertyPage.goto();
		await use(qwertyPage);
	},
});

// Export test.step for use in tests
export const step = test.step;
