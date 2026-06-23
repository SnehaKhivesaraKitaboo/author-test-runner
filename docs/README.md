# Documentation Index

All documentation for the Kitaboo Authoring Test Runner lives in this folder.

---

## How to run

### Prerequisites

- **Node.js 16+**
- **XAMPP MySQL** running on port **3306** (database `authoring_test_runner`)
- A **fresh Kitaboo Authoring launch URL** (`courseId` + `userToken` — tokens expire quickly)
- Chrome (Cypress runs tests in Chrome by default)

### Setup (first time)

From the repo root:

```bash
cd authoring-tests
npm install
cp .env.example .env
```

Edit `.env` and set:

- **`DB_HOST`**, **`DB_PORT`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_NAME`** — XAMPP MySQL (see [DATABASE.md](DATABASE.md))
- **`AUTHORING_LAUNCH_URL`** — full launch URL (recommended), or
- **`AUTHORING_BASE_URL`**, **`AUTHORING_PATH`**, **`AUTHORING_COURSE_ID`**, **`AUTHORING_USER_TOKEN`**

Initialize the database (first time or after schema changes):

```bash
npm run db:setup
```

### Start the dashboard

```bash
npm start
```

Open **http://localhost:4321** → sign in → dashboard at **/dashboard.html**.

Default demo account: `demo@kitaboo.com` / `Demo@123` (created by `db:setup`).

For auto-restart on server changes:

```bash
npm run dev
```

### Run tests via dashboard

You must be **signed in** (Bearer token) to start runs and view your run history.

**E2E mode** — run smoke/deep specs individually or in bulk:

1. Sign in, then paste a fresh launch URL into the dashboard.
2. Leave mode on **E2E**.
3. Select one or more specs (e.g. `01-session-launch`, `13-fib-deep`).
4. Click **Run**.

**Component Test mode** — run by widget/component (recommended for FIB):

1. Paste a fresh launch URL.
2. Switch to **Component Test**.
3. Select component(s) — e.g. **Fill in the Blank** (verified).
4. Confirm the step flow panel appears on the left.
5. Click **Run Component Tests**.
6. Watch **Test Run View** on the right (flow checklist + live screenshots).

### Run tests via CLI (Cypress only)

Without the dashboard:

```bash
# Headless run — all specs
npm run cypress:run

# Interactive Cypress UI
npm run cypress:open

# Single spec (example: FIB deep)
npx cypress run --config-file cypress.config.ts --spec e2e/13-fib-deep.spec.ts
```

Pass the launch URL via env when not using the dashboard:

```bash
AUTHORING_LAUNCH_URL="https://stagingauthor.kitaboo.com/html_authoring2_carnegie/index.html?courseId=...&userToken=..." npm run cypress:run
```

### Verify QC PDF catalog

```bash
node scripts/verify-qc-pdfs.js
```

Reports and artifacts are written under `runs/<runId>/` (HTML report, JSON, PDF, screenshots, video). Run metadata and artifact indexes are stored in **MySQL** per user — see [DATABASE.md](DATABASE.md).

### Windows PowerShell: `npm` blocked by execution policy

If you see *"running scripts is disabled on this system"* when running `npm install`:

**Option A — use `.cmd` shims (no policy change):**

```powershell
npm.cmd install
npm.cmd start
```

**Option B — allow scripts for your user (one-time):**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then `npm install` and `npm start` work normally in PowerShell.

**Option C — use Command Prompt (cmd)** instead of PowerShell — `npm` works there without policy changes.

---

## Start here

1. **[../README.md](../README.md)** — Quick start, current status, spec inventory  
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** — How the system works (tech stack, flow, APIs)  
3. **[DATABASE.md](DATABASE.md)** — MySQL setup, tables, reports, phpMyAdmin  
4. **[AUTH-AND-UI.md](AUTH-AND-UI.md)** — Login page, sessions, sign out  
5. **[TEST-RUNNER-SOLUTION.md](TEST-RUNNER-SOLUTION.md)** — Dashboard usage and troubleshooting  

---

## FIB (verified implementation)

6. **[FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md)** — Complete FIB reference  
   - QC PDF: `D:\Author_Test_cases\Author Test Cases - FIB test cases.pdf`  
   - Spec: `e2e/13-fib-deep.spec.ts`  
   - TC mapping: automated vs deferred  

---

## Future component work

7. **[TEAM-COMPONENT-PROMPT.md](TEAM-COMPONENT-PROMPT.md)** — **Start here for new components** — team master prompt (FIB pattern)  
8. **[COMPONENT-PROMPTS.md](COMPONENT-PROMPTS.md)** — Copy-paste prompts for every remaining component  
9. **[MASTER-AGENT-PROMPT.md](MASTER-AGENT-PROMPT.md)** — Reusable template for new deep specs  
10. **[QC-REGISTRY.md](QC-REGISTRY.md)** — Full component catalog table  

---

## Quick links

| Task | Command / file |
|------|----------------|
| Init MySQL | `npm run db:setup` |
| Start server | `npm start` → login http://localhost:4321 |
| Run FIB only | Component Test → select Fill in the Blank |
| Verify QC PDFs | `node scripts/verify-qc-pdfs.js` |
| Env config | `.env.example` → copy to `.env` |
| DB schema | `database/schema.sql` |
| QC catalog data | `fixtures/test-registry.json` |
| Setup flows | `fixtures/component-flows.json` |

