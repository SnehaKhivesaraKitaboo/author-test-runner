# LoD + Annotation Cue — Deep Component Automation

> ⚠️ **NOT YET LIVE-VERIFIED.** Selectors and flows in this component were
> **derived from the KITABOO_Authoring source templates** (HTML / settings panel /
> directive / config), but they have **not** been run against a live build. Both
> the **LoD** layer and the **Annotation Cue** widget are **flag-gated off** by
> default in `config/config.js` (the layout droppability map sets `"lod":false`
> and `"annotationCueHighlightOutline":false`). Until that flag is enabled, the
> drop-dependent tests follow their **graceful `ℹ` log-and-return paths** rather
> than asserting. Re-verify selectors and re-run once the feature is enabled.

- **Spec:** `39-lod-annotation-cue-deep.spec.ts`
- **QC authority:** `Author Test Cases - LoD and Annottaion cue.pdf` (TC_01–TC_144, 144 cases)
- **Catalog:** `lod-annotation-cue-testcases.json`
- **Mapping:** `lod-annotation-cue-mapping.json` (every TC_01..TC_144 listed once)

## Verified component facts (from source)

| Field | Value | Source |
|---|---|---|
| Widget name | **LoD** | `config/config.js` Layer section |
| `dataType` | **`lod`** | `config/config.js` |
| Section / category | **Layer** | `config/config.js`, `e2e/09-component-deep.spec.ts` registry |
| Icon class | `icon-LOD` | `config/config.js` |
| Canvas template | `templates/LoD/LoD.html` | — |
| Settings panel | `#lod-template-setting` (title "LoD") | `templates/LoD/LoD-setting-panel.html` |
| Related widget | **Annotation Cue** — `dataType` `annotationCueHighlightOutline` | `config/config.js` |
| Cue template | `templates/annotation-cue/annotation-cue.html` | — |
| Cue settings | `.annotation-cue-setting` (title "Annotation Cue") | `templates/annotation-cue/annotation-cue-setting.html` |

## Drop / enable mechanism

- **LoD is a Layer, not an assessment widget.** `support/module-setup.ts`
  `resolveDropTarget` routes non-assessment types to the **canvas**
  (`#desktop_view`). `cy.dropComponentForModule('LoD', { dataType: 'lod' })`
  performs the injection through the AngularJS controller's `onDropComplete`.
- **The LoD column only accepts Annotation Cue.** `LoD-directive.js`
  `onDropComplete()` returns early unless
  `data.dataType === 'annotationCueHighlightOutline'`. The cue is injected via the
  LoD template scope's `onDropComplete` against the LoD `.column-content`.
- **Flag-gated.** When either widget is absent from `scope.widgets`,
  `cy.lodWidgetAvailable()` returns `false` and helpers log + return instead of
  throwing.

## Display Criteria are backend-seeded

The LoD settings "Display Criteria" groups (Level of Support, Type, Activity and
their values CORE / LIGHT / MODERATE / INTENSIVE, etc.) are loaded from a backend
API (`fetchLODSettingData` / `fetchLODSettingDataById`). `displayCritaria` is `[]`
by default, so **value-level QC cases require a provisioned backend** and are
deferred. The spec asserts the **section + default-OFF toggle contract** only,
and logs gracefully when no groups are rendered.

## Automated vs Deferred — honest split

- **Automated: 25** — `TC_04, TC_05, TC_07, TC_08, TC_09, TC_10, TC_11, TC_13,
  TC_15, TC_16, TC_18, TC_19, TC_22, TC_23, TC_28, TC_36, TC_37, TC_39, TC_42,
  TC_43, TC_50, TC_84, TC_117, TC_118, TC_123` (DOM-assertable in the authoring
  tool: drop/render, settings panels & titles, Display Criteria section + default
  toggles, Link Activity input + add/list/delete + empty/duplicate validation,
  cue title/body/placeholder/pen-icon/colour, unique `lod-id`, delete, security).
- **Deferred: 119** — `it.skip()` in suite `39-Z`. Reasons:
  - **Backend-seeded Display Criteria values & DB sync** (TC_20, TC_21, TC_24, TC_26, TC_27, TC_100, …).
  - **CLP / Reader rendering** of LoD & cues, highlights, notes, Show/Hide toggle (TC_65–TC_111, TC_125–TC_140, …).
  - **Publish / republish / student-view** propagation (TC_47, TC_61–TC_64, TC_75, …).
  - **Persistence-after-reload** (TC_25, TC_38, TC_40, TC_58, TC_99, TC_114, TC_134, TC_135).
  - **RTE-toolbar formatting, media upload, clipboard paste, multipart/layout paste** (TC_30–TC_32, TC_120–TC_122, TC_142–TC_144).
  - **Cross-device & accessibility** (TC_96, TC_136–TC_138).
  - **EPUB project bootstrap, confirmation modals, undo/redo, drag positioning, toasts, tooltips, max-limit add-button states** (TC_01–TC_03, TC_06, TC_12, TC_14, TC_17, TC_41, TC_44, TC_45, TC_49, TC_51–TC_59, TC_124, TC_141).

## Source ambiguity / caveats

- **`lod-annotation-cue` is two distinct config widgets** (LoD layer +
  Annotation Cue widget) tested together, since QC mixes both. The docs'
  suggested single `dataType: lod` is correct for the LoD layer; the cue's real
  `dataType` is `annotationCueHighlightOutline` (verified in `config.js`).
- The provided `templates/layers/` folder is the generic **Layer** widget
  (`layer-1`), distinct from LoD — not used here except to confirm LoD lives in
  the same "Layer" section.
- Add-button visibility states (TC_50–TC_56) reference an `+ Add New` button that
  is **commented out** in the current `LoD-setting-panel.html`; the live flow uses
  the inline Ref-ID input + `.icon-Link` add icon. TC_50 is automated against the
  input-first state; the rest are deferred until the add-button affordance ships.
- Selectors are **derived, not live-verified** (see top warning).

## Running

```bash
# requires a live authoring URL with the LoD/Cue feature flag enabled
AUTHORING_LAUNCH_URL="<studio-launch-url>" \
AUTHORING_MODULE=ela \
npx cypress run --spec "components/lod-annotation-cue/39-lod-annotation-cue-deep.spec.ts"
```

Without `AUTHORING_LAUNCH_URL` the whole spec is skipped (`before` guard), exactly
like the sibling component specs.
