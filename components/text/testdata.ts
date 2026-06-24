/// <reference types="cypress" />
// =============================================================================
// Text (paragraph) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const TEXT_DATA = {
  body:
    'The quick brown fox jumps over the lazy dog. This paragraph verifies that ' +
    'the Text element accepts and retains multi-sentence content during authoring.',
  shortBody: 'A short paragraph for the Text component.',
  /** Used to verify a line break is preserved (Enter inside contenteditable). */
  multiLine: 'First line.\nSecond line.',
  /** 10+ line breaks for the excessive-line-break case (TC_28). */
  excessiveLineBreaks: 'Start' + '\n'.repeat(12) + 'End',
  /** LaTeX/math payload for math-render cases (TC_29/TC_30). */
  mathEquation: '$$x^2 + y^2 = r^2$$',
  invalidMath: '$$x^2 + $$',
  authorName: 'Jane Author',
  paragraphNumber: '1',

  scriptInjection: '<script>alert(1)</script>Safe Paragraph',
} as const;
