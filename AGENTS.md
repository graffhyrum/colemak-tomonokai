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
- 
## Error Handling Policy
- **CRITICAL** Type, lint, or format errors are unacceptable and must be resolved
- Any issues that the agent cannot fix **MUST** be escalated to the user with an explanation.

## Code Style
- Use Biome for formatting/linting (tab indentation, double quotes)
- TypeScript strict mode enabled
- Import organization: auto-organize on save
- File extensions: .ts for TypeScript, .js for JavaScript
- Use revealing module pattern, not ES6 classes
- Test files: .spec.ts extension in tests/ directory
- POM pattern: Component objects in tests/POM/components/

## Type Safety Policy
- **NON-NEGOTIABLE**: Type safety is mandatory. No casting, no bailing out, no lying about variable types.
- When system logic is correct but TypeScript cannot verify type safety, use validator functions from @src/utils/validation.ts
- Use assertion functions as described in https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
- Never use `as any`, `!`, or other type assertions to bypass TypeScript's type checking

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

## Archive Directory
- `@archive/` exists and is readonly for reference purposes
- Can be loaded via the playwright mcp by browsing to the file url of `<root>\archive\index.html`

## TypeScript Refactoring Agent Rules

### Core Refactoring Principles

#### Code Structure Rules
- Prefer pure functions and module composition over ES6 classes
- Use named functions unless infeasible
- Always use `const` or `let`, never `var`
- Prefer nullish coalescing operator (`??`) instead of logical or (`||`)
- Prefer `unknown` over `any` for vague types
- Prefer `RegExp.exec()` over `String.match()` for pattern matching
- No type casting or ES6 classes without explicit permission

#### SOLID Principles
- **Single Responsibility**: Functions should have one reason to change
- **Open/Closed**: Design for extension, not modification
- **Liskov Substitution**: Ensure proper type relationships
- **Interface Segregation**: Create focused, minimal interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

#### SRP Implementation
Functions are evaluated for:
- **Line count**: Functions >5 lines flagged for extraction
- **Responsibility count**: Multiple tasks in single function
- **Name clarity**: Function names accurately describe purpose
- **Parameter clarity**: Parameter names are descriptive

#### Extraction Strategy
1. **Identify logical blocks** within complex functions
2. **Extract meaningful operations** into separate functions
3. **Create descriptive names** for extracted functions
4. **Maintain data flow** through clear parameters
5. **Preserve error handling** and edge cases

#### Stepdown Organization
Functions organized by abstraction level:
- **Entry points** (main, export functions) placed first
- **Orchestrator functions** that coordinate multiple operations
- **Business logic functions** implementing core functionality
- **Helper/utility functions** providing specific operations
- **Low-level functions** handling primitive operations

### Dependency Detection & Specialist Consultation

#### 1. Detect Framework Dependencies
Before refactoring, analyze codebase for registered dependencies:
```bash
# Scan package.json and imports for registered dependencies
detect_dependencies() {
  local deps=()

  # Check package.json
  if [ -f "package.json" ]; then
    if grep -q "effect" package.json; then deps+=("effect"); fi
    if grep -q "svelte" package.json; then deps+=("svelte"); fi
    if grep -q "neverthrow" package.json; then deps+=("neverthrow"); fi
    if grep -q "bun" package.json; then deps+=("bun"); fi
  fi

  # Check imports in source files
  find src -name "*.ts" -o -name "*.js" 2>/dev/null | while read file; do
    if grep -q "from.*@effect" "$file"; then deps+=("effect"); fi
    if grep -q "from.*svelte" "$file"; then deps+=("svelte"); fi
    if grep -q "from.*neverthrow" "$file"; then deps+=("neverthrow"); fi
  done

  echo "${deps[@]}"
}
```

#### 2. Specialist Consultation Strategy
For each detected dependency, consult specialists before refactoring:

**Effect Specialist**:
- Functional programming patterns
- Effect-specific error handling
- Option/Either usage patterns
- Effect composition best practices

**Svelte Specialist**:
- Component refactoring patterns
- Reactive programming conventions
- Svelte-specific TypeScript patterns
- Component lifecycle considerations

**Neverthrow Specialist**:
- Result type usage patterns
- Error handling conventions
- Neverthrow composition strategies
- Integration with other libraries

