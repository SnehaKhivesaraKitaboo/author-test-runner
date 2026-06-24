/// <reference types="cypress" />
// =============================================================================
// External Cumulation — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   index.html (Import From Library entry + #asset-library-popup modal)
//   editor/ngcontroller.js (openAssetLibrary, selectActivity, selectStep,
//     selectLos, addActivityFromLibrary, programName)
//
// dataType = "external-cumulation" (catalog identifier; NOT a DOM data-type).
//
// IMPORTANT — mechanism (source-verified):
//   There is NO standalone "external cumulation enable toggle" / "external
//   lesson linkage" / "display-rule" widget in the authoring DOM. "External
//   Cumulation" in QC has TWO facets:
//     1. AUTHORING — importing a step from a DIFFERENT activity via the shared
//        Asset Library / "Import From Library" flow (#asset-library-popup). This
//        is the only DOM-assertable surface.
//     2. RUNTIME — cross-lesson SCORM data patching between external lessons
//        (e.g. activity 6.3 ↔ 6.5): data entered/submitted in one lesson is
//        cumulated into another. This is a Reader/SCORM runtime behaviour and is
//        DEFERRED (incl. the "SCORM API failed" popup).
//
// Source-driven facts (shared with Internal Cumulation — same library modal):
//   • Import entry gated by ng-show="getProgramName()" → flag-gated.
//   • Library modal id "#asset-library-popup".
//   • Activity rows tr[ng-repeat="(key, value) in assetLibraryList"] — for
//     External Cumulation the author selects a DIFFERENT activity than the
//     current one (cross-activity re-use).
//   • Search input[ng-model="assetLibInput"]; step blocks .step-block; LOS
//     chips .los-chip; Insert ng-click="addActivityFromLibrary()".
// =============================================================================

export const EC_DATA_TYPE = 'external-cumulation';

/** Table-of-contents "Import From Library" entry point (gated by getProgramName). */
export const EC_TOC = {
  addDropdownToggle: '#add-page-dropdown.removeAddPreview, .title-toc-holder .removeAddPreview',
  addMenu: 'ul.dropdown-menu.tocPageIconMenu, ul.tocPageIconMenu',
  addNewStepItem: 'ul.tocPageIconMenu #StepWidgetBtm',
  /** "Import From Library" menu item — ng-show="getProgramName()". */
  importFromLibraryItem: 'ul.tocPageIconMenu li[ng-click^="openAssetLibrary"]',
  stepsList: '.toc-steps-list',
} as const;

/** Asset Library / Import From Library modal (#asset-library-popup). */
export const EC_LIBRARY = {
  modal: '#asset-library-popup',
  searchInput: '#asset-library-popup input[ng-model="assetLibInput"]',
  clearSearch: '#asset-library-popup .icon-Close',
  searchIcon: '#asset-library-popup .icon-Search',

  // Left filter rail (date range / owner / tags equivalents)
  filterRail: '#asset-library-popup .checkbox-list',
  filterAllMetadata: '#asset-library-popup .checkbox-input input[ng-click^="toggleStepFilter(\'allMetadata\'"]',
  filterSkills: '#asset-library-popup .checkbox-input input[ng-click^="toggleStepFilter(\'skills\'"]',
  filterLearningArtifact: '#asset-library-popup .checkbox-input input[ng-click^="toggleStepFilter(\'learningArtifact\'"]',
  filterGrade: '#asset-library-popup .checkbox-input input[ng-click^="toggleStepFilter(\'grade\'"]',

  // Activity listing (table) — cross-activity selection for External Cumulation
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
export const EC_RULES = {
  /** Import menu item only renders when a program/activity context exists. */
  importGatedByProgramName: true,
  /** External cumulation re-uses a DIFFERENT activity (cross-activity import). */
  crossActivityImport: true,
  /** Cross-lesson (6.3 ↔ 6.5) SCORM data patch is a Reader/SCORM runtime. */
  scormDataPatchIsRuntime: true,
} as const;
