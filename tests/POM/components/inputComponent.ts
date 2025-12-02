import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import type { ComponentObject } from "../types.ts";

export function createInputComponent(page: Page, selector: string): ComponentObject {
  const locators = {
    input: page.locator(selector),
  } as const satisfies Record<string, Locator>;

  return {
    page,
    actions: {
      fill: async (text: string) => {
        await locators.input.fill(text);
      },
      clear: async () => {
        await locators.input.fill("");
      },
      focus: async () => {
        await locators.input.focus();
      },
    },
    assertions: {
      hasValue: async (expectedValue: string) => {
        await expect(locators.input).toHaveValue(expectedValue);
      },
      isAttached: async () => {
        await expect(locators.input).toBeAttached();
      },
      isVisible: async () => {
        await expect(locators.input).toBeVisible();
      },
    },
  } as const satisfies ComponentObject;
}