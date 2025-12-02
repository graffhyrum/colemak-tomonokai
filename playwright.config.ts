import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1, // single threaded until state can be per-instance
	timeout: 20 * 1000,
	reporter: [["html", { open: "never" }], ["dot"]],
	use: {
		trace: "on",
		actionTimeout: 100,
	},
	expect:{
		timeout: 500
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
