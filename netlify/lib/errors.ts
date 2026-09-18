export type ErrorCode =
  | 'DUPLICATE_REGISTRATION'
  | 'INVALID_INPUT'
  | 'APPLICATION_ID_COLLISION'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, string>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 400,
    details?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/** Map unknown failures to a safe public HTTP body (no internals). */
export function toPublicErrorResponse(err: unknown): {
  statusCode: number;
  body: { error: { code: ErrorCode; message: string; details?: Record<string, string> } };
} {
  if (isAppError(err)) {
    return {
      statusCode: err.statusCode,
      body: {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
    };
  }

  console.error('[server] unexpected error', err instanceof Error ? err.message : 'unknown');

  return {
    statusCode: 500,
    body: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected server error occurred.',
      },
    },
  };
}

/** Detect PostgreSQL unique_violation (23505) without exposing SQL to clients. */
export function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === '23505'
  );
}

export function uniqueViolationConstraint(err: unknown): string | undefined {
  if (typeof err !== 'object' || err === null || !('constraint' in err)) return undefined;
  const constraint = (err as { constraint?: unknown }).constraint;
  return typeof constraint === 'string' ? constraint : undefined;
}
