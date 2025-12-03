// Main entry point for Colemak Typing Tutor

import { TypingTutorFactory } from "./components/TypingTutorFactory";
import {
	LAYOUT_DICTIONARIES,
	LAYOUT_MAPS,
	type LayoutName,
} from "./config/layouts";
import { createLevelManager } from "./utils/levelManager";
import "./styles/main.css";
import type { KeyboardShape } from "./types";

// Keyboard layouts for different physical formats
const KEYBOARD_SHAPES = {
	ansi: [
		["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
		["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
		["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
	] as const,
	iso: [
		["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
		["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
		["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
	] as const,
	ortho: [
		["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
		["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
		["z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift"],
	] as const,
} as const;

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM loaded, initializing Colemak Typing Tutor");

	try {
		// Get initial layout and keyboard from selects
		const layoutSelect = document.querySelector(
			'select[name="layout"]',
		) as HTMLSelectElement;
		const keyboardSelect = document.querySelector(
			'select[name="keyboard"]',
		) as HTMLSelectElement;

		const initialLayout = (layoutSelect?.value as LayoutName) || "colemak";
		const initialKeyboardShape =
			(keyboardSelect?.value as KeyboardShape) || "ansi";

		// Create level manager for initial layout
		const levelManager = createLevelManager(initialLayout);

		// Create the main typing tutor component
		const typingTutorRef = {
			current: createTypingTutor(
				initialLayout,
				initialKeyboardShape,
				levelManager,
			),
		};
		console.log(`TypingTutor created for ${initialLayout} layout`);

		// Find the main container and append the component
		const mainContainer =
			(document.querySelector("#main") as HTMLElement) || document.body;
		const typingArea =
			(mainContainer.querySelector(".typingArea") as HTMLElement) ||
			mainContainer;

		console.log("Found containers:", {
			mainContainer: !!mainContainer,
			typingArea: !!typingArea,
		});

		// Clear existing content and add our new component
		typingArea.innerHTML = "";
		typingArea.appendChild(typingTutorRef.current.element);

		// Setup level selection
		setupLevelSelection(levelManager, typingTutorRef);

		// Setup layout and keyboard selection
		setupLayoutAndKeyboardSelection(levelManager, typingTutorRef, typingArea);

		console.log("Colemak Typing Tutor initialized successfully");
	} catch (error) {
		console.error("Error initializing Colemak Typing Tutor:", error);
	}
});

function createTypingTutor(
	layout: LayoutName,
	keyboardShape: KeyboardShape,
	levelManager: ReturnType<typeof createLevelManager>,
) {
	return TypingTutorFactory.create({
		layoutName: layout,
		layoutMap: LAYOUT_MAPS[layout],
		levelDictionary: LAYOUT_DICTIONARIES,
		words: [], // Will be handled by levelManager
		keyboardLayout: KEYBOARD_SHAPES[keyboardShape],
		levelManager,
		className: `${layout}-typing-tutor`,
	});
}

function setupLayoutAndKeyboardSelection(
	levelManager: ReturnType<typeof createLevelManager>,
	typingTutorRef: { current: ReturnType<typeof TypingTutorFactory.create> },
	typingArea: HTMLElement,
) {
	const layoutSelect = document.querySelector(
		'select[name="layout"]',
	) as HTMLSelectElement;
	const keyboardSelect = document.querySelector(
		'select[name="keyboard"]',
	) as HTMLSelectElement;

	function handleLayoutChange() {
		const newLayout = layoutSelect.value as LayoutName;
		const newKeyboardShape = keyboardSelect.value as KeyboardShape;

		console.log(
			`Switching to layout: ${newLayout}, keyboard: ${newKeyboardShape}`,
		);

		// Create new level manager for the new layout
		const newLevelManager = createLevelManager(newLayout);

		// Create new typing tutor
		const newTypingTutor = createTypingTutor(
			newLayout,
			newKeyboardShape,
			newLevelManager,
		);

		// Replace the old tutor
		typingArea.innerHTML = "";
		typingArea.appendChild(newTypingTutor.element);

		// Update references
		Object.assign(levelManager, newLevelManager);
		typingTutorRef.current = newTypingTutor;

		// Re-setup level selection with new references
		setupLevelSelection(levelManager, typingTutorRef);

		// Update level button states
		updateLevelButtonStates(levelManager.getCurrentLevel());
	}

	layoutSelect.addEventListener("change", handleLayoutChange);
	keyboardSelect.addEventListener("change", handleLayoutChange);
}

function setupLevelSelection(
	levelManager: ReturnType<typeof createLevelManager>,
	typingTutorRef: { current: ReturnType<typeof TypingTutorFactory.create> },
) {
	const levelButtons = document.querySelectorAll('nav button[id^="lvl"]');

	levelButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const levelId = button.id;
			if (levelId?.startsWith("lvl")) {
				const levelNumber = parseInt(levelId.replace("lvl", ""), 10);
				if (levelManager.validateLevel(levelNumber)) {
					levelManager.setCurrentLevel(levelNumber);
					updateLevelButtonStates(levelNumber);
					typingTutorRef.current.updateLevel(levelNumber);
				}
			}
		});
	});

	// Set initial level button state
	updateLevelButtonStates(levelManager.getCurrentLevel());
}

function updateLevelButtonStates(currentLevel: number) {
	const levelButtons = document.querySelectorAll('nav button[id^="lvl"]');

	levelButtons.forEach((button) => {
		const levelId = button.id;
		if (levelId?.startsWith("lvl")) {
			const levelNumber = parseInt(levelId.replace("lvl", ""), 10);
			button.classList.toggle("currentLevel", levelNumber === currentLevel);
		}
	});
}
