/// <reference types="cypress" />
// =============================================================================
// Flexi Layout (layout-7) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const LAYOUT_DATA = {
  widgetName: 'Flexi',
  childElementName: 'Text',
  childElementDataType: 'paragraph',
  childText: 'Content placed inside a Flexi layout column.',
  altText: 'Descriptive alt text for the Flexi layout (screen readers).',
  /** 2001 chars to exercise the 2000 alt-text limit. */
  altTextOverLimit: 'a'.repeat(2001),
  /** Separator counts: 0→1 col, 1→2 cols, 2→3 cols, 3→4 cols. */
  separatorOne: 1,
  separatorTwo: 2,
  separatorThree: 3,
  /** Column-ratio probe values. */
  ratioValid: '50',
  ratioBelowMin: '5',
  ratioAlpha: 'ab',
  ratioNegative: '-10',
  ratioThreeDigit: '150',

  scriptInjection: '<script>alert(1)</script>Safe Layout',
} as const;
