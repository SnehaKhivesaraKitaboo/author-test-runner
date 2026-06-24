/// <reference types="cypress" />
// =============================================================================
// Custom Center Layout (layout-6) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                   (catalog: name "Custom Center", dataType "layout-6")
//   templates/layouts/layout6.html                     (canvas DOM — 2 question-bank columns)
//   templates/layouts/layout-setting-panel.html        (settings panel)
//   templates/layouts/default/layout.json              (default field data)
//   templates/layouts/scripts/layout-directive.js      (directive: layoutTemplate)
//
// VERIFIED against config.js (grep "layout"): widget name = "Custom Center",
// dataType = "layout-6" (BOTH catalogs agree). NOTE: layout-5 is "Three Column"
// (NOT in scope); layout-6 is unambiguously "Custom Center".
//
// Source-driven facts (layout-6 is STRUCTURALLY DIFFERENT from layout-1..4):
//   • Custom Center is a LAYOUT (Layout section), NOT an assessment widget —
//     "layout-6" is absent from support/module-setup.ts ASSESSMENT_DATA_TYPES,
//     so it drops onto the Instructions-for-Students canvas (#desktop_view) via
//     cy.dropComponent('Custom Center'), NOT a Generic Step column.
//   • Canvas wrapper = `.customClass[data-type="layout-6"]` containing
//     `.layout-container.custome-layout.layout-6` ([layout-template]).
//   • TWO columns, both `.column.one-half`, BUT each column holds a
//     `.question-container-box` with `.question-container` slots driven by
//     fieldData.settings.questionBank (left) / questionBank2 (right).
//   • Drop zones are `.column-content.first-box` (left, onDropComplete boxNo=0)
//     and `.column-content.second-box` (right, onDropComplete boxNo=1) — both
//     have ng-drop + `.editables` and an `.empty-droppable-text` placeholder.
//   • No `.vertical-divider` is guaranteed between question slots the same way —
//     the divider sits between the two .column halves.
//   • Clicking the .sd-item opens `#layout-template-setting` with a Full Width
//     checkbox (.layout-width-setup); Full Width sets data-pagemargin="fullwidth".
// =============================================================================

export const LAYOUT_DATA_TYPE = 'layout-6';
export const LAYOUT_WIDGET_NAME = 'Custom Center';
export const LAYOUT_COLUMN_COUNT = 2;

/** Authoring-canvas DOM (the dropped Custom Center layout). */
export const LAYOUT_CANVAS = {
  widget: `.customClass[data-type="${LAYOUT_DATA_TYPE}"], [data-type="${LAYOUT_DATA_TYPE}"]`,
  component: `.layout-container.${LAYOUT_DATA_TYPE}, .layout-container.custome-layout, [layout-template]`,
  sdItem: `#desktop_view .sd-item:has([data-type="${LAYOUT_DATA_TYPE}"]), #desktop_view .sd-item:has(.layout-container.${LAYOUT_DATA_TYPE})`,
  columns: `.layout-container.${LAYOUT_DATA_TYPE} .column.selector`,
  /** Both columns are equal halves, each backed by a question bank. */
  columnHalf: `.layout-container.${LAYOUT_DATA_TYPE} .column.one-half`,
  /** Question-bank containers per column. */
  questionBox: `.layout-container.${LAYOUT_DATA_TYPE} .question-container-box`,
  questionContainer: `.layout-container.${LAYOUT_DATA_TYPE} .question-container.selector`,
  /** Drop zones (first-box = left/questionBank, second-box = right/questionBank2). */
  dropZones: `.layout-container.${LAYOUT_DATA_TYPE} .column-content.editables`,
  firstBox: `.layout-container.${LAYOUT_DATA_TYPE} .column-content.first-box`,
  secondBox: `.layout-container.${LAYOUT_DATA_TYPE} .column-content.second-box`,
  emptyDroppable: `.layout-container.${LAYOUT_DATA_TYPE} .empty-droppable-text`,
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
  /** layout-6 column widths: two equal halves, each a question-bank column. */
  columnWidths: ['one-half', 'one-half'] as const,
  /** Each column is question-bank driven (first-box / second-box). */
  questionBankDriven: true,
  oneItemPerColumn: true,
  noLayoutInLayout: true,
} as const;
