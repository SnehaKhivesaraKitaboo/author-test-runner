/// <reference types="cypress" />
// =============================================================================
// Carousel / Slideshow element — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                            (widget catalog: name "Carousel"/"Slideshow", dataType "slideshow")
//   templates/slideshow/slideshow.html                          (canvas DOM)
//   templates/slideshow/common-template-settings-panel.html     (settings panel)
//   templates/slideshow/default/slideshow.json                  (default field data + settings)
//   templates/slideshow/scripts/slideshow-directive.js          (directive: slideShowTemplate)
//   templates/stylepanel.html                                   (shared <stylepanel> markup)
//
// dataType = "slideshow"; widget name(s) = "Carousel" / "Slideshow";
// directive = "slide-show-template". Settings panel id = "#Slideshow-settings-panel"
// (title "Carousel").
//
// Source-driven facts:
//   • Carousel is an ELEMENT (not an assessment widget) — `slideshow` is absent
//     from support/module-setup.ts ASSESSMENT_DATA_TYPES, so resolveDropTarget
//     routes it to the canvas. It drops onto the Instructions-for-Students page
//     (#desktop_view) via cy.dropComponent('Carousel'/'Slideshow'), NOT a
//     Generic Step column.
//   • Canvas wrapper = `.component-holder.slideshow[slide-show-template]`. Each
//     slide is a `.slideshowContainer` (ng-repeat over fieldData.slides). The
//     default JSON ships TWO slides.
//   • Slide count limits (directive): max_slides = 12, min_slides = 2. Add Slide
//     gets `btn-disabled` at length >= 12; Delete Slide at length <= 2.
//   • Editable bodies are contenteditable (ng-model) — use cy.setContentEditableOn,
//     never cy.type(): header `.sc-intro`, instruction `.sc-instr` (page-level),
//     per-slide title `.slide-title`, text `.slideshowPara`, caption `.template-caption`.
//   • Settings panel is data-driven and SECTION-gated: the Settings form renders
//     only when `commonrightpanel == 'switchSettings'`. Visibility toggles use
//     stable ids (#autoslide, #header-visibility, #instr-visibility,
//     #SlideTitle-visibility, #pragraph-visibility, #caption-visibility).
//   • Layout radios: #vertical-slideshow / #horizontal-slideshow (ng-model
//     verticalSlide). Media radios: image/video/text (ng-model mediaToUpload).
//     Outline radios value="outline" (No Outline) / value="outlineBg" (Outline).
//     Action-asset colour: .colorPickerInputBox + settingcolorpicker dropdown.
//   • Auto Play exposes a "Slide duration" number input only when autoSlide is on.
//   • Several settings controls are flag-gated (showAutoSlideSetting,
//     showAudioBar, online-video vendor) → spec degrades gracefully (log+return).
// =============================================================================

export const CAROUSEL_DATA_TYPE = 'slideshow';
/** config.js exposes the widget under both names; "Carousel" is the catalog label. */
export const CAROUSEL_WIDGET_NAME = 'Carousel';
export const CAROUSEL_WIDGET_NAME_ALT = 'Slideshow';

/** Authoring-canvas DOM (the dropped Carousel/slideshow element). */
export const CAROUSEL_CANVAS = {
  widget: `.customClass[data-type="${CAROUSEL_DATA_TYPE}"], [data-type="${CAROUSEL_DATA_TYPE}"], .component-holder.slideshow`,
  /** The component wrapper carrying the directive. */
  component: '.component-holder.slideshow[slide-show-template]',
  sdItem: '#desktop_view .sd-item:has([slide-show-template])',
  /** Page-level header / instruction contenteditables. */
  header: '.component-holder.slideshow .sc-intro.editables',
  instruction: '.component-holder.slideshow .sc-instr.template-instruction.editables',
  /** Per-slide repeated container (ng-repeat over fieldData.slides). */
  slide: '.component-holder.slideshow .slideshowContainer',
  slideTitle: '.component-holder.slideshow .slide-title.editables',
  slideText: '.component-holder.slideshow .slideshowPara.editables',
  caption: '.component-holder.slideshow .template-caption.editables',
  mediaContainer: '.component-holder.slideshow .slideshow-media-container',
  /** Add / Delete slide controls (footer of the component). */
  addSlide: '.component-holder.slideshow .add-slide',
  deleteSlide: '.component-holder.slideshow .delete-slide',
} as const;

/** Settings panel DOM (#Slideshow-settings-panel). */
export const CAROUSEL_SETTINGS = {
  panel: '#Slideshow-settings-panel',
  title: '#Slideshow-settings-panel .templateName',
  icon: '#Slideshow-settings-panel .icon-Slideshow',
  /** Settings form is gated by commonrightpanel == 'switchSettings'. */
  settingsForm: '#Slideshow-settings-panel .header-settings-panel',

  // Visibility / playback toggles
  autoPlay: '#Slideshow-settings-panel #autoslide',
  slideDuration: '#Slideshow-settings-panel .slideshow-pause-duration',
  showHeader: '#Slideshow-settings-panel #header-visibility',
  showInstruction: '#Slideshow-settings-panel #instr-visibility',
  showSlideTitle: '#Slideshow-settings-panel #SlideTitle-visibility',
  showParagraph: '#Slideshow-settings-panel #pragraph-visibility',
  showCaption: '#Slideshow-settings-panel #caption-visibility',

  // Layout
  layoutVertical: '#Slideshow-settings-panel #vertical-slideshow',
  layoutHorizontal: '#Slideshow-settings-panel #horizontal-slideshow',
  placementIcons: '#Slideshow-settings-panel .slide_vertical_horizontal_icon',

  // Slide properties (media type)
  mediaImage: '#Slideshow-settings-panel input[name="slide_Media"][value="image"]',
  mediaVideo: '#Slideshow-settings-panel input[name="slide_Media"][value="video"]',
  mediaText: '#Slideshow-settings-panel input[name="slide_Media"][value="text"]',
  imageUploadBox: '#Slideshow-settings-panel #upload-comp-img',
  videoUploadBox: '#Slideshow-settings-panel #change-video',
  videoIdInput: '#Slideshow-settings-panel .select-kaltura2',

  // Styles (outline) + action-asset colour
  outlineNone: '#Slideshow-settings-panel input[name="outline"][value="outline"]',
  outlineOn: '#Slideshow-settings-panel input[name="outline"][value="outlineBg"]',
  colorPickerButton: '#Slideshow-settings-panel .colorPickerButton',
  colorPickerInput: '#Slideshow-settings-panel .colorPickerInputBox',

  // Style thumbnails (shared <stylepanel>) + tags / transcript
  stylePanel: '#Slideshow-settings-panel stylepanel',
  transcript: '#Slideshow-settings-panel #templateTransscript',
  tagManager: '#Slideshow-settings-panel tag-manager',
} as const;

/** Source-verified business rules / defaults (slideshow.json + directive). */
export const CAROUSEL_RULES = {
  /** directive max_slides */
  maxSlides: 12,
  /** directive min_slides (Delete disabled at/below this) */
  minSlides: 2,
  /** default JSON ships two slides */
  defaultSlideCount: 2,
  defaultLayout: 'vertical-slideshow',
  defaultOutline: 'outline',
  defaultMedia: 'image',
  defaultActionAssetColor: '#2175d1',
  defaultAutoSlide: false,
  defaultPauseDuration: 3,
  widgetName: CAROUSEL_WIDGET_NAME,
  widgetNameAlt: CAROUSEL_WIDGET_NAME_ALT,
} as const;
