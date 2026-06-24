# Sample Layer / TIG Panel — Deep Automation

- **Component slug:** `sample-layer-tig`
- **dataType (VERIFIED):** `layer-2` · **directive:** `sample-layer-template`
- **Spec:** `40-sample-layer-tig-deep.spec.ts`
- **QC authority:** `Author Test Cases - Sample Layer _TIG Panel.pdf` (TC_01–TC_108)
- **Source authority:**
  - `config/config.js` — `{ "name":"Sample Layer", "dataType":"layer-2", "url":"templates/sampleLayer/sample-layer.html" }`
  - `templates/sampleLayer/sample-layer.html`
  - `templates/sampleLayer/sample-layer-setting-panel.html`
  - `templates/sampleLayer/default/sampleLayer.json` (identifier `layer-2`)
  - `templates/sampleLayer/scripts/sample-layer-directive.js`
  - `templates/sampleLayer/scripts/sample-layer-preview1.js` (Reader/CLP runtime)
  - `templates/sampleLayer/styles/sample-layer-template.css`

> ⚠️ **dataType correction:** the QC catalog JSON claims `dataType: "sample-layer"`.
> The authoritative widget catalog (`config.js`) registers the component with
> **`dataType: "layer-2"`** (name "Sample Layer"). All automation uses `layer-2`.

## Architecture notes (source-verified)

- **Sample Layer is a LAYER CONTAINER, not an assessment widget.** `config.js`
  sets `GenericStep["layer-2"] = true`, so it is dropped **into a Generic Step
  column** (like a layout). It is intentionally **not** added to
  `support/module-setup.ts` `ASSESSMENT_DATA_TYPES` (no files outside this
  component folder were modified). The drop is performed explicitly via
  `cy.dropWidgetIntoGenericStep('Sample Layer', col, 'layer-2')` inside
  `ensureSampleLayerDeepSetup`. Assessment widgets/elements are then dropped
  **inside** the layer's own `.column-content.layer-box` drop zones.
- **Pink "Sample Answers: On" banner (authoring, DOM-assertable).** The directive
  builds `tagDataCollection = [{ tagBlockName:"Sample Answers", tagValues:["Off","On"],
  tagColor:"#C91CA5", defaultvalue:"On" }]`, rendered as
  `.sample-main-layer .tagBlockName` → text **"Sample Answers: On"** with a pink
  (`#C91CA5`) background. The directive also stamps
  `data-sampletaginfo='{"Sample_Answers":"On"}'` on the layer element.
- **Pink container outline (authoring, DOM-assertable).**
  `.sample-layer-container { border: 1px solid #C91CA5 }` →
  computed `rgb(201, 28, 165)`.
- **Settings panel** is `#sample-layer-template-setting` (title **"Sample Layer"**).
  The Sample Answers toggle radios are `value="Off"` / `value="On"` bound to
  `currSettings.TagClolorData[i].defaultvalue`; the **"Off" radio is `ng-disabled`**
  by source contract. Note: these radios depend on `TagClolorData` being populated
  on the settings scope — the spec degrades gracefully (log + return) when the
  tag block is empty in a given build, since the banner state in Suite B already
  proves the default "On" state.
- **Runtime-only behaviour (deferred).** The actual pink colouring of sample
  ANSWERS (FIB blanks, Extended Response text, MCQ correct option, Table text,
  math equations), the **TIG (teacher instructional guide) panel**, scroll bars,
  and outline-hiding are all applied by `sample-layer-preview1.js` at **Reader /
  CLP teacher-review runtime** — not in the authoring DOM.

## Coverage (honest split)

| Status | Count | Notes |
|---|---|---|
| Automated | 15 | Drop into Generic Step, pink banner + `data-sampletaginfo` default, pink container border, settings panel + title, On/Off toggle presence/disabled contract, toggle Off state, inner drop zones, multiple layers, security |
| Deferred | 93 | Studio activity-creation flow, Author support content, copy/paste layout lifecycle, Publish, Saltire/CLP teacher review (sample answers, TIG panel, scroll, math/answer pink colour, outline-hide), persistence-after-reload, Preview/Reader rendering, a11y |

### Automated test cases

`TC_36, TC_37, TC_49, TC_53, TC_54, TC_55, TC_56, TC_57, TC_63, TC_64, TC_65,
TC_72, TC_78, TC_81, TC_83`

(Several share an `it()` block — e.g. TC_36/53/56, TC_37/57, TC_65/81/83 — because
they assert the same authoring-DOM fact.)

## Why so many deferrals

The Sample Layer / TIG suite is dominated by **end-to-end CLP flows**: roughly the
first third (TC_01–TC_35) is the Studio activity-creation + Author support-content
wizard (out of this component's authoring-DOM scope), and the last half
(TC_58–TC_108) is **Publish → launch in Saltire as teacher review**, where the
pink sample-answer colouring, TIG panel, and scroll behaviour are produced by the
Reader-side `sample-layer-preview1.js`. Those, plus clipboard copy/paste lifecycle
and persistence-after-reload, are intentionally `it.skip()` with explicit reasons
in the spec and `sample-layer-tig-mapping.json`.

## Run

```bash
npx cypress run --spec "components/sample-layer-tig/40-sample-layer-tig-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors are
> source-derived from the `templates/sampleLayer/` markup, directive, CSS, and
> `config.js`. A single headed run will confirm the drop path (layer-container
> into a Generic Step column) and the settings-panel / banner selectors. In
> particular, the Sample Answers On/Off radios depend on `TagClolorData` being
> populated on the settings scope; if a build leaves it empty, those assertions
> log + return while the default-"On" banner state remains verified.
