/// <reference types="cypress" />
// =============================================================================
// Internal Cumulation test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const IC_DATA = {
  stepTitle: 'Internal Cumulation Source Step',
  duplicateStepTitle: 'Internal Cumulation Duplicated Step',
  /** Exact / partial search terms exercised against the library search box. */
  searchExact: 'Internal Cumulation Source Step',
  searchPartial: 'Internal Cum',
  /** A term that should not match anything (empty-state assertion). */
  searchNoMatch: 'zzz-no-such-activity-xyz',
  studentInstructions: 'Complete the child step before moving to the parent step.',
  teacherInstructions: 'Review aggregated child-step responses on the parent step.',

  scriptInjection: '<script>alert(1)</script>Safe Step Title',
} as const;
