# Kitaboo Authoring Test Runner — Solution Documentation

> **Purpose:** Operational reference for the dashboard, live preview, APIs, and troubleshooting.  
> **Login:** `http://localhost:4321` · **Dashboard:** `/dashboard.html` (start with `npm start`)  
> **QC source PDFs:** `D:/Author_Test_cases/` (47 component PDF files)  
> **Production verified:** Fill in the Blank (FIB) deep spec only — see [FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md)

### Documentation index

| Doc | Contents |
|-----|----------|
| [../README.md](../README.md) | Quick start, status matrix, spec inventory |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technologies, run lifecycle, folder layout |
| [DATABASE.md](DATABASE.md) | MySQL (XAMPP), users, runs, reports, phpMyAdmin |
| [AUTH-AND-UI.md](AUTH-AND-UI.md) | Login page, sessions, dashboard gate |
| [FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md) | FIB QC PDF mapping, selectors, coverage gaps |
| [COMPONENT-PROMPTS.md](COMPONENT-PROMPTS.md) | Copy-paste prompts for all other components |
| [MASTER-AGENT-PROMPT.md](MASTER-AGENT-PROMPT.md) | Reusable agent template |
| [QC-REGISTRY.md](QC-REGISTRY.md) | Full 47-component catalog table |

---

## 1. What We Built

A **standalone Cypress test runner** with:

- **Login gate** — sign in / sign up (`public/index.html`), MySQL-backed sessions
- Split dashboard: **left** = configure / progress / history, **right** = **live preview** (`public/dashboard.html`)
- **E2E mode** — run specs 01–13 individually or in bulk
- **Component Test mode** — pick one or more widgets/elements; deep components run dedicated specs
- **QC catalog** — `test-registry.json` maps each component to its PDF, TC count, and spec file
- **Live step-by-step preview** — flow checklist + Cypress screenshots during runs
- **Persistent run history** — per user in MySQL (`test_runs`), max 10 on disk + DB, delete APIs
- **Test Artifacts** — collapsible card; open in new tab + separate download icon; indexed in `run_artifacts`

---

## 2. Login, MySQL & sessions (June 2026)

### 2.1 First-time database setup

```bash
# XAMPP: start MySQL (port 3306)
cd authoring-tests
npm install
cp .env.example .env    # set DB_PASSWORD if needed
npm run db:setup        # schema + demo users
npm start
```

| Email | Password |
|-------|----------|
| `demo@kitaboo.com` | `Demo@123` |
| `admin@kitaboo.com` | `Admin@123` |

Full reference: [DATABASE.md](DATABASE.md).

### 2.2 Login UI

- **URL:** `http://localhost:4321/` → `public/index.html`
- Tabs: Log in / Sign up; Google button (stub); captcha; Remember me
- On success → token stored → redirect `dashboard.html`
- UI details: [AUTH-AND-UI.md](AUTH-AND-UI.md)

### 2.3 What MySQL stores vs disk

| MySQL | Disk (`runs/<runId>/`) |
|-------|-------------------------|
| User, session hash | — |
| Run status, pass/fail, launch URL | `run-meta.json` |
| Artifact file names/paths | `reports/report.pdf`, `.html`, `videos/`, `screenshots/` |

