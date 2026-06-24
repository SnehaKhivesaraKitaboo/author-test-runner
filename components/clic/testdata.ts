/// <reference types="cypress" />
// =============================================================================
// CLIC (Sketchpad) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const CLIC_DATA = {
  /** Valid alphanumeric CLIC identifier (clicuid). */
  identifier: 'CLIC-ELA-12345',
  /** Valid instance name. */
  instanceName: 'Sketchpad Activity One',
  /** Special characters to exercise field handling (TC_15). */
  specialChars: '@#$%^&*()_+',
  /** 100+ character string for truncation/wrapping behavior (TC_16). */
  longText:
    'This is a deliberately long CLIC identifier value that exceeds one hundred ' +
    'characters in order to verify wrapping or max-length truncation behavior.',
  /** Second identifier for multi-instance cases (TC_31). */
  secondIdentifier: 'CLIC-ELA-67890',
  secondInstanceName: 'Sketchpad Activity Two',

  scriptInjection: '<script>alert(1)</script>Safe Identifier',
} as const;
