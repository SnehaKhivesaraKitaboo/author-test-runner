/// <reference types="cypress" />
// =============================================================================
// Flexi Layout (layout-7) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                          (catalog: name "Flexi", dataType "layout-7", isDroppable:true)
//   templates/layout-flexi/flexi-layout.html                  (canvas DOM — dynamic columns)
//   templates/layout-flexi/flexi-layout-setting-panel.html    (settings panel)
//   templates/layout-flexi/default/flexi-layout.json          (default field data)
//   templates/layout-flexi/scripts/flexi-layout-directive.js  (directive: layoutFlexiTemplate)
//
// VERIFIED against config.js (grep "layout"): widget name = "Flexi",
// dataType = "layout-7" (BOTH catalogs agree), isDroppable: true.
//
// Source-driven facts (layout-7 is DYNAMIC — DIFFERENT from layouts/):
//   • Flexi is a LAYOUT (Layout section), NOT an assessment widget — "layout-7"
//     is absent from support/module-setup.ts ASSESSMENT_DATA_TYPES, so it drops
//     onto the Instructions-for-Students canvas (#desktop_view) via
//     cy.dropComponent('Flexi'), NOT a Generic Step column.
//   • Canvas wrapper = `.customClass[data-type="layout-7"]` containing
//     `.layout-container.layout-7` ([layout-flexi-template]).
//   • Columns are DYNAMIC: `.flexi-columns > .column.flexi-section`, one per
//     entry in fieldData.settings.flexiData, with width driven by section.width%
//     and a [flexbox-index] attribute. Initially flexiData is [] → a separator-
//     count dialog (.tableGO-rows-columns-dialog) prompts for vertical
//     separators (fieldData.noOfRows < 0); choosing N then "Create" creates the
//     columns.
//   • Each column holds `.flexi-column` → `.question-container-box.flexi-container-box`
//     → `.question-container` slots with `.column-content.flexi-box.editables`
//     drop zones (onDropComplete) and `.empty-droppable-text.flexi-empty-draggble`
//     placeholders ("Drag Elements or Widgets").
//   • Separator dialog controls: `.icon-Up` / `.icon-Down` steppers, the count
//     readout {{fieldData.rowInput}}, and the Create button (ng-click
//     onSeparatorCreate, name="ok-button").
//   • Settings panel = `#layout-flexi-template-setting` (.flexi-layout-setting-panel):
//     a "Column Ratio" section with per-column editable % boxes (#row-{{$index}}),
//     an Update button (.update-size), a Full Width checkbox (.layout-width-setup),
//     and an Alt Text textarea (maxlength 2000) under .accessibilityDiv-flexi.
// =============================================================================

export const LAYOUT_DATA_TYPE = 'layout-7';
export const LAYOUT_WIDGET_NAME = 'Flexi';

/** Authoring-canvas DOM (the dropped Flexi layout). */
export const LAYOUT_CANVAS = {
  widget: `.customClass[data-type="${LAYOUT_DATA_TYPE}"], [data-type="${LAYOUT_DATA_TYPE}"]`,
  component: `.layout-container.${LAYOUT_DATA_TYPE}, [layout-flexi-template]`,
  sdItem: `#desktop_view .sd-item:has([data-type="${LAYOUT_DATA_TYPE}"]), #desktop_view .sd-item:has(.layout-container.${LAYOUT_DATA_TYPE})`,
  /** Dynamic column container + sections. */
  flexiColumns: `.layout-container.${LAYOUT_DATA_TYPE} .flexi-columns`,
  columns: `.layout-container.${LAYOUT_DATA_TYPE} .column.flexi-section`,
  flexiColumn: `.layout-container.${LAYOUT_DATA_TYPE} .flexi-column`,
  questionContainer: `.layout-container.${LAYOUT_DATA_TYPE} .question-container.selector`,
  dropZones: `.layout-container.${LAYOUT_DATA_TYPE} .column-content.flexi-box.editables`,
  emptyDroppable: `.layout-container.${LAYOUT_DATA_TYPE} .empty-droppable-text.flexi-empty-draggble`,
  divider: `.layout-container.${LAYOUT_DATA_TYPE} .vertical-divider`,
} as const;

/** Separator-count dialog (shown when flexiData is empty / noOfRows < 0). */
export const FLEXI_SEPARATOR_DIALOG = {
  dialog: '.tableGO-rows-columns-dialog',
  title: '.tableGO-rows-columns-dialog .edit-table-title',
  count: '.tableGO-rows-columns-dialog .rowColNumInput',
  stepUp: '.tableGO-rows-columns-dialog .icon-Up',
  stepDown: '.tableGO-rows-columns-dialog .icon-Down',
  createButton: '.tableGO-rows-columns-dialog button[name="ok-button"]',
} as const;

/** Settings panel DOM (#layout-flexi-template-setting). */
export const LAYOUT_SETTINGS = {
  panel: '#layout-flexi-template-setting',
  title: '#layout-flexi-template-setting .templateName',
  columnRatioLabel: '#layout-flexi-template-setting .column-ratio',
  columnRatioInputs: '#layout-flexi-template-setting .flexi-size-input-box',
  updateButton: '#layout-flexi-template-setting .update-size',
  fullWidth: '#layout-flexi-template-setting input.layout-width-setup',
  fullWidthLabel: '#layout-flexi-template-setting .common-radio-txt',
  altText: '#layout-flexi-template-setting textarea[ng-model="currSettings.altText"]',
  altTextCharLimit: '#layout-flexi-template-setting .altTextCharLimitText',
} as const;

/** Source-verified business rules / defaults. */
export const LAYOUT_RULES = {
  widgetName: LAYOUT_WIDGET_NAME,
  dataType: LAYOUT_DATA_TYPE,
  /** Columns are created at runtime from a separator count (0..3 → 1..4 columns). */
  dynamicColumns: true,
  /** Separator dialog accepts min 0 (→ 1 column) up to 3 (→ 4 columns). */
  separatorMin: 0,
  separatorMax: 3,
  /** Column ratios must total 100%; min per-column ratio is 10%. */
  columnRatioTotal: 100,
  columnRatioMin: 10,
  /** Alt Text textarea maxlength. */
  altTextMaxLength: 2000,
  oneItemPerColumn: true,
  noLayoutInLayout: true,
} as const;
