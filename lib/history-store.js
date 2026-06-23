'use strict';

const fs   = require('fs');
const path = require('path');

const MAX_HISTORY = 10;

function createHistoryStore(runsDir, collectFilesFn) {
  function metaPath(runId) {
    return path.join(runsDir, runId, 'run-meta.json');
  }

  function reportPath(runId) {
    return path.join(runsDir, runId, 'reports', 'report.json');
  }

  function runDirPath(runId) {
    return path.join(runsDir, runId);
  }

  function isRunActive(runId, runState) {
    const state = runState[runId];
    return Boolean(state && state.status === 'running' && state.proc);
  }

  function listRunDirs() {
    if (!fs.existsSync(runsDir)) return [];
    return fs.readdirSync(runsDir)
      .map(name => {
        const dirPath = path.join(runsDir, name);
        try {
          const stat = fs.statSync(dirPath);
          if (!stat.isDirectory()) return null;
          const files = collectFilesFn(name);
          if (files.length === 0) return null;
          return {
            runId: name,
            createdAt: stat.birthtimeMs || stat.ctimeMs,
          };
        } catch (_) {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  function deleteRunDir(runId) {
    const dirPath = runDirPath(runId);
    if (!fs.existsSync(dirPath)) return false;
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  }

  function saveRunMeta(runId, meta) {
    const p = metaPath(runId);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(meta, null, 2), 'utf-8');
  }

  function readRunMeta(runId) {
    const p = metaPath(runId);
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch (_) {
      return null;
    }
  }

  function readReportSummary(runId) {
    const p = reportPath(runId);
    if (!fs.existsSync(p)) return null;
    try {
      const report = JSON.parse(fs.readFileSync(p, 'utf-8'));
      return {
        passed: report.totalPassed ?? report.summary?.passed ?? 0,
        failed: report.totalFailed ?? report.summary?.failed ?? 0,
        skipped: report.totalSkipped ?? report.summary?.skipped ?? 0,
      };
    } catch (_) {
      return null;
    }
  }

  function buildRunEntry(dir, runState) {
    const dirPath = path.join(runsDir, dir.runId);
    try {
      const stat = fs.statSync(dirPath);
      const files = collectFilesFn(dir.runId);
      if (files.length === 0) return null;

      const meta = readRunMeta(dir.runId) || {};
      const reportSummary = readReportSummary(dir.runId);
      const inMemory = runState[dir.runId];

      return {
        runId: dir.runId,
        status: inMemory ? inMemory.status : (meta.status || 'done'),
        percent: inMemory ? inMemory.percent : (meta.percent ?? 100),
        summary: inMemory?.summary || reportSummary || meta.summary || { passed: 0, failed: 0 },
        startedAt: meta.startedAt || new Date(stat.birthtimeMs || stat.ctimeMs).toISOString(),
        launchUrl: meta.launchUrl || '',
        testMode: meta.testMode || 'e2e',
        testComponents: meta.testComponents || 'all',
        files,
        createdAt: dir.createdAt,
        completedTests: meta.completedTests || 0,
        totalTests: meta.totalTests || 0,
      };
    } catch (_) {
      return null;
    }
  }

  function loadHistoryFromDisk(runState, limit = MAX_HISTORY) {
    const dirs = listRunDirs();
    const runs = [];
    for (const dir of dirs.slice(0, limit)) {
      const entry = buildRunEntry(dir, runState);
      if (entry) runs.push(entry);
    }
    return runs;
  }

  /** Remove oldest runs beyond MAX_HISTORY (never deletes active runs). */
  function pruneOldRuns(runState) {
    const dirs = listRunDirs();
    const deleted = [];

    for (let i = MAX_HISTORY; i < dirs.length; i++) {
      const { runId } = dirs[i];
      if (isRunActive(runId, runState)) continue;
      if (deleteRunDir(runId)) {
        deleted.push(runId);
        delete runState[runId];
      }
    }

    return deleted;
  }

  function deleteRun(runId, runState) {
    if (isRunActive(runId, runState)) {
      return { ok: false, error: 'Cannot delete a run that is still in progress.' };
    }
    if (!deleteRunDir(runId)) {
      return { ok: false, error: 'Run not found.' };
    }
    delete runState[runId];
    return { ok: true, runId };
  }

  function deleteAllRuns(runState) {
    const dirs = listRunDirs();
    const deleted = [];
    const skipped = [];

    for (const { runId } of dirs) {
      if (isRunActive(runId, runState)) {
        skipped.push(runId);
        continue;
      }
      if (deleteRunDir(runId)) {
        deleted.push(runId);
        delete runState[runId];
      }
    }

    return { ok: true, deleted, skipped };
  }

  return {
    MAX_HISTORY,
    saveRunMeta,
    readRunMeta,
    readReportSummary,
    loadHistoryFromDisk,
    pruneOldRuns,
    deleteRun,
    deleteAllRuns,
    isRunActive,
    deleteRunDir,
  };
}

module.exports = { createHistoryStore, MAX_HISTORY: 10 };
