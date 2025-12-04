import { step, test } from "./fixture";

test.describe("Essential User Flows", () => {
	test.beforeEach(async ({ homePage }) => {
		await homePage.goto();
		await homePage.assertions.isLoaded();
	});

	test("complete typing practice flow", async ({ homePage }) => {
		await step("Verify initial state", async () => {
			await homePage.assertions.isLoaded();
			await homePage.assertions.hasCurrentLevel(1);
		});

		await step("Progress through levels", async () => {
			await homePage.actions.navigateThroughLevels([2, 3]);
		});
	});

	test("layout and shape switching", async ({ homePage, layout }) => {
		await step("Switch layouts", async () => {
			await homePage.actions.selectLayout(layout);
			await homePage.assertions.hasCorrectLayout(layout);
		});

		await step("Switch keyboard shapes", async () => {
			const shapes = ["ansi", "iso", "ortho"] as const;
			for (const shape of shapes) {
				await homePage.actions.selectKeyboardShape(shape);
				await homePage.assertions.hasCorrectShape(shape);
			}
		});
	});

	test("navigation functionality", async ({ homePage }) => {
		await step(
			"Verify navigation is visible and has correct level count",
			async () => {
				await homePage.assertions.hasNavigationWithLevelCount(7);
			},
		);

		await step("Navigate through all levels", async () => {
			await homePage.actions.navigateThroughLevels([1, 2, 3, 4, 5, 6, 7]);
		});
	});

	test("keyboard display functionality", async ({ homePage }) => {
		await step("Verify keyboard is visible", async () => {
			await homePage.assertions.isLoaded(); // includes keyboard display visibility
		});

		await step("Check highlighted keys for current level", async () => {
			await homePage.assertions.hasHighlightedKeys();
		});
	});

	test("page load and basic functionality", async ({ homePage }) => {
		await step("Verify page loads completely", async () => {
			await homePage.assertions.isLoaded();
		});

		await step("Verify default selections", async () => {
			await homePage.assertions.hasCorrectLayout("colemak");
			await homePage.assertions.hasCorrectShape("ansi");
		});
	});
});
