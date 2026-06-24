/// <reference types="cypress" />
// =============================================================================
// Flashcard test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const FC_DATA = {
  header: 'Flashcard set: Key vocabulary',
  instruction: 'Tap a card to flip and reveal the definition.',
  frontText: 'Photosynthesis',
  backText: 'The process by which plants convert light energy into chemical energy.',
  secondFrontText: 'Mitochondria',
  secondBackText: 'The powerhouse of the cell.',
  slideText: 'Optional caption text above the card.',
  tags: 'biology,vocabulary,cells',
  altText: 'Descriptive alt text for the flashcard image used by screen readers.',
  cardColour: '#113e9a',
  /** 2001 chars to exercise the 2000 alt-text limit. */
  altTextOverLimit: 'a'.repeat(2001),

  scriptInjection: '<script>alert(1)</script>Safe Card',
} as const;
