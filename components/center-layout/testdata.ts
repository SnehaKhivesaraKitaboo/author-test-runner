/// <reference types="cypress" />
// =============================================================================
// Center Layout (layout-2) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const LAYOUT_DATA = {
  widgetName: 'Center',
  childElementName: 'Text',
  childElementDataType: 'paragraph',
  childText: 'Content placed inside the Center layout column.',
  altText: 'Descriptive alt text for the Center layout (screen readers).',

  scriptInjection: '<script>alert(1)</script>Safe Layout',
} as const;
