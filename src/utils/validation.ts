export function assertDefined<T>(x: T): asserts x is NonNullable<T> {
	if (x === undefined || x === null) {
		throw new Error(`Expected ${x} to be defined`);
	}
}
