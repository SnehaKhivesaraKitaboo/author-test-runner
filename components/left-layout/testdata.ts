/// <reference types="cypress" />
// =============================================================================
// Left Layout (layout-1) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const LAYOUT_DATA = {
  widgetName: 'Left',
  /** Child element used to verify a column accepts an element drop. */
  childElementName: 'Text',
  childElementDataType: 'paragraph',
  /** Sample text typed into a child element inside a column. */
  childText: 'Content placed inside the Left layout column.',
  altText: 'Descriptive alt text for the Left layout (screen readers).',

  scriptInjection: '<script>alert(1)</script>Safe Layout',
} as const;
