# Extended Response (Question & Answer) — Deep Automation

- **Component slug:** `extended-response`
- **dataType:** `shortLongAns` · **directive:** `shortlongans-template`
- **Spec:** `15-extended-response-deep.spec.ts`
- **QC authority:** `Author Test Cases - Extended Response.pdf` (TC_01–TC_46)
- **Source authority:**
  - `templates/shortLongAns/shortLongAns.html`
  - `templates/shortLongAns/shortLongAns-settings-pannel.html`

## Architecture notes (source-verified)

- The dropped component uses wrapper class **`.shortLongAnsComponent`** (the
  `data-type` may also be `shortLongAns`); the spec's widget selector tolerates
  both.
- The settings panel is **`#shortLongAns-setting`** with title **"Question Answer"**.
- **Answer types:** Short / Long / **RTE**. The RTE radio and the **Keyboard
  Type** (Basic / Advance-JODIT) radios are gated by `TOCFlag`, so they may be
  absent in some builds — the spec asserts "at least one answer type" rather
  than a specific one.
- **Outline / Fill Background** radios + colour picker render **only when
  `styleSelected == 'style1'`**. The spec degrades gracefully (logs + returns)
  when they are not rendered.
- **Enable Keyboard** checkbox is **disabled until a subject-level special
  language** (French/German/Spanish) is selected. The authoring DOM provides no
  way to set the subject language, so all special-keyboard-language cases are
  **deferred**.
- **Alt Text** textarea enforces `maxlength=2000`.

## Coverage

| Status | Count | Notes |
|---|---|---|
| Automated | 18 | Settings-panel presence, answer-type/outline/tags/alt-text, content entry, security |
| Deferred | 28 | Special-keyboard languages, Preview/Reader typing, copy/submit/multipart, runtime colour validation |

## Why so many deferrals

Roughly half the QC suite targets the **special-character keyboard** (which
only activates with a subject-level language not settable from the authoring
DOM) and **Preview/Reader** typing/submission. Those are intentionally marked
`it.skip()` with explicit reasons in the spec and `extended-response-mapping.json`.

## Run

```bash
# headed, single spec
npx cypress run --spec "components/extended-response/15-extended-response-deep.spec.ts"
```

Requires `AUTHORING_LAUNCH_URL` (Cypress env). Without it the suite self-skips.

> ⚠️ Not yet live-verified against a running authoring instance — selectors are
> source-derived. A single run will confirm drop + settings-panel selectors.
