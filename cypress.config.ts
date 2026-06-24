import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Output paths — overridden per-run by server.js env vars
// ---------------------------------------------------------------------------
const REPORT_DIR =
  process.env['AUTHORING_RUN_REPORT_DIR'] ||
  path.join(__dirname, 'e2e', 'reports');

const SUITE_REPORT_JSON = path.join(REPORT_DIR, 'report.json');
const SUITE_REPORT_HTML = path.join(REPORT_DIR, 'report.html');

function ensureReportDir() {
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TestResult {
  title: string;
  fullTitle: string;
  state: 'passed' | 'failed' | 'pending' | 'skipped';
  duration: number;
  error?: string;
}

interface SpecResult {
  specFile: string;
  passed: number;
  failed: number;
  pending: number;
  duration: number;
  tests: TestResult[];
}

interface LiveStepSnapshot {
  snap: string;
  label: string;
}

interface SuiteReport {
  projectName: string;
  generatedAt: string;
  launchUrl: string;
  module: string;
  totalPassed: number;
  totalFailed: number;
  totalPending: number;
  totalSkipped: number;
  totalDuration: number;
  specs: SpecResult[];
  liveSteps?: LiveStepSnapshot[];
}

const LIVE_STEP_TITLES: Record<string, string> = {
  'authoring-tool-loaded': 'Open launch URL',
  'session-expired': 'Session expired — refresh userToken',
  'toc-add-dropdown-open': 'TOC → + Add',
  'step-chooser-modal-open': 'Add New Step chooser',
  'step-type-genericstep-selected': 'Select Generic Step',
  'step-metadata-title-filled': 'Fill metadata wizard',
  'step-wizard-submitted': 'Submit wizard',
  'new-step-active-in-toc': 'New step in TOC',
  'generic-step-canvas-ready': 'Generic Step canvas ready',
  'fib-drop-prepare-generic-step-column': 'Prepare column for FIB drop',
  'widget-dropped-fill-in-the-blank': 'FIB dropped into Generic Step',
  'fib-dummy-content-entered': 'Enter header + sentence',
  'fib-settings-panel-open': 'Open FIB settings panel',
};

function normalizeLiveLabel(raw: string): string {
  return raw.replace(/^\d+-/, '').replace(/\.png$/i, '').toLowerCase();
}

function liveStepTitle(label: string): string {
  const key = normalizeLiveLabel(label).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (LIVE_STEP_TITLES[key]) return LIVE_STEP_TITLES[key];
  return key.replace(/-/g, ' ');
}

function loadLiveManifest(): LiveStepSnapshot[] {
  const screenshotsDir = process.env['AUTHORING_SCREENSHOTS_DIR'] || path.join(__dirname, 'e2e', 'screenshots');
  const manifestPath = path.join(screenshotsDir, 'live', 'manifest.json');
  if (!fs.existsSync(manifestPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Keep one snapshot per setup milestone — drop FAIL/auto-retry noise (182 → ~12). */
function filterReportLiveSteps(steps: LiveStepSnapshot[]): LiveStepSnapshot[] {
  const lastByKey = new Map<string, LiveStepSnapshot>();

  for (const step of steps) {
    if (/FAIL| \(failed\)|-- before each hook/i.test(step.label)) continue;

    const key = normalizeLiveLabel(step.label)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const isKnown = Boolean(LIVE_STEP_TITLES[key]);
    const isSetupMilestone = /^(authoring-tool|toc-add|step-|generic-step|fib-|widget-dropped)/.test(key);
    if (!isKnown && !isSetupMilestone) continue;

    lastByKey.set(key, step);
  }

  const orderedKeys = Object.keys(LIVE_STEP_TITLES);
  const ordered: LiveStepSnapshot[] = [];
  for (const k of orderedKeys) {
    const snap = lastByKey.get(k);
    if (snap) ordered.push(snap);
  }
  lastByKey.forEach((snap, k) => {
    if (!orderedKeys.includes(k)) ordered.push(snap);
  });
  return ordered;
}

/** Copy live PNGs beside report.html so ./live/ paths work in browser + PDF. */
function copyLiveSnapshotsForReport(
  steps: LiveStepSnapshot[],
  screenshotsDir: string,
  reportDir: string,
): void {
  const srcLive = path.join(screenshotsDir, 'live');
  const destLive = path.join(reportDir, 'live');
  fs.mkdirSync(destLive, { recursive: true });

  for (const step of steps) {
    const src = path.join(srcLive, step.snap);
    const dest = path.join(destLive, step.snap);
    if (fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, dest);
      } catch {
        /* non-fatal */
      }
    }
  }

  fs.writeFileSync(
    path.join(destLive, 'manifest.json'),
    JSON.stringify(steps, null, 2),
    'utf-8',
  );
}

// ---------------------------------------------------------------------------
// Build summary from Cypress run results
// ---------------------------------------------------------------------------
function buildReport(results: any): SuiteReport {
  const specs: SpecResult[] = [];
  let totalPassed = 0, totalFailed = 0, totalPending = 0, totalSkipped = 0, totalDuration = 0;

  if (results?.runs) {
    for (const run of results.runs) {
      const specFile = path.basename(run.spec?.relative || run.spec?.name || 'unknown');
      const passed = run.stats?.passes || 0;
      const failed = run.stats?.failures || 0;
      const pending = run.stats?.pending || 0;
      const skipped = run.stats?.skipped || 0;
      const duration = run.stats?.wallClockDuration || 0;

      const tests: TestResult[] = (run.tests || []).map((t: any) => ({
        title: Array.isArray(t.title) ? t.title[t.title.length - 1] : t.title || '',
        fullTitle: Array.isArray(t.title) ? t.title.join(' › ') : t.title || '',
        state: t.state || 'pending',
        duration: t.duration || 0,
        error: t.displayError || undefined,
      }));

      const skippedFromTests = tests.filter(t => t.state === 'skipped').length;
      const effectiveSkipped = skipped || skippedFromTests;

      specs.push({ specFile, passed, failed, pending, duration, tests });
      totalPassed += passed;
      totalFailed += failed;
      totalPending += pending;
      totalSkipped += effectiveSkipped;
      totalDuration += duration;
    }
  }

  return {
    projectName: 'Kitaboo Authoring Tool',
    generatedAt: new Date().toISOString(),
    launchUrl: process.env['AUTHORING_LAUNCH_URL'] || process.env['CYPRESS_AUTHORING_LAUNCH_URL'] || '',
    module: process.env['CYPRESS_AUTHORING_MODULE'] || process.env['AUTHORING_MODULE'] || 'ela',
    totalPassed,
    totalFailed,
    totalPending,
    totalSkipped,
    totalDuration,
    specs,
  };
}

// ---------------------------------------------------------------------------
// Build premium HTML report (self-contained, PDF-ready)
// ---------------------------------------------------------------------------
function buildHtml(report: SuiteReport): string {
  const overallPassed = report.totalFailed === 0;
  const passRate = report.totalPassed + report.totalFailed > 0
    ? Math.round((report.totalPassed / (report.totalPassed + report.totalFailed)) * 100)
    : 0;

  const statusBg = overallPassed ? '#059669' : '#dc2626';
  const statusLabel = overallPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED';

  const liveSteps = report.liveSteps || [];
  const liveTimeline = liveSteps.length
    ? `<div class="section-heading">Setup Flow Screenshots (${liveSteps.length})</div>
       <div class="live-timeline">
         ${liveSteps.map((step, i) => {
           const title = liveStepTitle(step.label);
           const imgSrc = `./live/${step.snap}`;
           return `<figure class="live-frame">
             <figcaption><span class="live-num">${i + 1}</span> ${title}</figcaption>
             <img src="${imgSrc}" alt="${title.replace(/"/g, '&quot;')}" loading="lazy"/>
           </figure>`;
         }).join('')}
       </div>`
    : '';

  const specBlocks = report.specs.map(spec => {
    const specOk = spec.failed === 0;
    const testRows = spec.tests.map(t => {
      const isSetup = /^SETUP\b|TC_02[abc]|Step 0\b|Create Generic Step|Create.*Step.*mandatory|Drop Fill in the Blank|Enter header text/i.test(t.title || t.fullTitle);
      const icon = isSetup ? '⚡' : t.state === 'passed' ? '✓' : t.state === 'failed' ? '✗' : t.state === 'skipped' ? '⊘' : '○';
      const rowCls = isSetup
        ? `setup ${t.state === 'failed' ? 'failed' : t.state === 'skipped' ? 'pending' : 'passed'}`
        : t.state === 'passed' ? 'passed' : t.state === 'failed' ? 'failed' : t.state === 'skipped' ? 'pending' : 'pending';
      const dur = t.duration ? `${t.duration}ms` : '';
      const setupBadge = isSetup ? '<span class="badge-setup">SETUP</span>' : '';
      const errBlock = t.error
        ? `<div class="err-block">${t.error.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>`
        : '';
      return `
        <tr class="test-row ${rowCls}">
          <td class="tc-icon">${icon}</td>
          <td class="tc-title">${setupBadge}${t.fullTitle.replace(/</g, '&lt;')}</td>
          <td class="tc-dur">${dur}</td>
        </tr>
        ${errBlock ? `<tr class="${rowCls}"><td colspan="3">${errBlock}</td></tr>` : ''}`;
    }).join('');

    return `
    <div class="spec-card ${specOk ? '' : 'spec-failed'}">
      <div class="spec-header">
        <div class="spec-status-dot ${specOk ? 'dot-pass' : 'dot-fail'}"></div>
        <span class="spec-name">${spec.specFile}</span>
        <span class="spec-badge ${specOk ? 'badge-pass' : 'badge-fail'}">${specOk ? 'PASSED' : 'FAILED'}</span>
        <span class="spec-time">${(spec.duration / 1000).toFixed(1)}s</span>
      </div>
      <div class="spec-meta">
        <span class="meta-pass">✓ ${spec.passed} passed</span>
        <span class="meta-fail">✗ ${spec.failed} failed</span>
        <span class="meta-pend">○ ${spec.pending} pending</span>
      </div>
      <table class="test-table">
        <tbody>${testRows}</tbody>
      </table>
    </div>`;
  }).join('');

  const donutOffset = 314 - (314 * passRate / 100);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kitaboo Authoring — Test Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --pass: #059669; --fail: #dc2626; --pend: #d97706;
    --primary: #4f46e5; --bg: #f0f4ff; --surface: #fff;
    --border: #e5e7eb; --text: #111827; --muted: #6b7280;
    --radius: 12px; --shadow: 0 2px 20px rgba(79,70,229,.08);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); padding: 32px 20px 60px; }

  /* ── Cover banner ── */
  .cover {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #818cf8 100%);
    border-radius: 20px;
    color: #fff;
    padding: 40px 48px;
    display: flex;
    align-items: center;
    gap: 40px;
    margin-bottom: 32px;
    box-shadow: 0 8px 40px rgba(79,70,229,.35);
  }
  .cover-left { flex: 1; }
  .cover-label {
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    background: rgba(255,255,255,.2); display: inline-block;
    padding: 4px 12px; border-radius: 99px; margin-bottom: 12px;
  }
  .cover h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
  .cover-sub { font-size: 13px; opacity: .75; margin-bottom: 20px; word-break: break-all; }
  .cover-status {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.3);
    border-radius: 99px; padding: 6px 18px; font-size: 13px; font-weight: 600;
  }
  .cover-status .dot { width: 8px; height: 8px; border-radius: 50%; }

  /* ── Donut chart ── */
  .donut-wrap { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
  .donut-svg { transform: rotate(-90deg); }
  .donut-bg { fill: none; stroke: rgba(255,255,255,.2); stroke-width: 12; }
  .donut-fg { fill: none; stroke: #fff; stroke-width: 12; stroke-linecap: round;
    stroke-dasharray: 314; transition: stroke-dashoffset .6s ease; }
  .donut-text {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    font-size: 22px; font-weight: 800; color: #fff; text-align: center;
  }
  .donut-lbl { font-size: 10px; opacity: .75; display: block; margin-top: 1px; }

  /* ── Stat cards ── */
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat-card {
    background: var(--surface); border-radius: var(--radius); padding: 20px 24px;
    box-shadow: var(--shadow); border-top: 3px solid var(--border);
    display: flex; flex-direction: column; gap: 6px;
  }
  .stat-card.s-pass { border-top-color: var(--pass); }
  .stat-card.s-fail { border-top-color: var(--fail); }
  .stat-card.s-pend { border-top-color: var(--pend); }
  .stat-card.s-info { border-top-color: var(--primary); }
  .stat-val { font-size: 32px; font-weight: 800; }
  .s-pass .stat-val { color: var(--pass); }
  .s-fail .stat-val { color: var(--fail); }
  .s-pend .stat-val { color: var(--pend); }
  .s-info .stat-val { color: var(--primary); }
  .stat-lbl { font-size: 12px; color: var(--muted); font-weight: 500; }

  /* ── Section heading ── */
  .section-heading {
    font-size: 13px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.5px; color: var(--muted); margin-bottom: 16px;
    padding-bottom: 8px; border-bottom: 1px solid var(--border);
  }

  /* ── Spec cards ── */
  .spec-card {
    background: var(--surface); border-radius: var(--radius); margin-bottom: 16px;
    box-shadow: var(--shadow); overflow: hidden;
    border-left: 4px solid var(--pass);
  }
  .spec-card.spec-failed { border-left-color: var(--fail); }
  .spec-header {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
  }
  .spec-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .dot-pass { background: var(--pass); }
  .dot-fail { background: var(--fail); }
  .spec-name { font-weight: 600; font-size: 14px; flex: 1; }
  .spec-badge {
    font-size: 10px; font-weight: 700; letter-spacing: .5px;
    padding: 2px 10px; border-radius: 99px;
  }
  .badge-pass { background: #d1fae5; color: var(--pass); }
  .badge-fail { background: #fee2e2; color: var(--fail); }
  .spec-time { font-size: 12px; color: var(--muted); white-space: nowrap; }
  .spec-meta {
    display: flex; gap: 16px; padding: 8px 20px;
    background: #f9fafb; font-size: 12px; font-weight: 500;
  }
  .meta-pass { color: var(--pass); }
  .meta-fail { color: var(--fail); }
  .meta-pend { color: var(--pend); }

  /* ── Test table ── */
  .test-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .test-row td { padding: 7px 20px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  .test-row:last-child td { border-bottom: none; }
  .test-row.passed .tc-icon { color: var(--pass); font-weight: 700; }
  .test-row.failed .tc-icon { color: var(--fail); font-weight: 700; }
  .test-row.pending .tc-icon { color: var(--pend); }
  .test-row.failed .tc-title { color: #991b1b; }
  .tc-icon { width: 28px; font-size: 15px; }
  .tc-title { color: #374151; }
  .tc-dur { width: 80px; text-align: right; color: var(--muted); font-size: 11px; }
  .err-block {
    font-family: 'Courier New', monospace; font-size: 11px; color: #7f1d1d;
    background: #fef2f2; border-left: 3px solid var(--fail);
    padding: 8px 14px; border-radius: 0 4px 4px 0; white-space: pre-wrap;
    overflow-wrap: break-word; margin: 0 20px 10px;
  }

  /* ── SETUP step rows ── */
  .test-row.setup td { background: #eff6ff; }
  .test-row.setup .tc-icon { color: #2563eb; font-size: 14px; }
  .test-row.setup .tc-title { color: #1e40af; font-weight: 600; }
  .test-row.setup.failed td { background: #fef2f2; }
  .test-row.setup.failed .tc-icon { color: var(--fail); }
  .badge-setup {
    display: inline-block; font-size: 9px; font-weight: 800; letter-spacing: .8px;
    background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd;
    padding: 1px 7px; border-radius: 99px; margin-right: 7px;
    text-transform: uppercase; vertical-align: middle;
  }

  /* ── Footer ── */
  .footer {
    text-align: center; color: var(--muted); font-size: 12px;
    margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border);
  }

  .live-timeline {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }
  .live-frame {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
  }
  .live-frame figcaption {
    font-size: 12px; font-weight: 600; padding: 10px 12px;
    border-bottom: 1px solid var(--border); background: #f9fafb;
  }
  .live-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 99px; background: var(--primary);
    color: #fff; font-size: 10px; margin-right: 6px;
  }
  .live-frame img { width: 100%; display: block; background: #111827; }

  @media print {
    body { background: #fff; padding: 0; }
    .cover { border-radius: 0; box-shadow: none; }
    .spec-card { box-shadow: none; break-inside: avoid; }
  }
</style>
</head>
<body>

<!-- ── Cover ── -->
<div class="cover">
  <div class="cover-left">
    <div class="cover-label">Automation Test Report</div>
    <h1>${report.projectName}</h1>
    <div class="cover-sub">
      ${report.launchUrl ? `<strong>URL:</strong> ${report.launchUrl}<br>` : ''}
      <strong>Module:</strong> ${report.module || 'ela'}<br>
      <strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </div>
    <div class="cover-status">
      <span class="dot" style="background:${overallPassed ? '#6ee7b7' : '#fca5a5'};"></span>
      ${statusLabel}
    </div>
  </div>
  <div class="donut-wrap">
    <svg class="donut-svg" viewBox="0 0 120 120" width="120" height="120">
      <circle class="donut-bg" cx="60" cy="60" r="50"/>
      <circle class="donut-fg" cx="60" cy="60" r="50"
        stroke-dashoffset="${donutOffset.toFixed(1)}"/>
    </svg>
    <div class="donut-text">${passRate}%<span class="donut-lbl">Pass Rate</span></div>
  </div>
</div>

<!-- ── Stats ── -->
<div class="stats">
  <div class="stat-card s-pass">
    <div class="stat-val">${report.totalPassed}</div>
    <div class="stat-lbl">Tests Passed</div>
  </div>
  <div class="stat-card s-fail">
    <div class="stat-val">${report.totalFailed}</div>
    <div class="stat-lbl">Tests Failed</div>
  </div>
  <div class="stat-card s-pend">
    <div class="stat-val">${report.totalPending + report.totalSkipped}</div>
    <div class="stat-lbl">Skipped / Pending</div>
  </div>
  <div class="stat-card s-info">
    <div class="stat-val">${(report.totalDuration / 1000).toFixed(0)}s</div>
    <div class="stat-lbl">Total Duration</div>
  </div>
</div>

${liveTimeline}

<!-- ── Spec Results ── -->
<div class="section-heading">Test Suites (${report.specs.length})</div>
${specBlocks}

<div class="footer">
  Kitaboo Authoring Automation Suite &nbsp;·&nbsp; ${new Date(report.generatedAt).toLocaleDateString()}
</div>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Cypress config
// ---------------------------------------------------------------------------
export default defineConfig({
  e2e: {
    specPattern: '{e2e,components}/**/*.spec.ts',
    supportFile: 'support/index.ts',
    fixturesFolder: process.env['AUTHORING_FIXTURES_DIR'] || 'fixtures',
    videosFolder: process.env['AUTHORING_VIDEOS_DIR'] || 'e2e/videos',
    screenshotsFolder: process.env['AUTHORING_SCREENSHOTS_DIR'] || 'e2e/screenshots',
    baseUrl: 'https://stagingauthor.kitaboo.com',
    env: {
      AUTHORING_LAUNCH_URL:        process.env['AUTHORING_LAUNCH_URL'] || '',
      AUTHORING_TEST_COMPONENTS:   process.env['CYPRESS_AUTHORING_TEST_COMPONENTS'] || 'all',
      AUTHORING_MODULE:            process.env['CYPRESS_AUTHORING_MODULE'] || 'ela',
    },
    viewportWidth: 1440,
    viewportHeight: 900,
    chromeWebSecurity: false,
    testIsolation: false,
    defaultCommandTimeout: 20000,
    requestTimeout: 25000,
    responseTimeout: 35000,
    pageLoadTimeout: 90000,
    retries: { runMode: 2, openMode: 0 },
    video: true,
    videoCompression: true,
    screenshotOnRunFailure: true,
    screenshotOptions: {
      capture: 'viewport',
      disableTimersAndAnimations: true,
    },

    setupNodeEvents(on, _config) {
      on('task', {
        log(message: string) { console.log(message); return null; },
      });

      let liveSnapCounter = 0;
      let liveManifest: LiveStepSnapshot[] = [];

      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args = launchOptions.args || [];
          launchOptions.args.push('--window-size=1440,900');
        }
        return launchOptions;
      });

      on('before:run', (details) => {
        ensureReportDir();
        liveSnapCounter = 0;
        liveManifest = [];
        const screenshotsDir: string =
          (details as any)?.config?.screenshotsFolder || 'e2e/screenshots';
        function clearDir(dir: string) {
          if (!fs.existsSync(dir)) return;
          for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) { clearDir(full); try { fs.rmdirSync(full); } catch { } }
            else fs.unlinkSync(full);
          }
        }
        clearDir(screenshotsDir);
        const liveDir = path.join(screenshotsDir, 'live');
        fs.mkdirSync(liveDir, { recursive: true });
        console.log('\n[Authoring Tests] Previous artifacts cleared. Starting fresh run.\n');
        return null;
      });

      on('after:screenshot', (details) => {
        const screenshotsDir: string =
          process.env['AUTHORING_SCREENSHOTS_DIR'] || 'e2e/screenshots';
        const liveDir = path.join(screenshotsDir, 'live');
        fs.mkdirSync(liveDir, { recursive: true });
        liveSnapCounter += 1;
        const flatName = `snap-${String(liveSnapCounter).padStart(4, '0')}.png`;
        const flatPath = path.join(liveDir, flatName);
        try {
          fs.copyFileSync(details.path, flatPath);
          if (!fs.existsSync(flatPath) || fs.statSync(flatPath).size < 100) {
            console.warn(`[AuthoringLiveStep] Screenshot copy may be empty: ${flatPath}`);
          }
          const label = (details.name || path.basename(details.path)).replace(/\.png$/i, '');
          liveManifest.push({ snap: flatName, label });
          fs.writeFileSync(
            path.join(liveDir, 'manifest.json'),
            JSON.stringify(liveManifest, null, 2),
            'utf-8',
          );
          console.log(`[AuthoringLiveStep] ${label}|live/${flatName}`);
        } catch (err) {
          console.warn(`[AuthoringLiveStep] Failed to copy screenshot: ${(err as Error).message}`);
        }
        return null;
      });

      on('after:run', (results) => {
        const report = buildReport(results);
        const screenshotsDir =
          process.env['AUTHORING_SCREENSHOTS_DIR'] || path.join(__dirname, 'e2e', 'screenshots');
        const allLiveSteps = loadLiveManifest();
        report.liveSteps = filterReportLiveSteps(allLiveSteps);
        copyLiveSnapshotsForReport(report.liveSteps, screenshotsDir, REPORT_DIR);
        ensureReportDir();
        fs.writeFileSync(SUITE_REPORT_JSON, JSON.stringify(report, null, 2), 'utf-8');
        fs.writeFileSync(SUITE_REPORT_HTML, buildHtml(report), 'utf-8');
        console.log(
          `\n[Authoring Tests] Report saved → ${SUITE_REPORT_HTML} (${report.liveSteps?.length || 0} setup screenshots)\n`,
        );
        return null;
      });
    },
  },
});
