# Component Automation — Coverage Master

Tracks component-centric deep automation under `components/`. **45 components built**, all discovered & compiled by Cypress (`3,075` tests, 0 compile errors). Status is `generated-unverified` until run against a live `AUTHORING_LAUNCH_URL`, then `verified`.

## Assessment widgets (Generic Step column drop)

| Component | Slug | dataType | Spec | QC | Auto | Defer |
|---|---|---|---|---:|---:|---:|
| MCQ (Single Choice) | mcq | multiple-choice-template | `mcq/11-mcq-deep.spec.ts` | 128* | 38 | 34+ |
| MCQ Multiple | mcq-multiple | multiple-choice-template** | `mcq-multiple/12-mcq-multiple-deep.spec.ts` | 108 | 40 | 64 |
| True or False | true-false | true-false-template | `true-false/13-true-false-deep.spec.ts` | 90 | 30 | 60 |
| FIB Media | fib-media | fib-media*** | `fib-media/14-fib-media-deep.spec.ts` | 43 | 8 | 35 |
| Extended Response | extended-response | shortLongAns | `extended-response/15-extended-response-deep.spec.ts` | 46 | 18 | 28 |
| Extended Response Media | extended-response-media | identify-the-clip⁴ | `extended-response-media/16-extended-response-media-deep.spec.ts` | 159 | 63 | 96 |
| Correction | correction | correction | `correction/32-correction-deep.spec.ts` | 29 | 17 | 12 |
| Highlighter | highlighter | highlight | `highlighter/34-highlighter-deep.spec.ts` | 45 | 29 | 16 |
| ELA Multipart | ela-multipart | group-interactivity-template | `ela-multipart/41-ela-multipart-deep.spec.ts` | 155 | 38 | 117 |
| WL Multipart | wl-multipart | group-interactivity-template⁵ | `wl-multipart/42-wl-multipart-deep.spec.ts` | 205 | 22 | 183 |

## Element components (Instructions canvas drop)

| Component | Slug | dataType | Spec | QC | Auto | Defer |
|---|---|---|---|---:|---:|---:|
| Text | text | paragraph | `text/07-text-deep.spec.ts` | 40 | 20 | 20 |
| Image | image | image | `image/08-image-deep.spec.ts` | 25 | 13 | 12 |
| Video | video | video | `video/09-video-deep.spec.ts` | 69 | 34 | 35 |
| Table | table | tablesNew | `table/10-table-deep.spec.ts` | 88 | 45 | 43 |
| Callout | callout | sidebarComponent | `callout/17-callout-deep.spec.ts` | 110 | 47 | 63 |
| Situation Header | situation-header | situationbox | `situation-header/24-situation-header-deep.spec.ts` | 54 | 20 | 34 |

## Layout components

| Component | Slug | dataType | Spec | QC | Auto | Defer |
|---|---|---|---|---:|---:|---:|
| Left Layout | left-layout | layout-1 | `left-layout/18-left-layout-deep.spec.ts` | 67 | 15 | 52 |
| Center Layout | center-layout | layout-2 | `center-layout/19-center-layout-deep.spec.ts` | 67 | 15 | 52 |
| Right Layout | right-layout | layout-3 | `right-layout/20-right-layout-deep.spec.ts` | 67 | 15 | 52 |
| Four Column | four-column | layout-4 | `four-column/21-four-column-deep.spec.ts` | 67 | 15 | 52 |
| Custom Center | custom-center | layout-6 | `custom-center/22-custom-center-deep.spec.ts` | 67 | 15 | 52 |
| Flexi Layout | flexi-layout | layout-7 | `flexi-layout/23-flexi-layout-deep.spec.ts` | 87 | 16 | 71 |

## Widget components

| Component | Slug | dataType | Spec | QC | Auto | Defer |
|---|---|---|---|---:|---:|---:|
| Annotation | annotation | annotationHighlightOutline | `annotation/27-annotation-deep.spec.ts` | 29 | 11 | 18 |
| Carousel | carousel | slideshow | `carousel/28-carousel-deep.spec.ts` | 101 | 33 | 68 |
| Click to Reveal | click-to-reveal | clickToReveal | `click-to-reveal/29-click-to-reveal-deep.spec.ts` | 113 | 28 | 85 |
| Flashcard | flashcard | flashcard | `flashcard/30-flashcard-deep.spec.ts` | 41 | 13 | 28 |
| CLIC (Sketchpad) | clic | sketchpad | `clic/31-clic-deep.spec.ts` | 33 | 7 | 26 |
| Graphic Organizer | graphic-organizer | graphicOrganizerImageHotSpot | `graphic-organizer/33-graphic-organizer-deep.spec.ts` | 77 | 26 | 51 |
| Image Labeling | image-labeling | imagelabelling | `image-labeling/35-image-labeling-deep.spec.ts` | 12 | 7 | 5 |
| Wordsearch | wordsearch | wordsearch | `wordsearch/36-wordsearch-deep.spec.ts` | 33 | 18 | 15 |
| HTML Interactivity | html-interactivity | html-interactivity | `html-interactivity/37-html-interactivity-deep.spec.ts` | 32 | 22 | 10 |
| Thumbcard | thumbcard | thumbs-card-header | `thumbcard/38-thumbcard-deep.spec.ts` | 38 | 16 | 22 |

