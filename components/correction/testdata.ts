/// <reference types="cypress" />
// =============================================================================
// Correction test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const CORRECTION_DATA = {
  header: 'Correct the errors in the sentences below.',
  instruction: 'Strike through the wrong word and type the correct answer.',
  /** Text Description (sentence) content with a deliberate error to correct. */
  sentence: 'The cat are sleeping on the mat.',
  sentenceTwo: 'She walk to school every morning.',
  /** Correct answer typed into the strike-marker input. */
  correctAnswer: 'is',
  tags: 'grammar,correction,verbs',
  /** Special-character handling for Text Description (TC_11). */
  specialChars: '!@#$%^&*()_+{}|:"<>?~`',
  /** Long text to exercise UI break handling (TC_15). */
  longText:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
    'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
    'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ' +
    'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse.'.repeat(4),
  /** Invalid colour code for Action Assets (TC_16). */
  invalidColor: 'not-a-color',
  validColor: '#113e9a',

  scriptInjection: '<script>alert(1)</script>Safe Sentence',
} as const;
