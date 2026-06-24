/// <reference types="cypress" />
// =============================================================================
// Extended Response (Question & Answer / shortLongAns) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   templates/shortLongAns/shortLongAns.html
//   templates/shortLongAns/shortLongAns-settings-pannel.html
//
// dataType = "shortLongAns"; directive = "shortlongans-template".
// Canvas wrapper class = ".shortLongAnsComponent". Settings panel id =
// "#shortLongAns-setting".
//
// Source-driven facts:
//   • Answer types: Short / Long / RTE (RTE only when TOCFlag).
//   • Keyboard types: Basic / Advance(JODIT) — only when TOCFlag.
//   • Outline radios + colour picker only when styleSelected == 'style1'.
//   • Enable Keyboard checkbox is disabled unless a special language is set.
//   • Alt Text maxlength = 2000; char counter "Chars 2000".
// =============================================================================

export const ER_DATA_TYPE = 'shortLongAns';

/** Authoring-canvas DOM (the dropped Extended Response component). */
export const ER_CANVAS = {
  widget: `[data-type="${ER_DATA_TYPE}"], .shortLongAnsComponent`,
  component: '.shortLongAnsComponent',
  /** Label-type question fields (shown when isLabelTypeShortLong). */
  labelPrimary: '.shortLongAnsComponent .questionNoText',
  labelSecondary: '.shortLongAnsComponent .questionNoSecondaryText',
  /** Main question prompt (contenteditable). */
  question: '.shortLongAnsComponent .questionText',
  /** Answer fields by mode. */
  shortAnswer: '.shortLongAnsComponent .shortAnsText',
  longAnswer: '.shortLongAnsComponent textarea.longAnsText:not(.ansJODIT):not(.ansRTE)',
  joditAnswer: '.shortLongAnsComponent textarea.ansJODIT',
  rteAnswer: '.shortLongAnsComponent textarea.ansRTE',
  charCounter: '.shortLongAnsComponent .characters_display',
  charCurrent: '.shortLongAnsComponent .current_characters',
  /** Custom-keyboard container + add button. */
  customKeyboard: '.shortLongAnsComponent .SLA-custKeybCont',
  addSpecialChars: '.shortLongAnsComponent .keyboard_btn',
} as const;

/** Settings panel DOM (#shortLongAns-setting). */
export const ER_SETTINGS = {
  panel: '#shortLongAns-setting',
  title: '#shortLongAns-setting .templateName',

  // Label type
  showLabelType: '#shortLongAns-setting #label-visibility',
  labelPrimary: '#shortLongAns-setting input[name="labelType"][value="primary"]',
  labelSecondary: '#shortLongAns-setting input[name="labelType"][value="secondary"]',

  // Answer type (Short / Long / RTE)
  answerShort: '#shortLongAns-setting input[name="placement"].answerTypeBtn[value="shortAns"]',
  answerLong: '#shortLongAns-setting input[name="placement"].answerTypeBtn[value="longAns"]',
  answerRte: '#shortLongAns-setting input[name="placement"].answerTypeBtn[value="RTE"]',

  // Keyboard type (Basic / Advance JODIT) — only when TOCFlag
  keyboardBasic: '#shortLongAns-setting input[name="keyboard"].keyboardTypeBtn[value="BASIC"]',
  keyboardAdvance: '#shortLongAns-setting input[name="keyboard"].keyboardTypeBtn[value="JODIT"]',

  // Enable Keyboard (disabled unless a special language is selected)
  enableKeyboard: '#shortLongAns-setting input[ng-model="currSettings.isCustomKeyboardEnable"]',

  // Outline / fill (only when styleSelected == 'style1')
  outlineNone: '#shortLongAns-setting input[name="outline"][value="outline"]',
  outlineBg: '#shortLongAns-setting input[name="outline"][value="outlineBg"]',
  colorOptions: '#shortLongAns-setting .colorOption .color',
  colorPickerInput: '#shortLongAns-setting .colorPickerInputBox',

  // Tags
  tagsInput: '#shortLongAns-setting #metaTagsInput',

  // Accessibility / Alt Text
  accessibilityLabel: '#shortLongAns-setting .accessibility',
  altText: '#shortLongAns-setting textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '#shortLongAns-setting .altTextCharLimitText',

  // Styles
  stylePanel: '#shortLongAns-setting stylepanel',
} as const;

/** Source-verified business rules. */
export const ER_RULES = {
  altTextMaxLength: 2000,
  defaultAnswerType: 'RTE',
  defaultOutline: 'outline',
} as const;
