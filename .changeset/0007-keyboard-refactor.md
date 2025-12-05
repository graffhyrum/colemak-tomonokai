---
"colemak-tomonokai": minor
---

Implement modular keyboard template system with proper keyboard layout definitions, template-based rendering, and improved modifier key handling. Refactor TypingTutorFactory to use new template system and update CSS classes to match archive structure.

BREAKING CHANGE: Keyboard DOM structure updated from .keyboard to .cheatsheet
BREAKING CHANGE: Active key class changed from .active to .currentLevelKeys