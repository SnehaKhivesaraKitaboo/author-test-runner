/// <reference types="cypress" />
// =============================================================================
// Extended Response test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const ER_DATA = {
  question: 'Explain the causes of the French Revolution.',
  shortAnswer: 'A short model answer.',
  longAnswer:
    'A longer model answer that spans multiple sentences to verify that the long ' +
    'answer textarea accepts and retains multi-line content during authoring.',
  tags: 'history,revolution,france',
  altText: 'Descriptive alt text for the prompt image used by screen readers.',
  /** 2001 chars to exercise the 2000 alt-text limit. */
  altTextOverLimit: 'a'.repeat(2001),

  scriptInjection: '<script>alert(1)</script>Safe Question',
} as const;
