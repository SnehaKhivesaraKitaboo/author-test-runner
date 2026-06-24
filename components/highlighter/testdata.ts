/// <reference types="cypress" />
// =============================================================================
// Highlighter test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const HL_DATA = {
  header: 'Highlight the extraneous words',
  instruction: 'Find the extraneous word in each group of words.',
  /** Multi-word sentence so a word-range is DOM-assertable for highlight tests. */
  sentence: 'The quick brown fox jumps over the lazy dog.',
  sentenceTwo: 'A second independent sentence with several words to mark.',
  /** Word inside `sentence` used as the correct-highlight range target. */
  highlightWord: 'fox',
  /** Mixed formatting: numbers / alphabets / special chars / other language. */
  mixedFormatting: 'Q1: café — naïve €100 — 日本語 — <b>bold</b>',
  tags: 'highlight,reading,vocabulary',
  /** Custom Action Assets colour code for the picker input box. */
  appearanceColor: '#113e9a',
  /** Long text to exercise field-length handling (no maxlength attr in source). */
  longText: 'word '.repeat(400).trim(),

  scriptInjection: '<script>alert(1)</script>Safe Sentence',
} as const;
