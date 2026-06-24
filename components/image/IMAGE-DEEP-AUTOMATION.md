# Image (element) — Deep Automation

- **Component slug:** `image`
- **dataType:** `image` · **directive:** `image-template`
- **Spec:** `08-image-deep.spec.ts`
- **QC authority:** `Author Test Cases - Image.pdf` (TC_01–TC_25)
- **Source authority:**
  - `templates/image.html`
  - `templates/image/image-settings-pannel.html`
  - `templates/image/image.json`
  - `templates/uploadimagepopup.html`

## Drop mechanism (verified)

Image is an **ELEMENT**, not an assessment widget. `image` is **not** in
`support/module-setup.ts` → `ASSESSMENT_DATA_TYPES`, so `resolveDropTarget()`
routes it to the **`canvas`** target. The setup therefore:

1. `cy.openAuthoringTool()` (existing helper)
2. `cy.navigateToCanvasPage()` — the Instructions for Students page, which has an
   unrestricted canvas (Generic Step pages block element drops via
   `onDropComplete()`).
3. `cy.dropComponentForModule('Image', { dataType: 'image' })` → `cy.dropComponent()`
   (AngularJS scope injection of the matched widget onto `#desktop_view`).

The component is wrapped in `section.Imagecomponent[image-template]`
(`.imageTemplateMainDiv`). Clicking it opens the shared **`.componentSettingPanel`**
(see `index.html`), into which the image settings body is `ng-include`-d and
identified by `.imagesetting[heading-setting]` / `data-title="Image"` /
`.video-settings-panel2`. The existing `cy.openComponentSettings` primitive keys
off `.componentSettingPanel`; `cy.openImageSettings` reuses the same panel and
additionally asserts the image-specific body.

> **ASSUMPTION (documented):** the Components-panel widget name is `"Image"` with
> dataType `"image"`. `dropComponentForModule` matches by name first, then
> dataType, so passing both is robust if the display name differs in a build.

## Architecture notes (source-verified)

- Default `styleSelected` is **`style1`** (`image.json`), so **Show Header**,
  **Outline / Fill** radios and the **colour picker** render. Outline radios and
  colour options exist **only for `style1`**; the spec degrades gracefully if a
  build renders a different style.
- Dimension inputs `#imgWidthc` / `#imgHeightc` are **ng-disabled** while
  `imageDim == 'qq129'` (**Keep Original**, the default) and while
  `imageUploadOrReplace == 'Upload'`. Actual resize needs an uploaded image plus
  the custom-dimension radio `#qq128`, so resize verification is **deferred**.
- **Alt Text** textarea enforces `maxlength=2000` with a `Chars 2000` counter
  (`.altTextCharLimitText`).
- Image **upload** uses the native popup **`#uploadimagepopup`** → **"My Computer"**
  (OS file picker). Cypress cannot drive the OS file dialog from the authoring
  DOM, so all real-upload, invalid-file and oversized-file cases are **deferred**.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 13 | Launch + drop + settings panel, upload-box presence, dimension toggles, caption add + Show-Caption toggle, outline/fill + colour, ALT text + maxlength, styles, tags, security |
| Deferred | 12 | Generic-Step setup steps not applicable to the element (TC_04–TC_09), real file upload + invalid format (TC_11), publish/Reader rendering & republish lifecycle (TC_19–TC_23) |

### Automated → QC
TC_01, TC_02, TC_03, TC_10 (presence only), TC_12, TC_13, TC_14, TC_15, TC_16,
TC_17, TC_18, TC_24, TC_25.

### Deferred → QC
TC_04, TC_05, TC_06, TC_07, TC_08, TC_09, TC_11, TC_19, TC_20, TC_21, TC_22, TC_23.

## Why so many deferrals

The Image suite is **upload- and Reader-centric**: roughly half the QC cases
require selecting a real file through the native OS file picker (which Cypress
cannot automate from the page) or verifying rendering in the published Reader.
TC_04–TC_09 describe a Generic Step **assessment** flow that does not apply to
the Image element (which drops directly on the Instructions canvas). All of these
are marked `it.skip()` with explicit reasons in the spec and `image-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/image/08-image-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ Not yet live-verified against a running authoring instance — selectors are
> source-derived from the templates above. A single run will confirm the
> element drop, the `.componentSettingPanel` open, and the settings-body
> selectors.
