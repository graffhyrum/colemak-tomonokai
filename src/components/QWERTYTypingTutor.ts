import { LAYOUT_DICTIONARIES, LAYOUT_MAPS } from "../config/layouts";
import { TypingTutorFactory } from "./TypingTutorFactory";

const QWERTY_WORDS: readonly string[] = [
	"as",
	"df",
	"jk",
	"kl",
	"sa",
	"fd",
	"jl",
	"lk",
];

const QWERTY_KEYBOARD_LAYOUT = [
	["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
	["a", "s", "d", "f", "g", "h", "j", "k", "l"],
	["z", "x", "c", "v", "b", "n", "m"],
] as const;

function createQWERTYTypingTutor() {
	return TypingTutorFactory.create({
		layoutName: "qwerty",
		keyboardMap: LAYOUT_MAPS.qwerty,
		levelDictionary: LAYOUT_DICTIONARIES,
		words: QWERTY_WORDS,
		keyboardLayout: QWERTY_KEYBOARD_LAYOUT,
		className: "qwerty-typing-tutor",
	});
}

export const QWERTYTypingTutor = { create: createQWERTYTypingTutor };
