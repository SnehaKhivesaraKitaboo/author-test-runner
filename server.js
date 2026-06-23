'use strict';

// Load .env before anything else (optional — falls back to dashboard input)
try {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
} catch (_) { /* dotenv optional until npm install */ }

// ---------------------------------------------------------------------------
// Node version guard
// ---------------------------------------------------------------------------
const [nodeMajor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 16) {
  console.error(`\n[ERROR] Node.js ${process.versions.node} is too old. Requires 16+.\n`);
  process.exit(1);
}

const { finalizeAppRecording, APP_VIDEO_NAME } = require('./lib/app-video');
const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { spawn } = require('child_process');

let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (err) {
  console.error(`\n[ERROR] puppeteer not found: ${err.message}\n       Run: npm install\n`);
  process.exit(1);
}

const {
  getApiComponents,
  getCategoryCounts,
  countAuthoringTests,
  buildLaunchUrl,
  resolveComponentModeSpec,
  getSuiteByName,
  loadComponentFlows,
} = require('./lib/registry');
const {
  getModuleList,
  getModuleCatalog,
  normalizeModuleId,
  DEFAULT_MODULE,
} = require('./lib/modules');
const { parseProgressFromLine, parseLiveContextFromLine } = require('./lib/progress-parser');
const { createHistoryStore } = require('./lib/history-store');
const db = require('./lib/db');
const authService = require('./lib/auth-service');
const { requireAuth, extractToken } = require('./lib/auth-middleware');
const runRepository = require('./lib/run-repository');

const SKIP_DB_ENV = ['1', 'true', 'yes'].includes(
  String(process.env.SKIP_DB || process.env.NO_DB || '').toLowerCase(),
);
/** When true: no MySQL — disk-only runs, guest login accepts any credentials. */
let skipDb = SKIP_DB_ENV;

const GUEST_USER = { id: 0, email: 'local@guest', fullName: 'Local Guest' };
const GUEST_TOKEN = 'local-guest-token';

function guestSession() {
  return {
    token: GUEST_TOKEN,
    user: GUEST_USER,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  };
}

function useAuth() {
  // Auth is handled client-side via localStorage — accept any token on the server.
  return (req, res, next) => {
    const token = extractToken(req);
    req.user = GUEST_USER;
    req.sessionToken = token || GUEST_TOKEN;
    next();
  };
}

const app  = express();
const PORT = process.env.PORT || 4321;

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT          = __dirname;
const RUNS_DIR      = path.join(ROOT, 'runs');
const FIXTURE_TPL   = path.join(ROOT, 'fixtures', 'authoring-config.json');
// Invoke Cypress via node — avoids Windows shell splitting paths with spaces (e.g. "Carnegie Learning")
const CYPRESS_CLI   = path.join(ROOT, 'node_modules', 'cypress', 'bin', 'cypress');

function loadComponentRegistry() {
  return getApiComponents();
}

function runDir(id)          { return path.join(RUNS_DIR, id); }
function runFixturesDir(id)  { return path.join(RUNS_DIR, id); }
function runReportsDir(id)   { return path.join(RUNS_DIR, id, 'reports'); }
function runVideosDir(id)    { return path.join(RUNS_DIR, id, 'videos'); }
function runScreensDir(id)   { return path.join(RUNS_DIR, id, 'screenshots'); }

// ---------------------------------------------------------------------------
// In-memory run state
// ---------------------------------------------------------------------------
const runState = {};   // runId → { sseClients, log, percent, status, files, proc }

const MAX_RUNS = 3;
let activeRuns = 0;
const waitQueue = [];

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// CORS — allow requests from Live Server (port 5500) and any localhost origin
// so the dashboard can be opened via http://127.0.0.1:5500/authoring-tests/public/
const CORS_ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

const DEFAULT_CORS_ORIGINS = [
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/localhost(:\d+)?$/,
];

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allowed =
    DEFAULT_CORS_ORIGINS.some(re => re.test(origin)) ||
    CORS_ALLOWED_ORIGINS.includes(origin);
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.static(path.join(ROOT, 'public')));

// The EPUB Performance Test tool ships inside this project at
// public/performance-test/ and is served by the static mount above at
// /performance-test/index.html — no external KITABOO_Authoring tree required.
// Optionally, an external authoring tree can still be mounted by setting
// LOCAL_AUTHORING_DIR to an absolute path (used only when LOCAL_AUTHORING=1).
const LOCAL_AUTHORING_DIR = process.env.LOCAL_AUTHORING_DIR
  ? path.resolve(process.env.LOCAL_AUTHORING_DIR)
  : null;
