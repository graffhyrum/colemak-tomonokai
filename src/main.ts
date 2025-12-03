// Main entry point for Colemak Typing Tutor
import { QWERTYTypingTutor } from "./components/QWERTYTypingTutor";
import "./styles/main.css";

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM loaded, initializing Colemak Typing Tutor Phase 1");

	try {
		// Create the main typing tutor component
		const typingTutor = QWERTYTypingTutor.create();
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

		console.log("Colemak Typing Tutor Phase 1 initialized successfully");
	} catch (error) {
		console.error("Error initializing Colemak Typing Tutor:", error);
	}
});
