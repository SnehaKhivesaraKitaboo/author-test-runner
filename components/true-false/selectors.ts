/// <reference types="cypress" />
// =============================================================================
// True or False — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   templates/truefalse/truefalse-template-auth.html
//   templates/truefalse/truefalse-template-settings.html
//   templates/truefalse/default/truefalse.json
//
// Every selector below was read directly from the template source.
//
// IMPORTANT source facts (so tests don't assert non-existent controls):
//   • dataType = "true-false-template"; directive attr = "true-false-data".
//   • Canvas wrapper reuses ".multiple-choice" and adds ".true-false".
//   • Settings panel reuses id "#mcq-settings-panel".
//   • Answer-type radios (single/multiple), STYLE CARDS, LABEL TYPES and the
//     ACTION-ASSETS colour input are ALL COMMENTED OUT in the source — they are
//     NOT rendered for True/False. Those QC cases are deferred, not faked.
//   • There is NO "Add Option" button (commented out); the component is fixed
//     at the 2 default options (A/B). Delete is disabled at choiceList<=2.
//   • Content fields use ids: #header-input, #instruction-input, #question-input,
//     and per-option spans #option-input-{index}.
// =============================================================================

export const TF_DATA_TYPE = 'true-false-template';

/** Authoring-canvas DOM (the dropped True/False component). */
export const TF_CANVAS = {
  widget: `[data-type="${TF_DATA_TYPE}"]`,
  /** Wrapper reuses .multiple-choice; .true-false disambiguates from MCQ. */
  component: '.multiple-choice.true-false',
  header: '#header-input',
  instruction: '#instruction-input',
  question: '#question-input',
  optionsContainer: '#mcq-template-options',
  option: '#mcq-template-options .tf-option-box.form-row',
  optionText: '#mcq-template-options .option-content',
  optionRadio: '#mcq-template-options input.tf_radio',
  /** Per-option delete (close icon). Disabled when choiceList.length <= 2. */
  deleteOption: '#mcq-template-options .row-delete',
  deleteOptionDisabled: '#mcq-template-options .row-delete.btn-disabled',
  optionImageBtn: '#mcq-template-options .mcq-row-image',
  /** Individual feedback block per option (shown when feedbackCheckbox on). */
  individualFeedback: '#mcq-template-options .individual-feedback',
} as const;

/** Settings panel DOM (#mcq-settings-panel, reused for True/False). */
export const TF_SETTINGS = {
  panel: '#mcq-settings-panel',
  panelReady: '#mcq-settings-panel.mcq-sett',

  // Visibility toggles
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
  /** True/False uses a dedicated id="reset" (unlike MCQ which reused add-show-me). */
  reset: '#mcq-settings-panel #reset',
} as const;

/** Source-verified business rules. */
export const TF_RULES = {
  minOptions: 2, // choiceList.length <= 2 disables delete
  defaultOptions: 2, // A, B (no Add Option button in source)
  defaultAnswerType: 'single-select',
  hasAddOptionButton: false, // commented out in source
  hasAnswerTypeRadios: false, // commented out in source
  hasStyleCards: false, // commented out in source
  hasLabelTypes: false, // commented out in source
  hasActionAssetsColor: false, // commented out in source
} as const;
