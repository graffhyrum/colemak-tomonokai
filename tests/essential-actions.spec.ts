import { test, expect } from '@playwright/test';

test.describe('Colemak Typing Tutor - Essential Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('user can select different keyboard layouts', async ({ page }) => {
    const layoutSelect = page.locator('#layout');

    // Initial state
    await expect(layoutSelect).toHaveValue('colemak');

    // Select different layouts
    await layoutSelect.selectOption('colemakdh');
    await expect(layoutSelect).toHaveValue('colemakdh');

    await layoutSelect.selectOption('qwerty');
    await expect(layoutSelect).toHaveValue('qwerty');

    await layoutSelect.selectOption('dvorak');
    await expect(layoutSelect).toHaveValue('dvorak');
  });

  test('user can select different keyboard formats', async ({ page }) => {
    const keyboardSelect = page.locator('#keyboard');

    // Initial state
    await expect(keyboardSelect).toHaveValue('ansi');

    // Select different formats
    await keyboardSelect.selectOption('iso');
    await expect(keyboardSelect).toHaveValue('iso');

    await keyboardSelect.selectOption('ortho');
    await expect(keyboardSelect).toHaveValue('ortho');
  });

  test('user can type in the input field', async ({ page }) => {
    const userInput = page.locator('#userInput');

    // Type some text
    await userInput.fill('test typing');
    await expect(userInput).toHaveValue('test typing');

    // Clear the input
    await userInput.fill('');
    await expect(userInput).toHaveValue('');
  });

  test('user sees initial score and time', async ({ page }) => {
    const scoreText = page.locator('#scoreText');
    const timeText = page.locator('#timeText');

    // Check initial values
    await expect(scoreText).toContainText('0/50');
    await expect(timeText).toContainText('0m :0 s');
  });

  test('user can adjust word limit input', async ({ page }) => {
    const wordLimitModeInput = page.locator('.wordLimitModeInput');

    // Change word limit value
    await wordLimitModeInput.fill('25');
    await expect(wordLimitModeInput).toHaveValue('25');

    await wordLimitModeInput.fill('100');
    await expect(wordLimitModeInput).toHaveValue('100');
  });

  test('user can see time limit input exists', async ({ page }) => {
    const timeLimitModeInput = page.locator('.timeLimitModeInput');

    // Check that time limit input exists
    await expect(timeLimitModeInput).toBeAttached();
    await expect(timeLimitModeInput).toHaveValue('60');
  });

  test('user can see custom key input exists', async ({ page }) => {
    const customUIKeyInput = page.locator('#customUIKeyInput');

    // Check that custom key input exists
    await expect(customUIKeyInput).toBeAttached();
    await expect(customUIKeyInput).toHaveValue('');
  });

  test('user can use keyboard shortcuts', async ({ page }) => {
    const userInput = page.locator('#userInput');
    const scoreText = page.locator('#scoreText');

    // Focus on input
    await userInput.focus();

    // Test Tab key (should reset)
    await page.keyboard.press('Tab');
    await expect(scoreText).toContainText('0/50');

    // Test Escape key (should reset)
    await page.keyboard.press('Escape');
    await expect(scoreText).toContainText('0/50');
  });

  test('user sees all layout options available', async ({ page }) => {
    const layoutSelect = page.locator('#layout');
    const options = layoutSelect.locator('option');

    // Check that all expected layouts are present
    await expect(options).toHaveCount(14);
    
    // Check specific layouts exist
    await expect(layoutSelect.locator('option[value="colemak"]')).toBeAttached();
    await expect(layoutSelect.locator('option[value="colemakdh"]')).toBeAttached();
    await expect(layoutSelect.locator('option[value="qwerty"]')).toBeAttached();
    await expect(layoutSelect.locator('option[value="dvorak"]')).toBeAttached();
    await expect(layoutSelect.locator('option[value="workman"]')).toBeAttached();
  });

  test('user sees all keyboard format options', async ({ page }) => {
    const keyboardSelect = page.locator('#keyboard');
    const options = keyboardSelect.locator('option');

    // Check that all keyboard formats are present
    await expect(options).toHaveCount(3);
    
    // Check specific formats exist
    await expect(keyboardSelect.locator('option[value="ansi"]')).toBeAttached();
    await expect(keyboardSelect.locator('option[value="iso"]')).toBeAttached();
    await expect(keyboardSelect.locator('option[value="ortho"]')).toBeAttached();
  });

  test('user can navigate to external links', async ({ page }) => {
    const githubLink = page.locator('a[href*="github.com"]');
    const petitionLink = page.locator('a[href*="change.org"]');

    // Check links exist and have correct hrefs
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/gnusenpai/colemakclub');
    await expect(petitionLink).toHaveAttribute('href', 'https://www.change.org/p/microsoft-add-colemak-as-a-pre-installed-keyboard-layout-to-windows');
  });

  test('user sees page title and header', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Colemak Club/);
    
    // Check main header
    await expect(page.locator('h1')).toContainText('Colemak Club');
  });

  test('user can interact with visible form inputs', async ({ page }) => {
    const userInput = page.locator('#userInput');
    const wordLimitInput = page.locator('.wordLimitModeInput');

    // Test typing in visible inputs
    await userInput.fill('test');
    await expect(userInput).toHaveValue('test');

    await wordLimitInput.fill('75');
    await expect(wordLimitInput).toHaveValue('75');

    // Clear visible inputs
    await userInput.fill('');
    await wordLimitInput.fill('50');

    await expect(userInput).toHaveValue('');
    await expect(wordLimitInput).toHaveValue('50');
  });
});