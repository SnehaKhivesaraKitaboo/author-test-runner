# WL Multipart — Deep Component Automation

> ⚠️ **NOT YET LIVE-VERIFIED.** These specs were derived **statically** from the
> KITABOO Authoring source (config + templates + directive) and the QC catalog.
> They have **not** been executed against a live Studio URL. Selectors, gating,
> and the flag-gated drop path must be confirmed on a real WL activity before the
> automated/deferred split is treated as final.

## Component identity (verified from source)

| Field | Value | Source |
|---|---|---|
| QC name | WL Multipart | `wl-multipart-testcases.json` |
| Catalog name | **Multipart Question** (alias **Group Activity**) | `config/config.js` (lines ~268, ~2248) |
| dataType | **`group-interactivity-template`** | `config/config.js` |
| Directive | `[group-interactivity]` (canvas) / `[group-interactivity-settings]` (panel) | `group-activity-directive.js` |
| Canvas wrapper | `.group-interactivity-container` | `group-activity.html` |
| Settings panel | `#fib-settings-panel[group-interactivity-settings]`, title "Group Activity" | `group-activity-settings.html` |
| Module | **wl** (single-page canvas) | `support/module-setup.ts` |
| QC count | **205** | `wl-multipart-testcases.json` |

### Verified dataType / name / mechanism / module

- **dataType = `group-interactivity-template`** (NOT a literal `wl-multipart`
  dataType). The `support/module-setup.ts` `NAME_TO_DATA_TYPE` alias
  `'wl multipart' → 'wl-multipart'` does **not** correspond to a real catalog
  dataType; the actual draggable widget the QC describes is the catalog
  **"Multipart Question"**, whose `dataType` is `group-interactivity-template`.
  This is the **source ambiguity** flagged below — selectors are derived from the
  real `group-activity` template, not the alias.
- **Mechanism**: `group-interactivity-template` ∈ `ASSESSMENT_DATA_TYPES`, but for
  the **WL** module `resolveDropTarget(...) === 'canvas'` and `cy.dropComponent`
  explicitly permits this assessment widget **only when module === 'wl'**. So the
  Multipart shell is dropped onto the **Instructions-for-Students canvas**
  (`#desktop_view`), not into a Generic Step column.
- **Module run note**: this suite **must** run with
  **`CYPRESS_AUTHORING_MODULE=wl`**. Without it, `getAuthoringModule()` defaults
  to `ela`, `resolveDropTarget` routes to a Generic Step column, and
  `cy.dropComponent` throws for this assessment widget.

```bash
# from author-test-runner/
CYPRESS_AUTHORING_MODULE=wl CYPRESS_AUTHORING_LAUNCH_URL="<wl-studio-url>" \
  npx cypress run --spec "components/wl-multipart/42-wl-multipart-deep.spec.ts"
```

## FLAG-GATING (important)

`config/config.js` carries a per-subject feature map where
`"group-interactivity-template": true | false`. Several subjects set it **false**,
meaning the widget is **not offered** in the catalog for that subject. The drop
helper (`dropWlMultipartIntoCanvas`) **probes the live widget registry** and
logs + returns gracefully when the widget is absent. Every test guards with a
presence short-circuit (`withMultipart(...)`), so a flag-gated subject yields
informative skips rather than hard failures.

## Multipart structure (verified)

- Default `questionBank` length = **1** (`group-activity/default/group-activity.json`).
- Each part is a `.question-container`; an empty part shows `.empty-droppable-text`
  with the hint **"Drag Assessment widget from right panel"**.
- Parts **auto-grow**: after a widget is dropped into a part
  (`onDropComplete` / `onPasteDropComplete`), the directive pushes a fresh empty
  part — capped at **35**. There is **no standalone "add part" button** in the
  source DOM. `addWlMultipartPart` documents this rather than inventing a control.

## Settings panel controls (verified)

