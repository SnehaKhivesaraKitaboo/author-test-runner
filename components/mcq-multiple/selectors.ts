/// <reference types="cypress" />
// =============================================================================
// MCQ Multiple (Multiple Choice — Multiple Answer) — Verified selectors
//
// IMPORTANT ARCHITECTURE NOTE
// ---------------------------------------------------------------------------
// There is NO separate "mcq-multiple" template in the authoring source.
// "MCQ Multiple" is the SAME component as MCQ (Single Choice) —
// dataType "multiple-choice-template" — operating with the answer type set to
// "multiple". The only structural difference on canvas is that option inputs
// render as CHECKBOXES (input.mcqchkbox) instead of RADIOS (input.mcqradio).
//
// Therefore the canvas/settings selectors here re-export the verified MCQ
// selectors and add multiple-answer-specific aliases. Everything was read from:
//   templates/multiple-choice-template/multiple-choice-template-settings.html
//   templates/multiple-choice-template/multiple-choice-template-auth.html
//   templates/multiple-choice-template/default/multiple-choice-template.json
// =============================================================================

import { MCQ_CANVAS, MCQ_SETTINGS, MCQ_RULES } from '../mcq/selectors';

/** Same underlying template as single-choice MCQ ('multiple-choice-template'). */
export { MCQ_DATA_TYPE as MCQ_MULTI_DATA_TYPE } from '../mcq/selectors';

/** Canvas selectors (shared with MCQ single) + multiple-answer aliases. */
export const MCQ_MULTI_CANVAS = {
  ...MCQ_CANVAS,
  /** Option input in multiple mode — checkbox (input.mcqchkbox). */
  optionInput: MCQ_CANVAS.optionCheckbox,
  /** Option input in single mode — radio (for the toggle-back assertion). */
  optionInputSingle: MCQ_CANVAS.optionRadio,
} as const;

/** Settings selectors (shared with MCQ single). */
export const MCQ_MULTI_SETTINGS = {
  ...MCQ_SETTINGS,
} as const;

/** Business rules — identical to single MCQ (same template). */
export const MCQ_MULTI_RULES = {
  ...MCQ_RULES,
  answerType: 'multiple-select',
} as const;
