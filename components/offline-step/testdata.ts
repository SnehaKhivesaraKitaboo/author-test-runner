/// <reference types="cypress" />
// =============================================================================
// Offline Step test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const OS_DATA = {
  /** Step title prefix (createTestStep appends a timestamp). */
  stepTitlePrefix: 'Auto Offline Step',

  /** A deterministic title used by wizard-validation probes. */
  validationTitle: 'Offline Validation Probe',

  /** Instructions for Students — entered into #studentDesc. */
  studentInstructions: 'Read the printed passage offline and answer in your workbook.',

  /** Instructions for Teachers — entered into #teacherDesc. */
  teacherInstructions: 'Print this step; no internet or device interaction is required for learners.',

  /** Keyword tag entered manually in the wizard (in addition to the auto "Offline Step" tag). */
  keywordTag: 'offline-automation',

  /** Representative printable content the offline step SHOULD allow (config = true). */
  allowedContentName: 'Paragraph',
  allowedContentDataType: 'paragraph',

  /** Representative interactive widget the offline step MUST block (config = false). */
  blockedWidgetName: 'Fill in the Blank',
  blockedWidgetDataType: 'fill-in-the-blank',

  /** XSS payload — must never execute when typed into editable wizard fields. */
  scriptInjection: '<script data-cy-injected="true">window.__offlineXss=1;</script>Safe Offline',
} as const;
