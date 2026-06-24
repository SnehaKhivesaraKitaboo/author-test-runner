/// <reference types="cypress" />
// =============================================================================
// Instruction for Teacher test data — reusable strings/values (no hardcoded
// literals in the spec).
// =============================================================================

export const IT_DATA = {
  instruction:
    'Before the lesson, review the vocabulary list with students. Model the ' +
    'first example aloud, then circulate while students work in pairs.',
  shortInstruction: 'Guide students through each task on this page.',
  /** Used to verify a line break is preserved (Enter inside contenteditable). */
  multiLine: 'First teacher note.\nSecond teacher note.',
  /** 1000+ chars to exercise the long-content edge case (TC_17). */
  longContent: 'Teaching note paragraph. '.repeat(50),
  /** Emojis / symbols / foreign chars for the special-character case (TC_19). */
  specialCharacters: 'Café ☃ €∑ 你好 — 😀 ñ ü ß',

  scriptInjection: '<script>alert(1)</script>Safe Teacher Instruction',
} as const;
