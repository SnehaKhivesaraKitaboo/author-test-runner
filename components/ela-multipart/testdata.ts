/// <reference types="cypress" />
// =============================================================================
// ELA Multipart test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const ELA_MULTIPART_DATA = {
  /** Shared header / instruction style content. */
  header: 'Read the passage, then answer every part below.',
  instruction: 'Complete each sub-question. Submit when all parts are answered.',

  /** Tags (comma separated) for the settings tags field. */
  tags: 'multipart,ela,assessment',

  /** Colour values for Outline / Action Assets / Background. */
  validColor: '#113e9a',
  invalidColor: 'not-a-color',
  backgroundColor: '#F3ECFE',

  /** Corner radius numeric / non-numeric inputs. */
  cornerRadius: '8',
  cornerRadiusNonNumeric: 'abc',

  /** Sub-question widget names (resolved from the Widgets catalog) that the
   *  Multipart container accepts via inner drop (enableGroupInteractivity:true). */
  partWidgets: {
    mcqSingle: { name: 'Multiple Choice', dataType: 'multiple-choice-template' },
    fib: { name: 'Fill in the Blank', dataType: 'fill-in-the-blank' },
  },

  /** Very long text to exercise title/box overflow handling. */
  longText: 'A'.repeat(10000),

  /** Special characters / emoji handling. */
  specialChars: '!@#$%^&*()_+{}|:"<>?~` ✅😀',

  scriptInjection: '<script>alert(1)</script>Safe Multipart Header',
} as const;