| Control | Selector | Notes |
|---|---|---|
| Interactive Component Yes/No | `input[ng-model="currSettings.isInteractive"]` | default `yes` |
| Tags | `#metaTagsInput` | helper "Enter , to seperate to tags" |
| Shuffle Questions | `#add-shuftle-choices` | default off |
| Background Color | `#grp-Background` → colour picker | reveals picker |
| Corner Radius | `#grp-CornerRadius` → `#border_radius-input` | `maxlength=2` |
| Outline / No Outline | `input[name="outline"]` (`outlineBg` / `outline`) | default `outline` |
| Action Assets colour | `#appearanceInput` | default `#7eb1eb` |
| Try Again / Show Me / Reset | `#add-activity-restart` / `#add-show-me` / `#btn-rest` | **only when `!isGradableActivity`** |
| Header Background Color | `#headerBgColorInput` | **only when `styleClass=="workedExample"`** |
| Hide/Show toggle | `.toggle-bar .showhideButton` | **only when `styleClass=="workedExample"`** |

Flag/style-gated controls are handled with graceful `log + return` when not rendered.

## Automated vs Deferred — honest split (22 automated / 183 deferred of 205)

This is the **largest** QC suite and, as expected, **mostly deferred** — the bulk
of the catalog tests behaviour that does **not** live in the multipart-shell
authoring DOM.

### Automated (22) — shell + settings authoring DOM
Canvas reachable / drop (TC_01, TC_03, TC_04), settings panel + identity (TC_99),
Interactive Component (TC_50/51/87/88), Shuffle (TC_52/89), Background Color
(TC_53/81/83), Corner Radius (TC_54/85), Tags (TC_91/92), Outline & Action Assets
(TC_55/56/57/94/95). Plus non-QC-numbered structure, copy-chrome, and security
checks.

### Deferred (183) — `it.skip(...)` in `42-Z`
- **Widget-internal** drops (TC_10–TC_49): adding Title/Header/Text/media and the
  many assessment widgets *inside* the parts — each is its own component's DOM.
- **Per-language special-character keyboards** (TC_110–TC_152): these belong to
  the Extended Response / FIB widgets dropped into parts, not the multipart shell.
  There is **no language markup** in `group-activity` source.
- **Preview/Reader runtime** (TC_17, TC_19, TC_58–TC_69, TC_153–TC_205): play,
  submit, scoring icons, counts, pagination, option outlines, progress bar.
- **Persistence-after-reload** (TC_96, TC_97, TC_103, TC_104, TC_139, TC_162, TC_183).
- **Lifecycle / server** (save/publish/data-patch), **media upload validation**
  (TC_70, TC_71, TC_73), **responsive / accessibility** (TC_105, TC_134, TC_140,
  TC_141, TC_163, TC_167, TC_202, TC_203), and **runtime validation**
  (TC_84 invalid hex, TC_86 non-numeric radius, TC_93 tag restrictions).
- **Step/pre-authoring flows** (TC_02, TC_05–TC_09) — Studio listing + Generic
  Step creation, not the multipart shell.

Every `TC_01`–`TC_205` appears **exactly once** in `wl-multipart-mapping.json`.

## Source ambiguity flagged

1. **`wl-multipart` alias vs real dataType.** `module-setup.ts` aliases
   `'wl multipart' → 'wl-multipart'`, but no catalog widget uses
   `wl-multipart` as a `dataType`. The real widget is **"Multipart Question"** /
   `group-interactivity-template`. Selectors are derived from the genuine
   `group-activity` template. If a distinct `wl-multipart` dataType is later
   introduced, re-derive selectors against it.
2. **Two catalog entries, one dataType.** Both "Group Activity" and
   "Multipart Question" map to `group-interactivity-template`; the drop is by
   `dataType` (with name fallback) so either catalog label resolves.
3. **`isGradableActivity`** is a runtime/parent-scope flag; whether Try Again /
   Show Me / Reset render cannot be asserted statically — handled gracefully.
4. **Worked Example style** is not the default (`style2`), so Hide/Show and Header
   Background Color are gated and treated as deferred/graceful.
