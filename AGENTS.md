# Colemak-Tomonokai Project Rules

## Playwright Testing Best Practices

### Testing Philosophy
- Test user-visible behavior, not implementation details
- Each test must be completely isolated with fresh state
- Use beforeEach hooks for common setup like navigation
- Never test third-party dependencies - mock them instead

### Locator Usage
- ALWAYS use user-facing locators: `getByRole()`, `getByText()`, `getByLabel()`, `getByTestId()`
- NEVER use CSS selectors or XPath unless absolutely necessary
- Use locator chaining and filtering for complex selections
- Generate locators with `npx playwright codegen` when unsure

### Assertions
- Use web-first assertions: `await expect(locator).toBeVisible()`
- NEVER use manual assertions: `expect(await locator.isVisible()).toBe(true)`
- Use soft assertions when you want to continue testing after failures
- All assertions must be awaited properly

### Page Object Model (POM)
- Follow existing POM structure in `tests/POM/`
- Components use revealing module pattern (no ES6 classes)
- Separate actions and assertions clearly
- Each component file exports a `create*Component` function
- Use TypeScript with proper typing from `tests/POM/types.ts`

### Test Structure
- Use descriptive test names that explain user behavior
- Group related tests with `test.describe()`
- Keep tests focused on single user scenarios
- Use the custom fixture with `colemakPage` for all tests

### Configuration & Performance
- Tests run in single worker mode (workers: 1) due to state management
- Use trace viewer for debugging CI failures
- Action timeout set to 100ms, expect timeout to 500ms
- Always run tests on CI with proper retries

### Code Quality
- Use TypeScript strict mode
- Import from `./fixture.ts` not directly from playwright/test
- Follow existing naming conventions (camelCase for functions, PascalCase for types)
- Use proper async/await patterns throughout

### Debugging
- Use VS Code Playwright extension for live debugging
- Use `--debug` flag for step-through debugging
- Use `--trace on` for detailed local debugging
- Never commit debugging code

### Browser Testing
- Currently configured for Chromium only
- Add Firefox and WebKit projects when cross-browser testing is needed
- Test on real devices when mobile testing is required

### Anti-Patterns to Avoid
- Never use `page.waitForTimeout()` except for specific animation timing
- Don't use force clicks unless absolutely necessary
- Avoid testing implementation details like CSS classes
- Never rely on specific network timing in tests