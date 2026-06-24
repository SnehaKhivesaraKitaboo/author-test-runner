/// <reference types="cypress" />
// =============================================================================
// MCQ (Multiple Choice — Single Choice) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   templates/multiple-choice-template/multiple-choice-template-settings.html
//   templates/multiple-choice-template/multiple-choice-template-auth.html
//   templates/multiple-choice-template/default/multiple-choice-template.json
//
// Every selector below was read directly from the template source — none are
// guessed. Where the source reuses an id (e.g. Reset reuses id="add-show-me"
// with ng-model="currSettings.reset"), the binding is preferred over the id.
// =============================================================================

export const MCQ_DATA_TYPE = 'multiple-choice-template';

/** Authoring-canvas DOM (the dropped MCQ component). */
export const MCQ_CANVAS = {
  /** The dropped MCQ widget wrapper on canvas / in a Generic Step column. */
  widget: `[data-type="${MCQ_DATA_TYPE}"]`,
  component: '.multiple-choice',
  sdItem: '.generic-step-column-content .sd-item:has([data-type="multiple-choice-template"]), #desktop_view .sd-item:has([data-type="multiple-choice-template"])',
  header: '.multiple-choice .sc-intro.template-header',
  instruction: '.multiple-choice .sc-instr.template-instruction',
  question: '.multiple-choice .sc-question.template-paragraph',
  optionsContainer: '#mcq-template-options',
  option: '#mcq-template-options .form-row.default',
  optionText: '#mcq-template-options .option-content',
  optionRadio: '#mcq-template-options input.mcqradio',
  optionCheckbox: '#mcq-template-options input.mcqchkbox',
  addOption: '.add-question-options-mcq',
  /** Add Option is disabled when choiceList.length >= 10 (source rule). */
  addOptionDisabled: '.add-question-options-mcq.btn-disabled',
  deleteOption: '#mcq-template-options .row-delete',
  /** Delete is disabled when choiceList.length <= 2 (source rule). */
  deleteOptionDisabled: '#mcq-template-options .row-delete.btn-disabled',
  optionImageBtn: '#mcq-template-options .mcq-row-image',
  footer: '.multiple-choice .mcq-footer',
} as const;

/** Settings panel DOM (#mcq-settings-panel). */
export const MCQ_SETTINGS = {
  panel: '#mcq-settings-panel',
  panelReady: '#mcq-settings-panel.mcq-sett',

  // Answer type (radio)
  answerSingle: '#mcq-settings-panel #single-select',
  answerMultiple: '#mcq-settings-panel #multiple-select',

  // Style cards
  styleCard: '#mcq-settings-panel .mcq_style_holder, #mcq-settings-panel .mcq_style_full_bleed_holder',
  styleCardSelected: '#mcq-settings-panel .mcq_style_holder_selected',
  subStyleContainer: '#mcq-settings-panel .layout_color_container',
  subStyleColor: '#mcq-settings-panel .layout_color_container .layout_color_row',

  // Visibility toggles
  addSampleAnswer: '#mcq-settings-panel #mcq-layer',
  showHeader: '#mcq-settings-panel #header-visibility',
  showInstruction: '#mcq-settings-panel #instr-visibility',

  // Media
  addMedia: '#mcq-settings-panel #add-media',
  mediaImageRadio: '#mcq-settings-panel input[name="mcq_Media"][value="uploadimage"]',
  mediaVideoRadio: '#mcq-settings-panel input[name="mcq_Media"][value="onlineVideo"]',
  mediaAudioRadio: '#mcq-settings-panel input[name="mcq_Media"][value="uploadaudio"]',
  mediaUploadBySystem: '#mcq-settings-panel input[name="videoUploadType"][value="uploadbysystem"]',
  mediaUploadByUrl: '#mcq-settings-panel input[name="videoUploadType"][value="uploadbyurl"]',
  youtubeIdInput: '#mcq-settings-panel input[ng-model="currSettings.youtubeVideoName"]',
  mediaAlignLeft: '#mcq-settings-panel #img-left',
  mediaAlignRight: '#mcq-settings-panel #img-right',

  // Outline / Action Assets color
  outlineNone: '#mcq-settings-panel input[name="outline"][value="outline"]',
  outlineBg: '#mcq-settings-panel input[name="outline"][value="outlineBg"]',
  actionAssetsColor: '#mcq-settings-panel #mcq-appearance-color',

  // Label types (only rendered when currSettings.isShowme)
  labelTypeContainer: '#mcq-settings-panel .label-row',
  labelType: '#mcq-settings-panel .label_type',

  // Feedback (only rendered when currSettings.isShowme)
  genericFeedback: '#mcq-settings-panel #add-generic-feedback',
  genericFeedbackContainer: '#mcq-settings-panel .feedback_container',
  correctFeedback: '#mcq-settings-panel #correct_ans_feedback',
  incorrectFeedback: '#mcq-settings-panel #incorrect_ans_feedback',
  individualFeedback: '#mcq-settings-panel #add-feedback',

  // Activity controls
  tryAgain: '#mcq-settings-panel #add-activity-restart',
  tryAgainCount: '#mcq-settings-panel #try-again-count',
  tryAgainIncrement: '#mcq-settings-panel .quantity-up',
  tryAgainDecrement: '#mcq-settings-panel .quantity-down',
  showMe: '#mcq-settings-panel #add-show-me',
  shuffle: '#mcq-settings-panel #add-shuftle-choices',
  /** Reset reuses id="add-show-me" but binds ng-model="currSettings.reset" — target by binding. */
  reset: '#mcq-settings-panel input[ng-model="currSettings.reset"]',
} as const;

/** The 6 label types defined in the default JSON (settings.label_type[]). */
export const MCQ_LABEL_TYPES = [
  { index: 1, type: 'Default', classname: '' },
  { index: 2, type: 'Alphabets_caps', classname: 'icon-label-type_alphabetical-capital-case' },
  { index: 3, type: 'Romantype', classname: 'icon-label-type_roman-capital-case' },
  { index: 4, type: 'Numbers', classname: 'icon-label-type_numeric' },
  { index: 5, type: 'Alphabets_small', classname: 'icon-label-type_alphabetical-small-case' },
  { index: 6, type: 'Roman', classname: 'icon-label-type_roman-small-case' },
] as const;

/** Source-verified business rules. */
export const MCQ_RULES = {
  minOptions: 2, // choiceList.length <= 2 disables delete
  maxOptions: 10, // choiceList.length >= 10 disables add
  defaultOptions: 4, // A, B, C, D
  defaultCorrectChoice: 'C',
  defaultStyle: 'card-style1',
  defaultAnswerType: 'single-select',
} as const;
