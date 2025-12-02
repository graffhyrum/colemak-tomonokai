import { expect } from "playwright/test";
import { test, step } from "./fixture.ts";

test.describe("Colemak Typing Tutor - Essential Actions", () => {
	test("user can select different keyboard layouts", async ({
		colemakPage,
	}) => {
		await step("Verify initial layout state", async () => {
			await colemakPage.assertions.layout.hasValue("colemak");
		});

		await step("Select ColemakDH layout", async () => {
			await colemakPage.actions.layout.selectOption("colemakdh");
			await colemakPage.assertions.layout.hasValue("colemakdh");
		});

		await step("Select QWERTY layout", async () => {
			await colemakPage.actions.layout.selectOption("qwerty");
			await colemakPage.assertions.layout.hasValue("qwerty");
		});

		await step("Select Dvorak layout", async () => {
			await colemakPage.actions.layout.selectOption("dvorak");
			await colemakPage.assertions.layout.hasValue("dvorak");
		});
	});

	test("user can select different keyboard formats", async ({
		colemakPage,
	}) => {
		await step("Verify initial keyboard format", async () => {
			await colemakPage.assertions.keyboard.hasValue("ansi");
		});

		await step("Select ISO format", async () => {
			await colemakPage.actions.keyboard.selectOption("iso");
			await colemakPage.assertions.keyboard.hasValue("iso");
		});

		await step("Select Ortho format", async () => {
			await colemakPage.actions.keyboard.selectOption("ortho");
			await colemakPage.assertions.keyboard.hasValue("ortho");
		});
	});

	test("user can type in the input field", async ({ colemakPage }) => {
		await step("Type text in input field", async () => {
			await colemakPage.actions.input.fill("test typing");
			await colemakPage.assertions.input.hasValue("test typing");
		});

		await step("Reset game and verify score", async () => {
			await colemakPage.actions.reset.tab();
			await colemakPage.assertions.display.score.containsText("0/50");
		});
	});

	test("user sees initial score and time", async ({ colemakPage }) => {
		await step("Verify initial score", async () => {
			await colemakPage.assertions.display.score.containsText("0/50");
		});

		await step("Verify initial time", async () => {
			await colemakPage.assertions.display.time.containsText("0m :0 s");
		});
	});

	test("user can adjust word limit input", async ({ colemakPage }) => {
		await step("Open settings menu", async () => {
			await colemakPage.actions.settings.open();
		});

		await step("Verify initial word limit state", async () => {
			await colemakPage.assertions.settings.wordLimit.isChecked();
		});

		await step("Change word limit to 30", async () => {
			await expect(async () => {
				await colemakPage.actions.settings.wordLimit.fill("30");
				await colemakPage.assertions.settings.wordLimit.hasValue("30");
			}).toPass({ timeout: 3000 });
		});

		await step("Change word limit to 100", async () => {
			await colemakPage.actions.settings.wordLimit.fill("100");
			await colemakPage.assertions.settings.wordLimit.hasValue("100");
		});

		await step("Test word limit toggle", async () => {
			await colemakPage.actions.settings.wordLimit.toggle();
		});
	});

	test("user can see time limit input exists", async ({ colemakPage }) => {
		await step("Open settings menu", async () => {
			await colemakPage.actions.settings.open();
		});

		await step(
			"Verify time limit input exists and has default value",
			async () => {
				await colemakPage.assertions.settings.timeLimit.isAttached();
				await colemakPage.assertions.settings.timeLimit.hasValue("60");
			},
		);

		await step("Verify time limit is initially unchecked", async () => {
			await colemakPage.assertions.settings.timeLimit.isNotChecked();
		});

		await step("Test time limit toggle", async () => {
			await colemakPage.actions.settings.timeLimit.toggle();
		});

		await step("Change time limit value to 120", async () => {
			await colemakPage.actions.settings.timeLimit.fill("120");
			await colemakPage.assertions.settings.timeLimit.hasValue("120");
		});
	});

	test("user can use keyboard shortcuts", async ({ colemakPage }) => {
		await step("Focus on input field", async () => {
			await colemakPage.actions.input.focus();
		});

		await step("Test Tab key reset", async () => {
			await colemakPage.actions.reset.tab();
			await colemakPage.assertions.display.score.containsText("0/50");
		});

		await step("Test Escape key reset", async () => {
			await colemakPage.actions.reset.escape();
			await colemakPage.assertions.display.score.containsText("0/50");
		});
	});

	test("user sees all layout options available", async ({ colemakPage }) => {
		await step("Verify total number of layout options", async () => {
			await colemakPage.assertions.layout.hasOptionsCount(10);
		});

		await step("Verify specific layout options exist", async () => {
			await colemakPage.assertions.layout.optionExists("colemak");
			await colemakPage.assertions.layout.optionExists("colemakdh");
			await colemakPage.assertions.layout.optionExists("qwerty");
			await colemakPage.assertions.layout.optionExists("dvorak");
			await colemakPage.assertions.layout.optionExists("workman");
		});
	});

	test("user sees all keyboard format options", async ({ colemakPage }) => {
		await step("Verify total number of keyboard format options", async () => {
			await colemakPage.assertions.keyboard.hasOptionsCount(3);
		});

		await step("Verify specific keyboard format options exist", async () => {
			await colemakPage.assertions.keyboard.optionExists("ansi");
			await colemakPage.assertions.keyboard.optionExists("iso");
			await colemakPage.assertions.keyboard.optionExists("ortho");
		});
	});

	test("user sees page title and header", async ({ colemakPage }) => {
		await step("Verify page title", async () => {
			await colemakPage.assertions.page.title(/Colemak Club/);
		});

		await step("Verify main header", async () => {
			await colemakPage.assertions.page.header("Colemak Club");
		});
	});

	test("user can interact with visible form inputs", async ({
		colemakPage,
	}) => {
		await step("Open settings menu", async () => {
			await colemakPage.actions.settings.open();
		});

		await step("Test typing in main input field", async () => {
			await colemakPage.actions.input.fill("test");
			await colemakPage.assertions.input.hasValue("test");
		});

		await step("Test typing in word limit input", async () => {
			await colemakPage.actions.settings.wordLimit.fill("80");
			await colemakPage.assertions.settings.wordLimit.hasValue("80");
		});

		await step("Reset word limit and verify score", async () => {
			await colemakPage.actions.settings.wordLimit.fill("50");
			await colemakPage.assertions.display.score.containsText("0/50");
			await colemakPage.assertions.settings.wordLimit.hasValue("50");
		});
	});
});
