/// <reference types="cypress" />
// =============================================================================
// External Cumulation test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const EC_DATA = {
  currentStepTitle: 'External Cumulation Target Step',
  externalActivityName: 'External Source Activity',
  /** Exact / partial search terms exercised against the library search box. */
  searchExact: 'External Source Activity',
  searchPartial: 'External Source',
  /** A term that should not match anything (empty-state assertion). */
  searchNoMatch: 'zzz-no-such-activity-xyz',
  studentInstructions: 'Data from the source lesson cumulates into this lesson.',
  teacherInstructions: 'Review externally cumulated responses in the report.',

  scriptInjection: '<script>alert(1)</script>Safe Activity Name',
} as const;
