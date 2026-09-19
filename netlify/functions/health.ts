import type { Handler, HandlerResponse } from '@netlify/functions';
import {
  buildHealthFailureDiagnostics,
  checkDatabaseConnectivity,
} from '../lib/db';

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

/**
 * GET /.netlify/functions/health
 * Verifies process health and optional database connectivity.
 * Never exposes connection details, stack traces, or environment values
 * in the HTTP response. Safe diagnostics go to function logs only.
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false }),
    };
  }

  try {
    await checkDatabaseConnectivity();
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    // Private Netlify function logs only — never echo into the HTTP body.
    console.error(
      '[health] connectivity check failed',
      buildHealthFailureDiagnostics(err)
    );

    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false }),
    };
  }
};
