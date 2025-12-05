export type KeyWidth =
	| "1u"
	| "1.25u"
	| "1.5u"
	| "1.75u"
	| "2u"
	| "2.25u"
	| "2.75u"
	| "6.25u";

export interface KeyTemplate {
	id?: string;
	width: KeyWidth;
	classes?: string[];
	isModifier?: boolean;
	isEmpty?: boolean;
	isFunctional?: boolean; // spacebar, shift, etc.
}

export interface KeyboardTemplate {
	shape: "ansi" | "iso" | "ortho";
	rows: KeyTemplate[][];
	gridColumns: number;
	gridRows: number;
}

export const KEYBOARD_TEMPLATES: Record<string, KeyboardTemplate> = {
	ansi: {
		shape: "ansi",
		gridColumns: 74,
		gridRows: 5,
		rows: [
			// Row 1: Number row + Backspace
			[
				{ id: "Backquote", width: "1u" },
				{ id: "Digit1", width: "1u" },
				{ id: "Digit2", width: "1u" },
				{ id: "Digit3", width: "1u" },
				{ id: "Digit4", width: "1u" },
				{ id: "Digit5", width: "1u" },
				{ id: "Digit6", width: "1u" },
				{ id: "Digit7", width: "1u" },
				{ id: "Digit8", width: "1u" },
				{ id: "Digit9", width: "1u" },
				{ id: "Digit0", width: "1u" },
				{ id: "Minus", width: "1u" },
				{ id: "Equal", width: "1u" },
				{ id: "Backspace", width: "2u", isFunctional: true },
			],
			// Row 2: Tab + QWERTY row + Backslash
			[
				{ width: "1.5u", isEmpty: true }, // Tab placeholder
				{ id: "KeyQ", width: "1u" },
				{ id: "KeyW", width: "1u" },
				{ id: "KeyE", width: "1u" },
				{ id: "KeyR", width: "1u" },
				{ id: "KeyT", width: "1u" },
				{ id: "KeyY", width: "1u" },
				{ id: "KeyU", width: "1u" },
				{ id: "KeyI", width: "1u" },
				{ id: "KeyO", width: "1u" },
				{ id: "KeyP", width: "1u" },
				{ id: "BracketLeft", width: "1u" },
				{ id: "BracketRight", width: "1u" },
				{ id: "Backslash", width: "1.5u" },
			],
			// Row 3: Caps Lock + Home row + Enter
			[
				{ width: "1.75u", isEmpty: true }, // Caps Lock placeholder
				{ id: "KeyA", width: "1u" },
				{ id: "KeyS", width: "1u" },
				{ id: "KeyD", width: "1u" },
				{ id: "KeyF", width: "1u", classes: ["resting-position"] },
				{ id: "KeyG", width: "1u" },
				{ id: "KeyH", width: "1u" },
				{ id: "KeyJ", width: "1u", classes: ["resting-position"] },
				{ id: "KeyK", width: "1u" },
				{ id: "KeyL", width: "1u" },
				{ id: "Semicolon", width: "1u" },
				{ id: "Quote", width: "1u" },
				{ id: "Enter", width: "2.25u", isFunctional: true },
			],
			// Row 4: Shift + Bottom row + Shift
			[
				{ id: "ShiftLeft", width: "2.25u", isFunctional: true },
				{ id: "KeyZ", width: "1u" },
				{ id: "KeyX", width: "1u" },
				{ id: "KeyC", width: "1u" },
				{ id: "KeyV", width: "1u" },
				{ id: "KeyB", width: "1u" },
				{ id: "KeyN", width: "1u" },
				{ id: "KeyM", width: "1u" },
				{ id: "Comma", width: "1u" },
				{ id: "Period", width: "1u" },
				{ id: "Slash", width: "1u" },
				{ id: "ShiftRight", width: "2.75u", isFunctional: true },
			],
			// Row 5: Modifier row
			[
				{ width: "1.25u", isEmpty: true }, // Ctrl
				{ width: "1.25u", isEmpty: true }, // Win/Cmd
				{ width: "1.25u", isEmpty: true }, // Alt
				{ id: "Space", width: "6.25u", isFunctional: true },
				{ width: "1.25u", isEmpty: true }, // Alt
				{ width: "1.25u", isEmpty: true }, // Win/Cmd
				{ width: "1.25u", isEmpty: true }, // Menu
				{ width: "1.25u", isEmpty: true }, // Ctrl
			],
		],
	},
	iso: {
		shape: "iso",
		gridColumns: 74,
		gridRows: 5,
		rows: [
			// Row 1: Number row + Backspace
			[
				{ id: "Backquote", width: "1u" },
				{ id: "Digit1", width: "1u" },
				{ id: "Digit2", width: "1u" },
				{ id: "Digit3", width: "1u" },
				{ id: "Digit4", width: "1u" },
				{ id: "Digit5", width: "1u" },
				{ id: "Digit6", width: "1u" },
				{ id: "Digit7", width: "1u" },
				{ id: "Digit8", width: "1u" },
				{ id: "Digit9", width: "1u" },
				{ id: "Digit0", width: "1u" },
				{ id: "Minus", width: "1u" },
				{ id: "Equal", width: "1u" },
				{ id: "Backspace", width: "2u", isFunctional: true },
			],
			// Row 2: Tab + QWERTY row + ISO enter
			[
				{ width: "1.5u", isEmpty: true }, // Tab placeholder
				{ id: "KeyQ", width: "1u" },
				{ id: "KeyW", width: "1u" },
				{ id: "KeyE", width: "1u" },
				{ id: "KeyR", width: "1u" },
				{ id: "KeyT", width: "1u" },
				{ id: "KeyY", width: "1u" },
				{ id: "KeyU", width: "1u" },
				{ id: "KeyI", width: "1u" },
				{ id: "KeyO", width: "1u" },
				{ id: "KeyP", width: "1u" },
				{ id: "BracketLeft", width: "1u" },
				{ id: "BracketRight", width: "1u" },
				{ id: "Enter", width: "2.25u", isFunctional: true }, // ISO enter (rectangular approximation)
			],
			// Row 3: Caps Lock + Home row + extra key
			[
				{ width: "1.75u", isEmpty: true }, // Caps Lock placeholder
				{ id: "KeyA", width: "1u" },
				{ id: "KeyS", width: "1u" },
				{ id: "KeyD", width: "1u" },
				{ id: "KeyF", width: "1u", classes: ["resting-position"] },
				{ id: "KeyG", width: "1u" },
				{ id: "KeyH", width: "1u" },
				{ id: "KeyJ", width: "1u", classes: ["resting-position"] },
				{ id: "KeyK", width: "1u" },
				{ id: "KeyL", width: "1u" },
				{ id: "Semicolon", width: "1u" },
				{ id: "Quote", width: "1u" },
				{ id: "IntlBackslash", width: "1u" }, // ISO extra key
				{ width: "1.25u", isEmpty: true }, // Extra space
			],
			// Row 4: Shift + Bottom row + Shift
			[
				{ id: "ShiftLeft", width: "2.25u", isFunctional: true },
				{ id: "KeyZ", width: "1u" },
				{ id: "KeyX", width: "1u" },
				{ id: "KeyC", width: "1u" },
				{ id: "KeyV", width: "1u" },
				{ id: "KeyB", width: "1u" },
				{ id: "KeyN", width: "1u" },
				{ id: "KeyM", width: "1u" },
				{ id: "Comma", width: "1u" },
				{ id: "Period", width: "1u" },
				{ id: "Slash", width: "1u" },
				{ id: "ShiftRight", width: "2.75u", isFunctional: true },
			],
			// Row 5: Modifier row
			[
				{ width: "1.25u", isEmpty: true }, // Ctrl
				{ width: "1.25u", isEmpty: true }, // Win/Cmd
				{ width: "1.25u", isEmpty: true }, // Alt
				{ id: "Space", width: "6.25u", isFunctional: true },
				{ width: "1.25u", isEmpty: true }, // AltGr
				{ width: "1.25u", isEmpty: true }, // Win/Cmd
				{ width: "1.25u", isEmpty: true }, // Menu
				{ width: "1.25u", isEmpty: true }, // Ctrl
			],
		],
	},
	ortho: {
		shape: "ortho",
		gridColumns: 74,
		gridRows: 5,
		rows: [
			// Row 1: Number row + Backspace (ortho layout - 12 keys)
			[
				{ id: "KeyQ", width: "1u" },
				{ id: "KeyW", width: "1u" },
				{ id: "KeyE", width: "1u" },
				{ id: "KeyR", width: "1u" },
				{ id: "KeyT", width: "1u" },
				{ id: "KeyY", width: "1u" },
				{ id: "KeyU", width: "1u" },
				{ id: "KeyI", width: "1u" },
				{ id: "KeyO", width: "1u" },
				{ id: "KeyP", width: "1u" },
				{ id: "BracketLeft", width: "1u" },
				{ id: "BracketRight", width: "1u" },
				{ id: "Backslash", width: "1u" },
			],
			// Row 2: Home row (ortho layout - 11 keys)
			[
				{ id: "KeyA", width: "1u" },
				{ id: "KeyS", width: "1u" },
				{ id: "KeyD", width: "1u" },
				{ id: "KeyF", width: "1u", classes: ["resting-position"] },
				{ id: "KeyG", width: "1u" },
				{ id: "KeyH", width: "1u" },
				{ id: "KeyJ", width: "1u", classes: ["resting-position"] },
				{ id: "KeyK", width: "1u" },
				{ id: "KeyL", width: "1u" },
				{ id: "Semicolon", width: "1u" },
				{ id: "Quote", width: "1u" },
				{ id: "Enter", width: "2u", isFunctional: true },
			],
			// Row 3: Bottom row (ortho layout - 11 keys)
			[
				{ id: "KeyZ", width: "1u" },
				{ id: "KeyX", width: "1u" },
				{ id: "KeyC", width: "1u" },
				{ id: "KeyV", width: "1u" },
				{ id: "KeyB", width: "1u" },
				{ id: "KeyN", width: "1u" },
				{ id: "KeyM", width: "1u" },
				{ id: "Comma", width: "1u" },
				{ id: "Period", width: "1u" },
				{ id: "Slash", width: "1u" },
				{ id: "ShiftLeft", width: "2u", isFunctional: true },
				{ id: "ShiftRight", width: "2u", isFunctional: true },
			],
			// Row 4: Modifier row (ortho layout - 13 keys)
			[
				{ width: "1.25u", isEmpty: true }, // Ctrl
				{ width: "1.25u", isEmpty: true }, // Win/Cmd
				{ width: "1.25u", isEmpty: true }, // Alt
				{ id: "Space", width: "6.25u", isFunctional: true },
				{ width: "1.25u", isEmpty: true }, // Alt
				{ width: "1.25u", isEmpty: true }, // Win/Cmd
				{ width: "1.25u", isEmpty: true }, // Menu
				{ width: "1.25u", isEmpty: true }, // Ctrl
			],
		],
	},
};

export function getKeyboardTemplate(shape: string): KeyboardTemplate {
	return (KEYBOARD_TEMPLATES[shape] ??
		KEYBOARD_TEMPLATES.ansi) as KeyboardTemplate;
}

export function getKeySpanClass(width: KeyWidth): string {
	const spanMap: Record<KeyWidth, number> = {
		"1u": 4,
		"1.25u": 5,
		"1.5u": 6,
		"1.75u": 7,
		"2u": 8,
		"2.25u": 9,
		"2.75u": 11,
		"6.25u": 25,
	};
	return `key--span-${spanMap[width]}`;
}
