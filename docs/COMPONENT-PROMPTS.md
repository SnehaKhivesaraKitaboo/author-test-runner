# Component Automation Prompts

Ready-to-use prompts for implementing Cypress deep tests for each QC component.  
**Working reference:** FIB — see [FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md).

**Master template:** [MASTER-AGENT-PROMPT.md](MASTER-AGENT-PROMPT.md)  
**Team master prompt (recommended):** [TEAM-COMPONENT-PROMPT.md](TEAM-COMPONENT-PROMPT.md)

---

## How to use

1. Pick a component section below.
2. Copy the **Full prompt** block into Cursor Agent.
3. Ensure `.env` has a fresh `AUTHORING_LAUNCH_URL`.
4. After implementation, run Component Test mode with **only that component** selected.
5. Update `docs/QC-REGISTRY.md` status when verified.

---

## Common context (prepend to any prompt)

```
Project: D:\Authoring\closify\authoring-tests\
Stack: Cypress 12 + TypeScript + Express (4321) + MySQL (authoring_test_runner); login `/`, dashboard `/dashboard.html`
QC PDFs: D:\Author_Test_cases\
Working pattern: e2e/13-fib-deep.spec.ts + support/commands.ts

Rules:
- All new files ONLY under authoring-tests/
- Assessment widgets → Generic Step column drop
- contenteditable → setContentEditableOn(), not cy.type()
- captureLiveStep() for dashboard live preview
- testIsolation: false + ensure*DeepSetup() for session reuse
- Map each it() to QC TC id from PDF
- Document automated vs deferred TCs in docs/{COMPONENT}-DEEP-AUTOMATION.md
```

---

## ✅ Fill in the Blank — DONE (reference)

**Status:** Verified working  
**Spec:** `e2e/13-fib-deep.spec.ts`  
**PDF:** `Author Test Cases - FIB test cases.pdf`  
**Doc:** [FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md)

### Extend FIB coverage prompt

```
Extend FIB deep automation in authoring-tests/e2e/13-fib-deep.spec.ts.

QC PDF: D:\Author_Test_cases\Author Test Cases - FIB test cases.pdf

Implement these deferred PDF test cases (authoring + preview where feasible):
- TC_16: remove sentence row
- TC_18: min/max blanks per sentence
- TC_26 (PDF): save error when sentence empty
- TC_27: unique saved-index on each copy
- TC_49–TC_50: 20 dropdown option limit
- TC_51 (PDF): delete dropdown option
- TC_55: image upload in drag-and-drop blank
- TC_40–TC_41: persist label type and feedback after save + reload

Fix TC number alignment: rename spec tests that reuse wrong PDF TC ids (see FIB-DEEP-AUTOMATION.md mapping table).

Run via dashboard Component Test → Fill in the Blank only.
Update docs/FIB-DEEP-AUTOMATION.md mapping table.
```

---

## Assessment widgets (Generic Step drop)

### MCQ (Single Choice) — spec exists, not verified

```
Implement/stabilize deep automation for MCQ (Single Choice).

Component: MCQ (Single Choice)
dataType: multiple-choice-template
QC PDF: D:\Author_Test_cases\Author Test Cases - MCQ .pdf (102 TCs)
Existing spec: e2e/11-mcq-deep.spec.ts
Drop target: Generic Step column (or WL single page via module-setup.ts)

Cover ALL PDF scenario categories:
- Step creation wizard (TC_04–TC_09): title, cancel, change step, instructions
- Drop MCQ on canvas (TC_10)
- Style selection TC_11–TC_14, alignment TC_15–TC_17
- Add Media TC_18–TC_22 (image/video/audio, invalid URL)
- Feedback TC_23–TC_28 (generic + individual)
- Try Again TC_29–TC_31, Show Me TC_32–TC_33
- Shuffle + Reset TC_34–TC_37
- Label types TC_38–TC_71
- Options management TC_72–TC_77 (add/delete/image on option)
- Save validation TC_45–TC_46, TC_56–TC_63
- Sample Answer layer TC_77–TC_102
- Negative: empty options, script in stem, over-limit media
- Copy/delete component lifecycle
- Preview/reader answer selection (phase 2 — document deferred)

Mirror FIB: ensureMcqDeepSetup(), openMcqSettings(), MCQ_SELECTORS from templates/multiple-choice/
Update fixtures/component-flows.json, test-registry automationStatus when verified.
Create docs/MCQ-DEEP-AUTOMATION.md with full TC mapping.
```

### MCQ Multiple — spec exists, not verified

