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

/**
 * Shared pg Pool SSL config.
 * DATABASE_SSL:
 *   unset / default → verify certificates (recommended for production)
 *   disable         → no TLS (local Postgres only)
 *   no-verify       → TLS without cert verification (explicit opt-in)
 */
export function buildPoolConfig(connectionString) {
  const sslMode = (process.env.DATABASE_SSL || '').trim().toLowerCase();
  const isLocal =
    sslMode === 'disable' ||
    /localhost|127\.0\.0\.1/i.test(connectionString);
  const allowNoVerify = sslMode === 'no-verify';

  return {
    connectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ...(isLocal
      ? {}
      : allowNoVerify
        ? { ssl: { rejectUnauthorized: false } }
        : { ssl: { rejectUnauthorized: true } }),
  };
}

export { ROOT };
