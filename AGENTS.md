# Colemak-Tomonokai Project Rules

## Commands
- `bun typecheck` - TypeScript type checking
- `bun lint` - Biome linting
- `bun format` - Biome formatting  
- `bun check` - Run Biome lint + format
- `bun check:fix` - Auto-fix Biome issues
- `bun run test` - Run all Playwright tests
- `bun run test tests/essential-actions.spec.ts` - Run single test file
- `bun test:ui` - Playwright test UI mode
- `bun test:headed` - Playwright headed mode
- `bun vet` - Full check (lint fix + typecheck + test)

## Code Style
- Use Biome for formatting/linting (tab indentation, double quotes)
- TypeScript strict mode enabled
- Import organization: auto-organize on save
- File extensions: .ts for TypeScript, .js for JavaScript
- Use revealing module pattern, not ES6 classes
- Test files: .spec.ts extension in tests/ directory
- POM pattern: Component objects in tests/POM/components/

## Agent Delegation Guidelines

### Playwright Testing
When working with Playwright tests test creation test debugging or any testing-related tasks:
- ALWAYS delegate to @playwright subagent for expert analysis and guidance
- The @playwright agent provides instructions and code samples for you to implement
- Example: "@playwright analyze this failing test and provide a fix"

### When to Use @playwright
- Creating new Playwright tests get code samples and implementation steps
- Debugging failing tests get analysis and solutions
- Reviewing test code for best practices get improvement recommendations
- Optimizing test performance get specific optimization strategies
- Questions about Playwright configuration get expert guidance

### Working with @playwright
- @playwright will provide analysis recommendations and complete code samples
- You primary agent are responsible for implementing the provided solutions
- Follow exact commands provided by @playwright
- Validate implementations as suggested by @playwright
- Ask @playwright if any step is unclear

### When NOT to Use @playwright
- General application development handle directly
- Planning non-testing features handle directly
- Code reviews of non-test code handle directly

### Pair Programming Model
The interaction should resemble pair programming where:
- Primary agent makes all file changes and runs commands
- @playwright provides expertise and guidance but no direct input
- @playwright assumes zero Playwright knowledge from primary agent
- Instructions include exact commands expected outputs and line-by-line changes
