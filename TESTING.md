# Testing

This project uses Playwright for end-to-end testing.

## Running Tests

```bash
# Run all tests across all browsers
bun run test

# Run tests for specific browser
bun run test --project=chromium
bun run test --project=firefox  
bun run test --project=webkit

# Run tests with UI mode
bun run test:ui

# Run tests in headed mode (visible browser)
bun run test:headed
```

## Test Structure

- `tests/essential-actions.spec.ts` - Core user actions that work reliably across browsers
- Tests focus on user actions and resulting states, not implementation details
- Tests avoid interacting with hidden elements or elements blocked by bun-hmr

## Browser Support

Tests run across three browsers:
- Chromium (Chrome/Edge)
- Firefox  
- WebKit (Safari)

## Writing New Tests

When adding tests:
1. Focus on user actions and observable results
2. Avoid testing implementation details
3. Don't interact with hidden elements
4. Use `toBeAttached()` for elements that may not be visible
5. Test across all browsers for compatibility