if (LOCAL_AUTHORING_DIR && fs.existsSync(LOCAL_AUTHORING_DIR)) {
  app.use('/KITABOO_Authoring', express.static(LOCAL_AUTHORING_DIR));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function broadcast(runId, payload) {
  const state = runState[runId];
  if (!state) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  state.log.push(payload);
  for (const client of state.sseClients) {
    try { client.write(data); } catch (_) {}
  }
}

function walkDir(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, cb);
    else cb(full);
  }
}

function findLatestScreenshotUrl(runId) {
  const sDir = runScreensDir(runId);
  if (!fs.existsSync(sDir)) return null;
  const liveDir = path.join(sDir, 'live');
  const searchRoots = fs.existsSync(liveDir) ? [liveDir] : [sDir];
  let latestPath = null;
  let latestTime = 0;
  for (const root of searchRoots) {
    walkDir(root, fp => {
      if (!fp.endsWith('.png')) return;
      const stat = fs.statSync(fp);
      if (stat.mtimeMs > latestTime) {
        latestTime = stat.mtimeMs;
        latestPath = fp;
      }
    });
  }
  if (!latestPath) return null;
  const rel = path.relative(sDir, latestPath).replace(/\\/g, '/');
  const encoded = rel.split('/').map(encodeURIComponent).join('/');
  return `/api/download/${runId}/screenshots/${encoded}`;
}

