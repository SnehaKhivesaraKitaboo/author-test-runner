# CLIC (Sketchpad) — Deep Automation

> ⚠️ **Not yet live-verified.** All selectors are **source-derived** from the
> templates listed below, not confirmed against a running authoring instance.
> A single run is needed to confirm the element drop onto the canvas and the
> `#sketchpad` form selectors (`#clicuid`, `#instancename`, `.form-button`).

- **Component slug:** `clic`
- **dataType:** `sketchpad` · **widget name:** `CLIC Component` · **directive:** `sketchpad`
- **Spec:** `31-clic-deep.spec.ts`
- **QC authority:** `Author Test Cases - CLIC.pdf` (TC_01–TC_33)
- **Source authority:**
  - `config/config.js` (catalog entry: `name: "CLIC Component"`, `dataType: "sketchpad"`, `iconClass: "icon-clic"`, `isDroppable: true`)
  - `templates/sketch-pad/sketchpad.html`
  - `templates/sketch-pad/styles/sketchpad.css`
  - `templates/sketch-pad/default/sketchpad.json`
  - `templates/sketch-pad/scripts/sketchpad-directive.js`
  - `templates/sketch-pad/config.txt`

## Verified component facts

- **dataType:** `sketchpad` (confirmed in `config/config.js` at the `"CLIC Component"`
  catalog entry **and** the alternate entry, plus `config.txt`).
- **name:** `"CLIC Component"` in the authoring catalog (`config.js`). The
  standalone `config.txt` names it `"SketchPad"` — both map to the same
  `dataType` and template. The authoring catalog is authoritative.
- **Drop mechanism:** CLIC is an **element**, not an assessment widget.
  `sketchpad` is **not** in `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so
  `resolveDropTarget` returns `'canvas'`. It is dropped onto the
  **Instructions-for-Students** page (`#desktop_view`) via the existing
  `cy.dropComponent('CLIC Component')` primitive (matched by `name`). It is
  **not** dropped into a Generic Step column.

## What CLIC actually is (source over QC wording)

The QC PDF describes a generic "CLIC" component. The real source renders a
**CLIC Assignment pop-up form**, not a drawing canvas:

- `#sketchpad[sketchpad]` → `.form-container` → `.form-box`
- Title **"CLIC Assignment"** (`.form-title`) + `.form-icon`
- **CLIC identifier** field: `#clicuid` (contenteditable, `ng-keyup updateText`)
- **Instance Name** field: `#instancename` (contenteditable)
- **Submit** button: `.form-button[type="submit"]` → `submitCLIC()`

There are **no pen / colour / clear drawing tools** in the source, so the
would-be QC "drawing tools / colours / clear" expectations **do not apply**;
cases map to the actual Identifier / Instance Name / Submit form.

After submit (`submitCLIC` sets `settings.issubmitted = true`) — or when a
`clicuid` already exists on load — the directive swaps the form for a **CLIC
iframe** (`.sample-page > iframe[data-identifier]`, src from
`window.clicBaseUrl` + `clicid`). That iframe/auto-launch path is **runtime and
iframe-bound — deferred**.

## Settings panel

CLIC has **no dedicated settings template on disk** — `config.js` references
`templates/sketch-pad/sketchpad-settings.html`, which is **absent**. Clicking
the component runs `con.displaySettingPanel()` into the generic
`.componentSettingPanel`. `cy.openClicSettings()` opens it **defensively**
(logs and returns when no panel is mounted).

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 7 | Drop (TC_05/06), pop-up title/icon (TC_04), fields + Submit presence (TC_08), valid input (TC_12), special chars (TC_15), long-text retention (TC_16), plus a security check and a graceful settings probe |
| Deferred | 26 | Login/activity bootstrap (TC_01–TC_03), non-generic-step negative drop (TC_07), submit validation/required messages (TC_09–TC_11), submit save + iframe swap (TC_13), visual/Figma (TC_14), backend save (TC_17), persistence/re-open/edit (TC_18, TC_24–TC_28, TC_32), Publish (TC_20), responsive (TC_21), instance limit/multi-instance (TC_22, TC_31), outside-click usability (TC_23), Preview/Reader/CLP (TC_19, TC_29, TC_30, TC_33) |

## Why these deferrals

QC TC_01–TC_03 are **login → create activity → start authoring** bootstrap
(handled by `cy.openAuthoringTool`, not assertions on the CLIC element). The
Submit button has **no `ng-disabled` binding** and no author-DOM validation
text, so required-field / disabled-state cases (TC_09–TC_11) are enforced at
**submit runtime** and deferred. Everything else requires flows **outside the
authoring DOM**: the **post-submit CLIC iframe**, **save/network**,
**persistence after reload**, **re-open / logout-login**, **multi-instance**,
**responsive layout**, and **Preview / Reader / CLP**. All are `it.skip()` with
explicit reasons in the spec and in `clic-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/clic/31-clic-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
