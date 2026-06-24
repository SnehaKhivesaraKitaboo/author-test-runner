/// <reference types="cypress" />
// =============================================================================
// LoD + Annotation Cue test data — reusable strings/values (no hardcoded
// literals scattered in the spec). Values mirror the QC catalog vocabulary
// (Ref IDs like ACT_001, "Stop and Annotate" title, etc.).
// =============================================================================

export const LOD_CUE_DATA = {
  /** Annotation Cue authored content. */
  cueTitle: 'Pause and Reflect',
  cueText:
    'Re-read the highlighted passage and note one piece of supporting evidence ' +
    'for the author’s main claim.',

  /** Link-Activity reference IDs (QC TC_35/TC_51..TC_56 use ACT_00x). */
  refId1: 'ACT_001',
  refId2: 'ACT_002',
  refId3: 'ACT_003',
  /** Empty / invalid Ref IDs for validation cases (TC_42, TC_43, TC_55). */
  refIdEmpty: '   ',
  refIdInvalid: '@@@',

  /** Annotation Cue colour override (valid 7-char hex, maxlength=7). */
  cueColor: '#113E9A',

  /** Special characters / overflow (TC_119, TC_122). */
  longText:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20),
  specialChars: 'Café — naïve “quotes” • 数学 😀 ✓',

  scriptInjection: '<script>alert(1)</script>Safe Cue Title',
} as const;
