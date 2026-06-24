/// <reference types="cypress" />
// =============================================================================
// Callout Box (sidebar element) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   config/config.js                                   (widget catalog: name "Callout Box", dataType "sidebarComponent")
//   templates/sidebar/sidebar.html                     (canvas DOM)
//   templates/sidebar/sidebar-settings-pannel.html     (settings panel)
//   templates/sidebar/default/sidebar.json             (default field data + style_tab/style4Icons)
//   templates/sidebar/scripts/sidebar-directive.js     (directive: sidebarTemplate / sidebarSetting)
//   templates/stylepanel.html                          (shared <stylepanel> markup)
//
// dataType = "sidebarComponent"; widget name = "Callout Box"; directive = "sidebar-template".
// Canvas wrapper = `[data-type="sidebarComponent"]` with inner
// `section.sidebarComponent[sidebar-template]`.
//
// Settings panel: the sidebar settings markup has NO fixed element id (unlike
// paragraph's #text-settings-panel). The whole panel is rendered into the shared
// `.componentSettingPanel` host (index.html) via ng-include of settingsURL, and
// the panel root is `.chaperHeding.sidebar-setting[heading-setting][sidebar-setting]`
// with title text "Callout Box". We therefore scope settings selectors to
// `.componentSettingPanel`.
//
// Source-driven facts:
//   • Callout Box is an ELEMENT (sidebarComponent is NOT in support/module-setup.ts
//     ASSESSMENT_DATA_TYPES), so resolveDropTarget routes it to the canvas — it
//     drops onto the Instructions-for-Students page (#desktop_view) via
//     cy.dropComponent('Callout Box'), NOT a Generic Step column.
//   • Default layout (sidebar.json settings.layoutColorActive) = "style3".
//     Styles are data-driven from style_tab.stylesHolder; each <stylepanel>
//     button is wrapped in `.stylebgdiv[id]` where id is the style name:
//       style3  → "Take Note" card (CalloutBox-Thumbnail_1.svg), active by default
//       style4  → icon card (CalloutBox-Thumbnail_2.svg)
//     (sidebar-directive.updateSidebarStyles() removes legacy #style1/#style2.)
//   • Title (header) field = `.sc-intro.template-header.sidebarHeader`
//     (contenteditable, ng-model fieldData.introductionText) — rendered only for
//     style1/style2 (isHeaderVisible), NOT for style3/style4. Use setContentEditableOn.
//   • Body/text field = `.sidebarCaption` (contenteditable, ng-model fieldData.paragraph).
//   • style4 card shows the active icon `.sidebar-style-4-icon` + label `.sidebarHeaderText`.
//   • Settings toggles (id'd inputs): Show Header (#caption-option-show-header),
//     Show Image (#caption-option-show-image), Auto Colour (#caption-option-auto-color),
//     Show Caption (#caption-option-show-caption).
//   • Color pickers: Header (#headerBgColorInput, style1 only), Background
//     (#sidebarBgColorInput), Auto colour (#autoColorInput), plus disabled
//     style3/style4 Background/Stroke (#sidebarBgColorInputDisabled / #sidebarStrokeColorInput).
//   • Image placement radios: #placement-belowText / aboveText (name) /
//     #placement-leftSide / #placement-rightSide (ng-model currSettings.placement).
//   • Outline radios (style1 only): name="outline" value="outline" / "outlineBg"
//     + colorOption swatches `.colorOption .color`.
//   • style4 icon picker: `.style-4-icons-item` (5 items: Take Note/Remember/
//     Think About/Ask Yourself/Did You Know?) from settings.style4Icons.
//   • Alt Text textarea (ng-model currSettings.altText), maxlength 2000,
//     counter ".altTextCharLimitText" ("Chars 2000").
//   • Image/Video tabs: ".images-bar-tab" (Image / Video), upload box "#upload-comp-img".
// =============================================================================

export const CALLOUT_DATA_TYPE = 'sidebarComponent';
export const CALLOUT_WIDGET_NAME = 'Callout Box';

