# Carousel (slideshow element) — Deep Automation

- **Component slug:** `carousel`
- **dataType:** `slideshow` · **widget name:** `Carousel` (alias `Slideshow`) · **directive:** `slide-show-template`
- **Spec:** `28-carousel-deep.spec.ts`
- **QC authority:** `Author Test Cases - Carousel.pdf` (TC_01–TC_101)
- **Source authority:**
  - `config/config.js` (widget catalog entry: `name: "Carousel"`/`"Slideshow"`, `dataType: "slideshow"`)
  - `templates/slideshow/slideshow.html`
  - `templates/slideshow/common-template-settings-panel.html`
  - `templates/slideshow/default/slideshow.json`
  - `templates/slideshow/scripts/slideshow-directive.js`
  - `templates/stylepanel.html`

## Verified dataType / name / drop mechanism

`config.js` defines the widget twice — `{ "name": "Slideshow", "dataType": "slideshow" }`
and `{ "name": "Carousel", "iconClass": "icon-Slideshow", "dataType": "slideshow",
"isDroppable": true }`. Both resolve to **`dataType = "slideshow"`** and template
`templates/slideshow/slideshow.html` with settings
`templates/slideshow/common-template-settings-panel.html`.

## Element vs assessment widget (drop mechanism)

Carousel is an **element**, not an assessment widget. `slideshow` is **not** in
`support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so `resolveDropTarget` returns
`'canvas'`. The component is therefore dropped onto the
**Instructions-for-Students** page (`#desktop_view`) via the existing
`cy.dropComponent('Carousel')` primitive (matching the catalog widget by name and
injecting it onto the unrestricted canvas). It is **not** dropped into a Generic
Step column.

`cy.ensureCarouselDeepSetup` mirrors the Text sibling's canvas-drop setup
contract (`cy.navigateToCanvasPage()` + `cy.dropComponent(...)`), preferring the
`Carousel` catalog label and falling back to `Slideshow`.

## Architecture notes (source-verified)

- Canvas wrapper: **`.component-holder.slideshow[slide-show-template]`**. Each
  slide is a repeated **`.slideshowContainer`** (ng-repeat over
  `fieldData.slides`). The default JSON ships **two** slides.
- **Slide-count limits** (`slideshow-directive.js`): `max_slides = 12`,
  `min_slides = 2`. Add Slide gains `btn-disabled` at length ≥ 12; Delete Slide at
  length ≤ 2 — both DOM-assertable on the `.add-slide` / `.delete-slide` footer
  labels.
- Editable bodies are **contenteditable** (`ng-model`) — set via
  **`cy.setContentEditableOn`**, never `cy.type()`: header `.sc-intro`,
  instruction `.sc-instr`, per-slide title `.slide-title`, text `.slideshowPara`,
  caption `.template-caption`.
- Settings panel: **`#Slideshow-settings-panel`**, title **"Carousel"**, icon
  `.icon-Slideshow`. The Settings form is section-gated by
  `commonrightpanel == 'switchSettings'`. Visibility/playback toggles use stable
  ids: `#autoslide` (Auto Play), `#header-visibility`, `#instr-visibility`,
  `#SlideTitle-visibility`, `#pragraph-visibility`, `#caption-visibility`.
- Layout radios `#vertical-slideshow` / `#horizontal-slideshow`. Media-type
  radios image/video/text (`name="slide_Media"`). Outline radios `value="outline"`
  (No Outline) / `value="outlineBg"` (Outline). Action-asset colour via
  `.colorPickerInputBox` + `<settingcolorpicker>` dropdown. Auto Play reveals a
  `Slide duration` number input (`.slideshow-pause-duration`) only when active.
- Flag-gated controls (`showAutoSlideSetting`, `captiondisplay`, `showAudioBar`,
  online-video vendor) → the spec **degrades gracefully** (log + return) when not
  mounted.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 33 | Drop + settings panel, Auto Play / Show Header / Instruction / Slide Title / Paragraph / Caption toggles, multi-toggle interaction + defaults, Vertical/Horizontal layout, Image/Video/Text media radios + placement icons, No-Outline/Outline + action-asset colour, Add/Delete slides + min/max-count guards + add/delete churn, default slide set, Slide Title text + special chars, caption edit, security |
| Deferred | 68 | Login/activity/step bootstrap (TC_01–TC_09), image/video upload (OS picker), rich-text formatting (bold/italic/underline/colour/bullets/numbering/clear), math equations, undo/redo, runtime autoplay/manual nav, Preview/Reader/Publish/Republish, persistence-after-reload, long-text/overflow visuals, contrast/a11y |

Automated TCs: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
26, 29, 30, 31, 32, 33, 34, 35, 37, 39, 48, 49, 51, 52, 56, 57, 58.

## Why these deferrals

Carousel is an **image/media-heavy** widget. QC TC_01–TC_09 cover login →
create activity → start authoring → add Generic Step (environment/harness
bootstrap, not the Carousel element). The bulk of the remaining cases assert
**rendered media**, a **rich-text formatting overlay** (bold/italic/underline,
text colour, bullets/numbering, math equations) that is not part of the authoring
settings panel DOM, **runtime autoplay/navigation**, **Preview/Reader/Publish**
lifecycle, **persistence after reload**, and **accessibility/contrast** — all
outside the authoring DOM. **Image/video upload** requires the OS file picker.
All deferrals are `it.skip()` with explicit reasons in the spec and
`carousel-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/carousel/28-carousel-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> **Not yet live-verified** against a running authoring instance — selectors are
> source-derived from the templates above. A single run will confirm the element
> drop onto the canvas, the `#Slideshow-settings-panel` selectors, and the
> add/delete-slide count limits.
