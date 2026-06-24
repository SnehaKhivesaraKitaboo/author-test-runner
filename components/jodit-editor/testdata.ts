/// <reference types="cypress" />
// =============================================================================
// Jodit Editor test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const JODIT_DATA = {
  /** Question prompt seeded into the Extended Response host before mounting Jodit. */
  hostQuestion: 'Describe the water cycle in your own words.',

  /** Plain content typed into the Jodit editable area. */
  body:
    'The quick brown fox jumps over the lazy dog. This sentence verifies that ' +
    'the Jodit editor accepts and retains rich-text content during authoring.',
  shortBody: 'A short answer entered into the Jodit editor.',

  /** Word/styled paste payload — exercised against jodit-init.js processPaste sanitizer. */
  wordPasteHtml:
    '<meta charset="utf-8"><style>.Mso{color:red}</style>' +
    '<p class="MsoNormal" style="mso-line:1" lang="en">Pasted <b>bold</b> & styled text</p>',

  /** Link dialog inputs. */
  validUrl: 'https://www.example.com',
  invalidUrl: 'not a valid url',
  linkText: 'Example link',

  fontSize: '18',

  /** Math/LaTeX payload (math insert is deferred — render verified in Preview). */
  mathEquation: '$$x^2 + y^2 = r^2$$',

  /** 5001 chars to exercise the documented 5000-char limit (deferred — runtime). */
  overLimit: 'a'.repeat(5001),

  scriptInjection: '<script>alert(1)</script>Safe Answer',
  htmlInjection: '<img src=x onerror="window.__joditXss=1">Safe',
} as const;
