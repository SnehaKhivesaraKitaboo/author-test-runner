/// <reference types="cypress" />
// =============================================================================
// Instruction for Student test data — reusable strings/values (no hardcoded
// literals in the spec).
// =============================================================================

export const IS_DATA = {
  instruction:
    'Read the passage carefully, then answer the questions in complete ' +
    'sentences. Underline the key evidence that supports your answer.',
  shortInstruction: 'Complete all tasks on this page.',
  /** Used to verify a line break is preserved (Enter inside contenteditable). */
  multiLine: 'First instruction line.\nSecond instruction line.',
  /** 1000+ chars to exercise the long-content edge case (TC_17). */
  longContent: 'Lorem ipsum dolor sit amet. '.repeat(50),
  /** Emojis / symbols / foreign chars for the special-character case (TC_19). */
  specialCharacters: 'Café ☃ €∑ 你好 — 😀 ñ ü ß',

  scriptInjection: '<script>alert(1)</script>Safe Instruction',
} as const;
