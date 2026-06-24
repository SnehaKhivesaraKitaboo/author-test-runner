/// <reference types="cypress" />
// =============================================================================
// Graphic Organizer (Image-based / graphicOrganizerImageHotSpot) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                          (widget catalog: name "Image GO", dataType "graphicOrganizerImageHotSpot")
//   templates/graphic-organizer/graphic-organizer.html        (canvas DOM)
//   templates/graphic-organizer/graphic-organizer-image-setting.html (settings panel)
//   templates/graphic-organizer/default/graphic-organizer.json (default field data)
//   templates/graphic-organizer/scripts/graphic-organizer.js  (directive: graphic-organizer-template; addHotSpot / deleteTextarea / showSetting)
//
// dataType = "graphicOrganizerImageHotSpot"; widget name = "Image GO";
// directive = "graphic-organizer-template".
//
// IMPORTANT — Image GO is an ELEMENT (image-based interactive), NOT an
// assessment widget: `graphicOrganizerImageHotSpot` is NOT in
// support/module-setup.ts ASSESSMENT_DATA_TYPES, so resolveDropTarget routes it
// to the canvas. It drops onto the Instructions-for-Students page (#desktop_view)
// via cy.dropComponent('graphicOrganizerImageHotSpot') — NOT a Generic Step column.
//
// Source-driven facts:
//   • Canvas wrapper: .graphicOrganizerContainer.graphicOrganizerImageHotSpot.component-holder
//     (attr graphic-organizer-template).
//   • "+ Add HotSpot" button = button.hotspotBtn → scope.addHotSpot pushes a hotspot
//     object onto fieldData.settings.inputBox; each hotspot renders as
//     .inputDiv.hotspotDiv{n} containing .hotspotTextarea (contenteditable, ng-model
//     hotspot.inputAnswer), a delete icon (.hotspotTextarea-delete.icon-Delete) and a
//     move handle (.labelDiv-Drag-Icon.icon-Move). New hotspot default bgColor
//     "#FEFFFF", outlineColor "#1E1E1E", height "10%", width "25%".
//   • Base image: #goImage; upload/replace button toggles by
//     fieldData.settings.imageUploadOrReplace ('Upload' → .bgBtn; 'Replace' → .imgUplodeBtn).
//     Base-image picker is the OS/media picker → deferred.
//   • Label-type fields (.questionNoText / .questionNoSecondaryText) render only when
//     settings.isLabelTypeIamge (+ labelType primary/secondary).
//   • Settings panel root = .graphic-organizer-setting.imgLabel (title "Graphic Organizer",
//     icon .icon-Image-labelling_number-01). Per-hotspot ("Text Input") settings render
//     only when showTextSetting (after a hotspot is selected via showSetting): Lock for
//     Student, Input Answer, Header Label, Character Limit checkbox + number, Apply for
//     all Input, Background / Outline colour swatches, Enable Advanced Formatting
//     (#isjoditEnabled), Alt Text (maxlength 2000).
//   • The upload form ("Upload" mode) shows the panel-level Alt Text (maxlength 2000).
// =============================================================================

export const GO_DATA_TYPE = 'graphicOrganizerImageHotSpot';
export const GO_WIDGET_NAME = 'Image GO';

