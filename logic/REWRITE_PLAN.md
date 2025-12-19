# Rewrite Plan: Fresh Architecture for Colemak Typing Tutor

## Overview
This plan outlines a complete rewrite of `logic/app.js` and related architecture using modern (2025) best practices, minimal dependencies, and a clean, simple implementation.

## Goals
- **Zero dependencies** (vanilla JS/TS, no frameworks)
- **Modern ES modules** (no script tags)
- **TypeScript** for type safety
- **Functional programming** where appropriate
- **Event-driven architecture**
- **Immutable state updates**
- **Testable** and maintainable
- **Simple** - avoid over-engineering

## Current State Analysis

### Features Required (from tests & codebase)
1. **Typing Practice**
   - Real-time letter-by-letter feedback (green/red/gray)
   - Word completion on space/enter
   - Word scrolling vs paragraph display modes
   - Visual prompt with word highlighting

2. **Game Modes**
   - Word limit mode (type N words)
   - Time limit mode (type for N seconds)
   - Full sentence mode
   - Level-based progression (1-6, All Words, Full Sentences)

3. **Keyboard Layouts**
   - Multiple layouts: Colemak, Colemak-DH, Tarmak, Tarmak-DH, QWERTY, Dvorak, AZERTY, Workman, Canary, Custom
   - Keyboard types: ANSI, ISO, Ortho
   - Custom layout editor
   - Key remapping toggle

4. **Settings/Preferences**
   - Capital letters allowed
   - Punctuation mode
   - Require backspace correction
   - Word scrolling mode toggle
   - Show/hide cheatsheet
   - Sound on click/error

5. **Statistics**
   - Score tracking (current/target)
   - Timer (count-up or count-down)
   - WPM calculation
   - Accuracy percentage
   - Final results display

6. **Word Generation**
   - Level-based word pools
   - Layout-specific letter sets
   - Lazy loading for time limit mode
   - Sentence generation for full sentence mode

## Architecture Design

### Core Principles
1. **Single Responsibility** - Each module does one thing well
2. **Composition** - Build complex behavior from simple parts
3. **Immutability** - State updates create new objects
4. **Events** - Decouple components via events
5. **Pure Functions** - Testable, predictable logic

### Proposed Structure

```
logic/
├── app.ts                    # Main entry point (<100 lines)
├── core/
│   ├── state.ts              # Immutable state management
│   ├── events.ts             # Event bus
│   └── types.ts              # TypeScript definitions
├── domain/
│   ├── game.ts               # Game logic (pure functions)
│   ├── word.ts               # Word generation (pure functions)
│   ├── layout.ts             # Layout management (pure functions)
│   └── stats.ts              # Statistics calculation (pure functions)
├── services/
│   ├── storage.ts            # localStorage wrapper
│   ├── sound.ts              # Audio playback
│   └── timer.ts              # Timer management
├── ui/
│   ├── prompt.ts             # Prompt display component
│   ├── input.ts              # Input handling component
│   ├── preferences.ts        # Preferences modal component
│   ├── keyboard.ts           # Keyboard display component
│   └── results.ts            # Results display component
└── utils/
    ├── dom.ts                # DOM utilities
    └── validation.ts         # Input validation
```

## Implementation Plan

### Phase 1: Core Infrastructure (Day 1)

#### 1.1 Type Definitions (`core/types.ts`)
```typescript
// Game state types
type GameMode = 'wordLimit' | 'timeLimit';
type DisplayMode = 'scrolling' | 'paragraph';
type LayoutName = 'colemak' | 'colemakdh' | 'qwerty' | ...;
type KeyboardType = 'ansi' | 'iso' | 'ortho';
type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface GameState {
  mode: GameMode;
  score: number;
  scoreMax: number;
  timeElapsed: number;
  timeLimit?: number;
  currentWord: string;
  input: string;
  letterIndex: number;
  words: string[];
  correct: number;
  errors: number;
  gameOn: boolean;
}

interface Settings {
  layout: LayoutName;
  keyboard: KeyboardType;
  level: Level;
  onlyLower: boolean;
  punctuation: boolean;
  requireBackspace: boolean;
  wordScrolling: boolean;
  showCheatsheet: boolean;
  soundOnClick: boolean;
  soundOnError: boolean;
  keyRemapping: boolean;
}
```

#### 1.2 State Management (`core/state.ts`)
- Immutable state updates
- Event emission on state changes
- Simple getter/setter API
- No complex listeners - use event bus

```typescript
class State {
  private state: GameState & Settings;
  private _events: EventBus;
  
  get<K extends keyof (GameState & Settings)>(key: K): (GameState & Settings)[K]
  set<K extends keyof (GameState & Settings)>(key: K, value: (GameState & Settings)[K]): void
  update(updates: Partial<GameState & Settings>): void
  reset(): void
}
```

