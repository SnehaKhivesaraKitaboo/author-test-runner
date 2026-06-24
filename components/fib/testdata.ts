/// <reference types="cypress" />
// =============================================================================
// Fill in the Blank (FIB) — reusable test data.
// =============================================================================

export const FIB_DATA = {
  header: 'FIB Automation Header',
  instruction: 'Fill in the blanks below.',
  sentence: 'The capital of France is.',
  feedbackCorrect: 'Well done!',
  feedbackIncorrect: 'Try again.',
  dropdownOption: 'Paris',
  /** Script-injection payload for sanitisation checks (header/sentence). */
  scriptInjection: '<script>window.__fibXss = true;</script>Safe Header',
} as const;
