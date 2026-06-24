/// <reference types="cypress" />
// =============================================================================
// Carousel (slideshow) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const CAROUSEL_DATA = {
  header: 'Carousel Header — overview of the slideshow activity.',
  instruction: 'Navigate slides to know more about each topic.',
  slideTitle: 'Slide One Title',
  slideTitleAlt: 'Slide Two Title',
  slideText:
    'This slide paragraph verifies the Carousel text body accepts and retains ' +
    'multi-sentence content during authoring.',
  caption: 'Figure 1 — a verified caption for the slide media.',

  /** Long title for the edge-case (truncate/scroll) check. */
  longTitle: 'Carousel '.repeat(40).trim(),
  /** Special characters in the slide title. */
  specialChars: 'Títle © — “quotes” & <b>bold?</b> · 你好 · 50% off!',
  /** Math/LaTeX payload for math-render cases (deferred render). */
  mathEquation: '$$x^2 + y^2 = r^2$$',

  /** Custom action-asset colour for the colour picker. */
  actionAssetColor: '#e91e63',
  /** Slide duration (seconds) when Auto Play is enabled. */
  slideDuration: '5',

  scriptInjection: '<script>alert(1)</script>Safe Slide',
} as const;
