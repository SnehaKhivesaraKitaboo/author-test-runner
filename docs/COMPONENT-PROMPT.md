# Team Prompt — Deep Component Automation

> **Purpose:** Copy-paste this prompt into Cursor Agent (or any AI coding assistant) when implementing Cypress deep tests for a **new** authoring component.  
> **Verified reference:** Fill in the Blank (FIB) — see [FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md).

**Related docs:**

| Document | Use when |
|----------|----------|
| [FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md) | Reading the working pattern (selectors, suites, TC mapping) |
| [COMPONENT-PROMPTS.md](COMPONENT-PROMPTS.md) | Pre-filled prompts for each of the 46 QC components |
| [MASTER-AGENT-PROMPT.md](MASTER-AGENT-PROMPT.md) | Shorter template + variants (extend basic spec, fix MCQ, parse PDF) |
| [QC-REGISTRY.md](QC-REGISTRY.md) | Full component catalog and automation status |

---

## How to use (team workflow)

1. Pick a component from [QC-REGISTRY.md](QC-REGISTRY.md) (start with assessment widgets after FIB).
2. Copy the **Master prompt** block below into Cursor Agent.
3. Replace all `{PLACEHOLDERS}` (or use a **Filled example** from this doc).
4. Ensure `.env` has a **fresh** `AUTHORING_LAUNCH_URL` (`userToken` expires quickly).
5. After implementation, verify via **dashboard Component Test mode** (single component only).
6. Update `docs/{COMPONENT}-DEEP-AUTOMATION.md` and [QC-REGISTRY.md](QC-REGISTRY.md) when verified.

---

## Master prompt (copy from here)

