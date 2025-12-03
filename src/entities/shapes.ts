export const KEYBOARD_SHAPES = [
	"ortho",
	"ansi",
	"iso",
] as const satisfies string[];
export type KeyboardShape = (typeof KEYBOARD_SHAPES)[number];
