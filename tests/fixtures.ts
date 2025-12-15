import { test as base } from "@playwright/test";
import { createHomePage, type HomePagePOM } from "./page-objects/HomePage";

type MyFixtures = {
	homePage: HomePagePOM;
};

export const test = base.extend<MyFixtures>({
	homePage: async ({ page }, use) => {
		const homePage = createHomePage(page);
		await homePage.goto();
		await use(homePage);
	},
});

export const expect = base.expect;
