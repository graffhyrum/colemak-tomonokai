# Refactoring Plan: logic/app.js

## Overview
`app.js` is 1673 lines with poor organization, duplicate logic, and mixed concerns. This plan breaks it into focused modules following existing patterns.

## Goals
- Reduce `app.js` to <300 lines (orchestration only)
- Eliminate duplicate logic with existing components
- Migrate global variables to StateManager
- Extract services for timer, layout, custom keyboard, validation
- Maintain backward compatibility during transition

## Current Issues

### 1. Duplicate Logic
- **Word completion**: `handleWordCompletion()` (app.js:893) vs `WordCompleter.handleCompletion()` (typing/wordCompleter.js)
- **Reset logic**: `reset()` (app.js:1099) vs `GameController.resetGameState()` (typing/gameController.js)
- **Preference handlers**: Duplicated between app.js (lines 215-454) and `PreferenceMenu` component
- **Custom keyboard UI**: Duplicated between app.js (lines 478-846) and `KeyboardDisplay` component
- **Sound wrappers**: `playClickSound()`, `playErrorSound()` (app.js:462-470) are thin wrappers

### 2. Global Variables (Lines 4-50)
24+ global variables that should use StateManager:
- Game state: `promptOffset`, `score`, `seconds`, `minutes`, `gameOn`, `correct`, `errors`, etc.
- Layout state: `currentLayout`, `currentKeyboard`, `keyboardMap`, `letterDictionary`
- Mode flags: `onlyLower`, `fullSentenceModeEnabled`, `timeLimitMode`, etc.

### 3. Mixed Concerns
- Initialization (start, init)
- Event listeners (scattered throughout)
- Game logic (reset, word completion, accuracy)
- UI management (layout, custom keyboard)
- Timer management
- Word generation utilities

## Refactoring Steps

### Phase 1: Extract Timer Service
**Goal**: Move timer logic to dedicated service

**Create**: `logic/services/timerService.js`
- Extract timer interval logic (app.js:181-202)
- Extract `resetTimeText()` (app.js:1548)
- Handle count-up and count-down modes
- Update StateManager for time state
- Expose: `start()`, `stop()`, `reset()`, `getFormattedTime()`

**Remove from app.js**:
- Lines 181-202 (timer interval)
- Lines 1548-1542 (resetTimeText)

**Update app.js**:
- Replace timer interval with `TimerService.start()`
- Replace `resetTimeText()` calls with `TimerService.getFormattedTime()`

---

### Phase 2: Extract Layout Manager Service
**Goal**: Centralize layout-related operations

**Create**: `logic/services/layoutManager.js`
- Extract `updateLayoutUI()` (app.js:512)
- Extract `updateLayoutNameDisplay()` (app.js:520)
- Extract `updateLevelLabelsForLayout()` (app.js:494)
- Extract `updateKeyboardReferences()` (app.js:505)
- Extract `setupCustomLayoutUI()` (app.js:478)
- Handle layout/keyboard change coordination

**Remove from app.js**:
- Lines 478-541 (layout UI functions)

**Update app.js**:
- Replace layout functions with `LayoutManager.updateUI()`
- Replace layout change listener to use `LayoutManager.handleLayoutChange()`

---

### Phase 3: Extract Custom Keyboard Service
**Goal**: Move custom keyboard editing to service

**Create**: `logic/services/customKeyboardService.js`
- Extract custom keyboard functions (app.js:584-846):
  - `startCustomKeyboardEditing()`
  - `selectInputKey()`
  - `removeKeyFromLevels()`
  - `loadCustomLayout()`
  - `loadCustomLevels()`
  - `switchSelectedInputKey()`
  - `clearSelectedInput()`
  - `isValidCustomKeyInput()`
  - `handleCustomKeyAddition()`
  - `handleCustomKeyDeletion()`
  - `handleCustomKeyNavigation()`
- Coordinate with `KeyboardDisplay` component
- Manage initial state snapshots

