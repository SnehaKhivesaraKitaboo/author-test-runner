/// <reference types="cypress" />
// =============================================================================
// Four Column Layout (layout-4) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const LAYOUT_DATA = {
  widgetName: 'Four Column',
  childElementName: 'Text',
  childElementDataType: 'paragraph',
  childText: 'Content placed inside the Four Column layout column.',
  altText: 'Descriptive alt text for the Four Column layout (screen readers).',

  scriptInjection: '<script>alert(1)</script>Safe Layout',
} as const;
