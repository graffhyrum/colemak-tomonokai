/** biome-ignore-all lint/suspicious/noExplicitAny: used for generics */
// noinspection JSUnusedGlobalSymbols : lib code

import type { Locator, Page } from "@playwright/test";

export type PageObject = ComponentObject & {
	goto: () => ReturnType<Page["goto"]>;
};

export type ComponentObject = {
	page: Page;
	// locators are not exposed to discourage exposing implementation details
	actions: FunctionTree;
	assertions: FunctionTree;
};
// Recursive pattern gives nice DX, as it allows arbitrary depth for
// function organization and discoverability
export interface FunctionTree {
	[key: string]: Fn | FunctionTree;
}

export type PomFactory = (page: Page) => PageObject;
export type ComponentFactory = (page: Page, ...args: any[]) => ComponentObject;

export type LocatorConfigMap = Record<string, Locator>;

export type Fn<
	returns = unknown,
	args extends readonly any[] = readonly any[],
> = (...args: args) => returns;