**Bun Specialist**:
- Runtime-specific optimizations
- Bun API usage patterns
- Performance considerations
- Toolchain integration

#### 3. Specialist Integration Workflow
```bash
# Consult specialists before refactoring decisions
consult_specialists() {
  local dependencies=($(detect_dependencies))
  local refactoring_scope="$1"

  for dep in "${dependencies[@]}"; do
    echo "🔍 Consulting ${dep} specialist for ${refactoring_scope}..."
    # Specialist consultation happens via Task tool
  done
}
```

### Workflow

#### 1. Baseline Quality Checks (First Step)
Always run TypeScript compiler and linter/formatter first to establish baseline:
```bash
# Step 1: Always run TypeScript type checking
if [ -f "tsconfig.json" ]; then
  echo "🔍 Running TypeScript type checking..."
  tsc --noEmit
  echo "✅ TypeScript compilation completed"
else
  echo "⚠️  No tsconfig.json found - skipping TypeScript checks"
fi

# Step 2: Run linter/formatter based on available tools
if [ -f "biome.json" ]; then
  echo "🔍 Running Biome checks..."
  biome check .
  echo "✅ Biome checks completed"
elif [ -f "eslint.config.js" ] || [ -f ".eslintrc.*" ]; then
  echo "🔍 Running ESLint..."
  eslint .
  echo "✅ ESLint checks completed"
else
  echo "⚠️  No linter configuration found"
fi

# Step 3: Run npm scripts if available
if [ -f "package.json" ]; then
  PKG_MANAGER=$(find_package_manager)
  echo "🔍 Running npm quality scripts..."
  $PKG_MANAGER run lint 2>/dev/null || echo "No lint script found"
  $PKG_MANAGER run typecheck 2>/dev/null || echo "No typecheck script found"
  $PKG_MANAGER run check 2>/dev/null || echo "No check script found"
  $PKG_MANAGER run format:check 2>/dev/null || echo "No format:check script found"
fi

echo "📊 Baseline quality checks completed"
```

#### 2. Project Analysis
Analyze the current project to understand available tools:
```bash
# Detect package manager and available scripts
find_package_manager() {
  if [ -f "bun.lockb" ]; then echo "bun"
  elif [ -f "pnpm-lock.yaml" ]; then echo "pnpm"
  elif [ -f "yarn.lock" ]; then echo "yarn"
  elif [ -f "package-lock.json" ]; then echo "npm"
  else echo "npm"
  fi
}

detect_quality_tools() {
  local tools=()
  [ -f "biome.json" ] && tools+=("biome")
  [ -f "eslint.config.js" ] || [ -f ".eslintrc.*" ] && tools+=("eslint")
  [ -f "tsconfig.json" ] && tools+=("typescript")
  [ -f "package.json" ] && tools+=("npm-scripts")
  echo "${tools[@]}"
}
```

#### 4. Scope-Constrained Refactoring Strategy
- **Function Decomposition**: Large functions → create subfunctions inside parent first
- **Hoisting Logic**: Subfunctions → hoist only if reusable elsewhere in file
- **Incremental Expansion**: Only expand scope when necessary
- **SRP Enforcement**: Functions >5 lines flagged for extraction
- **Stepdown Organization**: Functions ordered from high to low abstraction

#### 5. Specialist-Enhanced Refactoring Process

##### Pre-Refactoring Specialist Consultation
Before making changes, consult relevant specialists:

1. **Detect dependencies** using dependency detection logic
2. **Consult specialists** for framework-specific patterns:
   ```
   For Effect code:
   - Use Task tool to consult effect-agent
   - Get guidance on functional refactoring patterns
   - Validate Effect composition approaches

   For Svelte code:
   - Use Task tool to consult svelte-agent
   - Get component refactoring best practices
   - Validate reactive programming patterns

   For Neverthrow code:
   - Use Task tool to consult neverthrow-agent
   - Get Result type refactoring guidance
   - Validate error handling patterns
   ```

3. **Incorporate specialist feedback** into refactoring plan
4. **Present enhanced summary** including specialist recommendations

##### Specialist Validation During Refactoring
- **Real-time consultation**: Ask specialists about specific patterns
- **Framework-specific validation**: Ensure changes follow library conventions
- **Best practice alignment**: Incorporate specialist knowledge

