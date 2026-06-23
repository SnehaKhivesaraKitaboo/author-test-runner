# MySQL database — Authoring Test Runner

> **Full documentation:** [../docs/DATABASE.md](../docs/DATABASE.md) (auth flow, APIs, management guide)

Uses **XAMPP MySQL** on port **3306**, database name **`authoring_test_runner`**.

## Quick setup

1. Start **Apache** is optional; start **MySQL** in XAMPP Control Panel.
2. In phpMyAdmin, you may create an empty database `authoring_test_runner` (optional — the setup script creates it).
3. Copy env and set your MySQL password if root has one:

   ```bash
   cp .env.example .env
   ```

   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=authoring_test_runner
   ```

4. Install dependencies and create tables + seed users:

   ```bash
   npm install
   npm run db:setup
   ```

5. Start the app:

   ```bash
   npm start
   ```

6. Open http://localhost:4321 and sign in with:

   | Email | Password |
   |-------|----------|
   | `demo@kitaboo.com` | `Demo@123` |
   | `admin@kitaboo.com` | `Admin@123` |

## What is stored where

| Data | MySQL table | Files on disk |
|------|-------------|---------------|
| User accounts (email, bcrypt password) | `users` | — |
| Login sessions (hashed tokens) | `user_sessions` | Browser `localStorage` / `sessionStorage` holds raw token only |
| Login success/failure audit | `login_audit` | — |
| Run metadata (status, counts, launch URL, mode) | `test_runs` | `runs/<runId>/run-meta.json` (mirror) |
| Report / video / screenshot index | `run_artifacts` | `runs/<runId>/reports/`, `videos/`, `screenshots/` |
| Tunable limits | `app_settings` | — |

**Large binaries** (PDF, HTML report, MP4, PNG screenshots) stay under `closify/authoring-tests/runs/` so Cypress and Puppeteer keep working unchanged. MySQL stores **who ran what** and **where files live**, not the file bytes.

## Tables (overview)

- **users** — sign up / sign in accounts  
- **user_sessions** — Bearer tokens (`Authorization: header`)  
- **test_runs** — one row per Cypress run, linked to `user_id`  
- **run_artifacts** — `report.pdf`, `report.html`, videos, etc.  
- **login_audit** — security trail for logins  
- **app_settings** — e.g. `max_history` (default 10 runs per user)

## Managing data in phpMyAdmin

1. Open http://localhost/phpmyadmin  
2. Select database **authoring_test_runner**  
3. Common tasks:
   - **Reset all runs**: `TRUNCATE run_artifacts; TRUNCATE test_runs;` then delete folders under `runs/`
   - **Deactivate user**: `UPDATE users SET is_active = 0 WHERE email = '...'`
   - **Force logout everyone**: `TRUNCATE user_sessions;`
   - **Change history limit**: `UPDATE app_settings SET setting_value = '20' WHERE setting_key = 'max_history';`

## How the app uses the database (flow)

```
Login (index.html)
  → POST /api/auth/login
  → users + user_sessions
  → token saved in browser

Dashboard
  → GET /api/auth/me (validates token)
  → POST /api/run → INSERT test_runs (status=running)
  → Cypress runs → files written to runs/<runId>/
  → On finish → UPDATE test_runs + INSERT run_artifacts
  → GET /api/history → SELECT test_runs for current user
  → Download links still served from disk via /api/download/...
```

## Reports

After each run completes, the server generates:

- `runs/<runId>/reports/report.html`
- `runs/<runId>/reports/report.pdf`
- Optional video under `runs/<runId>/videos/`

The dashboard downloads these via `/api/download/<runId>/report.pdf` (unchanged). MySQL row in `run_artifacts` records the path for history and admin queries.

## Re-run schema only

```bash
mysql -u root -p < database/schema.sql
npm run db:setup
```

Or import `database/schema.sql` in phpMyAdmin, then run `npm run db:setup` for seed users.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot connect` on `npm start` | Start XAMPP MySQL; check `DB_PASSWORD` in `.env` |
| `ER_ACCESS_DENIED` | Use correct MySQL user/password |
| Login works but no history | Runs are per user; old disk runs have `user_id` NULL — run new tests while signed in |
| Port 3306 in use | Change XAMPP MySQL port and update `DB_PORT` |
