# EPUB Automation Tester

Standalone EPUB testing application extracted from the Closify codebase. It bundles two tools behind one Node/Express server:

1. **Authoring Test Runner** — a Cypress 12 + TypeScript automation suite for the KITABOO Authoring Tool, with a real-time web dashboard, live step preview, QC test-case catalog, HTML/JSON/PDF reports, and per-run artifact isolation.
2. **EPUB Performance Test** — a browser tool that analyzes an authored EPUB's structure and performance (LoD, paragraphs, annotations, glossary, load metrics). Opened from the dashboard via the **EPUB Performance Test** button, or directly at `/performance-test/index.html`.

This project runs **independently** of the main Closify application. It talks to the authoring tool only over its public staging/production URL — no Closify source tree is required.

**Login:** `http://localhost:4321` · **Dashboard:** `http://localhost:4321/dashboard.html` · **Perf tool:** `http://localhost:4321/performance-test/index.html`

---

## Quick start

```bash
cd D:\EPUB-Automation-Tester
npm install                 # installs Cypress (~300 MB) + Puppeteer on first run
cp .env.example .env        # then edit values (or run disk-only with SKIP_DB=1)
npm start                   # http://localhost:4321
```

No MySQL? The server auto-falls back to **disk-only mode** (run history kept on disk only). To force it: set `SKIP_DB=1` in `.env`.

For full run-history persistence, start MySQL/MariaDB (XAMPP locally) and run once:

```bash
npm run db:setup            # creates tables + demo users
```

---

## What's in the box

| Path | Role |
|------|------|
| `server.js` | Express server: dashboard, run orchestration (spawns Cypress), SSE progress, report download APIs, PDF via Puppeteer |
| `public/` | Dashboard UI (`dashboard.html`, `index.html`, `js/api-client.js`) |
| `public/performance-test/` | The EPUB Performance Test tool (self-contained HTML/CSS/JS) |
| `e2e/` | Cypress spec files (`01`–`13`) |
| `support/` | Cypress commands + helpers |
| `fixtures/` | QC registry, component flows, per-module catalogs |
| `lib/` | Server modules: registry, modules, db, auth, run-repository, history-store, progress-parser, app-video |
| `scripts/` | DB setup + QC PDF verification utilities |
| `database/` | MySQL schema |
| `cypress.config.ts` | Cypress config (baseUrl → staging, report generation hooks) |

---

## Configuration (env vars)

| Var | Default | Purpose |
|-----|---------|---------|
| `PORT` | `4321` | HTTP port |
| `OPEN_BROWSER` | `1` | Set `0` on servers to skip auto-opening the dashboard |
| `SKIP_DB` | _(auto)_ | `1` = disk-only mode; otherwise tries MySQL and falls back |
| `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` | XAMPP defaults | MySQL connection |
| `CORS_ORIGINS` | _(localhost only)_ | Extra comma-separated allowed origins |
| `AUTHORING_BASE_URL` | `https://stagingauthor.kitaboo.com` | Target authoring host |
| `AUTHORING_PATH` | `/html_authoring2_carnegie/index.html` | Target authoring path |
| `AUTHORING_COURSE_ID` / `AUTHORING_USER_TOKEN` | — | Build the launch URL from parts |
| `AUTHORING_LAUNCH_URL` | — | Full launch URL (overrides the parts above) |
| `PUPPETEER_EXECUTABLE_PATH` | — | Use a system Chrome for PDF generation (set in Docker) |
| `LOCAL_AUTHORING` + `LOCAL_AUTHORING_DIR` | off | Optionally mount an external authoring build at `/KITABOO_Authoring` |

See `.env.example` (local) and `.env.staging.example` (staging).

---

## Running tests

### From the dashboard (recommended)
1. `npm start`, open `http://localhost:4321`, sign in (any credentials in disk-only mode; demo user `demo@kitaboo.com` / `Demo@123` with DB).
2. Paste a **fresh** authoring launch URL (`courseId` + `userToken` — sessions expire fast).
3. Choose **E2E** or **Component Test** mode and select components.
4. Click **Run** and watch live progress + screenshots; download the PDF/HTML/JSON report when done.

### From the CLI
```bash
npm run cypress:run         # headless, all specs
npm run cypress:open        # interactive runner
```

### EPUB Performance Test
Open the dashboard's **EPUB Performance Test** button (or `/performance-test/index.html`), paste an authoring URL, pick the API environment, and click **Analyze EPUB**.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [setup.md](setup.md) | Detailed local setup |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Staging deployment (PM2 + Docker), build process, ops |
| [EXTRACTION.md](EXTRACTION.md) | What was extracted from Closify and how it was decoupled |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System flow, APIs, env vars |
| [docs/DATABASE.md](docs/DATABASE.md) | MySQL schema, users, runs, reports |
| [docs/AUTH-AND-UI.md](docs/AUTH-AND-UI.md) | Login, sessions, dashboard access |
| [docs/QC-REGISTRY.md](docs/QC-REGISTRY.md) | QC component catalog |
| [public/performance-test/README.md](public/performance-test/README.md) | Performance tool usage |

---

## Technology stack

| Layer | Technology |
|-------|------------|
| Test runner | Cypress 12 + TypeScript |
| Server | Node.js 16+ / Express 4 |
| Persistence | MySQL 8 / MariaDB (optional) — `mysql2`, `bcryptjs` |
| Real-time progress | Server-Sent Events (SSE) |
| Reports | HTML + JSON + PDF (Puppeteer) on disk; metadata in MySQL |
| Target app | KITABOO Authoring (AngularJS 1.x) on staging |

*Extracted from Closify (`Automation_epub_tester` branch), June 2026.*
