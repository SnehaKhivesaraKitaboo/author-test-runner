# Deployment — Staging

The EPUB Automation Tester is a single Node/Express service. It needs a browser
(Chrome) available for **Cypress** (running tests) and **Puppeteer** (rendering
the PDF report). Two supported deployment paths: **PM2** on a VM, or **Docker**.

---

## 0. Build process

There is no compile/bundle step — the app runs the source directly:

- **Server**: plain Node.js (`server.js`, `lib/**`).
- **Cypress specs**: TypeScript, transpiled on the fly by Cypress at run time.
- **Dashboard / perf tool**: static assets served from `public/`.

"Build" = install dependencies reproducibly:

```bash
npm ci          # uses package-lock.json; installs Cypress + Puppeteer
npx cypress verify   # confirm the Cypress binary is usable
```

---

## 1. Prerequisites (staging host)

| Requirement | Notes |
|-------------|-------|
| Node.js 16+ (18 LTS recommended) | matches `engines` in package.json |
| Google Chrome / Chromium | required by Cypress (headless) and Puppeteer |
| MySQL/MariaDB | optional — only for persistent run history |
| Outbound HTTPS to `stagingauthor.kitaboo.com` and the Kitaboo API hosts | the tools call the authoring app + APIs |

On Linux, also install the usual Cypress OS libraries
(`libgtk-3-0 libnss3 libasound2 libxss1 libgbm1 …`) — already present in the
Docker image below.

---

## 2. Option A — PM2 on a VM

```bash
# 1. Get the code
git clone <repo-url> /opt/epub-automation-tester
cd /opt/epub-automation-tester

# 2. Install deps reproducibly
npm ci
npx cypress verify

# 3. Configure environment
cp .env.staging.example .env
#   edit .env: DB_*, CORS_ORIGINS, AUTHORING_* (or set SKIP_DB=1)

# 4. (optional) Create DB schema + demo users
npm run db:setup

# 5. Start under PM2
npm install -g pm2          # if not already installed
pm2 start ecosystem.config.js --env staging
pm2 save                    # persist across reboots
pm2 startup                 # follow printed instruction to enable boot service
```

Logs: `pm2 logs epub-automation-tester` (also written to `logs/out.log` /
`logs/error.log`). Restart after a deploy: `git pull && npm ci && pm2 reload epub-automation-tester`.

### Reverse proxy (nginx) — optional

Put nginx in front for TLS and a clean hostname. Note the dashboard uses
**Server-Sent Events** (`/api/progress/:runId`), so disable buffering:

```nginx
server {
  listen 443 ssl;
  server_name epub-tester.staging.kitaboo.com;
  # ssl_certificate ...; ssl_certificate_key ...;

  location / {
    proxy_pass http://127.0.0.1:4321;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # SSE: stream progress without buffering
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_read_timeout 3600s;
  }
}
```

Add the public origin to `CORS_ORIGINS` in `.env`.

---

## 3. Option B — Docker

The provided `Dockerfile` is based on the official `cypress/browsers` image
(Chrome preinstalled) and reuses that browser for Puppeteer.

```bash
# Build
docker build -t epub-automation-tester:staging .

# Run (disk-only mode)
docker run -d --name epub-tester \
  -p 4321:4321 \
  -e SKIP_DB=1 \
  -e CORS_ORIGINS=https://epub-tester.staging.kitaboo.com \
  -v "$(pwd)/runs:/app/runs" \
  epub-automation-tester:staging

# Run with MySQL + full config from an env file
docker run -d --name epub-tester \
  -p 4321:4321 \
  --env-file .env \
  -v "$(pwd)/runs:/app/runs" \
  epub-automation-tester:staging
```

Mount `runs/` as a volume so reports/videos survive container restarts.

---

## 4. Persistence modes

| Mode | When | Behavior |
|------|------|----------|
| Disk-only (`SKIP_DB=1`) | No DB available | Runs + reports on disk; history not shared across hosts; any login accepted |
| MySQL | `npm run db:setup` done, `DB_*` set | Run metadata + users persisted; history survives restarts |

Artifacts (PDF/HTML/JSON/MP4/PNG) always live on disk under `runs/<runId>/`.

---

## 5. Smoke test after deploy

```bash
curl -fsS http://localhost:4321/api/config        | head -c 200; echo
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:4321/
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:4321/dashboard.html
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:4321/performance-test/index.html
```

All should return `200`. Then open the dashboard, start a small Component Test
run against a fresh staging launch URL, and confirm live progress + a downloadable
PDF report.

---

## 6. Security notes

- Never commit `.env`. Inject `DB_PASSWORD` and tokens via the host's secret store / env file.
- Restrict `CORS_ORIGINS` to the staging dashboard hostname(s); do not use `*`.
- Terminate TLS at the proxy; keep the Node port bound to localhost behind it.
- The container runs as the non-root `node` user.
