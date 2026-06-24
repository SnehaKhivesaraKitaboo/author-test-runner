/// <reference types="cypress" />
// =============================================================================
// Offline Step — Verified selectors (the STEP TYPE itself, not a dropped widget).
//
// Source of truth (KITABOO_Authoring):
//   js/page-tray.js ......... step chooser catalog. Offline Step lives in the
//                             "Non-interactive Step" category:
//                             { identifier: "offlineStep", stepName: 'Offline Step',
//                               name: 'Offline Step', disable: false,
//                               tooltip: 'Create your offline step' }.
//   index.html .............. dynamic chooser (#widget-popup, ng-repeat
//                             "step in obj.list" → .hover-div/.step-div/.step-text;
//                             card ng-click="pageType(step.identifier,step.stepName)"),
//                             shared metadata wizard (#formsModal): Step Title
//                             (#title, ng-model stepTitle), Instructions for
//                             Students/Teacher (#studentDesc / #teacherDesc),
//                             Next/Submit/Cancel/Change Step buttons, TOC step
//                             rows + per-step kebab menu.
//   config/config.js ........ offlineStep gating object (the "no interactive
//                             widgets" rule): all layout-1..7 false; interactive
//                             widgets (multiple-choice-template, fill-in-the-blank,
//                             match-the-pairs, highlight, correction, sorting,
//                             imagelabelling, group-interactivity-template,
//                             clickToReveal, wordsearch, shortLongAns, flashcard,
//                             Categorize, true-false-template, tableGO, mtp-multiple,
//                             identify-the-clip) = false; printable content
//                             (header, paragraph, poetry, image, video, audio,
//                             html-interactivity, tablesNew, sidebarComponent,
//                             slideshow, situationbox, sketchpad,
//                             chapter-headingNew-h1, aside-bar) = true.
//   editor/ngcontroller.js .. pageType switch: case "offlineStep" resolve()s with
//                             NO dedicated JSON template (unlike GenericStep).
//                             pageType==="offlineStep" is also treated like
//                             customTask when hiding default-component delete.
//
// Source-driven facts:
//   • identifier = "offlineStep"; chooser card label/name = "Offline Step";
//     category = "Non-interactive Step".
//   • There is NO templates/offline-step/ directory and NO offline-step.json —
//     the offline step reuses the standard #desktop_view editor canvas; its
//     identity is the config gating (printable content only, no interactive
//     widgets, no multi-column layouts).
//   • Metadata wizard (#formsModal) is shared with all steps: Step Title is
//     required (#nextBtn → ng-class disabledBtn when !stepTitle). pageType()
//     pushes the step name ("Offline Step") into the keyword tag list.
//
// > NOT YET LIVE-VERIFIED against a running authoring instance — selectors are
// > source-derived. A single run with AUTHORING_LAUNCH_URL will confirm them.
// =============================================================================

export const OS_IDENTIFIER = 'offlineStep';
export const OS_STEP_LABEL = 'Offline Step';
export const OS_STEP_CATEGORY = 'Non-interactive Step';

/** Step chooser modal (#widget-popup) DOM — open step tray + step type cards. */
export const OS_CHOOSER = {
  // "+ Add" TOC toggle + "Add New Step" item (bottom add button also valid).
  tocAddToggle: '#add-page-dropdown.removeAddPreview, .title-toc-holder .removeAddPreview',
  addNewStepItem: 'ul.dropdown-menu.tocPageIconMenu #StepWidgetBtm, ul.tocPageIconMenu #StepWidgetBtm',
  bottomAddStep: '.addStepBtn .addNewPageToc[data-target="#widget-popup"]',
  popup: '#widget-popup',
  title: '#widget-popup .step-title, #widget-popup #modalLabel',
  closeBtn: '#widget-popup .trayclose, #widget-popup [data-dismiss="modal"]',
  // Category header (ng-repeat "obj in stepArr" → p.category-name).
  categoryName: '#widget-popup .category-name',
  categoryDiv: '#widget-popup .category-div',
  // Each card (ng-repeat "step in obj.list").
  stepCard: '#widget-popup .hover-div, #widget-popup .step-div',
  stepText: '#widget-popup .step-text p',
} as const;

