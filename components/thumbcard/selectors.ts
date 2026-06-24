/// <reference types="cypress" />
// =============================================================================
// Thumbs Card Header (thumbcard) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                                     (widget catalog: name "Thumbs Card Header", dataType "thumbs-card-header")
//   templates/thumbs-card-header/thumbs-card-header.html                 (canvas DOM)
//   templates/thumbs-card-header/thumbs-card-header-settings-pannel.html (settings panel)
//   templates/thumbs-card-header/default/thumbs-card-header.json         (default field data + settings)
//   templates/thumbs-card-header/scripts/thumbs-card-header-directive.js (directive: thumbsCardHeaderTemplate)
//   templates/thumbs-card-header/styles/thumbs-card-header-template.css  (styling)
//
// dataType = "thumbs-card-header"; widget name = "Thumbs Card Header";
// directive = "thumbs-card-header-template". Canvas wrapper =
// `section.thumbs-card-header[thumbs-card-header-template]`. Settings panel
// container = `.thumbs-card-header-setting` (title "Thumbs Card Header").
//
// Source-driven facts:
//   • Thumbs Card Header is an ELEMENT (not an assessment widget) — it drops
//     onto the Instructions-for-Students canvas (#desktop_view), NOT a Generic
//     Step column ("thumbs-card-header" is absent from ASSESSMENT_DATA_TYPES).
//   • The widget is FLAG-GATED: config.js sets "thumbs-card-header": false for
//     most subjects/modules and true only for a few. When the catalog entry is
//     not offered the drop helper logs + returns gracefully.
//   • The component is a SINGLE header (icon + one heading), NOT a multi-card
//     grid. The QC catalog's "add/remove cards", "card link", and "Rounded
//     Corners Text Box" wording does not map to anything in this source DOM;
//     those cases are documented against the real single-header structure or
//     deferred. See THUMBCARD-DEEP-AUTOMATION.md.
//   • Fixed icon: `img.thumbs-card-header-icon` — src is data-driven from
//     settings.thumbsCardIcons[thumbsCardActiveIcons].icon; it is NOT
//     contenteditable and has no ng-click (not user-editable).
//   • Editable heading: `.thumbs-card-header-heading` (contenteditable,
//     ng-model fieldData.introductionText) — use cy.setContentEditableOn,
//     never cy.type().
//   • Settings panel: two selectable thumbs icons (.icons-item, repeated over
//     settings.thumbsCardIcons), Background Color (#headerBgColorInput),
//     Stroke Color (#headerStrokeColorInput) colour pickers, and an Alt Text
//     textarea (maxlength 2000).
// =============================================================================

export const THUMBCARD_DATA_TYPE = 'thumbs-card-header';
export const THUMBCARD_WIDGET_NAME = 'Thumbs Card Header';

/** Authoring-canvas DOM (the dropped Thumbs Card Header element). */
export const THUMBCARD_CANVAS = {
  widget: `[data-type="${THUMBCARD_DATA_TYPE}"], section.thumbs-card-header, section[thumbs-card-header-template]`,
  /** The component <section thumbs-card-header-template> wrapper. */
  component: 'section.thumbs-card-header[thumbs-card-header-template], .component-holder.thumbs-card-header',
  sdItem:
    '#desktop_view .sd-item:has(section[thumbs-card-header-template]), #desktop_view .sd-item:has(.thumbs-card-header)',
  /** Inner styled container (carries ng-style bg/stroke colours). */
  container: '.thumbs-card-container',
  /** Fixed thumbs icon (data-driven src; NOT contenteditable, no ng-click). */
  icon: 'img.thumbs-card-header-icon',
  iconSpan: '.thumbs-card-header-icon-span',
  /** Editable heading (contenteditable; ng-model fieldData.introductionText). */
  heading: '.thumbs-card-header-heading.editables',
} as const;

/** Settings panel DOM (.thumbs-card-header-setting). */
export const THUMBCARD_SETTINGS = {
  panel: '.thumbs-card-header-setting',
  title: '.thumbs-card-header-setting .templateName',
  icon: '.thumbs-card-header-setting .icon-Thumbs-Card-Header1.settings-icon',

  // Two selectable thumbs icons (ng-repeat over currSettings.thumbsCardIcons).
  iconsContainer: '.thumbs-card-header-setting .icons-container',
  iconItems: '.thumbs-card-header-setting .icons-item',
  iconItemActive: '.thumbs-card-header-setting .icons-item.active',
  iconItemImg: '.thumbs-card-header-setting .icons-item .icons-image',

  // Colour pickers
  bgColorInput: '.thumbs-card-header-setting #headerBgColorInput',
  strokeColorInput: '.thumbs-card-header-setting #headerStrokeColorInput',
  colorPickerButtons: '.thumbs-card-header-setting .colorPickerButton',

  // Accessibility / Alt Text
  accessibilityLabel: '.thumbs-card-header-setting .accessibility',
  accessibilityPara: '.thumbs-card-header-setting .accessibilityPara',
  altText: '.thumbs-card-header-setting textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '.thumbs-card-header-setting .altTextCharLimitText',
} as const;

/** Source-verified business rules / defaults (from default/thumbs-card-header.json). */
export const THUMBCARD_RULES = {
  /** settings.headerBgColor default. */
  defaultHeaderBgColor: '#FFF1D0',
  /** settings.headerStrokeColor default. */
  defaultHeaderStrokeColor: '#FFFFFF',
  /** settings.thumbsCardActiveIcons default (first of two icons). */
  defaultActiveIconIndex: 0,
  /** Number of thumbs icons offered by the catalog default. */
  iconCount: 2,
  /** Alt Text textarea maxlength. */
  altTextMaxLength: 2000,
  /** Default fieldData.introductionText. */
  defaultIntroductionText: 'Name',
  widgetName: THUMBCARD_WIDGET_NAME,
} as const;
