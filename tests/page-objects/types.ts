/** biome-ignore-all lint/suspicious/noExplicitAny: generics */
import type { Locator, Page } from "@playwright/test";

export type Fn<
	returns = unknown,
	args extends readonly any[] = readonly any[],
> = (...args: args) => returns;

export type LocatorConfigMap = Record<string, Locator>;

export interface FunctionTree {
	[key: string]: Fn | FunctionTree;
}

export type ComponentObject = {
	page: Page;
	actions: FunctionTree;
	assertions: FunctionTree;
};

export type PageObject = ComponentObject & {
	goto: () => Promise<void>;
};

export type PomFactory = (page: Page) => PageObject;
export type ComponentFactory = (page: Page) => ComponentObject;