## Layer / page-type components

| Component | Slug | dataType | Spec | QC | Auto | Defer |
|---|---|---|---|---:|---:|---:|
| LoD + Annotation Cue | lod-annotation-cue | lod | `lod-annotation-cue/39-lod-annotation-cue-deep.spec.ts` | 144 | 25 | 119 |
| Sample Layer / TIG | sample-layer-tig | layer-2 | `sample-layer-tig/40-sample-layer-tig-deep.spec.ts` | 108 | 15 | 93 |
| Instruction for Student | instruction-student | studentInstructions | `instruction-student/instructionsstudents-...-deep.spec.ts` | 19 | 11 | 8 |
| Instruction for Teacher | instruction-teacher | teacherInstructions | `instruction-teacher/instructionsteacher-...-deep.spec.ts` | 19 | 11 | 8 |
| Lesson Opener | lesson-opener | lessonOpenerComponent | `lesson-opener/44-lesson-opener-deep.spec.ts` | 150 | 33 | 117 |

## Platform / feature components

| Component | Slug | Mechanism | Spec | QC | Auto | Defer |
|---|---|---|---|---:|---:|---:|
| Generic Step | generic-step | step chooser + wizard | `generic-step/43-generic-step-deep.spec.ts` | 113 | 17 | 96 |
| Copy and Paste | copy-paste | hover copy/paste (localStorage) | `copy-paste/45-copy-paste-deep.spec.ts` | 18 | 11 | 7 |
| Edit Metadata | edit-metadata | TOC kebab → wizard | `edit-metadata/46-edit-metadata-deep.spec.ts` | 34 | 18 | 16 |
| Steps Cloning | steps-cloning | TOC kebab → Clone New Level | `steps-cloning/47-steps-cloning-deep.spec.ts` | 77 | 32 | 45 |
| Internal Cumulation | internal-cumulation | Import From Library | `internal-cumulation/48-internal-cumulation-deep.spec.ts` | 70 | 12 | 58 |
| External Cumulation | external-cumulation | Import From Library (cross-activity) | `external-cumulation/49-external-cumulation-deep.spec.ts` | 47 | 12 | 35 |
| Offline Step | offline-step | step chooser (printable) | `offline-step/50-offline-step-deep.spec.ts` | 43 | 9 | 34 |
| Jodit Editor | jodit-editor | RTE on Extended Response host | `jodit-editor/51-jodit-editor-deep.spec.ts` | 51 | 27 | 24 |

## Footnotes / source-verified corrections

- \* MCQ PDF: TC_01–TC_102 + a second TC_77–TC_102 "Sample Layer" block (recorded as `SL_`).
- \** MCQ Multiple is the **same** `multiple-choice-template` in "multiple" answer mode (checkbox options); assets extend `components/mcq/`.
- \*** FIB Media is the **FIB** template in `fibWithImage` mode (file-picker/Reader heavy → mostly deferred).
- ⁴ **Extended Response Media** — the docs' `extendedResponseMedia` dataType does **not exist**. Source maps "Extended Response about Media" → **`identify-the-clip`**.
- ⁵ **WL Multipart** is the **same** `group-interactivity-template` as ELA Multipart, but in the **wl** module. Run with `CYPRESS_AUTHORING_MODULE=wl`.

## Legend & notes
- **Auto** — executable authoring-side assertion exists. **Defer** — Reader / Preview / Publish / cross-session / file-picker / a11y; kept as `it.skip()` with a reason.
- Specs are discovered via `cypress.config.ts` `specPattern: '{e2e,components}/**/*.spec.ts'`.
- Each component folder is self-contained: `selectors.ts`, `commands.ts`, `testdata.ts`, `<spec>`, `component.json`, `<slug>-mapping.json`, `<SLUG>-DEEP-AUTOMATION.md`.
- All custom commands are declared/implemented in `support/commands.ts` (reused, never duplicated).

## Build verification (done)
- `npx cypress run --spec "components/**/*-deep.spec.ts"` → **3,075 tests**, **0 failing**, all pending (self-skip without `AUTHORING_LAUNCH_URL`). Confirms every spec compiles & discovers.

## ⚠️ Live verification (pending — final step)
No component has been run against a live authoring instance yet. Selectors are **source-derived** from `closify/KITABOO_Authoring/templates/` + `config/config.js`. A live run (set `AUTHORING_LAUNCH_URL`) is required to confirm drop targets, settings-panel selectors, and flag-gated controls, then flip each `component.json` status to `verified`.
