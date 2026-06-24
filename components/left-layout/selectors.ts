/// <reference types="cypress" />
// =============================================================================
// Left Layout (layout-1) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                   (catalog: name "Left", dataType "layout-1")
//   templates/layouts/layout1.html                     (canvas DOM — 2 columns)
//   templates/layouts/layout-setting-panel.html        (settings panel)
//   templates/layouts/default/layout.json              (default field data)
//   templates/layouts/scripts/layout-directive.js      (directive: layoutTemplate)
//
// VERIFIED against config.js (grep "layout"): widget name = "Left",
// dataType = "layout-1" (BOTH catalogs at config.js lines ~16 and ~1896 agree).
//
// Source-driven facts:
//   • Left is a LAYOUT (Layout section of the component panel), NOT an assessment
//     widget — "layout-1" is absent from support/module-setup.ts
//     ASSESSMENT_DATA_TYPES, so resolveDropTarget routes it to the canvas. It is
//     dropped onto the Instructions-for-Students page (#desktop_view) via
//     cy.dropComponent('Left'), NOT into a Generic Step column.
//   • Canvas wrapper = `.customClass[data-type="layout-1"]` containing
//     `.layout-container.layout-1` ([layout-template]).
//   • layout-1 has TWO columns: `.column.one-third` (template1) +
//     `.column.two-thirds` (template2), separated by `.vertical-divider`.
//   • Each column has a `.column-content.editables` drop zone (ng-drop, ng-model
//     fieldData.template1 / fieldData.template2) and an `.empty-droppable-text`
//     placeholder ("Drag Elements or Widgets").
//   • Clicking the dropped `.sd-item` runs con.setSettingsValues($('#target'),
//     'settings') and populates currSettings.templateName ("Left"); the settings
//     panel container is `#layout-template-setting` (.layout-setting-panel) with
//     a `.templateName` label and a "Full Width" checkbox (.layout-width-setup).
//   • Full-width toggle sets data-pagemargin="fullwidth" on the .sd-item.
//   • Layout drop is blocked inside another layout (layout-directive prevents
//     dropping a layout into a column) — this rule is enforced in JS, not
//     DOM-assertable here, so the "no layout-in-layout" cases are deferred.
// =============================================================================

export const LAYOUT_DATA_TYPE = 'layout-1';
export const LAYOUT_WIDGET_NAME = 'Left';
export const LAYOUT_COLUMN_COUNT = 2;

/** Authoring-canvas DOM (the dropped Left layout). */
export const LAYOUT_CANVAS = {
  widget: `.customClass[data-type="${LAYOUT_DATA_TYPE}"], [data-type="${LAYOUT_DATA_TYPE}"]`,
  /** The component <... layout-template> container. */
  component: `.layout-container.${LAYOUT_DATA_TYPE}, [layout-template]`,
  sdItem: `#desktop_view .sd-item:has([data-type="${LAYOUT_DATA_TYPE}"]), #desktop_view .sd-item:has(.layout-container.${LAYOUT_DATA_TYPE})`,
  /** All layout columns. */
  columns: `.layout-container.${LAYOUT_DATA_TYPE} .column.selector`,
  /** Per-column drop zones (ng-model fieldData.templateN). */
  dropZones: `.layout-container.${LAYOUT_DATA_TYPE} .column-content.editables`,
  /** "Drag Elements or Widgets" placeholders. */
  emptyDroppable: `.layout-container.${LAYOUT_DATA_TYPE} .empty-droppable-text`,
  /** Column-width classes (source-verified for layout-1). */
  columnNarrow: `.layout-container.${LAYOUT_DATA_TYPE} .column.one-third`,
  columnWide: `.layout-container.${LAYOUT_DATA_TYPE} .column.two-thirds`,
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
  /** layout-1 column widths: narrow (1/3) + wide (2/3). */
  columnWidths: ['one-third', 'two-thirds'] as const,
  /** A single column accepts ONE element/widget only (enforced in directive JS). */
  oneItemPerColumn: true,
  /** Layouts cannot be nested inside layout columns (enforced in directive JS). */
  noLayoutInLayout: true,
} as const;
