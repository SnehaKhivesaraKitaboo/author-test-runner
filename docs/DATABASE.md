# MySQL database — Authoring Test Runner

> **Database:** `authoring_test_runner` on **XAMPP MySQL** (default port **3306**)  
> **Schema file:** `../database/schema.sql`  
> **Setup script:** `npm run db:setup`

The test runner uses MySQL for **users, sessions, run metadata, and artifact indexes**. Large files (PDF/HTML reports, videos, PNG screenshots) remain on disk under `runs/<runId>/` — same paths Cypress and Puppeteer already use.

---

## Quick setup

1. Start **MySQL** in XAMPP Control Panel.
2. Create database `authoring_test_runner` in phpMyAdmin (optional — `db:setup` creates it via `schema.sql`).
3. Configure `authoring-tests/.env`:

   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=          # set if root has a password
   DB_NAME=authoring_test_runner
   ```

4. Install and initialize:

   ```bash
   cd authoring-tests
   npm install
   npm run db:setup
   npm start
   ```

5. Open **http://localhost:4321** → sign in.

### Seed accounts (`npm run db:setup`)

| Email | Password | Role |
|-------|----------|------|
| `demo@kitaboo.com` | `Demo@123` | Demo tester |
| `admin@kitaboo.com` | `Admin@123` | Admin |

New users can **Sign up** on the login page (stored in `users` with bcrypt password).

---

## Tables

| Table | Purpose |
|-------|---------|
| `users` | Email, bcrypt `password_hash`, `full_name`, optional `google_sub`, `is_active` |
| `user_sessions` | SHA-256 hash of Bearer token, `expires_at`, `remember_me` |
| `test_runs` | One row per Cypress run: status, mode, components, pass/fail counts, `user_id` |
| `run_artifacts` | Index of `report.pdf`, `report.html`, videos, screenshots (paths on disk) |
| `login_audit` | Login/register success and failure trail |
| `app_settings` | Tunables e.g. `max_history` (default **10** runs per user) |

---

## What is stored where

| Data | MySQL | Disk (`runs/<runId>/`) |
|------|-------|-------------------------|
| User account | `users` | — |
| Session token (hash only) | `user_sessions` | Browser: raw token in `atr_session` |
| Run status, summary, launch URL | `test_runs` | `run-meta.json` (mirror) |
| Report / video / screenshot list | `run_artifacts` | `reports/`, `videos/`, `screenshots/` |
| Report PDF/HTML bytes | — | `reports/report.pdf`, `report.html` |
| Cypress live steps | — | `screenshots/live/snap-*.png` |

---

## Application flow

```
Login (public/index.html)
  POST /api/auth/login  →  users + user_sessions
  Browser stores token  →  localStorage or sessionStorage (Remember me)

Dashboard (public/dashboard.html)
  GET /api/auth/me      →  validates Bearer token
  POST /api/run         →  INSERT test_runs (requires auth)
  Cypress completes     →  UPDATE test_runs + run_artifacts
  GET /api/history      →  SELECT test_runs for current user only
  GET /api/download/... →  serve files from disk (unchanged)
```

**Session lifetime**

- Remember me **off** → 12 hours (`app_settings.session_hours`)
- Remember me **on** → 30 days (`app_settings.remember_days`)

---

## Auth API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | `{ email, password, fullName }` |
| POST | `/api/auth/login` | No | `{ email, password, rememberMe }` → `{ token, user, expiresAt }` |
| POST | `/api/auth/logout` | Bearer | Invalidates session |
| GET | `/api/auth/me` | Bearer | Current user profile |

Protected routes (require `Authorization: Bearer <token>`):

- `POST /api/run`
- `GET /api/history`
- `DELETE /api/history` and `DELETE /api/history/:runId`

Public routes (no login): `/api/config`, `/api/registry`, `/api/modules`, `/api/component-plan`, `/api/progress/:runId`, `/api/download/*`, `/api/preview/*`

Client helper: `public/js/api-client.js` (`AtrApi.apiFetch`, `AtrApi.saveSession`).

Server modules: `lib/db.js`, `lib/auth-service.js`, `lib/auth-middleware.js`, `lib/run-repository.js`.

---

## Managing data (phpMyAdmin)

1. Open http://localhost/phpmyadmin  
2. Select **authoring_test_runner**

| Task | SQL / action |
|------|----------------|
| View all runs | Table `test_runs` |
| View users | Table `users` |
| Change history limit | `UPDATE app_settings SET setting_value = '20' WHERE setting_key = 'max_history';` |
| Log out all users | `TRUNCATE user_sessions;` |
| Clear run history | `TRUNCATE run_artifacts; TRUNCATE test_runs;` + delete `runs/*` folders |
| Disable user | `UPDATE users SET is_active = 0 WHERE email = '...';` |

---

## Legacy runs (before MySQL)

Runs created before database integration have **`user_id` NULL** in MySQL and may only exist on disk. They **do not appear** in per-user history after sign-in. Run new tests while logged in to populate `test_runs` for your account.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm start` exits: Cannot connect to MySQL | Start XAMPP MySQL; check `DB_*` in `.env` |
| `ER_ACCESS_DENIED` | Correct `DB_USER` / `DB_PASSWORD` |
| Login works, empty history | Run tests after signing in; old disk-only runs are not linked |
| Re-apply schema | `npm run db:setup` (idempotent settings/users) |

---

## Related files

```
authoring-tests/
├── database/schema.sql
├── scripts/setup-database.js
├── lib/db.js
├── lib/auth-service.js
├── lib/auth-middleware.js
├── lib/run-repository.js
├── public/index.html          ← login
├── public/dashboard.html      ← test dashboard
└── public/js/api-client.js
```

---

*Last updated: June 2026*
