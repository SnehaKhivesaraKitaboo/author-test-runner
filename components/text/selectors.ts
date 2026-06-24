/// <reference types="cypress" />
// =============================================================================
// Text (paragraph element) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                              (widget catalog: name "Text", dataType "paragraph")
//   templates/paragraph/paragraph.html            (canvas DOM)
//   templates/paragraph/paragraph_settings.html   (settings panel)
//   templates/paragraph/default/paragraph.json    (default field data + style_tab)
//   templates/paragraph/scripts/paragraph-directive.js (directive: paragraphTemplate)
//   templates/stylepanel.html                     (shared <stylepanel> markup)
//   templates/textEditor.html                     (rich-text editing toolbar)
//
// dataType = "paragraph"; widget name = "Text"; directive = "paragraph-template".
// Canvas wrapper = `.customClass[data-type="paragraph"]` with inner
// `section[paragraph-template]`. Settings panel id = "#text-settings-panel"
// (title "Text").
//
// Source-driven facts:
//   • Text is an ELEMENT (not an assessment widget) — it drops onto the
//     Instructions-for-Students canvas (#desktop_view), NOT a Generic Step column.
//   • Main editable body is `.paragraph-container` (contenteditable, ng-model
//     fieldData.header) — use cy.setContentEditableOn, never cy.type().
//   • Label-type fields (.questionNoText / .questionNoSecondaryText) render only
//     when settings.isLabelTypeParagraph + labelType primary/secondary.
//   • Paragraph number field renders only when settings.paragrahNumberShow.
//   • Styles are data-driven from style_tab.stylesHolder; each style button has
//     id="{{option.name}}": defaultText, blockTextParagraph, blockquote (Quote),
//     dropCapflag (Drop Cap), emphasisText, buttontext, buttonBorderText.
//   • Settings actions: "Upload Image" (#inline-image), "Insert Text"
//     (insertInlineText), "Apply to all" / "Reset changes" buttons.
//   • The rich-text toolbar (textEditor.html) is a floating overlay shown on
//     focus; alignment / math / special-char controls live there.
// =============================================================================

export const TEXT_DATA_TYPE = 'paragraph';
export const TEXT_WIDGET_NAME = 'Text';

/** Authoring-canvas DOM (the dropped Text/paragraph element). */
export const TEXT_CANVAS = {
  widget: `.customClass[data-type="${TEXT_DATA_TYPE}"], [data-type="${TEXT_DATA_TYPE}"]`,
  /** The component <section paragraph-template> wrapper. */
  component: 'section[paragraph-template], .component-holder.paragraph-select',
  sdItem: '#desktop_view .sd-item:has([data-type="paragraph"]), #desktop_view .sd-item:has(section[paragraph-template])',
  /** Main editable body (contenteditable; ng-model fieldData.header). */
  body: '.paragraph-container.editables',
  /** Label-type fields (only when isLabelTypeParagraph). */
  labelPrimary: '.paragraph .questionNoText',
  labelSecondary: '.paragraph .questionNoSecondaryText',
  /** Paragraph number (only when paragrahNumberShow). */
  paragraphNumber: '.paragraph-number-input',
  /** Author name (only for blockquote style + allowAuthorName). */
  authorName: '.authorName',
} as const;

/** Settings panel DOM (#text-settings-panel). */
export const TEXT_SETTINGS = {
  panel: '#text-settings-panel',
  title: '#text-settings-panel .templateName',
  icon: '#text-settings-panel .icon-Text_Paragraph.settingIcon',

  // Label type
  showLabelType: '#text-settings-panel input[ng-model="currSettings.isLabelTypeParagraph"]',
  labelPrimary: '#text-settings-panel input[name="labelType"][value="primary"]',
  labelSecondary: '#text-settings-panel input[name="labelType"][value="secondary"]',

  // Paragraph number
  showParagraphNumber: '#text-settings-panel #paragraph-checkbox',

  // Upload / insert actions
  uploadImage: '#text-settings-panel #inline-image',
  insertText: '#text-settings-panel [ng-click="insertInlineText($event)"]',
  deleteInlineText: '#text-settings-panel .delete-inline',

  // Inline-text alignment (renders only when settings.inlineText after Insert Text)
  alignSection: '#text-settings-panel #img-align',
  alignLeft: '#text-settings-panel #inline-text-left',
  alignRight: '#text-settings-panel #inline-text-right',

  // Apply to all / Reset
  applyToAll: '#text-settings-panel .applyToAllButton',
  resetChanges: '#text-settings-panel .applyToAllResetButton',
  accessibilityPara: '#text-settings-panel .accessibilityPara',

  // Author name (blockquote only)
  showAuthorName: '#text-settings-panel #caption-option',

  // Styles (shared <stylepanel>)
  stylePanel: '#text-settings-panel .header-styles-panel',
  styleButtons: '#text-settings-panel .styleBackground',
} as const;

/** Source-verified style option names (style_tab.stylesHolder[].name → button id). */
export const TEXT_STYLES = {
  default: 'defaultText',
  blockText: 'blockTextParagraph',
  quote: 'blockquote',
  dropCap: 'dropCapflag',
  emphasis: 'emphasisText',
  button: 'buttontext',
  buttonBorder: 'buttonBorderText',
} as const;

/** Rich-text editing toolbar (templates/textEditor.html) — floating overlay. */
export const TEXT_EDITOR = {
  container: '.editing-container .editor-list',
  bold: '.editor-list .bold.icon-Bold',
  italic: '.editor-list .italic.icon-Italic',
  underline: '.editor-list .underline.icon-Underline',
  alignLeft: '.editor-list #align-left',
  alignCenter: '.editor-list #align-center',
  alignRight: '.editor-list #align-right',
  alignJustify: '.editor-list #align-justify',
  mathEquation: '.editor-list #equation',
  specialChar: '.editor-list #specialcharacter',
  splitPara: '.editor-list .split-para',
  insertImage: '.editor-list #inline-plain-image',
} as const;

/** Source-verified business rules / defaults. */
export const TEXT_RULES = {
  defaultStyle: 'defaultText',
  defaultLabelType: 'primary',
  widgetName: TEXT_WIDGET_NAME,
} as const;
