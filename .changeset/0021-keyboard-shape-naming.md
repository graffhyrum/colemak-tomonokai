---
"colemak-tomonokai": patch
---

Rename KeyboardFormat to KeyboardShape for better naming clarity. The physical shape and arrangement of keys (ansi, iso, ortho) is now referred to as "keyboardShape" to distinguish it from the key-to-glyph mapping which remains "keyboardLayout". Updated all related type definitions, variable names, and function parameters throughout the codebase.