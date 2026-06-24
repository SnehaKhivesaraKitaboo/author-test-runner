/// <reference types="cypress" />
// =============================================================================
// Extended Response about Media — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js (palette registry)
//   templates/identify-the-clip/identify-the-clip.html
//   templates/identify-the-clip/identify-the-clip-settings-pannel.html
//   templates/identify-the-clip/scripts/identify-the-clip-directive.js
//
// IMPORTANT — source ambiguity resolved:
//   The QC catalog claims dataType = "extendedResponseMedia". That value does
//   NOT exist anywhere in the source. The palette entry literally named
//   "Extended Response about Media" maps to:
//       dataType  = "identify-the-clip"
//       directive = identifyTheClipTemplate  (attr "identify-the-clip-template")
//       canvas    = ".identifyTheClipComponent"
//       settings  = ".identifyTheClip-setting"  (title "Extended Response about Media")
//   The dropped answer field even carries the class
//   "characters_count_extended_response_about_media". So this component IS the
//   identify-the-clip template; selectors below are derived from it.
//
// Source-driven facts:
//   • Answer types: Short / RTE (Long radio is commented out in the panel).
//   • Style 1 exposes Outline / Fill Background radios + colour picker
//     (ng-if styleSelected == 'style1'); Style 2 shows the Question Field +
//     thumb image (.thumbImg, .styleTwoQuestionText) when ansTextHint is false.
//   • "Show Media" checkbox (#showMedia) reveals Image/Audio/Video radios
//     (.mediaTypeBtn). Image is the default media kind.
//   • Allowed Response (#allowResponse) + Exact Match (#answerMatch) checkboxes.
//   • Add Show Me (#add-show-me, ng-model showmecheckbox) + Reset checkboxes.
//   • Show Label Type (#label-visibility) → Primary/Secondary radios.
//   • Alt Text textarea maxlength = 2000; counter label "Chars 2000".
//   • Special-character keyboard only renders under a subject language
//     (currSettings.userSubjectLang) — deferred.
// =============================================================================

export const ERM_DATA_TYPE = 'identify-the-clip';

/** Authoring-canvas DOM (the dropped Extended Response about Media component). */
export const ERM_CANVAS = {
  widget: `[data-type="${ERM_DATA_TYPE}"], .identifyTheClipComponent`,
  component: '.identifyTheClipComponent',
  /** Header text (shown when isHeaderVisible). */
  header: '.identifyTheClipComponent .sc-intro',
  /** Media wrapper (rendered only when showMedia). */
  mediaContainer: '.identifyTheClipComponent .mediaContainer',
  imageContainer: '.identifyTheClipComponent .imageContainer',
  videoContainer: '.identifyTheClipComponent .videoContainer',
  audioContainer: '.identifyTheClipComponent .audioContainer',
  mediaImage: '.identifyTheClipComponent .itcMedia',
  caption: '.identifyTheClipComponent .pc-caption',
  /** Label-type question fields (shown when questionNoField). */
  labelPrimary: '.identifyTheClipComponent .questionNoText',
  labelSecondary: '.identifyTheClipComponent .questionNoSecondaryText',
  /** Main question prompt (contenteditable). */
  question: '.identifyTheClipComponent .questionText',
  /** Style-2 question row + thumb image. */
  styleTwoQuestion: '.identifyTheClipComponent .styleTwoQuestionText',
  thumbImage: '.identifyTheClipComponent .thumbImg',
  /** Answer fields by mode. */
  shortAnswer: '.identifyTheClipComponent .shortAnsText',
  rteAnswer: '.identifyTheClipComponent textarea.ansRTE',
  /** Pipe-separated multi-answer hint (Style/RTE). */
  ansTextHint: '.identifyTheClipComponent .ansTextHint, #identifyTheClip-ansTextHint',
  /** Custom-keyboard container + add button. */
  customKeyboard: '.identifyTheClipComponent .SLA-custKeybCont',
  addSpecialChars: '.identifyTheClipComponent .keyboard_btn',
  /** Show Me / Reset / Submit common buttons row. */
  commonButtons: '.identifyTheClipComponent [commonbuttons]',
} as const;