```
Implement/stabilize deep automation for MCQ Multiple.

Component: MCQ Multiple
dataType: mcq-multiple
QC PDF: D:\Author_Test_cases\Author Test Cases - MCQ Multiple.pdf (108 TCs)
Existing spec: e2e/12-mcq-multiple-deep.spec.ts

Same structure as MCQ Single but assert:
- Multi-select answer type (multiple checkboxes correct)
- Partial credit / all-correct rules per PDF
- Style, alignment, media, feedback, shuffle, label types
- Sample answer layer for multi-select

Use module-setup.ts for drop target. Add ensureMcqMultipleDeepSetup().
Create docs/MCQ-MULTIPLE-DEEP-AUTOMATION.md.
Verify dashboard single-component run end-to-end.
```

### True or False

```
Create deep spec for True or False widget.

Component: True or False
dataType: true-false-template
QC PDF: D:\Author_Test_cases\Author Test Cases - True or False.pdf (90 TCs)
New spec: e2e/14-true-false-deep.spec.ts
Drop target: Generic Step column

Scenarios to cover from PDF:
- Setup: Generic Step + drop True/False
- True/False toggle or radio on canvas
- Settings: header, instruction, label type (primary/secondary)
- Styles and alignment
- Feedback (correct/incorrect), Try Again, Show Me
- Copy component, delete, independent edit on copy
- Sample answer layer if applicable
- Negative: empty statement, script injection in stem
- Save + reload persistence
- Preview: select True/False, verify scoring (defer with note)

Follow 13-fib-deep.spec.ts patterns. Register in test-registry.json + component-flows.json.
```

### FIB Media

```
Create deep spec for FIB Media (image-based blanks).

Component: FIB Media
dataType: fib-media
QC PDF: D:\Author_Test_cases\Author Test Cases - FIBMedia test cases.pdf (43 TCs)
New spec: e2e/15-fib-media-deep.spec.ts
Drop target: Generic Step column

Scenarios:
- FIB with image blanks vs standard FIB (compare TC_29 exclusion in 13-fib-deep)
- Upload image for blank, paragraph/media visibility toggles
- All option types where applicable (dropdown/text/drag-drop with image)
- Copy, styles, labels, feedback
- Negative: unsupported file types, oversized upload
- Reuse FIB commands where selectors overlap; extend FIB_SELECTORS for media variant

Reference templates/fib/ and fib-media template folder in KITABOO_Authoring.
```

### Extended Response

```
Create deep spec for Extended Response (short/long answer).

Component: Extended Response
dataType: shortLongAns
QC PDF: D:\Author_Test_cases\Author Test Cases - Extended Response.pdf (46 TCs)
New spec: e2e/16-extended-response-deep.spec.ts
Drop target: Generic Step column

Scenarios:
- Drop + header/instruction/label toggles
- Short vs long answer mode if applicable
- Character limit, rubric, sample answer
- Media in prompt (if separate from Extended Response Media)
- Copy, delete, styles
- Negative: empty prompt save validation
- Feedback and Try Again settings
```

### Extended Response Media

```
Create deep spec for Extended Response About Media.

Component: Extended Response Media
dataType: extendedResponseMedia
QC PDF: D:\Author_Test_cases\Author Test Cases - Extended Response About Media.pdf (159 TCs)
New spec: e2e/17-extended-response-media-deep.spec.ts

Scenarios (high priority — large PDF):
- Drop on Generic Step
- Attach image/video/audio to prompt
- Student response area + media playback settings
- All settings toggles from PDF part 1
- Copy/delete/lifecycle
- Invalid media URL handling
- Split into describe blocks by PDF sections; implement incrementally with TC filter env var
```

### ELA Multipart

```
Create deep spec for ELA Multipart assessment.

Component: ELA Multipart
dataType: ela-multipart
QC PDF: D:\Author_Test_cases\Author Test Cases - ELA- Multipart.pdf (155 TCs)
New spec: e2e/18-ela-multipart-deep.spec.ts
Drop target: Generic Step (multipart container)

Scenarios:
- Drop multipart widget, add sub-questions (MCQ, FIB, etc.)
- Reorder parts, delete part
- Shared header/instructions across parts
- Settings at multipart level vs part level
- Save, copy, preview interaction across parts
- Regression: each part type still functional after save/reload
```

### WL Multipart

