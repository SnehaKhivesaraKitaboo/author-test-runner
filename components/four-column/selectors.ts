/// <reference types="cypress" />
// =============================================================================
// Four Column Layout (layout-4) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                   (catalog: name "Four Column", dataType "layout-4")
//   templates/layouts/layout4.html                     (canvas DOM — 4 equal columns)
//   templates/layouts/layout-setting-panel.html        (settings panel)
//   templates/layouts/default/layout.json              (default field data)
//   templates/layouts/scripts/layout-directive.js      (directive: layoutTemplate)
//
// VERIFIED against config.js (grep "layout"): widget name = "Four Column",
// dataType = "layout-4" (BOTH catalogs agree).
//
// Source-driven facts:
//   • Four Column is a LAYOUT (Layout section), NOT an assessment widget —
//     "layout-4" is absent from support/module-setup.ts ASSESSMENT_DATA_TYPES,
//     so it drops onto the Instructions-for-Students canvas (#desktop_view) via
//     cy.dropComponent('Four Column'), NOT a Generic Step column.
//   • Canvas wrapper = `.customClass[data-type="layout-4"]` containing
//     `.layout-container.layout-4` ([layout-template]).
//   • layout-4 has FOUR EQUAL columns: all `.column.one-fourth` (template1..4),
//     each followed by a `.vertical-divider`.
//   • Each column has a `.column-content.editables` drop zone and an
//     `.empty-droppable-text` placeholder ("Drag Elements or Widgets").
//   • Clicking the .sd-item opens `#layout-template-setting` with a Full Width
//     checkbox (.layout-width-setup); Full Width sets data-pagemargin="fullwidth".
// =============================================================================

export const LAYOUT_DATA_TYPE = 'layout-4';
export const LAYOUT_WIDGET_NAME = 'Four Column';
export const LAYOUT_COLUMN_COUNT = 4;

/** Authoring-canvas DOM (the dropped Four Column layout). */
export const LAYOUT_CANVAS = {
  widget: `.customClass[data-type="${LAYOUT_DATA_TYPE}"], [data-type="${LAYOUT_DATA_TYPE}"]`,
  component: `.layout-container.${LAYOUT_DATA_TYPE}, [layout-template]`,
  sdItem: `#desktop_view .sd-item:has([data-type="${LAYOUT_DATA_TYPE}"]), #desktop_view .sd-item:has(.layout-container.${LAYOUT_DATA_TYPE})`,
  columns: `.layout-container.${LAYOUT_DATA_TYPE} .column.selector`,
  dropZones: `.layout-container.${LAYOUT_DATA_TYPE} .column-content.editables`,
  emptyDroppable: `.layout-container.${LAYOUT_DATA_TYPE} .empty-droppable-text`,
  /** All four columns are equal quarters (one-fourth) for layout-4. */
  columnQuarter: `.layout-container.${LAYOUT_DATA_TYPE} .column.one-fourth`,
  divider: `.layout-container.${LAYOUT_DATA_TYPE} .vertical-divider`,
} as const;

/** Settings panel DOM (#layout-template-setting). */
export const LAYOUT_SETTINGS = {
  panel: '#layout-template-setting',
  title: '#layout-template-setting .templateName',
  icon: '#layout-template-setting .layout-setting-icon',
  fullWidth: '#layout-template-setting input.layout-width-setup',
  fullWidthLabel: '#layout-template-setting .common-radio-txt',
} as const;

/** Source-verified business rules / defaults. */
export const LAYOUT_RULES = {
  widgetName: LAYOUT_WIDGET_NAME,
  dataType: LAYOUT_DATA_TYPE,
  columnCount: LAYOUT_COLUMN_COUNT,
  /** layout-4 column widths: four equal quarters. */
  columnWidths: ['one-fourth', 'one-fourth', 'one-fourth', 'one-fourth'] as const,
  oneItemPerColumn: true,
  noLayoutInLayout: true,
} as const;
