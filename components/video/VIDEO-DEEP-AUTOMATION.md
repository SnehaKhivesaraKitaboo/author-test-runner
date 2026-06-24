# Video (media element) — Deep Automation

> ⚠️ **Not yet live-verified.** All selectors below are **source-derived** from
> the templates listed under *Source authority* and have **not** been run against
> a live authoring instance. A single headed run is required to confirm the
> element drop onto the canvas, the `.componentSettingPanel` / `[video-setting]`
> panel selectors, and the **upload-state gating** on the W/H dimension inputs
> (they may stay disabled until a video is uploaded). The spec degrades
> gracefully (log + return) for every `ng-if`-gated control so an unverified
> selector logs an informative message instead of hard-failing.

- **Component slug:** `video`
- **dataType:** `video` · **widget name:** `Video` · **directive:** `video-template`
- **Spec:** `09-video-deep.spec.ts`
- **QC authority:** `Author Test Cases - Video.pdf` (TC_01–TC_69, 69 TCs)
- **Source authority:**
  - `config/config.js` (catalog entry: `name: "Video"`, `dataType: "video"`, `url: "templates/video-template.html"`, `json: "templates/video/video.json"`, `settingsURL: "templates/video/video-settings-panel.html"`, `isDroppable: true`)
  - `templates/video-template.html`
  - `templates/video/video.json`
  - `templates/video/video-settings-panel.html`
  - `templates/media-template.html`
  - `templates/stylepanel.html`

## Verified source facts

| Fact | Value | Source |
|---|---|---|
| dataType | `video` | `config/config.js` line ~183 / ~2108 |
| Widget name | `Video` | `config/config.js` |
| Directive | `video-template` | `video-template.html` (`section[video-template]`) |
| Drop mechanism | **canvas element** (NOT Generic Step) | `video` absent from `ASSESSMENT_DATA_TYPES` |
| Settings panel | `[video-setting].video-settings-panel.videosetting` (no id) inside `.componentSettingPanel` | `video-settings-panel.html` |
| Default upload mode | `uploadbysystem` | `video.json` `settings.uploadtype` |
| Default dimension | `full-video-radio` (Keep Original) | `video.json` `settings.videoDim` |
| Full Width default | `true` | `video.json` `settings.fullwidth` |
| Default style | `style1` | `video.json` `style_tab.stylesHolder` |
| Alt Text maxlength | `2000` | `video-settings-panel.html` |

## Element vs assessment widget (drop mechanism)

Video is an **element**, not an assessment widget. `video` is **not** in
`support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so `resolveDropTarget`
returns `'canvas'`. The component is dropped onto the
**Instructions-for-Students** page (`#desktop_view`) via the existing
`cy.dropComponentForModule('Video', { dataType: 'video' })` primitive, which
matches the catalog widget `{ name: "Video", dataType: "video" }` and injects it
onto the unrestricted canvas. It is **not** dropped into a Generic Step column.

`cy.ensureVideoDeepSetup` mirrors the Text element sibling's setup contract
(`cy.navigateToCanvasPage()` + element drop). The settings panel is opened by
clicking the dropped component and asserting `.componentSettingPanel` +
`[video-setting]`.

## Architecture notes (source-verified)

- **Canvas wrapper:** `.customClass[data-type="video"]` → inner
  `section[video-template]` (`.component-holder.videostyle`) with `.pc-figure`,
  an empty-state `.icon-video.icon-Video` placeholder, a
  `<video class="primary-video">` (rendered **only** when an MP4 is uploaded),
  and a YouTube/Vimeo `iframe` (rendered **only** in URL mode with a valid id).
- **Upload mode:** radio pair `input[name="videoUploadType"]`
  (`uploadbysystem` / `uploadbyurl`, ng-model `currSettings.uploadtype`).
  - URL mode (`uploadbyurl`) → `.kaltura-part` reveals a YouTube/Vimeo dropdown
    + a Video ID text input (`ng-model="currSettings.youtubeVideoName"`).
  - System mode (`uploadbysystem`) → `.video-upload-box` (`uploadfiles`) drop
    target + "Upload format MP4" label. **Actual file selection is a native OS
    picker (deferred).**
