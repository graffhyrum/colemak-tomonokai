import { defineConfig } from "@playwright/test";
import { env } from "./config/env";
import getProjects from "./tests/utils/getProjects";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 1 : undefined,
	timeout: 20 * 1000,
	reporter: [["html", { open: "never" }], ["dot"]],
	use: {
		trace: "on",
		actionTimeout: 200,
		baseURL: `http://${env.APP_HOST}:${env.APP_PORT}`,
	},
	expect: {
		timeout: 1000,
	},
	webServer: {
		command: "bun dev",
		port: env.APP_PORT,
		reuseExistingServer: !process.env.CI,
	},
	projects: getProjects(),
});
