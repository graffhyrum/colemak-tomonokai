/**
 * Template Service - Load and manage HTML templates
 * Separates HTML structure from JavaScript interactivity
 * Uses revealing module pattern
 */

const TemplateService = (function() {
	// Cache for loaded templates
	const templateCache = new Map();

	/**
	 * Load a template from the templates directory
	 * @param {string} templateName - Name of template file (without .html extension)
	 * @returns {Promise<Element>} Parsed HTML element
	 */
	async function loadTemplate(templateName) {
		// Check cache first
		if (templateCache.has(templateName)) {
			return templateCache.get(templateName).cloneNode(true);
		}

		try {
			const response = await fetch(`templates/${templateName}.html`);
			if (!response.ok) {
				throw new Error(`Failed to load template: ${templateName} (${response.status})`);
			}

			const html = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			// Get the first element (templates should have a single root)
			const template = doc.body.firstElementChild;

			if (!template) {
				throw new Error(`Template ${templateName} is empty or invalid`);
			}

			// Cache the original template
			templateCache.set(templateName, template);

			// Return a clone
			return template.cloneNode(true);
		} catch (error) {
			console.error(`Error loading template ${templateName}:`, error);
			throw error;
		}
	}

	/**
	 * Load multiple templates at once
	 * @param {string[]} templateNames - Array of template names
	 * @returns {Promise<Map<string, Element>>} Map of template names to elements
	 */
	async function loadTemplates(templateNames) {
		const templates = new Map();
		const promises = templateNames.map(async (name) => {
			const template = await loadTemplate(name);
			templates.set(name, template);
		});

		await Promise.all(promises);
		return templates;
	}

	/**
	 * Get a template fragment (for <template> elements)
	 * @param {string} templateId - ID of template element in DOM
	 * @returns {DocumentFragment} Cloned template content
	 */
	function getTemplateFragment(templateId) {
		const template = document.getElementById(templateId);
		if (!template || template.tagName !== 'TEMPLATE') {
			throw new Error(`Template element not found: ${templateId}`);
		}
		return template.content.cloneNode(true);
	}

	/**
	 * Render a template into a container
	 * @param {string} templateName - Name of template to load
	 * @param {Element|string} container - Container element or selector
	 * @param {string} position - Where to insert ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
	 * @returns {Promise<Element>} Rendered element
	 */
	async function renderTemplate(templateName, container, position = 'beforeend') {
		const template = await loadTemplate(templateName);
		const containerEl = typeof container === 'string'
			? document.querySelector(container)
			: container;

		if (!containerEl) {
			throw new Error(`Container not found: ${container}`);
		}

		containerEl.insertAdjacentElement(position, template);
		return template;
	}

	/**
	 * Clear template cache
	 */
	function clearCache() {
		templateCache.clear();
	}

	/**
	 * Get cached template count
	 * @returns {number} Number of cached templates
	 */
	function getCacheSize() {
		return templateCache.size;
	}

	// Public API
	return {
		loadTemplate,
		loadTemplates,
		getTemplateFragment,
		renderTemplate,
		clearCache,
		getCacheSize
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = TemplateService;
} else if (typeof window !== 'undefined') {
	window.TemplateService = TemplateService;
}