#### 6. Execution & Verification with Specialist Validation
- Apply changes with git tracking
- **Post-refactoring specialist review**: Validate changes with relevant specialists
- Run same quality checks post-refactoring
- Ensure no regressions introduced
- Provide rollback instructions if needed

#### 7. Specialist Integration Examples

##### Effect-Specific Refactoring
```typescript
// Before consulting effect-agent
function processData(data: any): any {
  if (data.success) {
    return data.value
  } else {
    throw new Error(data.error)
  }
}

// After effect-agent consultation
import { Effect, Option } from 'effect'

function processData(data: unknown): Effect.Effect<unknown, Error> {
  return Effect.try(() => {
    if (typeof data === 'object' && data !== null && 'success' in data) {
      const result = data as { success: boolean; value?: unknown; error?: string }
      return result.success ? result.value : Effect.fail(new Error(result.error))
    }
    throw new Error('Invalid data format')
  })
}
```

##### Svelte Component Refactoring
```typescript
// Before consulting svelte-agent
<script lang="ts">
  let count = 0
  function increment() {
    count = count + 1
  }
</script>

// After svelte-agent consultation
<script lang="ts">
  import { writable } from 'svelte/store'

  const count = writable(0)
  const increment = () => count.update(n => n + 1)
</script>
```

### Common Refactoring Patterns

#### Replace `any` with `unknown`
```typescript
// Before
function processData(data: any): any {
  return data.processed
}

// After
function processData(data: unknown): unknown {
  if (typeof data === 'object' && data !== null && 'processed' in data) {
    return (data as { processed: unknown }).processed
  }
  throw new Error('Invalid data format')
}
```

#### Extract Pure Functions (SRP)
```typescript
// Before - violates SRP (>5 lines, multiple responsibilities)
function processUsers(users: User[]) {
  const filtered = users.filter(u => u.active)
  const mapped = filtered.map(u => ({ ...u, processed: true }))
  return mapped
}

// After - follows SRP with stepdown organization
function processUsers(users: User[]): User[] {
  return users
    .filter(isActiveUser)
    .map(markAsProcessed)
}

function isActiveUser(user: User): boolean {
  return user.active
}

function markAsProcessed(user: User): User {
  return { ...user, processed: true }
}
```

#### Replace Classes with Functions
```typescript
// Before
class UserService {
  constructor(private users: User[]) {}

  getActiveUsers(): User[] {
    return this.users.filter(u => u.active)
  }
}

// After
function createUserService(users: User[]) {
  return {
    getActiveUsers: (): User[] => users.filter(u => u.active)
  }
}
```

#### Use Nullish Coalescing
```typescript
// Before
const value = config.value || 'default'

// After
const value = config.value ?? 'default'
```

#### Prefer RegExp.exec() over String.match()
```typescript
// Before
const isConfigFile = (filePath: string): boolean =>
  filePath.match(/\.(json|yaml|yml|toml|lock|config)$/i) !== null

// After
const CONFIG_FILE_PATTERN = /\.(json|yaml|yml|toml|lock|config)$/i
const isConfigFile = (filePath: string): boolean =>
  CONFIG_FILE_PATTERN.exec(filePath) !== null
```

### Usage Examples

```
@typescript-refactor Refactor this file following clean code principles
@typescript-refactor Fix SOLID violations in this component
@typescript-refactor Replace any types with proper typing
@typescript-refactor Decompose this large function following SRP
@typescript-refactor Improve type safety across the codebase
@typescript-refactor Apply stepdown rule to this file
@typescript-refactor Extract functions to follow single responsibility principle
```

### Safety Measures

- Always create git commit before major refactoring
- Run quality checks before and after changes
- Provide clear rollback instructions
- Respect existing project conventions
- Ask for permission before destructive changes
- Validate SRP compliance (functions ≤5 lines)
- Ensure stepdown rule compliance (high-to-low abstraction)

### Error Handling

- Gracefully handle missing tools
- Provide manual guidance when automation fails
- Explain what tools were detected/used
- Offer alternative approaches when needed
- Handle SRP violations with clear extraction strategies
- Manage stepdown conflicts while preserving functionality

Remember: Your goal is to improve code quality while maintaining functionality and respecting the project's existing patterns and conventions. Apply SRP and stepdown rules systematically.
