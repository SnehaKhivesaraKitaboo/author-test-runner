# Callout (Callout Box / sidebarComponent element) — Deep Automation

- **Component slug:** `callout`
- **dataType:** `sidebarComponent` · **widget name:** `Callout Box` · **directive:** `sidebar-template`
- **Spec:** `17-callout-deep.spec.ts`
- **QC authority:** `Author Test Cases - Callout.pdf` (TC_01–TC_110)
- **Source authority:**
  - `config/config.js` (catalog entry: `name: "Callout Box"`, `dataType: "sidebarComponent"`, `url: templates/sidebar/sidebar.html`, `settingsURL: templates/sidebar/sidebar-settings-pannel.html`)
  - `templates/sidebar/sidebar.html`
  - `templates/sidebar/sidebar-settings-pannel.html`
  - `templates/sidebar/default/sidebar.json`
  - `templates/sidebar/scripts/sidebar-directive.js`
  - `templates/stylepanel.html`

> ⚠️ **Not yet live-verified.** Selectors are **source-derived** from the templates
> above; the suite has **not** been executed against a running authoring
> instance. A single headed run is required to confirm the element drop onto the
> canvas, the `.componentSettingPanel` settings selectors, and the style-gated
> control visibility.

## Component identity (verified)

- **Verified dataType:** `sidebarComponent` (matches the QC catalog).
- **Verified widget name:** `Callout Box` (config/config.js).
- **Verified directive:** `sidebar-template` (DOM attribute on
  `section.sidebarComponent[sidebar-template]`; defined in
  `templates/sidebar/scripts/sidebar-directive.js` as `App.directive('sidebarTemplate', …)`).
- **Drop mechanism:** **element → canvas.** `sidebarComponent` is **not** in
  `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so `resolveDropTarget`
  returns `'canvas'`. The component drops onto the **Instructions-for-Students**
  page (`#desktop_view`) via the existing `cy.dropComponent('Callout Box')`
  primitive — **not** into a Generic Step column.

> 🚫 **Do not confuse** the Callout Box with the separate **"Sidebar"**
> interactivity widget (`dataType: "aside-bar"`, `templates/asidebar/*`). They
> are distinct catalog entries; Callout = `templates/sidebar/`.

## Architecture notes (source-verified)

- Canvas wrapper: **`[data-type="sidebarComponent"]`** → inner
  `section.sidebarComponent[sidebar-template]`.
- **Header/title** field: **`.sc-intro.template-header.sidebarHeader`**
  (contenteditable, `ng-model="fieldData.introductionText"`) — rendered **only**
  for `style1`/`style2` (`isHeaderVisible`), **not** for the default style3/style4.
- **Body/text** field: **`.sidebarCaption`** (contenteditable,
  `ng-model="fieldData.paragraph"`) — set via **`cy.setContentEditableOn`**,
  never `cy.type()`.
- **Settings panel:** has **no fixed element id** (unlike paragraph's
  `#text-settings-panel`). It is `ng-include`'d into the shared
  **`.componentSettingPanel`** host (`index.html`); the panel root is
  `.chaperHeding.sidebar-setting[heading-setting][sidebar-setting]` with title
  **"Callout Box"**. All settings selectors are scoped to `.componentSettingPanel`.
- **Styles** are data-driven (`style_tab.stylesHolder`) via the shared
  `<stylepanel>`; each `.stylebgdiv[id]` id is the style name:
  - **`style3`** — "Take Note" card (`CalloutBox-Thumbnail_1.svg`),
    **active by default** (`sidebar.json` `layoutColorActive: "style3"`).
  - **`style4`** — icon card (`CalloutBox-Thumbnail_2.svg`).
  `sidebar-directive.updateSidebarStyles()` removes the legacy `#style1`/`#style2`
  tiles, so **only two styles** are offered.
- **style4 icon picker** (`.style-4-icons-item`, 5 items from
  `settings.style4Icons`): **Take Note… / Remember… / Think About… / Ask
  Yourself… / Did You Know?** (default active index 0 = Take Note).
- **Settings toggles:** Show Header (`#caption-option-show-header`), Show Image
  (`#caption-option-show-image`), Auto Colour (`#caption-option-auto-color`,
  style1 only), Show Caption (`#caption-option-show-caption`, inside the image
  section).
- **Colour pickers:** Header (`#headerBgColorInput`, style1 only), Background
  (`#sidebarBgColorInput`), Auto (`#autoColorInput`), plus disabled style3/style4
  Background/Stroke inputs.
- **Image placement** radios (Below/Above/Left/Right) and **Outline** radios
  (No Outline / Outline & Fill, style1 only) render **inside the image section**.
- **Alt Text** textarea (`ng-model="currSettings.altText"`), **maxlength 2000**,
  counter `.altTextCharLimitText` ("Chars 2000").

### Flag/style-gated controls → graceful degradation

Many controls are gated by the active style/layout: style1 exposes the
header-text card with header colour, outline radios and the image colour pickers;
the image section (placement/caption/upload) requires **Show Image**. Because the
**default style is style3**, several of those controls are **absent** in the
default context. The spec **degrades gracefully** (logs an ℹ note and returns)
whenever a flag-gated control is not present, rather than failing.

## ⚠️ Source ambiguity — the "Direction Line" style does not exist

QC **TC_04–TC_20** (and references in TC_12, TC_14, TC_33) describe a
**"Direction Line"** callout style with a stroke/arrow icon, blue background,
RTE/math support, scroll behaviour and layout placement. **No such style exists**
in `templates/sidebar/default/sidebar.json` — the shipped catalogue offers only
**`style3`** ("Take Note" card) and **`style4`** (icon card). Rather than assert
against a non-existent style, all "Direction Line"–specific cases are
**deferred** with the reason `source not present`. If the Direction Line style is
added to the templates later, these cases should be re-derived from the new
markup.

## Coverage (honest split)

| Status | Count | Notes |
|---|---|---|
| Automated | 47 | Drop + settings panel, both styles + active-default + style-switch, icon-card icon set/selection/rapid-switch, body content + long text, Show Header/Image/Caption/Auto-Colour toggles, Background/Header colour inputs, placement radios, outline radios/swatches, Alt Text presence/entry/maxlength, caption entry, image-upload control presence, security/injection |
| Deferred | 63 | Login/activity bootstrap (TC_01–03), **non-existent Direction Line style** (TC_04–09, 12–18), persistence-after-reload (TC_11,19,40,48,68,104), drag boundaries (TC_20,38), Preview/Reader/Publish (TC_16,17,23,35,36,39,49,50,64,65,99,100), Generic-Step empty-state (TC_37,63), RTE-toolbar formatting/font (TC_08,31,61,92–98), math render (TC_09,32,62), file pickers (TC_59 action, 69,77–80,97,103), invalid-hex validation (TC_91), responsiveness (TC_66,105), accessibility (TC_106–108), network failure (TC_109), undo/redo (TC_110) |

Total = **110** (every TC mapped exactly once — see `callout-mapping.json`).

## Why these deferrals

- **TC_01–TC_03** — login → create activity → start authoring: environment/harness
  bootstrap (handled by `cy.openAuthoringTool`), not assertions on the Callout element.
- **TC_04–TC_20 (Direction Line subset)** — the QC's "Direction Line" style is not
  present in the source templates (see *Source ambiguity* above).
- **RTE-toolbar, math render, file pickers, Preview/Reader/Publish, persistence
  after reload, responsiveness, keyboard/screen-reader accessibility** — all
  require flows outside the authoring DOM and are `it.skip()` with explicit
  reasons in the spec and `callout-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/callout/17-callout-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
