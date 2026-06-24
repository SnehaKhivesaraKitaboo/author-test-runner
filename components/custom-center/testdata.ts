/// <reference types="cypress" />
// =============================================================================
// Custom Center Layout (layout-6) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const LAYOUT_DATA = {
  widgetName: 'Custom Center',
  childElementName: 'Text',
  childElementDataType: 'paragraph',
  childText: 'Content placed inside the Custom Center layout column.',
  altText: 'Descriptive alt text for the Custom Center layout (screen readers).',

  scriptInjection: '<script>alert(1)</script>Safe Layout',
} as const;
