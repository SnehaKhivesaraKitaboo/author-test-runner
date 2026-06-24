/// <reference types="cypress" />
// =============================================================================
// Lesson Opener test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const LO_DATA = {
  /** Generic body text for the editable .sidebarCaption paragraph. */
  body:
    'Are there other ways to compare value? Use this Lesson Opener prompt to set ' +
    'the stage for the lesson and activate prior knowledge.',
  shortBody: 'A short lesson opener prompt.',
  /** Used to verify a line break is preserved (Enter inside contenteditable). */
  multiLine: 'First prompt line.\nSecond prompt line.',
  /** Style-specific bodies to verify content is retained while switching styles. */
  learningPromptBody: 'Learning Prompt: What do you already know about fractions?',
  makeConnectionBody: 'Make a Connection: How does this relate to yesterday\u2019s lesson?',
  myLearningGoalsBody: 'My Learning Goals: I can compare values using a number line.',
  keyTermsBody: 'Key Terms: numerator, denominator, equivalent fractions.',
  /** LaTeX/math payload for math-render cases (rendered/validated in Preview — deferred). */
  mathEquation: '$$x^2 + y^2 = z^2$$',
  invalidMath: '$$x^2 + $$',
  altText: 'Lesson Opener illustration describing the lesson theme.',
  /** Programmatic over-limit Alt Text to confirm the maxlength=2000 contract. */
  altTextOverLimit: 'A'.repeat(2100),

  /** XSS payload for the security case. */
  scriptInjection: '<script>alert(1)</script>Safe Lesson Opener',
} as const;
