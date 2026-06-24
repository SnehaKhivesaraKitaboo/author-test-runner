/// <reference types="cypress" />
// =============================================================================
// Flashcard — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                       (widget catalog: name "Flashcard", dataType "flashcard")
//   templates/flashcard/flashcard.html                     (canvas DOM)
//   templates/flashcard/flashcard-template-setting-panel.html (settings panel)
//   templates/flashcard/flashcard-media-template.html      (media render: image/audio/video)
//   templates/flashcard/default/flashcard.json             (default field data + style_tab + settings)
//
// dataType = "flashcard"; widget name = "Flashcard"; directive = "flash-card-template".
// Canvas wrapper = `.component-holder.flashcard[flash-card-template]`. Settings
// panel attribute = `[flash-card-setting]`, class `.flashcard-setting-panel`,
// title "Flashcard".
//
// Source-driven facts:
//   • Flashcard is a CONTENT widget (NOT an assessment widget) — "flashcard" is
//     absent from support/module-setup.ts ASSESSMENT_DATA_TYPES, so
//     resolveDropTarget returns 'canvas'. It drops onto the
//     Instructions-for-Students page (#desktop_view) via cy.dropComponent,
//     NOT into a Generic Step column.
//   • Each card is a `.slideshowContainer` (ng-repeat over fieldData.slides).
//     The default JSON ships 3 slides; Delete Card is disabled when slides <= 3
//     and Add Card is disabled when slides >= 20 (source: flashcard.html
//     ng-class on .delete-slide / .add-slide).
//   • Front/back editable text bodies are `.front-container .card-text` and
//     `.back-container .card-text` (contenteditable, ng-model
//     option.frontCard.cardText / option.backCard.cardText). cardType=='text'
//     gates these; media types render the [data-media-template-flashcard] block.
//   • Header (.sc-intro) / Instruction (.sc-instr) bodies are contenteditable
//     and shown only when settings.isHeaderVisible / isInstructionVisible (both
//     default true).
//   • Flip control is `.add-flip` (front + back face). Reorder is NOT present in
//     the authoring DOM (no drag handles); navigation arrows are bxslider runtime.
//   • Settings: <stylepanel> (style1 active, style2, coming-soon), Show Header /
//     Show Instruction checkboxes, Front/Back media radios (Text/Image/Audio/
//     Video), No Outline / Outline radios, Card Colour + Action Assets colour
//     pickers, Tags input, Alt Text textarea (maxlength 2000).
// =============================================================================

export const FC_DATA_TYPE = 'flashcard';
export const FC_WIDGET_NAME = 'Flashcard';

/** Authoring-canvas DOM (the dropped Flashcard component). */
export const FC_CANVAS = {
  widget: `.component-holder.flashcard[flash-card-template], [flash-card-template]`,
  component: '.component-holder.flashcard',
  sdItem: '#desktop_view .sd-item:has([flash-card-template]), #desktop_view .sd-item:has(.component-holder.flashcard)',

  /** Header / Instruction editable bodies (shown when settings flags true). */
  header: '.component-holder.flashcard .sc-intro.editables',
  instruction: '.component-holder.flashcard .sc-instr.editables',

  /** Each card (ng-repeat over fieldData.slides). */
  slide: '.component-holder.flashcard .slideshowContainer',
  slideLabel: '.component-holder.flashcard .slide-count',

  /** Front / back editable text bodies (cardType=='text'). */
  frontText: '.component-holder.flashcard .front-container .card-text.editables',
  backText: '.component-holder.flashcard .back-container .card-text.editables',
  /** Optional per-card free text (textPlacement=='top'). */
  slideText: '.component-holder.flashcard .slide-text.editables',

  /** Flip control on each face. */
  flip: '.component-holder.flashcard .add-flip',
  card: '.component-holder.flashcard .flip .card',

  /** Media render block (image/audio/video) inside a face. */
  media: '.component-holder.flashcard .flashcard-media',

  /** Card management buttons. */
  addCard: '.component-holder.flashcard .add-slide',
  addCardIcon: '.component-holder.flashcard .icon-Add.add-card',
  deleteCard: '.component-holder.flashcard .delete-slide',
  deleteCardIcon: '.component-holder.flashcard .icon-Delete.dlt-card',
} as const;

/** Settings panel DOM ([flash-card-setting] / .flashcard-setting-panel). */
export const FC_SETTINGS = {
  panel: '[flash-card-setting], .flashcard-setting-panel',
  title: '[flash-card-setting] .templateName, .flashcard-setting-panel .templateName',
  icon: '[flash-card-setting] .icon-Flash-Cards, .flashcard-setting-panel .icon-Flash-Cards',

  // Style panel (shared <stylepanel>)
  stylePanel: '[flash-card-setting] stylepanel, .flashcard-setting-panel stylepanel',

  // Header / Instruction visibility
  showHeader: '#header-visibility',
  showInstruction: '#instr-visibility',

  // Card properties heading
  cardProperties: '.Slideshow-headtagtype',

  // Front media type radios
  frontText: 'input[name="slide_Media"][value="text"]',
  frontImage: 'input[name="front_media"][value="image"]',
  frontAudio: 'input[name="front_media"][value="audio"]',
  frontVideo: 'input[name="front_media"][value="video"]',

  // Back media type radios
  backText: 'input[name="slide_Media"][value="text"]',
  backImage: 'input[name="back_media"][value="image"]',
  backAudio: 'input[name="back_media"][value="audio"]',
  backVideo: 'input[name="back_media"][value="video"]',

  // Image / video / audio upload boxes
  frontImageUpload: '#upload-frontcard-img',
  frontVideoUpload: '#upload-frontcard-video',
  frontAudioUpload: '#upload-frontcard-audio',
  backImageUpload: '#upload-backcard-img',
  backVideoUpload: '#upload-backcard-video',
  backAudioUpload: '#upload-backcard-audio',

  // Outline radios
  outlineNone: 'input[name="outline"][value="outline"]',
  outlineBg: 'input[name="outline"][value="outlineBg"]',

  // Colour pickers
  cardColourInput: '#card-colour',
  cardColourButton: '.colorPickerContainer .colorPickerButton',
  actionAssetsInput: '.colorPickerContainer input[ng-model="currSettings.Appearance"]',
  colorPickerInput: '.flashcard-setting-panel .colorPickerInputBox',

  // Tags
  tagsInput: 'input[ng-model="currSettings.metaTags"]',

  // Accessibility / Alt Text
  accessibilityLabel: '.flashcard-setting-panel .accessibility, [flash-card-setting] .accessibility',
  accessibilityPara: '.flashcard-setting-panel .accessibilityPara, [flash-card-setting] .accessibilityPara',
  altText: 'textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '.altTextCharLimitText',
} as const;

/** Source-verified business rules / defaults (from flashcard.json + flashcard.html). */
export const FC_RULES = {
  /** default JSON ships 3 slides. */
  defaultSlideCount: 3,
  /** Delete Card disabled when slides <= this. */
  minSlides: 3,
  /** Add Card disabled when slides >= this. */
  maxSlides: 20,
  altTextMaxLength: 2000,
  defaultOutline: 'outline',
  defaultCardColour: '#FFFFFF',
  defaultStyle: 'style1',
  defaultCardType: 'text',
  widgetName: FC_WIDGET_NAME,
} as const;
