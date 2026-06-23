'use strict';

const authService = require('./auth-service');

function extractToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return req.headers['x-session-token'] || null;
}

function requireAuth() {
  return async (req, res, next) => {
    try {
      const token = extractToken(req);
      const user = await authService.resolveSession(token);
      if (!user) {
        return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
      }
      req.user = user;
      req.sessionToken = token;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Authentication check failed.' });
    }
  };
}

module.exports = { requireAuth, extractToken };