```
Create deep spec for WL Multipart (largest suite: 205 TCs).

Component: WL Multipart
dataType: wl-multipart
QC PDF: D:\Author_Test_cases\Author Test Cases - WL - Multipart.pdf
New spec: e2e/19-wl-multipart-deep.spec.ts
Module: wl (fixtures/modules/wl-module.json)

Scenarios:
- WL-specific canvas (may differ from ELA Generic Step — check module-setup.ts)
- Multipart structure, language-specific labels
- All settings from PDF sections 1–N (implement in phases)
- Accessibility scenarios from PDF
- Use CYPRESS_AUTHORING_MODULE=wl for runs
```

---

## Layout components (canvas / Instructions drop)

### Left / Center / Right / Four Column / Custom Center / Flexi Layout

```
Create deep spec for {LAYOUT_NAME} layout.

Component: {LAYOUT_NAME}
dataType: {layout-N}
QC PDF: D:\Author_Test_cases\Author Test Cases - {LAYOUT_PDF}.pdf ({TC_COUNT} TCs)
New spec: e2e/06-layout-{slug}-deep.spec.ts OR extend 06-layout-components.spec.ts
Drop target: Instructions for Students canvas OR active step page

Scenarios common to all layouts:
- Drop layout from Layout section of component panel
- Verify column structure (.sd-item, column count)
- Drop child elements (Text, Image) into columns
- Resize columns (Flexi only)
- Settings panel options per PDF
- Copy layout, delete layout
- RTL / alignment edge cases from PDF
- Negative: drop assessment widget inside layout rules
- Save + reload column content persistence

Read template under KITABOO_Authoring/templates/layout*/
Extract real selectors; add LAYOUT_SELECTORS to commands.ts if shared.
```

**Per-component values:**

| Layout | dataType | PDF | TCs |
|--------|----------|-----|-----|
| Left Layout | layout-1 | Left Layout.pdf | 67 |
| Center Layout | layout-2 | Center Layout.pdf | 67 |
| Right Layout | layout-3 | Right Layout.pdf | 67 |
| Four Column | layout-4 | Four column.pdf | 67 |
| Custom Center | layout-6 | Custom Center.pdf | 67 |
| Flexi Layout | layout-7 | Flexi Layout.pdf | 87 |

---

## Element components

### Text

```
Deep automation for Text (paragraph) element.

dataType: paragraph
QC PDF: D:\Author_Test_cases\Author Test Cases - Text.pdf (40 TCs)
Spec: e2e/07-text-deep.spec.ts or extend 07-element-components.spec.ts

Scenarios: rich text editing, label types, styles, alignment, copy, delete,
script sanitization, empty content validation, save/reload, Jodit/contenteditable sync.
Drop on Instructions or inside layout column.
```

### Image

```
Deep automation for Image element.

dataType: image
QC PDF: D:\Author_Test_cases\Author Test Cases - Image.pdf (25 TCs)

Scenarios: upload image, alt text, dimensions, alignment, caption,
replace image, delete, invalid file type, oversized file, copy component,
URL vs upload modes if applicable.
```

### Video

```
Deep automation for Video element.

dataType: video
QC PDF: D:\Author_Test_cases\Author Test Cases - Video.pdf (69 TCs)

Scenarios: file upload, YouTube URL, invalid URL, autoplay toggle,
dimensions, poster image, delete/replace, copy, accessibility captions.
```

### Table

```
Deep automation for Table element.

dataType: tablesNew
QC PDF: D:\Author_Test_cases\Author Test Cases - Table.pdf (88 TCs)

Scenarios: add/remove rows/columns, merge cells, header row,
cell content edit, table styles, copy table, max size limits,
keyboard navigation (defer a11y), paste from Excel (edge case).
```

### Callout

```
Deep automation for Callout (sidebar).

dataType: sidebarComponent
QC PDF: D:\Author_Test_cases\Author Test Cases - Callout.pdf (110 TCs)

Scenarios: callout styles, icon, title/body edit, expand/collapse,
color themes, copy, delete, position within page, regression across styles.
```

### Situation Header

```
Deep automation for Situation Header.

dataType: situationbox
QC PDF: D:\Author_Test_cases\Author Test Cases - Situation Header.pdf (54 TCs)

Scenarios: scenario text, styling, visibility toggles, copy, delete,
label types if applicable, media in header.
```

### Instruction for Student / Instruction for Teacher

```
Deep automation for Instruction for {Student|Teacher} page.

dataType: instructionsstudents | instructionsteacher
QC PDF: D:\Author_Test_cases\Author Test Cases - Instruction for {Student|Teacher}.pdf (19 TCs each)

Scenarios: page appears in TOC, edit page content, add elements to instruction page,
settings specific to instruction page type, navigation between instruction and steps,
save/reload content persistence. NOT Generic Step — these are fixed TOC pages.
```

