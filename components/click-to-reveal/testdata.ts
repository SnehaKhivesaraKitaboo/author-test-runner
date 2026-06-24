/// <reference types="cypress" />
// =============================================================================
// Click to Reveal test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const CTR_DATA = {
  header: 'Photosynthesis Overview',
  instruction: 'Click on the button to learn more about this process.',
  buttonLabel: 'Reveal answer',
  description:
    'Photosynthesis is the process by which green plants convert light energy ' +
    'into chemical energy stored in glucose. This hidden text verifies that the ' +
    'Click to Reveal description body accepts and retains content during authoring.',
  caption: 'Diagram of the photosynthesis cycle.',
  tags: 'science,biology,plants',
  altText: 'Descriptive alt text for the reveal image used by screen readers.',
  /** 2001 chars to exercise the 2000 alt-text limit. */
  altTextOverLimit: 'a'.repeat(2001),
  /** Valid hex codes for the colour-picker fields. */
  cardBackgroundHex: '#FFF3E0',
  buttonBackgroundHex: '#113E9A',
  buttonTextHex: '#FFFFFF',
  /** Valid YouTube video id (By URL flow). */
  youtubeId: 'dQw4w9WgXcQ',

  scriptInjection: '<script>alert(1)</script>Safe Reveal',
} as const;
