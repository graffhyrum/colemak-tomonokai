import {dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {defineConfig, devices} from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	timeout: 20 * 1000,
	reporter: [["html", {open: "never"}], ["dot"]],
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
		actionTimeout: 500,
	},
	projects: [
		{
			name: "chromium",
			use: {...devices["Desktop Chrome"]},
		},
	],
	webServer: {
		command: "bun run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 30 * 1000,
	},
});
