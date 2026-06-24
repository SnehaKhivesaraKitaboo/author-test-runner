/// <reference types="cypress" />
// =============================================================================
// Situation Header (situationbox) test data — reusable strings/values
// (no hardcoded literals in the spec).
// =============================================================================

export const SH_DATA = {
  /** Plain header/scenario text typed into the contenteditable text editor. */
  headerText:
    'A train leaves Station A travelling at 60 km/h. Read the scenario above ' +
    'carefully before answering the questions that follow.',
  shortHeader: 'Read the situation below.',
  /** Used to verify multiple paragraphs are preserved (Enter inside the RTE). */
  multiParagraph: 'First paragraph.\nSecond paragraph.',
  /** LaTeX/math payload for math-render cases (verified in Reader — deferred). */
  mathEquation: '$$\\sqrt{x^2 + y^2}$$',
  /** Descriptive alt text for the fixed arrow icon (settings panel). */
  altText: 'Situation header arrow icon indicating an introductory scenario.',
  /** 2001 chars to exercise the 2000 alt-text limit. */
  altTextOverLimit: 'a'.repeat(2001),

  scriptInjection: '<script>alert(1)</script>Safe Situation Header',
} as const;
