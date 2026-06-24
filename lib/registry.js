'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT          = path.join(__dirname, '..');
const REGISTRY_JSON = path.join(ROOT, 'fixtures', 'test-registry.json');
const DEEP_SPEC     = path.join(ROOT, 'e2e', '09-component-deep.spec.ts');
const E2E_DIR       = path.join(ROOT, 'e2e');
const COMPONENTS_DIR = path.join(ROOT, 'components');

/**
 * Map of component slug → relative deep-spec path (e.g.
 * "components/ela-multipart/16-ela-multipart-deep.spec.ts"), discovered from the
 * filesystem so dashboard runs stay in sync with the actual component suites
 * without hand-maintaining deepSpecFile entries in the registry.
 *
 * Cached after first build; call refreshComponentSpecIndex() to invalidate.
 */
let _componentSpecIndex = null;

function buildComponentSpecIndex() {
  const index = {};
  let slugs = [];
  try {
    slugs = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  } catch (_) {
    return index;
  }

  for (const slug of slugs) {
    const dir = path.join(COMPONENTS_DIR, slug);
    let files = [];
    try {
      files = fs.readdirSync(dir);
    } catch (_) {
      continue;
    }
    // Prefer the *-deep.spec.ts file; fall back to any *.spec.ts.
    const deep = files.find(f => /-deep\.spec\.ts$/.test(f))
      || files.find(f => /\.spec\.ts$/.test(f));
    if (deep) {
      // Forward-slash path so it works as a Cypress --spec on all platforms.
      index[slug] = `components/${slug}/${deep}`;
    }
  }
  return index;
}

function getComponentSpecIndex() {
  if (!_componentSpecIndex) _componentSpecIndex = buildComponentSpecIndex();
  return _componentSpecIndex;
}

function refreshComponentSpecIndex() {
  _componentSpecIndex = buildComponentSpecIndex();
  return _componentSpecIndex;
}

/** Resolve a single selected component (name | id | dataType) → its slug. */
function resolveSlugForSelection(selection) {
  const wanted = String(selection || '').trim().toLowerCase();
  if (!wanted) return null;

  const index = getComponentSpecIndex();

  // Direct slug match (registry ids equal component dir slugs).
  if (index[wanted]) return wanted;

  // Match via registry suite (name / id / dataType) → id (slug).
  const suite = (loadRegistry().suites || []).find(s =>
    s.name.toLowerCase() === wanted ||
    s.id.toLowerCase() === wanted ||
    (s.dataType || '').toLowerCase() === wanted,
  );
  if (suite && index[suite.id]) return suite.id;

  // Last resort: slugify the selection and try again.
  const slugified = wanted.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (index[slugified]) return slugified;

  return null;
}

const ALL_SPECS = [
  '01-session-launch.spec.ts',
  '02-editor-shell.spec.ts',
  '03-toolbar-actions.spec.ts',
  '04-left-panel.spec.ts',
  '05-toc-navigation.spec.ts',
  '06-layout-components.spec.ts',
  '07-element-components.spec.ts',
  '08-widget-components.spec.ts',
  '09-component-deep.spec.ts',
  '10-step-creation.spec.ts',
  '11-mcq-deep.spec.ts',
  '12-mcq-multiple-deep.spec.ts',
  // 13-fib-deep.spec.ts moved to components/fib/ (resolved via component spec index).
];

let _cache = null;

function loadRegistry() {
  if (_cache) return _cache;
  if (!fs.existsSync(REGISTRY_JSON)) {
    _cache = { suites: [], categories: {}, _meta: {} };
    return _cache;
  }
  _cache = JSON.parse(fs.readFileSync(REGISTRY_JSON, 'utf-8'));
  return _cache;
}

function getSuites() {
  return loadRegistry().suites || [];
}

function getComponentsBySpec(specFile) {
  return getSuites()
    .filter(s => s.specFile === specFile && s.automationStatus !== 'planned')
    .map(s => ({
      name: s.name,
      dataType: s.dataType,
      section: s.section,
      category: s.category,
      description: s.description || '',
      automationStatus: s.automationStatus,
    }));
}

function getApiComponents() {
  const index = getComponentSpecIndex();

  return getSuites()
    .map(s => {
      // A component is runnable if a components/<slug>/*-deep.spec.ts exists.
      const componentSpec = index[s.id] || null;
      const deepSpecFile = componentSpec || s.deepSpecFile || null;
      const automationStatus = componentSpec ? 'deep' : s.automationStatus;
      return { ...s, deepSpecFile, automationStatus };
    })
    // Show anything that has automation (basic/deep); hide still-planned items.
    .filter(s => s.automationStatus !== 'planned')
    .map(s => ({
      name: s.name,
      dataType: s.dataType,
      section: s.section,
      category: s.category,
      description: s.description || '',
      automationStatus: s.automationStatus,
      specFile: s.specFile || null,
      deepSpecFile: s.deepSpecFile || null,
      tcCount: s.tcCount || 0,
      pdfFile: s.pdfFile || null,
      testTypes: s.testTypes || [],
    }));
}

