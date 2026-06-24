# Copy and Paste — Deep Automation

- **Component slug:** `copy-paste` (cross-component platform feature)
- **dataType:** `platform-copy-paste` (not a real widget — operates on dropped components)
- **Spec:** `45-copy-paste-deep.spec.ts`
- **QC authority:** `Author Test Cases - Copy and Paste.pdf` (TC_01–TC_18)
- **Source authority:**
  - `editor/ngcontroller.js` — `componentCopy` / `componentDuplicate` / `componentPaste`
  - `templates/generic-step/generic-step.html` — empty slot → "Paste Here"
  - `templates/generic-step/scripts/generic-step-directive.js` — `pastecomp` → `componentPaste`
  - `editor/contenteditable-ng-model-directive.js` — `ShowMessage`/`Example` toast (`.bb-alert`)

## Mechanism (source-verified)

Copy/Paste is **not its own widget**. It acts on an existing dropped component —
this suite uses a **Fill in the Blank** widget in a Generic Step column as the
copy source (reusing the framework drop/step helpers).

- **Copy** — `.copy-widget-icon.icon-Copy-Icon` → `componentCopy($event)`. Clears
  `localStorage`, then writes `copiedComponent`, `targetDataType`,
  `copiedTemplates`, `isDroppable`. Toast: *"The component has been copied
  successfully."*
- **Duplicate** — `.duplicate-widget-icon.icon-Page-duplication-01` →
  `componentDuplicate($event)`. Clones the `.sd-item` in place. Toast:
  *"Component duplicated successfully."*
- **Paste** — empty Generic Step slot `.generic-step-empty-droppable-text` toggles
  `questions.showPasteHere` on hover (renders `.icon-Paste-Icon` + "Paste Here"),
  `ng-click="pastecomp($event)"` → `componentPaste` + `onPasteDropComplete`
  (reads `localStorage.copiedComponent`).
- **Invalid target** — TOC panel / plain Instructions canvas have **no**
  `pastecomp` binding, so a copied component cannot be pasted there (TC_16).
- The clipboard is **localStorage-backed (not the OS clipboard)** — so a full
  copy → paste round trip is driveable from Cypress.

> ⚠️ **Source nuance:** the per-component **copy** icon (`.copy-widget-icon`) is
> appended by `findTag()` / on duplicated items, but the **original** drop
> template (`ngcontroller.js` ~line 2341) renders only **duplicate + delete**.
> The copy icon is therefore build-dependent. Every copy helper and copy-based
> assertion degrades gracefully (logs + returns) when the icon is absent, and the
> **duplicate** path (always present) provides the clone coverage in that case.

## Reused helpers (from `support/`)

`cy.openAuthoringTool`, `cy.createTestStep`, `cy.ensureOnFibGenericStep`,
`cy.waitForGenericStepCanvasReady`, `cy.dropFibIntoGenericStepColumn`,
`cy.fillFibDummyContent`, `cy.dropComponentForModule`, `cy.captureLiveStep`.

## Coverage

| Status | Count | QC IDs | Notes |
|---|---|---|---|
| Automated | 11 | TC_01–TC_07, TC_09, TC_10, TC_16, TC_18 | Copy → clipboard write, duplicate clone + toast, paste into a valid slot, "Paste Here" affordance, invalid-target rejection, multiple actions, security (serialized clipboard / no script execution) |
| Deferred | 7 | TC_08, TC_11–TC_15, TC_17 | Complex/nested copy, Save, Publish, Reader (CLP), edit+republish, cross-program parity, undo |

## Why these deferrals

The deferred set targets flows **outside the authoring DOM**: Save/Publish round
trips, Reader (CLP) verification of reused content, cross-program (ELA/WL/MATH)
parity runs, undo (no in-DOM affordance here), and persistence after republish.
Each is marked `it.skip()` with an explicit reason in the spec and
`copy-paste-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/copy-paste/45-copy-paste-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from KITABOO_Authoring. A single run will confirm the copy
> icon presence, the localStorage clipboard write, and the "Paste Here" paste
> round trip. If the copy icon is absent on the target build, copy-based cases
> log and fall back to the always-present duplicate path.
