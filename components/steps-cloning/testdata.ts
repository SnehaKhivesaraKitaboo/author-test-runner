/// <reference types="cypress" />
// =============================================================================
// Steps Cloning test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const SC_DATA = {
  /** A representative assessment widget dropped into the source step's column. */
  sampleWidgetName: 'Fill in the Blank',
  sampleWidgetDataType: 'fill-in-the-blank',

  /** Content authored in the source step prior to cloning (clone-integrity). */
  sourceContentMarker: 'Steps-Cloning source marker — should appear in the clone.',

  /** Special characters / symbols used to verify clone content fidelity (TC_26). */
  specialChars: 'Σ≈ç√∫ — emoji ✓ ★ — clone integrity probe',

  /** A LoS we attempt to add in the clone wizard (non-CORE so it is selectable). */
  targetLoS: 'LIGHT',

  /** XSS payload — must never execute when typed into editable fields. */
  scriptInjection: '<script>alert(1)</script>Safe Clone',
} as const;
