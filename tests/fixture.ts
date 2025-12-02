import { test as base } from "playwright/test";
import { createColemakTutor } from "./POM/colemakTutorPage.ts";

type ColemakTutorPage = ReturnType<typeof createColemakTutor>;
// noinspection JSUnusedGlobalSymbols : false positive
export const test = base.extend<{
	colemakPage: ColemakTutorPage;
}>({
	colemakPage: async ({ page }, use) => {
		const colemakPage = createColemakTutor(page);
		await colemakPage.goto();
		await use(colemakPage);
	},
});
