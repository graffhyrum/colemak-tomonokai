import { expect } from "@playwright/test";

export function assertDefined<T>(value: T): asserts value is NonNullable<T> {
	expect(value).toBeDefined();
}
