import {test} from "./fixture.ts";

test.describe("Colemak Typing Tutor - Essential Actions", () => {
	test("user can select different keyboard layouts", async ({
		                                                          colemakPage,
	                                                          }) => {
		// Initial state
		await colemakPage.assertions.layout.hasValue("colemak");

		// Select different layouts
		await colemakPage.actions.layout.selectOption("colemakdh");
		await colemakPage.assertions.layout.hasValue("colemakdh");

		await colemakPage.actions.layout.selectOption("qwerty");
		await colemakPage.assertions.layout.hasValue("qwerty");

		await colemakPage.actions.layout.selectOption("dvorak");
		await colemakPage.assertions.layout.hasValue("dvorak");
	});

	test("user can select different keyboard formats", async ({
		                                                          colemakPage,
	                                                          }) => {
		// Initial state
		await colemakPage.assertions.keyboard.hasValue("ansi");

		// Select different formats
		await colemakPage.actions.keyboard.selectOption("iso");
		await colemakPage.assertions.keyboard.hasValue("iso");

		await colemakPage.actions.keyboard.selectOption("ortho");
		await colemakPage.assertions.keyboard.hasValue("ortho");
	});

	test("user can type in the input field", async ({colemakPage}) => {
		// Type some text
		await colemakPage.actions.input.fill("test typing");
		await colemakPage.assertions.input.hasValue("test typing");

		// Clear the input
		await colemakPage.actions.input.clear();
		await colemakPage.assertions.input.hasValue("");
	});

	test("user sees initial score and time", async ({colemakPage}) => {
		// Check initial values
		await colemakPage.assertions.display.score.containsText("0/50");
		await colemakPage.assertions.display.time.containsText("0m :0 s");
	});

	test("user can adjust word limit input", async ({colemakPage}) => {
		// Change word limit value
		await colemakPage.actions.settings.wordLimit.fill("25");
		await colemakPage.assertions.settings.wordLimit.hasValue("25");

		await colemakPage.actions.settings.wordLimit.fill("100");
		await colemakPage.assertions.settings.wordLimit.hasValue("100");
	});

	test("user can see time limit input exists", async ({colemakPage}) => {
		// Check that time limit input exists
		await colemakPage.assertions.settings.timeLimit.isAttached();
		await colemakPage.assertions.settings.timeLimit.hasValue("60");
	});

	test("user can see custom key input exists", async ({colemakPage}) => {
		// Check that custom key input exists
		await colemakPage.assertions.settings.customKey.isAttached();
		await colemakPage.assertions.settings.customKey.hasValue("");
	});

	test("user can use keyboard shortcuts", async ({colemakPage}) => {
		// Focus on input
		await colemakPage.actions.input.focus();

		// Test Tab key (should reset)
		await colemakPage.actions.reset.tab();
		await colemakPage.assertions.display.score.containsText("0/50");

		// Test Escape key (should reset)
		await colemakPage.actions.reset.escape();
		await colemakPage.assertions.display.score.containsText("0/50");
	});

	test("user sees all layout options available", async ({colemakPage}) => {
		// Check that all expected layouts are present
		await colemakPage.assertions.layout.hasOptionsCount(14);

		// Check specific layouts exist
		await colemakPage.assertions.layout.optionExists("colemak");
		await colemakPage.assertions.layout.optionExists("colemakdh");
		await colemakPage.assertions.layout.optionExists("qwerty");
		await colemakPage.assertions.layout.optionExists("dvorak");
		await colemakPage.assertions.layout.optionExists("workman");
	});

	test("user sees all keyboard format options", async ({colemakPage}) => {
		// Check that all keyboard formats are present
		await colemakPage.assertions.keyboard.hasOptionsCount(3);

		// Check specific formats exist
		await colemakPage.assertions.keyboard.optionExists("ansi");
		await colemakPage.assertions.keyboard.optionExists("iso");
		await colemakPage.assertions.keyboard.optionExists("ortho");
	});

	test("user can navigate to external links", async ({colemakPage}) => {
		// Check links exist and have correct hrefs
		await colemakPage.assertions.links.github.hasHref(
			"https://github.com/gnusenpai/colemakclub",
		);
		await colemakPage.assertions.links.petition.hasHref(
			"https://www.change.org/p/microsoft-add-colemak-as-a-pre-installed-keyboard-layout-to-windows",
		);
	});

	test("user sees page title and header", async ({colemakPage}) => {
		// Check page title
		await colemakPage.assertions.page.title(/Colemak Club/);

		// Check main header
		await colemakPage.assertions.page.header("Colemak Club");
	});

	test("user can interact with visible form inputs", async ({
		                                                          colemakPage,
	                                                          }) => {
		// Test typing in visible inputs
		await colemakPage.actions.input.fill("test");
		await colemakPage.assertions.input.hasValue("test");

		await colemakPage.actions.settings.wordLimit.fill("75");
		await colemakPage.assertions.settings.wordLimit.hasValue("75");

		// Clear visible inputs
		await colemakPage.actions.input.clear();
		await colemakPage.actions.settings.wordLimit.fill("50");

		await colemakPage.assertions.input.hasValue("");
		await colemakPage.assertions.settings.wordLimit.hasValue("50");
	});
});
