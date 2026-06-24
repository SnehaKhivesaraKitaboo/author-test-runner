# External Cumulation — Deep Automation

- **Component slug:** `external-cumulation`
- **dataType (catalog id):** `external-cumulation` _(not a DOM `data-type` — see below)_
- **Spec:** `49-external-cumulation-deep.spec.ts`
- **QC authority:** `Author Test Cases - External Cumulation.pdf` (TC_01–TC_47)
- **Source authority:**
  - `closify/KITABOO_Authoring/index.html` (Import From Library entry + `#asset-library-popup` modal)
  - `closify/KITABOO_Authoring/editor/ngcontroller.js` (`openAssetLibrary`, `selectActivity`, `selectStep`, `selectLos`, `addActivityFromLibrary`, `programName`)

## Mechanism (source-verified)

> **There is NO dedicated "external cumulation" / "external lesson linkage"
> authoring widget.** Grepping `config/config.js` and `index.html` for
> `cumulation` returns **no UI** — only `accumulate` tokens inside the MathQuill
> / underscore math libraries.

"External Cumulation" in the QC suite has **two facets**:

1. **Authoring (DOM-assertable):** importing a step from a **different**
   activity via the shared **Asset Library / "Import From Library"** flow — the
   same `#asset-library-popup` modal as Internal Cumulation, but the author
   selects a **cross-activity** source.
   - Entry: `li[ng-click="openAssetLibrary($event)"]`, gated by `ng-show="getProgramName()"`.
   - Search: `input[ng-model="assetLibInput"]`; activity table: `tr[ng-repeat="(key, value) in assetLibraryList"]`.
   - Preview steps `.step-block`; LOS chips `.los-chip`; Insert `div[ng-click="addActivityFromLibrary()"]`
     (enabled only when an activity **and** at least one LOS are selected).
2. **Runtime (deferred):** cross-lesson **SCORM data patching** between external
   lessons (activity **6.3 ↔ 6.5**) — data entered/submitted in one lesson
   cumulates into another, including the **"SCORM API failed"** popup. This is a
   Reader/SCORM runtime behaviour, **not authorable from the DOM**.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 12 | Import entry (flag-gated), library open, cross-activity search (exact/partial/no-match), listing metadata, step+LOS insert-gating, cancel, filters, security |
| Deferred | 35 | Cross-lesson SCORM patch (6.3↔6.5, first/repeat attempt, In-Progress, SCORM-failure), content fidelity, publish/republish, permissions, teacher reports, source-integrity |

## Why so many deferrals

External Cumulation is **runtime-scoring heavy**. The defining QC cases
(TC_38–TC_47) target **cross-lesson SCORM data patching** observable only in the
Reader at runtime; the import-fidelity / publish / permission cases require
Preview/Reader and post-insert state. None are observable from the authoring
DOM, so they are intentionally `it.skip()` with explicit reasons in the spec and
`external-cumulation-mapping.json`.

## Run

```bash
npx cypress run --spec "components/external-cumulation/49-external-cumulation-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance. Selectors
> are source-derived from `index.html` + `ngcontroller.js`. The "Import From
> Library" entry is `getProgramName()`-gated, so on a build without program
> context the import/library blocks log + return gracefully (they will not
> fail). A single live run with a program-scoped activity (and at least one
> other activity in the library) is needed to confirm the `#asset-library-popup`
> selectors.
