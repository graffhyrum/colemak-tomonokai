import { LAYOUT_DICTIONARIES, LAYOUT_MAPS } from "../config/layouts";
import type { LevelManager } from "../utils/levelManager";
import { TypingTutorFactory } from "./TypingTutorFactory";

const QWERTY_KEYBOARD_LAYOUT = [
	["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
	["a", "s", "d", "f", "g", "h", "j", "k", "l"],
	["z", "x", "c", "v", "b", "n", "m"],
] as const;

function createQWERTYTypingTutor(levelManager: LevelManager) {
	const tutor = TypingTutorFactory.create({
		layoutName: "qwerty",
		keyboardMap: LAYOUT_MAPS.qwerty,
		levelDictionary: LAYOUT_DICTIONARIES,
		words: [], // Will be handled by levelManager
		keyboardLayout: QWERTY_KEYBOARD_LAYOUT,
		levelManager,
		className: "qwerty-typing-tutor",
	});

	return tutor;
}

export const QWERTYTypingTutor = { create: createQWERTYTypingTutor };