```
You are implementing Cypress deep automation for the Kitaboo Authoring Test Runner.

Project root (ONLY edit files here):
  D:\Carnegie Learning\Authoring\closify\authoring-tests\

## Goal
Implement production-ready deep automation for:
  Component: {COMPONENT_NAME}
  dataType: {DATA_TYPE}
  QC PDF: D:\Author_Test_cases\{PDF_FILENAME}
  New spec: e2e/{NN}-{slug}-deep.spec.ts

FIB is the ONLY verified deep implementation — mirror it exactly:
  - Reference spec: e2e/13-fib-deep.spec.ts
  - Reference doc: docs/FIB-DEEP-AUTOMATION.md
  - Commands: support/commands.ts (openAuthoringTool, createTestStep, dropWidgetIntoGenericStep, captureLiveStep, setContentEditableOn)
  - Module rules: support/module-setup.ts (ASSESSMENT_DATA_TYPES, ELA vs WL drop targets)

## Authoring tool rules (non-negotiable)
1. Launch URL must come from env only — never hardcode userToken
   - CYPRESS_AUTHORING_LAUNCH_URL or .env AUTHORING_LAUNCH_URL
2. Assessment widgets (MCQ, FIB, True/False, etc.) MUST drop inside Generic Step column:
   - .generic-step-column-content — NOT Instructions page
3. Contenteditable fields: use setContentEditableOn() / setContentEditableText() — NOT cy.type()
4. Settings panel: click the .sd-item wrapper so commonrightpanel = switchSettings
5. testIsolation: false — reuse session via ensure{Component}DeepSetup()
6. Live dashboard preview: cy.captureLiveStep('milestone-key') at every major step
7. Do NOT edit requirements.md or files outside authoring-tests/

## Step 1 — Read QC PDF
Open D:\Author_Test_cases\{PDF_FILENAME} and extract EVERY test case:
  - TC id (TC_01, TC_02, …)
  - Test type (UI and Functionality, Functionality, Negative, Edge Case, Regression, Accessibility)
  - Steps + expected result

Build a coverage plan:
  - automated (authoring canvas + settings)
  - partial (some steps need preview/reader)
  - deferred (preview iframe, keyboard-only a11y, network fault injection — document reason)

## Step 2 — Find real selectors
Read KITABOO_Authoring source (outside authoring-tests, read-only):
  - templates/{template-folder}/
  - settings panel HTML ids, data-type attributes, Angular ng-model bindings
Export a {COMPONENT}_SELECTORS constant in support/commands.ts (like FIB_SELECTORS)

## Step 3 — Determine drop target

| Component category | Setup flow |
|--------------------|------------|
| Assessment widget  | createTestStep('GenericStep') → drop into .generic-step-column-content |
| Layout             | Instructions or step canvas via dropComponent / navigateToCanvasPage |
| Element            | Instructions page or sidebar drop zone |
| Widget (non-assessment) | Per module-setup.ts + PDF |
| LoD / layer        | LoD layer flow from 09-component-deep.spec.ts |

Use module-setup.ts:
  - ELA/Math assessment → generic-step-column
  - WL → singlePageMode may allow canvas drop

## Step 4 — Implement spec file e2e/{NN}-{slug}-deep.spec.ts

Structure (copy FIB pattern):

const LAUNCH_URL = Cypress.env('AUTHORING_LAUNCH_URL') || '';
before(function () { if (!LAUNCH_URL) this.skip(); });
beforeEach(function () {
  if (!LAUNCH_URL) this.skip();
  const title = this.currentTest?.title || '';
  if (/TC_02[abc]/i.test(title)) return; // setup tests run their own flow
  cy.ensure{Component}DeepSetup({ through: 'content', skipStepCreation: true });
});

describe('{NN}-A — {Component}: Setup (TC_02)', () => {
  it('TC_02a — SETUP: Create Generic Step', () => { ... cy.captureLiveStep(...) });
  it('TC_02b — Drop {Component} into Generic Step column', () => { ... });
  it('TC_02c — Enter dummy content on canvas', () => { ... });
});

describe('{NN}-B — Settings: ...', () => {
  before(() => cy.open{Component}Settings());
  it('TC_XX — ...', () => { ... });
});
// Group remaining suites by PDF scenario categories

Rules:
- Every it() title MUST start with QC TC id: "TC_05 — description from PDF"
- Do NOT reuse wrong TC numbers (see FIB-DEEP-AUTOMATION.md mapping warnings)
- Setup split into TC_02a/b/c for live preview milestones
- Negative cases: empty save, script injection (<script>alert(1)</script>), over-limit options
- Copy/delete lifecycle: .icon-Copy-Icon, delete, assert independent edit
- Defer preview/reader scoring to phase 2 — mark in doc, don't fail silently

## Step 5 — Custom commands in support/commands.ts
Add (mirror FIB):
  - export const {COMPONENT}_SELECTORS = { ... }
  - cy.drop{Component}IntoGenericStepColumn()  (or module-aware drop)
  - cy.fill{Component}DummyContent()
  - cy.open{Component}Settings()
  - cy.ensure{Component}DeepSetup({ through, skipStepCreation })

Reuse existing commands where possible — don't duplicate drop logic.

## Step 6 — Register component
Update ALL of these:
1. fixtures/component-flows.json
   - 8-step setupFlow (dashboard left panel)
   - dropTarget, deepSpecFile, pdfFile, tcCount
2. fixtures/test-registry.json
   - automationStatus: "deep"
   - deepSpecFile: "{NN}-{slug}-deep.spec.ts"
3. cypress.config.ts → LIVE_STEP_TITLES
   - One entry per captureLiveStep milestone key
4. docs/{COMPONENT}-DEEP-AUTOMATION.md
   - QC PDF → automation mapping table (automated / partial / deferred)
   - Selectors table, suite breakdown, common failures, how to run

## Step 7 — Verify end-to-end

CLI:
  cd D:\Carnegie Learning\Authoring\closify\authoring-tests
  # Fresh userToken in .env AUTHORING_LAUNCH_URL
  npx cypress run --spec e2e/{NN}-{slug}-deep.spec.ts

Dashboard (required before marking "verified"):
1. npm start → http://localhost:4321 → sign in (demo@kitaboo.com / Demo@123)
2. Component Test mode → select ONLY "{COMPONENT_NAME}"
3. Confirm 8-step flow panel on left
4. Run Component Tests → Test Run View shows live screenshots at each milestone
5. Report saved under runs/<runId>/

## Deliverables checklist
- [ ] e2e/{NN}-{slug}-deep.spec.ts
- [ ] support/commands.ts (SELECTORS + ensure* + drop/open/fill helpers)
- [ ] fixtures/component-flows.json entry
- [ ] fixtures/test-registry.json updated
- [ ] cypress.config.ts LIVE_STEP_TITLES
- [ ] docs/{COMPONENT}-DEEP-AUTOMATION.md
- [ ] docs/QC-REGISTRY.md status updated when verified

## Constraints
- Minimal diff — no refactor of unrelated specs (06–12)
- Match code style in 13-fib-deep.spec.ts
- No secrets in source
- All documentation only under authoring-tests/docs/

Start by reading the QC PDF and FIB reference files, then implement one component end-to-end before moving to the next.
```

---

## Placeholder reference

| Placeholder | Example (FIB) | Where to find values |
|-------------|---------------|----------------------|
| `{COMPONENT_NAME}` | Fill in the Blank | `fixtures/test-registry.json` → `name` |
| `{DATA_TYPE}` | `fill-in-the-blank` | `fixtures/test-registry.json` → `dataType` |
| `{PDF_FILENAME}` | `Author Test Cases - FIB test cases.pdf` | `fixtures/test-registry.json` → `pdfFile` |
| `{NN}` | `13` | Next available spec number in `e2e/` |
| `{slug}` | `fib` | Short kebab-case name |

---

## Filled examples

### MCQ Single Choice (stabilize existing spec)

