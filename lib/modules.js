'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..');
const MODULES_DIR  = path.join(ROOT, 'fixtures', 'modules');

const MODULE_FILES = {
  ela:  'ela-module.json',
  wl:   'wl-module.json',
  math: 'math-module.json',
};

const DEFAULT_MODULE = 'ela';

let _moduleCache = null;

function loadRegistrySuites() {
  const { loadRegistry } = require('./registry');
  return loadRegistry().suites || [];
}

function buildRegistryLookups(suites) {
  const byId = new Map();
  const byDataType = new Map();
  const byName = new Map();

  for (const suite of suites) {
    byId.set(suite.id, suite);
    byDataType.set(suite.dataType, suite);
    byName.set(suite.name.toLowerCase(), suite);
  }

  return { byId, byDataType, byName };
}

function getSpecIndex() {
  return require('./registry').getComponentSpecIndex();
}

function mapSuiteToApiComponent(suite) {
  // Upgrade to "deep" when a components/<slug>/*-deep.spec.ts exists for this suite.
  const componentSpec = getSpecIndex()[suite.id] || null;
  return {
    id: suite.id,
    name: suite.name,
    dataType: suite.dataType,
    section: suite.section,
    category: suite.category,
    description: suite.description || '',
    automationStatus: componentSpec ? 'deep' : suite.automationStatus,
    specFile: suite.specFile || null,
    deepSpecFile: componentSpec || suite.deepSpecFile || null,
    tcCount: suite.tcCount || 0,
    pdfFile: suite.pdfFile || null,
    testTypes: suite.testTypes || [],
  };
}

function resolveModuleItem(item, lookups) {
  const { byId, byDataType, byName } = lookups;

  if (item.registryId && byId.has(item.registryId)) {
    return mapSuiteToApiComponent(byId.get(item.registryId));
  }

  if (item.dataType && byDataType.has(item.dataType)) {
    return mapSuiteToApiComponent(byDataType.get(item.dataType));
  }

  if (item.name && byName.has(item.name.toLowerCase())) {
    return mapSuiteToApiComponent(byName.get(item.name.toLowerCase()));
  }

  if (!item.name || !item.dataType) return null;

  // Inline component def — still upgrade to deep if a matching component spec exists.
  const inlineId = item.registryId || item.dataType;
  const inlineSpec = getSpecIndex()[inlineId] || null;
  return {
    id: inlineId,
    name: item.name,
    dataType: item.dataType,
    section: item.section || 'Widgets',
    category: item.category || 'Widget',
    description: item.description || '',
    automationStatus: inlineSpec ? 'deep' : (item.automationStatus || 'planned'),
    specFile: item.specFile || null,
    deepSpecFile: inlineSpec || item.deepSpecFile || null,
    tcCount: item.tcCount || 0,
    pdfFile: item.pdfFile || null,
    testTypes: item.testTypes || [],
  };
}

function loadModuleFile(moduleId) {
  const file = MODULE_FILES[moduleId];
  if (!file) return null;

  const filePath = path.join(MODULES_DIR, file);
  if (!fs.existsSync(filePath)) return null;

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadAllModules() {
  if (_moduleCache) return _moduleCache;

  const modules = [];
  for (const id of Object.keys(MODULE_FILES)) {
    const raw = loadModuleFile(id);
    if (!raw) continue;
    modules.push({
      id: raw._meta.id,
      label: raw._meta.label,
      shortLabel: raw._meta.shortLabel,
      description: raw._meta.description,
      activityCreation: raw._meta.activityCreation,
    });
  }

  _moduleCache = modules;
  return modules;
}

function normalizeModuleId(moduleId) {
  const id = (moduleId || DEFAULT_MODULE).toLowerCase();
  return MODULE_FILES[id] ? id : DEFAULT_MODULE;
}

/**
 * Returns module catalog with categories and resolved components (deduped by dataType).
 */
function getModuleCatalog(moduleId) {
  const id = normalizeModuleId(moduleId);
  const raw = loadModuleFile(id);
  if (!raw) return null;

  const lookups = buildRegistryLookups(loadRegistrySuites());
  const seen = new Set();
  const categories = [];

  for (const cat of raw.categories || []) {
    const components = [];

    for (const item of cat.items || []) {
      const resolved = resolveModuleItem(item, lookups);
      if (!resolved || seen.has(resolved.dataType)) continue;
      seen.add(resolved.dataType);
      components.push(resolved);
    }

    if (components.length) {
      categories.push({
        id: cat.id,
        label: cat.label,
        description: cat.description || '',
        components,
      });
    }
  }

  const flatComponents = categories.flatMap(c => c.components);

  return {
    module: raw._meta,
    categories,
    components: flatComponents,
    total: flatComponents.length,
  };
}

function getModuleList() {
  return loadAllModules();
}

function getModuleCategoryCounts(moduleId) {
  const catalog = getModuleCatalog(moduleId);
  if (!catalog) return {};

  const counts = {};
  for (const cat of catalog.categories) {
    counts[cat.label] = cat.components.length;
  }
  return counts;
}

function invalidateModuleCache() {
  _moduleCache = null;
}

module.exports = {
  DEFAULT_MODULE,
  MODULE_FILES,
  getModuleList,
  getModuleCatalog,
  getModuleCategoryCounts,
  normalizeModuleId,
  invalidateModuleCache,
};
