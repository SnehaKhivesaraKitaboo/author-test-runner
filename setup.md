# EPUB Automation Tester — Setup Guide

Cypress automation suite for the Kitaboo Authoring Tool with a real-time dashboard, live screenshots, and HTML/PDF reports, plus the EPUB Performance Test tool. Runs standalone — no Closify checkout required.

---

## Prerequisites

| Tool | Min Version | How to check |
|---|---|---|
| Node.js | 16+ | `node -v` |
| npm | 8+ | `npm -v` |
| Chrome | any modern | used by Cypress headless |

> **MySQL / XAMPP is NOT required.** The server starts in **no-DB mode** automatically if the database is unavailable.

---

## Step 1 — Open the project folder

```
D:\EPUB-Automation-Tester\
```

Or in a terminal:

```bash
cd D:\EPUB-Automation-Tester
```

---

## Step 2 — Install dependencies (first time only)

```bash
npm install
```

> Takes 2–5 minutes on first run — Cypress downloads its binary (~300 MB) into your OS cache.

---

## Step 3 — Create your `.env` file (first time only)

**Windows:**
```bash
copy .env.example .env
```

Open `.env` and fill in your launch URL:

```env
PORT=4321

# DB fields — leave as-is, no MySQL needed
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=authoring_test_runner

# Paste a fresh Kitaboo staging launch URL here
# (userToken expires quickly — get a new one before each run)
AUTHORING_LAUNCH_URL=https://stagingauthor.kitaboo.com/html_authoring2_carnegie/index.html?courseId=YOUR_COURSE_ID&userToken=YOUR_TOKEN
```

---

## Step 4 — Start the dashboard server

```bash
node server.js
```

You should see this in the terminal:

```
╔══════════════════════════════════════════════════════════╗
║  Kitaboo Authoring Test Runner                           ║
║  Login      → http://localhost:4321/                     ║
║  Dashboard  → http://localhost:4321/dashboard.html       ║
║  Database   → NO-DB MODE (disk + memory only)            ║
╚══════════════════════════════════════════════════════════╝
```

> Keep this terminal open while using the dashboard.

---

## Step 5 — Open the dashboard

Open Chrome and go to:

```
http://localhost:4321/dashboard.html
```

In **no-DB mode** the login accepts **any email and any password**. Just click **Sign In**.

---

## Step 6 — Run tests

### Option A — Dashboard (recommended)

1. Open `http://localhost:4321/dashboard.html`
2. Sign in with any email/password
3. Paste a fresh `AUTHORING_LAUNCH_URL` in the URL field
4. Select test mode: **E2E** (all specs) or **Component Test** (single component)
5. Click **Run Tests**
6. Watch live progress + screenshots in the right panel
7. Download the HTML or PDF report when done

### Option B — CLI (no server needed)

```bash
# Run all 13 specs headlessly
npm run cypress:run

# Open the interactive Cypress UI
npm run cypress:open
```

> If `AUTHORING_LAUNCH_URL` is not set in `.env`, all tests will be **skipped/pending** — they will never fail due to a missing URL.

---

## Quick-reference commands

```bash
cd D:\EPUB-Automation-Tester

npm install            # install dependencies (first time only)
node server.js         # start dashboard server
npm run dev            # start server with auto-restart (nodemon)
npm run cypress:run    # headless CLI run (all 13 specs)
npm run cypress:open   # interactive Cypress UI
```

---

## Where to find reports

| Location | Contents |
|---|---|
| `authoring-tests/e2e/reports/report.html` | Report from the last `npm run cypress:run` |
| `authoring-tests/e2e/reports/report.json` | JSON data for the same run |
| `authoring-tests/runs/<run-id>/reports/` | Per-run reports when started via dashboard |

---

## Important notes

| | |
|---|---|
| `userToken` expires quickly | Get a fresh launch URL from the Kitaboo staging portal before each run |
| Server must stay running | Keep `node server.js` open in a terminal while using the dashboard |
| No MySQL needed | Server runs in no-DB mode — run history is saved to disk automatically |
| 13 spec files | `e2e/01-session-launch.spec.ts` through `e2e/13-fib-deep.spec.ts` |

---

## Spec overview

| Spec | Tests | Coverage |
|---|---|---|
| 01-session-launch | 7 | URL validation, session check |
| 02-editor-shell | 10 | Toolbar, canvas, panels |
| 03-toolbar-actions | 7 | Save, Preview, Publish |
| 04-left-panel | 13 | Add panel, component library |
| 05-toc-navigation | 7 | Table of Contents |
| 06-layout-components | 22 | Layout widgets |
| 07-element-components | 45 | Element widgets |
| 08-widget-components | 81 | Widget components |
| 09-component-deep | 355 | All component drop + settings |
| 10-step-creation | 46 | Step creation wizard |
| 11-mcq-deep | 61 | MCQ Single Choice |
| 12-mcq-multiple-deep | 108 | MCQ Multiple |
| 13-fib-deep | 30 | Fill in the Blank |
| **Total** | **792** | |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `localhost:4321` refused to connect | Run `node server.js` first — server is not running |
| All tests show as pending/skipped | Set `AUTHORING_LAUNCH_URL` in `.env` |
| Session Expired error during test run | Get a fresh `userToken` — they expire within minutes |
| `npm install` fails | Ensure Node.js 16+ is installed (`node -v`) |
| Dashboard login fails | In no-DB mode any email/password works — check server is running |

---

*Kitaboo Authoring Automation Suite — Cypress 12 + Node.js + Express*
Displaying SETUP.md.