# MCQ — Source & PDF Reference

Traceability between the application source, the QC PDF, and this automation.

## QC PDF
- **File:** `Author Test Cases - MCQ .pdf`
- **Path:** `D:/ELA/Author_Test_cases/Author_Test_cases/Author Test Cases - MCQ .pdf`
- **Pages:** 3 · **Cases:** TC_01–TC_102 (main) + TC_77–TC_102 (Sample Layer, recorded as `SL_`)
- **Extracted catalog:** `mcq-testcases.json`

## Application source (implementation authority)
- `closify/KITABOO_Authoring/templates/multiple-choice-template/multiple-choice-template-settings.html`
- `closify/KITABOO_Authoring/templates/multiple-choice-template/multiple-choice-template-auth.html`
- `closify/KITABOO_Authoring/templates/multiple-choice-template/default/multiple-choice-template.json`
- `closify/KITABOO_Authoring/templates/multiple-choice-template/scripts/multiple-choice-template-directive.js`

## Key Angular bindings (settings panel)
| UI control | id / binding |
|---|---|
| Answer type | `#single-select` / `#multiple-select` → `currSettings.msOrSsBoolean` |
| Style cards | `.mcq_style_holder` / `.mcq_style_full_bleed_holder`; selected `.mcq_style_holder_selected` |
| Add Sample Answer | `#mcq-layer` → `currSettings.isLayerEnable` (gated by `isLayerCheckBoxEnable`) |
| Show Header / Instruction | `#header-visibility` / `#instr-visibility` |
| Add Media | `#add-media` → `currSettings.mediaCheckbox`; type radios `name="mcq_Media"` |
| Media align | `#img-left` / `#img-right` → `currSettings.imageAlign` |
| YouTube ID | `currSettings.youtubeVideoName` |
| Generic Feedback | `#add-generic-feedback` → `#correct_ans_feedback`, `#incorrect_ans_feedback` |
| Individual Feedback | `#add-feedback` → `currSettings.feedbackCheckbox` |
| Try Again | `#add-activity-restart`; count `#try-again-count`; spinner `.quantity-up`/`.quantity-down` |
| Show Me | `#add-show-me` → `currSettings.showmecheckbox` |
| Shuffle | `#add-shuftle-choices` |
| Reset | `id="add-show-me"` (reused) → `currSettings.reset` |
| Label types | `.label_type` (6, from default JSON `settings.label_type[]`) |

## Key bindings (auth canvas)
| UI | selector |
|---|---|
| Component root | `.multiple-choice` |
| Header / Instruction / Question | `.sc-intro.template-header` / `.sc-instr.template-instruction` / `.sc-question.template-paragraph` |
| Options | `#mcq-template-options .form-row.default` |
| Option text (contenteditable) | `.option-content` |
| Add Option | `.add-question-options-mcq` (disabled `.btn-disabled` at ≥10) |
| Delete Option | `.row-delete` (disabled `.btn-disabled` at ≤2) |
| Option image | `.mcq-row-image` |
| Header/Instruction visibility | `.header-text` / `.instruction-text` toggle `.displayBlock`/`.displayNone` |
