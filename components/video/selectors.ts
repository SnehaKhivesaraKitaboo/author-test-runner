/// <reference types="cypress" />
// =============================================================================
// Video (media element) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                 (widget catalog: name "Video", dataType "video")
//   templates/video-template.html                    (canvas DOM — section[video-template])
//   templates/video/video.json                       (default field data + settings + style_tab)
//   templates/video/video-settings-panel.html        (settings panel — [video-setting])
//   templates/media-template.html                    (shared media wrapper reference)
//   templates/stylepanel.html                        (shared <stylepanel> markup)
//
// dataType = "video"; widget name = "Video"; directive = "video-template".
// Canvas wrapper = `.customClass[data-type="video"]` with inner
// `section[video-template]` (`.component-holder.videostyle`).
// Settings panel root = `[video-setting].video-settings-panel.videosetting`
// (NO id; framework wraps it in `.componentSettingPanel`). Title = "Video"
// (`.txt-set-title .para-ellipsis[data-title="Video"]`), icon `.icon-Video`.
//
// Source-driven facts (video.json + video-settings-panel.html):
//   • Video is an ELEMENT (not an assessment widget) — `video` is NOT in
//     support/module-setup.ts ASSESSMENT_DATA_TYPES, so resolveDropTarget()
//     routes it to the canvas. It drops onto the Instructions-for-Students
//     page (#desktop_view) via cy.dropComponentForModule('Video', { dataType:
//     'video' }), NOT a Generic Step column.
//   • Upload mode is a radio pair (ng-model currSettings.uploadtype):
//     "uploadbysystem" (default) vs "uploadbyurl".
//   • URL mode reveals the YouTube/Vimeo dropdown (.kaltura-part) + a Video ID
//     text input (ng-model currSettings.youtubeVideoName) — ng-if gated.
//   • System mode reveals the .video-upload-box (uploadfiles) drop target —
//     ng-if gated; the actual file selection is a native OS picker (deferred).
//   • Dimension block (#video-Dimensions): custom W/H number inputs
//     (#videoWidthc / #videoHeightc) + a "Keep Original" radio (#full-video-radio)
//     and a custom-dimension radio (#video-dimension-radio). W/H are ng-disabled
//     when videoDim === 'full-video-radio'.
//   • Toggles: Full Width (currSettings.fullwidth), Show Header
//     (currSettings.isHeaderVisible — only styleSelected=='style1'), Show Caption
//     (currSettings.optionalcaption), Show Transcript / Show Subtitle (CC)
//     (only uploadtype != uploadbyurl).
//   • Outline radios (No Outline / Outline & Fill Background) + colour options +
//     colour-picker input — only when styleSelected == 'style1'.
//   • Meta tags input (#metaTagsInput) + Alt Text textarea (maxlength 2000).
//   • Styles are data-driven from style_tab.stylesHolder: style1 (default
//     active), style2, style3 — rendered via shared <stylepanel>.
// =============================================================================

export const VIDEO_DATA_TYPE = 'video';
export const VIDEO_WIDGET_NAME = 'Video';
export const VIDEO_DIRECTIVE = 'video-template';

/** Authoring-canvas DOM (the dropped Video element). */
export const VIDEO_CANVAS = {
  widget: `.customClass[data-type="${VIDEO_DATA_TYPE}"], [data-type="${VIDEO_DATA_TYPE}"]`,
  /** The component <section video-template> wrapper. */
  component: 'section[video-template], .component-holder.videostyle',
  sdItem:
    '#desktop_view .sd-item:has([data-type="video"]), #desktop_view .sd-item:has(section[video-template])',
  /** The figure that contains the video placeholder/player. */
  figure: '.videostyle .pc-figure',
  /** Empty-state placeholder icon (shown when no video uploaded). */
  placeholderIcon: '.videostyle .icon-video.icon-Video',
  /** Native <video> element (shown only when an MP4 is uploaded). */
  videoEl: '.videostyle video.primary-video',
  /** YouTube/Vimeo iframe (shown only in URL mode with a valid id). */
  iframe: '.videostyle .video-iframe-container',
  /** Header text (contenteditable; only when isHeaderVisible + style1). */
  header: '.videostyle .template-header.vediotemplate',
  /** Caption text (contenteditable; only when optionalcaption). */
  caption: '.videostyle .pc-caption.vidCaption',
} as const;

/**
 * Settings panel DOM. The video panel has NO id; it renders inside the shared
 * `.componentSettingPanel` wrapper as `[video-setting].video-settings-panel`.
 */
