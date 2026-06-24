/// <reference types="cypress" />
// =============================================================================
// Sample Layer / TIG Panel (sample-answer layer) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                       (widget catalog entry)
//   templates/sampleLayer/sample-layer.html                (canvas DOM)
//   templates/sampleLayer/sample-layer-setting-panel.html  (settings panel)
//   templates/sampleLayer/default/sampleLayer.json         (default field data)
//   templates/sampleLayer/scripts/sample-layer-directive.js (directive: sampleLayerTemplate)
//   templates/sampleLayer/scripts/sample-layer-preview1.js  (Reader/CLP runtime)
//   templates/sampleLayer/styles/sample-layer-template.css  (pink border/colour)
//
// VERIFIED dataType = "layer-2" (config.js → "name":"Sample Layer",
//   "dataType":"layer-2"). The QC catalog's "sample-layer" is NOT the catalog
//   dataType — it is corrected to "layer-2" here. directive = "sample-layer-template".
//   default identifier (sampleLayer.json) = "layer-2"; settings panel id =
//   "#sample-layer-template-setting" (title "Sample Layer").
//
// Source-driven facts:
//   • Sample Layer is a droppable LAYER container (config GenericStep["layer-2"]
//     = true) — it is dropped into a Generic Step column (like a layout), NOT an
//     assessment widget. Assessment widgets are then dropped INSIDE its columns.
//   • Authoring shows a pink banner span (.tagBlockName) rendered from
//     tagDataCollection: tag "Sample Answers", tagColor "#C91CA5", default "On"
//     → banner text "Sample Answers: On". The span background is the pink colour.
//   • The container (.sample-layer-container) has a 1px solid #C91CA5 pink border
//     (sample-layer-template.css) — DOM-assertable in authoring.
//   • The directive stamps data-sampletaginfo='{"Sample_Answers":"On"}' on the
//     layer-template element.
//   • Settings tag radios: name="tagBlock-{index}" with values "Off" / "On"
//     bound to currSettings.TagClolorData[i].defaultvalue ("Off" is ng-disabled).
//   • The actual pink colouring of sample ANSWERS (FIB/ER/MCQ/table text) and the
//     TIG (teacher instructional guide) panel are applied by preview1.js at
//     Reader/CLP runtime — NOT in the authoring DOM (deferred).
// =============================================================================

export const SL_DATA_TYPE = 'layer-2';
export const SL_WIDGET_NAME = 'Sample Layer';

/** Authoring-canvas DOM (the dropped Sample Layer container). */
export const SL_CANVAS = {
  /** Outer parent container injected by sample-layer.html. */
  parent: '.sample-layer-parent-container',
  /** The pink-bordered layer container (layer-2, sample-layer-template directive). */
  container: '.sample-layer-container.layer-2, .sample-layer-container[sample-layer-template]',
  /** Generic widget/data-type match for the dropped layer. */
  widget: `[data-type="${SL_DATA_TYPE}"], .sample-layer-container.layer-2`,
  /** Banner wrapper (the "Sample Answers: On" tag row). */
  banner: '.sample-layer-parent-container .sample-main-layer',
  /** Individual tag span — text "Sample Answers: On", pink background. */
  bannerTag: '.sample-layer-parent-container .sample-main-layer .tagBlockName',
  /** Layer columns + drop sections. */
  columns: '.sample-layer-container .layer-columns',
  section: '.sample-layer-container .sample-layer-section',
  /** Per-question droppable box (where components are placed). */
  questionContainer: '.sample-layer-container .question-container',
  dropBox: '.sample-layer-container .column-content.layer-box',
  emptyDroppable: '.sample-layer-container .empty-droppable-text.layer-empty-draggble',
  /** The data-sampletaginfo carrier stamped by the directive. */
  tagInfoCarrier: '[data-sampletaginfo]',
  /** sd-item wrapper around the dropped layer. */
  sdItem: '#desktop_view .sd-item:has(.sample-layer-container), .generic-step-column-content .sd-item:has(.sample-layer-container)',
} as const;

/** Settings panel DOM (#sample-layer-template-setting). */
export const SL_SETTINGS = {
  panel: '#sample-layer-template-setting',
  title: '#sample-layer-template-setting .templateName',
  icon: '#sample-layer-template-setting .layer-settings-heading [class*="icon-"]',
  heading: '#sample-layer-template-setting .layer-settings-heading',
  /** Tag-block container holding the Sample Answers On/Off radios. */
  tagBlockContainer: '#sample-layer-template-setting .tabBlockContainer',
  tagBlockHeader: '#sample-layer-template-setting .tagBlockHeader',
  /** All tag radios (name="tagBlock-{index}"). */
  tagRadios: '#sample-layer-template-setting .tagBlockValue input[type="radio"]',
  tagRadioOn: '#sample-layer-template-setting .tagBlockValue input[type="radio"][value="On"]',
  tagRadioOff: '#sample-layer-template-setting .tagBlockValue input[type="radio"][value="Off"]',
  tagLabel: '#sample-layer-template-setting .tagBlockValue .radio-btn-text',
} as const;

/** Source-verified business rules / defaults. */
export const SL_RULES = {
  /** Pink colour used for sample-answer outline/text/banner (sample-layer-template.css + preview1.js). */
  pinkColor: '#C91CA5',
  /** Pink colour as rendered rgb (for computed-style assertions). */
  pinkRgb: 'rgb(201, 28, 165)',
  /** Default tag-block state for the Sample Answers tag (directive default). */
  defaultTagState: 'On',
  tagBlockName: 'Sample Answers',
  /** Banner text rendered from "{tagBlockName}: {defaultvalue}". */
  bannerText: 'Sample Answers: On',
  /** "Off" radio is ng-disabled in the settings panel (source: setting-panel.html). */
  offRadioDisabled: true,
  templateName: 'Sample Layer',
} as const;

/** Source-verified rules for SELECTOR usage (presence/gating). */
export const SL_SELECTOR_RULES = {
  /** Layer is dropped into a Generic Step column (config GenericStep["layer-2"]=true). */
  dropTarget: 'generic-step-column',
  /** Components are dropped INSIDE the layer's .column-content.layer-box drop zones. */
  innerDropZone: SL_CANVAS.dropBox,
} as const;