---

## Widget components

### Annotation

```
Deep spec: Annotation (annotationHighlightOutline)
PDF: D:\Author_Test_cases\Author Test Cases - Annotation.pdf (29 TCs)
Scenarios: drop widget, highlight text config, outline tools, settings panel,
student interaction preview (defer), copy/delete.
```

### Carousel

```
Deep spec: Carousel (slideshow) — 101 TCs
PDF: Author Test Cases - Carousel.pdf
Scenarios: add slides, reorder, autoplay, navigation arrows, image per slide,
captions, delete slide, max slides, copy carousel, preview slide show.
```

### Click to Reveal

```
Deep spec: Click to Reveal — 113 TCs
Scenarios: reveal panels, trigger icons, animation, content per panel,
add/remove panels, styles, copy, preview click interaction.
```

### CLIC (Sketchpad)

```
Deep spec: CLIC Component (sketchpad) — 33 TCs
Scenarios: drawing canvas, tools, colors, clear, save sketch data,
copy component, settings, preview drawing (defer canvas pixel asserts).
```

### Correction

```
Deep spec: Correction — 29 TCs
Scenarios: error text, correction markers, add/remove errors,
student find-and-fix preview, settings, copy/delete.
```

### Flashcard

```
Deep spec: Flashcard — 41 TCs
Scenarios: add cards, front/back edit, flip animation preview,
reorder cards, delete card, styles, copy set.
```

### Graphic Organizer (Image)

```
Deep spec: graphicOrganizerImageHotSpot — 77 TCs
Scenarios: upload base image, add hotspots, hotspot labels,
drag hotspots, delete hotspot, copy, preview hotspot click.
```

### Highlighter

```
Deep spec: Highlighter — 45 TCs
Scenarios: source text, correct highlight ranges, add/remove highlights,
settings, copy, preview highlight selection.
```

### Image Labeling

```
Deep spec: Image Labeling — 12 TCs
Scenarios: image upload, label pins, drag labels, correct positions,
add/remove labels, copy, preview drag-drop labels.
```

### Wordsearch

```
Deep spec: Wordsearch — 33 TCs
Scenarios: word list entry, grid generation, grid size,
highlight words, settings, copy, preview solve interaction.
```

### HTML Interactivity

```
Deep spec: HTML Interactivity — 35 TCs (currently planned)
Scenarios: embed HTML snippet, iframe/preview sandbox,
invalid HTML handling, script restriction (security),
edit HTML source, copy, height/width settings.
```

### Thumbcard

```
Deep spec: Thumbcard — 38 TCs (planned)
Scenarios: thumbnail grid, add/remove cards, link targets,
images per card, layout styles, copy, navigation preview.
```

---

## Layer components

### LoD + Annotation Cue

```
Deep spec: LoD + Annotation Cue — 145 TCs
PDF: Author Test Cases - LoD and Annottaion cue.pdf
dataType: lod
Existing basic: 09-component-deep.spec.ts

Scenarios: create LoD layer, differentiation levels,
annotation cue attachment, toggle layers on canvas,
accessibility per PDF, regression across LoS tags,
copy layer config, preview per level (phase 2).
```

### Sample Layer / TIG Panel

```
Deep spec: Sample Layer / TIG Panel — 108 TCs (planned)
dataType: sample-layer

Scenarios: enable sample answer layer, TIG panel content,
teacher guide fields, pink banner "Sample Answers: On",
interaction with assessment widgets, copy settings,
disable layer, preview mode verification.
```

---

## Platform / feature components

### Generic Step

```
Deep spec: Generic Step — 113 TCs
PDF: Author Test Cases - Generic Step.pdf
Existing: e2e/10-step-creation.spec.ts (partial)

Extend to full PDF coverage:
- All 15 step types in chooser (not only Generic Step)
- Metadata wizard all tabs, validation, cancel paths
- Column drop zones, multi-column behavior
- Assessment widget drop rules per column
- Edit step metadata after creation
- Delete step, reorder TOC
- Clone step content
- LoS tags on steps
```

### Generic Step (prompt — copy as-is)

```
Extend Generic Step automation beyond e2e/10-step-creation.spec.ts.

QC PDF: D:\Author_Test_cases\Author Test Cases - Generic Step.pdf (113 TCs)
Create e2e/10-generic-step-deep.spec.ts for full PDF coverage.

Cover: step chooser categories, all step type cards, wizard validation,
column assessment zones, edit/delete/reorder step, LoS tags, regression.
Reuse support/step-creation.ts commands.
```

