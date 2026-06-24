# HTML Interactivity — Deep Automation

- **Component slug:** `html-interactivity`
- **dataType:** `html-interactivity` · **directive:** `htmlinteractivity-template`
- **Widget name:** `HTML Interactivity`
- **Spec:** `37-html-interactivity-deep.spec.ts`
- **QC authority:** `Author Test Cases - HTML Interactivity.pdf` (32 TCs)
- **Source authority:**
  - `config/config.js` (widget catalog)
  - `templates/htmlInteractivity/html-interactivity.html`
  - `templates/htmlInteractivity/html-interactive-settings-panel.html`
  - `templates/htmlInteractivity/default/html-interactivity.json`
  - `templates/htmlInteractivity/scripts/html-interactive-directive.js`
  - `templates/stylepanel.html`

## ⚠ dataType discrepancy (resolved)

The QC catalog `html-interactivity-testcases.json` records **`dataType: "htmlInteractivity"`**
(camelCase, matching the template *folder* name). The **source of truth** —
`config/config.js`, the directive attribute (`data-htmlinteractivity-template`),
and the default JSON — all use **`html-interactivity`** (hyphenated). The
automation uses **`html-interactivity`**.

## ⚠ What this component actually is

Despite the "embed HTML / iframe" framing, the real HTML Interactivity component
is a **HTML-package (.zip) uploader**. The uploaded package is rendered inside an
`<object data="{{fieldData.indexLink}}">` (Popup or Inline). There is **no
author-facing free-text HTML snippet / `srcdoc` source editor** in the source
templates. The authoring DOM exposes: a zip upload box, Show Interactivity
(Popup/Inline) radios, Show Header / Show Caption checkboxes, No Outline /
Outline & Fill Background radios + colour picker, style thumbnails (style1/style2),
a Tags input, and an Accessibility Alt Text field (maxlength 2000).

## Architecture notes (source-verified)

- **Element, not assessment widget.** `html-interactivity` is absent from
  `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so `resolveDropTarget`
  routes it to the **canvas**. It drops onto the **Instructions-for-Students**
  page (`#desktop_view`) via `cy.dropComponent('HTML Interactivity')` — **not**
  into a Generic Step column. (This mirrors the `text`/paragraph element.)
- **Dropped wrapper** is `.htmlStyleSet` (active style class + `ng-style`
  width/height/background); inner holder is
  `.html-interactivity.component-holder[data-htmlinteractivity-template]`.
- **Editable fields** (`.sc-intro.template-header`, `.sc-instr.template-instruction`,
  `.imgCaption.template-caption`) are contenteditable and gated by
  `settings.isHeaderText / isInstructionText / isCaptionText` — set via
  `cy.setContentEditableOn`, never `cy.type()`.
- **Settings panel** `#html-interactive-settings-panel`, title "HTML Interactivity",
  icon `.icon-HTML-Interactivity`. Outline & colour swatches appear after
  selecting "Outline & Fill Background".

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 22 | Drop/placement, upload-control presence, Show Header/Caption toggles, outline + background colour, header/caption text (heavy/long), tags + alt text (maxlength), delete, DOM-assertable security |
| Deferred | 10 | Real .zip uploads (valid/invalid/corrupt/oversized/malicious), Preview/Reader, popup/inline runtime, panel-fixed drag, delete-during-upload, persistence-after-reload |

## Why the deferrals

The bulk of deferred cases require **real .zip uploads through the OS file
picker** plus server-side processing (`TC_04`, `TC_06`, `TC_24`, and the runtime
portions of `TC_03/05/10/23/27`), or flows **outside the authoring DOM** —
**Preview/Reader** rendering (`TC_09`, `TC_11`, `TC_28`, `TC_29`),
**panel-drag** position (`TC_13`), **delete-during-upload** (`TC_33`), and
**persistence-after-reload** (`TC_35`). Each is an explicit `it.skip()` with a
reason in the spec and `html-interactivity-mapping.json`.

### Security (TC_31)

The DOM-assertable portion is automated: author-entered markup in the header is
**not executed** (no live `<script>`, no inline-JS side effect). The malicious-zip
rejection + "security warning" is a server-side / upload-pipeline behaviour and is
deferred.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/html-interactivity/37-html-interactivity-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from the templates. A single run will confirm the drop +
> settings-panel selectors (`.htmlStyleSet`, `#html-interactive-settings-panel`,
> `#show-header`, `#show-caption`, `input[name="outline"]`, `.colorPickerInputBox`).
