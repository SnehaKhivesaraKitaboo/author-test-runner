/// <reference types="cypress" />
// =============================================================================
// Annotation test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const ANNOTATION_DATA = {
  /** Short highlight/outline label (TC_10 — normal text). */
  highlightLabel: 'Key Theme',
  outlineLabel: 'Main Idea',
  /** Long label to verify no truncation on save (TC_11). */
  longLabel:
    'A deliberately long annotation label that spans well beyond a typical short ' +
    'phrase so we can confirm the contenteditable label field accepts and retains ' +
    'extended content during authoring without truncating it.',
  /** Math/LaTeX payload (TC_12 — equation in annotation label). */
  mathEquation: '$$x^2 + y^2 = r^2$$',
  /** Special characters / emoji (TC_13). */
  specialChars: 'Café — “quote” • α β ∑ ✓ 😀',
  /** Edited label value (TC_17 — edit existing annotation). */
  editedLabel: 'Updated Theme',
  /** Alt text for accessibility (TC_25). */
  altText: 'Descriptive alt text for the annotation read aloud by screen readers.',
  /** 2001 chars to exercise the 2000 alt-text limit. */
  altTextOverLimit: 'a'.repeat(2001),

  scriptInjection: '<script>alert(1)</script>Safe Label',
} as const;