/** Step metadata wizard (#formsModal) DOM (shared across all step types). */
export const OS_WIZARD = {
  modal: '#formsModal, .forms-modal',
  tabBtns: '#formsModal .tab-btns',
  basicInfoTab: '#formsModal #course-sec',
  titleLabel: '#formsModal #step-title-label',
  titleInput: '#formsModal #title, #title[ng-model="stepTitle"]',
  // Instructions for Students / Teachers (textarea ng-model stuDesc / tecDesc).
  studentInstr: '#formsModal #studentDesc[ng-model="stuDesc"]',
  studentInstrCharCount: '#formsModal #studentCharCount',
  teacherInstr: '#formsModal #teacherDesc[ng-model="tecDesc"]',
  teacherInstrCharCount: '#formsModal #teacherCharCount',
  // Keyword tags (pageType pushes step name into tagItem).
  tagsContainer: '#formsModal #tag-container',
  tagsInput: '#formsModal #tag',
  tagsList: '#formsModal #tag-list li span',
  tagsLabel: '#formsModal #tagLabel',
  // Navigation buttons.
  nextBtn: '#formsModal #nextBtn',
  nextBtnVisible: '#formsModal #nextBtn:visible',
  subBtn: '#formsModal #subBtn',
  prevBtn: '#formsModal #prevBtn',
  changeStep: '#formsModal #backPageTray',
  cancelBtn: '#formsModal #cancelBtn[ng-click="cancelAndReset()"], #formsModal #cancelBtn',
} as const;

/** The standard editor canvas the Offline Step renders on (no dedicated template). */
export const OS_CANVAS = {
  desktop: '#desktop_view',
  // Standard authoring page wrapper (carries [new-toc] pagesequence/pagedbid).
  page: '#desktop_view [new-toc]',
  droppedItem: '#desktop_view .sd-item, #desktop_view [data-type]',
  // Right-rail components/widget tray (the "elements & widgets" panel).
  componentsPanel: '.components',
  trayAccordionToggle: '.components .accordion-toggle, .components #lbl-add-content .accordion-toggle',
  trayWidget: '.components [data-type], .components .widget-item, .components .component-item',
} as const;

/** TOC step rows + per-step (kebab) menu (shared TOC; reused from generic step). */
export const OS_TOC = {
  heading: '.toc-outer-container, .toc-container',
  stepRows: '.toc-container[tocName], .toc-container[pageId]',
  stepTitle: '.toc-container .stepTitle',
  activeStep: '.subTocName.activeTocItem, li.activeTocItem, .activeTocItem',
  // Per-step kebab menu (.tocMenuDiv) → menu items.
  kebab: '.toc-container .tocMenuDiv, .stepTocPageIcon .StepTocPageIconDiv',
  menu: '.tocPageIconMenu',
  menuClone: '.tocPageIconMenu li[ng-click*="tocSectionClonePopup"]',
  menuEdit: '.tocPageIconMenu li[ng-click*="tocSectionEditPopup"]',
  menuDelete: '.tocPageIconMenu li[ng-click*="tocSectionDeletePopup"]',
  // Step delete confirmation modal.
  deleteConfirmText: '.questionText',
  deleteConfirmBtn:
    'button:contains("Delete"), button:contains("OK"), button:contains("Yes"), [ng-click*="deleteSection"]',
} as const;

/**
 * Source-verified business rules from config/config.js `offlineStep` block.
 * This is the DOM-assertable "no interactive widgets" contract: printable
 * content elements are enabled; interactive assessment widgets + multi-column
 * layouts are disabled for the offline step.
 */
export const OS_RULES = {
  identifier: OS_IDENTIFIER,
  label: OS_STEP_LABEL,
  category: OS_STEP_CATEGORY,
  /** No dedicated template/JSON — case "offlineStep" resolve()s with no jsonPath. */
  hasDedicatedTemplate: false,
  /** All seven multi-column layouts are disabled for the offline step. */
  disabledLayouts: ['layout-1', 'layout-2', 'layout-3', 'layout-4', 'layout-5', 'layout-6', 'layout-7'],
  /** Printable / non-interactive content allowed in the offline step (config = true). */
  allowedContent: [
    'header',
    'paragraph',
    'poetry',
    'image',
    'video',
    'audio',
    'html-interactivity',
    'tablesNew',
    'sidebarComponent',
    'slideshow',
    'situationbox',
    'sketchpad',
    'chapter-headingNew-h1',
    'aside-bar',
  ],
  /** Interactive assessment widgets explicitly disabled (config = false) — the core rule. */
  blockedInteractiveWidgets: [
    'multiple-choice-template',
    'fill-in-the-blank',
    'match-the-pairs',
    'mtp-multiple',
    'highlight',
    'correction',
    'sorting',
    'imagelabelling',
    'group-interactivity-template',
    'clickToReveal',
    'wordsearch',
    'shortLongAns',
    'flashcard',
    'Categorize',
    'true-false-template',
    'tableGO',
    'identify-the-clip',
    'graphicOrganizerImageHotSpot',
    'annotationHighlightOutline',
    'lessonOpenerComponent',
  ],
  /** Step Title is mandatory: #nextBtn carries class disabledBtn while !stepTitle. */
  titleRequiredClass: 'disabledBtn',
  /** Instructions textareas advertise a 10000-character budget. */
  instructionsCharBudget: 10000,
  /** pageType('offlineStep','Offline Step') pushes this name into the keyword tag list. */
  autoKeywordTag: OS_STEP_LABEL,
} as const;
