/// <reference types="cypress" />
// =============================================================================
// Highlighter (highlight) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                         (catalog: name "Highlighter", dataType "highlight",
//                                                              iconClass "icon-Highlight-words", directive highlightTemplate)
//   templates/highlightTemplate/highlightTemplate.html       (canvas DOM)
//   templates/highlightTemplate/highlightTemplateSettings.html (settings panel)
//   templates/highlightTemplate/default/highlightTemplate.json (default field data)
//   templates/highlightTemplate/scripts/highlightTemplate.js   (directive: highlightTemplate)
//
// dataType = "highlight"; widget name = "Highlighter"; directive = "highlightTemplate"
// (HTML attribute spelled `highLight-template`).
// Canvas wrapper = `.canvas-wrap.highLight.component-holder`. Settings panel uses
// a CLASS (no id): `.highLight-settings-panel` (title "Highlighter").
//
// Source-driven facts:
//   • Highlighter is an ASSESSMENT widget (ASSESSMENT_DATA_TYPES contains "highlight"
//     in support/module-setup.ts) → dropped into a Generic Step column.
//   • Header (.sc-intro) + Instruction (.sc-instr) are contenteditable, gated by
//     settings.isHeaderVisible / settings.isInstructionVisible (both default true).
//   • Sentence rows repeat over settings.highLightInfo; each row is `.highLight-text`
//     with a contenteditable `.sc-sentence` ({{id}}statement) and a `.row-delete`
//     anchor that is `.disabled` when only one sentence exists (min_question = 1).
//   • Add Sentence is a span[data-ng-click="addSentenceClick($event)"] inside
//     `.add-sentence-highLight-div`; max_question = 10 (label gets `.btn-disabled`).
//   • The "Incorrect" / Undo control lives in floating `.highLight-Popup*` markup
//     (a runtime selection popup). Marking incorrect requires a live DOM Range +
//     execCommand selection → deferred (Preview/Reader student flow).
//   • Settings checkboxes: #add-activity-restart, #add-show-me, #header-visibility,
//     #instr-visibility (Show Me / Header / Instruction default checked via JSON).
//     #add-show-me and #add-activity-restart render only when !isGroupActivity.
//   • Outline radios: name="outline" value "outline" (No Outline) / "outlineBg"
//     (Outline). Action Assets colour: `.colorPickerButton` + `.colorPickerInputBox`.
//   • Style panel = shared <stylepanel> (style1 active, style2 "coming soon").
//   • Tags = <tag-manager> inside `.tagsContainer` (renders when currSettings.showText).
// =============================================================================

export const HL_DATA_TYPE = 'highlight';
export const HL_WIDGET_NAME = 'Highlighter';

/** Authoring-canvas DOM (the dropped Highlighter component). */
export const HL_CANVAS = {
  widget: `[data-type="${HL_DATA_TYPE}"], .canvas-wrap.highLight`,
  /** Component wrapper (carries the highLight-template directive). */
  component: '.canvas-wrap.highLight.component-holder',
  form: '.highLight-editor',
  /** Header (contenteditable; ng-model fieldData.introduction). */
  header: '.canvas-wrap.highLight .sc-intro',
  headerHolder: '.canvas-wrap.highLight .header-text',
  /** Instruction (contenteditable; ng-model fieldData.instruction). */
  instruction: '.canvas-wrap.highLight .sc-instr',
  instructionHolder: '.canvas-wrap.highLight .instruction-text',
  /** Body that hosts sentences + common buttons. */
  body: '.canvas-wrap.highLight .highLight-body',
  /** Add Sentence label + clickable span. */
  addSentenceDiv: '.canvas-wrap.highLight .add-sentence-highLight-div',
  addSentenceClick: '.canvas-wrap.highLight .add-sentence-highLight-div span[data-ng-click="addSentenceClick($event)"]',
  addSentenceLabel: '.canvas-wrap.highLight .add-sentence-1',
  /** Repeated sentence rows (one per settings.highLightInfo entry). */
  sentenceRow: '.canvas-wrap.highLight .highLight-text',
  /** Editable statement inside a row (contenteditable; ng-model option.statement). */
  sentence: '.canvas-wrap.highLight .sc-sentence',
  /** Delete-sentence anchor; `.disabled` when only one sentence remains. */
  sentenceDelete: '.canvas-wrap.highLight .row-delete',
  /** Floating selection popup with "Incorrect" + Undo (runtime). */
  popup: '.canvas-wrap.highLight .highLight-Popup',
  popupIncorrect: '.canvas-wrap.highLight .highLight-Popup .myHighLight.strikethrough',
  popupUndo: '.canvas-wrap.highLight .highLight-Popup .icon-Undo.popup-Delete',
  /** Common Submit / Show Me / Reset / Try Again buttons bar. */
  commonButtons: '.canvas-wrap.highLight [commonbuttons]',

  /** Shared component chrome (copy / delete) from add-common-hover — best-effort. */
  copyButton:
    '.canvas-wrap.highLight .icon-Copy, .component-hover .icon-Copy, .add-common-hover .icon-Copy, [ng-click*="copy"]',
  deleteButton:
    '.canvas-wrap.highLight .icon-Delete.delete-component, .component-hover .icon-Delete, .add-common-hover .icon-Delete, [ng-click*="delete"]',
} as const;

/** Settings panel DOM (class-based: .highLight-settings-panel, title "Highlighter"). */
export const HL_SETTINGS = {
  panel: '.highLight-settings-panel',
  title: '.highLight-settings-panel .txt-set-title .para-ellipsis',
  icon: '.highLight-settings-panel .txt-set-icon.icon-Highlight-words',

  // Checkboxes (Show Me / Header / Instruction / Activity Restart)
  allowRestart: '.highLight-settings-panel #add-activity-restart',
  showMe: '.highLight-settings-panel #add-show-me',
  headerVisibility: '.highLight-settings-panel #header-visibility',
  instructionVisibility: '.highLight-settings-panel #instr-visibility',

  // Outline / Fill
  outlineNone: '.highLight-settings-panel input[name="outline"][value="outline"]',
  outlineBg: '.highLight-settings-panel input[name="outline"][value="outlineBg"]',

  // Action Assets colour picker
  colorPickerLabel: '.highLight-settings-panel .colorPickerLabel',
  colorPickerButton: '.highLight-settings-panel .colorPickerButton',
  colorPickerInput: '.highLight-settings-panel .colorPickerInputBox',
  colorPickerMenu: '.highLight-settings-panel settingcolorpicker',

  // No. of attempts (visibility:hidden select; only when !isGroupActivity)
  attemptsSelect: '.highLight-settings-panel .no_of_attempts select',

  // Tags
  tagsContainer: '.highLight-settings-panel .tagsContainer',
  tagManager: '.highLight-settings-panel tag-manager',

  // Styles (shared <stylepanel>)
  stylePanel: '.highLight-settings-panel stylepanel',
} as const;

/** Source-verified business rules / defaults (from default/highlightTemplate.json + directive). */
export const HL_RULES = {
  minSentences: 1,
  maxSentences: 10,
  defaultOutline: 'outline',
  defaultAppearance: '#7eb1eb',
  /** Show Me / Header / Instruction checkboxes default checked. */
  defaultShowMe: true,
  defaultHeaderVisible: true,
  defaultInstructionVisible: true,
  activeStyle: 'style1',
  comingSoonStyle: 'style2',
  widgetName: HL_WIDGET_NAME,
} as const;
