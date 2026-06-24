/// <reference types="cypress" />
// =============================================================================
// Fill in the Blank (FIB) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   templates/fib/fib.html
//   templates/fib/fib-settings-panel.html
//
// dataType = "fill-in-the-blank". Assessment widget → dropped into a Generic
// Step column (same rule as MCQ/Extended Response). The standard FIB has NO
// image/media options (that is the separate "FIB Media" / fibWithImage mode).
//
// Source-driven facts:
//   • Option types: Dropdown (#with-option), Text (#without-option),
//     Drag & Drop (#drag-and-drop).
//   • Visibility toggles: Show Header (#header-visibility),
//     Show Instruction (#instr-visibility), Show Label Type (#label-visibility).
//   • Label types: primary | secondary (input[name="labelType"]).
//   • Advanced: Case Sensitive (#add-case-sensitive),
//     Shuffle Choices (#add-shuftle-choices), Generic Feedback
//     (#add-generic-feedback), Try Again (#add-activity-restart),
//     Show Me (#add-show-me).
//   • Styles: #fibcard-style1 … #fibcard-style7 (.styleBackground).
//   • Dropdown options cap at 20 (Add Option).
// =============================================================================

export const FIB_DATA_TYPE = 'fill-in-the-blank';

/** Authoring-canvas DOM (the dropped FIB component). */
export const FIB_CANVAS = {
  widget: '[data-type="fill-in-the-blank"]',
  component: '.fib',
  /** FIB inside a Generic Step column only. */
  inColumn: '.generic-step-column-content .fib, .generic-step-column-content [data-type="fill-in-the-blank"]',
  header: '.fib .sc-intro.template-header, [data-type="fill-in-the-blank"] .sc-intro.template-header',
  instruction: '.fib .sc-instr.template-instruction, [data-type="fill-in-the-blank"] .sc-instr.template-instruction',
  sentence: '.fib .sc-sentence.sentence-text, [data-type="fill-in-the-blank"] .sc-sentence.sentence-text',
  body: '.fib .fib-body, [data-type="fill-in-the-blank"] .fib-body',
  /** Label markers rendered on canvas. */
  labelPrimary: '[data-type="fill-in-the-blank"] .questionNoText, [data-type="fill-in-the-blank"] .labelTypeQuestion',
  labelSecondary: '[data-type="fill-in-the-blank"] .questionNoSecondaryText',
  /** Inserted blank placeholder (varies by option type). */
  blank: '.fib .inputbox-selected, .fib select.inputbox-selected, .fib .preview-drop, .fib .js-form-row.fib-with-option',
  /** Copy / delete affordances on the dropped item. */
  copyIcon: '.icon-Copy-Icon, .copy-widget-icon',
  deleteIcon: '.icon-Delete, .dlet_icon',
} as const;

/** Settings panel DOM (#fib-settings-panel). */
export const FIB_SETTINGS = {
  panel: '#fib-settings-panel',

  // Option types
  optionDropdown: '#fib-settings-panel #with-option',
  optionText: '#fib-settings-panel #without-option',
  optionDragDrop: '#fib-settings-panel #drag-and-drop',

  // Visibility toggles
  showHeader: '#fib-settings-panel #header-visibility',
  showInstruction: '#fib-settings-panel #instr-visibility',
  showLabelType: '#fib-settings-panel #label-visibility',

  // Label types
  labelPrimary: '#fib-settings-panel input[name="labelType"][value="primary"]',
  labelSecondary: '#fib-settings-panel input[name="labelType"][value="secondary"]',

  // Advanced
  caseSensitive: '#fib-settings-panel #add-case-sensitive',
  shuffleChoices: '#fib-settings-panel #add-shuftle-choices',
  genericFeedback: '#fib-settings-panel #add-generic-feedback',
  tryAgain: '#fib-settings-panel #add-activity-restart',
  showMe: '#fib-settings-panel #add-show-me',
  correctFeedback: '#fib-settings-panel #correct_ans_feedback',
  incorrectFeedback: '#fib-settings-panel #incorrect_ans_feedback',

  // Drag & Drop "Properties of Blank"
  blankWithText: '#fib-settings-panel #with-Text',
  blankWithImage: '#fib-settings-panel #with-Image',
  correctOption: '#fib-settings-panel .correct-option-fib, #fib-settings-panel .icon-Check',

  // Styles
  styleCards: '#fib-settings-panel .styleBackground, #fib-settings-panel [id^="fibcard-style"]',
} as const;

/** Source-verified business rules. */
export const FIB_RULES = {
  maxDropdownOptions: 20,
  defaultLabelType: 'primary',
  styleCount: 7,
  /** Standard FIB has no media/image controls. */
  noMediaControls: true,
} as const;
