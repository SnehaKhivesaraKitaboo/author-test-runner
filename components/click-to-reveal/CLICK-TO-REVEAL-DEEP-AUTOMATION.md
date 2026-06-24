# Click to Reveal (clickToReveal element) — Deep Automation

- **Component slug:** `click-to-reveal`
- **dataType:** `clickToReveal` · **widget name:** `Click to Reveal` · **directive:** `click-to-reveal-template`
- **Spec:** `29-click-to-reveal-deep.spec.ts`
- **QC authority:** `Author Test Cases - Click to Reveal.pdf` (TC_01–TC_113)
- **Source authority:**
  - `config/config.js` (catalog: `name: "Click to Reveal"`, `dataType: "clickToReveal"`, `isDroppable: true`)
  - `templates/clickToReveal/clickToReveal.html`
  - `templates/clickToReveal/clickToReveal-settings.html`
  - `templates/clickToReveal/clickToReveal-media-template.html`
  - `templates/clickToReveal/default/clickToReveal.json`
  - `templates/clickToReveal/scripts/clickToReveal.js`
  - `templates/stylepanel.html`

> ⚠️ **Not yet live-verified.** Selectors are **source-derived** from the
> templates above against a non-running instance. A single headed run against a
> live authoring URL is required to confirm the element drop onto the canvas,
> the `#chapter-heading-settings-panel.click-to-reveal-setting-panel` selectors,
> and the flag/style-gated controls.

## Element vs assessment widget (drop mechanism)

Click to Reveal is an **element**, not an assessment widget. `clickToReveal` is
**not** in `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so
`resolveDropTarget` returns `'canvas'`. The component is dropped onto the
**Instructions-for-Students** page (`#desktop_view`) via the existing
`cy.dropComponent('Click to Reveal')` primitive (which matches the catalog
widget `{ name: "Click to Reveal", dataType: "clickToReveal" }` by name and
injects it onto the unrestricted canvas). It is **not** dropped into a Generic
Step column.

`cy.ensureClickToRevealDeepSetup` mirrors the Text sibling's setup contract
(`cy.navigateToCanvasPage()` + `cy.dropComponent('Click to Reveal')`).

## "Reveal panels" — what is DOM-assertable

The Click to Reveal component is a **single card** (header + instruction +
reveal button + hidden description + optional media). The authoring DOM has **no
per-card "add reveal panel" control**. Therefore "add/remove reveal panels" is
expressed as **drop / copy / delete of the card itself**:

- `cy.addClickToRevealPanel()` drops another Click to Reveal card (QC TC_45).
- Same-button-label-across-cards (QC TC_38) is asserted via per-card
  `.ButtonSpanCTR` nodes (no shared id → no collision).
- `cy.deleteLastDroppedComponent()` (existing helper) removes a card.

## Architecture notes (source-verified)

- Canvas wrapper: **`.clickToReveal`** (`.component-holder` + style classes),
  hosted by the `click-to-reveal-template` directive inside `.customClass` /
  `.sd-item`.
- Header: **`.clickToReveal .sc-intro.editables`** (`ng-model
  fieldData.introduction`, visible when `isHeaderVisible` — default `true`).
- Instruction: **`.clickToReveal .sc-instr.editables`** (`ng-model
  fieldData.instruction`, visible only when `isInstructionVisible` — **default
  `false`**; revealed by the "Show Instruction" checkbox).
- Reveal button: **`button.transcriptTextCorrection`** with editable label
  **`.ButtonSpanCTR`** (`ng-model settings.transcriptText`, default
  **`Read more`**, `maxlength 50`).
- Hidden description: **`.descriptionTextCorrection.editables`** (`ng-model
  fieldData.descriptionText`). All bodies are contenteditable — set via
  **`cy.setContentEditableOn`**, never `cy.type()`.
- Settings panel: shared id **`#chapter-heading-settings-panel`** scoped by
  **`.click-to-reveal-setting-panel`**; title from
  `currSettings.templateName = "Click to Reveal"`.
- Styles: shared **`<stylepanel>`** driven by `style_tab.stylesHolder` →
  **`CTR_Style1`** (default/active), `CTR_Style2`, `CTR_Style3`, `CTR_Style4`.
  Applied layout/visual is a Preview/Reader render check (deferred).
- Settings controls: **Show Instruction** (`#instruction-visibility`),
  **Add Media** (`#add-media`) → Image/Video/Audio radios
  (`input[name="mcq_Media"]`), **Show Caption** (`#Caption-visibility`),
  video **From system / By URL** radios + **YouTube ID** input
  (`input.select-kaltura2`), **Show Transcript / Show Subtitle (CC)** toggles +
  **VTT upload** button, **Placement** icons
  (`#headingOnePlacement .CTRPlacementDiv` — below/above always; left/right for
  image), **Card Properties** colour pickers (Background / Header / Line —
  style-gated; **Outline** toggle + colour), **Button Properties** colour
  pickers (Background / Outline — style-gated; **Text**), **Tags**
  (`.CTR_tag_div input`), **Alt Text** (`textarea maxlength 2000`, label
  "Chars 2000").
- **Flag/style-gated controls** (media radios, video sub-options, Header/Line
  colours, Button Background/Outline colours, placement left/right) only render
  under specific media/style state; the spec **degrades gracefully** (log +
  return) where they are not rendered.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 28 | Drop + default render + settings panel, header/description/button-label content, Show Instruction, Add Media → media radios, Show Caption, image/video/audio upload areas, video Transcript/CC + VTT control, By-URL YouTube ID field, placement icons, card background/outline/button colours, style panel, tags, alt-text (2000) contract, multiple cards + same-label + delete, security |
| Deferred | 85 | Login/activity/step bootstrap (TC_01–TC_09), reveal runtime + Preview/Reader click interaction (TC_12/13/36/48/68/100), media upload via OS file picker (TC_14–16/30/31/43/50–53/56/63/69/71/72/76/79/80/85/86/113), runtime embed/validation (TC_75/77/78/82/96), Save/Publish validation (TC_17/27/28/33/35), colour/input runtime (TC_34/39), Publish/Republish + Reader (TC_98–112), responsive/edge (TC_32/37/84/87–95/97) |

## Why these deferrals

QC TC_01–TC_09 cover **login → create activity → start authoring → add Generic
Step → enter step/instructions** — environment/harness bootstrap, not the
component. The remaining deferrals require flows outside the authoring DOM: the
**reveal animation at runtime** and **Preview/Reader click interaction**, the
**OS file picker** for image/video/audio/VTT upload, **runtime embed/validation**
for YouTube/subtitle handling, **Save/Publish validation messaging**,
**Publish/Republish + Reader** rendering, and **persistence-after-reload**. All
are `it.skip()` with explicit reasons in the spec and `click-to-reveal-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/click-to-reveal/29-click-to-reveal-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
