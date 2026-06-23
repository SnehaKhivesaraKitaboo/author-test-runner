# Master Agent Prompt — Implement a Deep Component Spec

> **Team guide:** For the full step-by-step prompt with examples, checklist, and FIB lessons, see **[TEAM-COMPONENT-PROMPT.md](TEAM-COMPONENT-PROMPT.md)**.

Copy this template when asking Cursor (or any agent) to implement automation for a **new** authoring component. Replace `{PLACEHOLDERS}`.

---

## Prompt (copy from here)

```
You are implementing Cypress deep automation for the Kitaboo Authoring Test Runner in:
  D:\Authoring\closify\authoring-tests\

## Goal
Create a production-ready deep spec for component: {COMPONENT_NAME}
QC source PDF: D:\Author_Test_cases\{PDF_FILENAME}
dataType: {DATA_TYPE}
Target spec file: e2e/{NN}-{slug}-deep.spec.ts

## Current working reference
FIB is the ONLY verified deep implementation. Mirror its patterns:
  - e2e/13-fib-deep.spec.ts
  - support/commands.ts (openAuthoringTool, createTestStep, dropWidgetIntoGenericStep, captureLiveStep)
  - docs/FIB-DEEP-AUTOMATION.md

## Authoring tool context
- AngularJS 1.x app on staging (launch URL with courseId + userToken)
- Assessment widgets MUST drop inside Generic Step column (.generic-step-column-content)
- Contenteditable fields: use setContentEditableText() / setContentEditableOn(), NOT cy.type()
- Settings panel: click .sd-item wrapper, use Angular setSettingsValues or commonrightpanel = switchSettings
- testIsolation: false — reuse canvas via ensure{Component}DeepSetup() helper

## Deliverables (all under authoring-tests/)
1. e2e/{NN}-{slug}-deep.spec.ts
   - describe blocks grouped by QC scenario categories
   - it() titles prefixed with QC TC id: "TC_05 — description"
   - beforeEach ensure setup except for explicit setup tests
   - cy.captureLiveStep() at each major milestone
2. support/commands.ts — add component-specific commands if needed (SELECTORS export, openSettings, fillDummyContent)
3. fixtures/component-flows.json — add entry with 8-step setupFlow
4. fixtures/test-registry.json — set automationStatus: "deep", deepSpecFile: "{NN}-{slug}-deep.spec.ts"
5. cypress.config.ts — add LIVE_STEP_TITLES entries for new milestones
6. docs/{COMPONENT}-DEEP-AUTOMATION.md — QC mapping table (automated / partial / deferred)
7. Do NOT edit requirements.md or files outside authoring-tests/

## Implementation steps
1. Read QC PDF at D:\Author_Test_cases\{PDF_FILENAME} — extract every TC id, steps, expected result, test type
2. Read authoring template source under KITABOO_Authoring/templates/{template-folder}/ for real selectors
3. Determine drop target:
   - assessment → Generic Step (createTestStep + dropWidgetIntoGenericStep)
   - layout/element → Instructions or step canvas (dropComponent / navigateToCanvasPage)
   - layer → LoD layer flow
4. Implement setup suite (equivalent to FIB TC_02a/b/c) with live screenshots
5. Implement settings suites — toggles, styles, copy, validation, security
6. Defer preview/reader/a11y TCs — document as "deferred" with reason
7. Register in lib/registry.js routing (automatic if test-registry deepSpecFile set)
8. Run: npx cypress run --spec e2e/{NN}-{slug}-deep.spec.ts with valid AUTHORING_LAUNCH_URL
9. Verify dashboard Component Test mode: single component selection shows 8-step flow + live preview

## Test type coverage checklist
For each QC test case, classify and implement:
- [ ] UI and Functionality — canvas + settings assertions
- [ ] Functionality — interactions (add option, insert blank, copy)
- [ ] Negative — empty save, script injection, over-limit options
- [ ] Edge Case — max items, boundary values
- [ ] Regression — save + reload persistence
- [ ] Accessibility — defer or stub with aria-label checks
- [ ] Preview/Reader — defer to phase 2 (iframe player-container.js)

## Constraints
- No hardcoded userToken in source — env only
- Match existing code style in 13-fib-deep.spec.ts
- Minimal diff — do not refactor unrelated specs
- All new documentation only in authoring-tests/docs/
```

---

## Variant: extend existing basic spec to deep

```
Upgrade {COMPONENT_NAME} from basic (09-component-deep / 08-widget-components) to deep spec.

Current: automationStatus "basic" in fixtures/test-registry.json
QC PDF: D:\Author_Test_cases\{PDF_FILENAME} ({TC_COUNT} cases)

Follow FIB pattern in e2e/13-fib-deep.spec.ts. Keep existing smoke tests; add new file e2e/{NN}-{slug}-deep.spec.ts rather than bloating 08/09.

Priority order:
1. Setup + drop + settings panel opens
2. All settings toggles from PDF
3. Copy/delete/component lifecycle
4. Negative + security cases
5. Preview/reader (phase 2)
```

---

## Variant: fix MCQ / MCQ Multiple (unverified specs)

```
Stabilize e2e/11-mcq-deep.spec.ts (or 12-mcq-multiple-deep.spec.ts) to match FIB quality.

Reference working FIB commands in support/commands.ts.
QC PDFs:
  - D:\Author_Test_cases\Author Test Cases - MCQ .pdf
  - D:\Author_Test_cases\Author Test Cases - MCQ Multiple.pdf

Issues to address:
- Module-aware drop (module-setup.ts)
- Settings panel selectors from templates/multiple-choice/
- ensureMcqDeepSetup() session reuse
- Live preview milestones in component-flows.json
- Verify single-component dashboard run passes end-to-end

Document results in docs/MCQ-DEEP-AUTOMATION.md (create under authoring-tests/docs/).
```

---

## Variant: extract test-cases.json from PDF

```
Parse D:\Author_Test_cases\{PDF_FILENAME} and create:
  authoring-tests/fixtures/components/{dataType}/test-cases.json

Schema per entry:
{
  "id": "TC_02",
  "type": "UI and Functionality",
  "description": "...",
  "steps": ["step 1", "step 2"],
  "expected": "...",
  "automationStatus": "automated|partial|deferred|planned",
  "specRef": "13-fib-deep.spec.ts#TC_02a"
}

Do not commit secrets. Output summary table in docs/QC-REGISTRY.md.
```

---

*Last updated: May 2026*
