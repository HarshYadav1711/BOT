/**
 * Shared .env loader for local DB/scripts.
 * Does not override variables already set in the process environment.
 * Never logs values.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function stripQuotes(value) {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

/**
 * Load KEY=VALUE pairs from project `.env` into process.env.
 * Existing non-empty process.env values win (CI / shell overrides).
 */
export function loadEnvFile(envFileName = '.env') {
  const envPath = path.join(ROOT, envFileName);
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key) continue;
    const value = stripQuotes(trimmed.slice(eq + 1));
    if (!(key in process.env) || !process.env[key]) {
      process.env[key] = value;
    }
  }
}

/** pg URL keys that can replace an explicit Pool `ssl` object. */
const PG_SSL_QUERY_PARAMS = ['sslmode', 'sslcert', 'sslkey', 'sslrootcert'];

/**
 * Remove only pg SSL query params so an explicit `ssl` config is not overridden.
 * Never logs the URL. On parse failure, returns the original string unchanged.
 * Kept in sync with netlify/lib/db.ts.
 */
export function stripPgSslQueryParams(connectionString) {
  try {
    const url = new URL(connectionString);
    let changed = false;
    for (const key of PG_SSL_QUERY_PARAMS) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    return changed ? url.toString() : connectionString;
  } catch {
    return connectionString;
  }
}

/**
 * Shared pg Pool SSL config (kept in sync with netlify/lib/db.ts).
 * DATABASE_SSL:
 *   unset / default → verify certificates (recommended for production)
 *   disable         → no TLS (local Postgres only)
 *   no-verify       → TLS without cert verification (explicit opt-in)
 *
 * When an explicit `ssl` object is set, URL SSL query params are stripped so
 * node-postgres cannot replace that object.
 */
export function buildPoolConfig(connectionString) {
  const sslMode = (process.env.DATABASE_SSL || '').trim().toLowerCase();
  const isLocal =
    sslMode === 'disable' ||
    /localhost|127\.0\.0\.1/i.test(connectionString);
  const allowNoVerify = sslMode === 'no-verify';

  if (isLocal) {
    return {
      connectionString,
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    };
  }

  const sanitizedConnectionString = stripPgSslQueryParams(connectionString);

  return {
    connectionString: sanitizedConnectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ...(allowNoVerify
      ? { ssl: { rejectUnauthorized: false } }
      : { ssl: { rejectUnauthorized: true } }),
  };
}

export { ROOT };