/** Authoring-canvas DOM (the dropped Callout Box / sidebarComponent element). */
export const CALLOUT_CANVAS = {
  widget: `[data-type="${CALLOUT_DATA_TYPE}"], .customClass[data-type="${CALLOUT_DATA_TYPE}"]`,
  /** The component <section sidebar-template> wrapper. */
  component: 'section.sidebarComponent[sidebar-template], .component-holder.sidebarComponent',
  sdItem:
    '#desktop_view .sd-item:has([data-type="sidebarComponent"]), #desktop_view .sd-item:has(section[sidebar-template])',
  /** Title/header field (contenteditable; ng-model fieldData.introductionText) — style1/style2 only. */
  header: '.sc-intro.template-header.sidebarHeader',
  /** Main body/text field (contenteditable; ng-model fieldData.paragraph). */
  body: '.sidebarCaption',
  /** Image figure + caption (when imagedisplay). */
  figure: '.pc-figure.sidebarComponentfigcaption',
  image: '.pc-image.primary-image',
  caption: '.imgCaption.pc-caption',
  /** style3/style4 icon (rendered on the card). */
  style3Icon: '.sidebar-style-3-icon',
  style4Icon: '.sidebar-style-4-icon',
  style4Label: '.sidebarHeaderText',
} as const;

/** Settings panel DOM (shared .componentSettingPanel host; sidebar-setting directive). */
export const CALLOUT_SETTINGS = {
  panel: '.componentSettingPanel',
  root: '.componentSettingPanel .chaperHeding.sidebar-setting',
  title: '.componentSettingPanel .settings-heading .templateName',
  icon: '.componentSettingPanel .settings-heading .icon-Header.settings-icon',

  // Image / Video source tabs
  sourceTabs: '.componentSettingPanel .images-bar-tab',
  imageUpload: '.componentSettingPanel #upload-comp-img',

  // Toggles
  showHeader: '.componentSettingPanel #caption-option-show-header',
  showImage: '.componentSettingPanel #caption-option-show-image',
  autoColor: '.componentSettingPanel #caption-option-auto-color',
  showCaption: '.componentSettingPanel #caption-option-show-caption',

  // Color pickers (text inputs)
  headerColorInput: '.componentSettingPanel #headerBgColorInput',
  backgroundColorInput: '.componentSettingPanel #sidebarBgColorInput',
  autoColorInput: '.componentSettingPanel #autoColorInput',
  style3BgColorInput: '.componentSettingPanel #sidebarBgColorInputDisabled',
  style3StrokeColorInput: '.componentSettingPanel #sidebarStrokeColorInput',

  // Image placement radios (ng-model currSettings.placement)
  placementBelow: '.componentSettingPanel #placement-belowText',
  placementAbove: '.componentSettingPanel input[name="placement"][value="aboveText"]',
  placementLeft: '.componentSettingPanel #placement-leftSide',
  placementRight: '.componentSettingPanel #placement-rightSide',

  // Outline radios (style1 only) + colour swatches
  outlineNone: '.componentSettingPanel input[name="outline"][value="outline"]',
  outlineBg: '.componentSettingPanel input[name="outline"][value="outlineBg"]',
  outlineColorOptions: '.componentSettingPanel .colorOption .color',

  // style4 icon picker (Take Note / Remember / Think About / Ask Yourself / Did You Know?)
  style4Icons: '.componentSettingPanel .style-4-icons-item',
  style4IconLabel: '.componentSettingPanel .style-4-icons-label',
  style4IconActive: '.componentSettingPanel .style-4-icons-item.active',

  // Accessibility / Alt Text
  accessibilityLabel: '.componentSettingPanel .accessibility',
  accessibilityPara: '.componentSettingPanel .accessibilityPara',
  altText: '.componentSettingPanel textarea[ng-model="currSettings.altText"]',
  altTextCharLimitText: '.componentSettingPanel .altTextCharLimitText',

  // Styles (shared <stylepanel>)
  stylePanel: '.componentSettingPanel .header-styles-panel',
  styleButtons: '.componentSettingPanel .styleBackground',
  styleDivs: '.componentSettingPanel .stylebgdiv[id]',
} as const;

/** Source-verified style option names (style_tab.stylesHolder[].name → .stylebgdiv id). */
export const CALLOUT_STYLES = {
  takeNote: 'style3',
  iconCard: 'style4',
} as const;

/** Source-verified style4 icon labels (settings.style4Icons[].label). */
export const CALLOUT_ICONS = {
  takeNote: 'Take Note...',
  remember: 'Remember...',
  thinkAbout: 'Think About...',
  askYourself: 'Ask Yourself...',
  didYouKnow: 'Did You Know?',
} as const;

/** Source-verified business rules / defaults. */
export const CALLOUT_RULES = {
  defaultLayout: 'style3',
  defaultStyle4Icon: 0,
  altTextMaxLength: 2000,
  defaultPlacement: 'belowText',
  defaultOutline: 'outline',
  widgetName: CALLOUT_WIDGET_NAME,
  styleCount: 2,
  iconCount: 5,
} as const;
