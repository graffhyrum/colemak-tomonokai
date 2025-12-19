# Agent Guidelines for Colemak Club

## Agent Best Practices
- In **ALL** interactions, be extremely concise and sacrifice grammar for brevity.
- At the end of each plan, give me a list of unresolved questions you have about the task, if any. Make questions extremely concise and sacrifice grammar for brevity.
- **File Reading**: When reading any file, always read the ENTIRE file to avoid incomplete edits and unforced bugs.

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
- **Isolation**: Tests should be independent and parallel
- **Failed Test Cap**: Playwright caps failed test output at 10; if 10 failures shown, likely more exist

## JetBrains MCP Tools Usage Guidelines

### When to Use JetBrains Tools Over Native Tools
- **File Operations**: Use `jetbrains_get_file_text_by_path`, `jetbrains_create_new_file`, `jetbrains_replace_text_in_file` over `read`, `write`, `edit` for IDE-integrated file handling with automatic indexing and error checking
- **Search Operations**: Prefer `jetbrains_search_in_files_by_text`, `jetbrains_search_in_files_by_regex` over `grep` for faster IDE-indexed searches with better context highlighting
- **File Discovery**: Use `jetbrains_find_files_by_name_keyword`, `jetbrains_find_files_by_glob` over `glob`, `list` for project-aware file finding with exclusion awareness
- **Directory Exploration**: Prefer `jetbrains_list_directory_tree` over `list` for hierarchical project structure visualization
- **Refactoring**: Always use `jetbrains_rename_refactoring` over manual search/replace for symbol renaming across the entire project
- **Code Analysis**: Use `jetbrains_get_symbol_info`, `jetbrains_get_file_problems` for IDE-powered code intelligence and error detection
- **Terminal Commands**: Prefer `jetbrains_execute_terminal_command` over `bash` when IDE integration provides better environment context
- **Run Configurations**: Use JetBrains run configuration tools for project-specific build/test execution
- **Code Formatting**: Use `jetbrains_reformat_file` for consistent IDE-formatted code changes

### When to Use Native Tools Instead
- **Non-project Files**: Use native `read`, `write` for files outside the IDE project scope
- **System Operations**: Use `bash` for OS-level commands, environment setup, or when IDE integration isn't needed
- **Web/Content Fetching**: Use `webfetch`, `websearch`, `codesearch` for external resource access
- **Agent Management**: Use native agent tools for multi-agent coordination and caching
- **Bulk Operations**: Use native tools when processing many files simultaneously across the filesystem</content>