### Copy and Paste (cross-component)

```
Platform feature: Copy and Paste — 18 TCs
PDF: Author Test Cases - Copy and Paste.pdf
New spec: e2e/20-copy-paste.spec.ts

Scenarios: copy Text/Image/FIB/MCQ across pages,
paste into layout column, paste into Generic Step,
copy between steps, invalid paste targets,
keyboard Ctrl+C/V if supported, clipboard success toast.
```

### Edit Metadata

```
Platform feature: Edit Metadata — 34 TCs
PDF: Author Test Cases - Edit metadata.pdf
New spec: e2e/21-edit-metadata.spec.ts

Scenarios: edit step title, objectives, standards tags,
save metadata, cancel without save, validation on required fields,
bulk metadata edit if applicable.
```

### Steps Cloning

```
Platform feature: Steps Cloning — 77 TCs
PDF: Author Test Cases - Steps Cloning.pdf
New spec: e2e/22-steps-cloning.spec.ts

Scenarios: clone step within lesson, clone to another lesson (if UI supports),
cloned step content integrity, TOC ordering after clone,
assessment widgets still functional after clone.
```

### Internal / External Cumulation

```
Platform feature: {Internal|External} Cumulation
PDF: Author Test Cases - {Internal|External} Cumulation.pdf (70 / 47 TCs)
dataType: internal-cumulation | external-cumulation
New spec: e2e/23-{internal|external}-cumulation.spec.ts

Scenarios: enable cumulation, aggregate scores across steps,
external lesson linkage, display rules, teacher vs student view,
regression, disable cumulation.
```

### Offline Step

```
Platform feature: Offline Step — 43 TCs
PDF: Author Test Cases - Offline step.pdf

Scenarios: create offline step type, printable content,
PDF export if applicable, no interactive widgets rule,
metadata wizard, copy/delete step.
```

### Lesson Opener

```
Page type: Lesson Opener — 126 TCs
PDF: Author Test Cases - Lesson Opener.pdf

Scenarios: create lesson opener page, title, hero media,
objectives section, navigation to first step, edit opener content,
styles, copy page, delete/replace media.
```

### Jodit Editor

```
Platform feature: Jodit Editor — 51 TCs
PDF: Author Test Cases - Jodit Editor Test Cases.pdf

Scenarios: bold/italic/lists, math insert, tables in editor,
paste from Word, undo/redo, font size, link insert,
sanitize paste, cross-browser (document manual), embed in Text/Callout.
```

---

## E2E smoke specs (extend, not replace)

### Session & shell (01–05)

```
Review and extend smoke specs 01–05 to align with QC platform scenarios:

01-session-launch: token expiry, courseId, no login redirect
02-editor-shell: save button, desktop_view, loader
03-toolbar-actions: save, preview, undo, zoom
04-left-panel: Widgets/Layout/Elements sections expand
05-toc-navigation: all TOC pages clickable, active state

Add missing negative cases from any platform PDF.
Document in docs/SMOKE-SPECS.md.
```

---

## Phase 2 — Preview & reader prompts

Use when authoring specs are stable:

```
Add preview iframe tests for {COMPONENT} using player-container.js behavior.

After authoring assertions pass in e2e/{spec}-deep.spec.ts, add describe block:
- Click Preview toolbar button
- cy.get('iframe.preview-iframe').then → switch context
- Assert student interaction per QC PDF preview TCs
- Scoring: correct/incorrect feedback display
- Try Again / Show Me flows

Reference: KITABOO_Authoring/js/player-container.js
Defer a11y (screen reader) to manual cycle or axe-core integration.
```

---

## Priority roadmap (suggested)

| Priority | Component | Reason |
|----------|-----------|--------|
| P0 | FIB | ✅ Done |
| P1 | MCQ Single + Multiple | Specs exist; stabilize next |
| P1 | True or False | High-use assessment |
| P2 | Generic Step | Prerequisite for all assessment |
| P2 | FIB Media | FIB variant |
| P3 | Extended Response (+ Media) | Common widgets |
| P3 | ELA / WL Multipart | Large but critical |
| P4 | Layout + Element deep specs | Incremental per PDF |
| P5 | Platform features | Copy/paste, cloning, cumulation |
| P6 | Preview/reader phase | Cross-cutting |

---

*Last updated: May 2026*