**Remove from app.js**:
- Lines 584-846 (custom keyboard functions)
- Lines 575-635 (custom keyboard listeners)

**Update app.js**:
- Delegate custom keyboard operations to service
- Keep minimal orchestration

---

### Phase 4: Extract Validation Service Extensions
**Goal**: Move validation logic from app.js

**Enhance**: `logic/services/validationService.js` (if exists) or create new
- Extract `checkAnswer()` (app.js:1319)
- Extract `checkAnswerToIndex()` (app.js:866)
- Extract validation utilities

**Remove from app.js**:
- Lines 866-873 (checkAnswerToIndex)
- Lines 1319-1324 (checkAnswer)

**Update app.js**:
- Use `ValidationService.checkAnswer()` and `ValidationService.checkAnswerToIndex()`

---

### Phase 5: Extract Word Generation Utilities
**Goal**: Move word generation helpers to service

**Create**: `logic/services/wordGenerationService.js`
- Extract `generateLine()` (app.js:1428)
- Extract `generateSentenceLine()` (app.js:1444)
- Extract `getPosition()` (app.js:1432)
- Extract `selectValidWord()` (app.js:1471)
- Extract `shouldUseCircuitBreakerFallback()` (app.js:1487)
- Extract `addWordToLine()` (app.js:1491)
- Extract `handleCircuitBreakerLogic()` (app.js:1502)
- Extract `removeIncludedLetters()` (app.js:1520)
- Extract `containsUpperCase()` (app.js:1529)

**Remove from app.js**:
- Lines 1428-1530 (word generation utilities)

**Update app.js**:
- Use `WordGenerationService.generateLine()` and related methods

---

### Phase 6: Migrate Global Variables to StateManager
**Goal**: Replace all global variables with StateManager

**Update StateManager** (if needed):
- Ensure all game state variables are in StateManager
- Add any missing state keys

**Update app.js**:
- Remove global variable declarations (lines 4-50)
- Replace all direct variable access with `StateManager.get()` / `StateManager.set()`
- Update function signatures to use StateManager instead of globals

**Affected functions**:
- All functions that read/write global state
- Timer functions
- Reset function
- Word completion functions
- Accuracy checking functions

---

### Phase 7: Remove Duplicate Preference Menu Logic
**Goal**: Use PreferenceMenu component exclusively

**Remove from app.js**:
- Lines 215-249 (openMenu, closeMenu, preference menu listeners)
- Lines 251-454 (all preference toggle handlers)
- Lines 266-304 (UI toggle functions - already in PreferenceMenu)

**Update app.js**:
- Remove duplicate event listeners
- Ensure PreferenceMenu.initialize() is called in start()
- Remove direct DOM manipulation for preferences

**Note**: PreferenceMenu component already handles all preference logic. Just remove duplicates.

---

### Phase 8: Remove Duplicate Word Completion Logic
**Goal**: Use WordCompleter component exclusively

**Remove from app.js**:
- Lines 893-922 (handleWordCompletion)
- Lines 1328-1375 (handleCorrectWord)

**Update app.js**:
- Route word completion to `TypingArea.handleInput()` or `WordCompleter.handleCompletion()`
- Remove duplicate completion logic

---

### Phase 9: Remove Duplicate Reset Logic
**Goal**: Use GameController.resetGameState() and consolidate

**Analyze**:
- Compare `reset()` (app.js:1099) with `GameController.resetGameState()` (typing/gameController.js)
- Identify unique logic in app.js reset() that should be preserved
- Move prompt initialization to PromptService or WordManager

**Create/Enhance**: `logic/services/gameInitializationService.js`
- Extract prompt initialization from `reset()` (app.js:1154-1268)
- Extract word loading logic (time limit vs word limit modes)
- Coordinate with WordPool, WordManager, PromptService

**Update app.js**:
- Replace `reset()` with orchestration:
  - `GameController.resetGameState()`
  - `GameInitializationService.initializePrompt()`
  - `TimerService.reset()`
  - UI updates

**Remove from app.js**:
- Lines 1099-1268 (reset function - move logic to services)

