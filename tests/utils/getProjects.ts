import { devices, type Project } from "@playwright/test";
import { LAYOUT_NAMES, type LayoutName } from "../../src/entities/layouts";
import { KEYBOARD_SHAPES, type KeyboardShape } from "../../src/entities/shapes";

const browserNames = [
	"chromium",
	"firefox",
	"webkit",
] as const satisfies string[];
export type BrowserName = (typeof browserNames)[number];

export interface ProjectOptions {
	browser: BrowserName;
	shape: KeyboardShape;
	layout: LayoutName;
}

export interface TypingTutorProject extends Project {
	name: string;
	use: {
		browserName: BrowserName;
		shape: KeyboardShape;
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

function createProjectName(
	browser: BrowserName,
	shape: KeyboardShape,
	layout: LayoutName,
) {
	return `${browser}-${shape}-${layout}` as const satisfies string;
}

function createProject(options: ProjectOptions): TypingTutorProject {
	const { browser, shape, layout } = options;
	const name = createProjectName(browser, shape, layout);

	return {
		name,
		use: {
			...BROWSER_CONFIGS[browser],
			browserName: browser,
			shape,
			layout,
		},
	};
}

export function getProjects(): TypingTutorProject[] {
	const projects: TypingTutorProject[] = [];
	const testBrowsers = getTestBrowsers();
	const testShapes = getTestShapes();
	const testLayouts = getTestLayouts();

	for (const browser of testBrowsers) {
		for (const shape of testShapes) {
			for (const layout of testLayouts) {
				projects.push(createProject({ browser, shape, layout }));
			}
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

	function getTestShapes() {
		const isFullTest = (process.env.PLAYWRIGHT_FULL_TEST as string) === "true";
		if (isFullTest) {
			return KEYBOARD_SHAPES;
		}
		// Default: first shape only
		return [KEYBOARD_SHAPES[0]];
	}
}

export function getProjectsByBrowser(
	browser: BrowserName,
): TypingTutorProject[] {
	return getProjects().filter((project) => project.use.browserName === browser);
}

export function getProjectsByShape(shape: KeyboardShape): TypingTutorProject[] {
	return getProjects().filter((project) => project.use.shape === shape);
}

export function getProjectsByLayout(layout: LayoutName): TypingTutorProject[] {
	return getProjects().filter((project) => project.use.layout === layout);
}

export function getProjectCount(): number {
	return getProjects().length;
}

export default getProjects;