#### 1.3 Event Bus (`core/events.ts`)
- Simple pub/sub pattern
- Type-safe event names
- No dependencies

```typescript
type EventMap = {
  'game:start': void;
  'game:end': { score: number; accuracy: number; wpm: number };
  'word:complete': { word: string; correct: boolean };
  'letter:typed': { letter: string; correct: boolean };
  'settings:change': { key: string; value: unknown };
};

class EventBus {
  on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void
  off<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void
}
```

### Phase 2: Domain Logic (Day 1-2)

#### 2.1 Game Logic (`domain/game.ts`)
Pure functions for game mechanics:
- `checkLetter(input: string, expected: string, index: number): boolean`
- `checkWord(input: string, expected: string): boolean`
- `calculateAccuracy(correct: number, errors: number): number`
- `calculateWPM(words: number, seconds: number): number`
- `shouldEndGame(state: GameState): boolean`

#### 2.2 Word Generation (`domain/word.ts`)
Pure functions for word selection:
- `getLevelLetters(layout: LayoutName, level: Level): string`
- `filterWords(words: string[], allowedLetters: string): string[]`
- `selectWord(words: string[], used: Set<string>): string`
- `generateLine(words: string[], maxWords: number): string`
- `generateSentence(words: string[], startIndex: number, length: number): string`

#### 2.3 Layout Management (`domain/layout.ts`)
Pure functions for layout operations:
- `getLayoutMap(layout: LayoutName): Record<string, string>`
- `getLevelDictionary(layout: LayoutName): Record<string, string>`
- `mapKey(key: string, layout: LayoutName, remapping: boolean): string`
- `validateCustomLayout(layout: Record<string, string>): boolean`

#### 2.4 Statistics (`domain/stats.ts`)
Pure calculation functions:
- `calculateWPM(words: number, seconds: number): number`
- `calculateAccuracy(correct: number, total: number): number`
- `formatTime(seconds: number): string`
- `formatScore(current: number, max: number): string`

### Phase 3: Services (Day 2)

#### 3.1 Storage Service (`services/storage.ts`)
Simple localStorage wrapper:
```typescript
class Storage {
  get<T>(key: string, defaultValue: T): T
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
}
```

#### 3.2 Sound Service (`services/sound.ts`)
Audio playback with state checks:
```typescript
class Sound {
  playClick(): void
  playError(): void
  setEnabled(click: boolean, error: boolean): void
}
```

#### 3.3 Timer Service (`services/timer.ts`)
Timer management:
```typescript
class Timer {
  start(callback: () => void): void
  stop(): void
  reset(): void
  getElapsed(): number
  setLimit(seconds: number): void
}
```

### Phase 4: UI Components (Day 2-3)

#### 4.1 Prompt Component (`ui/prompt.ts`)
Manages prompt display:
```typescript
class Prompt {
  render(words: string[]): void
  updateLetter(wordIndex: number, letterIndex: number, color: 'green' | 'red' | 'gray'): void
  scrollToWord(index: number): void
  clear(): void
}
```

#### 4.2 Input Component (`ui/input.ts`)
Handles user input:
```typescript
class Input {
  focus(): void
  clear(): void
  getValue(): string
  setValue(value: string): void
  setColor(color: 'black' | 'red'): void
  onKeydown(handler: (e: KeyboardEvent) => void): void
}
```

#### 4.3 Preferences Component (`ui/preferences.ts`)
Settings modal:
```typescript
class Preferences {
  open(): void
  close(): void
  render(settings: Settings): void
  onSettingChange(handler: (key: string, value: unknown) => void): void
}
```

#### 4.4 Keyboard Display (`ui/keyboard.ts`)
Visual keyboard:
```typescript
class Keyboard {
  render(layout: LayoutName, keyboard: KeyboardType): void
  highlightKeys(letters: string[]): void
  updateCheatsheet(level: Level, letters: string[]): void
}
```

#### 4.5 Results Component (`ui/results.ts`)
Final results display:
```typescript
class Results {
  show(score: number, accuracy: number, wpm: number): void
  hide(): void
}
```

### Phase 5: Main Application (`app.ts`) (Day 3)

Orchestrates all components:
```typescript
class TypingApp {
  private state: State;
  private events: EventBus;
  private prompt: Prompt;
  private input: Input;
  private preferences: Preferences;
  private keyboard: Keyboard;
  private results: Results;
  private timer: Timer;
  private sound: Sound;
  private storage: Storage;

  async init(): Promise<void> {
    // 1. Load settings from storage
    // 2. Initialize state
    // 3. Initialize UI components
    // 4. Set up event handlers
    // 5. Load initial words
    // 6. Render UI
  }

  private setupEventHandlers(): void {
    // Wire up events to handlers
    this.events.on('letter:typed', this.handleLetterTyped);
    this.events.on('word:complete', this.handleWordComplete);
    this.events.on('settings:change', this.handleSettingChange);
    // etc.
  }

  private handleLetterTyped(data: { letter: string; correct: boolean }): void {
    // Update state
    // Update UI
    // Play sound
    // Check for errors
  }

  private handleWordComplete(data: { word: string; correct: boolean }): void {
    // Update score
    // Load next word
    // Check for game end
  }

  reset(): void {
    // Reset state
    // Clear UI
    // Reload words
  }
}

// Initialize app
const app = new TypingApp();
app.init();
```

