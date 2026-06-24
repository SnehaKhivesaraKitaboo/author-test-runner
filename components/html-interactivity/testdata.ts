/// <reference types="cypress" />
// =============================================================================
// HTML Interactivity test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const HI_DATA = {
  header: 'HTML Interactivity Automation Header',
  caption: 'Caption for the automated HTML Interactivity component.',
  instruction: 'Open this interactivity to explore the activity.',

  /** Heavy text payloads (TC_25 / TC_26 — header/caption no-truncation checks). */
  heavyHeader:
    'Heavy header content '.repeat(40).trim(),
  heavyCaption:
    'Heavy caption content '.repeat(40).trim(),

  /** Long text for wrap/display verification (TC_21). */
  longText:
    'This is a deliberately long string used to verify that the HTML Interactivity ' +
    'header and caption wrap and display correctly without overflowing or being ' +
    'truncated across the editor and preview surfaces. '.repeat(3),

  tags: 'interactivity,html,automation',
  altText: 'Accessible description of the embedded HTML interactivity package.',
  outlineBgColor: '#D2E6E8',

  /**
   * Script-injection payload for the security check (TC_31): the embed surface
   * must never execute author-supplied markup. Verified via DOM (no live
   * <script> node / no executed inline JS) where DOM-assertable.
   */
  scriptInjection: '<script>window.__hiXss = true;</script>Safe Interactivity Text',

  /**
   * A representative HTML snippet (documentation/data only). The real component
   * ingests a packaged .zip via an <object>, NOT a free-text snippet — this is
   * kept for the security-intent payload and for the not-yet-live source note.
   */
  sampleHtmlSnippet:
    '<div class="hi-sample"><h2>Sample Interactivity</h2>' +
    '<p>Static HTML used to document the embed surface.</p></div>',

  /** File-name hints for the deferred upload cases (no real file picker here). */
  validZipName: 'sample-interactivity.zip',
  invalidUploadName: 'malicious.exe',
} as const;
