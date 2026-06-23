# Architecture — Kitaboo Authoring Test Runner

> Location: `authoring-tests/`  
> Parent project: closify / KITABOO Authoring Tool

---

## 1. Problem statement

Manual QC of 47 authoring components × thousands of test cases is slow and inconsistent. This project provides:

- Automated Cypress E2E tests against the live staging authoring URL
- A local dashboard to configure runs, watch live progress, and download artifacts
- A QC catalog linking each component to its PDF test cases
- Per-run isolation of screenshots, videos, and HTML reports
- **User accounts and run history** in MySQL (XAMPP), with login gate before the dashboard

---

## 2. High-level architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Browser — public/index.html (login, port 4321)                          │
│  └── Sign in / Sign up → Bearer token → dashboard.html                   │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Browser — public/dashboard.html                                         │
│  ├── E2E / Component mode, live preview, run history (per user)          │
│  └── AtrApi.apiFetch() → Authorization: Bearer <token>                   │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │ REST + SSE
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  server.js — Express                                                     │
│  ├── POST /api/auth/*       → lib/auth-service.js (bcrypt, sessions)     │
│  ├── POST /api/run          → spawn Cypress (auth required)              │
│  ├── GET  /api/progress/:id → SSE (logs, %, liveStep events)            │
│  ├── GET  /api/history      → lib/run-repository.js + disk artifacts     │
│  ├── lib/registry.js        → spec routing, test count estimates         │
│  ├── lib/progress-parser.js → parse Cypress stdout → progress + live    │
│  ├── lib/history-store.js   → run-meta.json + disk prune (max 10)        │
│  └── lib/db.js              → mysql2 pool → authoring_test_runner        │
└──────────────┬─────────────────────────────┬─────────────────────────────┘
               │ node cypress/bin/cypress    │ SQL
               ▼                             ▼
┌──────────────────────────────┐   ┌─────────────────────────────────────┐
│  Cypress 12 + TypeScript     │   │  MySQL (XAMPP :3306)                │
│  e2e/*.spec.ts, support/*    │   │  users, user_sessions, test_runs,   │
│  cypress.config.ts → live/   │   │  run_artifacts, login_audit       │
└──────────────────────────────┘   └─────────────────────────────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  KITABOO Authoring Tool (staging)                                        │
│  AngularJS 1.x + jQuery — editor shell, TOC, widget drop, settings       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Run lifecycle

```
User clicks Run
    │
    ▼
server creates runs/run-<timestamp>/
    ├── authoring-config.json   (launch URL, mode, components)
    ├── screenshots/
    ├── videos/
    └── reports/
    │
    ▼
spawn: node node_modules/cypress/bin/cypress run --config-file cypress.config.ts
    (cwd = project root; avoids Windows path-with-spaces issues under "Carnegie Learning")
    env: CYPRESS_AUTHORING_LAUNCH_URL, AUTHORING_SCREENSHOTS_DIR, ...
    │
    ▼
Cypress stdout → progress-parser → SSE events:
    { type: 'log' | 'progress' | 'liveStep' | 'complete' }
    │
    ▼
after:run → report.json + report.html (with setup screenshot timeline)
    │
    ▼
Dashboard shows artifacts; MySQL test_runs + run_artifacts updated; history per user (max 10)
```

---

## 4. Authentication & persistence

| Step | Component |
|------|-----------|
| Register / login | `POST /api/auth/register` \| `login` → `users` + `user_sessions` |
| Dashboard load | `GET /api/auth/me` with Bearer token |
| Start run | `POST /api/run` → `INSERT test_runs` with `user_id` |
| Run complete | `UPDATE test_runs`, `INSERT run_artifacts`, files under `runs/<runId>/` |
| History | `GET /api/history` → rows for current user only |

Details: [DATABASE.md](DATABASE.md), [AUTH-AND-UI.md](AUTH-AND-UI.md).

---

## 5. Component test routing

When `POST /api/run` has `{ mode: "component", components: ["Fill in the Blank"] }`:

```
lib/registry.js → resolveComponentModeSpec()
    │
    ├─ Single component WITH deepSpecFile → run that spec only
    │     e.g. "Fill in the Blank" → e2e/13-fib-deep.spec.ts
    │
    ├─ Single component WITHOUT deepSpecFile → e2e/09-component-deep.spec.ts
    │     (filtered by CYPRESS_AUTHORING_TEST_COMPONENTS)
    │
    └─ Multiple components OR "all" → e2e/09-component-deep.spec.ts
```

**Important:** For full FIB QC flow, select **exactly one** component: Fill in the Blank.

---

## 6. Live preview pipeline

```
cy.captureLiveStep('label')
    → cy.screenshot()
    → cypress.config.ts after:screenshot hook
    → copy to runs/<runId>/screenshots/live/snap-NNNN.png
    → console.log [AuthoringLiveStep] label|live/snap-NNNN.png
    → server parseLiveContextFromLine()
    → SSE { type: 'liveStep', screenshotUrl, label }
    → dashboard updates flow checklist + image

Fallback poll: GET /api/preview/:runId/latest-screenshot (800ms)
```

Setup milestones map to the 8-step flow in `fixtures/component-flows.json` via `LIVE_STEP_TITLES` in `cypress.config.ts`.

---

## 7. Folder structure

```
authoring-tests/
├── README.md                    ← start here
├── package.json
├── server.js                    ← Express + auth + APIs
├── cypress.config.ts            ← Cypress + HTML report generator
├── .env.example                 ← DB + launch URL template
│
├── database/
│   └── schema.sql               ← MySQL tables
│
├── public/
│   ├── index.html               ← login / sign up
│   ├── dashboard.html           ← test runner UI
│   └── js/api-client.js         ← Bearer token helper
│
├── e2e/                         ← Cypress spec files 01–13
│   ├── 13-fib-deep.spec.ts      ← FIB (verified)
│   ├── 11-mcq-deep.spec.ts      ← MCQ (unverified)
│   └── ...
│
├── support/
│   ├── commands.ts              ← core custom commands
│   ├── step-creation.ts         ← Generic Step wizard
│   ├── wait-utils.ts            ← DOM wait helpers
│   ├── module-setup.ts          ← ELA/WL/Math drop targets
│   ├── component-registry.ts    ← name → dataType resolution
│   └── session-state.ts         ← cross-test session flags
│
├── lib/
│   ├── db.js                    ← mysql2 connection pool
│   ├── auth-service.js          ← register, login, sessions
│   ├── auth-middleware.js       ← requireAuth()
│   ├── run-repository.js        ← test_runs + run_artifacts
│   ├── registry.js              ← QC catalog API + spec routing
│   ├── progress-parser.js       ← Cypress stdout → SSE
│   ├── history-store.js         ← disk run-meta + prune
│   └── app-video.js             ← optional video processing
│
├── scripts/
│   ├── setup-database.js        ← npm run db:setup
│   └── verify-qc-pdfs.js
│
├── fixtures/
│   ├── test-registry.json       ← 47 components, PDF links, status
│   ├── component-flows.json     ← per-component setup flows
│   ├── authoring-config.json    ← default module config
│   └── modules/                 ← ela, wl, math JSON profiles
│
├── docs/                        ← all documentation (incl. DATABASE.md)
└── runs/                        ← per-run artifacts (gitignored)
    └── run-<timestamp>/
        ├── authoring-config.json
        ├── screenshots/live/
        ├── videos/
        └── reports/report.html
```

---

## 8. Environment variables

| Variable | Set by | Purpose |
|----------|--------|---------|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | `.env` | XAMPP MySQL (`authoring_test_runner`) |
| `AUTHORING_LAUNCH_URL` | `.env` or dashboard | Full staging URL with `userToken` |
| `PORT` | `.env` | Server port (default 4321) |
| `CYPRESS_AUTHORING_LAUNCH_URL` | server per run | Passed to Cypress |
| `CYPRESS_AUTHORING_TEST_COMPONENTS` | server per run | Component filter for spec 09 |
| `CYPRESS_AUTHORING_MODULE` | server / dashboard | `ela` \| `wl` \| `math` |
| `AUTHORING_SCREENSHOTS_DIR` | server per run | Isolated screenshot folder |
| `AUTHORING_VIDEOS_DIR` | server per run | Isolated video folder |
| `AUTHORING_RUN_REPORT_DIR` | server per run | Report output path |

---

## 9. Custom Cypress commands (core)

| Command | File | Purpose |
|---------|------|---------|
| `openAuthoringTool(url?)` | commands.ts | Visit URL, assert session, reset live steps |
| `createTestStep('GenericStep')` | step-creation.ts | TOC → Add New Step → wizard |
| `dropWidgetIntoGenericStep(name, col)` | commands.ts | Angular onDropComplete on column |
| `ensureFibDeepSetup({ through })` | commands.ts | Reuse FIB canvas between tests |
| `openFibSettings()` | commands.ts | Angular setSettingsValues + panel |
| `captureLiveStep(label)` | commands.ts | Screenshot + `[AuthoringLiveStep]` log |
| `setContentEditableText()` | commands.ts | Reliable ng-model sync for contenteditable |

See [FIB-DEEP-AUTOMATION.md](FIB-DEEP-AUTOMATION.md) for FIB-specific commands.

---

## 10. QC integration model

```
D:\Author_Test_cases\*.pdf          fixtures/test-registry.json
        │                                      │
        │  pdfFile, tcCount                    │  automationStatus
        └──────────────────────────────────────┤  specFile / deepSpecFile
                                               │
                                               ▼
                                    Dashboard component picker
                                               │
                                               ▼
                              Cypress spec (deep or category)
```

Future target structure (not yet implemented):

```
components/fill-in-the-blank/
├── meta.json
├── test-cases.json    ← TC_02–TC_62 extracted from PDF
├── selectors.json
└── deep.spec.ts
```

---

## 11. Module profiles (ELA / WL / Math)

`support/module-setup.ts` + `fixtures/modules/*.json` define:

- Which step type to create for assessment widgets
- Where to drop widgets (Generic Step column vs single-page WL canvas)
- Module-specific launch path variants

FIB automation currently targets **ELA / Carnegie** Generic Step flow.

---

## 12. API reference

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | `{ email, password, fullName }` |
| POST | `/api/auth/login` | `{ email, password, rememberMe }` → token |
| POST | `/api/auth/logout` | Bearer token — end session |
| GET | `/api/auth/me` | Bearer token — current user |

### Runs (auth required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/run` | Start run `{ launchUrl, mode, spec?, components? }` |
| GET | `/api/history` | Current user's runs (from MySQL + disk files) |
| DELETE | `/api/history/:runId` | Delete one run (DB + disk) |
| DELETE | `/api/history` | Delete all user's completed runs |

### Public / run-scoped

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/progress/:runId` | SSE stream |
| GET | `/api/config` | Launch URL from env (pre-fills dashboard) |
| GET | `/api/registry` | All QC components |
| GET | `/api/modules` | ELA / WL / Math list |
| GET | `/api/component-plan?name=` | Setup flow + spec routing |
| GET | `/api/preview/:runId/latest-screenshot` | Latest live PNG |
| GET | `/api/download/:runId/*` | Reports, videos, screenshots |

Full operational troubleshooting: [TEST-RUNNER-SOLUTION.md](TEST-RUNNER-SOLUTION.md).  
Database management: [DATABASE.md](DATABASE.md).

---

*Last updated: June 2026*
