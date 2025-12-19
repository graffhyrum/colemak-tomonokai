# HTML Templates

This directory contains HTML templates for all UI components, separated from JavaScript interactivity logic.

## Purpose

Separating HTML structure from JavaScript provides:
- **Better maintainability** - HTML changes don't require digging through JS
- **Easier testing** - Templates can be tested independently
- **Clearer architecture** - Visual structure is separate from behavior
- **Reusability** - Templates can be used in different contexts

## Template Files

### Core Components

- **`layout-selectors.html`** - Layout and keyboard type selectors
- **`preference-menu.html`** - Settings/preferences modal
- **`level-selector.html`** - Difficulty level navigation buttons
- **`custom-keyboard-editor.html`** - Custom keyboard layout editor UI
- **`typing-area.html`** - Main typing practice area (prompt, input, score, timer, results)
- **`cheatsheet.html`** - Keyboard layout visualization
- **`mapping-toggle.html`** - Keyboard mapping on/off toggle
- **`main-container.html`** - Main application container structure

### Dynamic Templates

- **`prompt-word.html`** - Template fragments for dynamically generated prompt words/letters

## Usage

### TemplateService

A utility service is provided at `logic/services/templateService.js` for loading templates:

```javascript
// Load a single template
const template = await TemplateService.loadTemplate('preference-menu');

// Load multiple templates at once
const templates = await TemplateService.loadTemplates([
	'layout-selectors',
	'preference-menu',
	'typing-area'
]);

// Render template directly into container
await TemplateService.renderTemplate('typing-area', '#main');

// Get template fragment (for <template> elements)
const fragment = TemplateService.getTemplateFragment('wordTemplate');
```

### Loading Templates

Templates can be loaded in several ways:

#### Option 1: TemplateService (Recommended)
```javascript
const template = await TemplateService.loadTemplate('preference-menu');
document.body.appendChild(template);
```

#### Option 2: Fetch API (Manual)
```javascript
async function loadTemplate(name) {
	const response = await fetch(`templates/${name}.html`);
	const html = await response.text();
	return new DOMParser().parseFromString(html, 'text/html').body.firstElementChild;
}
```

#### Option 3: Template Elements (For Static Templates)
```html
<template id="myTemplate">
	<!-- Template content -->
</template>
```

### Integration with JavaScript

1. **Load template** on component initialization
2. **Clone template** for dynamic content
3. **Populate data** into cloned elements
4. **Insert into DOM** at appropriate location
5. **Attach event listeners** to cloned elements

### Examples

See `templates/USAGE_EXAMPLE.js` for complete usage examples including:
- Loading single templates
- Loading multiple templates
- Using template fragments for dynamic content
- Migrating from hardcoded HTML to templates

## Template Structure

All templates follow these conventions:

1. **Semantic HTML** - Use appropriate elements (`<nav>`, `<section>`, etc.)
2. **ARIA attributes** - Include accessibility attributes
3. **Data attributes** - Use `data-*` for JavaScript hooks
4. **CSS classes** - Match existing CSS class names
5. **IDs** - Use IDs for unique elements that need direct access

## CSS Classes Reference

Templates use existing CSS classes from `main.css`:

- `.preferenceMenu` - Preference modal container
- `.typingArea` - Main typing area
- `.prompt` - Word prompt display
- `.cheatsheet` - Keyboard visualization
- `.currentLevel` - Active level button
- `.noDisplay` - Hidden elements
- `.transparent` - Transparent elements
- `.fade` - Fade effect container

## Migration Strategy

1. **Extract HTML** from `index.html` into template files
2. **Update JavaScript** to load templates dynamically
3. **Test each component** independently
4. **Update main HTML** to use template loader
5. **Remove hardcoded HTML** from `index.html`

## Benefits

- ✅ HTML structure is version-controlled separately
- ✅ Templates can be edited without touching JavaScript
- ✅ Easier to create variations/themes
- ✅ Better separation of concerns
- ✅ Templates can be reused in different contexts
- ✅ Easier to test HTML structure independently

