/// <reference types="cypress" />
// =============================================================================
// HTML Interactivity (html-interactivity element) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                                  (widget catalog)
//   templates/htmlInteractivity/html-interactivity.html               (canvas DOM)
//   templates/htmlInteractivity/html-interactive-settings-panel.html  (settings panel)
//   templates/htmlInteractivity/default/html-interactivity.json       (default field data)
//   templates/htmlInteractivity/scripts/html-interactive-directive.js (directive)
//   templates/stylepanel.html                                         (shared <stylepanel>)
//
// dataType = "html-interactivity"; widget name = "HTML Interactivity";
// directive = "htmlinteractivity-template" (attr [data-htmlinteractivity-template]).
// Settings panel id = "#html-interactive-settings-panel" (title "HTML Interactivity").
//
// ⚠ SOURCE NOTE — what this component actually is:
//   The real HTML Interactivity component is a **HTML-package (.zip) uploader**.
//   It renders the uploaded package inside an <object data="{{fieldData.indexLink}}">
//   (popup or inline). There is NO free-text "HTML snippet / source editor" and NO
//   author-facing <iframe srcdoc> in the source templates — those exist only in the
//   QC narrative. Authoring DOM exposes: zip upload box, Show Interactivity
//   (Popup/Inline) radios, Show Header / Show Caption checkboxes, No Outline /
//   Outline & Fill Background radios + colour picker, style thumbnails (style1/2),
//   Tags input, and Accessibility Alt Text (maxlength 2000).
//
// Source-driven facts:
//   • HTML Interactivity is an ELEMENT (not an assessment widget): "html-interactivity"
//     is ABSENT from support/module-setup.ts ASSESSMENT_DATA_TYPES, so
//     resolveDropTarget routes it to the canvas — it drops onto the
//     Instructions-for-Students page (#desktop_view) via cy.dropComponent(...),
//     NOT into a Generic Step column.
//   • The dropped wrapper is `.htmlStyleSet` (carries the active style class +
//     ng-style width/height/background); inner package holder is
//     `.html-interactivity.component-holder[data-htmlinteractivity-template]`.
//   • Header (`.sc-intro.template-header`), Instruction (`.sc-instr`) and Caption
//     (`.imgCaption.template-caption`) are contenteditable, gated by
//     settings.isHeaderText / isInstructionText / isCaptionText.
//   • Uploaded package renders in <object data-htmlurl="{{indexLink}}"> — present
//     only after a real .zip upload (deferred; needs OS file picker + server).
//   • Styles are data-driven (style_tab.stylesHolder: style1 default-active, style2)
//     via the shared <stylepanel>.
//   • Outline radios: value="outline" (No Outline) / value="outlineBg"
//     (Outline & Fill Background, reveals colour swatches + colour picker).
// =============================================================================

export const HI_DATA_TYPE = 'html-interactivity';
export const HI_WIDGET_NAME = 'HTML Interactivity';
export const HI_DIRECTIVE = 'htmlinteractivity-template';

/** Authoring-canvas DOM (the dropped HTML Interactivity element). */
export const HI_CANVAS = {
  /** Outer style wrapper (active style class + width/height/bg via ng-style). */
  styleSet: '.htmlStyleSet',
  /** Catalog wrapper / package holder. */
  widget: `.customClass[data-type="${HI_DATA_TYPE}"], [data-type="${HI_DATA_TYPE}"], .html-interactivity.component-holder`,
  /** Component package holder (directive attribute). */
  component: '.html-interactivity.component-holder[data-htmlinteractivity-template], [data-htmlinteractivity-template]',
  sdItem:
    '#desktop_view .sd-item:has([data-htmlinteractivity-template]), #desktop_view .sd-item:has(.htmlStyleSet)',
  /** Header text (contenteditable; only when isHeaderText). */
  header: '.htmlStyleSet .sc-intro.template-header',
  /** Instruction text (contenteditable; only when isInstructionText). */
  instruction: '.htmlStyleSet .sc-instr.template-instruction',
  /** Caption (contenteditable; only when isCaptionText). */
  caption: '.htmlStyleSet .imgCaption.template-caption',
  /** Rendered package object (only after a real zip upload — deferred). */
  packageObject: '.htmlInteractivity-zip object[data-htmlurl], .inline-play-container object[data-htmlurl]',
  /** Markup / upload trigger icon on the canvas tile. */
  markupIcon: '.html-interactive-content .upload-font',
} as const;

/** Settings panel DOM (#html-interactive-settings-panel). */
export const HI_SETTINGS = {
  panel: '#html-interactive-settings-panel',
  title: '#html-interactive-settings-panel .txt-set-title .para-ellipsis',
  icon: '#html-interactive-settings-panel .txt-set-icon.icon-HTML-Interactivity',

  // Zip upload box (label flips Upload ↔ Replace via currSettings.fileuploaded)
  uploadZip: '#html-interactive-settings-panel #upload-zip',
  uploadInstruction: '#html-interactive-settings-panel .uploadInteractivityInstruction',
  zipName: '#html-interactive-settings-panel #chapter-img-namec',
  zipSize: '#html-interactive-settings-panel #img-dimenc',

  // Show Interactivity (Popup / Inline radios)
  showInteractivityPopup: '#html-interactive-settings-panel input[name="showInteractivity"][value="popup"]',
  showInteractivityInline: '#html-interactive-settings-panel input[name="showInteractivity"][value="inline"]',

  // Display toggles
  showHeader: '#html-interactive-settings-panel #show-header',
  showCaption: '#html-interactive-settings-panel #show-caption',

  // Outline / fill background
  outlineNone: '#html-interactive-settings-panel input[name="outline"][value="outline"]',
  outlineBg: '#html-interactive-settings-panel input[name="outline"][value="outlineBg"]',
  colorOptions: '#html-interactive-settings-panel .colorOption .color',
  colorPickerButton: '#html-interactive-settings-panel .colorPickerButton',
  colorPickerInput: '#html-interactive-settings-panel .colorPickerInputBox',

  // Tags
  tagsInput: '#html-interactive-settings-panel input[ng-model="currSettings.metaTags"]',

  // Accessibility / Alt Text
  accessibilityHeading: '#html-interactive-settings-panel .headerPara',
  accessibilityPara: '#html-interactive-settings-panel .accessibilityPara',
  altText: '#html-interactive-settings-panel textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '#html-interactive-settings-panel .altTextCharLimitText',

  // Styles (shared <stylepanel>)
  stylePanel: '#html-interactive-settings-panel stylepanel',
} as const;

/** Source-verified business rules / defaults (from default/html-interactivity.json). */
export const HI_RULES = {
  widgetName: HI_WIDGET_NAME,
  dataType: HI_DATA_TYPE,
  directive: HI_DIRECTIVE,
  altTextMaxLength: 2000,
  defaultOutline: 'outline',
  defaultPlayInline: 'inline',
  defaultStyle: 'style1',
  acceptedUploadExt: 'zip',
  defaultInstructionText: 'Click here to open this interactivity',
} as const;
