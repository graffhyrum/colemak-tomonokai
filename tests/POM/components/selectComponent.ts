import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import type { ComponentObject } from "../types.ts";

export type SelectActions = {
  selectOption: (value: string) => Promise<void>;
};

export type SelectAssertions = {
  hasValue: (expectedValue: string) => Promise<void>;
  hasOptionsCount: (expectedCount: number) => Promise<void>;
  optionExists: (value: string) => Promise<void>;
};

export function createSelectComponent(page: Page, selector: string): ComponentObject {
  const locators = {
    select: page.locator(selector),
    options: page.locator(`${selector} option`),
  } as const satisfies Record<string, Locator>;

  return {
    page,
    actions: {
      selectOption: async (value: string) => {
        await locators.select.selectOption(value);
      },
    },
    assertions: {
      hasValue: async (expectedValue: string) => {
        await expect(locators.select).toHaveValue(expectedValue);
      },
      hasOptionsCount: async (expectedCount: number) => {
        await expect(locators.options).toHaveCount(expectedCount);
      },
      optionExists: async (value: string) => {
        await expect(locators.select.locator(`option[value="${value}"]`)).toBeAttached();
      },
    },
  } as const satisfies ComponentObject;
}