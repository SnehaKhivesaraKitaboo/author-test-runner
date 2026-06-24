/// <reference types="cypress" />
// =============================================================================
// Image Labeling test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const IL_DATA = {
  header: 'Parts of a Plant',
  instruction: 'Drag each label to the matching part of the image.',
  question: 'Identify the labelled parts of the plant shown below.',
  caption: 'Figure 1: Anatomy of a flowering plant.',
  labelText: 'Stem',
  /** Tag values for the Add Tags / tag-manager flow. */
  tags: ['biology', 'plants', 'anatomy'],
  tagsCsv: 'biology,plants,anatomy',
  altText: 'Diagram of a flowering plant with parts labelled.',
  /** 51 chars to exercise the 50-char alt-text limit (media.imageSetting). */
  altTextOverLimit: 'a'.repeat(51),
  /** Special characters / symbols for TC_11 (Header, Instruction, Question, Caption). */
  specialChars: 'Plant & Leaf — “Photosynthesis” (CO₂ → O₂) #1 ½ © ★ <part>',

  scriptInjection: '<script>alert(1)</script>Safe Label',
} as const;
