/// <reference types="cypress" />
// =============================================================================
// Annotation (Highlight / Outline) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                   (widget catalog: name "Annotation", dataType "annotationHighlightOutline")
//   templates/annotation/annotation.html               (canvas DOM)
//   templates/annotation/annotation-setting.html       (settings panel)
//   templates/annotation/default/annotation.json       (default field data)
//   templates/annotation/scripts/annotation.js         (directive: annotationTemplate)
//
// dataType = "annotationHighlightOutline"; widget name = "Annotation";
// directive = "annotation-template" (attribute on the canvas container).
// Canvas wrapper = `.annotationContainer.annotationHighlightOutline.component-holder`.
// Settings panel root = `.annotation-setting.imgLabel` (title "Annotation").
//
// Source-driven facts (verified in annotation.js / annotation.html):
//   • Annotation is an ELEMENT (widget name "Annotation", dataType
//     "annotationHighlightOutline"). The dataType is ABSENT from
//     support/module-setup.ts ASSESSMENT_DATA_TYPES, so resolveDropTarget routes
//     it to the canvas — it drops onto the Instructions-for-Students page
//     (#desktop_view) via cy.dropComponent('Annotation'), NOT a Generic Step
//     column.
//   • Two sections gated by settings flags:
//       - Highlight section (#highlights-section) renders when
//         fieldData.settings.showHighlights (default true).
//       - Outline section (#outline-section) renders when
//         fieldData.settings.showOutline (default false).
//   • Each section repeats a `.label-row` per colour entry:
//       - a `.color-button` (opens an inline colour picker),
//       - a contenteditable `.text-input` label (set via setContentEditableOn),
//       - a `.remove-button` (shown only when length > 1).
//   • "+ Add Label" button (`.add-button`) appends a row; the directive HARD-CAPS
//     each section at 5 entries (addHighlight/addOutline `if (length >= 5) return`)
//     and the button greys out (cursor not-allowed) once length === 5.
//   • Colour picker (`.colorpicker-container`) shows `.color-option .color` swatches
//     from a fixed palette; already-used colours are disabled.
//   • Settings panel toggles: "Add Highlight" (currSettings.showHighlights) and
//     "Add Outline" (currSettings.showOutline). The directive forces at least one
//     ON (window.alert if both unchecked) — so the "both off" path is a runtime
//     alert, not an authoring-DOM assertion.
//   • Alt Text textarea (currSettings.altText, maxlength 2000) under Accessibility.
//   • There is NO free-text annotation body in the authoring DOM — the QC PDF's
//     "type annotation text / select text / Annotate" steps describe the
//     Reader/student runtime flow (deferred). Authoring configures the highlight
//     and outline LABEL/COLOUR catalogue only.
// =============================================================================

export const ANNOTATION_DATA_TYPE = 'annotationHighlightOutline';
export const ANNOTATION_WIDGET_NAME = 'Annotation';

/** Authoring-canvas DOM (the dropped Annotation element). */
export const ANNOTATION_CANVAS = {
  widget: `.customClass[data-type="${ANNOTATION_DATA_TYPE}"], [data-type="${ANNOTATION_DATA_TYPE}"], .annotationContainer.${ANNOTATION_DATA_TYPE}`,
  /** The component container (annotation-template directive host). */
  component: '.annotationContainer.component-holder, [annotation-template]',
  sdItem: '#desktop_view .sd-item:has(.annotationContainer), #desktop_view .sd-item:has([annotation-template])',
  /** The intro helper text shown inside the dropped component. */
  intro: '.annotationContainer .text-info',

  // ---- Highlight section (renders when settings.showHighlights) ----
  highlightsSection: '#highlights-section',
  highlightRows: '#highlights-section .label-row',
  highlightColorButton: '#highlights-section .color-button',
  /** Contenteditable label inside a highlight row. */
  highlightLabel: '#highlights-section .text-container .text-input',
  highlightRemove: '#highlights-section .remove-button',
  highlightAdd: '#highlights-section .add-button',
  highlightColorPicker: '#highlights-section .colorpicker-container',
  highlightColorOption: '#highlights-section .colorpicker-body .color-option .color',

  // ---- Outline section (renders when settings.showOutline) ----
  outlineSection: '#outline-section',
  outlineRows: '#outline-section .label-row',
  outlineColorButton: '#outline-section .color-button',
  outlineLabel: '#outline-section .text-container .text-input',
  outlineRemove: '#outline-section .remove-button',
  outlineAdd: '#outline-section .add-button',
  outlineColorPicker: '#outline-section .colorpicker-container',
  outlineColorOption: '#outline-section .colorpicker-body .color-option .color',
} as const;

/** Settings panel DOM (.annotation-setting). */
export const ANNOTATION_SETTINGS = {
  panel: '.annotation-setting',
  title: '.annotation-setting .txt-set-title .para-ellipsis',
  icon: '.annotation-setting .txt-set-icon.icon-Image-labelling_number-01',

  // Annotation-type toggles (at least one is mandatory at runtime).
  showHighlights: '.annotation-setting input[ng-model="currSettings.showHighlights"]',
  showOutline: '.annotation-setting input[ng-model="currSettings.showOutline"]',

  // Accessibility / Alt Text
  accessibility: '.annotation-setting',
  altText: '.annotation-setting textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '.annotation-setting .altTextCharLimitText',
} as const;

/** Source-verified business rules / defaults (annotation.js + annotation.json). */
export const ANNOTATION_RULES = {
  /** addHighlight/addOutline cap each section at 5 entries. */
  maxLabels: 5,
  /** annotation.json defaults. */
  defaultShowHighlights: true,
  defaultShowOutline: false,
  defaultHighlightColor: '#ffe66e',
  defaultOutlineColor: '#240000',
  altTextMaxLength: 2000,
  widgetName: ANNOTATION_WIDGET_NAME,
} as const;
