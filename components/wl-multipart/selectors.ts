/// <reference types="cypress" />
// =============================================================================
// WL Multipart (Multipart Question / group-interactivity-template) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js
//     • Widget catalog entry { name: "Multipart Question",
//       dataType: "group-interactivity-template",
//       url: templates/group-activity/group-activity.html,
//       settingsURL: templates/group-activity/group-activity-settings.html }
//       (a second alias entry "Group Activity" shares the same dataType).
//     • Per-subject feature flag "group-interactivity-template": true|false —
//       FLAG-GATED, so some subjects do NOT offer the widget at all.
//   templates/group-activity/group-activity.html              (canvas DOM)
//   templates/group-activity/group-activity-settings.html     (settings panel)
//   templates/group-activity/default/group-activity.json      (default settings)
//   templates/group-activity/scripts/group-activity-directive.js  (directives)
//
// dataType  = "group-interactivity-template"
// widget    = "Multipart Question" (WL catalog label) / "Group Activity" (alias)
// directive = [group-interactivity] (canvas) / [group-interactivity-settings] (panel)
//
// WL module routing (support/module-setup.ts):
//   • WL is single-page → the multipart is dropped onto the Instructions-for-
//     Students canvas (#desktop_view), NOT into a Generic Step column.
//   • resolveDropTarget('group-interactivity-template', _, 'wl') === 'canvas'.
//   • cy.dropComponent permits this assessment widget only when module === 'wl'.
//
// Source-driven facts:
//   • Canvas wrapper class = ".group-interactivity-container"; inner directive
//     element carries [group-interactivity]. styleClass default = "style2".
//   • Each question "part" is a ".question-container" carrying question-index;
//     empty slots show ".empty-droppable-text" ("Drag Assessment widget from
//     right panel"). The directive auto-pushes a new empty slot after each drop
//     (questionBank grows; capped at 35 in onDropComplete/onPasteDropComplete).
//   • Default questionBank length = 1 (group-activity.json) — one empty part.
//   • Settings panel id = "#fib-settings-panel" with [group-interactivity-settings];
//     title text = "Group Activity"; icon class = ".icon-Fill-in-the-blank".
//   • Interactive Component radios bind currSettings.isInteractive ("yes"/"no");
//     default "yes" (json + directive forces "yes" when undefined).
//   • Shuffle Questions checkbox = "#add-shuftle-choices"
//     (currSettings.shuffleQuestionCheckbox, default false).
//   • Tags input = "#metaTagsInput" (currSettings.metaTags).
//   • Background Color checkbox = "#grp-Background" reveals a colour picker
//     (currSettings.BackgroundColor / allowGroupActivityBackgroundColor).
//   • Corner Radius checkbox = "#grp-CornerRadius" reveals #border_radius-input
//     (maxlength=2; allowGroupActivityBorderRadius).
//   • Header Background Color picker renders ONLY when styleClass=="workedExample".
//   • Advance Setting: Outline radios value "outline"(No Outline)/"outlineBg"(Outline)
//     (currSettings.outline, default "outline"); Action Assets colour picker
//     (#appearanceInput, currSettings.Appearance default "#7eb1eb").
//   • Try Again (#add-activity-restart) / Show Me (#add-show-me) / Reset (#btn-rest)
//     render ONLY when !isGradableActivity — FLAG-GATED runtime state.
//   • Worked Example style adds a Hide/Show toggle bar (.toggle-bar .showhideButton).
//   • The "WL language / special-character keyboard" QC cases concern the
//     ASSESSMENT WIDGETS dropped INTO the parts (Extended Response / FIB), not the
//     multipart shell — there is no language markup in the group-activity source.
// =============================================================================

export const WL_MULTIPART_DATA_TYPE = 'group-interactivity-template';
/** Primary catalog label for WL; falls back to dataType match in dropComponent. */
export const WL_MULTIPART_WIDGET_NAME = 'Multipart Question';
/** Alias label sharing the same dataType (Widgets group). */
export const WL_MULTIPART_WIDGET_ALIAS = 'Group Activity';

