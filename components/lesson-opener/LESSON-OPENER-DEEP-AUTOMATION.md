# Lesson Opener (Lesson Opener Components) — Deep Automation

- **Component slug:** `lesson-opener`
- **dataType:** `lessonOpenerComponent` · **directive:** `lesson-opener-template`
- **Widget name (catalog):** `Lesson Opener Components`
- **Spec:** `44-lesson-opener-deep.spec.ts`
- **QC authority:** `Author Test Cases - Lesson Opener.pdf` (150 cases — `TC_01`–`TC_126` plus the `TC_103` family `TC_103__2`–`TC_103__25`)
- **Source authority:**
  - `config/config.js` (catalog registration)
  - `templates/lessonOpener/lessonOpener.html`
  - `templates/lessonOpener/lessonOpener-setting-panel.html`
  - `templates/lessonOpener/default/lessonOpener.json`
  - `templates/lessonOpener/scripts/lessonOpener-directive.js`
  - `templates/stylepanel.html` · `index.html`

> ⚠️ **Not yet live-verified.** Selectors are **source-derived** from the
> KITABOO_Authoring templates/config — this suite has **not** been run against a
> live authoring instance. A single headed run is required to confirm the drop,
> settings-panel, and style-switch selectors. Without `AUTHORING_LAUNCH_URL` the
> suite self-skips.

## Verified page type & navigation mechanism

Lesson Opener is registered in `config/config.js` as a **droppable element**:

```js
{
  name: "Lesson Opener Components",
  iconClass: "icon-Lesson-opener",
  dataType: "lessonOpenerComponent",
  url: "templates/lessonOpener/lessonOpener.html",
  json: "templates/lessonOpener/default/lessonOpener.json",
  settingsURL: "templates/lessonOpener/lessonOpener-setting-panel.html",
  isDroppable: true,
  enableGroupInteractivity: true,
}
```

Because `lessonOpenerComponent` is **not** in
`support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, the framework's
`resolveDropTarget` routes it to the **canvas**. The automation therefore:

1. `cy.openAuthoringTool(AUTHORING_LAUNCH_URL)`
2. `cy.navigateToCanvasPage()` → the **Instructions for Students** page
   (`#desktop_view`, an unrestricted canvas)
3. `cy.dropComponent('Lesson Opener Components')` → injects the catalog widget
   onto the canvas
4. Clicking the dropped component fires the `lesson-opener-template` directive's
   `introclick()` → `displaySettingPanel()`, which renders the settings panel
   inside `.componentSettingPanel` via `ng-include="settingsUrl"`.

### The four styles == the QC's four component groups

The dropped component renders **one** of four layouts gated by
`fieldData.settings.layoutColorActive`:

| Style | `layoutColorActive` | Fixed header label | Icon |
|---|---|---|---|
| Learning Prompt (default) | `style1` | `Learning Prompt` | `lessonOpener-Icon_1.svg` |
| Make a Connection | `style2` | `Make a Connection` | `lessonOpener-Icon_2.svg` |
| My Learning Goals | `style3` | `My Learning Goals` | `starIcon.svg` |
| Key Terms | `style4` | `Key Terms` | `keyTerm.svg` |

The QC's four component groups (**Key Terms / Make a Connection /
My Learning Goals / Learning Prompt**) are exactly these four styles, selected
from the shared `<stylepanel>` (`.stylebgdiv[id="style1".."style4"]`).

## Source ambiguity (flagged)

The QC PDF narrates a **"Drag and drop Lesson Opener … into Generic Step"**
flow, but the shipped `config.js` registers Lesson Opener as an **unrestricted
droppable element** (canvas), and `lessonOpenerComponent` is not classified as
an assessment widget. The automation **follows the source of truth** and drops
it onto the Instructions canvas. The QC's step-restriction / drop-guard cases
(`TC_21`, `TC_29`, `TC_33`, `TC_36`, `TC_37`, `TC_47`, `TC_48`, `TC_65`,
`TC_102`) are therefore deferred as **runtime drop-guard** checks rather than
asserted against a Generic Step.

## Architecture notes (source-verified)

- Canvas wrapper: `section.lessonOpenerComponent[lesson-opener-template]`.
- **Fixed header label:** `.sidebarHeaderText` (plain text node — not
  `contenteditable`; title cannot be edited).
- **Editable body:** `.sidebarCaption[contenteditable]` (ng-model
  `fieldData.paragraph`) — set via `cy.setContentEditableOn`, never `cy.type()`.
- **Settings panel:** `.componentSettingPanel [lesson-opener-setting]` with
  `.icon-Lesson-opener.settings-icon` and `.templateName` "Lesson Opener".
- **Styles:** data-driven from `settings.style_tab.stylesHolder`; active style
  adds class `active-style` (`style1` active by default per default JSON).
- **Display toggles:** Show Header (`#isHeaderVisible`), Show Image
  (`#imagedisplay`), Show Caption (`#caption-option`).
- For the sidebar styles (`style1/2/3`) the **Background/Stroke colour inputs
  are disabled** by source (fixed colours) — used for the "restricted colour"
  cases.
- **Alt Text** textarea (`ng-model currSettings.altText`) enforces
  `maxlength=2000`.

## Coverage

| Status | Count | Notes |
|---|---|---|
| **Automated** | **33** | Page reachable + drop, settings panel (title/icon/style dropdown), four styles present/selectable + default-active, fixed titles/icons per style, non-editable header, content entry + line break + empty-state, style switching with content retention + stability, display toggles + disabled colour inputs + Alt Text contract, script-injection security |
| **Deferred** | **117** | Login/activity/step bootstrap, hero media upload (OS picker), RTE math RENDER, Preview/Reader/CLP student & teacher views, Publish/republish, persistence-after-reload, Figma/visual & responsive parity, cross-browser, multilingual, glossary, saLTIre launch, runtime drop/edit guards, a11y |

See `lesson-opener-mapping.json` for the per-TC mapping (every `TC_01`–`TC_150`
id appears exactly once).

## Why so many deferrals

This is a large, **media- and Reader-heavy** 150-case suite. The bulk of the QC
targets surfaces **outside the authoring DOM**: hero image/video upload via an
OS file picker, math equation **rendering**, Preview/Reader/CLP (student &
teacher) views, Publish/republish, persistence-after-reload, Figma/visual
parity, responsive previews, cross-browser (incl. Safari), multilingual content,
and glossary/LTI launch. These are intentionally marked `it.skip()` with explicit
reasons in the spec and `lesson-opener-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/lesson-opener/44-lesson-opener-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
