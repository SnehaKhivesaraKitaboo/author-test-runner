# Extended Response about Media — Deep Automation

- **Component slug:** `extended-response-media`
- **dataType:** `identify-the-clip` · **directive:** `identify-the-clip-template` (`identifyTheClipTemplate`)
- **Spec:** `16-extended-response-media-deep.spec.ts`
- **QC authority:** `Author Test Cases - Extended Response About Media.pdf` (TC_01–TC_159)
- **Source authority:**
  - `config/config.js` (palette registry)
  - `templates/identify-the-clip/identify-the-clip.html`
  - `templates/identify-the-clip/identify-the-clip-settings-pannel.html`
  - `templates/identify-the-clip/scripts/identify-the-clip-directive.js`

## Source ambiguity (resolved)

The QC catalog declares `dataType: "extendedResponseMedia"`. **That value does not
exist anywhere in the source.** The palette entry literally named **"Extended
Response about Media"** in `config/config.js` maps to:

```
dataType  = "identify-the-clip"
directive = identifyTheClipTemplate   (attr "identify-the-clip-template")
canvas    = ".identifyTheClipComponent"
settings  = ".identifyTheClip-setting"   (title "Extended Response about Media")
```

The dropped answer field even carries the class
`characters_count_extended_response_about_media`, and the settings panel exposes
the exact QC controls (Show Media, Allowed Response, Exact Match, Add Show Me,
Reset, audio transcript, Play in Background, video YouTube/Vimeo dropdown). So
this component **is** the `identify-the-clip` template; all selectors are derived
from it, not from `shortLongAns` (which has no media/allowed-response controls).

## Architecture notes (source-verified)

- **Answer types:** Short / RTE. The **Long** radio is commented out in the
  settings panel, so only Short and RTE are assertable. Default state is Short.
- **Styles:** `<stylepanel>` drives a two-style choice. **Outline / Fill
  Background** radios + colour picker render **only when
  `styleSelected == 'style1'`**. **Style-2** shows the question field with a
  **thumb image** (`.thumbImg`, `.styleTwoQuestionText`) when `ansTextHint` is
  false. The spec degrades gracefully (logs + returns) when a given style's
  controls are not currently rendered.
- **Show Media** (`#showMedia`) reveals **Image / Audio / Video** radios
  (`.mediaTypeBtn`):
  - **Image** → upload box + "Upload format PNG, JPG, SVG" hint.
  - **Audio** → transcript input (`#audioTransscript`, maxlength 1000) +
    "Play in Background" checkbox.
  - **Video** → "Upload by system"/"Upload by URL" radios; URL mode exposes a
    YouTube/Vimeo dropdown (`#itcVideoDropdown`) + "Enter Video ID" input +
    "Full Width" checkbox + "Upload format MP4" hint.
- **Response settings:** **Allowed Response** (`#allowResponse`, subtext "Enter
  expected response") and **Exact Match** (`#answerMatch`, with the case/space/
  punctuation subtext). **Add Show Me** (`ng-model currSettings.showmecheckbox`)
  and **Reset** (`ng-model currSettings.reset`) checkboxes.
- **Label type:** Show Label Type (`#label-visibility`) → Primary/Secondary radios.
- **Alt Text** textarea enforces `maxlength=2000`.
- The answer field accepts **pipe-separated** multiple answers
  (`answer1|answer2|answer3`) — but the actual matching/scoring happens in the
  Reader and is deferred.
- **Special-character keyboard** only renders under a subject-level language
  (`currSettings.userSubjectLang`), which the authoring DOM can't set — deferred.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 63 | Drop, answer-type, question/response/pipe/paragraph entry, styles, outline/fill, Show Media + Image/Audio/Video controls, transcript, Play in Background, Show Caption, Allowed Response, Exact Match, Show Me/Reset, label type, Alt Text, accessibility, security |
| Deferred | 96 | Login/listing/activity/ePUB, step-creation wizard (Step Title/Levels/Instructions 10k-char), all file-picker uploads, media playback, Preview/Reader typing/scoring/submission, cross-session persistence, visual-only checks |

(63 + 96 = 159 = full QC count.)

## Why so many deferrals

This is a **media-heavy, reader-heavy** 159-TC suite, so a large deferred count
is expected and correct:

- **TC_01–04** are portal login / listing / activity-creation / ePUB upload.
- **TC_06–26** are the step-creation **wizard** (Step Title, Levels, Instructions
  for Students/Teacher with 10,000-char limits) — separate screens, not the
  authoring canvas DOM.
- **File-picker uploads** (image/audio/video: TC_29, 57–59, 62–63, 66, 83, 92)
  require OS file dialogs.
- **Media playback** (TC_67, 68) and **runtime URL validation** (TC_88–91) are
  runtime behaviours.
- **Preview/Reader** answer typing, **scoring/matching** (TC_122–153 scoring,
  TC_147–153), **submission** and **cross-session persistence** (TC_109–121)
  happen outside the authoring tool.

All deferrals are explicit `it.skip()` blocks in `16-Z` with reasons, and are
mirrored in `extended-response-media-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/extended-response-media/16-extended-response-media-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ Not yet live-verified against a running authoring instance — selectors are
> source-derived from the `identify-the-clip` templates. A single run will confirm
> drop + settings-panel selectors (especially the `showMedia`-gated media controls,
> which only render after Show Media is checked).