export const VIDEO_SETTINGS = {
  panel: '.componentSettingPanel',
  root: '[video-setting].video-settings-panel.videosetting',
  title: '[video-setting] .txt-set-title .para-ellipsis',
  icon: '[video-setting] .txt-set-icon.icon-Video',

  // Settings sub-panel (shown when commonrightpanel == 'switchSettings')
  settingsPanel: '[video-setting] .video-settings-panel2',
  settingsName: '[video-setting] .Setting-Panel-setting-name',

  // Upload mode (radio pair)
  uploadModeSystem: '[video-setting] input[name="videoUploadType"][value="uploadbysystem"]',
  uploadModeUrl: '[video-setting] input[name="videoUploadType"][value="uploadbyurl"]',

  // System upload (ng-if uploadtype=='uploadbysystem')
  systemUploadBox: '[video-setting] .video-upload-box',
  systemUploadTrigger: '[video-setting] #change-video[uploadfiles]',
  uploadFormatLabel: '[video-setting] label[for="mp4-upload-input"]',

  // URL upload (ng-if uploadtype=='uploadbyurl')
  urlPart: '[video-setting] .kaltura-part',
  urlPlatformDropdown: '[video-setting] .kaltura-part .youtubebutton',
  urlPlatformYoutube: '[video-setting] .kaltura-part .videobyURL:has(img[alt="youtube"])',
  urlPlatformVimeo: '[video-setting] .kaltura-part .videobyURL:has(img[alt="vimeo"])',
  urlVideoIdInput: '[video-setting] input[ng-model="currSettings.youtubeVideoName"]',
  urlVideoIdConfirm: '[video-setting] .video-id-icon',

  // Dimensions
  dimensionsBlock: '[video-setting] #video-Dimensions',
  customDimRadio: '[video-setting] #video-dimension-radio',
  keepOriginalRadio: '[video-setting] #full-video-radio',
  widthInput: '[video-setting] #videoWidthc',
  heightInput: '[video-setting] #videoHeightc',

  // Toggles
  fullWidthToggle: '[video-setting] input[ng-model="currSettings.fullwidth"]',
  showHeaderToggle: '[video-setting] input[ng-model="currSettings.isHeaderVisible"]',
  showCaptionToggle: '[video-setting] input[ng-model="currSettings.optionalcaption"]',
  showTranscriptToggle: '[video-setting] input[ng-model="currSettings.showTranscript"]',
  showClosedCaptionsToggle: '[video-setting] input[ng-model="currSettings.showClosedCaptions"]',

  // Transcript / language (uploadtype != uploadbyurl)
  transcriptUploadBtn: '[video-setting] .videoTracksUploadBtn',
  transcriptFormatLabel: '[video-setting] label[for="vtt-upload-input"]',

  // Outline / fill (only styleSelected == 'style1')
  outlineNone: '[video-setting] input[name="outline"][value="outline"]',
  outlineBg: '[video-setting] input[name="outline"][value="outlineBg"]',
  colorOptions: '[video-setting] .colorOption .color',
  colorPickerButton: '[video-setting] .colorPickerButton',
  colorPickerInput: '[video-setting] .colorPickerInputBox',

  // Meta tags
  tagsInput: '[video-setting] #metaTagsInput',

  // Accessibility / Alt Text
  accessibilityLabel: '[video-setting] .accessibility',
  accessibilityPara: '[video-setting] .accessibilityPara',
  altText: '[video-setting] textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '[video-setting] .altTextCharLimitText',

  // Styles (shared <stylepanel>)
  stylePanel: '[video-setting] stylepanel',
} as const;

/** Source-verified style option names (video.json style_tab.stylesHolder[].name). */
export const VIDEO_STYLES = {
  style1: 'style1',
  style2: 'style2',
  style3: 'style3',
} as const;

/** Source-verified business rules / defaults (video.json). */
export const VIDEO_RULES = {
  widgetName: VIDEO_WIDGET_NAME,
  dataType: VIDEO_DATA_TYPE,
  directive: VIDEO_DIRECTIVE,
  /** Default upload mode. */
  defaultUploadType: 'uploadbysystem',
  /** Default URL platform when URL mode is chosen. */
  defaultUrlType: 'youtube',
  /** Default dimension mode (videoDim). */
  defaultVideoDim: 'full-video-radio',
  /** Full Width defaults to true. */
  defaultFullWidth: true,
  /** Caption visible by default; header hidden by default. */
  defaultOptionalCaption: true,
  defaultHeaderVisible: false,
  /** Default style + accepted upload format. */
  defaultStyle: 'style1',
  uploadFormat: 'MP4',
  transcriptFormat: 'VTT',
  /** Alt Text maxlength enforced in DOM. */
  altTextMaxLength: 2000,
} as const;

/** Selectors representing controls expected to exist in the settings panel. */
export const VIDEO_SETTINGS_RULES = {
  /** Controls that should always be present once the panel opens. */
  alwaysPresent: [
    VIDEO_SETTINGS.uploadModeSystem,
    VIDEO_SETTINGS.uploadModeUrl,
    VIDEO_SETTINGS.dimensionsBlock,
    VIDEO_SETTINGS.keepOriginalRadio,
    VIDEO_SETTINGS.fullWidthToggle,
    VIDEO_SETTINGS.showCaptionToggle,
    VIDEO_SETTINGS.tagsInput,
    VIDEO_SETTINGS.altText,
  ],
  /** Controls gated behind uploadtype == 'uploadbyurl'. */
  urlModeOnly: [VIDEO_SETTINGS.urlPart, VIDEO_SETTINGS.urlVideoIdInput],
  /** Controls gated behind styleSelected == 'style1'. */
  style1Only: [VIDEO_SETTINGS.outlineNone, VIDEO_SETTINGS.outlineBg, VIDEO_SETTINGS.showHeaderToggle],
} as const;
