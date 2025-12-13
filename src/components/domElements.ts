import type { LayoutName } from "../entities/layouts";
import { DOMUtils } from "../utils/DOM";

interface DOMElements {
	container: HTMLElement;
	prompt: HTMLElement;
	input: HTMLInputElement;
	keyboard: HTMLElement;
	stats: HTMLElement;
}

interface ElementConfig {
	layoutName: LayoutName;
	className?: string;
}

function createDOMElements(config: ElementConfig): DOMElements {
	const container = document.createElement("div");
	container.className = config.className || "typing-tutor";

	const prompt = DOMUtils.createElement("div", {
		className: "prompt",
		textContent: "Type words below...",
	});

	const input = DOMUtils.createElement("input", {
		className: "user-input",
		attributes: {
			type: "text",
			id: "userInput",
			placeholder: "Start typing here...",
		},
	});

	const keyboard = DOMUtils.createElement("div", {
		className: "cheatsheet",
	});

	const stats = DOMUtils.createElement("div", {
		className: "stats",
	});

	// Create cheatsheet container like archive
	const cheatsheetContainer = DOMUtils.createElement("div", {
		className: "cheatsheetContainer",
	});
	cheatsheetContainer.appendChild(keyboard);

	container.appendChild(prompt);
	container.appendChild(input);
	container.appendChild(stats);
	container.appendChild(cheatsheetContainer);

	return {
		container,
		prompt,
		input,
		keyboard,
		stats,
	};
}

export const domElements = {
	createDOMElements,
};

export type { DOMElements, ElementConfig };