/** Settings panel DOM (.identifyTheClip-setting). */
export const ERM_SETTINGS = {
  panel: '.identifyTheClip-setting',
  title: '.identifyTheClip-setting .templateName',
  stylePanel: '.identifyTheClip-setting stylepanel',

  // Answer type (Short / RTE — Long is commented out)
  answerShort: '.identifyTheClip-setting input[name="placement"].answerTypeBtn[value="shortAns"]',
  answerRte: '.identifyTheClip-setting input[name="placement"].answerTypeBtn[value="RTE"]',

  // Outline / Fill (only when styleSelected == 'style1')
  outlineNone: '.identifyTheClip-setting input[name="outline"][value="outline"]',
  outlineBg: '.identifyTheClip-setting input[name="outline"][value="outlineBg"]',
  colorOptions: '.identifyTheClip-setting .colorOption .color',
  colorPickerInput: '.identifyTheClip-setting .colorPickerInputBox',

  // Label type
  showLabelType: '.identifyTheClip-setting #label-visibility',
  labelPrimary: '.identifyTheClip-setting input[name="labelType"][value="primary"]',
  labelSecondary: '.identifyTheClip-setting input[name="labelType"][value="secondary"]',

  // Show Media + media kind radios
  showMedia: '.identifyTheClip-setting #showMedia',
  showMediaSection: '.identifyTheClip-setting #showMediaSection',
  mediaTypeImage: '.identifyTheClip-setting input[name="mediaType"].mediaTypeBtn[value="image"]',
  mediaTypeAudio: '.identifyTheClip-setting input[name="mediaType"].mediaTypeBtn[value="audio"]',
  mediaTypeVideo: '.identifyTheClip-setting input[name="mediaType"].mediaTypeBtn[value="video"]',

  // Image upload + format hint
  imageUploadBox: '.identifyTheClip-setting #upload-comp-img',
  imageFormatHint: '.identifyTheClip-setting label[for="imageUploadInput"]',

  // Audio: transcript + Play in Background
  audioTranscript: '.identifyTheClip-setting #audioTransscript',
  playInBackground: '.identifyTheClip-setting input[ng-model="currSettings.playinBackground"]',

  // Video: upload type radios + URL dropdown + video-id input + full width
  videoUploadBySystem: '.identifyTheClip-setting input.videoUploadType[value="uploadbysystem"]',
  videoUploadByUrl: '.identifyTheClip-setting input.videoUploadType[value="uploadbyurl"]',
  videoUrlDropdown: '.identifyTheClip-setting #itcVideoDropdown',
  videoIdInput: '.identifyTheClip-setting input[ng-model="currSettings.youtubeVideoName"]',
  fullWidth: '.identifyTheClip-setting input[ng-model="currSettings.fullwidth"]',

  // Show Caption / Show Header
  showCaption: '.identifyTheClip-setting #showCaption',
  showHeader: '.identifyTheClip-setting #header-visibility',

  // Allowed Response / Exact Match
  allowResponse: '.identifyTheClip-setting #allowResponse',
  allowResponseSection: '.identifyTheClip-setting #allowResponseSection',
  exactMatch: '.identifyTheClip-setting #answerMatch',
  answerMatchSection: '.identifyTheClip-setting #answerMatchSection',

  // Show Me / Reset (both rendered with id add-show-me; targeted by ng-model)
  showMeCheckbox: '.identifyTheClip-setting input[ng-model="currSettings.showmecheckbox"]',
  resetCheckbox: '.identifyTheClip-setting input[ng-model="currSettings.reset"]',

  // Accessibility / Alt Text
  accessibilityLabel: '.identifyTheClip-setting .accessibility',
  accessibilityPara: '.identifyTheClip-setting .accessibilityPara',
  altText: '.identifyTheClip-setting textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '.identifyTheClip-setting .altTextCharLimitText',

  // Special-character keyboard enable (subject-language gated)
  enableKeyboard: '.identifyTheClip-setting input[ng-model="currSettings.isCustomKeyboardEnable"]',
} as const;

/** Source-verified business rules. */
export const ERM_RULES = {
  altTextMaxLength: 2000,
  transcriptMaxLength: 1000,
  defaultMediaType: 'image',
  defaultAnswerType: 'shortAns',
  imageFormats: ['PNG', 'JPG', 'SVG'],
  videoFormat: 'MP4',
  audioFormats: ['WAV', 'MP3'],
  videoUrlProviders: ['youtube', 'vimeo'],
} as const;
