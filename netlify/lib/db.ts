import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';
import { AppError } from './errors';

declare global {
  // Reuse the pool across warm Netlify Function invocations.
  var __ucerPgPool: Pool | undefined;
}

function buildPoolConfig(connectionString: string): PoolConfig {
  const isLocal =
    /localhost|127\.0\.0\.1/i.test(connectionString) ||
    process.env.DATABASE_SSL === 'disable';

  return {
    connectionString,
    // Serverless-friendly: small pool reused on warm isolates.
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ...(isLocal
      ? {}
      : {
          // Keep certificate validation enabled (do not set rejectUnauthorized: false).
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
