// Main entry point for Colemak Typing Tutor
import { QWERTYTypingTutor } from "./components/QWERTYTypingTutor";
import { createLevelManager } from "./utils/levelManager";
import "./styles/main.css";

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM loaded, initializing Colemak Typing Tutor Phase 1");

	try {
		// Create level manager for QWERTY layout
		const levelManager = createLevelManager("qwerty");

		// Create the main typing tutor component
		const typingTutor = QWERTYTypingTutor.create(levelManager);
		console.log("QWERTYTypingTutor component created");

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
		typingArea.appendChild(typingTutor.element);

		// Setup level selection
		setupLevelSelection(levelManager, typingTutor);

		console.log("Colemak Typing Tutor Phase 1 initialized successfully");
	} catch (error) {
		console.error("Error initializing Colemak Typing Tutor:", error);
	}
});

function setupLevelSelection(
	levelManager: ReturnType<typeof createLevelManager>,
	typingTutor: ReturnType<typeof QWERTYTypingTutor.create>,
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
					typingTutor.updateLevel(levelNumber);
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
