import type { Page } from "@playwright/test";
import type { ComponentObject } from "../types.ts";

export function createKeyboardComponent(page: Page): ComponentObject {
	return {
		page,
		actions: {
			press: async (key: string) => {
				await page.keyboard.press(key);
			},
			tab: async () => {
				await page.keyboard.press("Tab");
			},
			escape: async () => {
				await page.keyboard.press("Escape");
			},
		},
		assertions: {},
	} as const satisfies ComponentObject;
}
