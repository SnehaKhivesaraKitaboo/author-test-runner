# FIB Deep Automation — Implementation Reference

> **QC source:** `D:\Author_Test_cases\Author Test Cases - FIB test cases.pdf`  
> **Automation spec:** `e2e/13-fib-deep.spec.ts`  
> **Status:** Verified working via Component Test dashboard (May 2026)

---

## 1. Overview

Fill in the Blank (FIB) is the **first fully implemented deep component test**. It automates a subset of QC test cases from the FIB PDF against the live staging authoring tool.

The PDF defines **59 test cases** (TC_01–TC_59+; registry counts 59). The deep spec implements **~35 Cypress tests** mapped to the most critical authoring scenarios. Preview/reader-mode and keyboard-only cases are largely deferred.

---

## 2. Prerequisites (QC TC_02)

FIB is an **assessment widget**. It cannot be dropped on Instructions pages.

| Step | Action | Cypress |
|------|--------|---------|
| 1 | Open authoring URL with valid token | `cy.openAuthoringTool(LAUNCH_URL)` |
| 2 | TOC → + Add → Add New Step | `cy.createTestStep('GenericStep')` |
| 3 | Metadata wizard: title → Next → Next → Submit | `#title`, `#nextBtn`, `#subBtn` |
| 4 | Activate new Generic Step in TOC | `.activeTocItem` text matches /Auto Test — Generic Step/i |
| 5 | Drop FIB into Generic Step column | `cy.dropFibIntoGenericStepColumn()` |
| 6 | Enter header + sentence | `cy.fillFibDummyContent()` |
| 7 | Open settings panel | `cy.openFibSettings()` → `#fib-settings-panel` |

Setup is split into **TC_02a / TC_02b / TC_02c** for live preview milestones. Later suites call `cy.ensureFibDeepSetup({ through: 'content', skipStepCreation: true })`.

---

## 3. Key selectors

From `templates/fib/fib-settings-panel.html` and `support/commands.ts`:

| Element | Selector |
|---------|----------|
| Widget wrapper | `[data-type="fill-in-the-blank"]` |
| Inner template | `.fib`, `.fib-body` |
| Settings panel | `#fib-settings-panel` |
| Option types | `#with-option`, `#without-option`, `#drag-and-drop` |
| Show Header / Instruction | `#header-visibility`, `#instr-visibility` |
| Show Label Type | `#label-visibility` |
| Label types | `input[name="labelType"][value="primary\|secondary"]` |
| Case Sensitive | `#add-case-sensitive` → class `Case_Sensitive` on `.fib-body` |
| Shuffle Choices | `#add-shuftle-choices` → class `shuffle-choices` |
| Generic Feedback | `#add-generic-feedback`, `#correct_ans_feedback`, `#incorrect_ans_feedback` |
| Try Again / Show Me | `#add-activity-restart`, `#add-show-me` |
| Style cards | `#fibcard-style1` … `#fibcard-style7`, `.styleBackground` |
| Insert Blank | `.insert-blank` |
| Add Sentence | `.add-sentence-fib` |
| Copy icon | `.icon-Copy-Icon` on `.sd-item` |
| Drop zone | `.generic-step-column-content` |
| Header (contenteditable) | `.sc-intro.template-header` |
| Sentence (contenteditable) | `.sc-sentence.sentence-text` |

**Critical notes:**

- Click the **FIB `.sd-item`**, not only inner `.fib`, so `fib-template-directive` sets `commonrightpanel = switchSettings`.
- `data-fib-type`, `Case_Sensitive`, `shuffle-choices` live on **`.fib` / `.fib-body`**, not the outer wrapper.
- Use **`setContentEditableOn()`** for header/sentence — `cy.type()` does not sync Angular `ng-model`.

---

## 4. Test suites in `13-fib-deep.spec.ts`

| Suite | QC TCs covered | Tests |
|-------|----------------|-------|
| **13-A** Setup | TC_02, TC_29 | TC_02a, TC_02b, TC_02c, TC_29 |
| **13-B** Option types & visibility | TC_14, TC_15, TC_56, TC_57 | 4 tests |
| **13-C** Label types | TC_08–TC_13 | 6 tests |
| **13-D** Styles | TC_05, TC_06, TC_62 | 3 tests |
| **13-E** Copy | TC_03, TC_04, TC_24 | 3 tests |
| **13-F** Sentences & blanks | TC_07, TC_17, TC_49 | 2 tests |
| **13-G** Dropdown & shuffle | TC_51, TC_54, TC_59 | 3 tests |
| **13-H** Feedback & advanced | TC_19*, TC_26*, TC_35* | 3 tests |
| **13-I** Security & delete | TC_38*, TC_25* | 2 tests |