/** Authoring-canvas DOM (the dropped Image GO element). */
export const GO_CANVAS = {
  /** Component wrapper on the canvas. */
  widget: `.graphicOrganizerContainer.graphicOrganizerImageHotSpot, [graphic-organizer-template]`,
  component: '.graphicOrganizerContainer.graphicOrganizerImageHotSpot',
  /** sd-item host containing the dropped component. */
  sdItem: '#desktop_view .sd-item:has(.graphicOrganizerImageHotSpot), #desktop_view .sd-item:has([graphic-organizer-template])',

  /** "+ Add HotSpot" trigger. */
  addHotspotBtn: '.graphicOrganizerContainer .addHotspotBtnContainer .hotspotBtn',

  /** Base image + image-container chrome. */
  image: '.graphicOrganizerContainer #goImage',
  imageContainer: '.graphicOrganizerContainer .graphic-organizer-image-container',
  uploadBtn: '.graphicOrganizerContainer .bgBtn',
  replaceBtn: '.graphicOrganizerContainer .imgUplodeBtn',

  /** Hotspot collection + parts (rendered per fieldData.settings.inputBox). */
  hotspotContainer: '.graphicOrganizerContainer .graphicOrganizer-hotspot-Container',
  hotspot: '.graphicOrganizerContainer .graphicOrganizer-hotspot-Container .inputDiv',
  hotspotTextarea: '.graphicOrganizerContainer .graphicOrganizer-hotspot-Container .hotspotTextarea',
  hotspotDelete: '.graphicOrganizerContainer .graphicOrganizer-hotspot-Container .hotspotTextarea-delete.icon-Delete',
  hotspotMove: '.graphicOrganizerContainer .graphicOrganizer-hotspot-Container .labelDiv-Drag-Icon.icon-Move',
  hotspotResize: '.graphicOrganizerContainer .graphicOrganizer-hotspot-Container .resize-Icon',

  /** Label-type question fields (only when isLabelTypeIamge). */
  labelPrimary: '.graphicOrganizerContainer .questionNoText',
  labelSecondary: '.graphicOrganizerContainer .questionNoSecondaryText',
} as const;

/** Settings panel DOM (.graphic-organizer-setting.imgLabel). */
export const GO_SETTINGS = {
  panel: '.graphic-organizer-setting.imgLabel',
  title: '.graphic-organizer-setting .txt-set-title .para-ellipsis',
  icon: '.graphic-organizer-setting .txt-set-icon.icon-Image-labelling_number-01',

  // Label type
  showLabelType: '.graphic-organizer-setting #label-visibility',
  labelPrimary: '.graphic-organizer-setting input[name="labelType"][value="primary"]',
  labelSecondary: '.graphic-organizer-setting input[name="labelType"][value="secondary"]',

  // Upload form (imageUploadOrReplace == 'Upload')
  uploadBox: '.graphic-organizer-setting #upload-comp-img',
  uploadLabel: '.graphic-organizer-setting .Title-upload-lable',
  uploadAltText: '.graphic-organizer-setting form textarea[ng-model="currSettings.altText"]',
  uploadAltCharLimit: '.graphic-organizer-setting form .altTextCharLimitText',

  // Per-hotspot ("Text Input") settings (showTextSetting — after a hotspot is selected)
  textSettingForm: '.graphic-organizer-setting .graphic-organizer-setting-input-from',
  lockForStudent: '.graphic-organizer-setting .lockStudentCheckbox input[id^="lock-student-input-"]',
  inputAnswer: '.graphic-organizer-setting [ng-model="currSettings.inputBox[currSettings.activeInput].inputAnswer"]',
  headerLabel: '.graphic-organizer-setting [ng-model="currSettings.inputBox[currSettings.activeInput].inputLabel"]',
  charLimitCheckbox: '.graphic-organizer-setting .char-limit input[type="checkbox"]',
  charLimitInput: '.graphic-organizer-setting .char-limit-input',
  applyAllInput: '.graphic-organizer-setting input[ng-model="currSettings.inputBox[currSettings.activeInput].applyAllInput"]',
  backgroundSwatches: '.graphic-organizer-setting #bgColorSelect .bgr-style',
  outlineSwatches: '.graphic-organizer-setting #outlineSelect .bgr-style',
  advancedFormatting: '.graphic-organizer-setting #isjoditEnabled',
  hotspotAltText: '.graphic-organizer-setting .graphic-organizer-setting-input-from textarea[ng-model="currSettings.inputBox[currSettings.activeInput].altText"]',
} as const;

/** Source-verified business rules / defaults (from graphic-organizer.js + .json). */
export const GO_RULES = {
  altTextMaxLength: 2000,
  defaultLabelType: 'primary',
  defaultImageMode: 'Upload',
  newHotspotBgColor: '#FEFFFF',
  newHotspotOutlineColor: '#1E1E1E',
  newHotspotHeight: '10%',
  newHotspotWidth: '25%',
  widgetName: GO_WIDGET_NAME,
} as const;
