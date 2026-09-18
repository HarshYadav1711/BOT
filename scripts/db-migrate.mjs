/**
 * Minimal PostgreSQL migration runner.
 * Usage: npm run db:migrate
 *
 * - Loads DATABASE_URL + DATABASE_SSL (and other keys) from .env when unset
 * - Applies db/migrations/*.sql in sorted order
 * - Tracks applied files in schema_migrations
 * - Never prints DATABASE_URL or credentials
 */

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { ROOT, buildPoolConfig, loadEnvFile } from './loadEnv.mjs';

const MIGRATIONS_DIR = path.join(ROOT, 'db', 'migrations');

function listMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: db/migrations`);
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, 'en'));
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query('SELECT id FROM schema_migrations ORDER BY id ASC');
  return new Set(result.rows.map((row) => row.id));
}

async function applyMigration(client, fileName) {
  const fullPath = path.join(MIGRATIONS_DIR, fileName);
  const sql = fs.readFileSync(fullPath, 'utf8');

  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [fileName]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function main() {
  loadEnvFile();

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    console.error('db:migrate failed: DATABASE_URL is not set.');
    console.error('Set DATABASE_URL in the environment or in a local .env file (not committed).');
    process.exit(1);
  }

  const files = listMigrationFiles();
  if (files.length === 0) {
    console.error('db:migrate failed: no .sql files found in db/migrations.');
    process.exit(1);
  }

  const pool = new pg.Pool(buildPoolConfig(connectionString));
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    let appliedCount = 0;
    let skippedCount = 0;

    for (const fileName of files) {
      if (applied.has(fileName)) {
        console.log(`skip  ${fileName} (already applied)`);
        skippedCount += 1;
        continue;
      }

      console.log(`apply ${fileName}`);
      await applyMigration(client, fileName);
      appliedCount += 1;
    }

    console.log(
      `db:migrate completed successfully (${appliedCount} applied, ${skippedCount} skipped).`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown migration error';
    console.error(`db:migrate failed: ${message}`);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
