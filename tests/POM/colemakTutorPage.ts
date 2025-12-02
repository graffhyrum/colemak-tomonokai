import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { PageObject } from "./types.ts";
import { createSelectComponent } from "./components/selectComponent.ts";
import { createInputComponent } from "./components/inputComponent.ts";
import { createDisplayComponent } from "./components/displayComponent.ts";
import { createLinkComponent } from "./components/linkComponent.ts";
import { createKeyboardComponent } from "./components/keyboardComponent.ts";

export type ColemakTutorActions = {
  layout: {
    selectOption: (value: string) => Promise<void>;
  };
  keyboard: {
    selectOption: (value: string) => Promise<void>;
  };
  input: {
    fill: (text: string) => Promise<void>;
    clear: () => Promise<void>;
    focus: () => Promise<void>;
  };
  settings: {
    wordLimit: {
      fill: (text: string) => Promise<void>;
      clear: () => Promise<void>;
      focus: () => Promise<void>;
    };
    timeLimit: {
      fill: (text: string) => Promise<void>;
      clear: () => Promise<void>;
      focus: () => Promise<void>;
    };
    customKey: {
      fill: (text: string) => Promise<void>;
      clear: () => Promise<void>;
      focus: () => Promise<void>;
    };
  };
  reset: {
    tab: () => Promise<void>;
    escape: () => Promise<void>;
  };
  links: {
    github: {
      click: () => Promise<void>;
    };
    petition: {
      click: () => Promise<void>;
    };
  };
};

export type ColemakTutorAssertions = {
  layout: {
    hasValue: (expectedValue: string) => Promise<void>;
    hasOptionsCount: (expectedCount: number) => Promise<void>;
    optionExists: (value: string) => Promise<void>;
  };
  keyboard: {
    hasValue: (expectedValue: string) => Promise<void>;
    hasOptionsCount: (expectedCount: number) => Promise<void>;
    optionExists: (value: string) => Promise<void>;
  };
  input: {
    hasValue: (expectedValue: string) => Promise<void>;
    isAttached: () => Promise<void>;
    isVisible: () => Promise<void>;
  };
  settings: {
    wordLimit: {
      hasValue: (expectedValue: string) => Promise<void>;
      isAttached: () => Promise<void>;
      isVisible: () => Promise<void>;
    };
    timeLimit: {
      hasValue: (expectedValue: string) => Promise<void>;
      isAttached: () => Promise<void>;
      isVisible: () => Promise<void>;
    };
    customKey: {
      hasValue: (expectedValue: string) => Promise<void>;
      isAttached: () => Promise<void>;
      isVisible: () => Promise<void>;
    };
  };
  display: {
    score: {
      containsText: (expectedText: string) => Promise<void>;
      isVisible: () => Promise<void>;
    };
    time: {
      containsText: (expectedText: string) => Promise<void>;
      isVisible: () => Promise<void>;
    };
  };
  links: {
    github: {
      hasHref: (expectedHref: string) => Promise<void>;
      isVisible: () => Promise<void>;
    };
    petition: {
      hasHref: (expectedHref: string) => Promise<void>;
      isVisible: () => Promise<void>;
    };
  };
  page: {
    title: (expected: RegExp | string) => Promise<void>;
    header: (expected: string) => Promise<void>;
  };
};

export function createColemakTutorPage(page: Page): PageObject & {
  actions: ColemakTutorActions;
  assertions: ColemakTutorAssertions;
} {
  // Component instances
  const layoutSelect = createSelectComponent(page, "#layout");
  const keyboardSelect = createSelectComponent(page, "#keyboard");
  const userInput = createInputComponent(page, "#userInput");
  const wordLimitInput = createInputComponent(page, ".wordLimitModeInput");
  const timeLimitInput = createInputComponent(page, ".timeLimitModeInput");
  const customKeyInput = createInputComponent(page, "#customUIKeyInput");
  const scoreDisplay = createDisplayComponent(page, "#scoreText");
  const timeDisplay = createDisplayComponent(page, "#timeText");
  const githubLink = createLinkComponent(page, 'a[href*="github.com"]');
  const petitionLink = createLinkComponent(page, 'a[href*="change.org"]');
  const keyboard = createKeyboardComponent(page);

  return {
    page,
    goto: async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    },
    actions: {
      layout: layoutSelect.actions as ColemakTutorActions['layout'],
      keyboard: keyboardSelect.actions as ColemakTutorActions['keyboard'],
      input: userInput.actions as ColemakTutorActions['input'],
      settings: {
        wordLimit: wordLimitInput.actions as ColemakTutorActions['settings']['wordLimit'],
        timeLimit: timeLimitInput.actions as ColemakTutorActions['settings']['timeLimit'],
        customKey: customKeyInput.actions as ColemakTutorActions['settings']['customKey'],
      },
      reset: {
        tab: keyboard.actions.tab as ColemakTutorActions['reset']['tab'],
        escape: keyboard.actions.escape as ColemakTutorActions['reset']['escape'],
      },
      links: {
        github: githubLink.actions as ColemakTutorActions['links']['github'],
        petition: petitionLink.actions as ColemakTutorActions['links']['petition'],
      },
    },
    assertions: {
      layout: layoutSelect.assertions as ColemakTutorAssertions['layout'],
      keyboard: keyboardSelect.assertions as ColemakTutorAssertions['keyboard'],
      input: userInput.assertions as ColemakTutorAssertions['input'],
      settings: {
        wordLimit: wordLimitInput.assertions as ColemakTutorAssertions['settings']['wordLimit'],
        timeLimit: timeLimitInput.assertions as ColemakTutorAssertions['settings']['timeLimit'],
        customKey: customKeyInput.assertions as ColemakTutorAssertions['settings']['customKey'],
      },
      display: {
        score: scoreDisplay.assertions as ColemakTutorAssertions['display']['score'],
        time: timeDisplay.assertions as ColemakTutorAssertions['display']['time'],
      },
      links: {
        github: githubLink.assertions as ColemakTutorAssertions['links']['github'],
        petition: petitionLink.assertions as ColemakTutorAssertions['links']['petition'],
      },
      page: {
        title: async (expected: RegExp | string) => {
          await expect(page).toHaveTitle(expected);
        },
        header: async (expected: string) => {
          await expect(page.locator("h1")).toContainText(expected);
        },
      },
    },
  } as const;
}

export const createColemakTutor = createColemakTutorPage;
