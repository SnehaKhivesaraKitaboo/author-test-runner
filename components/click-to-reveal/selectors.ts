/// <reference types="cypress" />
// =============================================================================
// Click to Reveal (clickToReveal) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                       (widget catalog: name "Click to Reveal", dataType "clickToReveal")
//   templates/clickToReveal/clickToReveal.html             (canvas DOM)
//   templates/clickToReveal/clickToReveal-settings.html    (settings panel)
//   templates/clickToReveal/clickToReveal-media-template.html (media figure markup)
//   templates/clickToReveal/default/clickToReveal.json     (default field data + style_tab)
//   templates/clickToReveal/scripts/clickToReveal.js       (directive: clickToRevealTemplate)
//   templates/stylepanel.html                              (shared <stylepanel> markup)
//
// dataType = "clickToReveal"; widget name = "Click to Reveal";
// directive = "click-to-reveal-template" (App.directive 'clickToRevealTemplate').
// Canvas wrapper = `.clickToReveal` (also `.component-holder` with style classes).
// Settings panel id = "#chapter-heading-settings-panel" (shared chrome id; the
// panel is scoped by the .click-to-reveal-setting-panel class — title resolves
// from currSettings.templateName = "Click to Reveal").
//
// Source-driven facts:
//   • Click to Reveal is an ELEMENT (isDroppable widget), NOT an assessment
//     widget. "clickToReveal" is absent from support/module-setup.ts
//     ASSESSMENT_DATA_TYPES, so resolveDropTarget routes it to the canvas — it
//     drops onto the Instructions-for-Students page (#desktop_view) via
//     cy.dropComponent('Click to Reveal'). It is NOT dropped into a Generic
//     Step column.
//   • The component is a SINGLE card (header + instruction + reveal button +
//     hidden description text + optional media). There is no per-card "add
//     panel" control in the authoring DOM; multiple reveal panels = multiple
//     dropped Click to Reveal components (QC TC_45). DOM-assertable add/remove
//     of panels is therefore expressed as drop/copy/delete of the card itself.
//   • Editable bodies are contenteditable (ng-model fieldData.*) — use
//     cy.setContentEditableOn, never cy.type().
//   • Header is shown only when settings.isHeaderVisible (default true).
//   • Instruction text is shown only when settings.isInstructionVisible
//     (default false → flag-gated: "Show Instruction" checkbox reveals it).
//   • Reveal button label lives in .ButtonSpanCTR (ng-model
//     settings.transcriptText, default "Read more", maxlength 50).
//   • Media (image/video/audio) renders only when listData[0].mcssData.media
//     mediaVisible is true (gated by "Add Media" checkbox + media type radios).
//   • 4 card styles (CTR_Style1..CTR_Style4) from style_tab.stylesHolder.
//   • Card/Button colour pickers + Outline toggle + Placement icons + Tags +
//     Alt Text (maxlength 2000) live in the settings panel.
// =============================================================================

export const CTR_DATA_TYPE = 'clickToReveal';
export const CTR_WIDGET_NAME = 'Click to Reveal';

/** Authoring-canvas DOM (the dropped Click to Reveal element). */
export const CTR_CANVAS = {
  widget: `.customClass[data-type="${CTR_DATA_TYPE}"], [data-type="${CTR_DATA_TYPE}"], .clickToReveal`,
  /** The component wrapper (directive host). */
  component: '.clickToReveal.component-holder, .clickToReveal',
  sdItem:
    '#desktop_view .sd-item:has([data-type="clickToReveal"]), #desktop_view .sd-item:has(.clickToReveal)',
  /** Header (contenteditable; ng-model fieldData.introduction). Visible when isHeaderVisible. */
  header: '.clickToReveal .sc-intro.editables',
  /** Instruction (contenteditable; ng-model fieldData.instruction). Visible when isInstructionVisible. */
  instruction: '.clickToReveal .sc-instr.editables',
  /** Reveal trigger button + its editable label span. */
  button: '.clickToReveal button.transcriptTextCorrection',
  buttonLabel: '.clickToReveal .ButtonSpanCTR',
  /** Hidden description text (contenteditable; ng-model fieldData.descriptionText). */
  description: '.clickToReveal .descriptionTextCorrection.editables',
  /** Reveal payload container (description + media). */
  revealData: '.clickToReveal .ClickToRevealData',
  /** Media figure (renders only when mediaVisible). */
  media: '.clickToReveal .media-container [data-media-template-ctr], .clickToReveal figure.pc-figure',
  caption: '.clickToReveal .template-caption.figcaption',
} as const;

