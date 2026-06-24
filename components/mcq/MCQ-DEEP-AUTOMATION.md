# MCQ (Single Choice) — Deep Automation

Component-centric deep automation for **MCQ / Multiple Choice (Single Choice)**.

- **Spec:** `components/mcq/11-mcq-deep.spec.ts`
- **QC PDF:** `D:/ELA/Author_Test_cases/Author_Test_cases/Author Test Cases - MCQ .pdf` (TC_01–TC_102 + Sample Layer block)
- **Source (implementation authority):** `closify/KITABOO_Authoring/templates/multiple-choice-template/`
- **dataType:** `multiple-choice-template` · **Drop target:** Generic Step column (ELA/Math)

> Status: **generated, not yet verified against a live session.** Run via dashboard Component Test → Multiple Choice with a fresh `AUTHORING_LAUNCH_URL`, then update `component.json.coverage.lastVerified`.

---

## Source-verified rules (anti-hallucination)

| Rule | Value | Source |
|---|---|---|
| Min options | 2 (delete disabled at ≤2) | auth.html `.row-delete ng-class choiceList.length <= 2` |
| Max options | 10 (add disabled at ≥10) | auth.html `.add-question-options-mcq ng-class choiceList.length >= 10` |
| Default options | 4 (A, B, C, D) | default JSON `choiceList` |
| Default correct | C | default JSON `correctChoice: ["C"]` |
| Default style | `card-style1` | default JSON `style.selected_style` |
| Label Types render | only when `currSettings.isShowme` | settings.html `ng-if="currSettings.isShowme"` |
| Feedback section renders | only when `currSettings.isShowme` | settings.html `ng-if="currSettings.isShowme"` |
| Reset selector | reuses `id="add-show-me"`, bind `ng-model="currSettings.reset"` | settings.html (duplicate id) — target by binding |

---

## Automated cases (38)

Step creation TC_04–09 (via `cy.createTestStep`), drop TC_10, default style TC_11,
content TC_78/79, answer type TC_45/46, style switch TC_12, media TC_15/16/18/19/21/22,
feedback TC_23/26/27, activity controls TC_29/30/31/32/33/34/35/36/37,
label types TC_38/64–69/71, options TC_72/77 + MAX rule, save presence TC_62/63,
Sample Answer SL_TC_77/78/86/87/88, plus a security (script sanitization) check.

See `mcq-mapping.json` for the exact QC→`it()`→selector map.

### Partial (authoring-side only)
- **TC_15/16** — align radios verified present; pixel alignment is a Reader check.
- **TC_21** — invalid URL is accepted into the field; the "Invalid media link" error is Publish/Reader-side.
- **TC_62/63** — Save button presence verified; enable/disable-on-validation is Reader/Publish behavior.

---

## Deferred cases (Reader / Preview / Publish / cross-session)

Kept as `it.skip()` in suite `11-Z` with a reason each. These need a Reader/Publish
harness not present in the authoring tool:

TC_01–03 (portal/login), TC_13/14/17/28/39/50/51/70 (persist/publish),
TC_23r/24/25/29r/30r/32r/34r/40/41/42/43/44/48/49/52 (Reader behavior),
TC_74 (math editor — separate Jodit suite),
SL_TC_79–85, SL_TC_89–102 (Sample Answer in Reader, a11y, cross-session).

---

## Discrepancies (QC vs source vs prior automation)

1. **Duplicate TC numbering in PDF** — TC_77–TC_102 appear twice (main + "Sample Layer").
   Resolved by prefixing the second block `SL_`.
2. **Prior `e2e/11-mcq-deep.spec.ts` had false coverage** — many `if(len){}else{log}` blocks
   passed without asserting. This rewrite uses real assertions and source-verified selectors.
3. **Reset duplicate id** — source reuses `id="add-show-me"` for the Reset checkbox; prior
   spec could toggle the wrong control. Now targeted via `ng-model="currSettings.reset"`.
4. **Label/Feedback visibility** — depend on `isShowme`; tests now enable Show Me first
   (`cy.ensureMcqShowmeOn()`), which the prior spec did not guarantee.

---

## How to run

```bash
# Dashboard (recommended): Component Test → Multiple Choice, fresh launch URL
node server.js

# CLI (only this spec)
npx cypress run --config-file cypress.config.ts --spec "components/mcq/11-mcq-deep.spec.ts"
```
