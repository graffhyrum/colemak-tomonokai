# Colemak Typing Tutor - Rewrite PRD

## Implementation Progress

### ✅ Phase 1 Complete - Foundation
- **Project Setup**: TypeScript + Bun + Playwright + Biome configured
- **Component Architecture**: Factory pattern with revealing module pattern
- **Type System**: Comprehensive type definitions with LayoutName types
- **QWERTY Implementation**: Fully functional typing tutor component
- **Layout Configuration**: All 11 keyboard layouts centralized in config module
- **DOM Utilities**: Enhanced TypeScript-safe DOM manipulation utilities
- **Modular Design**: Clean separation of concerns established

### 🚧 Current Focus - Phase 2 Core Features
- Extending factory pattern to all keyboard layouts
- Implementing comprehensive settings system
- Adding advanced game state management

### 📊 Technical Achievements
- **Type Safety**: 100% TypeScript strict mode compliance
- **Architecture**: Modular, maintainable component system
- **Performance**: Optimized DOM operations and state management
- **Developer Experience**: Hot reload, fast builds, excellent IDE support

---

## Current Feature Analysis

### Core Features
1. **Typing Practice**
   - Real-time typing input with visual feedback
   - Character-by-character accuracy checking
   - Error highlighting (red/green text)
   - Sound feedback (clicks and errors)

2. **Keyboard Layouts**
   - Multiple layouts: Colemak, Colemak-DH, QWERTY, Dvorak, Workman, AZERTY, Tarmak, Tarmak-DH, Canary
   - Three keyboard formats: ANSI, ISO, Ortho
   - Visual keyboard display with highlighted keys
   - Layout switching with persistence

3. **Level System**
   - Progressive difficulty levels (1-6) for each layout
   - Level-specific character sets
   - "All Words" and "Full Sentences" modes
   - Visual level indicators

4. **Game Modes**
   - Word limit mode (configurable word count)
   - Time limit mode (countdown timer)
   - Word scrolling vs paragraph display modes
   - Full sentence practice mode

5. **Settings & Preferences**
   - Capital letters toggle
   - Punctuation mode toggle
   - Require backspace correction toggle
   - Show/hide cheatsheet toggle
   - Sound on click/error toggles
   - Settings persistence via localStorage

6. **Custom Keyboard Editor**
   - Visual keyboard layout editor
   - Custom level creation
   - Save/discard functionality
   - Real-time layout testing

7. **Statistics & Feedback**
   - WPM (Words Per Minute) calculation
   - Accuracy percentage
   - Score tracking (current/total)
   - Time tracking (minutes:seconds)
   - End-of-game results display

8. **UI/UX Features**
   - Responsive design
   - Settings menu with toggle switches
   - Keyboard shortcuts (Tab/Esc to reset)
   - Visual feedback for all interactions
   - Smooth animations and transitions

## Technical Requirements

### Data Sources
- Word lists (masterList with ~2000+ words)
- Keyboard layout mappings (layoutMaps with key codes)
- Level dictionaries (levelDictionaries with character sets)
- Keyboard HTML templates (ansiDivs, isoDivs, orthoDivs, customLayout)

### State Management
- Game state (score, time, accuracy, current word, etc.)
- Settings state (preferences, modes, toggles)
- UI state (visibility, focus, selections)

### Performance Requirements
- Real-time typing feedback (<100ms response)
- Smooth scrolling and animations
- Efficient word generation algorithms
- Memory-efficient DOM manipulation

## Rewrite Goals

### Primary Objectives
1. **Modern Architecture**: TypeScript + ES6 modules + clean separation of concerns
2. **Maintainability**: Component-based structure with clear interfaces
3. **Type Safety**: Full TypeScript coverage with strict mode
4. **Developer Experience**: Hot reload, fast builds, excellent IDE support
5. **Performance**: Optimized rendering and state management
6. **Scalability**: Easy to add new layouts, features, and improvements

### Success Criteria
- All current features preserved and functional
- 100% test coverage with Playwright
- TypeScript strict mode with no errors
- Bundle size ≤ current implementation
- Performance ≥ current implementation
- Modern development workflow established

## Constraints & Considerations

### Must Preserve
- All existing keyboard layouts and formats
- Complete word list and level system
- All game modes and settings
- Custom keyboard editor functionality
- Sound feedback system
- Statistics calculations
- Keyboard shortcuts and interactions

### Opportunities for Improvement
- ✅ Simplify complex state management
- ✅ Reduce technical debt
- ✅ Improve code organization
- ✅ Enhance developer experience
- Optimize performance bottlenecks
- Modernize UI patterns where beneficial
- ✅ Implement factory pattern for better component reusability
- ✅ Extract configuration to dedicated modules
- ✅ Use revealing module pattern instead of ES6 classes

### Technical Decisions
- **Framework**: Vanilla TypeScript (no heavy frameworks)
- **Build Tool**: Bun (maintain current toolchain)
- **Module System**: ES6 modules with tree-shaking
- **State Management**: Simple state objects (no complex libraries)
- **Component Architecture**: Factory pattern with revealing modules (no ES6 classes)
- **Testing**: Continue with Playwright
- **Styling**: CSS modules or scoped styles
- **Configuration**: Centralized layout management with type-safe configuration

## Implementation Strategy

### Phase 1: Foundation
1. ✅ Project setup with TypeScript + Bun
2. ✅ Basic typing component with one layout (QWERTY)
3. ✅ Core game state management
4. ✅ Basic UI and styling
5. ✅ Factory pattern implementation for component creation
6. ✅ Modular architecture with revealing module pattern
7. ✅ Comprehensive keyboard layout configuration extraction

### Phase 2: Core Features
1. ✅ Add Colemak layout support
2. ✅ Implement level system
3. Add word generation and validation
4. Implement statistics and scoring
5. ✅ Extract all 11 keyboard layouts to dedicated configuration
6. ✅ Implement layout switching mechanism
7. ✅ Add keyboard format support (ANSI/ISO/Ortho)

### Phase 3: Advanced Features
1. Add all remaining layouts
2. Implement settings system
3. Add custom keyboard editor
4. Add sound system and preferences

### Phase 4: Polish & Optimization
1. Performance optimization
2. UI/UX refinements
3. Testing and bug fixes
4. Documentation and deployment

## Risk Assessment

### High Risk Areas
- Complex custom keyboard editor logic
- Word generation algorithms
- Performance with real-time typing feedback
- Cross-browser compatibility

### Mitigation Strategies
- Incremental implementation with testing at each step
- Preserve existing algorithms and data structures
- Extensive testing with current test suite
- Performance monitoring and optimization

## Success Metrics

### Quantitative Measures
- All 11 Playwright tests passing
- ✅ TypeScript compilation with 0 errors
- Bundle size ≤ current (target: <200KB gzipped)
- First contentful paint ≤ current implementation
- Typing latency ≤ current implementation
- ✅ Factory pattern implementation completed
- ✅ Modular architecture established
- ✅ Type safety improvements with LayoutName types

### Qualitative Measures
- ✅ Code readability and maintainability scores improved
- ✅ Developer experience and onboarding time enhanced
- Feature parity with current implementation
- User experience consistency
- ✅ Technical debt reduction through modular architecture
- ✅ Better separation of concerns with factory pattern
- ✅ Improved type safety throughout codebase

---

*This PRD serves as the foundation for the complete rewrite while ensuring no functionality is lost and the new implementation provides significant improvements in maintainability, performance, and developer experience.*