/// <reference types="cypress" />
// =============================================================================
// Generic Step — Verified selectors (the STEP itself, not a dropped widget).
//
// Source of truth (KITABOO_Authoring):
//   index.html ............... step chooser (#widget-popup), metadata wizard
//                              (#formsModal), TOC step rows + per-step menu,
//                              keyword tags + Levels of Support.
//   templates/generic-step/generic-step.html ........... step canvas container
//   templates/generic-step/generic-step-settings.html .. step settings panel
//   templates/generic-step/scripts/generic-step-directive.js ... drop behavior
//   templates/generic-step/default/generic-step.json ... default settings
//
// Source-driven facts:
//   • identifier = "GenericStep"; chooser card label = "Generic Step".
//   • Step canvas wrapper = .generic-step-container[generic-step-template];
//     gets class questionsAdded / questionsEmpty based on questionBank length.
//   • Each question slot = .generic-step-question-container[question-index];
//     its drop zone = .generic-step-column-content (ng-drop="true").
//     Empty slot text = .generic-step-empty-droppable-text → "Drag Assessment
//     widget from right panel" / "Paste Here".
//   • questionBank caps at 15 (onDropComplete pushes a new empty slot < 15).
//   • Settings panel = #generic-step-settings-panel[generic-step-settings];
//     title text "Generic Step"; Background Color (#bgColorInput
//     .colorPickerInputBox), Add Pattern checkbox (#caption-option,
//     ng-model currSettings.isBgPatternActive), pattern icons
//     (.icons-container .icons-item), Accessibility + Alt Text
//     (maxlength=2000, "Chars 2000").
//   • TOC per-step menu (.tocPageIconMenu): Clone New Level
//     (tocSectionClonePopup), Edit Metadata (tocSectionEditPopup), Delete
//     (tocSectionDeletePopup, gated by canDeletePage).
// =============================================================================

export const GS_IDENTIFIER = 'GenericStep';
export const GS_STEP_LABEL = 'Generic Step';

/** Step chooser modal (#widget-popup) DOM — open step tray + step type cards. */
export const GS_CHOOSER = {
  // "+ Add" TOC toggle + "Add New Step" item (bottom add button also valid).
  tocAddToggle: '#add-page-dropdown.removeAddPreview, .title-toc-holder .removeAddPreview',
  addNewStepItem: 'ul.dropdown-menu.tocPageIconMenu #StepWidgetBtm, ul.tocPageIconMenu #StepWidgetBtm',
  bottomAddStep: '.addStepBtn .addNewPageToc[data-target="#widget-popup"]',
  popup: '#widget-popup',
  title: '#widget-popup .step-title, #widget-popup #modalLabel',
  closeBtn: '#widget-popup .trayclose, #widget-popup [data-dismiss="modal"]',
  categoryList: '#widget-popup .category-list, #widget-popup .page-tray-col1',
  categoryText: '#widget-popup .category-list p.category-text, #widget-popup .page-tray-col1 p',
  stepCard: '#widget-popup .hover-div, #widget-popup .step-div',
  stepText: '#widget-popup .step-text',
} as const;

/** Step metadata wizard (#formsModal) DOM. */
export const GS_WIZARD = {
  modal: '#formsModal, .forms-modal',
  tabBtns: '#formsModal .tab-btns',
  basicInfoTab: '#formsModal #course-sec',
  levelsTab: '#formsModal #level-sec',
  titleLabel: '#formsModal #step-title-label',
  titleInput: '#formsModal #title, #title[ng-model="stepTitle"]',
  // Keyword tags (auto "Generic step" tag check + entry).
  tagsContainer: '#formsModal #tag-container',
  tagsInput: '#formsModal #tag',
  tagsList: '#formsModal #tag-list li span',
  tagsLabel: '#formsModal #tagLabel',
  // Levels of Support (new step = fixed 'Core').
  coreFixedMsg: '#formsModal #level-sec',
  // Navigation buttons.
  nextBtn: '#formsModal #nextBtn:visible',
  subBtn: '#formsModal #subBtn:visible',
  prevBtn: '#formsModal #prevBtn',
  backToChooser: '#formsModal #backPageTray',
  cancelBtn: '#formsModal button[ng-click="cancelAndReset()"]',
} as const;

