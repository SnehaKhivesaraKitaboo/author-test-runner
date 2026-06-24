/// <reference types="cypress" />
// =============================================================================
// Copy and Paste test data — reusable strings/values (no hardcoded literals).
//
// Copy/Paste is a cross-component platform feature: the components actually
// copied are existing widgets (FIB / Text / MCQ / Extended Response). These
// values seed the source component so a copy round-trip is verifiable.
// =============================================================================

export const CP_DATA = {
  /** Header/body content seeded onto the source component before copying. */
  sourceHeader: 'Copy/Paste Source Header',
  sourceBody: 'This component is the copy/paste source — content must survive paste.',

  /** Component used as the copy source in the Generic Step column. */
  sourceWidgetName: 'Fill in the Blank',
  sourceWidgetDataType: 'fill-in-the-blank',

  /** Alternate widget for the "multiple copy-paste actions" case (TC_18). */
  altWidgetName: 'Multiple Choice',
  altWidgetDataType: 'multiple-choice-template',

  /** Script payload to confirm copied content is not executed on paste (security). */
  scriptInjection: '<script data-cy-injected="1">window.__cpXss=1</script>Safe Copied Content',
} as const;