---

### Phase 10: Remove Duplicate Custom Keyboard UI Logic
**Goal**: Use KeyboardDisplay component exclusively

**Analyze**:
- Compare app.js custom keyboard functions with KeyboardDisplay component
- Identify any unique logic in app.js

**Update app.js**:
- Remove duplicate custom keyboard event listeners
- Ensure KeyboardDisplay.initialize() is called
- Delegate all custom keyboard operations to KeyboardDisplay

**Remove from app.js**:
- Any remaining custom keyboard UI code if KeyboardDisplay handles it

---

### Phase 11: Simplify Sound Functions
**Goal**: Remove thin wrappers

**Remove from app.js**:
- Lines 462-470 (playClickSound, playErrorSound)

**Update app.js**:
- Replace `playClickSound()` calls with `SoundService.playClickSound()` (with state check)
- Replace `playErrorSound()` calls with `SoundService.playErrorSound()` (with state check)
- Or: Update SoundService to check state internally

---

### Phase 12: Extract Prompt HTML Conversion
**Goal**: Move HTML generation to PromptService

**Enhance**: `logic/services/promptService.js`
- Extract `convertLineToHTML()` (app.js:1296)
- Extract `addLineToPrompt()` (app.js:1279) - may already exist
- Manage `idCount` state

**Remove from app.js**:
- Lines 1279-1317 (addLineToPrompt, convertLineToHTML)

**Update app.js**:
- Use `PromptService.addLineToPrompt()` and `PromptService.convertLineToHTML()`

---

### Phase 13: Extract Line Deletion Logic
**Goal**: Move to appropriate service

**Analyze**:
- `handleLineDeletion()` (app.js:875) - word scrolling mode line management
- Determine if this belongs in PromptService, WordManager, or new service

**Create/Enhance**: Appropriate service
- Extract line deletion logic
- Handle word scrolling vs paragraph mode differences

**Remove from app.js**:
- Lines 875-891 (handleLineDeletion)

**Update app.js**:
- Delegate to appropriate service

---

### Phase 14: Extract Accuracy Checking
**Goal**: Move to AccuracyChecker component (may already exist)

**Analyze**:
- `handleAccuracyChecking()` (app.js:942)
- Check if AccuracyChecker component already handles this

**Update app.js**:
- Route accuracy checking to `AccuracyChecker` or `TypingArea.handleInput()`
- Remove duplicate logic

**Remove from app.js**:
- Lines 942-1042 (handleAccuracyChecking)

---

### Phase 15: Extract Initialization Logic
**Goal**: Create AppInitializer service

**Create**: `logic/services/appInitializer.js`
- Extract `start()` function (app.js:94) - one-time initialization
- Extract `init()` function (app.js:171) - reset/refresh initialization
- Coordinate service initialization
- Set up initial UI state

**Remove from app.js**:
- Lines 94-166 (start function)
- Lines 171-176 (init function)

**Update app.js**:
- Replace with `AppInitializer.initialize()` and `AppInitializer.refresh()`

---

### Phase 16: Clean Up Remaining app.js
**Goal**: Final cleanup and organization

**Structure remaining app.js**:
1. Service imports/initialization
2. Main initialization call
3. Event listener setup (minimal - delegate to components)
4. Public API exports (for backward compatibility)

**Remove**:
- All extracted functions
- Duplicate event listeners
- Direct DOM manipulation (use services/components)

**Keep**:
- Minimal orchestration
- Backward compatibility exports
- Service coordination

---

### Phase 17: Update Event Listeners
**Goal**: Centralize event listener setup

**Create**: `logic/services/eventService.js` or enhance existing
- Move all event listener setup from app.js
- Coordinate between components
- Handle global events (escape key, etc.)

**Update app.js**:
- Minimal event listener setup
- Delegate to EventService or components

---

### Phase 18: Testing & Validation
**Goal**: Ensure all tests pass

**Tasks**:
- Run `bun run vet` after each phase
- Run `bun run test` after each phase
- Fix any regressions immediately
- Update tests if API changes