\* Some Cypress test titles reuse QC TC numbers for **different PDF scenarios** — see mapping table below.

---

## 5. QC PDF → automation mapping

### Automated (authoring canvas)

| QC TC | PDF description | Automation test |
|-------|-----------------|-----------------|
| TC_02 | Create FIB without image | TC_02a/b/c setup |
| TC_03 | Copy FIB — success popup | TC_03 |
| TC_04 | Copied FIB identical | TC_04 (count ≥ 2 after paste) |
| TC_05 | 6 style options selectable | TC_05 |
| TC_06 | Style changes layout | TC_06 |
| TC_07 | Multiple sentences & blanks | TC_07 (conditional on `.add-sentence-fib`) |
| TC_08 | Show Label Type unchecked default | TC_08 |
| TC_09 | Primary/Secondary on check | TC_09 |
| TC_10 | Primary default | TC_10 |
| TC_11 | Question 1 primary label | TC_11 |
| TC_12 | Part A secondary label | TC_12 |
| TC_13 | Toggle Primary/Secondary | TC_13 |
| TC_14 | Header/instruction toggles | TC_14 |
| TC_15 | Dropdown/Text/Drag&Drop types | TC_15a |
| TC_17 | Insert Blank | TC_17 |
| TC_24 | Copied component editable independently | TC_24 |
| TC_29 | No media/image in normal FIB | TC_29 |
| TC_51 | Dropdown option text | TC_51 |
| TC_54 | Mark correct option | TC_54 |
| TC_56 | Dropdown → Text | TC_56 |
| TC_57 | Drag & Drop + Properties of Blank | TC_57 |
| TC_59 | Shuffle Choices | TC_59 |
| TC_62 | All styles selectable | TC_62 |

### Partial / remapped TC numbers in spec

| Spec test title | Actual behavior | PDF TC with same intent |
|-----------------|-----------------|-------------------------|
| TC_19 | Case Sensitive toggle | *(not TC_19 in PDF — PDF TC_19 is keyboard nav)* |
| TC_26 | Generic Feedback text fields | *(PDF TC_26 is empty-sentence save error)* |
| TC_35 | Try Again / Show Me exist | *(PDF TC_35 is option type persistence)* |
| TC_38 | Script injection sanitized | PDF **TC_37** (script injection) |
| TC_25 | Delete single FIB | PDF **TC_24** (delete selected) |

When extending FIB coverage, **align new test titles with PDF TC numbers** to avoid confusion.

### Not yet automated (from PDF)

| QC TC | Category | Reason / approach |
|-------|----------|-------------------|
| TC_01 | Login/launch | Covered by `01-session-launch.spec.ts` (authoring URL, not partner portal login) |
| TC_16 | Add/remove sentences | Partial — remove not tested |
| TC_18 | Min/max blanks per sentence | Needs limit discovery in template |
| TC_19 (PDF) | Keyboard navigation | a11y — Cypress tab traversal |
| TC_20 | Tooltips | Hover + assert title attributes |
| TC_21 | Undo/redo | Ctrl+Z/Y on contenteditable |
| TC_22 | Preview matches authoring | Requires preview iframe spec |
| TC_23 | Copy edit independence | Partial via TC_24 |
| TC_25 (PDF) | Feedback in preview | Preview + reader flow |
| TC_26 (PDF) | Empty sentence save error | Negative — assert Save disabled / error toast |
| TC_27 | Unique identifiers on copy | Assert distinct `saved-index` |
| TC_28 | No media in normal FIB | Covered by TC_29 |
| TC_30 | Answer validation in preview | Preview iframe + player-container.js |
| TC_31 | Layout in all styles | Visual regression or class assertions per style |
| TC_32 | Drag-reorder sentences | If supported in template |
| TC_33 | Save without header | Negative validation |
| TC_34 | Copy preserves settings | Deep copy assertion |
| TC_35 (PDF) | Option type persists after save | Save + reload assertion |
| TC_36 | Accessibility tags | a11y audit |
| TC_37 (PDF) | Script injection | **Automated as spec TC_38** |
| TC_38 (PDF) | Max sentences | Add until limit / warning |
| TC_39 | Minimum required fields | Save with minimal data |
| TC_40–TC_41 | Persist after refresh | Save + `cy.reload()` |
| TC_42 | Many FIBs performance | Stress test (optional) |
| TC_43 | Keyboard blank shortcuts | If supported |
| TC_44 | Sentence numbering in preview | Preview spec |
| TC_45–TC_46 | Label in preview / screen reader | Preview + a11y |
| TC_47 | Network loss on save | `cy.intercept` fault injection |
| TC_48 | Insert Blank (duplicate of TC_17) | Covered by TC_17 |
| TC_49–TC_50 | 20 option limit | Loop add + assert cap |
| TC_51 (PDF) delete option | Delete icon on option row | Not yet |
| TC_52 | Wrong answer red mark in reader | Reader mode |
| TC_53 | Dropdown → Text | Covered by TC_56 |
| TC_55 | Image in D&D blank | File upload fixture |
| TC_57 (PDF) | Distractors in D&D | Distractor checkbox flow |
| TC_58 | Copy success popup | Covered by TC_03 |
| TC_59 (PDF) | Style in preview | Partial — authoring only |
| TC_60–TC_61 | *(PDF ends at TC_59 in visible pages)* | TC_62 in spec = style iteration |

