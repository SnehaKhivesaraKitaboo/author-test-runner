'use strict';

/**
 * Shared API + session helpers for login and dashboard.
 *
 * Auth is handled entirely client-side via localStorage — no database,
 * no password validation, no email rules. Any input goes in, session is
 * stored locally, and the user lands on the dashboard.
 *
 * Works whether the HTML files are opened via:
 *   - The Express server   → http://localhost:4321/
 *   - VS Code Live Server  → http://127.0.0.1:5500/authoring-tests/public/
 */
(function (global) {
  const SESSION_KEY = 'atr_session';
  const EXPRESS_PORT = 4321;

  // ------------------------------------------------------------------
  // API base — same-origin when on 4321, absolute otherwise (Live Server)
  // ------------------------------------------------------------------
  function resolveApiBase() {
    if (global.ATR_API_BASE) return global.ATR_API_BASE.replace(/\/$/, '');
    const loc = global.location;
    if (loc && Number(loc.port) === EXPRESS_PORT) return '';
    return `http://localhost:${EXPRESS_PORT}`;
  }

  const API_BASE = resolveApiBase();

  function apiUrl(path) {
    return API_BASE + path;
  }

  // ------------------------------------------------------------------
  // localStorage session helpers
  // ------------------------------------------------------------------
  function getStoredSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  function saveSession(payload) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getToken() {
    const s = getStoredSession();
    return s && s.token ? s.token : null;
  }

  // ------------------------------------------------------------------
  // Pure localStorage auth — no server calls for login/logout/me
  // ------------------------------------------------------------------

  /**
   * "Login": stores whatever the user typed as a local session.
   * No password check, no email validation.
   */
  function localLogin(email, name) {
    const token = 'local-' + Math.random().toString(36).slice(2) + Date.now();
    saveSession({
      token,
      email: email || 'guest@local',
      name: name || email || 'Guest',
      expires: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
    return token;
  }

  /** "Logout": just clears localStorage. */
  function localLogout() {
    clearSession();
  }

  /** True if a session token exists in localStorage (no server ping). */
  function isLoggedIn() {
    return !!getToken();
  }

  // ------------------------------------------------------------------
  // HTTP fetch helper — used for non-auth API calls (/api/run, etc.)
  // ------------------------------------------------------------------
  async function apiFetch(path, options = {}) {
    // Auth endpoints are handled locally — never go to the server
    const authPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/me'];
    if (authPaths.some(p => path.endsWith(p))) {
      if (path.endsWith('/api/auth/logout')) { localLogout(); return { ok: true, json: async () => ({}) }; }
      if (path.endsWith('/api/auth/me')) {
        const s = getStoredSession();
        if (s) return { ok: true, status: 200, json: async () => ({ user: { email: s.email, name: s.name } }) };
        return { ok: false, status: 401, json: async () => ({ error: 'No session' }) };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    }

    const url = path.startsWith('http') ? path : apiUrl(path);
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      clearSession();
    }
    return res;
  }

  global.AtrApi = {
    SESSION_KEY,
    API_BASE,
    apiUrl,
    getStoredSession,
    saveSession,
    clearSession,
    getToken,
    isLoggedIn,
    localLogin,
    localLogout,
    apiFetch,
  };
})(window);
