# Highlighter — Deep Automation

- **Component slug:** `highlighter`
- **dataType:** `highlight` · **directive:** `highlightTemplate`
- **Spec:** `34-highlighter-deep.spec.ts`
- **QC authority:** `Author Test Cases - Highlighter.pdf` (TC_01–TC_45)
- **Source authority:**
  - `config/config.js` (catalog: name "Highlighter", dataType "highlight", iconClass "icon-Highlight-words")
  - `templates/highlightTemplate/highlightTemplate.html`
  - `templates/highlightTemplate/highlightTemplateSettings.html`
  - `templates/highlightTemplate/default/highlightTemplate.json`
  - `templates/highlightTemplate/scripts/highlightTemplate.js`

## Verified facts (source-derived)

- **dataType `highlight`** and **name "Highlighter"** confirmed in `config/config.js`. The
  directive is `highlightTemplate` (HTML attribute spelled `highLight-template`).
- `highlight` is in **`ASSESSMENT_DATA_TYPES`** (`support/module-setup.ts`), so the
  framework drops it into a **Generic Step column** (`resolveDropTarget → 'generic-step-column'`),
  the same mechanism as Extended Response / Correction.
- Canvas wrapper class is **`.canvas-wrap.highLight.component-holder`**.
- The settings panel uses a **CLASS, not an id**: **`.highLight-settings-panel`**
  (title "Highlighter", icon `.txt-set-icon.icon-Highlight-words`). This differs from
  Extended Response (`#shortLongAns-setting`) — the highlighter template has no panel id.
- **Header** (`.sc-intro`, `fieldData.introduction`) and **Instruction** (`.sc-instr`,
  `fieldData.instruction`) are `contenteditable`, gated by `settings.isHeaderVisible` /
  `settings.isInstructionVisible` (both **default true** in the default JSON). Their holders
  toggle `.displayBlock` / `.displayNone`.
- **Sentences** repeat over `settings.highLightInfo`; each `.highLight-text` row has a
  contenteditable `.sc-sentence` and a `.row-delete` anchor that is `.disabled` when only
  **one** sentence remains (`min_question = 1`). Add Sentence caps at `max_question = 10`.
- **Settings checkboxes:** `#add-activity-restart`, `#add-show-me`, `#header-visibility`,
  `#instr-visibility`. Show Me / Header / Instruction default checked. `#add-show-me` and
  `#add-activity-restart` render only when `!isGroupActivity`.
- **Outline radios** `name="outline"` (`outline` / `outlineBg`) + **Action Assets** colour
  picker (`.colorPickerButton`, `.colorPickerInputBox`, default `#7eb1eb`).
- **Style panel** is the shared `<stylepanel>` (`style1` active, `style2` "coming soon").
- **Tags** via `<tag-manager>` inside `.tagsContainer` (renders when `currSettings.showText`).

## The highlight-selection popup (why TC_08/TC_09 are deferred)

The "Incorrect" / Undo control is floating `.highLight-Popup*` markup that only appears on a
**live browser text selection** (`window.getSelection()` + `document.execCommand('strikethrough')`
+ DOM Range insertion). This is the **student** marking flow exercised in **Preview/Reader**, and
it cannot be reliably driven from the authoring DOM. To still validate the **correct-highlight
range** in author mode, `cy.applyHighlighterWordRange()` wraps a single word in a
`.cy-highlight-range` span and asserts it (TC_06, TC_30).

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 29 | Drop, settings panel + title/icon, Show Me/Header/Instruction defaults & hide-on-uncheck, outline + Action Assets colour, style panel, add/remove sentences (min=1, max=10), sentence text + mixed formatting, correct-highlight range, tags, submit bar/placeholders, copy/delete chrome, security |
| Deferred | 16 | Student highlight-selection (Incorrect/Undo), submit lock, persistence-after-reload, network failure, responsive/visual, accessibility, copy success-popup lifecycle |

Every QC case TC_01–TC_45 is mapped exactly once in `highlighter-mapping.json`.

## Graceful degradation

Flag-gated / hover-chrome controls (`#add-show-me`, `#add-activity-restart`, `<tag-manager>`,
copy/delete buttons) **log and return** when they are not mounted (e.g. group-activity mode or
headless DOM), rather than failing the suite.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/highlighter/34-highlighter-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — all selectors are
> source-derived from the KITABOO_Authoring templates. A single headed run with
> `AUTHORING_LAUNCH_URL` set will confirm the drop + settings-panel selectors (in particular the
> class-based `.highLight-settings-panel` and the Generic Step column drop target).
