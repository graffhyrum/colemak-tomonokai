import { $ } from "bun";

// wrapping in the bun shell allows arkenv to load correctly.
await $`bunx playwright test`;
