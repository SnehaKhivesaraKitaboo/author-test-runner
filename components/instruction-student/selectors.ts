/// <reference types="cypress" />
// =============================================================================
// Instruction for Student (FIXED TOC page) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   index.html                 (TOC entry markup + #desktop_view canvas + flat
//                               page placeholder text)
//   editor/ngcontroller.js     (pageType handling, savePhysicalPage, grouptoc)
//   config/config.js           (drop-permission matrix: studentInstructions)
//
// IMPORTANT — this is NOT a dropped component/widget. "Instructions for Students"
// is a FIXED page that already exists in the Table of Contents (grouptoc.
// studentInstructions). Tests NAVIGATE to the page (cy.navigateToCanvasPage,
// which clicks the "Instructions for Students" TOC entry) and then author its
// content area / drop elements onto it.
//
// VERIFIED source identifier   : pageType === "studentInstructions"
// TOC label (verified)         : "Instructions for Students"
// Canvas placeholder (verified): "Enter instructions for students here."
//
// SOURCE AMBIGUITY (reported): the QC catalog lists dataType
// "instructionsstudents", but that exact string does NOT appear anywhere in
// config.js / index.html / ngcontroller.js. The real, source-verified page
// identifier is the AngularJS pageType "studentInstructions". The catalog
// dataType is treated as a logical slug only — selectors below are derived
// from the verified "studentInstructions" markup, never invented.
//
// Source-driven facts:
//   • #desktop_view is the page canvas (ng-drop, onDropComplete).
//   • Dropped elements render as #desktop_view .sd-item entries.
//   • [new-toc] carries pageType / pagesequence / pagedbid attributes once the
//     page is active (required before drops fire savePhysicalPage correctly).
//   • config.studentInstructions allows ONLY these element drops (=true):
//       header, paragraph (Text), poetry, image, tablesNew (Table).
//     All assessment widgets / layouts are false → not droppable here.
// =============================================================================

export const IS_PAGE_TYPE = 'studentInstructions';
export const IS_TOC_LABEL = 'Instructions for Students';
/** Logical slug from the QC catalog (NOT a verified DOM dataType — see header). */
export const IS_CATALOG_DATA_TYPE = 'instructionsstudents';

/** TOC navigation DOM (the fixed Instructions-for-Students entry). */
export const IS_TOC = {
  /** Clickable TOC entry text (used by cy.navigateToCanvasPage). */
  entryText: IS_TOC_LABEL,
  container: '.toc-container[pageId], [ng-click*="tocPageClick"]',
  subTocName: '.subTocName',
  activeItem: '.subTocName.activeTocItem, li.activeTocItem',
  stepTitle: '.subTocName .stepTitle',
  tocPanel: '[new-toc], .toc-contents.side-panel-contents',
} as const;

/** Authoring-canvas DOM for the active Instructions-for-Students page. */
export const IS_CANVAS = {
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

/** Source-verified element drops permitted on this page (config.studentInstructions === true). */
export const IS_ALLOWED_ELEMENTS = {
  header: { widgetName: 'Header', dataType: 'header' },
  text: { widgetName: 'Text', dataType: 'paragraph' },
  image: { widgetName: 'Image', dataType: 'image' },
  table: { widgetName: 'Table', dataType: 'tablesNew' },
} as const;

/** Source-verified business rules / page-type facts. */
export const IS_RULES = {
  pageType: IS_PAGE_TYPE,
  tocLabel: IS_TOC_LABEL,
  placeholderText: 'Enter instructions',
  /** Page is reached by TOC navigation, not by dropping a widget. */
  isFixedTocPage: true,
} as const;
