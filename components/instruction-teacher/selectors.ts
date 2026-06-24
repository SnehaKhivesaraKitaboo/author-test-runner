/// <reference types="cypress" />
// =============================================================================
// Instruction for Teacher (FIXED TOC page) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   index.html                 (TOC entry markup + #desktop_view canvas + flat
//                               page placeholder text)
//   editor/ngcontroller.js     (pageType handling, savePhysicalPage, grouptoc)
//   config/config.js           (drop-permission matrix: teacherInstructions)
//
// IMPORTANT — this is NOT a dropped component/widget. "Instructions for Teacher"
// is a FIXED page that already exists in the Table of Contents (grouptoc.
// teacherInstructions). Tests NAVIGATE to the page (click the "Instructions for
// Teacher" TOC entry) and then author its content area / drop elements onto it.
//
// VERIFIED source identifier   : pageType === "teacherInstructions"
// TOC label (verified)         : "Instructions for Teacher"  (singular "Teacher")
// Canvas placeholder (verified): "Enter instructions for the teacher here."
//
// SOURCE AMBIGUITY (reported): the QC catalog lists dataType
// "instructionsteacher", but that exact string does NOT appear anywhere in
// config.js / index.html / ngcontroller.js. The real, source-verified page
// identifier is the AngularJS pageType "teacherInstructions". The catalog
// dataType is treated as a logical slug only — selectors below are derived
// from the verified "teacherInstructions" markup, never invented.
//
// Source-driven facts:
//   • #desktop_view is the page canvas (ng-drop, onDropComplete).
//   • Dropped elements render as #desktop_view .sd-item entries.
//   • [new-toc] carries pageType / pagesequence / pagedbid attributes once the
//     page is active (required before drops fire savePhysicalPage correctly).
//   • config.teacherInstructions allows ONLY these element drops (=true):
//       header, paragraph (Text), poetry, image, tablesNew (Table).
//     All assessment widgets / layouts are false → not droppable here.
// =============================================================================

export const IT_PAGE_TYPE = 'teacherInstructions';
export const IT_TOC_LABEL = 'Instructions for Teacher';
/** Logical slug from the QC catalog (NOT a verified DOM dataType — see header). */
export const IT_CATALOG_DATA_TYPE = 'instructionsteacher';

/** TOC navigation DOM (the fixed Instructions-for-Teacher entry). */
export const IT_TOC = {
  /** Clickable TOC entry text. */
  entryText: IT_TOC_LABEL,
  container: '.toc-container[pageId], [ng-click*="tocPageClick"]',
  subTocName: '.subTocName',
  activeItem: '.subTocName.activeTocItem, li.activeTocItem',
  stepTitle: '.subTocName .stepTitle',
  tocPanel: '[new-toc], .toc-contents.side-panel-contents',
} as const;

/** Authoring-canvas DOM for the active Instructions-for-Teacher page. */
export const IT_CANVAS = {
  /** The page canvas (ng-drop / onDropComplete target). */
  desktop: '#desktop_view',
  /** Active-page marker carrying the verified pageType attribute. */
  newToc: '[new-toc]',
  /** Each authored element dropped onto the page. */
  sdItem: '#desktop_view .sd-item',
  /** Flat-page placeholder shown when the page is empty. */
  placeholder: '#desktop_view .drag-widget-text.mainPageText, .page-element .drag-widget-text',
  /** Generic contenteditable body of a dropped Text/paragraph element. */
  paragraphBody: '#desktop_view .paragraph-container.editables',
} as const;

/** Source-verified element drops permitted on this page (config.teacherInstructions === true). */
export const IT_ALLOWED_ELEMENTS = {
  header: { widgetName: 'Header', dataType: 'header' },
  text: { widgetName: 'Text', dataType: 'paragraph' },
  image: { widgetName: 'Image', dataType: 'image' },
  table: { widgetName: 'Table', dataType: 'tablesNew' },
} as const;

/** Source-verified business rules / page-type facts. */
export const IT_RULES = {
  pageType: IT_PAGE_TYPE,
  tocLabel: IT_TOC_LABEL,
  placeholderText: 'Enter instructions',
  /** Page is reached by TOC navigation, not by dropping a widget. */
  isFixedTocPage: true,
} as const;
