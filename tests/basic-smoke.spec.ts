import { step, test } from "./fixture";

test.describe("Basic Smoke Tests", () => {
	test.beforeEach(async ({ homePage }) => {
		await homePage.goto();
		await homePage.assertions.isLoaded();
	});

	test("page loads and has basic elements", async ({ homePage }) => {
		await step("Verify page loads completely", async () => {
			await homePage.assertions.isLoaded();
		});

		await step("Verify default selections", async () => {
			await homePage.assertions.hasCorrectLayout("colemak");
			await homePage.assertions.hasCorrectShape("ansi");
		});
	});

	test("layout selection works", async ({ homePage }) => {
		await step("Switch to qwerty layout", async () => {
			await homePage.actions.selectLayout("qwerty");
			await homePage.assertions.hasCorrectLayout("qwerty");
		});

		await step("Switch back to colemak", async () => {
			await homePage.actions.selectLayout("colemak");
			await homePage.assertions.hasCorrectLayout("colemak");
		});
	});

	test("keyboard shape selection works", async ({ homePage }) => {
		await step("Switch to iso shape", async () => {
			await homePage.actions.selectKeyboardShape("iso");
			await homePage.assertions.hasCorrectShape("iso");
		});

		await step("Switch to ortho shape", async () => {
			await homePage.actions.selectKeyboardShape("ortho");
			await homePage.assertions.hasCorrectShape("ortho");
		});

		await step("Switch back to ansi", async () => {
			await homePage.actions.selectKeyboardShape("ansi");
			await homePage.assertions.hasCorrectShape("ansi");
		});
	});

	test("navigation works", async ({ homePage }) => {
		await step("Navigate to level 2", async () => {
			await homePage.actions.selectLevel(2);
			await homePage.assertions.hasCurrentLevel(2);
		});

		await step("Navigate to level 3", async () => {
			await homePage.actions.selectLevel(3);
			await homePage.assertions.hasCurrentLevel(3);
		});

		await step("Navigate to All Words", async () => {
			await homePage.actions.selectLevel(7);
			await homePage.assertions.hasCurrentLevel(7);
		});
	});
});
