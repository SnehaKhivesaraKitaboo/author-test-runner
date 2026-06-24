/// <reference types="cypress" />
// =============================================================================
// FIB Media (Fill in the Blank — with Image) — Verified selectors
//
// ARCHITECTURE NOTE
// ---------------------------------------------------------------------------
// FIB Media is the FIB template (templates/fib/) running in "FIB with Image"
// mode (currSettings.fibWithImage === true). It is NOT a structurally separate
// template — the same fib.html / fib-settings-panel.html drive it, with image
// containers per statement and an image paragraph media type.
//
// Source of truth (KITABOO_Authoring):
//   templates/fib/fib.html
//   templates/fib/fib-settings-panel.html
//
// Canvas data-type when dropped may surface as either the FIB type with a
// fibWithImage flag, or a distinct "fib-media" type depending on build; the
// widget selector tolerates both. All other selectors were read from source.
// =============================================================================

export const FIB_MEDIA_DATA_TYPE = 'fib-media';

/** Authoring-canvas DOM (the dropped FIB-with-Image component). */
export const FIB_MEDIA_CANVAS = {
  /** Tolerant: FIB-with-image may keep the fill-in-the-blank data-type. */
  widget:
    '[data-type="fib-media"], [data-type="fill-in-the-blank"][data-fib-type], .fib.inlineImage',
  component: '.fib',
  header: '.fib .sc-intro.template-header',
  instruction: '.fib .sc-instr.template-instruction',
  /** Repeating statement rows. */
  sentenceRow: '.fib .form-row.sentenceRow',
  sentence: '.fib .sc-sentence.sentence-text',
  /** A statement row that currently shows media. */
  sentenceWithImage: '.fib .form-row.sentenceRow.sentenceWithImage',
  /** Per-statement media wrapper + rendered image. */
  mediaContainer: '.fib .mediaContainer',
  imageContainer: '.fib .mediaContainer .imageContainer',
  statementImage: '.fib .mediaContainer img.fibMedia, .fib .mediaContainer img.primary-image',
  /** Paragraph-level (header) media block (fibWithImage). */
  paragraphMedia: '.fib .imageContainer .primary-image.fibMedia',
} as const;

/** Settings panel DOM (#fib-settings-panel). */
export const FIB_MEDIA_SETTINGS = {
  panel: '#fib-settings-panel',
  /** Title reads "FIB with Image" when fibWithImage is on. */
  titleWithImage: '#fib-settings-panel .para-ellipsis[title]',

  // Paragraph / media type radios (only present in FIB-with-Image)
  paragraphMediaImage: '#fib-settings-panel input[name="paragraphMediaType"][value="image"]',
  paragraphMediaVideo: '#fib-settings-panel input[name="paragraphMediaType"][value="video"]',
  paragraphMediaAudio: '#fib-settings-panel input[name="paragraphMediaType"][value="audio"]',

  // Image settings container + upload + placement
  imageSettingContainer: '#fib-settings-panel .imageSettingContainer',
  imagePlacementGroup: '#fib-settings-panel .imagePlacementBtnGroup',
  imagePlacementTop: '#fib-settings-panel .icon-image-top',
  imagePlacementBottom: '#fib-settings-panel .icon-image-bottom',
  imageCaptionToggle: '#fib-settings-panel #showParagraphImageCaption',

  // Shared FIB visibility toggles
  showHeader: '#fib-settings-panel #header-visibility',
  showInstruction: '#fib-settings-panel #instr-visibility',
} as const;

/** Source-verified business rules / facts. */
export const FIB_MEDIA_RULES = {
  /** FIB with Image disables audio/video paragraph media (image-only). */
  imageOnlyMedia: true,
  /** Image can only be positioned left/right (or top/bottom), never inline. */
  placementInlineDisallowed: true,
} as const;
