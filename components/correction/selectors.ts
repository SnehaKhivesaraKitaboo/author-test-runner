/// <reference types="cypress" />
// =============================================================================
// Correction — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                  (widget catalog: name "Correction", dataType "correction")
//   templates/Correction/correction.html              (canvas DOM)
//   templates/Correction/correction-settings.html     (settings panel)
//   templates/Correction/default/correction.json      (default field data + style_tab)
//   templates/Correction/scripts/correction.js        (directive: correctionTemplate)
//   templates/stylepanel.html                          (shared <stylepanel> markup)
//
// dataType = "correction"; widget name = "Correction"; directive = "correction-template".
// Canvas wrapper = `.canvas-wrap.correction[correction-template]`. Settings panel
// class = ".correction-settings-panel" (title "Correction", icon .icon-Correction).
//
// Source-driven facts:
//   • Header Text + Instruction Text are visible by default
//     (isHeaderVisible / isInstructionVisible default true in correction.json).
//   • "Add Sentence" pushes a new Text Description into settings.correctionInfo.
//     Script enforces max_question = 10, min_question = 1 (correction.js lines 6-7).
//     NOTE: the canvas label HTML toggles a 'btn-disabled' CSS class at length>=6
//     (visual hint) while the script still allows pushes up to 10 — a source
//     ambiguity flagged in CORRECTION-DEEP-AUTOMATION.md.
//   • Row delete anchor (.row-delete) is .disabled when correctionInfo.length===1.
//   • Outline radios: value "outline" (No Outline) / "outlineBg" (Outline) bound to
//     currSettings.outline; default = "outline" (correction.json).
//   • Action Assets colour: .colorPickerButton + .colorPickerInputBox bound to
//     currSettings.Appearance (default "#7eb1eb").
//   • Add Header / Add Instruction Text checkboxes (#header-visibility /
//     #instr-visibility). "Allow activity restart" / "Add Show Me" only render
//     when !currSettings.isGroupActivity (flag-gated).
//   • Tags use <tag-manager> (renders only when currSettings.showText, default true).
//   • Strikethrough popups (.correction-Popup / .correction-Popup1) appear on word
//     selection in the sentence text and host strikethrough + delete-marker buttons.
//   • Copy / Delete component buttons come from the shared add-common-hover chrome
//     (not Correction-specific markup) — resolved by best-effort selectors.
// =============================================================================

export const CORRECTION_DATA_TYPE = 'correction';
export const CORRECTION_WIDGET_NAME = 'Correction';

/** Authoring-canvas DOM (the dropped Correction component). */
export const CORRECTION_CANVAS = {
  widget: `[data-type="${CORRECTION_DATA_TYPE}"], .canvas-wrap.correction`,
  /** The component wrapper carrying the directive. */
  component: '.canvas-wrap.correction[correction-template], .canvas-wrap.correction',
  form: '.canvas-wrap.correction .correction-editor',

  /** Header / Instruction blocks (toggle via displayBlock/displayNone). */
  headerBlock: '.canvas-wrap.correction .sc-intro-holder.header-text',
  headerText: '.canvas-wrap.correction .sc-intro[ng-model="fieldData.introduction"]',
  instructionBlock: '.canvas-wrap.correction .sc-instr-holder.instruction-text',
  instructionText: '.canvas-wrap.correction .sc-instr[ng-model="fieldData.instruction"]',

  /** Sentence (Text Description) rows. */
  body: '.canvas-wrap.correction .correction-body',
  addSentence: '.canvas-wrap.correction .add-sentence-1 span[data-ng-click="addSentenceClick($event)"]',
  addSentenceLabel: '.canvas-wrap.correction .add-sentence-1',
  sentenceRow: '.canvas-wrap.correction .form-row.correction-text',
  sentenceText: '.canvas-wrap.correction .sc-sentence.sentence-text',
  sentenceLabel: '.canvas-wrap.correction .correction-text .fill_text.pc-label',
  rowDelete: '.canvas-wrap.correction .row-delete',
  rowDeleteDisabled: '.canvas-wrap.correction .row-delete.disabled',

  /** Strikethrough / correct-answer marker popups (shown on word selection). */
  strikePopup: '.canvas-wrap.correction .correction-Popup',
  strikePopupAlt: '.canvas-wrap.correction .correction-Popup1',
  strikeBtn: '.canvas-wrap.correction .correction-Strik.strikethrough',
  strikeRemoveBtn: '.canvas-wrap.correction .popup-Delete',

  /** Shared component chrome (copy / delete) — best-effort across hover toolbar. */
  copyButton:
    '.canvas-wrap.correction .icon-Copy, .component-hover .icon-Copy, .add-common-hover .icon-Copy, [ng-click*="copy"]',
  deleteButton:
    '.canvas-wrap.correction .icon-Delete.delete-component, .component-hover .icon-Delete, .add-common-hover .icon-Delete, [ng-click*="delete"]',
} as const;

/** Settings panel DOM (.correction-settings-panel). */
export const CORRECTION_SETTINGS = {
  panel: '.correction-settings-panel',
  title: '.correction-settings-panel .para-ellipsis',
  icon: '.correction-settings-panel .icon-Correction',

  // Add Header / Add Instruction Text (default on)
  addHeader: '.correction-settings-panel input#header-visibility[ng-model="currSettings.isHeaderVisible"]',
  addInstruction: '.correction-settings-panel input#instr-visibility[ng-model="currSettings.isInstructionVisible"]',

  // Flag-gated (only when !isGroupActivity)
  allowRestart: '.correction-settings-panel input#add-activity-restart[ng-model="currSettings.allowRestart"]',
  addShowMe: '.correction-settings-panel input#add-show-me[ng-model="currSettings.showmecheckbox"]',

  // Outline / Action Assets
  outlineNone: '.correction-settings-panel input[name="outline"][value="outline"]',
  outlineBg: '.correction-settings-panel input[name="outline"][value="outlineBg"]',
  colorPickerButton: '.correction-settings-panel .colorPickerButton',
  colorPickerInput: '.correction-settings-panel .colorPickerInputBox',
  colorPickerLabel: '.correction-settings-panel .colorPickerLabel',

  // Tags
  tagManager: '.correction-settings-panel tag-manager',
  tagsContainer: '.correction-settings-panel .tagsContainer',

  // Styles (shared <stylepanel>)
  stylePanel: '.correction-settings-panel stylepanel',
} as const;

/** Source-verified business rules / defaults (correction.js + correction.json). */
export const CORRECTION_RULES = {
  /** correction.js: var max_question = 10; */
  maxSentences: 10,
  /** correction.js: var min_question = 1; */
  minSentences: 1,
  /** correction.html visual disable threshold (>=6 → btn-disabled). */
  visualDisableThreshold: 6,
  /** correction.json default. */
  defaultOutline: 'outline',
  defaultAppearance: '#7eb1eb',
  headerVisibleDefault: true,
  instructionVisibleDefault: true,
  widgetName: CORRECTION_WIDGET_NAME,
} as const;