function getCategoryCounts(components) {
  const categories = {};
  components.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });
  return categories;
}

/** Parse 09-component-deep.spec.ts for per-component test estimates. */
function parseDeepEstimates() {
  if (!fs.existsSync(DEEP_SPEC)) return [];
  const src = fs.readFileSync(DEEP_SPEC, 'utf-8');
  const start = src.indexOf('const REGISTRY:');
  if (start < 0) return [];
  const end = src.indexOf('];', start);
  const block = end > start ? src.slice(start, end) : src;

  const components = [];
  const entryRe = /name:\s*'([^']+)'[\s\S]*?dataType:\s*'([^']+)'[\s\S]*?settingsChecks:\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = entryRe.exec(block)) !== null) {
    const settingsCount = (m[3].match(/\{\s*label:/g) || []).length;
    const hasFeature = /featureInteraction:\s*\(\)/.test(m[0]);
    components.push({ name: m[1], dataType: m[2], settingsCount, hasFeature });
  }
  return components;
}

function resolveNamesToDataTypes(names) {
  const registry = loadRegistry();
  const wanted = names.map(n => n.toLowerCase());
  const dataTypes = [];
  for (const s of registry.suites || []) {
    if (
      wanted.includes(s.name.toLowerCase()) ||
      wanted.includes(s.id.toLowerCase()) ||
      wanted.includes(s.dataType.toLowerCase())
    ) {
      dataTypes.push(s.dataType);
    }
  }
  return dataTypes;
}

function resolveDeepComponentNames(testComponents) {
  const estimates = parseDeepEstimates();
  if (!testComponents || testComponents.trim().toLowerCase() === 'all') {
    return estimates;
  }
  const names = testComponents.split(',').map(s => s.trim().toLowerCase());
  const dataTypes = resolveNamesToDataTypes(names);
  return estimates.filter(c =>
    names.includes(c.name.toLowerCase()) || dataTypes.includes(c.dataType),
  );
}

function estimate09Tests(testComponents) {
  const targets = resolveDeepComponentNames(testComponents);
  let total = 1; // Step 0 setup
  for (const c of targets) {
    total += 5 + c.settingsCount + (c.hasFeature ? 1 : 0) + 1;
  }
  return total;
}

function countItBlocks(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath, 'utf-8');
  return (content.match(/\bit\(/g) || []).length;
}

/**
 * Estimate total tests for a run before Cypress starts.
 * @param {string|undefined} specArg - comma-separated spec paths or undefined for all
 * @param {string} testMode - 'e2e' | 'component'
 * @param {string} testComponents - comma-separated names or 'all'
 */
/** Resolve a spec token (relative path or bare basename) to an absolute path. */
function resolveSpecPath(token) {
  const t = String(token || '').trim().replace(/\\/g, '/');
  if (!t) return null;
  // components/<slug>/... or e2e/... — relative to ROOT
  if (t.includes('/')) return path.join(ROOT, t);
  // bare basename → assume e2e/
  return path.join(E2E_DIR, t);
}

function countAuthoringTests(specArg, testMode, testComponents) {
  if (testMode === 'component') {
    const tokens = specArg ? specArg.split(',').map(s => s.trim()).filter(Boolean) : [];
    // Sum it() blocks across all resolved component specs.
    const componentSpecs = tokens.filter(t => !/09-component-deep\.spec\.ts$/.test(t));
    if (componentSpecs.length) {
      let total = 0;
      for (const tok of componentSpecs) {
        const fp = resolveSpecPath(tok);
        if (fp) total += countItBlocks(fp);
      }
      const label = componentSpecs.map(t => path.basename(t)).join(', ');
      console.log(`[countAuthoringTests] Component deep spec estimate: ${total} tests (${label})`);
      return Math.max(total, 1);
    }
    const total = estimate09Tests(testComponents || 'all');
    console.log(`[countAuthoringTests] Component mode estimate: ${total} tests`);
    return Math.max(total, 1);
  }

  const selected = specArg
    ? specArg.split(',').map(s => path.basename(s.trim()))
    : ALL_SPECS;

  let total = 0;
  for (const basename of selected) {
    const filePath = path.join(E2E_DIR, basename);
    if (!fs.existsSync(filePath)) continue;

    if (basename === '09-component-deep.spec.ts') {
      total += estimate09Tests(testComponents || 'all');
    } else {
      total += countItBlocks(filePath);
    }
  }

  const label = selected.map(f => f.replace('.spec.ts', '')).join(', ');
  console.log(`[countAuthoringTests] Estimated total tests: ${total} (${label})`);
  return Math.max(total, 1);
}