/** Settings panel DOM (#chapter-heading-settings-panel · .click-to-reveal-setting-panel). */
export const CTR_SETTINGS = {
  panel: '#chapter-heading-settings-panel.click-to-reveal-setting-panel, #chapter-heading-settings-panel',
  title: '#chapter-heading-settings-panel .templateName',
  icon: '#chapter-heading-settings-panel .settingIcon',

  // Style panel (shared <stylepanel> — CTR_Style1..CTR_Style4)
  stylePanel: '#chapter-heading-settings-panel stylepanel',

  // Visibility toggles
  showInstruction: '#chapter-heading-settings-panel #instruction-visibility',
  addMedia: '#chapter-heading-settings-panel #add-media',
  showCaption: '#chapter-heading-settings-panel #Caption-visibility',

  // Media type radios (rendered when Add Media on)
  mediaImage: '#chapter-heading-settings-panel input[name="mcq_Media"][value="uploadimage"]',
  mediaVideo: '#chapter-heading-settings-panel input[name="mcq_Media"][value="onlineVideo"]',
  mediaAudio: '#chapter-heading-settings-panel input[name="mcq_Media"][value="uploadaudio"]',

  // Image upload affordance (renders for image media)
  uploadImageBox: '#chapter-heading-settings-panel #upload-comp-img',

  // Video upload type radios + YouTube ID (rendered for video media)
  videoFromSystem: '#chapter-heading-settings-panel input[name="videoUploadType"][value="uploadbysystem"]',
  videoByUrl: '#chapter-heading-settings-panel input[name="videoUploadType"][value="uploadbyurl"]',
  youtubeIdInput: '#chapter-heading-settings-panel input.select-kaltura2',
  changeVideoBox: '#chapter-heading-settings-panel #change-video',

  // Audio upload affordance (rendered for audio media)
  changeAudioBox: '#chapter-heading-settings-panel #change-audio',

  // Video transcript / closed captions (rendered for video media)
  showTranscript: '#chapter-heading-settings-panel input[ng-model="currSettings.listData[0].mcssData.media.videoSetting.showTranscript"]',
  showClosedCaptions: '#chapter-heading-settings-panel input[ng-model="currSettings.listData[0].mcssData.media.videoSetting.showClosedCaptions"]',
  uploadTracksBtn: '#chapter-heading-settings-panel .videoTracksUploadBtn',

  // Placement icons (rendered when Add Media on)
  placementSection: '#chapter-heading-settings-panel #headingOnePlacement .CTRPlacement',
  placementBelow: '#chapter-heading-settings-panel .CTRPlacementDiv[value="belowText"]',
  placementAbove: '#chapter-heading-settings-panel .CTRPlacementDiv[value="aboveText"]',
  placementLeft: '#chapter-heading-settings-panel .CTRPlacementDiv[value="leftSide"]',
  placementRight: '#chapter-heading-settings-panel .CTRPlacementDiv[value="rightSide"]',

  // Card Properties
  cardPropertiesHeader: '#chapter-heading-settings-panel #headingOneCardProperties',
  cardBackgroundColor: '#chapter-heading-settings-panel input[ng-model="currSettings.CardBackgroundColor"]',
  cardHeaderColor: '#chapter-heading-settings-panel input[ng-model="currSettings.CardHeaderColor"]',
  cardLineColor: '#chapter-heading-settings-panel input[ng-model="currSettings.CardLineColor"]',
  outlineToggle: '#chapter-heading-settings-panel #outline-visibility',
  outlineColor: '#chapter-heading-settings-panel input[ng-model="currSettings.OutlineAppearance"]',

  // Button Properties
  buttonPropertiesHeader: '#chapter-heading-settings-panel #headingOneButtonProperties',
  buttonBackgroundColor: '#chapter-heading-settings-panel input[ng-model="currSettings.ButtonBackgroundColor"]',
  buttonOutlineColor: '#chapter-heading-settings-panel input[ng-model="currSettings.ButtonOutlineColor"]',
  buttonTextColor: '#chapter-heading-settings-panel input[ng-model="currSettings.ButtonTextColor"]',

  // Tags
  tagsInput: '#chapter-heading-settings-panel .CTR_tag_div input[ng-model="currSettings.metaTags"]',

  // Accessibility / Alt Text
  accessibilityLabel: '#chapter-heading-settings-panel .accessibility',
  accessibilityPara: '#chapter-heading-settings-panel .accessibilityPara',
  altText: '#chapter-heading-settings-panel textarea[ng-model="currSettings.listData[0].mcssData.media.altText"]',
  altTextCharLimitText: '#chapter-heading-settings-panel .altTextCharLimitText',
} as const;

/** Source-verified style option names (style_tab.stylesHolder[].name). */
export const CTR_STYLES = {
  style1: 'CTR_Style1',
  style2: 'CTR_Style2',
  style3: 'CTR_Style3',
  style4: 'CTR_Style4',
} as const;

/** Source-verified business rules / defaults (from default/clickToReveal.json). */
export const CTR_RULES = {
  widgetName: CTR_WIDGET_NAME,
  defaultStyle: 'CTR_Style1',
  defaultButtonLabel: 'Read more',
  buttonLabelMaxLength: 50,
  defaultPlacement: 'belowText',
  defaultCardBackground: '#FFFFFF',
  defaultButtonBackground: '#0054A8',
  defaultButtonText: '#FFFFFF',
  altTextMaxLength: 2000,
  headerVisibleByDefault: true,
  instructionVisibleByDefault: false,
  mediaCheckboxDefault: false,
} as const;
