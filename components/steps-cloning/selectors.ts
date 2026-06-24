/// <reference types="cypress" />
// =============================================================================
// Steps Cloning ("Clone New Level") — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   index.html ........... per-step TOC kebab menu (.tocPageIconMenu) with the
//                          "Clone New Level" item (ng-click="tocSectionClonePopup")
//                          + the clone wizard (#formsModal in clone mode) where
//                          the Step Title is disabled (ng-class
//                          "disabledInput:clonedStepData") and the Levels tab
//                          exposes the Levels-of-Support chips/dropdown
//                          (#level-container / #level-drop / #level-drop-list).
//   js/page-tray.js ...... tocSectionClonePopup(), levelAdds(),
//                          checkIfLOSApplied(), and clonePhysicalPage() (Save).
//
// Source-driven facts (NOT invented):
//   • Cloning is exposed only via the per-step kebab menu — NOT flag-gated.
//   • "Clone New Level" reuses #formsModal with scope.clonedStepData set:
//       - Basic Info tab: Step Title input carries `disabledInput` (read-only).
//       - Levels tab: when LoS != CORE, an editable LoS chips dropdown shows;
//         when LoS == CORE the message "Since the LoS is 'Core', it cannot be
//         updated." renders instead.
//   • LoS master list (page-tray.js scope.levelItems):
//       CORE, LIGHT, LIGHT-MULTILINGUAL, MODERATE, MODERATE-MULTILINGUAL,
//       INTENSIVE, INTENSIVE-MULTILINGUAL.
//   • Already-applied LoS in the step are disabled in the dropdown
//     (checkIfLOSApplied → grey + cursor:not-allowed).
//   • A cloned page keeps the SAME stepid (so the Step number is unchanged) and
//     is rendered as an extra page under the same step in grouptoc.steps; each
//     TOC row reads "Page N: <title>" with its own losTag(s).
//   • Save (Insert) → clonePhysicalPage(); metadata stamps isCloned:true.
//
// The Generic Step component (sibling) already verified the kebab menu + the
// `tocSectionClonePopup` clone item selectors; this component reuses the same
// conventions and focuses on the clone flow + resulting TOC state.
// =============================================================================

/** Step type used to build the source step we clone from. */
export const SC_STEP_IDENTIFIER = 'GenericStep';
export const SC_STEP_LABEL = 'Generic Step';

/** TOC step rows + per-step (kebab) menu — the clone entry point. */
export const SC_TOC = {
  /** Container that wraps the steps list in the flat TOC. */
  stepsList: '.toc-steps-list',
  /** Per-step page rows (each clone adds another `.toc-container[tocName]`). */
  stepRows: '.toc-steps-list .toc-container[tocName], .toc-container[tocName]',
  /** Title text rendered as "Page N: <title>" / "Step N: <title>". */
  stepTitle: '.toc-container .stepTitle',
  /** Currently-active TOC row. */
  activeStep: '.subTocName.activeTocItem, li.activeTocItem',
  /** Levels-of-Support chips shown under a step row. */
  losTag: '.toc-container .losTag .losTagTitle',
  /** Per-step kebab toggle (.tocMenuDiv → bootstrap dropdown). */
  kebab: '.toc-container .tocPageIconDiv .tocMenuDiv, .toc-container .tocMenuDiv',
  /** The dropdown menu container. */
  menu: '.toc-container .dropdown-menu.tocPageIconMenu',
  /** "Clone New Level" item (ng-click tocSectionClonePopup). */
  menuClone: '.tocPageIconMenu li[ng-click*="tocSectionClonePopup"]',
  /** "Edit Metadata" item. */
  menuEdit: '.tocPageIconMenu li[ng-click*="tocSectionEditPopup"]',
  /** "Delete" item (gated by canDeletePage). */
  menuDelete: '.tocPageIconMenu li[ng-click*="tocSectionDeletePopup"]',
  /** Step-level "Duplicate New level" item (toinsertNewLevelSupport). */
  menuDuplicateLevel: '.tocPageIconMenu li[ng-click*="toinsertNewLevelSupport"]',
} as const;

/** Clone wizard (#formsModal opened in clone mode). */
export const SC_WIZARD = {
  modal: '#formsModal, .forms-modal',
  title: '#formsModal #formsLabell, #formsModal .step-title',
  tabBtns: '#formsModal .tab-btns',
  basicInfoTab: '#formsModal #course-sec',
  levelsTab: '#formsModal #level-sec',
  // Basic Info — Step Title (read-only while cloning via disabledInput).
  titleLabel: '#formsModal #step-title-label',
  titleInput: '#formsModal #title, #title[ng-model="stepTitle"]',
  // Levels tab — LoS chips + dropdown (only when cloned LoS != CORE).
  levelLabel: '#formsModal #levelLabel',
  levelContainer: '#formsModal #level-container',
  levelChipList: '#formsModal #level-list li span',
  levelInput: '#formsModal #level',
  levelDrop: '#formsModal #level-drop',
  levelDropList: '#formsModal #level-drop-list',
  levelDropItem: '#formsModal #level-drop-list li',
  // The "Core cannot be updated" message shown when cloning a CORE page.
  coreFixedMsg: '#formsModal #level-sec .inner',
  // Navigation buttons.
  nextBtn: '#formsModal #nextBtn:visible',
  subBtn: '#formsModal #subBtn:visible',
  prevBtn: '#formsModal #prevBtn',
  cancelBtn: '#formsModal button[ng-click="cancelAndReset()"]',
} as const;

/** Generic Step canvas (the step we author before cloning). */
export const SC_CANVAS = {
  desktop: '#desktop_view',
  container: '#desktop_view .generic-step-container, #desktop_view section[data-type="GenericStep"]',
  column: '#desktop_view .generic-step-column-content',
  droppedItem:
    '#desktop_view .generic-step-column-content .sd-item, #desktop_view .generic-step-column-content [data-type]',
} as const;

/** Source-verified business rules for cloning. */
export const SC_RULES = {
  /** Levels-of-Support master list (page-tray.js scope.levelItems). */
  losMaster: [
    'CORE',
    'LIGHT',
    'LIGHT-MULTILINGUAL',
    'MODERATE',
    'MODERATE-MULTILINGUAL',
    'INTENSIVE',
    'INTENSIVE-MULTILINGUAL',
  ],
  /** LoS that cannot be re-selected when cloning (it is the fixed source LoS). */
  fixedSourceLoS: 'CORE',
  /** Cloned page metadata stamp set by the save flow. */
  clonedStampKey: 'isCloned',
  /** The clone menu label text. */
  cloneMenuLabel: 'Clone New Level',
  /** Cloning keeps the same step number (stepid unchanged); page id increments. */
  cloneKeepsStepNumber: true,
} as const;
