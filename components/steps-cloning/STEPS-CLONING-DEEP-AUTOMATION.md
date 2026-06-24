# Steps Cloning ("Clone New Level") — Deep Automation

- **Component slug:** `steps-cloning`
- **Feature:** Clone New Level — step-level clone within a lesson
- **Spec:** `47-steps-cloning-deep.spec.ts`
- **QC authority:** `Author Test Cases - Steps Cloning.pdf` (TC_01–TC_77)
- **Source authority:**
  - `closify/KITABOO_Authoring/index.html` (per-step TOC kebab menu + clone wizard)
  - `closify/KITABOO_Authoring/js/page-tray.js` (`tocSectionClonePopup`, `levelAdds`, `checkIfLOSApplied`, `clonePhysicalPage`)

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived from KITABOO_Authoring. A single run will confirm the kebab
> menu, clone wizard, LoS dropdown, and TOC row selectors.

## Mechanism (source-verified)

Cloning is a **step-level lifecycle action**, not a dropped widget. It is exposed
**only** via the per-step **TOC kebab menu** (`.tocPageIconMenu`) item
**"Clone New Level"** (`ng-click="tocSectionClonePopup($event, pages)"`). It is
**not flag-gated** — the menu item is always present on a step page row.

"Clone New Level" reuses the step metadata wizard **`#formsModal`** in *clone
mode* (`scope.clonedStepData` set):

- **Basic Info tab** — the **Step Title** input carries `disabledInput`
  (`ng-class="{disabledInput:clonedStepData}"`), so it is **read-only** while
  cloning. The Step number is therefore preserved.
- **Levels tab** — when the cloned LoS **≠ CORE**, an editable **Levels-of-Support**
  chips dropdown renders (`#level-container` / `#level-drop` / `#level-drop-list`).
  When the cloned LoS **== CORE**, the message *"Since the LoS is 'Core', it
  cannot be updated."* renders instead.
- **LoS master list** (`scope.levelItems`): `CORE`, `LIGHT`, `LIGHT-MULTILINGUAL`,
  `MODERATE`, `MODERATE-MULTILINGUAL`, `INTENSIVE`, `INTENSIVE-MULTILINGUAL`.
- **Applied LoS** in the step are **disabled** in the dropdown
  (`checkIfLOSApplied` → grey, `cursor: not-allowed`). Consequently `CORE` is not
  re-selectable once the Core page exists.

**Save / Insert** calls `clonePhysicalPage(id, json)`. The cloned page keeps the
**same `stepid`** (Step number unchanged) and is added as **another page under
the same step** in `grouptoc.steps`, with a unique page id and its own `losTag(s)`.
Metadata is stamped `isCloned: true` / `Cloned-time` / `Cloned-by`.

## Reused helpers (NOT duplicated)

`cy.openAuthoringTool`, `cy.createTestStep`, `cy.ensureOnFibGenericStep`,
`cy.waitForGenericStepCanvasReady`, `cy.dropComponentForModule`,
`cy.setContentEditableOn`, `cy.captureLiveStep`, `cy.waitForLoaderGone`.

New component commands (in `commands.ts`): `ensureStepsCloningDeepSetup`,
`openStepCloneTocMenu`, `openCloneWizard`, `cancelCloneWizard`, `countTocStepRows`.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 32 | Kebab menu + Clone option visibility, clone wizard open, prefilled/read-only Step Title, LoS dropdown rules (applied LoS disabled, multilingual variants present, Core not re-selectable), cancel safety, clone-creates-a-new-page-row in TOC, source content integrity, security |
| Deferred | 45 | Save round-trip + reload persistence, save-time LoS validation messages, Reader/CLP after publish, undo/redo internals, audit-trail/DB/internal-id inspection, activity export, locked/concurrency rules, step-creation wizard cases TC_06–TC_09 |
| **Total** | **77** | One it()/it.skip() entry per QC TC |

### What is automated (authoring DOM, source-derived)

- **TC_01–TC_05** — launch + build the source Generic Step (clone source).
- **TC_10/TC_29/TC_30** — per-step kebab menu present; "Clone New Level" visible.
- **TC_34/TC_35** — clone wizard opens; Step Title prefilled and read-only.
- **TC_31/TC_37/TC_71** — Core not re-selectable (Core-fixed message / disabled).
- **TC_36/TC_48/TC_52/TC_72** — already-applied LoS disabled in the dropdown.
- **TC_38/TC_49/TC_61** — multilingual LoS variants present as distinct options.
- **TC_42/TC_73** — Cancel closes the wizard without creating a page.
- **TC_11/TC_12/TC_13/TC_24/TC_32/TC_45/TC_60** — clone adds a new page row under
  the same step (Step number unchanged; Page increments).
- **TC_14/TC_19/TC_26** — source content integrity (clone copies the page JSON).
- **SEC** — script payloads stay inert through cloning.

## Why the deferrals

Roughly 58% of the QC suite asserts behaviour that lives **outside the authoring
DOM** or requires **backend inspection**: page-id/internal-id assignment and DB
storage, audit trails, activity export, Reader/CLP rendering after publish,
undo/redo internals, and reload-based persistence. Those are intentionally marked
`it.skip()` with explicit reasons in the spec and `steps-cloning-mapping.json`.
TC_06–TC_09 are step-creation-wizard cases (Cancel / Change step / Instructions)
that belong to the **Generic Step** component, not the clone feature.

## Run

```bash
# single spec
npx cypress run --spec "components/steps-cloning/47-steps-cloning-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
