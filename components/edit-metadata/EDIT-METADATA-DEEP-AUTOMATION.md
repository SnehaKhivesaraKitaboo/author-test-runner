# Edit Metadata (Step Metadata edit) — Deep Automation

- **Component slug:** `edit-metadata`
- **dataType:** `platform-edit-metadata`
- **Spec:** `46-edit-metadata-deep.spec.ts`
- **QC authority:** `Author Test Cases - Edit metadata.pdf` (TC_01–TC_34)
- **Source authority:** `closify/KITABOO_Authoring/index.html`
  - TOC per-step kebab menu: `.tocMenuDiv` (`#dropdownMenu3`) → `.tocPageIconMenu`
    with `li ng-click="tocSectionEditPopup($event,pages)"` = **Edit Metadata**.
  - Metadata wizard: `#formsModal` / `.forms-modal` (re-opened in
    `editingStepData` mode).

## What "Edit Metadata" actually is (source-verified)

Edit Metadata is **not a dropped widget**. The TOC kebab menu re-opens the very
same wizard used when a step is created, this time in **edit mode**. The wizard's
real editable fields are:

| Field | Selector | Notes |
|---|---|---|
| Step Title | `#formsModal #title` (`ng-model="stepTitle"`) | Required — `disabledBtn` on Next/Submit when empty |
| Keyword Tags | `#formsModal #tag` + `#tag-list` | The "standards/objectives" tags; Press Enter to separate |
| Levels of Support | `#formsModal #level-sec` | New step LoS fixed to `Core` (read-only when editing) |
| Instructions (Students) | `#formsModal #studentDesc` | 10000-char budget via `#studentCharCount` |
| Instructions (Teachers) | `#formsModal #teacherDesc` | 10000-char budget via `#teacherCharCount` |
| Save | `#formsModal #subBtn` | `ng-click="... infoEdit()"`, visible off the Basic Info tab |
| Cancel | `#formsModal #cancelBtn` | `ng-click="cancelAndReset()"` |

> **Source ambiguity flagged:** the QC PDF mentions "objectives" and "standards
> tags", but **no literal `Objectives`/`Standards` field exists** in the metadata
> wizard markup. Those concepts are mapped to the **Keyword Tags**, **Levels of
> Support** and **Instructions** fields — the closest real, editable fields. The
> separate "Learning Objectives" panel elsewhere in `index.html` is not part of
> the step metadata wizard and is out of scope.

## Reused framework helpers (not duplicated)

- `cy.openAuthoringTool`, `cy.createTestStep`, `cy.ensureOnFibGenericStep`,
  `cy.waitForGenericStepCanvasReady`, `cy.captureLiveStep` (from `support/`).
- New thin component helpers in `commands.ts`: `ensureEditMetadataDeepSetup`,
  `openStepKebabMenu`, `openEditMetadataWizard`, `editStepTitle`,
  `addKeywordTag`, `saveEditMetadata`, `cancelEditMetadata`.

## Validation model

Required-field validation is enforced by **`ng-class` `disabledBtn` / `!stepTitle`**
on the Next/Submit buttons — not by an inline red error string. The spec asserts
the **disabled-button contract** (clearing Title disables Next; re-typing
re-enables it), which is the faithful, source-derived behaviour.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 18 | Launch/step setup, kebab menu, open wizard, edit+save title, tags, LoS tab, instructions student/teacher, switch tabs, char-budget indicator, required-field validation, cancel-without-save, Next/Back navigation, security |
| Deferred | 16 | Publish/Republish/Reader, RTE toolbar (B/I/U, lists, image, undo/redo), char-limit toast, read-only permission mode, responsiveness, simultaneous-tab conflict, clone/delete mutations, persistence/preview |

QC→`it()` mapping (each TC_01–TC_34 once) is in
`edit-metadata-mapping.json`.

## Why the deferrals

Roughly half the QC suite targets the **rich-text editor toolbar** (Bold/Italic/
Underline, lists, image insert, undo/redo, character-limit error toast) — the
metadata wizard uses plain `<textarea>` instructions, so those toolbar behaviours
belong to a different surface — plus **Publish/Republish/Reader** visibility,
**read-only permission** mode, **responsive layout**, **multi-tab conflict**, and
**clone/delete** mutating lifecycle. These are intentionally `it.skip()` with
explicit reasons in the spec and mapping.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/edit-metadata/46-edit-metadata-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from `index.html`. A single run will confirm the kebab →
> Edit Metadata → wizard open/edit/save/cancel path against the live DOM.
