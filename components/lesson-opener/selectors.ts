/// <reference types="cypress" />
// =============================================================================
// Lesson Opener (Lesson Opener Components) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js
//     widget catalog entry:
//       name "Lesson Opener Components", dataType "lessonOpenerComponent",
//       iconClass "icon-Lesson-opener", isDroppable true,
//       url "templates/lessonOpener/lessonOpener.html",
//       json "templates/lessonOpener/default/lessonOpener.json",
//       settingsURL "templates/lessonOpener/lessonOpener-setting-panel.html"
//   templates/lessonOpener/lessonOpener.html                 (canvas DOM)
//   templates/lessonOpener/lessonOpener-setting-panel.html   (settings panel)
//   templates/lessonOpener/default/lessonOpener.json         (default field data + style_tab)
//   templates/lessonOpener/scripts/lessonOpener-directive.js (directives:
//       lessonOpenerTemplate [attr lesson-opener-template] + lessonOpenerSetting
//       [attr lesson-opener-setting])
//   templates/stylepanel.html                                (shared <stylepanel> markup)
//   index.html                                               (.componentSettingPanel ng-include="settingsUrl")
//
// dataType = "lessonOpenerComponent"; widget name = "Lesson Opener Components";
// template directive = "lesson-opener-template"; settings directive =
// "lesson-opener-setting".
//
// Source-driven facts:
//   • Lesson Opener is a droppable ELEMENT (config isDroppable:true), NOT an
//     assessment widget — "lessonOpenerComponent" is absent from
//     support/module-setup.ts ASSESSMENT_DATA_TYPES, so resolveDropTarget routes
//     it to the canvas. It drops onto the Instructions-for-Students page
//     (#desktop_view) via cy.dropComponent('Lesson Opener Components'), NOT into
//     a Generic Step column. (The QC PDF narrates a "Generic Step" but the
//     shipped config registers it as an unrestricted droppable element.)
//   • The canvas wrapper is `section.lessonOpenerComponent[lesson-opener-template]`
//     (also carries data-type via the catalog). It renders ONE of four style
//     layouts gated by fieldData.settings.layoutColorActive:
//       style1 → "Learning Prompt"     (icon lessonOpener-Icon_1.svg)   [default]
//       style2 → "Make a Connection"   (icon lessonOpener-Icon_2.svg)
//       style3 → "My Learning Goals"   (icon starIcon.svg)
//       style4 → "Key Terms"           (icon keyTerm.svg)
//     The QC's four component groups (Key Terms / Make a Connection /
//     My Learning Goals / Learning Prompt) ARE these four styles.
//   • The fixed header label is `.sidebarHeaderText` (non-editable text node).
//   • The single editable body is `[contenteditable] .sidebarCaption`
//     (ng-model fieldData.paragraph) — use cy.setContentEditableOn, never cy.type().
//   • Settings panel: rendered in `.componentSettingPanel` via ng-include of
//     lessonOpener-setting-panel.html; root carries [lesson-opener-setting] with
//     `.icon-Lesson-opener.settings-icon` and `.templateName` "Lesson Opener".
//   • Styles are data-driven from settings.style_tab.stylesHolder; the shared
//     <stylepanel> renders each style button under `.stylebgdiv[id="style1..4"]`
//     containing `.styleBackground`; the active style adds class `active-style`
//     (style1 active by default per default JSON).
//   • Settings toggles: Show Header (#isHeaderVisible), Show Image (#imagedisplay),
//     Show Caption (#caption-option). Image/Video media upload + colour pickers
//     render only for non-sidebar styles (layoutColorActive == 'style100'); for
//     style1/2/3 the Background/Stroke colour inputs are DISABLED by source.
//   • Alt Text textarea (ng-model currSettings.altText) maxlength 2000.
//   • Image/Video upload uses an OS file picker (uploadfiles directive) — deferred.
// =============================================================================

export const LO_DATA_TYPE = 'lessonOpenerComponent';
export const LO_WIDGET_NAME = 'Lesson Opener Components';

