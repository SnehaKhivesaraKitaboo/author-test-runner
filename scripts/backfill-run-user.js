'use strict';

/**
 * Attach orphan test_runs (user_id IS NULL) to a user by email.
 * Usage: node scripts/backfill-run-user.js demo@kitaboo.com
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const db = require('../lib/db');

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: node scripts/backfill-run-user.js <email>');
    process.exit(1);
  }

  await db.ping();
  const user = await db.queryOne('SELECT id, email FROM users WHERE email = ?', [email]);
  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  const result = await db.query(
    'UPDATE test_runs SET user_id = ? WHERE user_id IS NULL',
    [Number(user.id)],
  );

  console.log(`Assigned ${result.affectedRows ?? 0} run(s) to ${user.email} (id=${user.id})`);
  await db.closePool();
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
