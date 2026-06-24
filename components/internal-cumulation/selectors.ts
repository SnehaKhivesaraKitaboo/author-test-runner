/// <reference types="cypress" />
// =============================================================================
// Internal Cumulation — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   index.html (Import From Library entry + #asset-library-popup modal)
//   editor/ngcontroller.js (openAssetLibrary, selectActivity, selectStep,
//     selectLos, addActivityFromLibrary, programName)
//
// dataType = "internal-cumulation" (catalog identifier; NOT a DOM data-type).
//
// IMPORTANT — mechanism (source-verified):
//   There is NO standalone "cumulation enable toggle" / "aggregate display" /
//   "display-rule" widget in the authoring DOM. "Internal Cumulation" in QC is
//   realised through the shared **Asset Library / Import From Library** flow:
//   an author re-uses (duplicates/imports) a step from the SAME activity into
//   the current activity. The cumulative *score aggregation* across child/parent
//   steps and the LOS (Levels of Support) runtime roll-up are Reader/Preview
//   runtime behaviours and are therefore DEFERRED.
//
// Source-driven facts:
//   • The "Import From Library" menu item is gated by getProgramName() — it is
//     only rendered when ng-show="getProgramName()" is truthy (a program/
//     activity context exists). Treat absence as flag-gated → log + return.
//   • The library modal id is "#asset-library-popup".
//   • Activity rows: tr[ng-repeat="(key, value) in assetLibraryList"];
//     selected row gets class .selected-activity (ng-click selectActivity).
//   • Search input: input[ng-model="assetLibInput"] (placeholder "Search").
//   • Step blocks in preview pane: .step-block (ng-click selectStep), selected
//     gets .selected; LOS chips: .los-chip (ng-click selectLos), selected LOS
//     gets .selectedLos, disabled LOS gets .disableInsert.
//   • Insert button: ng-click="addActivityFromLibrary()" (enabled only when an
//     activity is selected AND selectedLos.length > 0).
// =============================================================================

export const IC_DATA_TYPE = 'internal-cumulation';

/** Table-of-contents "Import From Library" entry point (gated by getProgramName). */
export const IC_TOC = {
  addDropdownToggle: '#add-page-dropdown.removeAddPreview, .title-toc-holder .removeAddPreview',
  addMenu: 'ul.dropdown-menu.tocPageIconMenu, ul.tocPageIconMenu',
  addNewStepItem: 'ul.tocPageIconMenu #StepWidgetBtm',
  /** "Import From Library" menu item — ng-show="getProgramName()". */
  importFromLibraryItem: 'ul.tocPageIconMenu li[ng-click^="openAssetLibrary"]',
  stepsList: '.toc-steps-list',
  stepContainer: '.toc-steps-list .toc-stepPages-container',
} as const;

/** Asset Library / Import From Library modal (#asset-library-popup). */
export const IC_LIBRARY = {
  modal: '#asset-library-popup',
  title: '#asset-library-popup .modal-step',
  searchInput: '#asset-library-popup input[ng-model="assetLibInput"]',
  clearSearch: '#asset-library-popup .icon-Close',
  searchIcon: '#asset-library-popup .icon-Search',

  // Left filter rail
  filterRail: '#asset-library-popup .checkbox-list',
  filterAllMetadata: '#asset-library-popup .checkbox-input input[ng-click^="toggleStepFilter(\'allMetadata\'"]',
  filterSkills: '#asset-library-popup .checkbox-input input[ng-click^="toggleStepFilter(\'skills\'"]',
  filterLearningArtifact: '#asset-library-popup .checkbox-input input[ng-click^="toggleStepFilter(\'learningArtifact\'"]',
  filterGrade: '#asset-library-popup .checkbox-input input[ng-click^="toggleStepFilter(\'grade\'"]',

  // Activity listing (table)
  activityTable: '#asset-library-popup table.steps-list',
  activityRow: '#asset-library-popup tr[ng-repeat="(key, value) in assetLibraryList"]',
  selectedActivityRow: '#asset-library-popup tr.selected-activity',
  emptyState: '#asset-library-popup div[ng-show="!getActivitiesInAssetLibCount()"]',

  // Preview pane (steps + LOS)
  previewPane: '#asset-library-popup .preview',
  stepBlock: '#asset-library-popup .preview .step-block',
  selectedStepBlock: '#asset-library-popup .preview .step-block.selected',
  losChip: '#asset-library-popup .preview .los-chip',
  selectedLosChip: '#asset-library-popup .preview .los-chip.selectedLos',
  disabledLosChip: '#asset-library-popup .preview .los-chip.disableInsert',

  // Footer
  selectionMessage: '#asset-library-popup .selection-message-for-los',
  cancelBtn: '#asset-library-popup div[ng-click="cancelAssetLibrary()"]',
  insertEnabled: '#asset-library-popup div[ng-click="addActivityFromLibrary()"]',
  insertDisabled: '#asset-library-popup div[ng-show="!selectedActivityId"]',
} as const;

/** Source-verified business rules. */
export const IC_RULES = {
  /** Import menu item only renders when a program/activity context exists. */
  importGatedByProgramName: true,
  /** Insert requires an activity selected AND at least one LOS chosen. */
  insertRequiresActivityAndLos: true,
  /** Score/LOS aggregation (child→parent roll-up) is a Reader/Preview runtime. */
  aggregationIsRuntime: true,
} as const;