```
Component: MCQ (Single Choice)
dataType: multiple-choice-template
QC PDF: D:\Author_Test_cases\Author Test Cases - MCQ .pdf
Target spec: e2e/11-mcq-deep.spec.ts (exists — NOT verified; stabilize to FIB quality)

Priority from PDF (102 TCs):
1. TC_02 setup: Generic Step + drop MCQ + open settings
2. Styles TC_11–14, alignment TC_15–17
3. Options add/delete/image TC_72–77
4. Label types TC_38–71, feedback TC_23–28, shuffle TC_34–37
5. Copy/delete, negative (empty options, script in stem)
6. Preview/reader answer selection → deferred in docs/MCQ-DEEP-AUTOMATION.md

Selectors: KITABOO_Authoring/templates/multiple-choice/
Add ensureMcqDeepSetup(), openMcqSettings(), MCQ_SELECTORS
Verify dashboard Component Test with ONLY "Multiple Choice" selected.
```

### True or False (new spec)

```
Component: True or False
dataType: true-false-template
QC PDF: D:\Author_Test_cases\Author Test Cases - True or False.pdf
New spec: e2e/14-true-false-deep.spec.ts
Drop target: Generic Step column

Scenarios: setup, True/False toggle, header/instruction/label settings, styles,
feedback, Try Again, Show Me, copy/delete, negative validation, save + reload.
Preview scoring → deferred.
```

### Layout / Element (non-assessment)

```
Component: {LAYOUT_OR_ELEMENT_NAME}
dataType: {DATA_TYPE}
QC PDF: D:\Author_Test_cases\{PDF_FILENAME}
New spec: e2e/{NN}-{slug}-deep.spec.ts
Drop target: Instructions page or step canvas (NOT Generic Step unless PDF says so)

Use navigateToCanvasPage() / dropComponent() from support/commands.ts.
Read module-setup.ts for ELA vs WL canvas strategy.
```

---

## Recommended implementation order

| Priority | Component | dataType | Spec file | QC PDF |
|----------|-----------|----------|-----------|--------|
| 1 ✅ | **Fill in the Blank** | `fill-in-the-blank` | `13-fib-deep.spec.ts` | FIB test cases.pdf |
| 2 | MCQ Single | `multiple-choice-template` | `11-mcq-deep.spec.ts` | MCQ .pdf |
| 3 | MCQ Multiple | `mcq-multiple` | `12-mcq-multiple-deep.spec.ts` | MCQ Multiple.pdf |
| 4 | True or False | `true-false-template` | `14-true-false-deep.spec.ts` (new) | True or False.pdf |
| 5 | FIB Media | `fib-media` | `15-fib-media-deep.spec.ts` (new) | FIBMedia test cases.pdf |

For all other components, use pre-filled prompts in [COMPONENT-PROMPTS.md](COMPONENT-PROMPTS.md).

---

## Lessons from FIB (include in every run)

| Tip | Detail |
|-----|--------|
| **Fresh token** | Session expires quickly — refresh `userToken` in launch URL before each run |
| **Click `.sd-item`** | Clicking only inner template div leaves settings panel empty |
| **TC numbers** | Match PDF ids exactly — see [FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md) §5 for misalignment examples |
| **One component** | Dashboard Component Test: select **one** component — multi-select breaks live preview |
| **8 setup steps** | `fixtures/component-flows.json` → `setupFlow` should have 8 steps for dashboard checklist |
| **Contenteditable** | Always `setContentEditableOn()` — `cy.type()` does not sync Angular `ng-model` |
| **Assessment drop zone** | `.generic-step-column-content` only — never Instructions page |

---

## Common failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| Step 1 fails immediately | Session expired | Fresh `userToken` in launch URL |
| Widget on Instructions page | Wrong drop target | Generic Step + column drop command |
| Settings panel empty | Wrong click target | Click `.sd-item` or use `open*Settings()` |
| Header/text not saved | Used `cy.type()` | Use `setContentEditableOn()` |
| Live preview blank | Stale dashboard | Ctrl+F5; check `runs/<id>/screenshots/live/` |
| Tests skip entirely | Missing env URL | Set `AUTHORING_LAUNCH_URL` in `.env` |

Full troubleshooting: [TEST-RUNNER-SOLUTION.md](TEST-RUNNER-SOLUTION.md).

---

## Deliverables per component (checklist)

Copy this checklist into your PR or Jira ticket:

- [ ] `e2e/{NN}-{slug}-deep.spec.ts` with QC TC ids in `it()` titles
- [ ] `support/commands.ts` — `{COMPONENT}_SELECTORS`, `ensure*DeepSetup`, drop/open/fill helpers
- [ ] `fixtures/component-flows.json` — 8-step `setupFlow`
- [ ] `fixtures/test-registry.json` — `automationStatus: "deep"`, `deepSpecFile` set
- [ ] `cypress.config.ts` — `LIVE_STEP_TITLES` entries for milestones
- [ ] `docs/{COMPONENT}-DEEP-AUTOMATION.md` — TC mapping (automated / partial / deferred)
- [ ] CLI run passes: `npx cypress run --spec e2e/{NN}-{slug}-deep.spec.ts`
- [ ] Dashboard Component Test passes (single component selected)
- [ ] [QC-REGISTRY.md](QC-REGISTRY.md) updated when marked **verified**

---

*Last updated: June 2026*
