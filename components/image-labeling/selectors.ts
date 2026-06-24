/// <reference types="cypress" />
// =============================================================================
// Image Labeling (image-label-number) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                              (widget catalog: name "Image Labeling", dataType "imagelabelling")
//   templates/image-label-number/image-labelling-number.html      (canvas DOM)
//   templates/image-label-number/image-labelling-number-setting.html (settings panel)
//   templates/image-label-number/default/image-labelling-number.json (default field data + style_tab)
//   templates/image-label-number/scripts/image-labelling-number.js   (directive logic: addLabel, maxCounter=20)
//   templates/stylepanel.html                                     (shared <stylepanel> markup)
//
// dataType = "imagelabelling" (VERIFIED in config.js — NOT "imageLabeling" as
// the QC catalog tentatively listed); widget name = "Image Labeling";
// directive attribute = "labelling-template".
//
// Source-driven facts:
//   • Image Labeling is an ELEMENT (not an assessment widget) — "imagelabelling"
//     is absent from support/module-setup.ts ASSESSMENT_DATA_TYPES, so it drops
//     onto the Instructions-for-Students canvas (#desktop_view), NOT a Generic
//     Step column.
//   • Canvas wrapper = `.imageLabelling.component-holder[labelling-template]`.
//   • Editable canvas fields are contenteditable (ng-model on fieldData.*):
//     Introduction/Header (#introductionInput), Instruction (#instructionInput),
//     Question (#questionInput), Caption (#captionInput). Use
//     cy.setContentEditableOn, never cy.type().
//   • Header/Instruction/Caption visibility is toggled by .displayBlock /
//     .displayNone driven by settings.isHeaderVisible / isInstructionVisible /
//     captiondisplay.
//   • Settings panel body is ng-included into the shared `.componentSettingPanel`
//     and is identified by `.img-label-setting.imgLabel`. Title text "Image
//     Labeling"; icon `.icon-Image-labelling_number-01`.
//   • Label TYPE radios: #with-Text (Text) / #with-Number (Numbers, default
//     checked) — ng-model currSettings.isNumber.
//   • Visibility toggles: #header-visibility, #instr-visibility,
//     #caption-visibility.
//   • Show Arrow toggle: #show-arrow-checkbox (text mode) /
//     #show-arrow-checkbox-properties (number mode) — both gated by
//     currSettings.media.dimensionpanel + textDiv flag.
//   • Outline radios: input[name="outline"] values "outline" / "outlineBg"
//     (rendered only when !isGroupActivity).
//   • Action-asset colour picker: .colorPickerInputBox (ng-model
//     currSettings.Appearance).
//   • Tags: <tag-manager tags="currSettings.metaTag"> inside .tagsContainer.
//   • Image upload/replace box: #upload-comp-img (uploadfiles directive) —
//     real upload uses the OS picker (deferred).
//   • Labels are added at RUNTIME by clicking on the uploaded image area
//     (scope.addLabel, maxCounter = 20). They render via
//     ng-repeat="option in fieldData.settings.media.labelInfo" as
//     .number-Container / .label_text / .Text-Container pins. With the default
//     empty labelInfo[] and the OS-picker image flow, pin creation/drag is a
//     runtime interaction (deferred); label-container presence is automated.
// =============================================================================

export const IL_DATA_TYPE = 'imagelabelling';
export const IL_WIDGET_NAME = 'Image Labeling';

/** Authoring-canvas DOM (the dropped Image Labeling element). */
export const IL_CANVAS = {
  widget: `.imageLabelling.component-holder, [labelling-template]`,
  /** The component wrapper (directive host). */
  component: '.imageLabelling.component-holder[labelling-template], .imageLabelling[labelling-template]',
  sdItem: '#desktop_view .sd-item:has([labelling-template]), #desktop_view .sd-item:has(.imageLabelling)',

  // Editable canvas fields (contenteditable; ng-model fieldData.*)
  header: '.imageLabelling #introductionInput',
  instruction: '.imageLabelling #instructionInput',
  question: '.imageLabelling #questionInput',
  caption: '.imageLabelling #captionInput',

  // Visibility wrappers (toggled .displayBlock / .displayNone)
  headerHolder: '.imageLabelling .header-text.sc-intro-holder',
  instructionHolder: '.imageLabelling .instruction-text.sc-instr-holder',

  // Image area + label container
  imageFigure: '.imageLabelling .image-div-labelling',
  labelContainer: '.imageLabelling .imageLabelling-label-Container',
  /** Individual rendered label pins (ng-repeat over media.labelInfo). */
  labelPin: '.imageLabelling .number-Container',
  labelText: '.imageLabelling .label_text',
  labelTextContainer: '.imageLabelling .Text-Container',
  /** The submit/show-me/reset bottom UI (commonbuttons directive). */
  bottomButtons: '.imageLabelling [commonbuttons]',
} as const;

/** Settings panel DOM (ng-included into .componentSettingPanel → .img-label-setting). */
export const IL_SETTINGS = {
  panel: '.componentSettingPanel',
  body: '.componentSettingPanel .img-label-setting.imgLabel, .img-label-setting.imgLabel',
  title: '.componentSettingPanel .txt-set-title .para-ellipsis, .img-label-setting .txt-set-title .para-ellipsis',
  icon: '.componentSettingPanel .icon-Image-labelling_number-01, .img-label-setting .icon-Image-labelling_number-01',

  // Style panel (shared <stylepanel>)
  stylePanel: '.componentSettingPanel stylepanel, .img-label-setting stylepanel',

  // Label TYPE radios (Text / Numbers) — ng-model currSettings.isNumber
  typeText: '.img-label-setting #with-Text',
  typeNumber: '.img-label-setting #with-Number',

  // Visibility toggles
  showHeader: '.img-label-setting #header-visibility',
  showInstruction: '.img-label-setting #instr-visibility',
  showCaption: '.img-label-setting #caption-visibility',

  // Image upload / replace box
  uploadBox: '.img-label-setting #upload-comp-img',

  // Outline / fill (rendered only when !isGroupActivity)
  outlineNone: '.img-label-setting input[name="outline"][value="outline"]',
  outlineBg: '.img-label-setting input[name="outline"][value="outlineBg"]',
  colorPickerInput: '.img-label-setting .colorPickerInputBox',

  // Show Arrow (text-mode + number-mode variants)
  showArrowText: '.img-label-setting #show-arrow-checkbox',
  showArrowNumber: '.img-label-setting #show-arrow-checkbox-properties',

  // Generic feedback / restart / show-me / reset checkboxes
  genericFeedback: '.img-label-setting #add-generic-feedback',
  allowRestart: '.img-label-setting #add-activity-restart',
  showMe: '.img-label-setting #add-show-me',
  reset: '.img-label-setting #IML-reset',

  // Tags
  tagsContainer: '.img-label-setting .tagsContainer',
  tagManager: '.img-label-setting tag-manager',
} as const;

/** Source-verified business rules / defaults. */
export const IL_RULES = {
  /** scripts/image-labelling-number.js: maxCounter = 20 (max appendable labels). */
  maxLabels: 20,
  /** image-labelling-number.json: settings.isNumber default "with-Number". */
  defaultLabelType: 'with-Number',
  /** image-labelling-number.json: settings.outline default "outline". */
  defaultOutline: 'outline',
  /** image-labelling-number.json: media.imageSetting.altText maxlength = 50. */
  altTextMaxLength: 50,
  /** Supported upload formats surfaced in settings: Jpg, PNG, Svg. */
  supportedFormats: ['jpg', 'png', 'svg'] as const,
  widgetName: IL_WIDGET_NAME,
} as const;
