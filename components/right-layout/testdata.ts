/// <reference types="cypress" />
// =============================================================================
// Right Layout (layout-3) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const LAYOUT_DATA = {
  widgetName: 'Right',
  childElementName: 'Text',
  childElementDataType: 'paragraph',
  childText: 'Content placed inside the Right layout column.',
  altText: 'Descriptive alt text for the Right layout (screen readers).',

  scriptInjection: '<script>alert(1)</script>Safe Layout',
} as const;
