# Instruction for Teacher (fixed TOC page) — Deep Automation

- **Component slug:** `instruction-teacher`
- **Catalog dataType:** `instructionsteacher` *(logical slug — see ambiguity note)*
- **Verified page identifier:** AngularJS `pageType === "teacherInstructions"`
- **TOC label (verified):** `Instructions for Teacher` *(singular "Teacher")*
- **Spec:** `instructionsteacher-instruction-teacher-deep.spec.ts`
- **QC authority:** `Author Test Cases - Instruction for Teacher.pdf` (TC_01–TC_19)
- **Source authority:**
  - `index.html` (TOC entry markup + `#desktop_view` canvas + flat-page placeholder)
  - `editor/ngcontroller.js` (`pageType` handling, `savePhysicalPage`, `grouptoc.teacherInstructions`)
  - `config/config.js` (drop-permission matrix: `teacherInstructions`)

## Fixed TOC page (not a dropped widget)

"Instructions for Teacher" is a **fixed page that already exists in the Table of
Contents** (`grouptoc.teacherInstructions`). It is **not** dropped from a widget
catalog. Because the framework's `cy.navigateToCanvasPage()` targets the
**Student** page first, this component uses a dedicated
**`cy.openInstructionTeacherPage()`** that mirrors the same click pattern but
targets the verified **"Instructions for Teacher"** TOC entry, then verifies the
`[new-toc]` page attributes (`pagesequence`) before authoring on `#desktop_view`.

`cy.ensureInstructionTeacherDeepSetup` mirrors the Student sibling's setup
contract (`through: 'page' | 'element' | 'content'`).

## ⚠️ Source ambiguity (reported)

The QC catalog records `dataType: "instructionsteacher"`. **That exact string
does not appear anywhere** in `config.js`, `index.html`, or `ngcontroller.js`.
The real, source-verified identifier is the AngularJS **`pageType:
"teacherInstructions"`** (confirmed in `index.html` `currentPageTOC[0].pageType`
checks, `ngcontroller.js` `savePhysicalPage` / `grouptoc`, and the
`config.teacherInstructions` drop matrix). The catalog `dataType` is therefore
treated as a **logical slug only**; all selectors are derived from the verified
`teacherInstructions` markup — never invented.

Note also a label discrepancy in the framework: `support/commands.ts`
`navigateToCanvasPage` uses the fallback string `"Instruction for Teacher"`,
while the verified `index.html` TOC `.stepTitle` is `"Instructions for Teacher"`.
This component navigates with the verified `"Instructions for Teacher"` text.

## Architecture notes (source-verified)

- Canvas: **`#desktop_view`** (`ng-drop`, `onDropComplete`). Authored elements
  render as **`#desktop_view .sd-item`**.
- Active-page marker: **`[new-toc]`** carries `pageType` / `pagesequence`.
- Flat-page placeholder (when empty): **"Enter instructions for the teacher
  here."** (`index.html`, gated on `pageType==='teacherInstructions'`).
- **Allowed element drops** (`config.teacherInstructions === true`): `header`,
  `paragraph` (Text), `poetry`, `image`, `tablesNew` (Table). Assessment widgets
  and layouts are `false` → not droppable here. The spec adds a **Text element**
  (`paragraph`) to exercise the editable-content / add-element capability and
  asserts the source-allowed set for the Image/Table/Header/Title cases.
- Editable body of a dropped Text element: **`.paragraph-container.editables`**
  (contenteditable) — set via **`cy.setContentEditableOn`**, never `cy.type()`.
- Rich-text formatting (font, **bold/italic/underline**, **bullets/numbering**,
  **colour**) lives in the floating **`textEditor.html`** toolbar
  (`.editing-container .editor-list`), mounted on focus. The spec **degrades
  gracefully** (log + return) when the overlay is not mounted in headless runs.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 11 | Page reachable in TOC, page-load (bootstrap result), content-area editable + line break, formatting-toolbar reachable, add-element + source-allowed drop set, long content (TC_17), special characters (TC_19), security |
| Deferred | 8 | Activity creation (TC_02/03), applied-style render (the TC_04/06/07/08 *render* halves), per-element drop render (TC_09–TC_12 *render* halves), Publish/Reader/republish (TC_13–TC_16), empty-publish validation (TC_18) |

> Honest split: each of TC_01–TC_19 is mapped exactly once in
> `instruction-teacher-mapping.json`. Where a QC case has both an *authoring*
> aspect (control present / content accepted) and a *runtime* aspect (applied
> style or per-element block rendered), the authoring aspect is automated and the
> runtime aspect is called out as deferred in the same mapping row / the
> Deferred describe block.

## Why these deferrals

QC TC_01–TC_03 are **login → create activity → start authoring** (environment
bootstrap handled by `cy.openAuthoringTool`, not assertions on the instruction
page). TC_04/06/07/08 *applied appearance*, TC_09–TC_12 *dropped-element
rendering*, TC_13–TC_16 **Publish/Reader/republish**, and TC_18 **empty-publish
validation** require flows outside the authoring DOM (Preview/Reader/Publish or
the individual element components' own deep specs). All are `it.skip()` with
explicit reasons in the spec and `instruction-teacher-mapping.json`.

## Run

```bash
npx cypress run --spec "components/instruction-teacher/instructionsteacher-instruction-teacher-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> **Not yet live-verified** against a running authoring instance — selectors are
> source-derived from the templates above. A single run will confirm the TOC
> navigation to "Instructions for Teacher" + the `#desktop_view` / `.sd-item`
> selectors and the `teacherInstructions` page-type behaviour.
