'use strict';

const fs = require('fs');
const db = require('./db');

async function getSetting(key, fallback) {
  const row = await db.queryOne(
    'SELECT setting_value FROM app_settings WHERE setting_key = ?',
    [key],
  );
  return row ? row.setting_value : fallback;
}

async function getMaxHistory() {
  const v = await getSetting('max_history', '10');
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 10;
}

async function insertRun({
  runId,
  userId,
  launchUrl,
  testMode,
  testComponents,
  moduleId,
  startedAt,
}) {
  await db.query(
    `INSERT INTO test_runs (
      run_id, user_id, status, percent, launch_url, test_mode,
      test_components, module_id, started_at
    ) VALUES (?, ?, 'running', 0, ?, ?, ?, ?, ?)`,
    [
      runId,
      userId != null ? Number(userId) : null,
      launchUrl || null,
      testMode || 'e2e',
      testComponents || null,
      moduleId || 'ela',
      startedAt.replace('T', ' ').slice(0, 19),
    ],
  );
}

async function updateRunFromMeta(runId, meta) {
  const summary = meta.summary || {};
  await db.query(
    `UPDATE test_runs SET
      status = ?,
      percent = ?,
      summary_passed = ?,
      summary_failed = ?,
      summary_skipped = ?,
      completed_tests = ?,
      total_tests = ?,
      exit_code = ?,
      finished_at = ?
     WHERE run_id = ?`,
    [
      meta.status || 'done',
      meta.percent ?? 100,
      summary.passed ?? 0,
      summary.failed ?? 0,
      summary.skipped ?? 0,
      meta.completedTests ?? 0,
      meta.totalTests ?? 0,
      meta.exitCode ?? null,
      meta.finishedAt
        ? meta.finishedAt.replace('T', ' ').slice(0, 19)
        : new Date().toISOString().slice(0, 19).replace('T', ' '),
      runId,
    ],
  );
}

async function syncArtifacts(runId, files) {
  await db.query('DELETE FROM run_artifacts WHERE run_id = ?', [runId]);
  for (const f of files || []) {
    const rel = (f.url || '').replace(/^\/api\/download\/[^/]+\//, '');
    let size = null;
    try {
      if (f.absolutePath && fs.existsSync(f.absolutePath)) {
        size = fs.statSync(f.absolutePath).size;
      }
    } catch (_) { /* ignore */ }
    await db.query(
      `INSERT INTO run_artifacts (run_id, file_name, file_type, storage_path, file_size_bytes)
       VALUES (?, ?, ?, ?, ?)`,
      [runId, f.name, f.type || 'file', rel || f.name, size],
    );
  }
}

async function syncArtifactsFromCollect(runId, collectFilesFn, runsDir) {
  const files = collectFilesFn(runId).map(f => {
    const rel = f.url.replace(/^\/api\/download\/[^/]+\//, '');
    const absolutePath = require('path').join(runsDir, runId, ...rel.split('/'));
    return { ...f, absolutePath };
  });
  await syncArtifacts(runId, files);
}

async function listRunsForUser(userId, limit) {
  const uid = Number(userId);
  const rows = await db.query(
    `SELECT run_id, status, percent, launch_url, test_mode, test_components, module_id,
            summary_passed, summary_failed, summary_skipped,
            completed_tests, total_tests, started_at, finished_at
     FROM test_runs
     WHERE user_id = ?
     ORDER BY started_at DESC
     LIMIT ?`,
    [uid, limit],
  );
  return rows;
}

async function listArtifactsForRun(runId) {
  const rows = await db.query(
    `SELECT file_name, file_type, storage_path
     FROM run_artifacts WHERE run_id = ? ORDER BY id`,
    [runId],
  );
  return rows.map(r => ({
    name: r.file_name,
    type: r.file_type,
    url: `/api/download/${runId}/${r.storage_path.replace(/\\/g, '/')}`,
  }));
}

async function getRunForUser(runId, userId) {
  return db.queryOne(
    `SELECT run_id FROM test_runs WHERE run_id = ? AND user_id = ?`,
    [runId, Number(userId)],
  );
}

async function listRunsAnonymous(limit) {
  const rows = await db.query(
    `SELECT run_id, status, percent, launch_url, test_mode, test_components, module_id,
            summary_passed, summary_failed, summary_skipped,
            completed_tests, total_tests, started_at, finished_at
     FROM test_runs
     WHERE user_id IS NULL
     ORDER BY started_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows;
}

async function deleteRunRecord(runId) {
  await db.query('DELETE FROM test_runs WHERE run_id = ?', [runId]);
}

async function pruneRunsForUser(userId, maxKeep, isRunActiveFn, deleteRunDirFn) {
  const rows = await db.query(
    `SELECT run_id FROM test_runs WHERE user_id = ? ORDER BY started_at DESC`,
    [Number(userId)],
  );
  const deleted = [];
  for (let i = maxKeep; i < rows.length; i++) {
    const { run_id: runId } = rows[i];
    if (isRunActiveFn(runId)) continue;
    if (deleteRunDirFn) deleteRunDirFn(runId);
    await deleteRunRecord(runId);
    deleted.push(runId);
  }
  return deleted;
}

function rowToHistoryEntry(row, files) {
  return {
    runId: row.run_id,
    status: row.status,
    percent: row.percent,
    summary: {
      passed: row.summary_passed,
      failed: row.summary_failed,
      skipped: row.summary_skipped,
    },
    startedAt: (() => {
      const v = row.started_at;
      if (v instanceof Date) return v.toISOString();
      const s = String(v);
      if (s.includes('T')) return s.endsWith('Z') ? s : `${s}Z`;
      return `${s.replace(' ', 'T')}Z`;
    })(),
    launchUrl: row.launch_url || '',
    testMode: row.test_mode,
    testComponents: row.test_components || 'all',
    files: files || [],
    completedTests: row.completed_tests,
    totalTests: row.total_tests,
  };
}

module.exports = {
  getMaxHistory,
  insertRun,
  updateRunFromMeta,
  syncArtifacts,
  syncArtifactsFromCollect,
  listRunsForUser,
  listArtifactsForRun,
  getRunForUser,
  listRunsAnonymous,
  deleteRunRecord,
  pruneRunsForUser,
  rowToHistoryEntry,
};