Downloads still use `/api/download/<runId>/...` (files served from disk).

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Login (public/index.html) → POST /api/auth/login               │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard (public/dashboard.html) + public/js/api-client.js    │
│  ├── Bearer token on /api/run, /api/history                     │
│  ├── Component picker ← GET /api/registry                         │
│  ├── Test flow panel  ← GET /api/component-plan?name=...        │
│  └── Live Preview     ← SSE + GET /api/preview/:runId/...       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ POST /api/run (auth)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  server.js (Express, port 4321)                                 │
│  ├── lib/auth-service.js, lib/run-repository.js, lib/db.js      │
│  ├── spawnCypress() via node cypress/bin/cypress (cwd-safe)     │
│  ├── SSE /api/progress/:runId                                   │
│  ├── lib/progress-parser.js — parse Cypress stdout              │
│  ├── lib/registry.js — routing, test counts, component plan     │
│  └── lib/history-store.js — disk prune + run-meta.json          │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
                ▼                             ▼
         Cypress e2e/*.spec.ts          MySQL authoring_test_runner
```

---

## 4. QC Test Cases Integration

### 3.1 Master registry

**File:** `fixtures/test-registry.json`

- One entry per component (47 total from QC PDFs)
- Fields: `name`, `dataType`, `pdfFile`, `tcCount`, `automationStatus`, `specFile`, `deepSpecFile`
- `automationStatus`: `basic` | `deep` | `planned`

### 3.2 Component setup flows

**File:** `fixtures/component-flows.json`

- Per–deep-component **8-step setup flow** (shown in dashboard + live preview)
- Example: FIB → Generic Step → drop FIB → dummy content → settings panel

### 3.3 QC PDF verification

**Script:** `scripts/verify-qc-pdfs.js`

```bash
node scripts/verify-qc-pdfs.js
```

Compares `test-registry.json` `pdfFile` entries against files in `D:/Author_Test_cases/`.

### 3.4 Planned folder structure (future)

```
authoring-tests/
├── registry/index.json              # evolve from test-registry.json
├── components/fill-in-the-blank/
│   ├── meta.json
│   ├── test-cases.json            # TC_02–TC_62 from PDF
│   ├── selectors.json
│   └── deep.spec.ts
```

---

## 5. Component Test Mode — How Routing Works

When user selects components and clicks **Run Component Tests**:

1. `POST /api/run` with `{ mode: "component", components: ["Fill in the Blank"] }`
2. `lib/registry.js` → `resolveComponentModeSpec()`:
   - **Single component with `deepSpecFile`** → run that spec only (e.g. `e2e/13-fib-deep.spec.ts`)
   - **Multiple components or no deep spec** → `e2e/09-component-deep.spec.ts` (filtered by env)

| Component           | dataType                  | Deep spec                    |
|---------------------|---------------------------|------------------------------|
| Fill in the Blank   | `fill-in-the-blank`       | `13-fib-deep.spec.ts`        |
| Multiple Choice     | `multiple-choice-template`| `11-mcq-deep.spec.ts`        |
| MCQ Multiple        | `mcq-multiple`            | `12-mcq-multiple-deep.spec.ts` |
| Others              | various                   | `09-component-deep.spec.ts`  |

**Important:** For full FIB QC flow, select **only Fill in the Blank** (one component).

---

## 6. FIB Deep Test Flow (13-fib-deep.spec.ts)

Assessment widgets (FIB, MCQ) **must** be dropped inside a **Generic Step** column — not on Instructions page.

### Setup sequence (TC_02)

| Step | Cypress command / action |
|------|---------------------------|
| 1 | `cy.openAuthoringTool(LAUNCH_URL)` |
| 2 | `cy.createTestStep('GenericStep')` — TOC `.removeAddPreview` → `#StepWidgetBtm` → wizard (`#title` → `#nextBtn` ×2 → `#subBtn`) |
| 3 | `cy.openAddPanel()` + `cy.expandSection('Widgets')` |
| 4 | `cy.dropWidgetIntoGenericStep('Fill in the Blank', 0)` |
| 5 | Enter header + sentence dummy text |
| 6 | `cy.openFibSettings()` → `#fib-settings-panel` assertions |

### Key selectors

- Settings panel: `#fib-settings-panel`
- Option types: `#with-option`, `#without-option`, `#drag-and-drop`
- Widget on canvas: `[data-type="fill-in-the-blank"]`
- Drop zone: `.generic-step-column-content`

---

## 7. Cypress Commands (support/commands.ts)

| Command | Purpose |
|---------|---------|
| `openAuthoringTool(url?)` | Visit launch URL, wait for Save button, reset live steps |
| `createTestStep('GenericStep')` | Full TOC → step chooser → metadata wizard flow |
| `dropWidgetIntoGenericStep(name, col)` | AngularJS `onDropComplete` on Generic Step column |
| `openAddPanel()` / `expandSection()` | Left widget panel |
| `openFibSettings()` | Click FIB + open settings panel |
| `captureLiveStep(label)` | `cy.screenshot()` + log `[AuthoringLiveStep]` |
| `resetLiveSteps()` | Reset screenshot counter at run start |

All step actions use `cy.log()` with numbered emoji steps so they appear in video/report.

---

## 8. Live Preview Solution

### 7.1 What the user sees

**Test Run View** (right panel):

1. **Flow checklist** — 8 QC steps; states: pending → **active** (purple) → **done** (green ✓) → **failed** (red ✗)
2. **Current suite** — e.g. `13-A — FIB: Setup — Generic Step + drop FIB (TC_02)`
3. **Current test** — e.g. `TC_02a — SETUP: Open authoring tool…`
4. **Screenshot** — latest Cypress capture synced to the active step

**App View** — static iframe of launch URL (manual “Load URL”).

### 7.2 How screenshots reach the dashboard

```
cy.captureLiveStep() / failure screenshot
        ↓
cypress.config.ts → after:screenshot hook
        ↓ copies to runs/<runId>/screenshots/live/snap-0001.png
        ↓ console.log [AuthoringLiveStep] label|live/snap-0001.png
        ↓
server.js parseLiveContextFromLine → SSE { type: 'liveStep', screenshotUrl }
        ↓
dashboard showPreviewScreenshot(url)
```

**Polling fallback:** `GET /api/preview/:runId/latest-screenshot` every 800ms.

### 7.3 Screenshot serving fixes

| Issue | Fix |
|-------|-----|
| Nested paths (`13-fib-deep.spec.ts/...png`) | Regex route: `GET /api/download/:runId/screenshots/*` |
| 500 error / broken image (em dash in filename) | `safeContentDispositionFilename()` in `sendArtifactFile()` |
| Long Cypress failure names | Flat copies as `live/snap-0001.png` in `after:screenshot` |

### 7.4 Common preview issues

| Symptom | Cause | Action |
|---------|-------|--------|
| Blank / broken image | Was Content-Disposition crash (fixed) | Hard refresh Ctrl+F5 |
| Step 1 fails immediately | **Session Expired** — bad `userToken` | Paste fresh launch URL |
| Flow steps not updating | JS error (fixed: added helper functions) | Check browser console |
| No screenshot yet | First test still loading (30–60s) | Wait for TC_02a to attempt |

---

## 9. Dashboard UX Changes

### 9.1 Test Artifacts card

- **Collapsed by default** (chevron ▼ / ▲)
- **File name click** → open in **new tab** (inline preview)
- **Download icon** beside badge → `?download=1` (attachment)
- File count badge in header when collapsed

### 9.2 Component Test panel

- Component cards show **deep** badge and TC count
- **Test flow panel** appears when exactly **one** component is selected
- Shows QC PDF, spec file, drop target, 8 setup steps

### 9.3 Run history

- Max **10** runs per user (MySQL + disk); older auto-pruned
- Requires sign-in; history filtered by `user_id`
- Scroll panel (~3 visible)
- **Delete one** (`DELETE /api/history/:runId`) and **Delete all**

---

## 10. Server APIs

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Returns `token`, `user`, `expiresAt` |
| POST | `/api/auth/logout` | Bearer | End session |
| GET | `/api/auth/me` | Bearer | Current user |

### Runs & artifacts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/run` | **Yes** | Start run `{ launchUrl, mode, spec?, components? }` |
| GET | `/api/progress/:runId` | No | SSE log + progress + screenshots |
| GET | `/api/history` | **Yes** | Current user's run list (MySQL + disk files) |
| DELETE | `/api/history/:runId` | **Yes** | Delete one run (DB + disk) |
| DELETE | `/api/history` | **Yes** | Delete all user's completed runs |
| GET | `/api/config` | No | Launch URL from `.env` / fixture |
| GET | `/api/registry` | No | All components from test-registry |
| GET | `/api/component-plan?name=` | No | Flow + spec routing for one component |
| GET | `/api/preview/:runId/latest-screenshot` | No | Latest PNG URL |
| GET | `/api/download/:runId/*` | No | Reports, videos, screenshots |

---

## 11. Environment & Config

**File:** `.env.example` (copy to `.env`)

```env
PORT=4321

# XAMPP MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=authoring_test_runner

AUTHORING_LAUNCH_URL=https://stagingauthor.kitaboo.com/...?courseId=...&userToken=...
# or separate:
AUTHORING_BASE_URL=
AUTHORING_PATH=
AUTHORING_COURSE_ID=
AUTHORING_USER_TOKEN=
```

Per-run Cypress env (set by server):

- `AUTHORING_SCREENSHOTS_DIR` → `runs/<runId>/screenshots`
- `AUTHORING_VIDEOS_DIR` → `runs/<runId>/videos`
- `CYPRESS_AUTHORING_LAUNCH_URL`
- `CYPRESS_AUTHORING_TEST_COMPONENTS`

---

## 12. File Change Index

| File | Changes |
|------|---------|
| `public/index.html` | Login / sign up UI (entry at `/`) |
| `public/dashboard.html` | Test runner dashboard (auth gate, Sign out) |
| `public/js/api-client.js` | Bearer token + `apiFetch()` |
| `database/schema.sql` | MySQL tables |
| `scripts/setup-database.js` | `npm run db:setup` |
| `lib/db.js`, `lib/auth-service.js`, `lib/auth-middleware.js`, `lib/run-repository.js` | MySQL auth + run persistence |
| `server.js` | Auth routes, DB on run complete, Cypress spawn via `node` (path-safe) |
| `lib/registry.js` | `resolveComponentModeSpec` from registry, `getSuiteByName`, `loadComponentFlows` |
| `lib/progress-parser.js` | Progress + `parseLiveContextFromLine` (suite, test, liveStep) |
| `lib/history-store.js` | Disk run-meta, max 10 prune, delete |
| `support/commands.ts` | `createTestStep`, `dropWidgetIntoGenericStep`, `captureLiveStep` |
| `cypress.config.ts` | Retries, `after:screenshot` → live/snap-NNNN.png |
| `e2e/13-fib-deep.spec.ts` | FIB deep tests TC_02–TC_62 subset |
| `fixtures/test-registry.json` | 47 components, PDF links, deepSpecFile |
| `fixtures/component-flows.json` | FIB / MCQ setup flows |
| `scripts/verify-qc-pdfs.js` | QC PDF ↔ registry checker |
| `.env.example` | Environment template |

---

## 13. How to Run (Quick Reference)

```bash
cd authoring-tests
npm install
npm run db:setup   # first time — XAMPP MySQL must be running
npm start
# http://localhost:4321 → sign in → dashboard
```

**FIB component test:**

1. Sign in (`demo@kitaboo.com` / `Demo@123` or your account).
2. Paste **fresh** launch URL (must include valid `userToken`)
2. Switch to **Component Test**
3. Select **only** “Fill in the Blank”
4. Confirm 8-step flow panel appears
5. Click **Run Component Tests**
6. Use **Test Run View** on the right (not App View)
7. Watch flow steps + screenshots update

**Verify QC PDFs:**

```bash
node scripts/verify-qc-pdfs.js
```

---

## 14. Future Work (Recommended)

| Phase | Task |
|-------|------|
| 1 | Per-component `test-cases.json` from PDFs (TC id, steps, expected) |
| 2 | Move deep specs into `components/<dataType>/` packs |
| 3 | Deep specs for Sorting, True/False, Image, etc. |
| 4 | TC checkbox filter (`CYPRESS_TC_FILTER=TC_08,TC_09`) |
| 5 | Google OAuth + server-side captcha (reCAPTCHA) |
| 6 | CI/CD (GitHub Actions), Docker, Allure reports |
| 7 | Embed failure screenshots in HTML/PDF reports |

---

## 15. Troubleshooting

### MySQL / server won't start

- Error: `Cannot connect` → start XAMPP MySQL; verify `DB_*` in `.env`
- Run `npm run db:setup` after creating empty database
- See [DATABASE.md](DATABASE.md)

### Login returns 401

- Use seed users from `db:setup` or register a new account
- Check `users.is_active = 1` in phpMyAdmin

### History empty after login

- Old runs on disk have no `user_id` — run new tests while signed in

### Cypress fails immediately (exit code 1, config not found)

- Fixed: server spawns via `node node_modules/cypress/bin/cypress` with `cwd` = project root (paths with spaces like `Carnegie Learning`)
- Restart server after pulling latest `server.js`

### Server won't start (port in use)

```powershell
Get-NetTCPConnection -LocalPort 4321 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
cd authoring-tests
npm start
```

### Cypress fails at openAuthoringTool

- Log shows `Session Expired` → renew `userToken` in launch URL
- Log shows timeout on Save button → staging may be down or URL wrong

### Live preview stuck on "Open Add panel → Widgets"

FIB deep setup **does not open the left Add panel** — Carnegie UI hides `#lbl-add` / left `#lbl-add-content`. FIB is dropped via **`dropWidgetIntoGenericStep`** (Angular `onDropComplete` on `.generic-step-column-content`). To browse widgets manually, use the **right rail → Components** tab (`.components .header-component`).

### TC_02b+ fails on FIB settings / content

- Click the **FIB sd-item** (not only inner `.fib`) so `fib-template-directive` sets `commonrightpanel = switchSettings`
- Use **`#fib-settings-panel #with-option`** — settings toggles live inside `.fib-settings-panel`
- **`data-fib-type`**, **`Case_Sensitive`**, **`shuffle-choices`** are on **`.fib` / `.fib-body`**, not on `[data-type="fill-in-the-blank"]` wrapper
- Header/sentence are **contenteditable** — use `cy.setContentEditableText()` (not `cy.type()`)
- Add Sentence button class is **`.add-sentence-fib`** (not `.add-sentence`)

### TC_02a fails on createTestStep

- Wizard tabs 0–1 require **`#nextBtn`**; **`#subBtn`** is only visible on the final tab (Instructions, or Support for CL-MATH)
- Fill step title in **`#title`** (not a generic input) before clicking Next
- Do not assert TOC entry count — verify **`#loader` hidden**, **`.activeTocItem`**, and **`#desktop_view`** instead
- Check TOC selectors: `#add-page-dropdown.removeAddPreview`, `ul.tocPageIconMenu #StepWidgetBtm`, `#widget-popup`, `#formsModal`
- Generic Step must complete metadata wizard before canvas is ready

### Live preview still blank after fixes

- Hard refresh dashboard (Ctrl+F5)
- Confirm run folder has `runs/<runId>/screenshots/live/*.png`
- Test URL manually: `http://localhost:4321/api/preview/<runId>/latest-screenshot`

---

*Last updated: June 2026 — Kitaboo Authoring Test Runner (`authoring-tests/`)*