function safeContentDispositionFilename(name) {
  return path.basename(String(name || 'file'))
    .replace(/[^\x20-\x7E]/g, '_')
    .replace(/["\\]/g, '_')
    .slice(0, 180) || 'screenshot.png';
}

function sendArtifactFile(req, res, filePath, contentType, filename) {
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  const disposition = req.query.download === '1' ? 'attachment' : 'inline';
  const safeName = safeContentDispositionFilename(filename);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);
  res.sendFile(filePath);
}

function startScreenshotWatcher(runId) {
  const state = runState[runId];
  if (!state) return;
  let lastUrl = '';
  state.screenshotWatcher = setInterval(() => {
    const s = runState[runId];
    if (!s || s.status !== 'running') {
      clearInterval(state.screenshotWatcher);
      return;
    }
    const url = findLatestScreenshotUrl(runId);
    if (url && url !== lastUrl) {
      lastUrl = url;
      broadcast(runId, { type: 'screenshot', url });
    }
  }, 800);
}

function collectFiles(runId) {
  const files = [];
  const rDir  = runReportsDir(runId);
  const vDir  = runVideosDir(runId);

  const pdf = path.join(rDir, 'report.pdf');
  if (fs.existsSync(pdf))
    files.push({ name: 'report.pdf', type: 'pdf', url: `/api/download/${runId}/report.pdf` });

  const html = path.join(rDir, 'report.html');
  if (fs.existsSync(html))
    files.push({ name: 'report.html', type: 'html', url: `/api/download/${runId}/report.html` });

  const json = path.join(rDir, 'report.json');
  if (fs.existsSync(json))
    files.push({ name: 'report.json', type: 'json', url: `/api/download/${runId}/report.json` });

  if (fs.existsSync(vDir)) {
    const appMp4 = path.join(vDir, APP_VIDEO_NAME);
    if (fs.existsSync(appMp4)) {
      files.push({
        name: APP_VIDEO_NAME,
        type: 'video',
        url: `/api/download/${runId}/videos/${encodeURIComponent(APP_VIDEO_NAME)}`,
      });
    }
  }

  // Artifacts: report.pdf, report.html, and .mp4 only (no PNG screenshots in downloads list).
  return files;
}

const historyStore = createHistoryStore(RUNS_DIR, collectFiles);

async function persistRunToDb(runId, metaPayload, userId) {
  historyStore.saveRunMeta(runId, metaPayload);
  try {
    await runRepository.updateRunFromMeta(runId, metaPayload);
    await runRepository.syncArtifactsFromCollect(runId, collectFiles, RUNS_DIR);
    if (userId) {
      const max = await runRepository.getMaxHistory();
      await runRepository.pruneRunsForUser(
        userId,
        max,
        id => historyStore.isRunActive(id, runState),
        id => historyStore.deleteRunDir(id),
      );
    }
  } catch (dbErr) {
    console.error(`[${runId}][db]`, dbErr.message);
    broadcast(runId, { type: 'log', msg: `[db] ${dbErr.message}` });
  }
}

// ---------------------------------------------------------------------------
// PDF generation via Puppeteer
// ---------------------------------------------------------------------------
async function generatePdf(runId) {
  const rDir    = runReportsDir(runId);
  const htmlPath = path.join(rDir, 'report.html');
  const pdfPath  = path.join(rDir, 'report.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.log(`[${runId}][PDF] HTML not found — skipping PDF generation`);
    return false;
  }

  let browser;
  try {
    const launchOpts = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };
    // In containers we skip Puppeteer's bundled Chromium and reuse the system browser.
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    const fileUrl = `file:///${path.resolve(htmlPath).replace(/\\/g, '/')}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 120000 });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', right: '14mm', bottom: '16mm', left: '14mm' },
    });
    console.log(`[${runId}][PDF] Generated → ${pdfPath}`);
    return true;
  } catch (err) {
    console.error(`[${runId}][PDF] Error: ${err.message}`);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Run orchestration
// ---------------------------------------------------------------------------
function releaseSlot() {
  activeRuns = Math.max(0, activeRuns - 1);
  if (waitQueue.length > 0) {
    const next = waitQueue.shift();
    next();
  }
}

function acquireSlot(runId, callback) {
  if (activeRuns < MAX_RUNS) {
    activeRuns++;
    callback();
  } else {
    broadcast(runId, { type: 'log', msg: `Queued — waiting for a free slot (${waitQueue.length + 1} in queue)...` });
    waitQueue.push(() => { activeRuns++; callback(); });
  }
}

function spawnCypress(runId, config, spec) {
  const state = runState[runId];

  state.totalTests = countAuthoringTests(
    spec,
    config.testMode || 'e2e',
    config.testComponents || 'all',
  );
  state.completedTests = 0;
  state._lastPassingReported = 0;

  const fixtureDir = runFixturesDir(runId);
  ensureDir(fixtureDir);
  const configCopy = JSON.parse(JSON.stringify(config));
  fs.writeFileSync(path.join(fixtureDir, 'authoring-config.json'), JSON.stringify(configCopy, null, 2));

  const rDir = runReportsDir(runId);
  const vDir = runVideosDir(runId);
  const sDir = runScreensDir(runId);
  ensureDir(rDir); ensureDir(vDir); ensureDir(sDir);

  const env = {
    ...process.env,
    AUTHORING_LAUNCH_URL:         config.launchUrl || '',
    AUTHORING_RUN_REPORT_DIR:     rDir,
    AUTHORING_FIXTURES_DIR:       fixtureDir,
    AUTHORING_VIDEOS_DIR:         vDir,
    AUTHORING_SCREENSHOTS_DIR:    sDir,
    CYPRESS_AUTHORING_LAUNCH_URL: config.launchUrl || '',
    CYPRESS_AUTHORING_TEST_COMPONENTS: config.testComponents || 'all',
    CYPRESS_AUTHORING_MODULE: config.module || DEFAULT_MODULE,
  };

  const args = [
    'run',
    '--config-file', 'cypress.config.ts',
    '--browser', 'chrome',
    '--headless',
  ];

  if (spec) {
    args.push('--spec', spec);
  }

  broadcast(runId, { type: 'log', msg: `Starting Cypress (headless — app-only recording)${spec ? ` (spec: ${spec})` : ''}…` });
  if (config.module) {
    const modCatalog = getModuleCatalog(config.module);
    const modLabel = modCatalog?.module?.label || config.module;
    broadcast(runId, { type: 'log', msg: `Module → ${modLabel} (${config.module})` });
  }

  if (config.testMode === 'component' && config.testComponents && config.testComponents !== 'all') {
    broadcast(runId, {
      type: 'log',
      msg: `Component mode → ${config.testComponents} → ${spec || 'e2e/09-component-deep.spec.ts'}`,
    });
  }

  broadcast(runId, {
    type: 'log',
    msg: `Estimated ${state.totalTests} test(s) in this run`,
  });

  startScreenshotWatcher(runId);

  const proc = spawn(process.execPath, [CYPRESS_CLI, ...args], { cwd: ROOT, env });
  state.proc = proc;

  let passingCount = 0;
  let failingCount = 0;
  let stdoutBuffer = '';
  let stderrBuffer = '';

  function handleOutputLine(rawLine) {
    const clean = rawLine.replace(/\x1B\[[0-9;]*m/g, '').trim();
    if (!clean) return;
    broadcast(runId, { type: 'log', msg: clean });

    if (/passing/i.test(clean)) {
      const m = clean.match(/(\d+)\s+passing/i);
      if (m) passingCount = parseInt(m[1], 10);
    }
    if (/failing/i.test(clean)) {
      const m = clean.match(/(\d+)\s+failing/i);
      if (m) failingCount = parseInt(m[1], 10);
    }

    const progress = parseProgressFromLine(rawLine, state);
    if (progress) {
      if (progress.percent != null) state.percent = progress.percent;
      broadcast(runId, {
        type: 'progress',
        percent: state.percent || 0,
        message: progress.message || null,
        completedTests: state.completedTests,
        totalTests: state.totalTests,
      });
    }

    const liveCtx = parseLiveContextFromLine(rawLine);
    if (liveCtx) {
      if (liveCtx.kind === 'liveStep') {
        let screenshotUrl = null;
        if (liveCtx.relPath) {
          const encoded = liveCtx.relPath.replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/');
          screenshotUrl = `/api/download/${runId}/screenshots/${encoded}`;
        } else {
          screenshotUrl = findLatestScreenshotUrl(runId);
        }
        broadcast(runId, {
          type: 'liveStep',
          label: liveCtx.label,
          screenshotUrl: screenshotUrl || null,
        });
        if (screenshotUrl) {
          broadcast(runId, { type: 'screenshot', url: screenshotUrl });
        }
      } else {
        broadcast(runId, { type: 'liveContext', ...liveCtx });
      }
    }
  }

  proc.stdout.on('data', chunk => {
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop() || '';
    for (const line of lines) handleOutputLine(line);
  });

  proc.stderr.on('data', chunk => {
    const text = chunk.toString();
    stderrBuffer += text;
    const lines = stderrBuffer.split('\n');
    stderrBuffer = lines.pop() || '';
    for (const line of lines) {
      const clean = line.replace(/\x1B\[[0-9;]*m/g, '').trim();
      if (clean) broadcast(runId, { type: 'log', msg: `[stderr] ${clean}` });
      handleOutputLine(line);
    }
  });

  proc.on('close', async code => {
    if (stdoutBuffer.trim()) handleOutputLine(stdoutBuffer);
    if (stderrBuffer.trim()) handleOutputLine(stderrBuffer);

    const state = runState[runId];
    if (!state) {
      releaseSlot();
      return;
    }
    if (state.screenshotWatcher) {
      clearInterval(state.screenshotWatcher);
      state.screenshotWatcher = null;
    }
    state.percent = 98;
    broadcast(runId, { type: 'progress', percent: 98 });
    broadcast(runId, { type: 'log', msg: `Cypress finished with exit code ${code}. Building app-only recording…` });

    finalizeAppRecording(runId, runScreensDir, runVideosDir);

    broadcast(runId, { type: 'log', msg: 'Generating PDF report…' });
    const pdfOk = await generatePdf(runId);

    const reportSummary = historyStore.readReportSummary(runId);
    if (reportSummary) {
      passingCount = reportSummary.passed;
      failingCount = reportSummary.failed;
    }

    state.percent = 100;
    state.status  = code === 0 ? 'done' : 'failed';
    state.files   = collectFiles(runId);
    state.exitCode = code;
    state.summary = {
      passed: passingCount,
      failed: failingCount,
      skipped: reportSummary?.skipped ?? 0,
    };

    const metaPayload = {
      status: state.status,
      percent: 100,
      summary: state.summary,
      startedAt: state.startedAt,
      launchUrl: state.launchUrl,
      testMode: state.testMode,
      testComponents: state.testComponents,
      completedTests: state.completedTests,
      totalTests: state.totalTests,
      exitCode: code,
      finishedAt: new Date().toISOString(),
    };

    await persistRunToDb(runId, metaPayload, state.userId);
    historyStore.pruneOldRuns(runState);

    broadcast(runId, {
      type: 'done',
      percent: 100,
      status: state.status,
      exitCode: code,
      summary: state.summary,
      pdfGenerated: pdfOk,
      files: state.files,
    });

    releaseSlot();
    state.proc = null;
  });

  proc.on('error', async err => {
    const state = runState[runId];
    if (!state) {
      releaseSlot();
      return;
    }
    broadcast(runId, { type: 'log', msg: `[spawn error] ${err.message}` });
    state.status = 'error';
    state.files = collectFiles(runId);
    const metaPayload = {
      status: 'error',
      percent: state.percent || 0,
      summary: state.summary || { passed: 0, failed: 0, skipped: 0 },
      startedAt: state.startedAt,
      launchUrl: state.launchUrl,
      testMode: state.testMode,
      testComponents: state.testComponents,
      completedTests: state.completedTests || 0,
      totalTests: state.totalTests || 0,
      exitCode: null,
      finishedAt: new Date().toISOString(),
    };
    await persistRunToDb(runId, metaPayload, state.userId);
    broadcast(runId, { type: 'done', status: 'error', files: state.files });
    releaseSlot();
    state.proc = null;
  });
}

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
}

// ── Auth (MySQL) ─────────────────────────────────────────────
// Auth is handled client-side via localStorage. These endpoints are kept as
// no-op stubs so any legacy or direct calls don't 404.
app.post('/api/auth/register', (_req, res) => res.status(201).json(guestSession()));
app.post('/api/auth/login',    (_req, res) => res.json(guestSession()));
app.post('/api/auth/logout',   (_req, res) => res.json({ ok: true }));
app.get('/api/auth/me',        (_req, res) => res.json({ user: GUEST_USER }));

// POST /api/run — start a new test run
// Body: { launchUrl, mode: 'e2e'|'component', module?: 'ela'|'wl'|'math', spec?, components?: string[] }
app.post('/api/run', useAuth(), async (req, res) => {
  const { launchUrl, spec, mode, components, module } = req.body || {};

  const config = fs.existsSync(FIXTURE_TPL)
    ? JSON.parse(fs.readFileSync(FIXTURE_TPL, 'utf-8'))
    : { launchUrl: '' };

  if (launchUrl) config.launchUrl = launchUrl;
  if (!config.launchUrl) config.launchUrl = buildLaunchUrl();

  if (!config.launchUrl) {
    return res.status(400).json({ error: 'launchUrl is required.' });
  }

  // Resolve spec and component env for each mode
  config.testMode = mode || 'e2e';
  config.module = normalizeModuleId(module);
  config.testComponents = (components && components.length)
    ? components.join(',')
    : 'all';

  // Component mode: route single deep components to their dedicated spec
  const resolvedSpec = config.testMode === 'component'
    ? resolveComponentModeSpec(config.testComponents)
    : spec || undefined;

  const runId = `run-${Date.now()}`;
  const startedAt = new Date().toISOString();
  runState[runId] = {
    sseClients: [],
    log: [],
    percent: 0,
    status: 'running',
    files: [],
    proc: null,
    summary: { passed: 0, failed: 0 },
    startedAt,
    launchUrl: config.launchUrl,
    testMode: config.testMode,
    module: config.module,
    testComponents: config.testComponents,
    totalTests: 0,
    completedTests: 0,
    userId: req.user.id,
  };

  if (!skipDb) {
    try {
      await runRepository.insertRun({
        runId,
        userId: req.user.id,
        launchUrl: config.launchUrl,
        testMode: config.testMode,
        testComponents: config.testComponents,
        moduleId: config.module,
        startedAt,
      });
    } catch (dbErr) {
      return res.status(500).json({ error: `Could not save run to database: ${dbErr.message}` });
    }
  }

  let setupFlowPayload = null;
  if (config.testMode === 'component' && config.testComponents && config.testComponents !== 'all') {
    const compName = config.testComponents.split(',')[0].trim();
    const suite = getSuiteByName(compName);
    const { flows } = loadComponentFlows();
    const flow = suite ? flows[suite.dataType] : null;
    if (flow?.setupFlow?.length) {
      setupFlowPayload = {
        steps: flow.setupFlow,
        suite: suite?.deepSpecFile
          ? `Deep · ${compName} · ${path.basename(suite.deepSpecFile)}`
          : compName,
        component: compName,
      };
    }
  }

  acquireSlot(runId, () => {
    if (setupFlowPayload) {
      broadcast(runId, { type: 'setupFlow', ...setupFlowPayload });
    }
    spawnCypress(runId, config, resolvedSpec);
  });
  res.json({ runId, setupFlow: setupFlowPayload });
});

// GET /api/progress/:runId — SSE stream
app.get('/api/progress/:runId', (req, res) => {
  const { runId } = req.params;
  const state = runState[runId];
  if (!state) return res.status(404).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Replay existing log to late-joiners
  for (const entry of state.log) {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  }

  state.sseClients.push(res);

  req.on('close', () => {
    state.sseClients = state.sseClients.filter(c => c !== res);
  });
});

// GET /api/status/:runId — current run status
app.get('/api/status/:runId', (req, res) => {
  const { runId } = req.params;
  const state = runState[runId];
  if (!state) return res.status(404).json({ error: 'Run not found' });
  res.json({
    runId,
    status: state.status,
    percent: state.percent,
    summary: state.summary,
    files: state.files,
    startedAt: state.startedAt,
    launchUrl: state.launchUrl,
    testMode: state.testMode,
    testComponents: state.testComponents,
    completedTests: state.completedTests || 0,
    totalTests: state.totalTests || 0,
  });
});

// POST /api/stop/:runId — stop a running test
app.post('/api/stop/:runId', useAuth(), async (req, res) => {
  const { runId } = req.params;
  const state = runState[runId];
  if (!state || !state.proc) return res.status(404).json({ error: 'Run not found or already finished' });
  if (state.userId && Number(state.userId) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Not allowed to stop this run.' });
  }
  try {
    process.kill(-state.proc.pid);
  } catch (_) {
    state.proc.kill('SIGTERM');
  }
  state.status = 'stopped';
  state.files = collectFiles(runId);
  const metaPayload = {
    status: 'stopped',
    percent: state.percent || 0,
    summary: state.summary || { passed: 0, failed: 0, skipped: 0 },
    startedAt: state.startedAt,
    launchUrl: state.launchUrl,
    testMode: state.testMode,
    testComponents: state.testComponents,
    completedTests: state.completedTests || 0,
    totalTests: state.totalTests || 0,
    exitCode: null,
    finishedAt: new Date().toISOString(),
  };
  await persistRunToDb(runId, metaPayload, state.userId || req.user.id);
  broadcast(runId, { type: 'done', status: 'stopped', files: state.files });
  releaseSlot();
  state.proc = null;
  res.json({ ok: true });
});

// GET /api/history — list newest runs for signed-in user (MySQL + disk artifacts)
app.get('/api/history', useAuth(), async (req, res) => {
  try {
    historyStore.pruneOldRuns(runState);

    if (skipDb) {
      const runs = historyStore.loadHistoryFromDisk(runState);
      for (const [runId, state] of Object.entries(runState)) {
        if (runs.some(r => r.runId === runId)) continue;
        runs.unshift({
          runId,
          status: state.status,
          percent: state.percent,
          summary: state.summary || { passed: 0, failed: 0 },
          startedAt: state.startedAt,
          launchUrl: state.launchUrl || '',
          testMode: state.testMode,
          testComponents: state.testComponents,
          files: collectFiles(runId),
          completedTests: state.completedTests || 0,
          totalTests: state.totalTests || 0,
        });
      }
      runs.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
      const max = historyStore.MAX_HISTORY;
      return res.json({ runs: runs.slice(0, max), max, total: runs.length });
    }

    const max = await runRepository.getMaxHistory();
    await runRepository.pruneRunsForUser(
      req.user.id,
      max,
      id => historyStore.isRunActive(id, runState),
      id => historyStore.deleteRunDir(id),
    );

    const userId = Number(req.user.id);
    const rows = await runRepository.listRunsForUser(userId, max);
    const seen = new Set();

    const runs = [];
    for (const row of rows) {
      seen.add(row.run_id);
      let files = collectFiles(row.run_id);
      if (!files.length) {
        files = await runRepository.listArtifactsForRun(row.run_id);
      }
      const inMemory = runState[row.run_id];
      runs.push({
        ...runRepository.rowToHistoryEntry(row, files),
        status: inMemory ? inMemory.status : row.status,
        percent: inMemory ? inMemory.percent : row.percent,
        summary: inMemory?.summary || {
          passed: row.summary_passed,
          failed: row.summary_failed,
          skipped: row.summary_skipped,
        },
      });
    }

    // In-memory active runs for this user (e.g. if DB row missing)
    for (const [runId, state] of Object.entries(runState)) {
      if (Number(state.userId) !== userId || seen.has(runId)) continue;
      runs.unshift({
        runId,
        status: state.status,
        percent: state.percent,
        summary: state.summary || { passed: 0, failed: 0 },
        startedAt: state.startedAt,
        launchUrl: state.launchUrl || '',
        testMode: state.testMode,
        testComponents: state.testComponents,
        files: collectFiles(runId),
        completedTests: state.completedTests || 0,
        totalTests: state.totalTests || 0,
      });
    }

    runs.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    res.json({ runs: runs.slice(0, max), max, total: runs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/history/:runId — delete a single past run
app.delete('/api/history/:runId', useAuth(), async (req, res) => {
  const { runId } = req.params;
  if (skipDb) {
    const result = historyStore.deleteRun(runId, runState);
    if (!result.ok) return res.status(result.error.includes('progress') ? 409 : 404).json(result);
    return res.json(result);
  }
  const owned = await runRepository.getRunForUser(runId, req.user.id);
  if (!owned) return res.status(404).json({ ok: false, error: 'Run not found.' });
  const result = historyStore.deleteRun(runId, runState);
  if (!result.ok) return res.status(result.error.includes('progress') ? 409 : 404).json(result);
  try {
    await runRepository.deleteRunRecord(runId);
  } catch (_) { /* disk already removed */ }
  res.json(result);
});

// DELETE /api/history — delete all past runs (skips active runs)
app.delete('/api/history', useAuth(), async (req, res) => {
  if (skipDb) {
    const result = historyStore.deleteAllRuns(runState);
    return res.json(result);
  }
  const rows = await runRepository.listRunsForUser(req.user.id, 500);
  const deleted = [];
  const skipped = [];
  for (const row of rows) {
    if (historyStore.isRunActive(row.run_id, runState)) {
      skipped.push(row.run_id);
      continue;
    }
    const r = historyStore.deleteRun(row.run_id, runState);
    if (r.ok) {
      await runRepository.deleteRunRecord(row.run_id);
      deleted.push(row.run_id);
    }
  }
  res.json({ ok: true, deleted, skipped });
});

// GET /api/download/:runId/report.pdf  — inline preview; ?download=1 to save
app.get('/api/download/:runId/report.pdf', (req, res) => {
  const p = path.join(runReportsDir(req.params.runId), 'report.pdf');
  sendArtifactFile(req, res, p, 'application/pdf', 'authoring-test-report.pdf');
});

// GET /api/download/:runId/report.html  — inline preview; ?download=1 to save
app.get('/api/download/:runId/report.html', (req, res) => {
  const p = path.join(runReportsDir(req.params.runId), 'report.html');
  sendArtifactFile(req, res, p, 'text/html', 'authoring-test-report.html');
});

// GET /api/download/:runId/report.json
app.get('/api/download/:runId/report.json', (req, res) => {
  const p = path.join(runReportsDir(req.params.runId), 'report.json');
  sendArtifactFile(req, res, p, 'application/json', 'authoring-test-report.json');
});

// GET /api/download/:runId/live/:file  — setup-flow PNGs co-located with report.html
app.get('/api/download/:runId/live/:file', (req, res) => {
  const p = path.join(runReportsDir(req.params.runId), 'live', decodeURIComponent(req.params.file));
  sendArtifactFile(req, res, p, 'image/png', path.basename(p));
});

// GET /api/download/:runId/videos/:file  — inline player; ?download=1 to save
app.get('/api/download/:runId/videos/:file', (req, res) => {
  const p = path.join(runVideosDir(req.params.runId), decodeURIComponent(req.params.file));
  sendArtifactFile(req, res, p, 'video/mp4', path.basename(p));
});

// GET /api/download/:runId/screenshots/*  — nested Cypress screenshot paths
app.get(/^\/api\/download\/([^/]+)\/screenshots\/(.+)$/, (req, res) => {
  const runId = req.params[0];
  const rel = decodeURIComponent(req.params[1]).replace(/\\/g, '/');
  const p = path.join(runScreensDir(runId), rel);
  sendArtifactFile(req, res, p, 'image/png', path.basename(p));
});

// GET /api/config — default fixture config merged with .env
app.get('/api/config', (_req, res) => {
  const fixture = fs.existsSync(FIXTURE_TPL)
    ? JSON.parse(fs.readFileSync(FIXTURE_TPL, 'utf-8'))
    : { launchUrl: '' };

  const envLaunchUrl = buildLaunchUrl();
  res.json({
    ...fixture,
    launchUrl: envLaunchUrl || fixture.launchUrl || '',
    envConfigured: Boolean(envLaunchUrl),
  });
});

// GET /api/modules — list ELA / WL / Math module options
app.get('/api/modules', (_req, res) => {
  res.json({ modules: getModuleList(), defaultModule: DEFAULT_MODULE });
});

// GET /api/modules/:id — full category-wise catalog for one module
app.get('/api/modules/:id', (req, res) => {
  const catalog = getModuleCatalog(req.params.id);
  if (!catalog) return res.status(404).json({ error: `Module not found: ${req.params.id}` });
  res.json(catalog);
});

// GET /api/registry — component list (optional ?module=ela|wl|math for module-filtered catalog)
app.get('/api/registry', (req, res) => {
  const moduleId = req.query.module ? normalizeModuleId(req.query.module) : null;
  const meta = require('./lib/registry').loadRegistry()._meta || {};
  const { _meta: flowMeta } = require('./lib/registry').loadComponentFlows();

  if (moduleId) {
    const catalog = getModuleCatalog(moduleId);
    if (!catalog) return res.status(404).json({ error: `Module not found: ${moduleId}` });

    const categories = {};
    catalog.categories.forEach(cat => {
      categories[cat.label] = cat.components.length;
    });

    return res.json({
      module: catalog.module,
      components: catalog.components,
      moduleCategories: catalog.categories,
      categories,
      total: catalog.total,
      meta: {
        totalComponents: catalog.total,
        totalTestCases: catalog.components.reduce((sum, c) => sum + (c.tcCount || 0), 0),
        source: `fixtures/modules/${moduleId}-module.json`,
        qcFolder: flowMeta.qcFolder || 'D:/Author_Test_cases',
      },
    });
  }

  const components = loadComponentRegistry();
  const categories = getCategoryCounts(components);
  res.json({
    components,
    categories,
    total: components.length,
    meta: {
      totalComponents: meta.totalComponents || components.length,
      totalTestCases: meta.totalTestCases || 0,
      source: 'fixtures/test-registry.json',
      qcFolder: flowMeta.qcFolder || 'D:/Author_Test_cases',
    },
  });
});

// GET /api/component-plan?name=Fill+in+the+Blank — QC flow + spec routing for one component
app.get('/api/component-plan', (req, res) => {
  const { getSuiteByName, loadComponentFlows } = require('./lib/registry');
  const name = (req.query.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name query param required' });

  const suite = getSuiteByName(name);
  if (!suite) return res.status(404).json({ error: `Component not found: ${name}` });

  const { _meta, flows } = loadComponentFlows();
  const flow = flows[suite.dataType] || null;
  const deepSpec = suite.deepSpecFile
    ? (suite.deepSpecFile.startsWith('e2e/') ? suite.deepSpecFile : `e2e/${suite.deepSpecFile}`)
    : null;

  res.json({
    name: suite.name,
    dataType: suite.dataType,
    automationStatus: suite.automationStatus,
    tcCount: suite.tcCount || 0,
    pdfFile: suite.pdfFile || flow?.pdfFile || null,
    qcPdfPath: flow?.pdfFile && _meta.qcFolder
      ? `${_meta.qcFolder}/${flow.pdfFile}`.replace(/\//g, path.sep)
      : null,
    deepSpecFile: deepSpec,
    basicSpecFile: suite.specFile ? `e2e/${suite.specFile}` : null,
    dropTarget: flow?.dropTarget || 'canvas',
    setupFlow: flow?.setupFlow || [
      'Open launch URL',
      suite.automationStatus === 'deep' && deepSpec
        ? `Run deep spec: ${path.basename(deepSpec)}`
        : 'Run basic drop + settings check (09-component-deep)',
    ],
  });
});

// GET /api/preview/:runId/latest-screenshot — latest Cypress screenshot for live preview
app.get('/api/preview/:runId/latest-screenshot', (req, res) => {
  const url = findLatestScreenshotUrl(req.params.runId);
  res.json({ url, timestamp: Date.now() });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
ensureDir(RUNS_DIR);

(async function startServer() {
  if (!skipDb) {
    try {
      await db.ping();
      await authService.purgeExpiredSessions();
      const cfg = db.getConfig();
      console.log(`[mysql] Connected → ${cfg.database}@${cfg.host}:${cfg.port}`);
    } catch (err) {
      console.warn(`\n[mysql] Cannot connect: ${err.message}`);
      console.warn('[mysql] Starting in disk-only mode — login with any email/password.');
      console.warn('        For MySQL: XAMPP + npm run db:setup, or set SKIP_DB=0 after MySQL is up.\n');
      skipDb = true;
    }
  } else {
    console.log('[mode] SKIP_DB=1 — disk-only mode (MySQL disabled)\n');
  }

  app.listen(PORT, () => {
    const pastRuns = historyStore.loadHistoryFromDisk(runState).length;
    const modeLine = skipDb ? 'Disk-only (no MySQL)' : 'MySQL persistence';
    const localAuthoring = ['1', 'true', 'yes'].includes(String(process.env.LOCAL_AUTHORING || '').toLowerCase());
    const authoringUrl = `http://localhost:${PORT}${process.env.LOCAL_AUTHORING_PATH || '/KITABOO_Authoring/index.html'}`;
    const dashboardUrl = `http://localhost:${PORT}/dashboard.html`;

    console.log(`\n╔══════════════════════════════════════════════════════════╗`);
    console.log(`║  Kitaboo Authoring Test Runner                           ║`);
    console.log(`║  Login      → http://localhost:${PORT}/                       ║`);
    console.log(`║  Dashboard  → ${dashboardUrl.padEnd(43)}║`);
    if (localAuthoring) {
      console.log(`║  Authoring  → ${authoringUrl.padEnd(43)}║`);
    }
    console.log(`║  Mode: ${modeLine.padEnd(47)}║`);
    console.log(`║  Past runs on disk: ${String(pastRuns).padEnd(36)}║`);
    const launchUrl = buildLaunchUrl();
    if (launchUrl) {
      if (localAuthoring) {
        console.log(`║  Launch URL → local KITABOO_Authoring (LOCAL_AUTHORING=1)║`);
      } else {
        console.log(`║  .env launch URL configured                              ║`);
      }
    } else {
      console.log(`║  No .env URL — enter launch URL in dashboard             ║`);
    }
    console.log(`╚══════════════════════════════════════════════════════════╝\n`);

    // Auto-open dashboard in the default browser unless disabled
    if (process.env.OPEN_BROWSER !== '0') {
      openBrowser(dashboardUrl);
    }
  });
})();

/**
 * Open a URL in the default system browser (cross-platform).
 * Silently ignores errors so a missing browser never crashes the server.
 */
function openBrowser(url) {
  const platform = process.platform;
  let cmd, args;
  if (platform === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', '', url];
  } else if (platform === 'darwin') {
    cmd = 'open';
    args = [url];
  } else {
    cmd = 'xdg-open';
    args = [url];
  }
  try {
    const { spawn: sp } = require('child_process');
    sp(cmd, args, { detached: true, stdio: 'ignore' }).unref();
  } catch (_) { /* best-effort */ }
}
