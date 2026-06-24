/// <reference types="cypress" />
// =============================================================================
// Generic Step test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const GS_DATA = {
  /** A representative assessment widget to drop into a Generic Step column. */
  sampleWidgetName: 'Fill in the Blank',
  sampleWidgetDataType: 'fill-in-the-blank',

  /** Alt text for the step background-accessibility field. */
  altText: 'Background context for this Generic Step, read aloud to screen readers.',
  /** 2001 chars to exercise the 2000 alt-text limit. */
  altTextOverLimit: 'a'.repeat(2001),

  /** Background colour value typed into the colour picker input. */
  bgColor: '#113e9a',

  /** Keyword tag entered manually in the wizard. */
  keywordTag: 'automation',

  /** Step title prefix (the framework appends a timestamp via createTestStep). */
  stepTitlePrefix: 'Auto Test',

  /** XSS payload — must never execute when typed into editable fields. */
  scriptInjection: '<script>alert(1)</script>Safe Step',
} as const;