/** Generic Step canvas container + column drop zones. */
export const GS_CANVAS = {
  desktop: '#desktop_view',
  container: '#desktop_view .generic-step-container, #desktop_view section[data-type="GenericStep"]',
  questionBox: '#desktop_view .generic-step-question-container-box',
  questionContainer: '#desktop_view .generic-step-question-container',
  column: '#desktop_view .generic-step-column-content',
  emptyText: '#desktop_view .generic-step-empty-droppable-text',
  emptyTextSpan: '#desktop_view .generic-step-empty-droppable-text span',
  droppedItem: '#desktop_view .generic-step-column-content .sd-item, #desktop_view .generic-step-column-content [data-type]',
} as const;

/** Generic Step settings panel (#generic-step-settings-panel). */
export const GS_SETTINGS = {
  panel: '#generic-step-settings-panel',
  title: '#generic-step-settings-panel .txt-set-title .para-ellipsis',
  settingsLabel: '#generic-step-settings-panel .Setting-Panel-setting-name',
  bgColorLabel: '#generic-step-settings-panel label[for="bgColorInput"]',
  bgColorInput: '#generic-step-settings-panel #bgColorInput.colorPickerInputBox',
  bgColorPickerBtn: '#generic-step-settings-panel .colorPickerButton',
  addPatternCheckbox: '#generic-step-settings-panel #caption-option',
  patternIcons: '#generic-step-settings-panel .icons-container .icons-item',
  accessibilityLabel: '#generic-step-settings-panel .accessibility',
  accessibilityPara: '#generic-step-settings-panel .accessibilityPara',
  altText: '#generic-step-settings-panel textarea[ng-model="currSettings.altText"]',
  altTextCharLimit: '#generic-step-settings-panel .altTextCharLimitText',
} as const;

/** TOC step rows + per-step (kebab) menu. */
export const GS_TOC = {
  heading: '.toc-outer-container, .toc-container',
  stepRows: '.toc-container[tocName]',
  stepTitle: '.toc-container .stepTitle',
  activeStep: '.subTocName.activeTocItem, li.activeTocItem',
  losTag: '.losTag .losTagTitle',
  // Per-step kebab menu (.tocMenuDiv) → menu items.
  kebab: '.toc-container .tocMenuDiv',
  menu: '.toc-container .tocPageIconMenu',
  menuClone: '.tocPageIconMenu li[ng-click*="tocSectionClonePopup"]',
  menuEdit: '.tocPageIconMenu li[ng-click*="tocSectionEditPopup"]',
  menuDelete: '.tocPageIconMenu li[ng-click*="tocSectionDeletePopup"]',
  // Step delete confirmation modal.
  deleteConfirmText: '.questionText',
  deleteConfirmBtn:
    'button:contains("Delete"), button:contains("OK"), button:contains("Yes"), [ng-click*="deleteSection"]',
} as const;

/** Source-verified business rules. */
export const GS_RULES = {
  /** questionBank auto-grows only while length < 15. */
  maxQuestionSlots: 15,
  /** Alt Text textarea maxlength. */
  altTextMaxLength: 2000,
  /** Default background colour from generic-step.json. */
  defaultBgColor: '#fff',
  /** Auto-applied keyword tag for a Generic Step (per QC TC_09). */
  autoKeywordTag: 'Generic step',
  /** Fixed level of support for a freshly created step. */
  fixedNewStepLoS: 'Core',
  /** Empty-slot prompt text. */
  emptyDropPrompt: 'Drag Assessment widget from right panel',
} as const;
