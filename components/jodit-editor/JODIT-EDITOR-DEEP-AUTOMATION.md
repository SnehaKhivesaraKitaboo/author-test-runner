# Jodit Editor (platform rich-text editor) — Deep Automation

- **Component slug:** `jodit-editor`
- **dataType:** `platform-jodit` (platform feature — no widget of its own)
- **Spec:** `51-jodit-editor-deep.spec.ts`
- **QC authority:** `Author Test Cases - Jodit Editor Test Cases.pdf` (TC_01–TC_51)
- **Source authority:**
  - `js/jodit-init.js` (Jodit config + `joditToolbars.ELA` button list)
  - `templates/shortLongAns/shortLongAns.html` (host: `textarea.ansJODIT[data-jodit]`)
  - `templates/shortLongAns/shortLongAns-settings-pannel.html` (RTE + Advance/JODIT gates, `TOCFlag`)
  - `templates/shortLongAns/scripts/shortLongAns-directive.js` (`Jodit.make(textareaId, …)` on click)
  - `assets/externalModules/LiteracySEJodit050625/jodit.min.css` (BEM class names)

> ⚠️ **Not yet live-verified** against a running authoring instance — selectors
> are source-derived. The Jodit toolbar button modifier classes
> (`.jodit-toolbar-button_<name>`) follow this Jodit build's BEM convention and
> the ELA button-name list from `jodit-init.js`; a single live run will confirm
> the exact mount + button DOM.

## Host (source-verified)

The Jodit editor is a **platform rich-text editor with no widget of its own**.
It is mounted by the **Extended Response (`shortLongAns`)** assessment widget via
`Jodit.make(textareaId, …)` in `shortLongAns-directive.js`, **only when**:

- Answer Type = **RTE** (`currSettings.activeAns === 'RTE'`), **and**
- Keyboard Type = **Advance** (`currSettings.keyboardType === 'JODIT'`),

and the component is then **clicked**. The simplest host to exercise Jodit is
therefore **Extended Response on a Generic Step** — the suite drops it, opens
settings, selects RTE + Advance(JODIT), and clicks the component to mount Jodit.

### Source ambiguity (flagged)

The task suggested the **Text/paragraph element** as the simplest host. Source
review shows the Text element uses the **legacy `templates/textEditor.html`
overlay** (`.editing-container .editor-list` — bold/italic/align/math/etc.),
which is a **separate editor and NOT Jodit**. The only source-verified host that
mounts Jodit is `shortLongAns` with **RTE + Advance(JODIT)**, so this suite uses
**Extended Response** as the host (reusing the same drop/settings pattern as the
sibling `extended-response` component).

## Flag gating

Both the **RTE** answer-type radio and the **Advance(JODIT)** keyboard radio are
gated by `TOCFlag` in `shortLongAns-settings-pannel.html`. In builds without
`TOCFlag` the radios are absent and Jodit cannot mount. Every test
**degrades gracefully** (logs + returns) via the `withJoditMounted` helper and
per-control presence guards.

## Toolbar (source-verified)

Enabled buttons from `joditToolbars.ELA` (`jodit-init.js`):

```
bold, italic, underline, strikethrough, eraser, ul, ol, font, fontsize,
paragraph, lineHeight, spellcheck, speechRecognize, indent, outdent, align,
brush, superscript, subscript, cut, copy, paste, selectall, hr, table, link,
symbols, find, fullsize, preview, print, undo, redo
```

The directive sets `removeButtons: ['file', 'image', 'video']` → **no media
upload button is exposed** (so the QC unsupported-file-upload case is N/A).
Jodit config: `enter:'BR'`, `cleanHTML`, `showStatusbar:false`,
`showCharsCounter:false`, `toolbarAdaptive:false`; a `processPaste` /
`beforePasteInsert` sanitizer strips Word/Google noise.

### Standard Jodit BEM selectors used

| Element | Selector |
|---|---|
| Container | `.jodit-container`, `.jodit` |
| Toolbar | `.jodit-toolbar__box` |
| Button | `.jodit-toolbar-button_<name>` (inner `button.jodit-toolbar-button__button`) |
| Editable | `.jodit-wysiwyg` (iframe mode) |
| Fullscreen | `.jodit_fullsize` |
| Dialog/popup | `.jodit-popup`, `.jodit-dialog` |

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 27 | Host drop + Jodit mount, Answer/Keyboard-type settings presence + mutual exclusion, toolbar button presence, formatting controls (undo/redo, align, lists, symbols, font-size/color, eraser), link/table dialog open + URL input, fullscreen toggle + content retention, toolbar responsiveness, security/sanitization (DOM-asserted) |
| Deferred | 24 | Runtime data integrity across editor switch, Preview/Publish, Reader/CLP/student, char-limit runtime + warning popup, keyboard shortcuts, read-only, network failure, large paste, persistence-after-reload, accessibility, math/Word-paste runtime |

### Reused framework helpers (not duplicated)

`cy.openAuthoringTool`, `cy.createTestStep`, `cy.ensureOnFibGenericStep`,
`cy.waitForGenericStepCanvasReady`, `cy.dropComponentForModule`,
`cy.setContentEditableOn`, `cy.captureLiveStep` — mirrors the
`extended-response` sibling exactly.

### New component commands

`ensureJoditEditorDeepSetup`, `dropJoditHostIntoGenericStepColumn`,
`openJoditHostSettings`, `selectJoditAdvancedRte`, `mountJoditEditor`,
`withJoditMounted`.

## Why the deferrals

The QC suite is heavily weighted toward **runtime / lifecycle** behavior that
lives outside the authoring DOM: Preview/Reader/Publish rendering, student/CLP
access, persistence-after-reload, character-limit enforcement and warning
popups, keyboard shortcuts, read-only mode, offline/network failure, live
clipboard paste (incl. Word), math-equation render, and accessibility (keyboard
+ screen reader). The editable area is a Jodit **contenteditable** inside an
iframe, so content is set via the editor's own area (`.jodit-wysiwyg`), never
plain `cy.type()`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/jodit-editor/51-jodit-editor-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
