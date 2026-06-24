# Image Labeling (image-label-number element) — Deep Automation

- **Component slug:** `image-labeling`
- **dataType:** `imagelabelling` · **widget name:** `Image Labeling` · **directive:** `labelling-template`
- **Spec:** `35-image-labeling-deep.spec.ts`
- **QC authority:** `Author Test Cases - Image labeling.pdf` (TC_01–TC_12)
- **Source authority:**
  - `config/config.js` (widget catalog: `name: "Image Labeling"`, `dataType: "imagelabelling"`, `iconClass: "icon-Image-labelling_number-01"`)
  - `templates/image-label-number/image-labelling-number.html`
  - `templates/image-label-number/image-labelling-number-setting.html`
  - `templates/image-label-number/default/image-labelling-number.json`
  - `templates/image-label-number/scripts/image-labelling-number.js` (`maxCounter = 20`)
  - `templates/stylepanel.html`

> ⚠️ **Not yet live-verified.** Selectors are **source-derived** from the
> templates above and have **not** been run against a live authoring instance.
> A single headed run is required to confirm the canvas drop, the
> `.componentSettingPanel .img-label-setting.imgLabel` mount, and the visibility
> toggle classes. Treat the automated/deferred split as the intended contract
> until confirmed.

## dataType discrepancy (resolved)

The QC catalog (`image-labeling-testcases.json`) tentatively listed
`dataType: "imageLabeling"`. The **verified** value from `config/config.js` is
**`imagelabelling`** (lower-case, double-L), with widget `name: "Image Labeling"`.
The verified value is used throughout selectors/commands/config.

## Element vs assessment widget (drop mechanism)

Image Labeling is an **element**, not an assessment widget. `imagelabelling` is
**not** in `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so
`resolveDropTarget` returns `'canvas'`. The component is dropped onto the
**Instructions-for-Students** page (`#desktop_view`) via the existing
`cy.dropComponent('Image Labeling')` primitive (which matches the catalog widget
by `name` and injects it onto the unrestricted canvas). It is **not** dropped
into a Generic Step column.

`cy.ensureImageLabelingDeepSetup` mirrors the Text sibling's setup contract
(`navigateToCanvasPage` + `dropComponent`).

## Architecture notes (source-verified)

- Canvas wrapper: **`.imageLabelling.component-holder[labelling-template]`**.
- Editable fields (contenteditable; `ng-model` on `fieldData.*`): Header
  **`#introductionInput`**, Instruction **`#instructionInput`**, Question
  **`#questionInput`**, Caption **`#captionInput`** — set via
  **`cy.setContentEditableOn`**, never `cy.type()`.
- Header/Instruction visibility is toggled by **`.displayBlock` / `.displayNone`**
  on `.header-text.sc-intro-holder` / `.instruction-text.sc-instr-holder`
  (driven by `settings.isHeaderVisible` / `isInstructionVisible`).
- Settings panel: ng-included into shared **`.componentSettingPanel`**,
  identified by **`.img-label-setting.imgLabel`**; title **"Image Labeling"**,
  icon `.icon-Image-labelling_number-01`.
- Label **TYPE** radios: **`#with-Text`** (Text) / **`#with-Number`** (Numbers,
  default checked) — `ng-model="currSettings.isNumber"`.
- Visibility toggles: **`#header-visibility`**, **`#instr-visibility`**,
  **`#caption-visibility`**. **Show Arrow**: `#show-arrow-checkbox` (text mode) /
  `#show-arrow-checkbox-properties` (number mode), gated by
  `media.dimensionpanel`.
- Outline radios `input[name="outline"]` (`outline`/`outlineBg`) and the
  action-asset colour picker `.colorPickerInputBox` render only when
  `!isGroupActivity`. Tags via **`<tag-manager tags="currSettings.metaTag">`**
  in `.tagsContainer`.
- **Labels** are created at **runtime** by clicking the uploaded image area
  (`scope.addLabel`; **`maxCounter = 20`**). They render via
  `ng-repeat="option in fieldData.settings.media.labelInfo"` as
  `.number-Container` / `.label_text` / `.Text-Container` pins. The default
  `labelInfo[]` is empty.
- Image upload/replace via **`#upload-comp-img`** (`uploadfiles` directive) → OS
  file picker; alt-text `maxlength = 50`.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 7 | Drop + settings panel/title/icon, label-type radios + default (TC_04), Show Instruction (TC_06) + Show Header (TC_08) toggles, Show Arrow presence (TC_07), style panel presence (TC_09), tags manager (TC_10), special-char content entry (TC_11), plus outline/colour, label-container/max, copy/delete, and security checks |
| Deferred | 5 | Image upload/dimension/replace via OS picker (TC_01, TC_02, TC_12), 20→21 label boundary + per-type pin rendering via runtime image clicks (TC_03, TC_04 visual), settings-fixed-on-scroll visual (TC_05); plus label drag, Preview/Reader, persistence, a11y |

> Honest split: TC_04, TC_06, TC_07, TC_08, TC_09, TC_10, TC_11 are automated as
> DOM/settings assertions (7 QC IDs). TC_01, TC_02, TC_03, TC_05, TC_12 are
> deferred (5 QC IDs). Each TC_01–TC_12 appears exactly once in
> `image-labeling-mapping.json`.

## Why these deferrals

- **TC_01 / TC_02 / TC_12** — image upload, extension validation, and image
  replacement all go through the **OS file picker** and server-side image
  handling, outside the authoring DOM.
- **TC_03** — adding labels up to 20 and restricting the 21st requires
  **runtime clicks on the uploaded image** (`scope.addLabel`). The source
  maximum (`maxCounter = 20`) is asserted from the code; live boundary behaviour
  needs an image + interaction.
- **TC_04 (visual portion)** — the type **radios** and default are automated,
  but verifying that **created pins** display the correct Text/Number form needs
  runtime label creation.
- **TC_05** — settings-panel-stays-fixed-on-scroll is a **visual/layout**
  assertion best validated interactively.
- Label **drag**, **Preview/Reader** drag-drop matching, **persistence after
  reload**, and **accessibility** are runtime/out-of-DOM flows.

All deferrals are `it.skip()` with explicit reasons in the spec and
`image-labeling-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/image-labeling/35-image-labeling-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
