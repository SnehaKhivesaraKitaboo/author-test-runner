# Situation Header (situationbox element) — Deep Automation

- **Component slug:** `situation-header`
- **dataType:** `situationbox` · **widget name:** `Situation Header` · **directive:** `situationbox` (restrict `EA`)
- **Spec:** `24-situation-header-deep.spec.ts`
- **QC authority:** `Author Test Cases - Situation Header.pdf` (TC_01–TC_54)
- **Source authority:**
  - `config/config.js` (catalog entry: `name: "Situation Header"`, `dataType: "situationbox"`)
  - `templates/situation-box/situation-box.html`
  - `templates/situation-box/situation-box-settings.html`
  - `templates/situation-box/default/situation-box.json`
  - `templates/situation-box/scripts/situation-box-directive.js`
  - `templates/situation-box/styles/situation-box.css`

## Element vs assessment widget (drop mechanism)

Situation Header is an **element**, not an assessment widget. `situationbox` is
**not** in `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, and `config.js`
places "Situation Header" in the same general elements catalog group as
Text / Image / Video / Callout Box. Therefore `resolveDropTarget` returns
`'canvas'`, and the component is dropped onto the **Instructions-for-Students**
page (`#desktop_view`) via the existing `cy.dropComponent('Situation Header')`
primitive (which matches the catalog widget `{ name: "Situation Header",
dataType: "situationbox" }` by name and injects it onto the unrestricted
canvas). It is **not** dropped into a Generic Step column.

`cy.ensureSituationHeaderDeepSetup` mirrors the Text sibling's setup contract:
`cy.navigateToCanvasPage()` + `cy.dropComponent('Situation Header')`.

> **QC note (TC_05):** the QC describes the component as enabled "only for
> Generic and Multipart Question step types". That gating is **config-driven**
> in `config.js` (per-layout `situationbox` flags). The authoring DOM only
> exposes the resolved/allowed catalog, so the spec verifies **presence on the
> allowed page** rather than enumerating disallowed step types.

## Architecture notes (source-verified)

- Canvas wrapper: **`div[situationbox].situation-box-container`** — a purple box
  (inline `background-color: #f3ecfe` → `rgb(243,236,254)`, `border-radius:16px`).
- **Fixed arrow icon:** `.situation-box-arrow-image-container img`
  (`src="images/arrow.svg"`, `draggable="false"`). The container sets
  `pointer-events:none` and `user-select:none`, so the icon is
  **non-editable / non-draggable / non-selectable** and **protected from
  deletion**. The component itself (its `sd-item`) is still copyable/deletable
  via the shared canvas chrome (`.duplicate-widget-icon` / `.icon-Delete`).
- **Authoring text area:** `.situation-box-text-editor` — a contenteditable RTE
  bound to `ng-model="fieldData.textArea"` (also `.math-read-only-field` for
  math). Set via **`cy.setContentEditableOn`**, never `cy.type()`.
- **Settings panel:** the `situation-box-settings.html` body loads into the
  shared **`.componentSettingPanel`**. It contains the title **"Situation
  Header"** (`.txt-set-title .para-ellipsis`) with **`.icon-Situationbox`**, an
  **Accessibility** label + `.accessibilityPara` subtext, and an **Alt Text**
  `textarea[ng-model="currSettings.altText"]` (`maxlength=2000`, counter
  **"Chars 2000"**). There are **no** style/colour/visibility toggles in this
  settings body beyond Alt Text.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 20 | Drop/placement, fixed-icon behaviour (non-editable / non-draggable / no handles / not deletable / paste-safe), text + paragraph entry, default purple background, settings title/icon/accessibility/alt-text + 2000-char contract, copy/delete lifecycle controls, security |
| Deferred | 34 | Login/activity bootstrap (TC_01–TC_03), math-editor render (TC_20/21/24/34/35/51), floating formatting toolbar (TC_29–TC_33, TC_50), Preview/Reader/Publish (TC_14/23/39–TC_48), persistence-after-reload (TC_13/22/37/38), responsiveness/cross-browser (TC_44–TC_46), no-scroll layout (TC_36), char limit (TC_53), unsaved-changes dialog (TC_54) |

## Why these deferrals

QC TC_01–TC_03 cover **login → create activity → start authoring** — harness
bootstrap handled by `cy.openAuthoringTool`, not assertions on the component.
The bulk of the remaining deferrals require flows outside the authoring DOM:
the **math editor** render/validation, the **floating `textEditor.html`
formatting toolbar** (bold/italic/underline/lists, mounted on focus as an
overlay — not reliably present headless), **Preview / Reader / Publish**,
**persistence after reload**, **responsiveness / cross-browser**, and
**character-limit warnings**. All are `it.skip()` with explicit reasons in the
spec and `situation-header-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/situation-header/24-situation-header-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from the templates above. A single run will confirm the
> element drop onto the canvas, the fixed-icon assertions, and the
> `.componentSettingPanel` alt-text selectors. In particular, the settings panel
> body has no dedicated `id` in source, so it is targeted via the shared
> `.componentSettingPanel` container; if the build wraps it differently, only the
> settings-suite selectors would need adjusting.
