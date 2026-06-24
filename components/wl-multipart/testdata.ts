/// <reference types="cypress" />
// =============================================================================
// WL Multipart test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const WL_MULTIPART_DATA = {
  tags: 'multipart,world-languages,assessment',
  /** Comma-separated tags (helper text: "Enter , to seperate to tags"). */
  tagsCommaSeparated: 'spanish, french, german',
  /** Valid hex used to exercise the Action Assets / Background colour inputs. */
  validHex: '#113e9a',
  /** Invalid colour code (TC_84 — rejected/reverts at runtime; deferred). */
  invalidHex: 'abc123',
  /** Corner radius numeric values (TC_85). */
  cornerRadius: '8',
  /** Non-numeric corner radius (TC_86 — rejected; deferred). */
  cornerRadiusInvalid: 'ab',

  /** Sample title/long text for length-edge QC wording (deferred runtime cases). */
  longText: 'a'.repeat(10000),

  scriptInjection: '<script>alert(1)</script>Safe Multipart',
} as const;
