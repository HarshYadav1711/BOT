import type { Handler, HandlerResponse } from '@netlify/functions';
import { checkDatabaseConnectivity } from '../lib/db';
import { isAppError } from '../lib/errors';

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

/**
 * GET /.netlify/functions/health
 * Verifies process health and optional database connectivity.
 * Never exposes connection details, stack traces, or environment values.
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
    if (!isAppError(err)) {
      console.error('[health] connectivity check failed');
    }

    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false }),
    };
  }
};
