/// <reference types="cypress" />
// =============================================================================
// Sample Layer / TIG Panel test data — reusable strings/values (no hardcoded
// literals in the spec).
// =============================================================================

export const SL_DATA = {
  /** Sample-answer content typed into a component placed inside the layer. */
  sampleAnswer: 'This is the model sample answer shown to teachers in the TIG panel.',
  /** Inner component used to populate a layer column during automation. */
  innerComponentName: 'Text',
  innerComponentDataType: 'paragraph',
  innerComponentBody:
    'Sample-layer body content used to verify a component can be authored ' +
    'inside the sample-answer layer container.',
  /** Teacher instructional guide / support content stubs (Reader-deferred). */
  purposefulQuestion: 'What evidence supports your reasoning?',
  differentiationStrategy: 'Provide a sentence frame for emerging readers.',
  tags: 'sample-layer,tig,teacher-guide',

  /** XSS payload for security verification inside an authored field. */
  scriptInjection: '<script>alert(1)</script>Safe Sample Answer',
} as const;
