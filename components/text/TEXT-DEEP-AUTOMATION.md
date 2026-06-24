# Text (paragraph element) — Deep Automation

- **Component slug:** `text`
- **dataType:** `paragraph` · **widget name:** `Text` · **directive:** `paragraph-template`
- **Spec:** `07-text-deep.spec.ts`
- **QC authority:** `Author Test Cases - Text.pdf` (TC_01–TC_40)
- **Source authority:**
  - `config/config.js` (widget catalog entry: `name: "Text"`, `dataType: "paragraph"`)
  - `templates/paragraph/paragraph.html`
  - `templates/paragraph/paragraph_settings.html`
  - `templates/paragraph/default/paragraph.json`
  - `templates/paragraph/scripts/paragraph-directive.js`
  - `templates/stylepanel.html`
  - `templates/textEditor.html`

## Element vs assessment widget (drop mechanism)

Text is an **element**, not an assessment widget. `paragraph` is **not** in
`support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so `resolveDropTarget`
returns `'canvas'`. The component is therefore dropped onto the
**Instructions-for-Students** page (`#desktop_view`) via the existing
`cy.dropComponent('Text')` primitive (which matches the catalog widget
`{ name: "Text", dataType: "paragraph" }` by name and injects it onto the
unrestricted canvas). It is **not** dropped into a Generic Step column.

`cy.ensureTextDeepSetup` mirrors the Extended Response sibling's setup contract
but uses `cy.navigateToCanvasPage()` + `cy.dropComponent('Text')` instead of the
Generic-Step column flow.

## Architecture notes (source-verified)

- Canvas wrapper: **`.customClass[data-type="paragraph"]`** → inner
  `section[paragraph-template]` (`.component-holder.paragraph-select`).
- Main editable body: **`.paragraph-container.editables`** (contenteditable,
  `ng-model="fieldData.header"`) — set via **`cy.setContentEditableOn`**, never
  `cy.type()`.
- Settings panel: **`#text-settings-panel`**, title **"Text"**, icon
  `.icon-Text_Paragraph.settingIcon`.
- Styles are **data-driven** (`style_tab.stylesHolder`); each `<stylepanel>`
  button lives in `.stylebgdiv[id]` where `id` is the source style name:
  `defaultText` (Default, **active by default**), `blockTextParagraph`
  (Block Text), `blockquote` (Quote), `dropCapflag` (Drop Cap), `emphasisText`
  (Emphasis), `buttontext` (Button Text), `buttonBorderText`. Presence and
  selectability are automated; the **visual "applied" result** is a
  Preview/Reader render check (deferred).
- Settings actions: **Upload Image** (`#inline-image`), **Insert Text**
  (`insertInlineText`), **Apply to all** / **Reset changes**, **Show Label
  Type** (Primary/Secondary), **Show Paragraph Number**, **Show Author Name**
  (blockquote only).
- Rich-text formatting (bold/italic/underline, **align**, **math editor**,
  special characters) lives in the floating **`textEditor.html`** toolbar
  (`.editing-container .editor-list`), mounted on focus. The spec **degrades
  gracefully** (log + return) when the overlay is not mounted in headless runs.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 20 | Drop + settings panel, all 7 styles + style-set constraint, content entry, line break, align/math toolbar presence, Upload-Image/Insert-Text/Apply-to-all/Reset controls, label-type/paragraph-number settings, security |
| Deferred | 20 | Login/activity/step bootstrap (TC_01–TC_09), Offline Step (TC_11), file pickers (TC_26), excessive line breaks (TC_28), Preview/Reader/Publish (TC_31–TC_37, TC_40) |

## Why these deferrals

QC TC_01–TC_09 cover **login → create activity → start authoring → add Generic
Step → enter step/instructions** — these are environment/harness bootstrap steps
(handled by `cy.openAuthoringTool` and step-creation helpers), not assertions on
the Text element itself. The remaining deferrals require flows outside the
authoring DOM: an **Offline Step** type (not provisioned here), the **OS file
picker**, **math-equation rendering**, **Preview/Reader/Publish**, and
**persistence after reload**. All are `it.skip()` with explicit reasons in the
spec and `text-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/text/07-text-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> Not yet live-verified against a running authoring instance — selectors are
> source-derived from the templates above. A single run will confirm the
> element drop onto the canvas + the `#text-settings-panel` selectors.
