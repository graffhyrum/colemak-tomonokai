import { test as base } from "playwright/test";
import type { ProjectOptions } from "./utils/getProjects.ts";

export const test = base.extend<ProjectOptions>({
	layout: ["qwerty", { option: true }],
});

// Export test.step for use in tests
export const step = test.step;
