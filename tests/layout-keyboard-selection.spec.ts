import { KEYBOARD_SHAPES } from "../src/entities/shapes";
import { step, test } from "./fixture";

test.beforeEach(async ({ homePage }) => {
	await homePage.goto();
	await homePage.assertions.isLoaded();
});

test("layout and keyboard selection functionality", async ({
	homePage,
	layout,
}) => {
	await step("selects are populated correctly", async () => {
		await homePage.assertions.isLoaded(); // includes select component validation
	});

	await step("keyboard shape changes work", async () => {
		for (const shape of KEYBOARD_SHAPES) {
			await step(`shape ${shape}`, async () => {
				await homePage.actions.selectKeyboardShape(shape);
				await homePage.assertions.hasCorrectShape(shape);
				await homePage.assertions.isLoaded();
			});
		}
	});

	await step("layout displays correct level 1 highlighting", async () => {
		await homePage.actions.selectLayout(layout);
		await homePage.assertions.hasCorrectLayout(layout);

		await homePage.assertions.hasLevelHighlighting(layout, 1);
		await homePage.assertions.isLoaded();
	});

	await step("layout with shape combinations work", async () => {
		await homePage.actions.selectLayout(layout);
		await homePage.assertions.hasCorrectLayout(layout);

		for (const shape of KEYBOARD_SHAPES) {
			await step(`layout ${layout} with shape ${shape}`, async () => {
				await homePage.actions.selectKeyboardShape(shape);
				await homePage.assertions.hasCorrectShape(shape);
			});
		}

		await homePage.assertions.hasLevelHighlighting(layout, 1);
		await homePage.assertions.isLoaded();
	});
});
