import type { Page } from "@playwright/test";
import { assertDefined } from "../../util/AssertDefined.ts";
import type {
	ComponentFactory,
	ComponentObject,
	LocatorConfigMap,
} from "../types";

function createScoreComponentObject(page: Page) {
	const locators = {
		scoreText: page.locator("#scoreText"),
	} as const satisfies LocatorConfigMap;

	const getBothScores = async () => {
		const scoreText = await locators.scoreText.textContent();
		assertDefined(scoreText);
		const [currentScore, targetScore] = scoreText.split("/").map(Number);
		assertDefined(currentScore);
		assertDefined(targetScore);
		return { currentScore, targetScore };
	};

	return {
		page,
		actions: {
			getBothScores,
			getCurrentScore: async () => {
				const { currentScore } = await getBothScores();
				return currentScore;
			},
			getTargetScore: async () => {
				const { targetScore } = await getBothScores();
				return targetScore;
			},
		},
		assertions: {},
	} as const satisfies ComponentObject;
}

export const createScoreComponent =
	createScoreComponentObject satisfies ComponentFactory;
