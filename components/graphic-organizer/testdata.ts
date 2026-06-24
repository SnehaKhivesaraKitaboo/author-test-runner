/// <reference types="cypress" />
// =============================================================================
// Graphic Organizer (Image-based) test data — reusable strings/values
// (no hardcoded literals in the spec).
// =============================================================================

export const GO_DATA = {
  /** Label-type question prompt (when isLabelTypeIamge). */
  question: 'Label the parts of the plant cell.',
  /** Text typed into a hotspot textarea on the canvas. */
  hotspotInput: 'Nucleus',
  hotspotInputAlt: 'Cell Wall',
  /** Settings-panel per-hotspot "Input for Student" answer. */
  inputAnswer: 'Mitochondria — the powerhouse of the cell.',
  /** Settings-panel per-hotspot "Header Label". */
  headerLabel: 'Organelle',
  /** Character limit value entered when the limit checkbox is enabled. */
  charLimit: '120',
  /** Alt text for the base image / hotspot (exercises the 2000 limit). */
  altText: 'Descriptive alt text for the graphic-organizer base image.',
  /** Long content used to exercise the hotspot scroll behaviour. */
  longText:
    'This is a deliberately long hotspot answer used to verify that the hotspot ' +
    'text area accepts and retains multi-sentence content during authoring and ' +
    'that a scroll affordance appears for overflowing content.',

  scriptInjection: '<script>alert(1)</script>Safe Hotspot',
} as const;
