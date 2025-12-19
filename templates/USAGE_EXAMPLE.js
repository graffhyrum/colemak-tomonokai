/**
 * Example: How to use HTML templates
 *
 * This demonstrates how to load and use templates in your components
 */

// Example 1: Load a single template
async function initPreferenceMenu() {
	const template = await TemplateService.loadTemplate("preference-menu");
	document.body.appendChild(template);

	// Now attach event listeners
	const menu = document.querySelector(".preferenceMenu");
	const openBtn = document.querySelector(".preferenceButton");

	openBtn.addEventListener("click", () => {
		menu.style.display = "block";
		menu.setAttribute("aria-hidden", "false");
	});
}

// Example 2: Load multiple templates at once
async function initAllComponents() {
	const templates = await TemplateService.loadTemplates([
		"layout-selectors",
		"preference-menu",
		"level-selector",
		"typing-area",
		"cheatsheet",
		"mapping-toggle",
	]);

	// Insert templates into appropriate containers
	const main = document.getElementById("main");
	main.appendChild(templates.get("typing-area"));
	main.appendChild(templates.get("cheatsheet"));

	document.body.appendChild(templates.get("layout-selectors"));
	document.body.appendChild(templates.get("preference-menu"));
	document.body.appendChild(templates.get("level-selector"));
	document.body.appendChild(templates.get("mapping-toggle"));
}

// Example 3: Use renderTemplate helper
async function initTypingArea() {
	await TemplateService.renderTemplate("typing-area", "#main");

	// Now initialize the typing area component
	const input = document.getElementById("userInput");
	const prompt = document.querySelector(".prompt");
	// ... rest of initialization
}

// Example 4: Use template fragments for dynamic content
function createPromptWord(word, wordIndex) {
	const wordTemplate = TemplateService.getTemplateFragment("wordTemplate");
	const wordEl = wordTemplate.querySelector(".word");
	wordEl.setAttribute("data-word-index", wordIndex);

	// Create letters
	const letters = word.split("");
	letters.forEach((letter, letterIndex) => {
		const letterTemplate =
			TemplateService.getTemplateFragment("letterTemplate");
		const letterEl = letterTemplate.querySelector(".letter");
		letterEl.textContent = letter;
		letterEl.setAttribute("data-letter-index", letterIndex);
		wordEl.appendChild(letterEl);
	});

	return wordEl;
}

// Example 5: Initialize app with templates
async function initApp() {
	try {
		// Load all templates
		await initAllComponents();

		// Initialize each component
		await initPreferenceMenu();
		await initTypingArea();

		console.log("App initialized with templates");
	} catch (error) {
		console.error("Failed to initialize app:", error);
	}
}

// Example 6: Replace existing HTML with templates
async function migrateToTemplates() {
	// Remove old hardcoded HTML
	const oldSelectors = document.getElementById("selectors");
	if (oldSelectors) oldSelectors.remove();

	// Load and insert template
	await TemplateService.renderTemplate(
		"layout-selectors",
		"body",
		"afterbegin",
	);

	// Templates are now in place, initialize components as normal
}
