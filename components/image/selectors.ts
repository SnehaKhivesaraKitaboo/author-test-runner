/// <reference types="cypress" />
// =============================================================================
// Image (element) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   templates/image.html                         (canvas component)
//   templates/image/image-settings-pannel.html   (settings panel body)
//   templates/image/image.json                   (template defaults / dataType)
//   templates/uploadimagepopup.html              (native upload popup #uploadimagepopup)
//
// dataType = "image" (image.json "identifier":"image"); directive = "image-template".
// Image is an ELEMENT (not an assessment widget) → dropped on the Instructions
// canvas (#desktop_view), NOT into a Generic Step column.
//
// Canvas wrapper = "section.Imagecomponent[image-template]" (also
// ".imageTemplateMainDiv"). The settings panel body is injected via ng-include
// into the shared ".componentSettingPanel" (see index.html) and is identified by
// "[heading-setting].imagesetting" / data-title="Image" / ".video-settings-panel2".
//
// Source-driven facts:
//   • Header (Show Header) + outline/fill radios + colour picker render only when
//     currSettings.styleSelected == 'style1' (image.json default IS 'style1').
//   • Dimension W/H inputs (#imgWidthc / #imgHeightc) are disabled while
//     imageDim == 'qq129' (Keep Original) and while imageUploadOrReplace=='Upload'.
//   • Alt Text textarea maxlength = 2000; counter span ".altTextCharLimitText".
//   • Upload happens via the native popup #uploadimagepopup → "My Computer"
//     (OS file picker) — not drivable by Cypress in the authoring DOM.
// =============================================================================

export const IMAGE_DATA_TYPE = 'image';
export const IMAGE_DIRECTIVE = 'image-template';

/** Authoring-canvas DOM (the dropped Image element). */
export const IMAGE_CANVAS = {
  /** Wrapper section — tolerate data-type + class + directive forms. */
  widget: `[data-type="${IMAGE_DATA_TYPE}"], section.Imagecomponent[image-template], .imageTemplateMainDiv`,
  component: 'section.Imagecomponent[image-template], .imageTemplateMainDiv',
  /** Last dropped item on the Instructions canvas. */
  sdItem: '#desktop_view .sd-item',
  /** Optional header (Show Header + style1 only). */
  header: '.Imagecomponent .sc-intro.image-header, .imageTemplateMainDiv .image-header',
  /** Figure + rendered <img>. */
  figure: '.Imagecomponent figure.pc-figure, .imageTemplateMainDiv figure.pc-figure',
  image: '.Imagecomponent img.primary-image, .imageTemplateMainDiv img.primary-image',
  /** Caption (contenteditable figcaption). */
  caption: '.Imagecomponent figcaption.imgCaption, .imageTemplateMainDiv figcaption.imgCaption',
} as const;

/** Settings panel DOM (ng-included into .componentSettingPanel). */
export const IMAGE_SETTINGS = {
  panel: '.componentSettingPanel',
  /** Image settings body root + identifying title. */
  body: '.componentSettingPanel .imagesetting[heading-setting], .imagesetting[heading-setting]',
  title: '.imagesetting [data-title="Image"], .imagesetting .para-ellipsis',
  settingsContainer: '.video-settings-panel2',

  // Style panel (style1/2/3 thumbnails)
  stylePanel: '.componentSettingPanel stylepanel, stylepanel',

  // Upload box (opens native #uploadimagepopup — file picker deferred)
  uploadBox: '#upload-comp-img[uploadfiles]',
  uploadFormatLabel: 'label[for="imageUploadInput"]',

  // Dimensions
  dimensionLabel: '.dimension-img',
  customDimRadio: 'input[name="radio"]#qq128',
  keepOriginalRadio: 'input[name="radio"]#qq129',
  widthInput: 'input#imgWidthc',
  heightInput: 'input#imgHeightc',

  // Toggles
  fullWidth: 'input[ng-model="currSettings.fullwidth"]',
  showHeader: 'input[ng-model="currSettings.isHeaderVisible"]',
  showCaption: 'input[ng-model="currSettings.captiondisplay"]',

  // Outline / Fill (style1 only)
  outlineNone: 'input[name="outline"][value="outline"]',
  outlineBg: 'input[name="outline"][value="outlineBg"]',
  colorOptions: '.colorOption .color',
  colorPickerInput: 'input#outlineBgColorInput.colorPickerInputBox',
  colorPickerButton: '.colorPickerButton',

  // Tags
  tagsInput: 'input#imageTagsInput.imageTagsInput',
  tagsLabel: 'label[for="imageTagsInput"]',

  // Accessibility / Alt Text
  accessibilityLabel: '.componentSettingPanel .accessibility, .imagesetting .accessibility',
  accessibilityPara: '.componentSettingPanel .accessibilityPara, .imagesetting .accessibilityPara',
  altText: 'textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '.altTextCharLimitText',
} as const;

/** Native upload popup (file picker → OS dialog; not drivable from authoring DOM). */
export const IMAGE_UPLOAD_POPUP = {
  modal: '#uploadimagepopup',
  urlInput: '#uploadimagepopup #imagelink',
  myComputer: '#uploadimagepopup .mycomputter',
  assetLibrary: '#uploadimagepopup .asset-library',
} as const;

/** Source-verified business rules. */
export const IMAGE_RULES = {
  altTextMaxLength: 2000,
  defaultStyle: 'style1',
  defaultImageDim: 'qq129', // Keep Original
  keepOriginalDimId: 'qq129',
  customDimId: 'qq128',
} as const;