/** Authoring-canvas DOM (the dropped Multipart shell). */
export const WL_MULTIPART_CANVAS = {
  /** Match by data-type attribute (set on the sd-item) or wrapper class. */
  widget: `[data-type="${WL_MULTIPART_DATA_TYPE}"], .group-interactivity-container`,
  /** Outer container rendered by the template. */
  container: '.group-interactivity-container',
  /** Directive element holding the question parts. */
  directive: '.group-interactivity-container [group-interactivity], [group-interactivity]',

  /** Worked-Example toggle bar (Hide/Show) — only when styleClass=="workedExample". */
  toggleBar: '.group-interactivity-container .toggle-bar',
  toggleButton: '.group-interactivity-container .toggle-bar .showhideButton',

  /** Style-2 horizontal navigation (only when >2 questions in style2). */
  style2Nav: '.group-interactivity-container .style2NavigationBtns',
  navLeft: '.group-interactivity-container .style2NavigationBtns .leftArr',
  navRight: '.group-interactivity-container .style2NavigationBtns .rightArr',
  navNumbers: '.group-interactivity-container .style2NavigationBtns .numbersContainer .number',

  /** Question "parts". */
  questionContainerBox: '.group-interactivity-container .question-container-box',
  questionContainer: '.group-interactivity-container .question-container',
  emptySlotText: '.group-interactivity-container .empty-droppable-text',
  emptyDropHint: '.group-interactivity-container .empty-droppable-text .drag-widget-text',
  columnContent: '.group-interactivity-container .column-content',

  /** Result / attempt summary chrome. */
  attemptInfo: '.group-interactivity-container .group-interactivity-attempt-info',
  resultParent: '.group-interactivity-container .group-interactivity-result-parent',
  correctCount: '.group-interactivity-container .correct-grp-question',
  incorrectCount: '.group-interactivity-container .incorrect-grp-question',
  partialCount: '.group-interactivity-container .partial-grp-question',

  /** Common action buttons (Submit/Show Me/Reset/Try Again) — only when isInteractive=="yes". */
  actionButtons: '.group-interactivity-container [commonbuttons].group-interactivity-btn',

  /** Shared component chrome (copy / delete) — best-effort across hover toolbar. */
  copyButton:
    '#desktop_view .sd-item .icon-Copy, .component-hover .icon-Copy, .add-common-hover .icon-Copy, [ng-click*="copy"]',
  deleteButton:
    '#desktop_view .sd-item .icon-Delete, .component-hover .icon-Delete, .add-common-hover .icon-Delete, [ng-click*="delete"]',
} as const;

/** Settings panel DOM (#fib-settings-panel[group-interactivity-settings]). */
export const WL_MULTIPART_SETTINGS = {
  panel: '#fib-settings-panel[group-interactivity-settings], #fib-settings-panel.FIBsetting',
  title: '#fib-settings-panel .para-ellipsis',
  icon: '#fib-settings-panel .icon-Fill-in-the-blank',
  stylePanel: '#fib-settings-panel stylepanel',
  settingsSection: '#fib-settings-panel .group-interactivity-setting-panel',

  // Interactive Component (currSettings.isInteractive)
  interactiveYes: '#fib-settings-panel input[name="yes"][value="yes"][ng-model="currSettings.isInteractive"]',
  interactiveNo: '#fib-settings-panel input[name="no"][value="no"][ng-model="currSettings.isInteractive"]',

  // Tags
  tagsInput: '#fib-settings-panel #metaTagsInput',
  tagsHelper: '#fib-settings-panel label[for="metaTagsInput"]',

  // Shuffle Questions
  shuffle: '#fib-settings-panel #add-shuftle-choices',

  // Background Color (checkbox → reveals picker)
  backgroundColor: '#fib-settings-panel #grp-Background',
  backgroundColorInput:
    '#fib-settings-panel .colorPickerContainer input.colorPickerInputBox[ng-model="currSettings.groupComponentBgColor"]',

  // Corner Radius (checkbox → reveals numeric input)
  cornerRadius: '#fib-settings-panel #grp-CornerRadius',
  cornerRadiusInput: '#fib-settings-panel #border_radius-input',

  // Header Background Color (only when styleClass=="workedExample")
  headerBgColorInput: '#fib-settings-panel #headerBgColorInput',

  // Advance Setting — Outline / Action Assets
  outlineNone: '#fib-settings-panel input[name="outline"][value="outline"]',
  outlineBg: '#fib-settings-panel input[name="outline"][value="outlineBg"]',
  appearanceInput: '#fib-settings-panel #appearanceInput',
  appearanceButton: '#fib-settings-panel .groupActivityAdvanceSettingDiv .colorPickerButton',

  // Flag-gated (only when !isGradableActivity)
  tryAgain: '#fib-settings-panel #add-activity-restart',
  tryAgainCount: '#fib-settings-panel #try-again-count',
  showMe: '#fib-settings-panel #add-show-me',
  reset: '#fib-settings-panel #btn-rest',
} as const;

/** Source-verified business rules / defaults (group-activity.json + directive). */
export const WL_MULTIPART_RULES = {
  /** group-activity.json default questionBank length. */
  defaultParts: 1,
  /** onDropComplete/onPasteDropComplete cap: questionBank.push only when length < 35. */
  maxParts: 35,
  /** group-activity.json default. */
  defaultStyle: 'style2',
  defaultInteractive: 'yes',
  defaultOutline: 'outline',
  defaultAppearance: '#7eb1eb',
  defaultBorderRadius: '16',
  shuffleDefault: false,
  backgroundColorDefault: false,
  cornerRadiusDefault: false,
  /** #border_radius-input maxlength. */
  cornerRadiusMaxLength: 2,
  settingsTitle: 'Group Activity',
  widgetName: WL_MULTIPART_WIDGET_NAME,
} as const;
