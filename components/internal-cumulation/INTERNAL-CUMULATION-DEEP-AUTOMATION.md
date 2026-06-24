# Internal Cumulation — Deep Automation

- **Component slug:** `internal-cumulation`
- **dataType (catalog id):** `internal-cumulation` _(not a DOM `data-type` — see below)_
- **Spec:** `48-internal-cumulation-deep.spec.ts`
- **QC authority:** `Author Test Cases - Internal Cumulation.pdf` (TC_01–TC_70)
- **Source authority:**
  - `closify/KITABOO_Authoring/index.html` (Import From Library entry + `#asset-library-popup` modal)
  - `closify/KITABOO_Authoring/editor/ngcontroller.js` (`openAssetLibrary`, `selectActivity`, `selectStep`, `selectLos`, `addActivityFromLibrary`, `programName`)

## Mechanism (source-verified)

> **There is NO dedicated "cumulation" authoring widget.** Grepping
> `config/config.js` and `index.html` for `cumulation` returns **no UI** — only
> `accumulate` tokens inside the MathQuill / underscore math libraries.

"Internal Cumulation" in the QC suite is realised through the shared **Asset
Library / "Import From Library"** flow:

- TOC **"+ Add" → "Import From Library"** (`li[ng-click="openAssetLibrary($event)"]`),
  gated by `ng-show="getProgramName()"`.
- Opens **`#asset-library-popup`** with:
  - Search: `input[ng-model="assetLibInput"]`
  - Activity table: `tr[ng-repeat="(key, value) in assetLibraryList"]` (selected → `.selected-activity`)
  - Preview steps: `.step-block` (selected → `.selected`)
  - LOS chips: `.los-chip` (selected → `.selectedLos`, disabled → `.disableInsert`)
  - **Insert**: `div[ng-click="addActivityFromLibrary()"]` — enabled only when an
    activity **and** at least one LOS are selected.

The author re-uses (duplicates/imports) a step from the **same** activity. The
**cumulative score / LOS roll-up from child to parent steps** is a
**Reader/Preview RUNTIME** behaviour and is **not authorable from the DOM**.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 12 | Import entry (flag-gated), library open, search (exact/partial/no-match), listing columns, step+LOS insert-gating, cancel, filters, security |
| Deferred | 58 | Runtime aggregation (Core/Moderate/Light/Intensive LOS, before/after submit), teacher-vs-student reports, persistence-after-reload, content fidelity, publish/republish, network/offline, a11y |

## Why so many deferrals

Internal Cumulation is **runtime-scoring heavy**. The bulk of the QC suite
(TC_35–TC_70) targets **Reader/Preview score aggregation** and **teacher report**
states across Levels of Support — none of which are observable or configurable
from the authoring DOM. Those are intentionally `it.skip()` with explicit
reasons in the spec and `internal-cumulation-mapping.json`.

## Run

```bash
npx cypress run --spec "components/internal-cumulation/48-internal-cumulation-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ **Not yet live-verified** against a running authoring instance. Selectors
> are source-derived from `index.html` + `ngcontroller.js`. The "Import From
> Library" entry is `getProgramName()`-gated, so on a build without program
> context the import/library blocks log + return gracefully (they will not
> fail). A single live run with a program-scoped activity is needed to confirm
> the `#asset-library-popup` selectors.
