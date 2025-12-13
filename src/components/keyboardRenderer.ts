import type { KeyboardTemplate } from "../entities/keyTemplates.ts";
import type { LayoutMap, LayoutName } from "../entities/layouts.ts";
import type { LevelDictionary } from "../entities/levels.ts";
import type { GameState } from "../types";

interface KeyHighlighting {
	isActive: boolean;
	isHomeRow: boolean;
	isInactive: boolean;
}

interface KeyboardConfig {
	layoutName: LayoutName;
	levelDictionary: LevelDictionary;
	keyboardCharacters: Array<
		Array<{ keyId: string; character: string; isEmpty: boolean }>
	>;
	layoutMap: LayoutMap;
}

function getEnabledLetters(
	currentLevel: number,
	config: KeyboardConfig,
): string {
	const layoutDict = config.levelDictionary[config.layoutName];
	if (!layoutDict) return "";

	let enabledLetters = "";
	for (let level = 1; level <= currentLevel; level++) {
		const levelKey = `lvl${level}` as keyof typeof layoutDict;
		enabledLetters += layoutDict[levelKey] || "";
	}
	return enabledLetters;
}

function getKeyHighlighting(
	character: string,
	currentLevel: number,
	config: KeyboardConfig,
): KeyHighlighting {
	if (!character || character.trim() === "") {
		return { isActive: false, isHomeRow: false, isInactive: false };
	}

	const enabledLetters = getEnabledLetters(currentLevel, config);
	const level1Letters = config.levelDictionary[config.layoutName]?.lvl1 || "";

	// Level 7 special case: all keys active
	if (currentLevel === 7) {
		return {
			isActive: true,
			isHomeRow: level1Letters.includes(character),
			isInactive: false,
		};
	}

	const isInEnabled = enabledLetters.includes(character);
	const isInCurrentLevel = (
		(config.levelDictionary[config.layoutName]?.[
			`lvl${currentLevel}` as keyof (typeof config.levelDictionary)[typeof config.layoutName]
		]) || ""
	).includes(character);
	const isHomeRow = level1Letters.includes(character);

	return {
		isActive: isInCurrentLevel,
		isHomeRow,
		isInactive: isInEnabled && !isInCurrentLevel,
	};
}

function getCharacterForKey(
	keyId: string,
	gameState: GameState,
	config: KeyboardConfig,
): string {
	// Find the key in the keyboard characters array
	for (const row of config.keyboardCharacters) {
		for (const keyInfo of row) {
			if (keyInfo.keyId === keyId) {
				// Apply shift if needed
				if (
					gameState.shiftDown &&
					config.layoutMap.shiftLayer &&
					typeof config.layoutMap.shiftLayer === "object"
				) {
					const shifted = (
						config.layoutMap.shiftLayer as Record<string, string>
					)[keyId];
					if (shifted) return shifted;
				}
				return keyInfo.character;
			}
		}
	}
	return "";
}

function generateKeyboardHTML(
	template: KeyboardTemplate,
	gameState: GameState,
	config: KeyboardConfig,
): string {
	let keyboardHTML = "";

	template.rows.forEach((row) => {
		keyboardHTML += '<div class="row">';
		row.forEach((keyTemplate) => {
			let classes = "key";
			let widthClass = "";

			// Add width classes based on template
			switch (keyTemplate.width) {
				case "1u":
					widthClass = "";
					break;
				case "1.25u":
					widthClass = " onepointtwofiveu";
					break;
				case "1.5u":
					widthClass = " onepointfiveu";
					break;
				case "1.75u":
					widthClass = " onepointsevenfiveu";
					break;
				case "2u":
					widthClass = " twou";
					break;
				case "2.25u":
					widthClass = " twopointtwofiveu";
					break;
				case "2.75u":
					widthClass = " twopointsevenfiveu";
					break;
				case "6.25u":
					widthClass = " sixpointtwofiveu";
					break;
			}

			// Add custom classes
			if (keyTemplate.classes) {
				classes += ` ${keyTemplate.classes.join(" ")}`;
			}

			// Add functional class for modifier keys
			if (keyTemplate.isFunctional) {
				classes += " cKey";
			}

			// Add empty class for placeholders
			if (keyTemplate.isEmpty) {
				classes += " empty";
			}

			// Get character for highlighting
			let character = "";
			if (keyTemplate.id) {
				character = getCharacterForKey(keyTemplate.id, gameState, config);
			}

			// Apply level highlighting for non-empty keys
			if (!keyTemplate.isEmpty && character) {
				const highlighting = getKeyHighlighting(
					character,
					gameState.currentLevel,
					config,
				);
				if (highlighting.isActive) classes += " currentLevelKeys";
				else if (highlighting.isInactive) classes += " inactive";
				if (highlighting.isHomeRow) classes += " homeRow";
			}

			// Add modifier key highlighting
			if (keyTemplate.id === "ShiftLeft" || keyTemplate.id === "ShiftRight") {
				if (gameState.shiftDown) classes += " active indicator-active";
			}
			if (keyTemplate.id === "CapsLock") {
				if (gameState.capsLockOn) classes += " indicator-active";
			}

			// Add data attributes
			const dataId = keyTemplate.id ? `id='${keyTemplate.id}'` : "";
			const displayChar = keyTemplate.isEmpty
				? ""
				: `<span class="letter">${character}</span>`;

			keyboardHTML += `<div class="${classes}${widthClass}" ${dataId}>${displayChar}</div>`;
		});
		keyboardHTML += "</div>";
	});

	return keyboardHTML;
}

export const keyboardRenderer = {
	getEnabledLetters,
	getKeyHighlighting,
	getCharacterForKey,
	generateKeyboardHTML,
};

export type { KeyHighlighting, KeyboardConfig };