function buildLaunchUrl() {
  const full = process.env.AUTHORING_LAUNCH_URL;
  if (full) return full;

  // LOCAL_AUTHORING=1 — serve from the local server instead of staging
  if (['1', 'true', 'yes'].includes(String(process.env.LOCAL_AUTHORING || '').toLowerCase())) {
    const port = process.env.PORT || 4321;
    const localPath = process.env.LOCAL_AUTHORING_PATH || '/KITABOO_Authoring/index.html';
    const courseId = process.env.AUTHORING_COURSE_ID || '';
    const token = process.env.AUTHORING_USER_TOKEN || '';
    const base = `http://localhost:${port}${localPath}`;
    if (courseId && token) {
      return `${base}?courseId=${encodeURIComponent(courseId)}&userToken=${encodeURIComponent(token)}`;
    }
    return base;
  }

  const base = (process.env.AUTHORING_BASE_URL || 'https://stagingauthor.kitaboo.com').replace(/\/$/, '');
  const pathPart = process.env.AUTHORING_PATH || '/html_authoring2_carnegie/index.html';
  const courseId = process.env.AUTHORING_COURSE_ID || '';
  const token = process.env.AUTHORING_USER_TOKEN || '';

  if (!courseId || !token) return '';
  return `${base}${pathPart}?courseId=${encodeURIComponent(courseId)}&userToken=${encodeURIComponent(token)}`;
}

/**
 * Resolve the dashboard component selection → Cypress --spec value.
 *
 * - "all" (or empty)         → run every components/<slug>/*-deep.spec.ts
 * - one or more components    → comma-joined list of their deep specs
 * - any selection that has no component spec falls back to the generic
 *   e2e/09-component-deep.spec.ts so a run is never silently empty.
 */
function resolveComponentModeSpec(testComponents) {
  const index = getComponentSpecIndex();
  const allSpecs = Object.values(index);

  if (!testComponents || testComponents.trim().toLowerCase() === 'all') {
    return allSpecs.length ? allSpecs.join(',') : 'e2e/09-component-deep.spec.ts';
  }

  const selections = testComponents.split(',').map(s => s.trim()).filter(Boolean);
  const specs = [];
  const unresolved = [];

  for (const sel of selections) {
    const slug = resolveSlugForSelection(sel);
    if (slug && index[slug]) {
      if (!specs.includes(index[slug])) specs.push(index[slug]);
    } else {
      unresolved.push(sel);
    }
  }

  if (unresolved.length) {
    console.warn(`[resolveComponentModeSpec] No component spec for: ${unresolved.join(', ')}`);
  }

  if (specs.length) {
    console.log(`[resolveComponentModeSpec] → ${specs.join(',')}`);
    return specs.join(',');
  }

  // Nothing resolved — fall back to the generic deep smoke spec.
  console.warn(`[resolveComponentModeSpec] No component spec resolved for "${testComponents}" — falling back to e2e/09-component-deep.spec.ts`);
  return 'e2e/09-component-deep.spec.ts';
}

function getSuiteByName(name) {
  if (!name) return null;
  const wanted = name.toLowerCase();
  return (loadRegistry().suites || []).find(s =>
    s.name.toLowerCase() === wanted ||
    s.id.toLowerCase() === wanted ||
    s.dataType.toLowerCase() === wanted,
  ) || null;
}

function loadComponentFlows() {
  const flowsPath = path.join(ROOT, 'fixtures', 'component-flows.json');
  if (!fs.existsSync(flowsPath)) return { _meta: {}, flows: {} };
  const raw = JSON.parse(fs.readFileSync(flowsPath, 'utf-8'));
  const { _meta, ...flows } = raw;
  return { _meta: _meta || {}, flows };
}

module.exports = {
  loadRegistry,
  getSuites,
  getComponentsBySpec,
  getApiComponents,
  getCategoryCounts,
  countAuthoringTests,
  buildLaunchUrl,
  parseDeepEstimates,
  resolveComponentModeSpec,
  getSuiteByName,
  loadComponentFlows,
  getComponentSpecIndex,
  refreshComponentSpecIndex,
};
