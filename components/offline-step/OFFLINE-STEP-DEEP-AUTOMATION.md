# Offline Step — Deep Automation

- **Component slug:** `offline-step`
- **dataType / identifier:** `offline-step` / `offlineStep`
- **Spec:** `50-offline-step-deep.spec.ts`
- **QC authority:** `Author Test Cases - Offline step.pdf` (TC_01–TC_43)
- **Source authority:**
  - `js/page-tray.js` — step chooser catalog. Offline Step is in the
    **Non-interactive Step** category: `{ identifier: "offlineStep",
    stepName: 'Offline Step', name: 'Offline Step', disable: false,
    tooltip: 'Create your offline step' }`.
  - `index.html` — dynamic chooser (`#widget-popup`, `ng-repeat "step in
    obj.list"` → `.hover-div`/`.step-div`/`.step-text`, card
    `ng-click="pageType(step.identifier,step.stepName)"`), shared metadata
    wizard (`#formsModal`), TOC step rows + per-step kebab menu.
  - `config/config.js` — `offlineStep` gating object (the **no interactive
    widgets / printable content only** rule).
  - `editor/ngcontroller.js` — `case "offlineStep"` resolve()s with **no
    dedicated JSON template**; `pageType("offlineStep","Offline Step")` opens
    the wizard and pushes `Offline Step` into the keyword tag list.

> ⚠️ **NOT YET LIVE-VERIFIED** against a running authoring instance — all
> selectors are source-derived from the files above. A single run with a valid
> `AUTHORING_LAUNCH_URL` will confirm the chooser/wizard/canvas selectors and
> the runtime scope gating probe in the RULE suite.

## Scope

This component is the **Offline STEP TYPE itself** — not a dropped widget. It
covers:

- Adding an Offline Step from the **step chooser/tray** (Non-interactive Step
  category card).
- The shared **metadata wizard** — mandatory Step Title, Instructions for
  Students/Teachers, **Cancel**, and **Change Step**.
- The source-derived **no-interactive-widgets / printable-content-only rule**
  (config gating + tray DOM).
- The **standard editor canvas** the offline step lands on (no dedicated
  template).
- The **TOC lifecycle** — Edit Metadata, Delete step.
- A **security** check (script injection into Instructions is inert).

## Architecture notes (source-verified)

- **No dedicated template.** Unlike Generic Step, `ngcontroller.js`
  `case "offlineStep"` calls `resolve()` with no `jsonPath`. The offline step
  reuses the standard `#desktop_view` editor. Its identity is the **config
  gating**, not a unique canvas DOM.
- **Chooser card** is rendered dynamically from `page-tray.js`
  (`scope.pageTrayStep`), not the commented-out static `.step-block` markup in
  `index.html`. The active card is `.hover-div` with `.step-text p` = `Offline
  Step`.
- **Metadata wizard** (`#formsModal`) is shared: `#title` (`ng-model
  stepTitle`) is mandatory (`#nextBtn` gets `disabledBtn` while `!stepTitle`);
  `#studentDesc`/`#teacherDesc` are the Instructions textareas (10000-char
  budget); `#cancelBtn` (`cancelAndReset()`), `#backPageTray` (`backPage()` →
  reopens the tray). `pageType('offlineStep','Offline Step')` pushes an
  `Offline Step` keyword tag.
- **No-interactive-widgets rule** (`config/config.js` `offlineStep`):
  - **Layouts** `layout-1`..`layout-7` = `false`.
  - **Interactive assessment widgets** (`multiple-choice-template`,
    `fill-in-the-blank`, `match-the-pairs`, `mtp-multiple`, `highlight`,
    `correction`, `sorting`, `imagelabelling`,
    `group-interactivity-template`, `clickToReveal`, `wordsearch`,
    `shortLongAns`, `flashcard`, `Categorize`, `true-false-template`,
    `tableGO`, `identify-the-clip`, `graphicOrganizerImageHotSpot`,
    `annotationHighlightOutline`, `lessonOpenerComponent`) = `false`.
  - **Printable / non-interactive content** (`header`, `paragraph`, `poetry`,
    `image`, `video`, `audio`, `html-interactivity`, `tablesNew`,
    `sidebarComponent`, `slideshow`, `situationbox`, `sketchpad`,
    `chapter-headingNew-h1`, `aside-bar`) = `true`.
