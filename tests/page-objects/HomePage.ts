import { expect, type Page } from "@playwright/test";
import { createPreferencesModal } from "./components/PreferencesModal";
import { createScoreComponent } from "./components/ScoreComponent";
import { createTestResults } from "./components/TestResults";
import { createTypingArea } from "./components/TypingArea";
import type { PageObject, PomFactory } from "./types";

function createHomePagePOM(page: Page) {
	// Create component instances
	const typingArea = createTypingArea(page);
	const scoreComponent = createScoreComponent(page);
	const testResults = createTestResults(page);
	const preferencesModal = createPreferencesModal(page);

	return {
		page,
		goto: async () => {
			await page.goto(
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
			},

			testResults: {
				getAllResults: () => testResults.actions.getAllResults(),
				getFinalAccuracyText: () => testResults.actions.getFinalAccuracyText(),
				getFinalWpmText: () => testResults.actions.getFinalWpmText(),
			},
		},

		assertions: {
			hasTitle: async () => {
				await expect(page).toHaveTitle(/Colemak/);
			},

			typingArea: {
				mistakeIndicators: (wordIndex: number) =>
					typingArea.assertions.mistakeIndicators(wordIndex),
				inputNotClearedOnMistake: () =>
					typingArea.assertions.inputNotClearedOnMistake(),
				wordCompletion: (wordIndex: number, currentWord: string) =>
					typingArea.assertions.wordCompletion(wordIndex, currentWord),
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
