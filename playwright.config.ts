import { defineConfig, devices } from "@playwright/test";
import { env } from "./config/env";

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
		baseURL: `http://${env.APP_HOST}:${env.APP_PORT}`,
	},
	expect: {
		timeout: 500,
	},
	webServer: {
		command: "bun dev",
		port: env.APP_PORT,
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
