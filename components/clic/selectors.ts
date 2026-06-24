/// <reference types="cypress" />
// =============================================================================
// CLIC (Sketchpad) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                  (widget catalog: name "CLIC Component", dataType "sketchpad", iconClass "icon-clic")
//   templates/sketch-pad/sketchpad.html               (canvas DOM)
//   templates/sketch-pad/styles/sketchpad.css         (form styling)
//   templates/sketch-pad/default/sketchpad.json       (default field data)
//   templates/sketch-pad/scripts/sketchpad-directive.js (directive: sketchpad)
//   templates/sketch-pad/config.txt                   (alt catalog entry, dataType "sketchpad")
//
// dataType = "sketchpad"; widget name = "CLIC Component"; directive = "sketchpad".
// Canvas wrapper = `.customClass[data-type="sketchpad"]` with inner
// `#sketchpad[sketchpad]`. There is NO dedicated settings panel file
// (config references templates/sketch-pad/sketchpad-settings.html which does not
// exist on disk); clicking routes through con.displaySettingPanel() into the
// generic .componentSettingPanel.
//
// Source-driven facts:
//   • CLIC is an ELEMENT (not an assessment widget) — `sketchpad` is NOT in
//     support/module-setup.ts ASSESSMENT_DATA_TYPES, so resolveDropTarget routes
//     it to the canvas (Instructions-for-Students), NOT a Generic Step column.
//   • The dropped component is a CLIC Assignment FORM (not a drawing canvas):
//     a pop-up "form-box" with title "CLIC Assignment", two contenteditable
//     fields (#clicuid "CLIC identifier", #instancename "Instance Name") and a
//     Submit button (.form-button → submitCLIC()). This matches the QC pop-up
//     description (CLIC Identifier / Instance Name / Submit).
//   • The form renders only while !fieldData.settings.issubmitted. After submit
//     (or when a clicuid already exists on load) it swaps to a CLIC iframe
//     (.sample-page > iframe[data-identifier]) — runtime/iframe-bound, deferred.
//   • #clicuid / #instancename are contenteditable divs (ng-keyup updateText) —
//     set via cy.setContentEditableOn, never cy.type().
//   • .sketchpad-error-div ("could not be loaded. Required information is
//     missing.") is display:none by default; shown only at runtime.
// =============================================================================

export const CLIC_DATA_TYPE = 'sketchpad';
export const CLIC_WIDGET_NAME = 'CLIC Component';

/** Authoring-canvas DOM (the dropped CLIC / sketchpad element). */
export const CLIC_CANVAS = {
  /** Catalog drop wrapper on the canvas. */
  widget: `.customClass[data-type="${CLIC_DATA_TYPE}"], [data-type="${CLIC_DATA_TYPE}"]`,
  /** Root sketchpad directive container. */
  component: '#sketchpad[sketchpad], [sketchpad]',
  sdItem: '#desktop_view .sd-item:has([data-type="sketchpad"]), #desktop_view .sd-item:has([sketchpad])',

  /** The CLIC Assignment pop-up form (shown when !issubmitted). */
  formContainer: '#sketchpad .form-container',
  formBox: '#sketchpad .form-box',
  formTitle: '#sketchpad .form-title',
  formIcon: '#sketchpad .form-icon',

  /** CLIC Identifier field (contenteditable, ng-keyup updateText 'clicuid'). */
  clicIdentifier: '#sketchpad #clicuid',
  clicIdentifierLabel: '#sketchpad label[for="clicuid"]',
  /** Instance Name field (contenteditable, ng-keyup updateText 'instancename'). */
  instanceName: '#sketchpad #instancename',
  instanceNameLabel: '#sketchpad label[for="instancename"]',

  /** Submit button (ng-click submitCLIC). */
  submitButton: '#sketchpad .form-button[type="submit"], #sketchpad .form-button',
  submitButtonIcon: '#sketchpad .form-button-icon',

  /** Post-submit iframe view (runtime-bound). */
  submittedPage: '#sketchpad .sample-page',
  iframe: '#sketchpad iframe[data-identifier]',

  /** Error state container (display:none until runtime). */
  errorDiv: '.sketchpad-error-div',
} as const;

/**
 * Settings panel DOM.
 *
 * CLIC has NO dedicated settings panel template on disk; clicking the component
 * runs con.displaySettingPanel() which mounts the generic settings container.
 * We target the framework-shared .componentSettingPanel (used by
 * cy.openComponentSettings) rather than a component-specific id.
 */
export const CLIC_SETTINGS = {
  panel: '.componentSettingPanel',
} as const;

/** Source-verified business rules / defaults (from default/sketchpad.json). */
export const CLIC_RULES = {
  identifier: 'sketchpad',
  templateName: 'sketchPadComponent',
  /** Form is hidden once submitted (settings.issubmitted). */
  defaultIsSubmitted: false,
  /** Form fields default to empty strings. */
  defaultClicuid: '',
  defaultInstanceName: '',
  formTitleText: 'CLIC Assignment',
  identifierLabelText: 'CLIC identifier',
  instanceNameLabelText: 'Instance Name',
  widgetName: CLIC_WIDGET_NAME,
} as const;
