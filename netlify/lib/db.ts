import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';
import { AppError, isAppError } from './errors';

declare global {
  // Reuse the pool across warm Netlify Function invocations.
  var __ucerPgPool: Pool | undefined;
}

/** pg URL keys that can replace an explicit Pool `ssl` object. */
const PG_SSL_QUERY_PARAMS = ['sslmode', 'sslcert', 'sslkey', 'sslrootcert'] as const;

/**
 * Remove only pg SSL query params so an explicit `ssl` config is not overridden.
 * Never logs the URL. On parse failure, returns the original string unchanged.
 */
export function stripPgSslQueryParams(connectionString: string): string {
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

export function connectionStringHasSslMode(connectionString: string): boolean {
  try {
    return new URL(connectionString).searchParams.has('sslmode');
  } catch {
    return false;
  }
}

export function getDatabaseSslModeLabel(): 'no-verify' | 'verify' | 'unset' {
  const sslMode = (process.env.DATABASE_SSL || '').trim().toLowerCase();
  if (!sslMode) return 'unset';
  if (sslMode === 'no-verify') return 'no-verify';
  return 'verify';
}

function buildPoolConfig(connectionString: string): PoolConfig {
  const sslMode = (process.env.DATABASE_SSL || '').trim().toLowerCase();
  const isLocal =
    sslMode === 'disable' ||
    /localhost|127\.0\.0\.1/i.test(connectionString);

  /** Explicit opt-in only — never the default. */
  const allowNoVerify = sslMode === 'no-verify';

  if (isLocal) {
    return {
      connectionString,
      // Serverless-friendly: small pool reused on warm isolates.
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    };
  }

  // Explicit SSL object — strip URL SSL params so node-postgres cannot replace it.
  const sanitizedConnectionString = stripPgSslQueryParams(connectionString);

  return {
    connectionString: sanitizedConnectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ...(allowNoVerify
      ? { ssl: { rejectUnauthorized: false } }
      : {
          // Keep certificate validation enabled by default.
          ssl: { rejectUnauthorized: true },
        }),
  };
}

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !connectionString.trim()) {
    throw new AppError(
      'INTERNAL_ERROR',
      'Database is not configured.',
      500
    );
  }

  if (!globalThis.__ucerPgPool) {
    globalThis.__ucerPgPool = new Pool(buildPoolConfig(connectionString.trim()));
  }

  return globalThis.__ucerPgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}

export async function checkDatabaseConnectivity(): Promise<boolean> {
  const result = await query<{ ok: number }>('SELECT 1 AS ok');
  return result.rows[0]?.ok === 1;
}

export type HealthErrorCategory =
  | 'TLS'
  | 'AUTH'
  | 'DNS'
  | 'REFUSED'
  | 'TIMEOUT'
  | 'CONFIG'
  | 'UNKNOWN';

export type HealthFailureDiagnostics = {
  databaseUrlConfigured: boolean;
  databaseSslMode: 'no-verify' | 'verify' | 'unset';
  urlContainsSslMode: boolean;
  errorName?: string;
  errorCode?: string;
  errorCategory: HealthErrorCategory;
  errorMessage?: string;
};

function readErrorCode(err: unknown): string | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const record = err as { code?: unknown; errno?: unknown };
  if (typeof record.code === 'string' || typeof record.code === 'number') {
    return String(record.code);
  }
  if (typeof record.errno === 'string' || typeof record.errno === 'number') {
    return String(record.errno);
  }
  return undefined;
}

function readErrorName(err: unknown): string | undefined {
  if (err instanceof Error && err.name) return err.name;
  return undefined;
}

function readErrorMessage(err: unknown): string | undefined {
  if (err instanceof Error && err.message) return err.message;
  return undefined;
}

/**
 * Allow a short message in private logs only when it cannot leak connection data.
 */
export function sanitizeDiagnosticMessage(message: string | undefined): string | undefined {
  if (!message) return undefined;
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 180) return undefined;
  if (/:\/\//.test(trimmed)) return undefined;
  if (/postgres(ql)?\s*:/i.test(trimmed)) return undefined;
  if (/password/i.test(trimmed)) return undefined;
  if (/@/.test(trimmed)) return undefined;
  if (/\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(trimmed)) return undefined;
  // Likely hostname / FQDN leakage (e.g. ENOTFOUND db.example.com).
  if (/\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\b/i.test(trimmed)) return undefined;
  return trimmed;
}

export function categorizeDatabaseError(err: unknown): HealthErrorCategory {
  if (isAppError(err) && err.message === 'Database is not configured.') {
    return 'CONFIG';
  }

  const code = (readErrorCode(err) || '').toUpperCase();
  const message = (readErrorMessage(err) || '').toLowerCase();

  if (code === '28P01' || message.includes('authentication failed')) {
    return 'AUTH';
  }
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    return 'DNS';
  }
  if (code === 'ECONNREFUSED') {
    return 'REFUSED';
  }
  if (
    code === 'ETIMEDOUT' ||
    code === 'ETIMEOUT' ||
    message.includes('timeout') ||
    message.includes('timed out')
  ) {
    return 'TIMEOUT';
  }
  if (
    code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
    code === 'CERT_HAS_EXPIRED' ||
    code === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
    /self[-\s]?signed|certificate|unable to verify|ssl alert|tls/i.test(message)
  ) {
    return 'TLS';
  }

  return 'UNKNOWN';
}

/** Safe fields for Netlify function logs only — never for HTTP bodies. */
export function buildHealthFailureDiagnostics(err: unknown): HealthFailureDiagnostics {
  const rawUrl = process.env.DATABASE_URL;
  const configured = Boolean(rawUrl && rawUrl.trim());
  const urlContainsSslMode = configured
    ? connectionStringHasSslMode(rawUrl!.trim())
    : false;

  const errorCategory = !configured
    ? 'CONFIG'
    : categorizeDatabaseError(err);

  const errorName = readErrorName(err);
  const errorCode = readErrorCode(err);
  const errorMessage = sanitizeDiagnosticMessage(readErrorMessage(err));

  return {
    databaseUrlConfigured: configured,
    databaseSslMode: getDatabaseSslModeLabel(),
    urlContainsSslMode,
    ...(errorName ? { errorName } : {}),
    ...(errorCode ? { errorCode } : {}),
    errorCategory,
    ...(errorMessage ? { errorMessage } : {}),
  };
}
