/// <reference types="cypress" />
// =============================================================================
// Thumbs Card Header (thumbcard) test data — reusable strings/values
// (no hardcoded literals in the spec).
// =============================================================================

export const THUMBCARD_DATA = {
  heading: 'Key Takeaways for this Lesson',
  shortHeading: 'Card Header',
  /** Multi-paragraph content to exercise the no-scroll / layout-stable case. */
  longHeading:
    'This thumbs card header holds a longer, multi-sentence heading to verify ' +
    'that the component keeps its layout stable and does not introduce internal ' +
    'scrollbars when the authored content grows beyond a single short line.',
  /** Verifies a line break is preserved inside the contenteditable heading. */
  multiLine: 'First line.\nSecond line.',
  /** A valid hex used to drive the Background Color picker input. */
  bgColor: '#FFEEBB',
  /** A valid hex used to drive the Stroke Color picker input. */
  strokeColor: '#333333',
  altText: 'Thumbs-up card header icon describing the lesson summary section.',
  /** 2001 chars to exercise the 2000-char alt-text limit. */
  altTextOverLimit: 'a'.repeat(2001),

  scriptInjection: '<script>alert(1)</script>Safe Header',
} as const;