---

## 6. Custom commands used by FIB

Defined in `support/commands.ts`:

```typescript
cy.openAuthoringTool(url)
cy.createTestStep('GenericStep')
cy.dropFibIntoGenericStepColumn()
cy.fillFibDummyContent()
cy.openFibSettings()
cy.insertFibBlank()
cy.ensureFibDeepSetup({ through: 'content' | 'settings' | ... })
cy.ensureOnFibGenericStep()
cy.pasteFibIntoNextGenericStepSlot()
cy.captureLiveStep('fib-settings-panel-open')
```

Export: `FIB_SELECTORS` constant for wrapper/template/header/sentence/body.

---

## 7. Live preview milestones (FIB)

Mapped in `cypress.config.ts` → `LIVE_STEP_TITLES`:

1. Open launch URL  
2. TOC → + Add  
3. Add New Step chooser  
4. Select Generic Step  
5. Fill metadata wizard  
6. Submit wizard  
7. New step in TOC  
8. Generic Step canvas ready  
9. Prepare column for FIB drop  
10. FIB dropped into Generic Step  
11. Enter header + sentence  
12. Open FIB settings panel  

Dashboard shows 8 steps from `fixtures/component-flows.json` → `fill-in-the-blank.setupFlow`.

---

## 8. How to run

### Dashboard (recommended)

1. `npm start` → sign in at `http://localhost:4321` → dashboard
2. Component Test → select **Fill in the Blank** only
3. Run Component Tests → Test Run View

### CLI

```bash
cd authoring-tests
set CYPRESS_AUTHORING_LAUNCH_URL=https://stagingauthor.kitaboo.com/...?courseId=...&userToken=...
npx cypress run --spec e2e/13-fib-deep.spec.ts
```

---

## 9. Common failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| Step 1 fails immediately | Session Expired | Fresh `userToken` in launch URL |
| FIB on Instructions page | Wrong drop target | Use Generic Step + `dropFibIntoGenericStepColumn` |
| Settings panel empty | Clicked inner `.fib` only | Click `.sd-item` or use `openFibSettings()` |
| Header text not saved | Used `cy.type()` | Use `setContentEditableOn()` |
| Live preview blank | Stale dashboard | Ctrl+F5; check `runs/<id>/screenshots/live/` |

Full troubleshooting: [TEST-RUNNER-SOLUTION.md](TEST-RUNNER-SOLUTION.md#14-troubleshooting).

---

## 10. Extending FIB coverage

Use this checklist for each new PDF test case:

1. Read TC steps + expected result in `Author Test Cases - FIB test cases.pdf`
2. Identify selectors in `KITABOO_Authoring/templates/fib/`
3. Add `it('TC_XX — ...')` to the appropriate suite in `13-fib-deep.spec.ts`
4. Use `ensureFibDeepSetup()` in `beforeEach` unless setup test
5. Call `cy.captureLiveStep()` at major milestones
6. Update this document's mapping table
7. Run via dashboard Component Test mode and verify live preview

Reference prompt for other components: [MASTER-AGENT-PROMPT.md](MASTER-AGENT-PROMPT.md).

---

*Last updated: May 2026*
