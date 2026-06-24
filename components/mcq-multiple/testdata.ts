/// <reference types="cypress" />
// =============================================================================
// MCQ Multiple test data — reusable strings/values (no hardcoded literals).
//
// Reuses the shared MCQ_DATA where identical; adds multiple-answer specifics
// (more than one correct answer, partial-answer wording, etc.).
// =============================================================================

import { MCQ_DATA } from '../mcq/testdata';

export const MCQ_MULTI_DATA = {
  ...MCQ_DATA,
  header: 'MCQ Multiple Automation Header',
  question: 'Select ALL prime numbers below.',
  options: ['2', '3', '4', '5'],
  /** Indices (0-based) of the options that are correct in multiple mode. */
  correctIndexes: [0, 1, 3], // 2, 3, 5 are prime
} as const;
