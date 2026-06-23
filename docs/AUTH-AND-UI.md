# Login UI & access control

> **Login:** http://localhost:4321/ (`public/index.html`)  
> **Dashboard:** http://localhost:4321/dashboard.html (`public/dashboard.html`)

---

## Login page features

Split layout aligned with Test Runner branding (indigo gradient, Roboto):

- **Log in / Sign up** tabs with animated indicator
- **Continue with Google** (UI ready; wire OAuth to your IdP in production)
- Email + password with **show/hide** toggle
- **Remember me** (30-day session vs 12-hour session)
- Client-side **captcha** challenge before submit
- Form validation with inline errors and toast messages

Successful login/register calls MySQL-backed APIs and redirects to the dashboard.

---

## Dashboard access

- `dashboard.html` calls `GET /api/auth/me` on load; missing/invalid token redirects to `/`.
- **Sign out** in the nav calls `POST /api/auth/logout` and clears browser storage.
- Nav shows signed-in user hint (email prefix).
- All run/history API calls use `AtrApi.apiFetch()` with Bearer token.

---

## File map

| File | Role |
|------|------|
| `public/index.html` | Login + sign up UI |
| `public/dashboard.html` | Full test runner dashboard (former monolithic `index.html`) |
| `public/js/api-client.js` | Token storage + authenticated `fetch` |
| `lib/auth-service.js` | Register, login, sessions (bcrypt + SHA-256 token hash) |
| `lib/auth-middleware.js` | `requireAuth()` for protected APIs |

---

## Security notes (local dev)

- Passwords stored as **bcrypt** hashes in `users.password_hash`.
- Raw session tokens never stored in MySQL — only **SHA-256** in `user_sessions`.
- Launch URLs in `test_runs` may contain **userToken** — treat DB backups as sensitive.
- For production: HTTPS, httpOnly cookies or short-lived JWT, rate limiting on `/api/auth/login`, server-side captcha (e.g. reCAPTCHA).

See [DATABASE.md](DATABASE.md) for schema and phpMyAdmin management.

---

*Last updated: June 2026*