- **Per-step TOC kebab menu** (`.tocMenuDiv` → `.tocPageIconMenu`): Clone New
  Level (`tocSectionClonePopup`), Edit Metadata (`tocSectionEditPopup`), Delete
  (`tocSectionDeletePopup`, gated by `canDeletePage`).

## Reused framework helpers (NOT redefined)

From `support/`:

- `cy.openAuthoringTool` — launch + editor readiness.
- `cy.createTestStep('Offline Step')` — full chooser → wizard → save pipeline
  (reused by `createOfflineStep`; skips the Generic-Step-specific canvas
  assertions for non-GenericStep labels).
- `cy.captureLiveStep` — live-preview screenshots.
- `cy.waitForLoaderGone`, `cy.waitForEditorReady`.

Component-local helpers added in `commands.ts` (no duplication of the above):
`ensureOfflineStepDeepSetup`, `openOfflineStepChooser`,
`closeOfflineStepChooser`, `findOfflineStepCard`, `openOfflineStepWizard`,
`cancelOfflineStepWizard`, `createOfflineStep`, `openOfflineStepTocMenu`.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 9 | Launch/entry (TC_01–03), add from chooser (TC_04), Step Title mandatory (TC_05), Cancel (TC_06), Change Step (TC_07), Instructions Students/Teacher (TC_08/09). Plus non-QC-numbered RULE / CREATE / EDIT / DELETE / SEC checks. |
| Deferred | 34 | TC_10–TC_43: per-element/per-widget drag-drop authoring, media upload, RTE/table/callout formatting, situation header, CLIC/Carousel/Sidebar, undo/redo, Save/Preview/Reader/Publish/republish, performance, and unsupported-format rejection. |

**Automated QC TCs:** TC_01, TC_02, TC_03, TC_04, TC_05, TC_06, TC_07, TC_08,
TC_09.

The spec also runs source-contract checks that are not 1:1 QC IDs:
`RULE-CONFIG` / `RULE-TRAY` / `RULE-PRINTABLE` (the no-interactive-widgets
rule), `TC_CREATE` (end-to-end create), `TC_EDIT` / `TC_DELETE` (TOC
lifecycle), and `SEC` (script-injection safety).

## Why so many deferrals

The QC suite (TC_10 onward) is dominated by **per-element / per-widget
authoring** (Header/Title/Text/Image/Audio/Video/HTML/Table/Callout/Situation
Header, CLIC/Carousel/Sidebar), **media uploads via OS file pickers**,
**RTE/table/callout formatting + undo/redo**, and **Save/Preview/Reader/
Publish/republish + performance**. These require runtime canvas interaction
outside the step-creation DOM (or Preview/Reader/CLP flows) and are
intentionally `it.skip()` with explicit reasons in the spec and
`offline-step-mapping.json`. The automated set focuses on what is reliably
verifiable for the **step itself** plus the **source-derived gating rule** that
makes the offline step distinct.

## QC vs source ambiguity (flagged)

- The QC PDF lists CLIC / Carousel / Sidebar as enabled **widgets** and
  Header/Title/Text/etc. as enabled **elements** for the offline step. The
  shipped `config/config.js offlineStep` block confirms **printable** content
  (incl. `slideshow`=Carousel, `aside-bar`/`sidebarComponent`=Sidebar,
  `situationbox`, `sketchpad`) is enabled and **interactive assessment
  widgets** are disabled — consistent with "printable, no interactive widgets".
  The automation follows the **config source of truth**, asserting the blocked
  set is absent rather than enumerating the full enabled tray (deferred).
- The QC narrates "create **math** activity" entry (TC_02). Activity creation +
  start-authoring is covered by the pre-authored `AUTHORING_LAUNCH_URL` landing
  on the editor, so TC_01–TC_03 collapse into a single readiness assertion.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/offline-step/50-offline-step-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
