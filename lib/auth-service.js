'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const BCRYPT_ROUNDS = 10;
const SESSION_HOURS = 12;
const REMEMBER_DAYS = 30;

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

function newSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sessionExpiry(rememberMe) {
  const d = new Date();
  if (rememberMe) {
    d.setDate(d.getDate() + REMEMBER_DAYS);
  } else {
    d.setHours(d.getHours() + SESSION_HOURS);
  }
  return d;
}

function toMysqlDatetime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function logLoginAttempt({ userId, email, success, message, ip }) {
  await db.query(
    `INSERT INTO login_audit (user_id, email, success, message, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [userId || null, email, success ? 1 : 0, message || null, ip || null],
  );
}

async function registerUser({ email, password, fullName, ip }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const name = String(fullName).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw Object.assign(new Error('Invalid email address.'), { status: 400 });
  }
  if (name.length < 2) {
    throw Object.assign(new Error('Full name is required.'), { status: 400 });
  }
  if (!password || String(password).length < 6) {
    throw Object.assign(new Error('Password must be at least 6 characters.'), { status: 400 });
  }

  const existing = await db.queryOne('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existing) {
    throw Object.assign(new Error('An account with this email already exists.'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
  const result = await db.query(
    `INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)`,
    [normalizedEmail, passwordHash, name],
  );

  const userId = result.insertId;
  await logLoginAttempt({
    userId,
    email: normalizedEmail,
    success: true,
    message: 'register',
    ip,
  });

  return createSessionForUser(userId, false, ip, null);
}

async function loginUser({ email, password, rememberMe, ip, userAgent }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await db.queryOne(
    `SELECT id, email, password_hash, full_name, is_active FROM users WHERE email = ?`,
    [normalizedEmail],
  );

  if (!user || !user.is_active) {
    await logLoginAttempt({
      email: normalizedEmail,
      success: false,
      message: 'user_not_found',
      ip,
    });
    throw Object.assign(new Error('Invalid email or password.'), { status: 401 });
  }

  if (!user.password_hash) {
    await logLoginAttempt({
      userId: user.id,
      email: normalizedEmail,
      success: false,
      message: 'google_only',
      ip,
    });
    throw Object.assign(new Error('This account uses Google sign-in.'), { status: 401 });
  }

  const match = await bcrypt.compare(String(password), user.password_hash);
  if (!match) {
    await logLoginAttempt({
      userId: user.id,
      email: normalizedEmail,
      success: false,
      message: 'bad_password',
      ip,
    });
    throw Object.assign(new Error('Invalid email or password.'), { status: 401 });
  }

  await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
  await logLoginAttempt({
    userId: user.id,
    email: normalizedEmail,
    success: true,
    message: 'login',
    ip,
  });

  return createSessionForUser(user.id, Boolean(rememberMe), ip, userAgent);
}

async function createSessionForUser(userId, rememberMe, ip, userAgent) {
  const rawToken = newSessionToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = sessionExpiry(rememberMe);

  await db.query(
    `INSERT INTO user_sessions (user_id, token_hash, remember_me, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, tokenHash, rememberMe ? 1 : 0, toMysqlDatetime(expiresAt), ip || null, userAgent || null],
  );

  const user = await db.queryOne(
    `SELECT id, email, full_name FROM users WHERE id = ?`,
    [userId],
  );

  return {
    token: rawToken,
    expiresAt: expiresAt.toISOString(),
    rememberMe: Boolean(rememberMe),
    user: {
      id: user.id,
      email: user.email,
      name: user.full_name,
    },
  };
}

async function resolveSession(rawToken) {
  if (!rawToken) return null;
  const tokenHash = hashToken(rawToken);
  const row = await db.queryOne(
    `SELECT s.user_id, s.expires_at, u.id, u.email, u.full_name, u.is_active
     FROM user_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > NOW()`,
    [tokenHash],
  );
  if (!row || !row.is_active) return null;
  return {
    id: Number(row.id),
    email: row.email,
    name: row.full_name,
  };
}

async function logoutUser(rawToken) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await db.query('DELETE FROM user_sessions WHERE token_hash = ?', [tokenHash]);
}

async function purgeExpiredSessions() {
  await db.query('DELETE FROM user_sessions WHERE expires_at <= NOW()');
}

module.exports = {
  registerUser,
  loginUser,
  resolveSession,
  logoutUser,
  purgeExpiredSessions,
  hashToken,
};
