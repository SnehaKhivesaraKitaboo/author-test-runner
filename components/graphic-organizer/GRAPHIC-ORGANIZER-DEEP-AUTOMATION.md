# Graphic Organizer (Image-based) — Deep Automation

- **Component slug:** `graphic-organizer`
- **dataType:** `graphicOrganizerImageHotSpot` · **widget name:** `Image GO` · **directive:** `graphic-organizer-template`
- **Spec:** `33-graphic-organizer-deep.spec.ts`
- **QC authority:** `Author Test Cases - Graphic Organizer (Image-based) .pdf` (TC_01–TC_77)
- **Source authority:**
  - `config/config.js` (widget catalog entry: `name: "Image GO"`, `dataType: "graphicOrganizerImageHotSpot"`)
  - `templates/graphic-organizer/graphic-organizer.html`
  - `templates/graphic-organizer/graphic-organizer-image-setting.html`
  - `templates/graphic-organizer/default/graphic-organizer.json`
  - `templates/graphic-organizer/scripts/graphic-organizer.js`

> ⚠️ **Not yet live-verified.** Selectors are **source-derived** from the templates
> above and have not been confirmed against a running authoring instance. A single
> headed run is required to confirm the canvas drop, the `.graphic-organizer-setting`
> panel selectors, and the per-hotspot ("Text Input") form (which only mounts after a
> hotspot is selected via `showSetting`). The per-hotspot tests therefore guard every
> selector with a presence check and **log + return gracefully** when the flag-gated
> form is not mounted.

## Verified component facts (source of truth)

- **dataType `graphicOrganizerImageHotSpot`** and **name `Image GO`** confirmed in
  `config/config.js` (`url: templates/graphic-organizer/graphic-organizer.html`,
  `settingsURL: templates/graphic-organizer/graphic-organizer-image-setting.html`).

## Element vs assessment widget (drop mechanism)

Image GO is an **element**, not an assessment widget. `graphicOrganizerImageHotSpot`
is **not** in `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so
`resolveDropTarget` returns `'canvas'`. The component is dropped onto the
**Instructions-for-Students** page (`#desktop_view`) via the existing
`cy.dropComponent('graphicOrganizerImageHotSpot')` primitive — which matches the
catalog widget by **name or dataType** and injects it onto the unrestricted canvas.
It is **not** dropped into a Generic Step column.

`cy.ensureGraphicOrganizerDeepSetup` mirrors the Text sibling's canvas-drop contract
(`cy.navigateToCanvasPage()` + `cy.dropComponent(...)`), then optionally adds a
hotspot (`through: 'hotspot'`).

## Architecture notes (source-verified)

- **Canvas wrapper:** `.graphicOrganizerContainer.graphicOrganizerImageHotSpot.component-holder`
  (attr `graphic-organizer-template`). Base image is `#goImage`.
- **Add HotSpot:** `button.hotspotBtn` → `scope.addHotSpot` pushes a hotspot object
  onto `fieldData.settings.inputBox`. Each hotspot renders as `.inputDiv.hotspotDiv{n}`
  containing `.hotspotTextarea` (contenteditable, `ng-model hotspot.inputAnswer`), a
  delete icon `.hotspotTextarea-delete.icon-Delete` (`scope.deleteTextarea` splices
  `inputBox`), and a move handle `.labelDiv-Drag-Icon.icon-Move`. New-hotspot defaults:
  `bgColor #FEFFFF`, `outlineColor #1E1E1E`, `height 10%`, `width 25%`.
  **Hotspots are DOM-assertable** (add / delete / multiple / input).
- **Settings panel:** `.graphic-organizer-setting.imgLabel` (title **"Graphic
  Organizer"**, icon `.icon-Image-labelling_number-01`). It has **no unique id**
  (unlike `#text-settings-panel` / `#shortLongAns-setting`), so selectors are
  class-scoped.
- **Label type:** `#label-visibility` (`ng-model currSettings.isLabelTypeIamge`)
  reveals Primary/Secondary radios; the question label fields
  (`.questionNoText` / `.questionNoSecondaryText`) render on the canvas only when
  `isLabelTypeIamge`.
- **Per-hotspot "Text Input" settings** (`showTextSetting`, rendered only after a
  hotspot is selected via `scope.showSetting`): Lock for Student, Input Answer,
  Header Label, Character Limit checkbox + number (number input is `ng-disabled`
  until the checkbox is checked), Apply for all Input, Background / Outline colour
  swatches (`.bgr-style`), Enable Advanced Formatting (`#isjoditEnabled`), Alt Text
  (`maxlength 2000`).
- **Image upload:** `#upload-comp-img` (Upload mode) and the in-canvas Replace button
  use the **media/OS picker** — control presence is automated, file selection is
  deferred. **Hotspot drag/move + resize** are jQuery-UI runtime behaviours (deferred).

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 26 | Drop + placement, settings panel open/title/icon, Add HotSpot visible/add/multiple, hotspot delete + move-handle presence, hotspot text entry/clear, label-type radios, upload/replace control presence, per-hotspot input/header-label/char-limit/apply-all, background/outline swatches, lock-for-student, advanced-formatting + alt-text 2000 contract, security |
| Deferred | 51 | Login/activity/step bootstrap (TC_01–03, 06–13, 28), base-image media picker + replace (TC_29, 39), runtime char-limit typing (TC_34), Save (TC_40), Preview (TC_41–42, 44–54), Publish (TC_55), Reader (TC_56–67), Instructor evaluation (TC_68–75), a11y/runtime visuals (TC_76–77) |

## Why these deferrals

This component is **image-heavy**, so the honest automated/deferred split skews
toward deferred. The QC catalog front-loads **login → create activity → start
authoring → add step → enter instructions** (TC_01–TC_13, TC_28) — environment/
harness bootstrap, not assertions on the Image GO element. The base-image upload and
replace depend on the **media/OS picker**; hotspot **drag/move + resize** are
jQuery-UI runtime interactions; and the long tail (TC_40–TC_77) covers **Save,
Preview, Reader, Publish, Instructor evaluation, persistence-after-reload** and
**accessibility/visual** checks that live outside the authoring DOM. All are
`it.skip()` with explicit reasons in the spec and `graphic-organizer-mapping.json`.

Every TC_01–TC_77 appears exactly once in `graphic-organizer-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/graphic-organizer/33-graphic-organizer-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