## Key Design Decisions

### 1. No Framework
- Vanilla TypeScript/JavaScript
- No React, Vue, Angular, etc.
- Minimal bundle size
- Full control

### 2. ES Modules
- Use `import/export` instead of script tags
- Better tree-shaking
- TypeScript support
- Modern tooling

### 3. Functional Core
- Domain logic as pure functions
- Easy to test
- No side effects
- Predictable

### 4. Event-Driven UI
- Components communicate via events
- Loose coupling
- Easy to extend
- Testable in isolation

### 5. Immutable State
- State updates create new objects
- Easier debugging
- Time-travel possible
- Predictable

### 6. TypeScript
- Type safety
- Better IDE support
- Self-documenting
- Catch errors early

## Migration Strategy

### Option A: Big Bang (Higher Risk)
1. Build new architecture in parallel
2. Test thoroughly
3. Switch over in one commit
4. **Risk**: Might miss edge cases

### Option B: Incremental (Lower Risk)
1. Build new architecture
2. Run both old and new in parallel
3. Gradually switch features
4. Remove old code when stable
5. **Risk**: Temporary complexity

### Option C: Feature Flags (Recommended)
1. Build new architecture
2. Add feature flag to switch
3. Test new version thoroughly
4. Switch flag when ready
5. Remove old code
6. **Risk**: Minimal

## Testing Strategy

### Unit Tests
- Test all pure functions
- Test state management
- Test event bus
- Target: 90%+ coverage

### Integration Tests
- Test component interactions
- Test event flow
- Test state updates
- Use existing Playwright tests

### E2E Tests
- Keep existing Playwright tests
- Add new tests for edge cases
- Test all user workflows
- Ensure 100% pass rate

## Build & Tooling

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "moduleResolution": "bundler",
    "noEmit": true
  }
}
```

### Build Process
- Use Bun (already in project)
- Type checking only (no bundling needed for ES modules)
- Or use Vite for bundling if needed

### Dependencies
- **Zero runtime dependencies**
- TypeScript for dev
- Playwright for testing
- Biome for linting/formatting

## File Size Targets

- `app.ts`: <100 lines (orchestration only)
- `core/state.ts`: <150 lines
- `core/events.ts`: <100 lines
- `domain/*.ts`: <200 lines each
- `services/*.ts`: <150 lines each
- `ui/*.ts`: <300 lines each

**Total**: ~2000-2500 lines (vs 1673 in current app.js, but better organized)

## Success Criteria

- [ ] All existing tests pass
- [ ] Zero runtime dependencies
- [ ] TypeScript strict mode
- [ ] <100 lines in main app.ts
- [ ] All domain logic is pure functions
- [ ] Event-driven architecture
- [ ] Immutable state updates
- [ ] Modern ES modules
- [ ] Maintainable and testable
- [ ] No functionality regressions

## Comparison: Refactor vs Rewrite

### Refactor (from REFACTORING_PLAN.md)
- **Time**: 3-5 days
- **Risk**: Low (incremental)
- **Complexity**: Medium (coordinate migrations)
- **Result**: Cleaner but still legacy patterns

### Rewrite (this plan)
- **Time**: 3-5 days
- **Risk**: Medium (bigger changes)
- **Complexity**: Low (clean slate)
- **Result**: Modern, maintainable architecture

### Recommendation
- **If tests are comprehensive**: Rewrite is viable
- **If time is limited**: Refactor is safer
- **If you want modern architecture**: Rewrite is better
- **If you want minimal risk**: Refactor is safer

## Unresolved Questions

1. **Build tool**: Use Bun directly or add Vite for bundling?
2. **Module format**: ES modules in browser or bundle?
3. **Type checking**: Runtime validation or compile-time only?
4. **State persistence**: How much to persist to localStorage?
5. **Error handling**: How to handle edge cases gracefully?

## Next Steps

1. Review and approve architecture
2. Set up TypeScript project structure
3. Implement core infrastructure (Phase 1)
4. Implement domain logic (Phase 2)
5. Implement services (Phase 3)
6. Implement UI components (Phase 4)
7. Wire up main app (Phase 5)
8. Test thoroughly
9. Migrate (Option C: Feature flags)
10. Remove old code

