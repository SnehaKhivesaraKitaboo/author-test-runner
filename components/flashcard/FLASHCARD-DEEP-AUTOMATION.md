# Flashcard — Deep Automation

- **Component slug:** `flashcard`
- **dataType:** `flashcard` · **widget name:** `Flashcard` · **directive:** `flash-card-template`
- **Spec:** `30-flashcard-deep.spec.ts`
- **QC authority:** `Author Test Cases - Flashcard.pdf` (TC_01–TC_41)
- **Source authority:**
  - `config/config.js` (catalog entry: `name: "Flashcard"`, `dataType: "flashcard"`)
  - `templates/flashcard/flashcard.html`
  - `templates/flashcard/flashcard-template-setting-panel.html`
  - `templates/flashcard/flashcard-media-template.html`
  - `templates/flashcard/default/flashcard.json`

> ⚠️ **Not yet live-verified against a running authoring instance.** All
> selectors are **source-derived** from the templates above (verified against
> `config/config.js`, `flashcard.html`, `flashcard-template-setting-panel.html`,
> and `flashcard.json`). A single live run is required to confirm the canvas
> drop, the card add/delete behaviour, and the `[flash-card-setting]` panel
> selectors. Adjust any selector that drifts from the live DOM.

## Content widget vs assessment widget (drop mechanism)

Flashcard is a **content widget**, not an assessment widget. `flashcard` is
**not** in `support/module-setup.ts` `ASSESSMENT_DATA_TYPES`, so
`resolveDropTarget` returns `'canvas'`. The component is therefore dropped onto
the **Instructions-for-Students** page (`#desktop_view`) via the existing
`cy.dropComponent('Flashcard')` primitive (which matches the catalog widget
`{ name: "Flashcard", dataType: "flashcard" }` by name and injects it onto the
unrestricted canvas). It is **not** dropped into a Generic Step column.

`cy.ensureFlashcardDeepSetup` mirrors the **Text** sibling's setup contract
(`cy.navigateToCanvasPage()` + `cy.dropComponent('Flashcard')`), not the
Generic-Step column flow used by Extended Response.

## Architecture notes (source-verified)

- Canvas wrapper: **`.component-holder.flashcard[flash-card-template]`**.
- Each card is a **`.slideshowContainer`** (`ng-repeat over fieldData.slides`).
  The default JSON ships **3 slides**.
- **Card management** (source `ng-class` in `flashcard.html`):
  **Add Card** (`.add-slide`) → `btn-disabled` when `slides.length >= 20`;
  **Delete Card** (`.delete-slide`) → `btn-disabled` when `slides.length <= 3`.
  The QC "50+ cards" case (TC_31) is therefore **capped at 20 by design** and is
  asserted as the cap contract.
- **Front/back editable text**: `.front-container .card-text.editables` and
  `.back-container .card-text.editables` (contenteditable, ng-model
  `option.frontCard.cardText` / `option.backCard.cardText`) — set via
  **`cy.setContentEditableOn`**, never `cy.type()`. `cardType=='text'` gates
  these; media types render the `[data-media-template-flashcard]` block.
- **Header** (`.sc-intro.editables`) / **Instruction** (`.sc-instr.editables`)
  bodies render only when `settings.isHeaderVisible` / `isInstructionVisible`
  (both **default true**).
- **Flip**: `.add-flip` toggles `option.isBackCardActive`; the visual flip
  animation is a **runtime** behaviour (deferred).
- **Settings panel** (`[flash-card-setting]` / `.flashcard-setting-panel`,
  title **"Flashcard"**): `<stylepanel>` (style1 active, style2, coming-soon),
  **Show Header** (`#header-visibility`) / **Show Instruction**
  (`#instr-visibility`), **Front/Back media radios** (Text/Image/Audio/Video),
  **No Outline / Outline** radios, **Card Colour** (`#card-colour`) + **Action
  Assets** colour pickers, **Tags** input, **Alt Text** textarea
  (`maxlength=2000`).
- **No math editor ("fx") control** exists in the flashcard settings panel — the
  QC "fx/LaTeX" step (TC_17) does not map to a flashcard control. The Audio media
  option is asserted instead; math render is deferred.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 13 | Drop + settings panel, add card, delete + renumber, add-card cap (20), front/back text, large-text stability, card colour, outline toggle, header/instruction toggles, image/video/audio media controls, tags, alt-text, delete-icon presence, empty-card stability, security |
| Deferred | 28 | Login/activity/step bootstrap (TC_01–TC_09), navigation arrows (TC_12), flip runtime (TC_13), paste-formatting (TC_18), publish/reader (TC_22–TC_25, TC_28, TC_38–TC_41), collapse (TC_26), file pickers (TC_30), a11y (TC_33), cross-browser (TC_34), undo (TC_35), annotations (TC_36–TC_37), math render (TC_17 render portion) |

## Why these deferrals

QC **TC_01–TC_09** cover **login → create activity → start authoring → add
Generic Step → enter step/instructions** — environment/harness bootstrap steps
(handled by `cy.openAuthoringTool` and step helpers), not assertions on the
Flashcard component itself. The remaining deferrals require flows outside the
authoring DOM: **bxslider navigation arrows**, the **CSS flip animation**,
**clipboard paste-formatting**, the **OS file picker** (image/video/audio/.exe),
**math/LaTeX render**, **keyboard a11y / focus order**, a **cross-browser run
matrix**, **annotation runtime**, **undo**, **Preview/Reader/Publish**, and
**persistence after reload**. All are `it.skip()` with explicit reasons in the
spec and `flashcard-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/flashcard/30-flashcard-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.
