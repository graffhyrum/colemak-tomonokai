export const KEYBOARD_SHAPES = [
	"ansi",
	"iso",
	"ortho",
] as const satisfies string[];
export type KeyboardShape = (typeof KEYBOARD_SHAPES)[number];
