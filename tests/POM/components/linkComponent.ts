import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import type { ComponentObject } from "../types.ts";

export function createLinkComponent(page: Page, selector: string): ComponentObject {
  const locators = {
    link: page.locator(selector),
  } as const satisfies Record<string, Locator>;

  return {
    page,
    actions: {
      click: async () => {
        await locators.link.click();
      },
    },
    assertions: {
      hasHref: async (expectedHref: string) => {
        await expect(locators.link).toHaveAttribute("href", expectedHref);
      },
      isVisible: async () => {
        await expect(locators.link).toBeVisible();
      },
    },
  } as const satisfies ComponentObject;
}