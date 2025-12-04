/** biome-ignore-all lint/suspicious/noExplicitAny: used for generics */
// noinspection JSUnusedGlobalSymbols : lib code

import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

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

//region Example usage

// noinspection JSUnusedLocalSymbols
const _example_createLoginPageObject = (page: Page) => {
	const locators = {
		loginButton: page.locator("button"),
	} as const satisfies LocatorConfigMap;
	// component is instantiated but not exposed
	const navBar = _example_createNavBar(page);
	return {
		page,
		goto: async () => await page.goto("/login"),
		actions: {
			login: async () => await locators.loginButton.click(),
			goToFirstLink: async () => await navBar.actions.clickFirstLink(),
		},
		assertions: {
			isLoggedIn: async () =>
				await expect(locators.loginButton).not.toBeVisible(),
			hasThreeNavLinks: async () => await navBar.assertions.hasNLinks(3),
		},
	} as const satisfies PageObject;
};

const _example_createNavBar = (page: Page) => {
	const locators = {
		navBar: page.locator("nav"),
		navBarLink: page.locator("nav a"),
	} as const satisfies LocatorConfigMap;
	return {
		page,
		actions: {
			clickFirstLink: async () => await locators.navBarLink.first().click(),
		},
		assertions: {
			hasNLinks: async (n: number) =>
				await expect(locators.navBarLink).toHaveCount(n),
		},
	} as const satisfies ComponentObject;
};

//endregion
