# Extraction notes — from Closify to standalone

This project was extracted from the Closify repository
(`closify`, branch **`Automation_epub_tester`**) into a standalone app at
`D:\EPUB-Automation-Tester`.

## Source modules

| Standalone path | Source in Closify | Module |
|-----------------|-------------------|--------|
| `./` (root: server, lib, e2e, support, fixtures, public, scripts, database, docs) | `closify/authoring-tests/` | **Authoring Test Runner** |
| `public/performance-test/` | `closify/KITABOO_Authoring/performance-test/` | **EPUB Performance Test** |

The `authoring-tests` suite was already self-contained (its own
`package.json`, `cypress.config.ts`, Express server). The EPUB Performance Test
tool was the only piece that lived inside the larger `KITABOO_Authoring` tree
and was wired in by path.

## Decoupling changes

1. **Relocated the perf tool into the app.** Copied
   `KITABOO_Authoring/performance-test/` → `public/performance-test/`, so the
   existing `express.static('public')` mount serves it. No external tree needed.

2. **Removed the Closify static mount.** `server.js` previously mounted
   `../KITABOO_Authoring` at `/KITABOO_Authoring`. That hard sibling-path
   dependency was removed. An **optional** mount remains, gated behind
   `LOCAL_AUTHORING=1` + an explicit absolute `LOCAL_AUTHORING_DIR` (off by default).

3. **Rewired the dashboard link.** `public/index.html` now opens
   `/performance-test/index.html` instead of
   `/KITABOO_Authoring/performance-test/index.html`.

4. **Neutralized hardcoded Closify URLs** in the perf tool
   (`performance-dashboard.js`, `index.html` placeholder) — example/fallback
   URLs now point at `stagingauthor.kitaboo.com` instead of
   `127.0.0.1:5500/closify/KITABOO_Authoring/...`.

5. **Puppeteer browser path.** PDF generation now honors
   `PUPPETEER_EXECUTABLE_PATH` so containers can reuse a system Chrome.

6. **Packaging/metadata.** `package.json` renamed to `epub-automation-tester`;
   `.gitignore` hardened; added `.env.staging.example`, `ecosystem.config.js`,
   `Dockerfile`, `.dockerignore`, `DEPLOYMENT.md`, this file.

## Remaining external references (intentional / harmless)

- **Target authoring app** is reached over its public URL (staging by default) —
  this is the system under test, not a code dependency.
- **`D:/Author_Test_cases`** QC PDFs are referenced only by the optional
  `scripts/verify-qc-pdfs.js` and as informational metadata; overridable via
  `QC_TEST_CASES_DIR`. Not required to run tests.
- Some `docs/*.md` still mention original Closify paths for historical context.

## Verification performed

- `npm install` (367 packages) + `npx cypress verify` → OK.
- Server boots in disk-only mode; these endpoints returned `200`:
  `/`, `/dashboard.html`, `/performance-test/index.html`,
  `/api/config`, `/api/registry`, `/api/modules`, and all
  `/performance-test/{css,js}/...` assets.
- The old `/KITABOO_Authoring/performance-test/index.html` path correctly
  returns `404`, confirming no hidden dependency on the Closify tree.
