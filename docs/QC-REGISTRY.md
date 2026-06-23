# QC Component Registry

> Source: `fixtures/test-registry.json`  
> PDF folder: `D:\Author_Test_cases\`  
> Total: **46 components** in `test-registry.json`, **3,231 test cases** in `_meta` (Cycle-01 / 02 / 03)

---

## Automation status legend

| Status | Meaning |
|--------|---------|
| **deep** | Dedicated deep spec file (`deepSpecFile`) |
| **basic** | Smoke in category spec — drop, render, settings panel |
| **planned** | PDF mapped; no automation file yet |

**Production verified (May 2026):** only **Fill in the Blank** deep spec.

---

## Full component table

| # | Component | dataType | TCs | Status | Spec | Deep spec | QC PDF |
|---|-----------|----------|-----|--------|------|-----------|--------|
| 1 | Instruction for Student | `instructionsstudents` | 19 | basic | 07-element | — | Instruction for Student.pdf |
| 2 | Instruction for Teacher | `instructionsteacher` | 19 | basic | 07-element | — | Instruction for Teacher.pdf |
| 3 | Annotation | `annotationHighlightOutline` | 29 | basic | 08-widget | — | Annotation.pdf |
| 4 | Callout | `sidebarComponent` | 110 | basic | 07-element | — | Callout.pdf |
| 5 | Carousel | `slideshow` | 101 | basic | 08-widget | — | Carousel.pdf |
| 6 | Center Layout | `layout-2` | 67 | basic | 06-layout | — | Center Layout.pdf |
| 7 | CLIC Component | `sketchpad` | 33 | basic | 08-widget | — | CLIC.pdf |
| 8 | Click to Reveal | `clickToReveal` | 113 | basic | 08-widget | — | Click to Reveal.pdf |
| 9 | Copy and Paste | `cross-component` | 18 | planned | — | — | Copy and Paste.pdf |
| 10 | Correction | `correction` | 29 | basic | 08-widget | — | Correction.pdf |
| 11 | Custom Center | `layout-6` | 67 | basic | 06-layout | — | Custom Center.pdf |
| 12 | Edit Metadata | `step-metadata` | 34 | planned | — | — | Edit metadata.pdf |
| 13 | ELA Multipart | `ela-multipart` | 155 | planned | — | — | ELA- Multipart.pdf |
| 14 | Extended Response Media | `extendedResponseMedia` | 159 | planned | — | — | Extended Response About Media.pdf |
| 15 | Extended Response | `shortLongAns` | 46 | basic | 08-widget | — | Extended Response.pdf |
| 16 | External Cumulation | `external-cumulation` | 47 | planned | — | — | External Cumulation.pdf |
| 17 | **Fill in the Blank** | `fill-in-the-blank` | 59 | **deep ✓** | 08-widget | **13-fib-deep** | **FIB test cases.pdf** |
| 18 | FIB Media | `fib-media` | 43 | planned | — | — | FIBMedia test cases.pdf |
| 19 | Flashcard | `flashcard` | 41 | basic | 08-widget | — | Flashcard.pdf |
| 20 | Flexi Layout | `layout-7` | 87 | basic | 06-layout | — | Flexi Layout.pdf |
| 21 | Four Column | `layout-4` | 67 | basic | 06-layout | — | Four column.pdf |
| 22 | Generic Step | `GenericStep` | 113 | basic | 10-step-creation | — | Generic Step.pdf |
| 23 | Graphic Organizer (Image) | `graphicOrganizerImageHotSpot` | 77 | basic | 08-widget | — | Graphic Organizer (Image-based) .pdf |
| 24 | Highlighter | `highlight` | 45 | basic | 08-widget | — | Highlighter.pdf |
| 25 | HTML Interactivity | `htmlInteractivity` | 35 | planned | — | — | HTML Interactivity.pdf |
| 26 | Image Labeling | `imagelabelling` | 12 | basic | 08-widget | — | Image labeling.pdf |
| 27 | Image | `image` | 25 | basic | 07-element | — | Image.pdf |
| 28 | Internal Cumulation | `internal-cumulation` | 70 | planned | — | — | Internal Cumulation.pdf |
| 29 | Jodit Editor | `jodit-editor` | 51 | planned | — | — | Jodit Editor Test Cases.pdf |
| 30 | Left Layout | `layout-1` | 67 | basic | 06-layout | — | Left Layout.pdf |
| 31 | Lesson Opener | `lesson-opener` | 126 | planned | — | — | Lesson Opener.pdf |
| 32 | LoD + Annotation Cue | `lod` | 145 | basic | 09-component-deep | — | LoD and Annottaion cue.pdf |
| 33 | MCQ (Single Choice) | `multiple-choice-template` | 102 | deep* | 11-mcq-deep | 11-mcq-deep | MCQ .pdf |
| 34 | MCQ Multiple | `mcq-multiple` | 108 | deep* | 12-mcq-multiple-deep | 12-mcq-multiple-deep | MCQ Multiple.pdf |
| 35 | Offline Step | `offline-step` | 43 | planned | — | — | Offline step.pdf |
| 36 | Right Layout | `layout-3` | 67 | basic | 06-layout | — | Right Layout.pdf |
| 37 | Sample Layer / TIG Panel | `sample-layer` | 108 | planned | — | — | Sample Layer _TIG Panel.pdf |
| 38 | Situation Header | `situationbox` | 54 | basic | 07-element | — | Situation Header.pdf |
| 39 | Steps Cloning | `step-cloning` | 77 | planned | — | — | Steps Cloning.pdf |
| 40 | Table | `tablesNew` | 88 | basic | 07-element | — | Table.pdf |
| 41 | Text | `paragraph` | 40 | basic | 07-element | — | Text.pdf |
| 42 | Thumbcard | `thumbcard` | 38 | planned | — | — | Thumbcard.pdf |
| 43 | True or False | `true-false-template` | 90 | basic | 08-widget | — | True or False.pdf |
| 44 | Video | `video` | 69 | basic | 07-element | — | Video.pdf |
| 45 | WL Multipart | `wl-multipart` | 205 | planned | — | — | WL - Multipart.pdf |
| 46 | Wordsearch | `wordsearch` | 33 | basic | 08-widget | — | Wordsearch.pdf |

\* MCQ specs exist but are **not verified** as production-ready (unlike FIB).

---

## Category summary

| Category | Components | Total TCs |
|----------|------------|-----------|
| Layout | 6 | 422 |
| Layer | 2 | 253 |
| Element | 7 | 361 |
| Widget | 21 | 1,356 |
| Feature | 9 | 481 |
| Page | 3 | 164 |

---

## Verify PDFs on disk

```bash
node scripts/verify-qc-pdfs.js
```

Compares every `pdfFile` in `test-registry.json` against `D:\Author_Test_cases\`.

---

## Related docs

- Implementation prompts: [COMPONENT-PROMPTS.md](COMPONENT-PROMPTS.md)
- FIB reference: [FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md)
- Master template: [MASTER-AGENT-PROMPT.md](MASTER-AGENT-PROMPT.md)

---

*Last updated: May 2026*
