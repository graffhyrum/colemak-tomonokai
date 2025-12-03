import { devices, type Project } from "@playwright/test";
import { LAYOUT_NAMES, type LayoutName } from "../../src/entities/layouts";

const browserNames = [
	"chromium",
	"firefox",
	"webkit",
] as const satisfies string[];
export type BrowserName = (typeof browserNames)[number];

export interface ProjectOptions {
	browser: BrowserName;
	layout: LayoutName;
}

export interface TypingTutorProject extends Project {
	name: string;
	use: {
		browserName: BrowserName;
		layout: LayoutName;
	} & Record<string, unknown>;
}

const BROWSER_CONFIGS = {
	chromium: devices["Desktop Chrome"],
	firefox: devices["Desktop Firefox"],
	webkit: devices["Desktop Safari"],
} as const satisfies Record<
	BrowserName,
	(typeof devices)[keyof typeof devices]
>;

function createProjectName(browser: BrowserName, layout: LayoutName) {
	return `${browser}-${layout}` as const satisfies string;
}

function createProject(options: ProjectOptions): TypingTutorProject {
	const { browser, layout } = options;
	const name = createProjectName(browser, layout);

	return {
		name,
		use: {
			...BROWSER_CONFIGS[browser],
			browserName: browser,
			layout,
		},
	};
}

export function getProjects(): TypingTutorProject[] {
	const projects: TypingTutorProject[] = [];
	const testBrowsers = getTestBrowsers();
	const testLayouts = getTestLayouts();

	for (const browser of testBrowsers) {
		for (const layout of testLayouts) {
			projects.push(createProject({ browser, layout }));
		}
	}

	return projects;

	function getTestBrowsers() {
		const isFullTest = (process.env.PLAYWRIGHT_FULL_TEST as string) === "true";
		if (isFullTest) {
			return browserNames;
		}
		// Default: first browser only
		return [browserNames[0]];
	}

	function getTestLayouts() {
		const isFullTest = (process.env.PLAYWRIGHT_FULL_TEST as string) === "true";
		if (isFullTest) {
			return LAYOUT_NAMES;
		}
		// Default: first two layouts only
		return LAYOUT_NAMES.slice(0, 2);
	}
}

export default getProjects;
