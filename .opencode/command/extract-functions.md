---
description: Extract large functions from JavaScript files into separate modules
agent: build
---

Extract all functions longer than $2 lines (default 10) from file $1,
with maximum $3 closure variables (default 3).

For each candidate function, make a subagent and instruct it to:
1. Analyze dependencies and convert closures to parameters
2. Create new module file in same directory
3. Add script tag to index.html
4. Remove function from original file

Skips nested functions with high coupling. Validates with `bun run vet`.

Arguments:
- $1: Target file path (required)
- $2: Line threshold (optional, default: 10)
- $3: Max closure variables (optional, default: 3)
