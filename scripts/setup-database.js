'use strict';

/**
 * Creates tables + seed users/settings in authoring_test_runner (XAMPP MySQL).
 * Usage: node scripts/setup-database.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const ROOT = path.join(__dirname, '..');
const SCHEMA = path.join(ROOT, 'database', 'schema.sql');

async function main() {
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    multipleStatements: true,
  };

  console.log(`Connecting to MySQL at ${config.host}:${config.port}…`);
  const conn = await mysql.createConnection(config);

  const sql = fs.readFileSync(SCHEMA, 'utf8');
  await conn.query(sql);
  console.log('Schema applied.');

  await conn.changeUser({ database: process.env.DB_NAME || 'authoring_test_runner' });

  const settings = [
    ['max_history', '10', 'Max test runs kept per user on disk + DB'],
    ['session_hours', '12', 'Default session lifetime when Remember me is off'],
    ['remember_days', '30', 'Session lifetime when Remember me is on'],
    ['app_name', 'Kitaboo Authoring Test Runner', 'Display name'],
  ];

  for (const [key, value, description] of settings) {
    await conn.execute(
      `INSERT INTO app_settings (setting_key, setting_value, description)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), description = VALUES(description)`,
      [key, value, description],
    );
  }
  console.log('App settings seeded.');

  const users = [
    { email: 'demo@kitaboo.com', password: 'Demo@123', name: 'Demo Tester' },
    { email: 'admin@kitaboo.com', password: 'Admin@123', name: 'Test Runner Admin' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await conn.execute(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         password_hash = VALUES(password_hash),
         full_name = VALUES(full_name),
         is_active = 1`,
      [u.email, hash, u.name],
    );
    console.log(`User ready: ${u.email} / ${u.password}`);
  }

  await conn.end();
  console.log('\nDone. Start the server: npm start');
  console.log('Sign in at http://localhost:4321 with demo@kitaboo.com / Demo@123\n');
}

main().catch(err => {
  console.error('\n[setup-database] Failed:', err.message);
  console.error('Ensure XAMPP MySQL is running on port 3306 and DB credentials in .env are correct.\n');
  process.exit(1);
});