---

## File Structure After Refactoring

```
logic/
├── app.js (<300 lines - orchestration only)
├── services/
│   ├── timerService.js (NEW)
│   ├── layoutManager.js (NEW)
│   ├── customKeyboardService.js (NEW)
│   ├── wordGenerationService.js (NEW)
│   ├── gameInitializationService.js (NEW)
│   ├── appInitializer.js (NEW)
│   ├── eventService.js (NEW or enhanced)
│   ├── validationService.js (enhanced)
│   ├── promptService.js (enhanced)
│   └── [existing services...]
├── components/
│   ├── PreferenceMenu.js (already exists - remove duplicates from app.js)
│   ├── KeyboardDisplay.js (already exists - remove duplicates from app.js)
│   └── typing/ (already exists - use these instead of app.js logic)
└── core/
    └── stateManager.js (enhanced if needed)
```

## Migration Strategy

### Backward Compatibility
- Keep global function exports where tests/other code depend on them
- Gradually migrate callers to use services directly
- Use adapter pattern if needed

### Incremental Approach
- Complete one phase at a time
- Test after each phase
- Commit after each successful phase
- Roll back if tests fail

### Testing Strategy
- Run full test suite after each phase
- Add integration tests for new services
- Ensure zero regressions

## Success Criteria

- [ ] app.js reduced to <300 lines
- [ ] All duplicate logic removed
- [ ] All global variables migrated to StateManager
- [ ] All tests passing (`bun run vet`)
- [ ] No functionality regressions
- [ ] Code follows existing patterns (revealing module, camelCase services, etc.)
- [ ] Services are focused and testable

## Recommendation: Hybrid Approach

After analysis, **refactoring is safer than rewriting**, but we should be **aggressive** rather than incremental:

### Why Refactor (Not Rewrite):
1. ✅ **Tests exist and pass** - rewriting risks breaking everything
2. ✅ **Services/components already extracted** - foundation is good
3. ✅ **Backward compatibility needed** - app.js functions are dependencies
4. ✅ **Incremental is safer** - can test after each change

### Why Aggressive (Not 18 Phases):
1. ⚠️ **Many components depend on app.js globals** - need coordinated migration
2. ⚠️ **Duplicate logic creates confusion** - remove quickly
3. ⚠️ **18 phases is too slow** - risk of losing momentum

### Proposed Strategy: 3-Phase Aggressive Refactor

#### Phase 1: Extract & Migrate State (1-2 days)
- Extract all services (timer, layout, custom keyboard, word generation)
- Migrate ALL globals to StateManager
- Update StateManager getters/setters
- **Test**: Ensure no functionality breaks

#### Phase 2: Remove Duplicates & Update Components (1-2 days)
- Remove duplicate logic (word completion, reset, preferences, custom keyboard)
- Update MainGameController to use StateManager instead of globals
- Update all components to use StateManager
- **Test**: All tests must pass

#### Phase 3: Rewrite Orchestration Layer (1 day)
- Rewrite app.js from scratch as clean orchestrator (<200 lines)
- Wire up services/components
- Maintain backward compatibility exports
- **Test**: Full test suite

### Alternative: Full Rewrite (Higher Risk)
If you want to start fresh:
- **Pros**: Clean architecture, no legacy baggage
- **Cons**: High risk, might miss edge cases, tests may break
- **Time**: 3-5 days + debugging
- **Recommendation**: Only if you have comprehensive test coverage

## Unresolved Questions

1. Should `idCount` be managed by PromptService or StateManager? → **StateManager** (it's game state)
2. Are there any app.js functions that other files directly import/call? → **Yes**: `convertLineToHTML`, `updateScoreText`, `resetTimeText`, `createTestSets` are passed to MainGameController
3. Should we create a migration script to update all callers at once? → **No**, update incrementally with tests
4. What's the priority order if we need to do this incrementally? → **State migration first**, then duplicate removal, then orchestration rewrite

