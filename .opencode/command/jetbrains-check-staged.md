---
description: Check staged files for problems using IntelliJ inspections
agent: build
---

# JetBrains Check Staged Files

Analyze all staged files for errors and warnings using jetbrains_get_file_problems tool.

## Process

1. Get staged files with !`git diff --cached --name-only`
2. If no staged files, output "No staged files to check"
3. For each staged file:
   - Call jetbrains_get_file_problems with errorsOnly=false
   - If successful, output filename and any problems found
   - If file not analyzable, output warning and skip
4. Summarize total files checked and problems found
5. Begin RCA if any problems detected

## Usage

jetbrains-check-staged

No arguments required. Operates on current git staging area.

## Output

For each file:
- "file.js: OK" if no problems
- "file.js: 2 errors, 1 warning" with details
- "file.js: SKIPPED - not analyzable"

Final summary: "Checked X files, found Y total problems"
