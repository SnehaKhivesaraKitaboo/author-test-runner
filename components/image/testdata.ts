/// <reference types="cypress" />
// =============================================================================
// Image test data — reusable strings/values (no hardcoded literals in specs).
// =============================================================================

export const IMAGE_DATA = {
  altText: 'A descriptive alt text for the image used by screen readers.',
  /** 2001 chars to exercise the 2000 alt-text maxlength contract. */
  altTextOverLimit: 'a'.repeat(2001),

  caption: 'Figure 1. A representative caption shown below the image.',
  /** Multi-line caption to exercise line-break rendering (Reader-side deferred). */
  captionMultiline: 'Line one of the caption.\nLine two of the caption.',
  /** Long caption to exercise wrapping (Reader-side layout deferred). */
  captionLong:
    'This is an intentionally long caption that is used to verify that the ' +
    'caption text wraps gracefully within the layout and does not overflow or ' +
    'break the surrounding image component layout when previewed in the reader.',

  header: 'Image Automation Header',
  tags: 'diagram,figure,sample',
  customWidth: '320',
  customHeight: '240',
  colorHex: '#D2E6E8',

  scriptInjection: '<script>alert(1)</script>Safe Alt Text',
} as const;
