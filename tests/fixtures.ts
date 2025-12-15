import { test as base } from "@playwright/test";
import { createHomePage, type HomePagePOM } from "./page-objects/HomePage";

type MyFixtures = {
	homePage: HomePagePOM;
};

export const test = base.extend<MyFixtures>({
	page: async ({ baseURL, browser }, use, testInfo) => {
		const context = await browser.newContext({ baseURL });
		const page = await context.newPage();

		const consoleErrors: string[] = [];
		const pageErrors: string[] = [];

		// Enhanced console listener (focus on 'error' type)
		page.on("console", async (msg) => {
			if (msg.type() === "error") {
				// Resolve all arguments for richer details (e.g., objects, errors with stacks)
				const args = await Promise.all(
					msg
						.args()
						.map((arg) =>
							arg.jsonValue().catch(() => "[Non-serializable value]"),
						),
				);

				const details = [
					`CONSOLE ERROR at ${msg.location().url}:${msg.location().lineNumber}:${msg.location().columnNumber}`,
					`Text: ${msg.text()}`,
					`Args: ${JSON.stringify(args, null, 2)}`,
				].join("\n");

				consoleErrors.push(details);
			}
		});

		// Enhanced pageerror listener (uncaught exceptions)
		page.on("pageerror", (error) => {
			const details = [
				`UNCAUGHT EXCEPTION: ${error.name}: ${error.message}`,
				`Stack trace:\n${error.stack || "No stack trace available"}`,
			].join("\n");

			pageErrors.push(details);
		});

		await use(page);

		// After test: collect and report all errors
		const allErrors = [...consoleErrors, ...pageErrors];

		if (allErrors.length > 0) {
			const errorReport = allErrors.join("\n\n---\n\n");

			await testInfo.attach("browser-errors-details", {
				body: errorReport,
				contentType: "text/plain",
			});
		}

		expect(
			allErrors,
			"Browser console errors or uncaught exceptions detected",
		).toStrictEqual([]);

		await context.close();
	},
	homePage: async ({ page }, use) => {
		const homePage = createHomePage(page);
		await homePage.goto();
		await use(homePage);
	},
});

export const expect = base.expect;
