/// <reference types="cypress" />
// =============================================================================
// ELA Multipart (Multipart Question / Group Activity) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js
//     • Widgets tab entry: name "Multipart Question", dataType
//       "group-interactivity-template" (also exposed as name "Group Activity").
//     • url      templates/group-activity/group-activity.html
//     • json     templates/group-activity/default/group-activity.json
//     • settings templates/group-activity/group-activity-settings.html
//   templates/group-activity/group-activity.html               (canvas DOM)
//   templates/group-activity/group-activity-settings.html      (settings panel)
//   templates/group-activity/default/group-activity.json       (default field data)
//   templates/group-activity/scripts/group-activity-directive.js (directive)
//   templates/stylepanel.html                                  (shared <stylepanel>)
//
// dataType  = "group-interactivity-template"  (NOT a separate "ela-multipart" type;
//             the QC suite slug "ela-multipart" maps onto this widget — see the
//             ELA-MULTIPART-DEEP-AUTOMATION.md "Verified dataType" note).
// widgetName = "Multipart Question" (Widgets tab); alias "Group Activity".
// directive  = groupInteractivity (attribute "group-interactivity").
//
// Source-driven facts:
//   • Container wrapper class = ".group-interactivity-container"; the inner
//     repeater host carries the "group-interactivity" attribute.
//   • Sub-question slots: ".question-container" ng-repeat over
//     fieldData.settings.questionBank. Empty slots render ".empty-droppable-text"
//     with the text "Drag Assessment widget from right panel"; filled slots host
//     content in ".column-content.editables" (.save-html, ng-drop).
//   • A fresh empty slot is auto-appended after each successful inner drop, and
//     pushes are capped at questionBank.length < 35 (directive max parts = 35).
//   • Settings panel id = "#fib-settings-panel" (shared markup, directive
//     "group-interactivity-settings", title "Group Activity").
//   • Interactive Component yes/no radios bind currSettings.isInteractive
//     (default "yes"). Worked-Example style forces "no".
//   • Shuffle Questions (#add-shuftle-choices), Background Color (#grp-Background
//     → currSettings.BackgroundColor) and Corner Radius (#grp-CornerRadius →
//     currSettings.CornerRadius) checkboxes reveal dependent inputs.
//   • Outline radios value "outline" (No Outline) / "outlineBg" (Outline) bind
//     currSettings.outline (default "outline"); Action Assets colour via
//     #appearanceInput + .colorPickerInputBox (currSettings.Appearance "#7eb1eb").
//   • Tags input = #metaTagsInput (currSettings.metaTags).
//   • Header Background Color picker (#headerBgColorInput) renders only when
//     styleClass == "workedExample" — FLAG-GATED.
//   • Try Again (#add-activity-restart) / Show Me (#add-show-me) / Reset
//     (#btn-rest) render only when !isGradableActivity — FLAG-GATED.
//   • Worked-Example toggle bar exposes a Hide/Show button (.showhideButton)
//     driven by currSettings.isContentVisible.
// =============================================================================

export const ELA_MULTIPART_DATA_TYPE = 'group-interactivity-template';
export const ELA_MULTIPART_WIDGET_NAME = 'Multipart Question';
export const ELA_MULTIPART_WIDGET_ALIAS = 'Group Activity';

