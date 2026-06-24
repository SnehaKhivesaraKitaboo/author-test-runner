/// <reference types="cypress" />
// =============================================================================
// Wordsearch test data — reusable strings/values (no hardcoded literals in spec).
//
// NOTE on input rules (source: wordsearch.js onKeyPress / pattern restrict):
//   • The Hidden Word input accepts letters only ([a-zA-Z]+), blocks spaces, and
//     stops typing at 13 characters. Words are stored UPPERCASE and de-duped.
//   • Test inputs below are letter-only words so they survive the input filter;
//     numeric / space / over-length payloads are kept separately to document the
//     negative cases (their *blocked* behaviour is verified, not their addition).
// =============================================================================

export const WS_DATA = {
  /** Primary letter-only word for add/delete flows. */
  word: 'cypress',
  /** Second distinct word for multi-word / ordering checks. */
  wordTwo: 'angular',
  /** Lowercase + uppercase pair for the case-insensitive de-dup check. */
  wordLower: 'tiger',
  wordUpper: 'TIGER',
  /** Minimum-length word (2 chars). */
  minWord: 'ok',
  /** Header / instruction / question content. */
  header: 'Find the hidden words',
  instruction: 'Drag across the letters to highlight each word.',
  question: 'Which programming words can you find?',

  // ---- Negative-case payloads (documented; blocked by the input filter) ----
  /** > 13 chars — input caps typing at 13 (maxWordLength). */
  overLengthWord: 'a'.repeat(50),
  /** Numbers — rejected by pattern="[a-zA-Z]+". */
  numericWord: '123',
  /** Leading/trailing spaces — space (charCode 32) is blocked on key press. */
  spacedWord: '  cat  ',
  /** Only spaces — nothing addable. */
  blankWord: '   ',

  scriptInjection: '<script>alert(1)</script>Safe',
} as const;
