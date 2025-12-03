import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	// workers: process.env.CI ? 2 : undefined,
	workers: 1, // single threaded until state can be per-instance
	timeout: 20 * 1000,
	reporter: [["html", { open: "never" }], ["dot"]],
	use: {
		trace: "on",
		actionTimeout: 100,
	},
	expect: {
		timeout: 500,
	},
	webServer: {
		command: "bun --hot index.html",
		port: 3000,
		reuseExistingServer: !process.env.CI,
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},
	],
});
