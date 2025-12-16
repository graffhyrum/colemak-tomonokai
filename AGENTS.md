# Agent Guidelines for Colemak Club

## Agent Best Practices
- In **ALL** interactions, be extremely concise and sacrifice grammar for brevity.
- At the end of each plan, give me a list of unresolved questions you have about the task, if any. Make questions extremely concise and sacrifice grammar for brevity.

## Build & Test Commands

### Development
- `bun run dev` - Start development server
- `bun run vet` - Run full validation (lint + typecheck + tests)

### Testing
- `bun run test` - Run all Playwright E2E tests
- `bun run test --grep "test name"` - Run single test by name
- `bun run test tests/core.spec.ts:5` - Run test at specific line
- `bun run test --headed` - Run tests in headed mode

### Code Quality
- `bun run lint` - Lint with Biome
- `bun run format` - Format code with Biome
- `bun run check` - Check formatting/linting
- `bun run check:fix` - Auto-fix formatting/linting issues
- `bun run typecheck` - TypeScript type checking

## Code Style Guidelines

### Formatting & Linting
- Use **Biome** for all formatting/linting
- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes for strings
- **Imports**: Auto-organize with Biome assist
- **Line endings**: Follow existing patterns

### Type Safety & Assertions
- **Non-null assertions**: Use `assertDefined()` from `tests/util/assertDefined.ts` instead of `!` operator for runtime type safety in tests
- **Import pattern**: `import { assertDefined } from "./util/assertDefined";`
- **Usage**: Add `assertDefined(variable);` before accessing properties to ensure runtime validation

### TypeScript Configuration
- **Target**: ESNext with DOM lib
- **JSX**: react-jsx transform
- **Strict mode**: Enabled with additional checks
- **Module resolution**: Bundler mode
- Allow JS files in TS projects

### Architecture Patterns
- **Classes**: Use revealing module pattern (no ES6 class syntax)
- **Services**: camelCase names in `logic/services/`
- **Components**: PascalCase names in `logic/components/`
- **State**: Centralized via `logic/core/stateManager.js`
- **Error handling**: Try/catch with graceful degradation

### Naming Conventions
- **Services**: `serviceName.js` (camelCase)
- **Components**: `ComponentName.js` (PascalCase)
- **Constants**: `CONSTANT_NAME` or `constantName`
- **Functions**: `camelCase` with descriptive names
- **Files**: Match exported module names

### Development Workflow
- **Incremental changes**: Test after each modification
- **Zero regressions**: All 12+ Playwright tests must pass
- **Modern JS**: Prefer const/let, template literals, arrow functions
- **Performance**: Cache DOM elements and audio resources
- **Compatibility**: Maintain backward compatibility during refactoring

### Testing Requirements
- **Coverage**: Playwright tests across Chrome, Firefox, Safari
- **Validation**: `bun vet` must pass before commits
- **Screenshots**: Update snapshots when UI changes
- **Isolation**: Tests should be independent and parallel</content>

