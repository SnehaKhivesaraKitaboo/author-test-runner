/// <reference types="cypress" />
// =============================================================================
// Edit Metadata (Step Metadata edit) — Verified selectors.
//
// This is NOT a dropped widget — it is the per-step metadata wizard reached via
// the TOC kebab menu ("Edit Metadata"). It edits the SAME wizard used at step
// creation (#formsModal), re-opened in `editingStepData` mode.
//
// Source of truth (KITABOO_Authoring):
//   index.html ... TOC step rows + per-step kebab menu (.tocMenuDiv →
//                  .tocPageIconMenu) with li ng-click="tocSectionEditPopup",
//                  and the metadata wizard (#formsModal / .forms-modal).
//
// Source-driven facts:
//   • TOC kebab (.tocMenuDiv, id dropdownMenu3) opens .tocPageIconMenu with
//     three items: Clone New Level (tocSectionClonePopup), Edit Metadata
//     (tocSectionEditPopup), Delete (tocSectionDeletePopup, gated by
//     canDeletePage). Menu order/visibility = QC TC_32.
//   • Edit Metadata sets editingStepData=true and opens #formsModal with title
//     = {{stepName}}.
//   • Tab 1 "Basic Info" (#course-sec): * Step Title input (#title,
//     ng-model="stepTitle", label #step-title-label) + Keyword Tags
//     (#tag-container, #tag-list, #tag input, label #tagLabel).
//   • Tab 2 "Levels" (#level-sec): for an edited step LoS shows; if Core it is
//     read-only ("Since the LoS is 'Core', it cannot be updated.").
//   • Tab 3 "Instructions" (#instructions-sec): #studentDesc / #teacherDesc
//     textareas with #studentCharCount / #teacherCharCount ("10000 Characters
//     remaning"). Student/Teacher sub-headers (#student-header/#teacher-header).
//   • Footer: #prevBtn (Back), #cancelBtn (Cancel → cancelAndReset()),
//     #nextBtn (Next, disabled when !stepTitle), #subBtn (Submit → infoEdit()
//     when editingStepData). #backPageTray (Change Step) is hidden while editing.
//   • Step title reflects in TOC row (.stepTitle) and activity list after save.
// =============================================================================

export const EM_DATA_TYPE = 'platform-edit-metadata';

/** TOC step rows + per-step (kebab) menu — the Edit Metadata entry point. */
export const EM_TOC = {
  heading: '.toc-outer-container, .toc-container',
  stepRows: '.toc-container[tocName]',
  stepTitle: '.toc-container .stepTitle',
  activeStep: '.subTocName.activeTocItem, li.activeTocItem, .activeTocItem',
  losTag: '.losTag .losTagTitle',
  // Per-step kebab (.tocMenuDiv / #dropdownMenu3) → dropdown menu items.
  kebab: '.toc-container .tocMenuDiv, .tocPageIcon .tocMenuDiv',
  menu: '.tocPageIconMenu',
  menuClone: '.tocPageIconMenu li[ng-click*="tocSectionClonePopup"]',
  menuEdit: '.tocPageIconMenu li[ng-click*="tocSectionEditPopup"]',
  menuDelete: '.tocPageIconMenu li[ng-click*="tocSectionDeletePopup"]',
} as const;

/** Edit Metadata wizard (#formsModal) DOM — same modal as step creation. */
export const EM_WIZARD = {
  modal: '#formsModal, .forms-modal',
  title: '#formsModal .step-title',
  tabBtns: '#formsModal .tab-btns',

  // Tab 1 — Basic Info
  basicInfoTab: '#formsModal #course-sec',
  titleLabel: '#formsModal #step-title-label',
  titleInput: '#formsModal #title, #title[ng-model="stepTitle"]',

  // Keyword Tags (the editable "standards/objectives" tags for a step).
  tagsLabel: '#formsModal #tagLabel',
  tagsContainer: '#formsModal #tag-container',
  tagsList: '#formsModal #tag-list li span',
  tagsInput: '#formsModal #tag',
  tagsChipRemove: '#formsModal #tag-list li .icon-Close',

  // Tab 2 — Levels of Support
  levelsTab: '#formsModal #level-sec',
  levelChips: '#formsModal #level-list li span',

  // Tab 3 — Instructions (objectives-style narrative text)
  instructionsTab: '#formsModal #instructions-sec',
  studentHeader: '#formsModal #student-header',
  teacherHeader: '#formsModal #teacher-header',
  studentDesc: '#formsModal #studentDesc',
  teacherDesc: '#formsModal #teacherDesc',
  studentCharCount: '#formsModal #studentCharCount',
  teacherCharCount: '#formsModal #teacherCharCount',

  // Footer navigation / actions
  prevBtn: '#formsModal #prevBtn',
  cancelBtn: '#formsModal #cancelBtn, #formsModal button[ng-click="cancelAndReset()"]',
  changeStepBtn: '#formsModal #backPageTray',
  nextBtn: '#formsModal #nextBtn:visible',
  submitBtn: '#formsModal #subBtn:visible',
} as const;

/** Source-verified business rules. */
export const EM_RULES = {
  /** Instructions textareas advertise a 10000-character budget. */
  instructionsCharBudget: 10000,
  /** Next/Submit are disabled when Step Title is empty (ng-class disabledBtn / !stepTitle). */
  titleRequired: true,
  /** A freshly created step's Level of Support is fixed to 'Core' (read-only when editing). */
  fixedCoreLoS: 'Core',
  /** The kebab menu exposes exactly these actions (QC TC_32). */
  menuActions: ['Clone New Level', 'Edit Metadata', 'Delete'],
  /** Disabled-state class used on Next/Submit. */
  disabledBtnClass: 'disabledBtn',
} as const;
