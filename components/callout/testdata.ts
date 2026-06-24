/// <reference types="cypress" />
// =============================================================================
// Callout Box (sidebarComponent) test data — reusable strings/values
// (no hardcoded literals in the spec).
// =============================================================================

export const CALLOUT_DATA = {
  header: 'Callout Box Automation Header',
  body:
    'This callout box verifies that the Callout (sidebarComponent) element ' +
    'accepts and retains multi-sentence body content during authoring.',
  shortBody: 'A short callout body for the Callout component.',
  /** Long paragraph for the auto-expand / no-scroll cases (TC_21/TC_34). */
  longBody: 'Lorem ipsum dolor sit amet. '.repeat(40).trim(),
  caption: 'Callout image caption text',
  altText: 'Callout box accessibility description for screen readers.',
  /** Used to verify a line break is preserved (Enter inside contenteditable). */
  multiLine: 'First line.\nSecond line.',
  /** LaTeX/math payload for math-render cases (TC_09/TC_32/TC_62). */
  mathEquation: '$$x^2 + y^2 = r^2$$',
  /** Valid header background hex (TC_54/TC_74). */
  headerColorHex: '#FFAA00',
  /** Valid background hex (TC_55/TC_75). */
  backgroundColorHex: '#D2E6E8',
  /** Valid border/outline hex (TC_90). */
  validBorderHex: '#FF5733',
  /** Invalid border hex (TC_91). */
  invalidBorderHex: '#XYZ123',
  /** 2001-char string for the Alt Text max-length case (TC_102). */
  altTextOverLimit: 'A'.repeat(2001),

  scriptInjection: '<script>alert(1)</script>Safe Callout',
} as const;
