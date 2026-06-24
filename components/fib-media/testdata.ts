/// <reference types="cypress" />
// =============================================================================
// FIB Media test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const FIB_MEDIA_DATA = {
  header: 'FIB Media Automation Header',
  instruction: 'Fill in the blanks with Images.',
  sentence: 'The capital of France is ',
  longSentence:
    'This is a deliberately long statement used to verify that statement text ' +
    'wraps cleanly around an associated image without overflowing the row.',
  altText: 'A descriptive alt text for accessibility',

  /** XSS payload for alt-text sanitization (TC_37). */
  scriptInjection: '<script>alert(1)</script>safe-alt',
} as const;
