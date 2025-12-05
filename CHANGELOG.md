# colemak-tomonokai

## 1.0.0

### Major Changes

- b03d48d: Complete rewrite to TypeScript with modular architecture

  - Migrate from JavaScript to TypeScript with strict mode
  - Implement component-based architecture with base classes
  - Add comprehensive type definitions
  - Modernize build configuration with Bun and Biome
  - Update test suite with Playwright POM pattern
  - BREAKING CHANGE: Complete API and structure overhaul

- 898d6d2: Comprehensive application refactoring for type safety and maintainability:
  - Replace BaseComponent class with modern DOM utilities
  - Add comprehensive master word list with 2000+ common words
  - Refactor entities to use proper TypeScript types and constants
  - Implement modular level management with validation
  - Update TypingTutorFactory to use new data structures
  - Add proper type definitions and utility functions
  - Improve word generation with filtering and validation
  - Enhance DOM utilities with type-safe operations
  - Remove legacy code patterns and improve error handling
  - Standardize import organization and module structure

### Minor Changes

- f1a6659: Extract modular architecture with separate modules for constants, DOM cache, and utilities to improve code organization and maintainability.
- 3b5cdfa: Enhance POM components with comprehensive navigation and typing input support for improved test coverage.
- 77fb9c4: Refactor TypingTutorPage POM with comprehensive actions and assertions for enhanced test automation capabilities.
- f1a6659: Improve Playwright test structure with step wrappers following arrange-act-assert pattern for better test organization and debugging capabilities.
- f1a6659: Update project documentation with simplified AGENTS.md and comprehensive Playwright agent configuration including step wrapper patterns and testing best practices.
- 9cfdb4f: Add project development guidelines and testing best practices documentation.
- 7880f4c: Implement modular keyboard template system with proper keyboard layout definitions, template-based rendering, and improved modifier key handling. Refactor TypingTutorFactory to use new template system and update CSS classes to match archive structure.

  BREAKING CHANGE: Keyboard DOM structure updated from .keyboard to .cheatsheet
  BREAKING CHANGE: Active key class changed from .active to .currentLevelKeys

- 9cfdb4f: Simplify layout selector options and remove disabled separators for cleaner UI.
- 9cfdb4f: Enhance POM with settings interactions and improve test coverage for form inputs.
- 8d586c3: Implement level selection UI with 'All Words' support, allowing users to choose difficulty levels and access all available words for complete mastery.
- 097db7b: Add modular factory pattern for typing tutor components with configurable layouts.
- 097db7b: Extract keyboard layout configurations to dedicated config module.
- 7e9d9e9: Implement comprehensive level system with progressive difficulty levels, word generation, and level-based filtering for all keyboard layouts.
- f6a7142: Update implementation roadmap documentation with latest project structure and development plans.
- f6a7142: Update main application entry point to support new project structure and configuration.
- e07efc0: Refactor codebase to use entity-based architecture:
  - Split configuration into separate entity files (layouts, levels, shapes)
  - Update components with keyboard character mapping and shift layer support
  - Implement level-based key highlighting logic
  - Add comprehensive keyboard display implementation
- e07efc0: Update documentation:
  - Remove outdated implementation roadmap and PRD documents
  - Add comprehensive keyboard display implementation plan with technical details
- 898d6d2: Implement dynamic Playwright projects generation utility with comprehensive browser/shape/layout combinations. Replaces static single project configuration with flexible 90-project system supporting both development and full testing modes.

### Patch Changes

- cdb7110: Add Biome configuration for code formatting and linting.
- cdb7110: Add build configuration and dependency updates including Biome, Changesets, and Playwright testing setup.
- f3db750: Fix keyboard select name attribute to match shape parameter for proper form handling.
- cdb7110: Format JavaScript logic files with Biome for consistent code style.
- f1a6659: Refactor app.js to use extracted modules and improve variable declarations with const for better code maintainability.
- f1a6659: Clean up CSS by removing duplicate vendor prefixes and consolidating transition declarations for improved maintainability.
- cdb7110: Format TypeScript test files with Biome for consistent code style.
- b4327c5: Update dependencies to latest versions.
- b4327c5: Remove unnecessary type annotations and parentheses in test POM files.
- 7880f4c: Fix test selectors and navigation timeouts to resolve test failures caused by component refactoring. Update keyboard selectors from .keyboard to .cheatsheet, active key selectors from .key.active to .key.currentLevelKeys, and add proper timeout handling for navigation button clicks.
- 7880f4c: Remove outdated POM components (colemakTutorPage.ts and qwertyTutorPage.ts) to reduce test maintenance burden and clean up the codebase.
- 7880f4c: Update data structures and styling to support new keyboard template system. Add CSS classes for keyboard layout and improve visual consistency with archive implementation.
- 9cfdb4f: Convert const declarations to let for better variable mutability in application logic.
- 9cfdb4f: Optimize test configuration for single-threaded execution and faster timeouts.
- 7880f4c: Update configuration and documentation files including changeset updates, environment configuration, dependency lock, and Playwright configuration for new test structure.
- 7880f4c: Add keyboard testing HTML files for manual testing and development workflow support.
- 8d586c3: Update level selection test to expect 7 buttons, ensuring proper testing of the new 'All Words' level.
- 8d586c3: Remove baseURL from playwright configuration for improved test portability.
- 097db7b: Update type definitions and main entry point to use new factory pattern.
- 097db7b: Enhance DOM utilities with comprehensive manipulation functions.
- 619e88e: Update documentation to reflect completion of level system implementation in Phase 2.
- f6a7142: Setup build and development configuration including environment variables, Bun runtime config, development scripts, and TypeScript configuration.
- f6a7142: Configure Playwright testing infrastructure and update QWERTY phase 1 tests for new project structure.
- 74c0ed3: Rename KeyboardFormat to KeyboardShape for better naming clarity. The physical shape and arrangement of keys (ansi, iso, ortho) is now referred to as "keyboardShape" to distinguish it from the key-to-glyph mapping which remains "keyboardLayout". Updated all related type definitions, variable names, and function parameters throughout the codebase.
- e07efc0: Improve test coverage and structure:
  - Update test files to use new entity imports
  - Add comprehensive layout and keyboard shape testing
  - Add level-based highlighting verification tests
  - Create test utilities directory structure
- e07efc0: Update configuration and tooling:
  - Remove deprecated 'custom' layout option from UI
  - Add baseURL configuration to Playwright for better test setup
- 898d6d2: Update implementation plan documentation to reflect completed work and current codebase state including new dynamic project system and architectural improvements.
- 898d6d2: Add PLAYWRIGHT_FULL_TEST environment variable to control test scope between fast development (2 projects) and comprehensive coverage (90 projects).
- 898d6d2: Add 2000+ word master list for typing tutor covering common English vocabulary, articles, prepositions, and technical terms for comprehensive level progression.
- 898d6d2: Update test fixture to work with new dynamic project system by removing hardcoded dependencies and maintaining compatibility with existing test patterns.
- 898d6d2: Update test files to work with refactored application architecture and maintain test coverage while accommodating new entity structure and level management system.
