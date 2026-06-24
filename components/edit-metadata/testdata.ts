/// <reference types="cypress" />
// =============================================================================
// Edit Metadata test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const EM_DATA = {
  /** New title typed into the wizard while editing existing step metadata. */
  editedTitle: `Edited Step Title ${Date.now()}`,

  /** A second title used to verify cancel-without-save reverts changes. */
  discardedTitle: 'This Title Should Not Persist',

  /** Keyword/standards tag entered in the wizard (Press Enter to separate). */
  keywordTag: 'objective-tag',
  /** Second tag to verify multiple-tag entry. */
  secondTag: 'standard-CCSS',

  /** Objectives-style narrative text typed into Instructions for Students. */
  studentInstructions:
    'Students should be able to explain the core objective of this step ' +
    'and apply it to a new context.',
  /** Narrative text typed into Instructions for Teachers. */
  teacherInstructions:
    'Teachers: align this step to the relevant standard and check for the ' +
    'stated learning objective.',

  /** XSS payload — must never execute when typed into editable fields. */
  scriptInjection: '<script>alert(1)</script>Safe Metadata',
} as const;