/** Authoring-canvas DOM (the dropped Multipart container). */
export const ELA_MULTIPART_CANVAS = {
  widget: `[data-type="${ELA_MULTIPART_DATA_TYPE}"], .group-interactivity-container`,
  /** Outer container wrapper. */
  container: '.group-interactivity-container',
  /** Inner repeater host carrying the directive. */
  repeaterHost: '.group-interactivity-container [group-interactivity], .group-interactivity-container [data-maxtries]',
  /** Box that holds all the question slots. */
  questionBox: '.group-interactivity-container .question-container-box',

  /** Sub-question slots (one per questionBank entry). */
  questionSlot: '.group-interactivity-container .question-container',
  questionSlotEmpty: '.group-interactivity-container .question-container.questionsEmptyItemGrp',
  questionSlotFilled: '.group-interactivity-container .question-container.questionsAddedItemGrp',
  /** Empty drop zone ("Drag Assessment widget from right panel"). */
  emptyDrop: '.group-interactivity-container .empty-droppable-text',
  emptyDropText: '.group-interactivity-container .drag-widget-text',
  /** Filled content holder inside a slot. */
  slotContent: '.group-interactivity-container .save-html.column-content.editables',

  /** Style2 navigation (numbers strip) shows when style2 && questionBank > 2. */
  style2Nav: '.group-interactivity-container .style2NavigationBtns',
  numberStrip: '.group-interactivity-container .numbersContainer .number',

  /** Result / attempt summary band. */
  attemptInfo: '.group-interactivity-container .group-interactivity-attempt-info',
  correctCount: '.group-interactivity-container .correct-grp-question',
  incorrectCount: '.group-interactivity-container .incorrect-grp-question',
  partialCount: '.group-interactivity-container .partial-grp-question',

  /** Shared action buttons (Submit/ShowMe/Reset/TryAgain) host. */
  actionButtons: '.group-interactivity-container [commonbuttons].group-interactivity-btn',

  /** Worked-Example toggle bar (styleClass == "workedExample"). */
  toggleBar: '.group-interactivity-container .toggle-bar',
  hideShowButton: '.group-interactivity-container .showhideButton',

  /** Shared component chrome (copy / delete) — best-effort across hover toolbar. */
  copyButton:
    '.group-interactivity-container .icon-Copy, .component-hover .icon-Copy, .add-common-hover .icon-Copy, [ng-click*="copy"]',
  deleteButton:
    '.group-interactivity-container .icon-Delete.delete-component, .component-hover .icon-Delete, .add-common-hover .icon-Delete, [ng-click*="delete"]',
} as const;

/** Settings panel DOM (#fib-settings-panel, directive group-interactivity-settings). */
export const ELA_MULTIPART_SETTINGS = {
  panel: '#fib-settings-panel[group-interactivity-settings], #fib-settings-panel',
  title: '#fib-settings-panel .para-ellipsis',
  icon: '#fib-settings-panel .txt-set-icon',

  // Interactive Component yes/no (currSettings.isInteractive)
  interactiveYes: '#fib-settings-panel input[name="yes"][value="yes"][ng-model="currSettings.isInteractive"]',
  interactiveNo: '#fib-settings-panel input[name="no"][value="no"][ng-model="currSettings.isInteractive"]',

  // Tags
  tagsInput: '#fib-settings-panel #metaTagsInput',
  tagsLabel: '#fib-settings-panel label[for="metaTagsInput"]',

  // Shuffle Questions
  shuffle: '#fib-settings-panel #add-shuftle-choices',

  // Header Background Color — FLAG-GATED (styleClass == "workedExample")
  headerBgInput: '#fib-settings-panel #headerBgColorInput',

  // Background Color checkbox + dependent picker (currSettings.BackgroundColor)
  backgroundColor: '#fib-settings-panel #grp-Background',
  backgroundColorInput:
    '#fib-settings-panel .colorPickerContainer[ng-show="currSettings.allowGroupActivityBackgroundColor"] .colorPickerInputBox',

  // Corner Radius checkbox + dependent input (currSettings.CornerRadius)
  cornerRadius: '#fib-settings-panel #grp-CornerRadius',
  cornerRadiusInput: '#fib-settings-panel #border_radius-input',

  // Advance Setting — Outline radios (currSettings.outline)
  outlineNone: '#fib-settings-panel input[name="outline"][value="outline"]',
  outlineBg: '#fib-settings-panel input[name="outline"][value="outlineBg"]',

  // Action Assets colour (currSettings.Appearance)
  appearanceInput: '#fib-settings-panel #appearanceInput',
  actionAssetsLabel: '#fib-settings-panel label[for="appearanceInput"]',

  // FLAG-GATED (only when !isGradableActivity)
  tryAgain: '#fib-settings-panel #add-activity-restart',
  tryAgainCount: '#fib-settings-panel #try-again-count',
  showMe: '#fib-settings-panel #add-show-me',
  reset: '#fib-settings-panel #btn-rest',

  // Styles (shared <stylepanel>)
  stylePanel: '#fib-settings-panel stylepanel',
} as const;

/** Source-verified business rules / defaults (directive + group-activity.json). */
export const ELA_MULTIPART_RULES = {
  /** group-activity-directive.js: pushes capped at questionBank.length < 35. */
  maxParts: 35,
  /** group-activity.json seeds one empty questionBank entry. */
  initialParts: 1,
  /** group-activity.json default. */
  defaultOutline: 'outline',
  defaultAppearance: '#7eb1eb',
  defaultInteractive: 'yes',
  defaultStyleClass: 'style2',
  defaultCornerRadius: '16',
  widgetName: ELA_MULTIPART_WIDGET_NAME,
} as const;
