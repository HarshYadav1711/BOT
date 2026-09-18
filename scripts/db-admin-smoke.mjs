/**
 * Admin auth DB smoke (no Netlify runtime required).
 * Usage: npm run db:admin-smoke
 * Never prints secrets or DATABASE_URL.
 */

import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { buildPoolConfig, loadEnvFile } from './loadEnv.mjs';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  loadEnvFile();
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error('db:admin-smoke failed: DATABASE_URL is not set.');
    process.exit(1);
  }

  const username = process.env.ADMIN_INITIAL_USERNAME?.trim();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!username || !password) {
    console.error('db:admin-smoke failed: ADMIN_INITIAL_USERNAME/PASSWORD not set.');
    process.exit(1);
  }

  const pool = new pg.Pool(buildPoolConfig(url));
  const client = await pool.connect();

  try {
    const tables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename IN ('admin_users', 'admin_sessions')
    `);
    assert(tables.rows.length === 2, 'admin tables missing — run db:migrate');
    console.log('ok  admin tables');

    // Bootstrap if empty
    const count = await client.query('SELECT COUNT(*)::int AS c FROM admin_users');
    if ((count.rows[0]?.c ?? 0) === 0) {
      const hash = await bcrypt.hash(password, 12);
      await client.query(
        `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)`,
        [username, hash]
      );
      console.log('ok  bootstrapped initial admin');
    } else {
      console.log('ok  admin already present');
    }

    const user = await client.query(
      `SELECT id, username, password_hash FROM admin_users WHERE username = $1`,
      [username]
    );
    assert(user.rows[0], 'admin user missing');
    const match = await bcrypt.compare(password, user.rows[0].password_hash);
    assert(match, 'password hash does not match ADMIN_INITIAL_PASSWORD');
    console.log('ok  password verify');

    const wrong = await bcrypt.compare('wrong-password', user.rows[0].password_hash);
    assert(!wrong, 'wrong password unexpectedly matched');
    console.log('ok  wrong password rejected');

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex');
    const expires = new Date(Date.now() + 60_000).toISOString();
    await client.query(
      `INSERT INTO admin_sessions (admin_user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [user.rows[0].id, tokenHash, expires]
    );
    const sess = await client.query(
      `SELECT id FROM admin_sessions WHERE token_hash = $1`,
      [tokenHash]
    );
    assert(sess.rows[0], 'session insert failed');
    console.log('ok  session hash stored (not raw token)');

    await client.query(`DELETE FROM admin_sessions WHERE token_hash = $1`, [tokenHash]);
    console.log('db:admin-smoke completed successfully.');
  } catch (err) {
    console.error(`db:admin-smoke failed: ${err instanceof Error ? err.message : 'unknown'}`);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
