/// <reference types="cypress" />
// =============================================================================
// Wordsearch (Word Search) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                   (catalog: name "Word Search", dataType "wordsearch")
//   templates/wordsearch/wordsearch.html               (canvas DOM)
//   templates/wordsearch/wordsearch-settings.html      (settings panel)
//   templates/wordsearch/default/wordsearch.json       (default field data + style_tab)
//   templates/wordsearch/scripts/wordsearch.js         (directive: wordsearchTemplate)
//
// dataType = "wordsearch"; widget name = "Word Search"; directive = "wordsearch-template".
// Canvas wrapper = `.component-holder.wordsearch[wordsearch-template]` (NO data-type
// attribute — the directive is the stable hook). Settings panel id =
// "#word-settings-panel" (title "Word Search").
//
// Source-driven facts (from wordsearch.js + wordsearch.html):
//   • Wordsearch is an ELEMENT (not an assessment widget) — it drops onto the
//     Instructions-for-Students canvas (#desktop_view), NOT a Generic Step column
//     (wordsearch is absent from support/module-setup.ts ASSESSMENT_DATA_TYPES).
//   • Hidden Word input `#hiddenWordInput` is contenteditable (ng-model textData),
//     pattern="[a-zA-Z]+" + ng-pattern-restrict (letters only), and onKeyPress
//     blocks typing at 13 chars, blocks space (charCode 32), and triggers Add on
//     Enter (charCode 13). So numbers/spaces are rejected at input time.
//   • ADD button `.add-btn` → onAddButtonClick: pushes scope.textData.toUpperCase()
//     into fieldData.settings.wordList. Words are UPPERCASED (case-insensitive),
//     de-duplicated via $.inArray, and capped at scope.maxWordCount = 13 words.
//   • WORDS list = `.wordListHolder` → repeated `.wordListRepeat` rows; each row has
//     `.wordData` (the word text) + `.deleteWord` delete button (onDeleteBtnClick).
//     Delete button is ng-disabled when wordList.length == 1 (cannot empty the list).
//   • Show Words toggles `.wordListHolder` fadeInWords/fadeOutWords (no DOM removal).
//   • Grid generation (`.puzzle-holder` → `.puzzleSquare`, `.addedWord` highlight)
//     and the blue word-highlight come from wordfind.js at runtime → deferred.
//   • Settings checkboxes default checked: Add Show Me / Add Header / Add
//     Instruction Text / Show Words (default json isShowWordsVisible:true).
//   • Outline radios render in settings (value outline | outlineBg); colour picker
//     `.colorPickerInputBox` (ng-model currSettings.Appearance, default #7eb1eb).
// =============================================================================

export const WS_DATA_TYPE = 'wordsearch';
export const WS_WIDGET_NAME = 'Word Search';

/** Authoring-canvas DOM (the dropped Wordsearch element). */
export const WS_CANVAS = {
  /** Stable hook is the directive attribute (no data-type on the wrapper). */
  widget: '.component-holder.wordsearch[wordsearch-template], [wordsearch-template]',
  component: '[wordsearch-template]',
  sdItem: '#desktop_view .sd-item:has([wordsearch-template])',

  // Editable header / instruction / question fields (contenteditable).
  header: '[wordsearch-template] #headerTextInput',
  instruction: '[wordsearch-template] #instructionTextInput',
  question: '[wordsearch-template] #questionTextInput',
  headerHolder: '[wordsearch-template] .sc-intro-holder',
  instructionHolder: '[wordsearch-template] .sc-instr-holder',

  // Hidden-word entry (contenteditable, letters-only, ng-model textData).
  hiddenWordInput: '[wordsearch-template] #hiddenWordInput',
  addButton: '[wordsearch-template] .add-btn',

  // WORDS section.
  wordListHolder: '[wordsearch-template] .wordListHolder',
  wordListLabel: '[wordsearch-template] .wordListHolder .lbl-words',
  wordRow: '[wordsearch-template] .wordListRepeat',
  wordData: '[wordsearch-template] .wordListRepeat .wordData',
  deleteWord: '[wordsearch-template] .wordListRepeat .deleteWord',

  // Grid (runtime / wordfind.js — used only by deferred checks).
  puzzleHolder: '[wordsearch-template] .puzzle-holder',
  puzzleSquare: '[wordsearch-template] .puzzle-holder .puzzleSquare',
  addedWord: '[wordsearch-template] .puzzle-holder .addedWord',
} as const;

/** Settings panel DOM (#word-settings-panel). */
export const WS_SETTINGS = {
  panel: '#word-settings-panel',
  title: '#word-settings-panel .txt-set-title .para-ellipsis',
  icon: '#word-settings-panel .txt-set-icon',

  // Default-checked option checkboxes.
  addShowMe: '#word-settings-panel #add-show-me',
  addHeader: '#word-settings-panel #header-visibility',
  addInstruction: '#word-settings-panel #instr-visibility',
  showWords: '#word-settings-panel #showWrds-visibility',

  // Grid section.
  gridLabel: '#word-settings-panel .gridHolder .lbl-grid',
  shuffleButton: '#word-settings-panel .shuffleBtn',

  // Outline / appearance.
  outlineNone: '#word-settings-panel input[name="outline"][value="outline"]',
  outlineBg: '#word-settings-panel input[name="outline"][value="outlineBg"]',
  colorPickerInput: '#word-settings-panel .colorPickerInputBox',
  colorPickerButton: '#word-settings-panel .colorPickerButton',

  // Style panel (shared <stylepanel>) + tags.
  stylePanel: '#word-settings-panel stylepanel',
  tagManager: '#word-settings-panel tag-manager',
} as const;

/** Source-verified business rules / defaults (from wordsearch.js + default json). */
export const WS_RULES = {
  /** scope.maxWordCount — max words in the list. */
  maxWordCount: 13,
  /** onKeyPress blocks typing past 13 chars per word. */
  maxWordLength: 13,
  /** Default word seeded in default/wordsearch.json. */
  defaultWord: 'WORD',
  /** Words are stored uppercased (case-insensitive de-dup). */
  storesUppercase: true,
  /** Default appearance colour (currSettings.Appearance). */
  defaultAppearance: '#7eb1eb',
  /** Default outline mode. */
  defaultOutline: 'outline',
  widgetName: WS_WIDGET_NAME,
} as const;
