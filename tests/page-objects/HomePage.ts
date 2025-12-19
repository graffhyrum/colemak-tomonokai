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
				focus: async () => await typingArea.actions.focus(),
				typeWord: async (word: string) =>
					await typingArea.actions.typeWord(word),
				typeIncorrectLetter: async (letter: string) =>
					await typingArea.actions.typeIncorrectLetter(letter),
				completeAllWords: async (targetScore: number) =>
					await typingArea.actions.completeAllWords(targetScore),
				getWord: async (id: number) => await typingArea.actions.getWord(id),
				pressSpace: async () => await typingArea.actions.pressSpace(),
				getInputValue: async () => await typingArea.actions.getInputValue(),
				typeLetter: async (letter: string) =>
					await typingArea.actions.typeLetter(letter),
				pressBackspace: async () => await typingArea.actions.pressBackspace(),
			},

			score: {
				getCurrentScore: async () =>
					await scoreComponent.actions.getCurrentScore(),
				getTargetScore: async () =>
					await scoreComponent.actions.getTargetScore(),
			},

			preferences: {
				open: async () => await preferencesModal.actions.open(),
				close: async () => await preferencesModal.actions.close(),
				setWordLimit: async (wordLimit: number) =>
					await preferencesModal.actions.setWordLimit(wordLimit),
				setWordScrollingMode: async (mode: "enable" | "disable") =>
					await preferencesModal.actions.setWordScrollingMode(mode),
				toggleFullSentenceMode: async () =>
					await preferencesModal.actions.toggleFullSentenceMode(),
			},

			testResults: {
				getAllResults: async () => await testResults.actions.getAllResults(),
				getFinalAccuracyText: async () =>
					await testResults.actions.getFinalAccuracyText(),
				getFinalWpmText: async () =>
					await testResults.actions.getFinalWpmText(),
			},

			layout: {
				select: async (
					layoutName: Parameters<typeof layoutSelector.actions.select>[0],
				) => await layoutSelector.actions.select(layoutName),
				getCurrentName: async () =>
					await layoutSelector.actions.getCurrentName(),
			},

			keyboard: {
				select: async (keyboardType: string) =>
					await keyboardSelector.actions.select(keyboardType),
			},

			levels: {
				select: async (levelNumber: number) =>
					await levelSelector.actions.select(levelNumber),
				selectAllWords: async () =>
					await levelSelector.actions.selectAllWords(),
				selectFullSentences: async () =>
					await levelSelector.actions.selectFullSentences(),
			},

			reset: {
				click: async () => await page.locator("#resetButton").click(),
			},

			ui: {
				getTimerText: async () => await uiElements.actions.getTimerText(),
			},
		},

		assertions: {
			hasTitle: async () => {
				await expect(page).toHaveTitle(/Colemak/);
			},

			layout: {
				hasName: async (
					expectedName: Parameters<typeof layoutSelector.assertions.hasName>[0],
				) => await layoutSelector.assertions.hasName(expectedName),
			},

			keyboard: {
				isVisible: async () => await keyboardSelector.assertions.isVisible(),
			},

			levels: {
				hasCurrentLevel: async (expectedLevel: string) =>
					await levelSelector.assertions.hasCurrentLevel(expectedLevel),
				isNotHighlighted: async (levelNumber: number) =>
					await levelSelector.assertions.isNotHighlighted(levelNumber),
			},

			ui: {
				promptText: async () => await uiElements.assertions.promptText(),
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
				mistakeIndicators: async (wordIndex: number) =>
					await typingArea.assertions.mistakeIndicators(wordIndex),
				inputNotClearedOnMistake: async () =>
					await typingArea.assertions.inputNotClearedOnMistake(),
				wordCompletion: async (wordIndex: number, currentWord: string) =>
					await typingArea.assertions.wordCompletion(wordIndex, currentWord),
				wordHidden: async (wordIndex: number) =>
					await typingArea.assertions.wordHidden(wordIndex),
				nextWordFullyVisible: async (wordIndex: number) =>
					await typingArea.assertions.nextWordFullyVisible(wordIndex),
				letterColor: async (
					wordIndex: number,
					letterIndex: number,
					expectedColor: string,
				) =>
					await typingArea.assertions.letterColor(
						wordIndex,
						letterIndex,
						expectedColor,
					),
				inputFieldColor: async (expectedColor: string) =>
					await typingArea.assertions.inputFieldColor(expectedColor),
			},

			testResults: {
				isVisible: async () => await testResults.assertions.isVisible(),
				perfectGameResults: async (
					finalScore: number,
					finalAccuracyText: string | null,
					finalWpmText: string | null,
				) =>
					await testResults.assertions.perfectGameResults(
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
