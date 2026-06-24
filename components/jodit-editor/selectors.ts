/// <reference types="cypress" />
// =============================================================================
// Jodit Editor (platform rich-text editor) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   js/jodit-init.js                                    (Jodit config + ELA toolbar button list)
//   templates/shortLongAns/shortLongAns.html            (host: textarea.ansJODIT[data-jodit])
//   templates/shortLongAns/shortLongAns-settings-pannel.html (RTE + Advance/JODIT gates, TOCFlag)
//   templates/shortLongAns/scripts/shortLongAns-directive.js (Jodit.make(textareaId, …) on click)
//   assets/externalModules/LiteracySEJodit050625/jodit.min.css (BEM class names)
//
// HOST ARCHITECTURE (source-verified — NOT a Text/paragraph element):
//   The Jodit editor is mounted by the Extended Response (shortLongAns) widget,
//   NOT by the Text/paragraph element (which uses the legacy textEditor.html
//   overlay). Jodit is created via `Jodit.make(textareaId, …)` against the
//   `textarea.ansJODIT[data-jodit]` ONLY when BOTH:
//     • Answer Type  = RTE   (currSettings.activeAns === 'RTE')
//     • Keyboard Type = Advance/JODIT (currSettings.keyboardType === 'JODIT')
//   and the component is clicked. Both radios are gated by `TOCFlag`, so the
//   editor may be unavailable in builds without that flag → log + return.
//
// Source-driven facts:
//   • Jodit build = jodit.min.js (Jodit 3/4 → standard BEM `jodit-*` classes).
//   • Toolbar buttons (js/jodit-init.js joditToolbars.ELA): bold, italic,
//     underline, strikethrough, eraser, ul, ol, font, fontsize, paragraph,
//     lineHeight, spellcheck, speechRecognize, indent, outdent, align, brush,
//     superscript, subscript, cut, copy, paste, selectall, hr, table, link,
//     symbols, find, fullsize, preview, print, undo, redo.
//   • removeButtons (directive): file, image, video → no upload button.
//   • Each toolbar button = `.jodit-toolbar-button_<name>` containing
//     `button.jodit-toolbar-button__button`. The editable area = `.jodit-wysiwyg`
//     (contenteditable) inside an iframe-mode `.jodit-wysiwyg_iframe`.
//   • Link / symbols / table open a `.jodit-popup` overlay with inputs.
// =============================================================================

export const JODIT_HOST_DATA_TYPE = 'shortLongAns';
export const JODIT_HOST_WIDGET_NAME = 'Extended Response';

/** Extended Response host DOM (the widget that mounts Jodit). */
export const JODIT_HOST = {
  widget: `[data-type="${JODIT_HOST_DATA_TYPE}"], .shortLongAnsComponent`,
  component: '.shortLongAnsComponent',
  /** The textarea Jodit is attached to (data-jodit / ansJODIT). */
  joditTextarea: '.shortLongAnsComponent textarea.ansJODIT',
  rteTextarea: '.shortLongAnsComponent textarea.ansRTE',
} as const;

/** Extended Response settings panel — gates that mount Jodit (#shortLongAns-setting). */
export const JODIT_HOST_SETTINGS = {
  panel: '#shortLongAns-setting',
  title: '#shortLongAns-setting .templateName',
  // Answer type radios (RTE gated by TOCFlag)
  answerRte: '#shortLongAns-setting input[name="placement"].answerTypeBtn[value="RTE"]',
  answerShort: '#shortLongAns-setting input[name="placement"].answerTypeBtn[value="shortAns"]',
  answerLong: '#shortLongAns-setting input[name="placement"].answerTypeBtn[value="longAns"]',
  // Keyboard type radios (gated by TOCFlag): Basic / Advance(JODIT)
  keyboardBasic: '#shortLongAns-setting input[name="keyboard"].keyboardTypeBtn[value="BASIC"]',
  keyboardAdvance: '#shortLongAns-setting input[name="keyboard"].keyboardTypeBtn[value="JODIT"]',
} as const;

/** Jodit editor container + editable area (standard Jodit BEM classes). */
export const JODIT = {
  /** Top-level Jodit wrapper. */
  container: '.jodit-container, .jodit',
  /** Toolbar box (holds all toolbar buttons). */
  toolbar: '.jodit-toolbar__box, .jodit-toolbar-editor-collection',
  /** Editable WYSIWYG area (contenteditable; iframe mode → inside iframe). */
  wysiwyg: '.jodit-wysiwyg',
  /** Status bar / char counter (disabled in this config → typically absent). */
  statusBar: '.jodit-status-bar',
  /** Full-size (expanded editor) state class on the container. */
  fullsizeContainer: '.jodit_fullsize, .jodit-container.jodit_fullsize',
  /** Popups opened by link / table / symbols. */
  popup: '.jodit-popup, .jodit-dialog',
  popupInput: '.jodit-popup input, .jodit-dialog input',
} as const;

/**
 * Toolbar buttons keyed by Jodit button name → `.jodit-toolbar-button_<name>`.
 * Names are taken verbatim from js/jodit-init.js joditToolbars.ELA.
 */
const tb = (name: string): string =>
  `.jodit-toolbar-button_${name}, .jodit-toolbar-button[data-ref="${name}"], button[aria-label*="${name}" i]`;

export const JODIT_BUTTONS = {
  bold: tb('bold'),
  italic: tb('italic'),
  underline: tb('underline'),
  strikethrough: tb('strikethrough'),
  eraser: tb('eraser'),
  ul: tb('ul'),
  ol: tb('ol'),
  font: tb('font'),
  fontsize: tb('fontsize'),
  paragraph: tb('paragraph'),
  lineHeight: tb('lineHeight'),
  indent: tb('indent'),
  outdent: tb('outdent'),
  align: tb('align'),
  brush: tb('brush'),
  superscript: tb('superscript'),
  subscript: tb('subscript'),
  table: tb('table'),
  link: tb('link'),
  symbols: tb('symbols'),
  find: tb('find'),
  fullsize: tb('fullsize'),
  undo: tb('undo'),
  redo: tb('redo'),
} as const;

/** Inner clickable element within a toolbar button. */
export const JODIT_BUTTON_INNER = '.jodit-toolbar-button__button';

/** Source-verified business rules / defaults. */
export const JODIT_RULES = {
  /** js/jodit-init.js joditToolbars.ELA — the enabled toolbar set. */
  elaToolbarButtons: [
    'bold', 'italic', 'underline', 'strikethrough',
    'eraser', 'ul', 'ol', 'font', 'fontsize', 'paragraph',
    'lineHeight', 'spellcheck', 'speechRecognize',
    'indent', 'outdent', 'align', 'brush', 'superscript', 'subscript',
    'cut', 'copy', 'paste', 'selectall', 'hr', 'table',
    'link', 'symbols', 'find', 'fullsize', 'preview', 'print', 'undo', 'redo',
  ],
  /** removeButtons in shortLongAns-directive.js → no media upload. */
  removedButtons: ['file', 'image', 'video'],
  /** enter:"BR" / cleanHTML config in jodit-init.js. */
  enterMode: 'BR',
  hostAnswerType: 'RTE',
  hostKeyboardType: 'JODIT',
} as const;

/**
 * Selector-presence rules: a togglable formatting button must render a single
 * `.jodit-toolbar-button_<name>` whose inner control is a real <button>.
 */
export const JODIT_RULES_SELECTORS = {
  toolbarButton: (name: string): string => `.jodit-toolbar-button_${name}`,
  toolbarButtonInner: (name: string): string =>
    `.jodit-toolbar-button_${name} .jodit-toolbar-button__button`,
} as const;