/** Authoring-canvas DOM (the dropped Lesson Opener element). */
export const LO_CANVAS = {
  widget: `[data-type="${LO_DATA_TYPE}"], .lessonOpenerComponent, section[lesson-opener-template]`,
  /** The component <section lesson-opener-template> wrapper. */
  component: 'section.lessonOpenerComponent, section[lesson-opener-template]',
  sdItem:
    '#desktop_view .sd-item:has(section[lesson-opener-template]), #desktop_view .sd-item:has(.lessonOpenerComponent)',
  /** The visible style container for the currently active layout. */
  styleContainer: '.lessonOpenerComponent .image-text-container',
  /** Fixed (non-editable) header label text node. */
  headerLabel: '.lessonOpenerComponent .sidebarHeaderText',
  /** The single editable body (contenteditable; ng-model fieldData.paragraph). */
  body: '.lessonOpenerComponent [contenteditable].sidebarCaption',
  /** Style icons by layout (verified <img class> + src in lessonOpener.html). */
  learningPromptIcon: '.lessonOpenerComponent .learning-prompt-icon',
  makeConnectionIcon: '.lessonOpenerComponent .sidebar-style-4-icon',
  goalsKeyTermsIcon: '.lessonOpenerComponent .sidebar-style-5-icon',
} as const;

/** Settings panel DOM (rendered in .componentSettingPanel via lesson-opener-setting). */
export const LO_SETTINGS = {
  panel: '.componentSettingPanel',
  root: '.componentSettingPanel [lesson-opener-setting]',
  title: '.componentSettingPanel [lesson-opener-setting] .templateName',
  icon: '.componentSettingPanel .icon-Lesson-opener.settings-icon',

  // Style panel (shared <stylepanel>)
  stylePanel: '.componentSettingPanel .header-styles-panel',
  styleButtons: '.componentSettingPanel .header-styles-backgrnd-section .styleBackground',
  styleDivs: '.componentSettingPanel .stylebgdiv[id]',

  // Display toggles
  showHeader: '.componentSettingPanel #isHeaderVisible',
  showImage: '.componentSettingPanel #imagedisplay',
  showCaption: '.componentSettingPanel #caption-option',

  // Colour inputs (DISABLED by source for style1/2/3 sidebar layouts)
  backgroundColorInput:
    '.componentSettingPanel input.colorPickerInputBox[ng-model="currSettings.sidebarBgColor"]',
  strokeColorInput:
    '.componentSettingPanel input.colorPickerInputBox[ng-model="currSettings.sidebarStrokeColor"]',

  // Media upload (OS file picker / Kaltura — deferred)
  imageUpload: '.componentSettingPanel #upload-comp-img',
  videoUpload: '.componentSettingPanel #change-video',

  // Accessibility / Alt Text
  accessibilityLabel: '.componentSettingPanel .accessibility',
  accessibilityPara: '.componentSettingPanel .accessibilityPara',
  altText: '.componentSettingPanel textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '.componentSettingPanel .altTextCharLimitText',
} as const;

/**
 * Source-verified style option names (settings.style_tab.stylesHolder[].name →
 * <stylepanel> button wrapper id) mapped to the QC component groups.
 */
export const LO_STYLES = {
  /** style1 — "Learning Prompt" (default, styleactive:true). */
  learningPrompt: 'style1',
  /** style2 — "Make a Connection". */
  makeConnection: 'style2',
  /** style3 — "My Learning Goals". */
  myLearningGoals: 'style3',
  /** style4 — "Key Terms". */
  keyTerms: 'style4',
} as const;

/** Human-readable fixed header labels rendered per style (verified in lessonOpener.html). */
export const LO_STYLE_LABELS = {
  style1: 'Learning Prompt',
  style2: 'Make a Connection',
  style3: 'My Learning Goals',
  style4: 'Key Terms',
} as const;

/** Source-verified business rules / defaults (from default/lessonOpener.json). */
export const LO_RULES = {
  /** layoutColorActive default = style1 (Learning Prompt). */
  defaultStyle: 'style1',
  defaultStyleLabel: 'Learning Prompt',
  altTextMaxLength: 2000,
  styleCount: 4,
  widgetName: LO_WIDGET_NAME,
} as const;
