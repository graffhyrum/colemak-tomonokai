# Keyboard Display Implementation Plan

## Overview
Fix the keyboard display to correctly show layout-mapped characters with proper level-based highlighting and shift layer support, matching reference images.

## Requirements
- **Keyboard Shape** (ANSI/ISO/Ortho): Determines physical key outline/structure
- **Layout** (QWERTY/Colemak/etc.): Maps physical positions to displayed characters
- **Level**: Enables keys cumulatively (Level 1 + Level 2 + ... + current level)
- **Shift Layer**: Display updates when Shift held, returns to base when released
- **Empty Keys**: Completely blank for unmapped keys
- **Level 7**: All keys highlighted as active
- **Transitions**: Instant (no animations)

## Technical Architecture

### 1. Character Mapping System (`src/main.ts`)
```typescript
function getKeyboardCharacters(
  keyboardFormat: KeyboardFormat,
  layoutName: LayoutName,
  useShiftLayer: boolean = false
): Array<Array<{ keyId: string; character: string; isEmpty: boolean }>>
```
- Maps physical key positions through `LAYOUT_MAPS[layoutName]`
- Returns character info for each physical key position
- Handles shift layer selection

### 2. Level-Based Highlighting Logic (`src/components/TypingTutorFactory.ts`)
```typescript
function getEnabledLetters(layoutName: LayoutName, currentLevel: Level): string
function getKeyHighlighting(mappedChar: string, layoutName: LayoutName, currentLevel: Level): {
  isActive: boolean;
  isHomeRow: boolean;
  isInactive: boolean;
}
```
- Accumulates letters from levels 1 through current level
- Determines key styling based on level progression

### 3. Shift State Integration
- Add `shiftHeld: boolean` to GameState
- Track shift press/release events
- Re-render keyboard on shift state changes

## Implementation Phases

### Phase 1: Core Character Mapping
1. Create `getKeyboardCharacters()` function in `main.ts`
2. Update `createTypingTutor()` to pass character data
3. Modify `TypingTutorFactory.ts` to accept character mapping

### Phase 2: Level-Based Highlighting
1. Implement level accumulation logic
2. Update highlighting rules:
   - Active: Character in current level specifically
   - Home Row: Character in level 1
   - Inactive: Character in enabled levels but not current
   - Level 7: All mapped keys active

### Phase 3: Shift Layer Support
1. Add shift state tracking to game state
2. Update keyboard event handlers
3. Trigger re-rendering on shift state changes

### Phase 4: Integration & Testing
1. Update layout switching logic
2. Test against reference images
3. Verify level progression highlighting
4. Test shift layer display updates

## Expected Behavior Examples

### Colemak ANSI Level 1 (Base Layer)
```
q w f p g j l u y ;
a r s t d h n e i o
z x c v b k m , . /
```
- Keys `a,r,s,t,n,e,i,o` highlighted as active

### Colemak ANSI Level 1 (Shift Held)
```
Q W F P G J L U Y :
A R S T D H N E I O
Z X C V B K M < > ?
```
- Same highlighting, characters from shift layer

### Colemak ANSI Level 2
```
q w f p g j l u y ;
a r s t d h n e i o
z x c v b k m , . /
```
- Keys `a,r,s,t,n,e,i,o,d,h` highlighted (Levels 1+2)

## Files to Modify
1. `src/main.ts` - Character mapping function, tutor creation updates
2. `src/components/TypingTutorFactory.ts` - Keyboard rendering, highlighting, shift handling
3. `src/types/index.ts` - Add shift state to GameState

## Testing Strategy
- Visual verification against reference images
- Layout switching maintains correct characters
- Level progression highlighting updates correctly
- Shift layer toggles display appropriately
- Empty keys remain blank across all layouts</content>
<parameter name="filePath">docs/keyboard-display-implementation-plan.md