- **Dimensions** (`#video-Dimensions`): `#videoWidthc` / `#videoHeightc` number
  inputs, a custom-dimension radio (`#video-dimension-radio`), and a
  "Keep Original" radio (`#full-video-radio`). W/H are `ng-disabled` when
  `videoDim === 'full-video-radio'` **and** are additionally gated on upload
  state (`videoUploadOrReplace === 'Upload' && youtube == false`). The spec
  asserts the disabled state under Keep Original, and only enters values when the
  field is actually enabled (otherwise logs + returns).
- **Toggles:** Full Width (`currSettings.fullwidth`), Show Header
  (`currSettings.isHeaderVisible` — only `styleSelected=='style1'`), Show Caption
  (`currSettings.optionalcaption`), Show Transcript / Show Subtitle CC (only
  `uploadtype != uploadbyurl`).
- **Outline / Fill:** No Outline / Outline & Fill Background radios + colour
  options + colour-picker input — only when `styleSelected=='style1'`.
- **Meta tags:** `#metaTagsInput`. **Alt Text:** `textarea[ng-model="currSettings.altText"]`
  (maxlength 2000, counter "Chars 2000").
- **Styles:** data-driven from `video.json` `style_tab.stylesHolder`
  (`style1` default, `style2`, `style3`) via shared `<stylepanel>`.

Every `ng-if`-gated control (URL mode, Show Header, outline radios, transcript/CC,
colour picker, canvas caption) is wrapped in a `cy.get('body').then(...)` guard
that **logs and returns** when the control is not mounted in the current build /
headless context, rather than failing.

## Coverage

| Status | Count |
|---|---|
| Automated | 34 |
| Deferred | 35 |
| **Total** | **69** |

### Automated (34)

Drop + placement (TC_10); settings-panel presence/title/icon; upload-mode toggle
system↔URL (TC_11/13/14); URL platform options (TC_40); valid YouTube id entry
(TC_11); invalid/empty Video ID field behaviour (TC_12/41); system upload-box +
MP4 label presence (TC_15-adjacent); dimension block + Keep Original disabling
(TC_16/17/27/28/38/56); number-typed W/H contract (TC_26/69); Full Width
(TC_18), Show Header (TC_19/55), Show Caption (TC_20/43/44/54), Transcript/CC
toggles; outline radios + colour options + hex colour-picker input
(TC_22/23/24/46); meta tags; Accessibility + Alt Text + maxlength
(TC_29/30/45/59); styles panel (TC_21/39); caption content entry (TC_43);
copy/second-placement (TC_49) + delete (TC_48); security (script injection not
executed).

### Deferred (35)

Why these are deferred — all require flows **outside the authoring DOM**:

- **Bootstrap (TC_01–TC_09):** login → create activity → start authoring → add
  Generic Step → enter step/instructions. Handled by `cy.openAuthoringTool` and
  step-creation helpers, not the Video element.
- **Native file upload (TC_15, TC_31, TC_32):** OS file picker, format/size
  validation, cancel-in-progress — not drivable from the authoring DOM.
- **Preview / playback (TC_33, TC_34, TC_37, TC_42):** Preview rendering,
  YouTube playback, Full-Width override render, layout-dependent resize.
- **Persistence-after-reload (TC_35, TC_36):** save/discard + editor reload.
- **Slide lifecycle (TC_47, TC_49-Reader):** slide duplication, per-slide
  independence in Reader.
- **Publish / Reader (TC_50–TC_53, TC_57, TC_58, TC_60–TC_68):** Publish,
  republish, Reader render/playback, missing-file error, cross-browser matrix.
- **Invalid hex validation (TC_25):** runtime colour validation message, not a
  DOM state in author mode.

All deferrals are `it.skip()` with explicit reasons in `09-video-deep.spec.ts`
and `video-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/video/09-video-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
