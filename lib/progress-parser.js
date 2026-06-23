'use strict';

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1B\[[0-9;]*[mGKHF]/g;

function stripAnsi(str) {
  return str.replace(ANSI_RE, '');
}

/**
 * Parse a single Cypress stdout line for progress info.
 * Returns null when the line carries no actionable progress data.
 */
function parseProgressFromLine(rawLine, state) {
  const line = stripAnsi(rawLine);

  const passMatch = line.match(/\s+[✓√]\s+(.+?)(?:\s+\(\d+m?s\))?\s*$/);
  if (passMatch) {
    state.completedTests++;
    const pct = Math.min(89, Math.round((state.completedTests / state.totalTests) * 90));
    state.percent = pct;
    return {
      percent: pct,
      message: `✓ ${passMatch[1].trim().slice(0, 90)}`,
      completedTests: state.completedTests,
      totalTests: state.totalTests,
    };
  }

  const failTestMatch = line.match(/^(\s{4,})(\d+)\)\s+(.+)$/);
  if (failTestMatch) {
    const desc = failTestMatch[3].trim();
    const looksLikeTitle = !/^(AssertionError|Error:|expected |Timed out|at |cypress\/)/i.test(desc);
    if (looksLikeTitle) {
      state.completedTests++;
      const pct = Math.min(89, Math.round((state.completedTests / state.totalTests) * 90));
      state.percent = pct;
      return {
        percent: pct,
        message: `✗ ${desc.slice(0, 90)}`,
        completedTests: state.completedTests,
        totalTests: state.totalTests,
      };
    }
  }

  const runningMatch = line.match(/Running:\s+(.+?)\s+\((\d+) of (\d+)\)/);
  if (runningMatch) {
    const specName = runningMatch[1].trim();
    const current  = parseInt(runningMatch[2], 10);
    const total    = parseInt(runningMatch[3], 10);
    return {
      message: `Running spec ${current} of ${total}: ${specName}`,
      completedTests: state.completedTests,
      totalTests: state.totalTests,
    };
  }

  const passCountMatch = line.match(/^\s{0,4}(\d+) passing/);
  if (passCountMatch) {
    if (state._lastPassingReported !== parseInt(passCountMatch[1], 10)) {
      state._lastPassingReported = parseInt(passCountMatch[1], 10);
    }
    return {
      message: `${passCountMatch[1]} test(s) passed in this spec`,
      completedTests: state.completedTests,
      totalTests: state.totalTests,
    };
  }

  const failCountMatch = line.match(/^\s{0,4}(\d+) failing/);
  if (failCountMatch) {
    return {
      message: `${failCountMatch[1]} test(s) failed in this spec`,
      completedTests: state.completedTests,
      totalTests: state.totalTests,
    };
  }

  return null;
}

/**
 * Parse Cypress stdout for live preview context (suite name, active test).
 */
function parseLiveContextFromLine(rawLine) {
  const line = stripAnsi(rawLine).trimEnd();

  const attemptMatch = line.match(/\(Attempt \d+ of \d+\)\s+(.+)$/);
  if (attemptMatch) {
    return { kind: 'test', test: attemptMatch[1].trim() };
  }

  const suiteMatch = line.match(/^\s{2}([^✓✗(\d].{10,})$/);
  if (suiteMatch && !/passing|failing|pending|Running:/i.test(suiteMatch[1])) {
    return { kind: 'suite', suite: suiteMatch[1].trim() };
  }

  const liveShotMatch = line.match(/\[AuthoringLiveStep\]\s+(.+)/);
  if (liveShotMatch) {
    const raw = liveShotMatch[1].trim();
    if (raw.includes('|live/')) {
      const pipe = raw.indexOf('|');
      return {
        kind: 'liveStep',
        label: raw.slice(0, pipe).trim(),
        relPath: raw.slice(pipe + 1).trim(),
      };
    }
    return { kind: 'liveStep', label: raw };
  }

  return null;
}

module.exports = { stripAnsi, parseProgressFromLine, parseLiveContextFromLine };
