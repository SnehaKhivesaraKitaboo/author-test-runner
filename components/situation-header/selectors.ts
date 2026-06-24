/// <reference types="cypress" />
// =============================================================================
// Situation Header (situationbox element) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                       (widget catalog: name "Situation Header", dataType "situationbox")
//   templates/situation-box/situation-box.html             (canvas DOM)
//   templates/situation-box/situation-box-settings.html    (settings panel body)
//   templates/situation-box/default/situation-box.json     (default field data)
//   templates/situation-box/scripts/situation-box-directive.js (directive: situationbox)
//
// dataType = "situationbox"; widget name = "Situation Header"; directive =
// "situationbox" (restrict: "EA" → attribute selector [situationbox]).
// templateName (default json) = "situationBoxComponent"; settings panel
// con.currSettings.templateName = "situation Header".
//
// Source-driven facts:
//   • Situation Header is an ELEMENT (NOT in support/module-setup.ts
//     ASSESSMENT_DATA_TYPES) — config.js lists it in the same general catalog
//     group as Text/Image/Video/Callout Box, so resolveDropTarget routes it to
//     the canvas (#desktop_view), NOT a Generic Step column.
//   • Canvas wrapper = `div[situationbox].situation-box-container`
//     (default purple background-color #f3ecfe, border-radius 16px).
//   • Fixed (non-editable) arrow icon = `.situation-box-arrow-image-container img`
//     (src "images/arrow.svg", draggable="false", parent pointer-events:none,
//     user-select:none) — author cannot select/drag/delete it.
//   • Authoring text area = `.situation-box-text-editor` — a contenteditable RTE
//     field bound to ng-model fieldData.textArea (also .math-read-only-field for
//     math). Use cy.setContentEditableOn, never cy.type().
//   • Settings panel body (situation-box-settings.html) is loaded into the
//     shared `.componentSettingPanel`. It contains the title "Situation Header"
//     with `.icon-Situationbox`, an Accessibility label + `.accessibilityPara`
//     subtext, and an Alt Text textarea[ng-model="currSettings.altText"]
//     (maxlength=2000, counter "Chars 2000").
//   • Per QC, the component is intended for Generic & Multipart step layouts;
//     layout-availability gating is config-driven and verified gracefully.
// =============================================================================

export const SH_DATA_TYPE = 'situationbox';
export const SH_WIDGET_NAME = 'Situation Header';

/** Authoring-canvas DOM (the dropped Situation Header element). */
export const SH_CANVAS = {
  widget: `[situationbox], [data-type="${SH_DATA_TYPE}"]`,
  /** The component container (purple box). */
  component: '.situation-box-container',
  /** sd-item wrapper on the canvas that holds the dropped element. */
  sdItem: '#desktop_view .sd-item:has([situationbox]), #desktop_view .sd-item:has(.situation-box-container)',
  /** Fixed, non-editable arrow icon (and its no-pointer container). */
  arrowContainer: '.situation-box-container .situation-box-arrow-image-container',
  arrowIcon: '.situation-box-container .situation-box-arrow-image-container img',
  /** Authoring RTE text area (contenteditable; ng-model fieldData.textArea). */
  textEditor: '.situation-box-container .situation-box-text-editor',
  /** Math holder inside the text editor (math-read-only-field). */
  mathField: '.situation-box-container .situation-box-text-editor .auth-mathfield-holder',
} as const;

/** Settings panel DOM (rendered into the shared .componentSettingPanel). */
export const SH_SETTINGS = {
  panel: '.componentSettingPanel',
  title: '.componentSettingPanel .txt-set-title .para-ellipsis',
  icon: '.componentSettingPanel .icon-Situationbox',

  // Accessibility / Alt Text
  accessibilityLabel: '.componentSettingPanel .accessibility',
  accessibilityPara: '.componentSettingPanel .accessibilityPara',
  altTextLabel: '.componentSettingPanel .headerPara',
  altText: '.componentSettingPanel textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '.componentSettingPanel .altTextCharLimitText',
} as const;

/** sd-item lifecycle controls (shared canvas chrome: copy / delete). */
export const SH_ACTIONS = {
  copyIcon: '.duplicate-widget-icon, .icon-Page-duplication-01',
  deleteIcon: '.icon-Delete, .dlet_icon, [class*="delete"]',
} as const;

/** Source-verified business rules / defaults. */
export const SH_RULES = {
  altTextMaxLength: 2000,
  altTextCounterText: 'Chars 2000',
  defaultBackgroundColor: '#f3ecfe',
  settingsTitle: 'Situation Header',
  widgetName: SH_WIDGET_NAME,
} as const;
