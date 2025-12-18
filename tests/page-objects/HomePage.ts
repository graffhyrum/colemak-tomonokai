import { expect, type Page } from "@playwright/test";
import { createKeyboardSelector } from "./components/KeyboardSelector";
import { createLayoutSelector } from "./components/LayoutSelector";
import { createLevelSelector } from "./components/LevelSelector";
import { createPreferencesModal } from "./components/PreferencesModal";
import { createScoreComponent } from "./components/ScoreComponent";
import { createTestResults } from "./components/TestResults";
import { createTypingArea } from "./components/TypingArea";
import { createUIElements } from "./components/UIElements";
import type { PageObject, PomFactory } from "./types";

function createHomePagePOM(page: Page) {
	// Create component instances
	const typingArea = createTypingArea(page);
	const scoreComponent = createScoreComponent(page);
	const testResults = createTestResults(page);
	const preferencesModal = createPreferencesModal(page);
	const layoutSelector = createLayoutSelector(page);
	const keyboardSelector = createKeyboardSelector(page);
	const levelSelector = createLevelSelector(page);
	const uiElements = createUIElements(page);

	return {
		page,
		goto: async (url?: string) => {
			await page.goto(
				url ||
					"file:///C:/Users/graff/WebstormProjects/colemak-tomonokai/index.html",
			);
		},
		actions: {
			typingArea: {
				focus: () => typingArea.actions.focus(),
				typeWord: (word: string) => typingArea.actions.typeWord(word),
				typeIncorrectLetter: (letter: string) =>
					typingArea.actions.typeIncorrectLetter(letter),
				completeAllWords: (targetScore: number) =>
					typingArea.actions.completeAllWords(targetScore),
				getWord: (id: number) => typingArea.actions.getWord(id),
				pressSpace: () => typingArea.actions.pressSpace(),
				getInputValue: () => typingArea.actions.getInputValue(),
				typeLetter: (letter: string) => typingArea.actions.typeLetter(letter),
				pressBackspace: () => typingArea.actions.pressBackspace(),
			},

			score: {
				getCurrentScore: () => scoreComponent.actions.getCurrentScore(),
				getTargetScore: () => scoreComponent.actions.getTargetScore(),
			},

			preferences: {
				open: () => preferencesModal.actions.open(),
				close: () => preferencesModal.actions.close(),
				setWordLimit: (wordLimit: number) =>
					preferencesModal.actions.setWordLimit(wordLimit),
				toggleWordScrollingMode: () =>
					preferencesModal.actions.toggleWordScrollingMode(),
				toggleFullSentenceMode: () =>
					preferencesModal.actions.toggleFullSentenceMode(),
			},

			testResults: {
				getAllResults: () => testResults.actions.getAllResults(),
				getFinalAccuracyText: () => testResults.actions.getFinalAccuracyText(),
				getFinalWpmText: () => testResults.actions.getFinalWpmText(),
			},

			layout: {
				select: (layoutName: Parameters<typeof layoutSelector.actions.select>[0]) =>
					layoutSelector.actions.select(layoutName),
				getCurrentName: () => layoutSelector.actions.getCurrentName(),
			},

			keyboard: {
				select: (keyboardType: string) =>
					keyboardSelector.actions.select(keyboardType),
			},

			levels: {
				select: (levelNumber: number) =>
					levelSelector.actions.select(levelNumber),
				selectAllWords: () => levelSelector.actions.selectAllWords(),
				selectFullSentences: () => levelSelector.actions.selectFullSentences(),
			},

			reset: {
				click: () => page.locator("#resetButton").click(),
			},
		},

		assertions: {
			hasTitle: async () => {
				await expect(page).toHaveTitle(/Colemak/);
			},

			layout: {
				hasName: (expectedName: Parameters<typeof layoutSelector.assertions.hasName>[0]) =>
					layoutSelector.assertions.hasName(expectedName),
			},

			keyboard: {
				isVisible: () => keyboardSelector.assertions.isVisible(),
			},

			levels: {
				hasCurrentLevel: (expectedLevel: string) =>
					levelSelector.assertions.hasCurrentLevel(expectedLevel),
				isNotHighlighted: (levelNumber: number) =>
					levelSelector.assertions.isNotHighlighted(levelNumber),
			},

			ui: {
				promptText: () => uiElements.assertions.promptText(),
				scoreText: async (expectedText: string) => {
					await uiElements.assertions.scoreText(expectedText);
				},
				timerText: async (expectedText: string) => {
					await uiElements.assertions.timerText(expectedText);
				},
				inputValue: async (expectedValue: string) => {
					await uiElements.assertions.inputValue(expectedValue);
				},
				mappingToggleText: async (expectedText: string) => {
					await uiElements.assertions.mappingToggleText(expectedText);
				},
				cheatsheetVisible: async () => {
					await uiElements.assertions.cheatsheetVisible();
				},
				cheatsheetHidden: async () => {
					await uiElements.assertions.cheatsheetHidden();
				},
				preferencesMenuVisible: async () => {
					await uiElements.assertions.preferencesMenuVisible();
				},
				preferencesMenuHidden: async () => {
					await uiElements.assertions.preferencesMenuHidden();
				},
			},

			typingArea: {
				mistakeIndicators: (wordIndex: number) =>
					typingArea.assertions.mistakeIndicators(wordIndex),
				inputNotClearedOnMistake: () =>
					typingArea.assertions.inputNotClearedOnMistake(),
				wordCompletion: (wordIndex: number, currentWord: string) =>
					typingArea.assertions.wordCompletion(wordIndex, currentWord),
				wordHidden: (wordIndex: number) =>
					typingArea.assertions.wordHidden(wordIndex),
				nextWordFullyVisible: (wordIndex: number) =>
					typingArea.assertions.nextWordFullyVisible(wordIndex),
				letterColor: (
					wordIndex: number,
					letterIndex: number,
					expectedColor: string,
				) =>
					typingArea.assertions.letterColor(
						wordIndex,
						letterIndex,
						expectedColor,
					),
				inputFieldColor: (expectedColor: string) =>
					typingArea.assertions.inputFieldColor(expectedColor),
			},

			testResults: {
				isVisible: () => testResults.assertions.isVisible(),
				perfectGameResults: (
					finalScore: number,
					finalAccuracyText: string | null,
					finalWpmText: string | null,
				) =>
					testResults.assertions.perfectGameResults(
						finalScore,
						finalAccuracyText,
						finalWpmText,
					),
				validateFinalGameState: async () => {
					const finalScore = await scoreComponent.actions.getCurrentScore();
					await testResults.assertions.validateFinalGameState(finalScore);
				},
			},
		},
	} as const satisfies PageObject;
}

export const createHomePage = createHomePagePOM satisfies PomFactory;
export type HomePagePOM = ReturnType<typeof createHomePage>;
