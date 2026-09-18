import { query } from './db';
import { AppError } from './errors';
import { hashPassword, verifyPasswordOrDummy } from './password';
import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiryDate,
} from './session';

export interface AdminUserRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface AdminSessionInfo {
  adminUserId: string;
  username: string;
  sessionId: string;
  expiresAt: string;
}

export interface AdminLoginResult {
  token: string;
  expiresAt: string;
  username: string;
}

function normalizeUsername(username: string): string {
  return username.trim();
}

/**
 * If no admin users exist, create the initial admin from env:
 * ADMIN_INITIAL_USERNAME / ADMIN_INITIAL_PASSWORD
 *
 * Never logs the password. Never returns the password hash.
 */
export async function ensureInitialAdmin(): Promise<void> {
  const countResult = await query<{ c: number }>(
    'SELECT COUNT(*)::int AS c FROM admin_users'
  );
  const count = countResult.rows[0]?.c ?? 0;
  if (count > 0) return;

  const username = process.env.ADMIN_INITIAL_USERNAME?.trim();
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!username || typeof password !== 'string' || password.length === 0) {
    throw new AppError(
      'INTERNAL_ERROR',
      'Admin bootstrap is not configured.',
      500
    );
  }

  const passwordHash = await hashPassword(password);
  await query(
    `
    INSERT INTO admin_users (username, password_hash)
    VALUES ($1, $2)
    ON CONFLICT (username) DO NOTHING
    `,
    [username, passwordHash]
  );
}

export async function authenticateAdmin(
  usernameRaw: unknown,
  passwordRaw: unknown
): Promise<AdminLoginResult> {
  if (typeof usernameRaw !== 'string' || typeof passwordRaw !== 'string') {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid username or password.', 401);
  }

  const username = normalizeUsername(usernameRaw);
  const password = passwordRaw;

  if (!username || !password) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid username or password.', 401);
  }

  await ensureInitialAdmin();

  const userResult = await query<AdminUserRow>(
    `
    SELECT id, username, password_hash, created_at, updated_at
    FROM admin_users
    WHERE username = $1
    LIMIT 1
    `,
    [username]
  );

  const user = userResult.rows[0];
  const ok = await verifyPasswordOrDummy(password, user?.password_hash);
  if (!user || !ok) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid username or password.', 401);
  }

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = sessionExpiryDate();

  await query(
    `
    INSERT INTO admin_sessions (admin_user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
    `,
    [user.id, tokenHash, expiresAt.toISOString()]
  );

  return {
    token,
    expiresAt: expiresAt.toISOString(),
    username: user.username,
  };
}

export async function resolveAdminSession(
  rawToken: string | null
): Promise<AdminSessionInfo> {
  if (!rawToken) {
    throw new AppError('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const tokenHash = hashSessionToken(rawToken);
  const result = await query<{
    session_id: string;
    admin_user_id: string;
    username: string;
    expires_at: Date | string;
  }>(
    `
    SELECT
      s.id AS session_id,
      s.admin_user_id,
      u.username,
      s.expires_at
    FROM admin_sessions s
    INNER JOIN admin_users u ON u.id = s.admin_user_id
    WHERE s.token_hash = $1
    LIMIT 1
    `,
    [tokenHash]
  );

  const row = result.rows[0];
  if (!row) {
    throw new AppError('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const expiresAt =
    row.expires_at instanceof Date
      ? row.expires_at
      : new Date(String(row.expires_at));

  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    await query('DELETE FROM admin_sessions WHERE id = $1', [row.session_id]);
    throw new AppError('UNAUTHORIZED', 'Session expired.', 401);
  }

  await query(
    `UPDATE admin_sessions SET last_used_at = NOW() WHERE id = $1`,
    [row.session_id]
  );

  return {
    adminUserId: row.admin_user_id,
    username: row.username,
    sessionId: row.session_id,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function revokeAdminSession(rawToken: string | null): Promise<void> {
  if (!rawToken) {
    throw new AppError('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const tokenHash = hashSessionToken(rawToken);
  await query('DELETE FROM admin_sessions WHERE token_hash = $1', [tokenHash]);
}

/**
 * Update admin credentials (for future protected API use).
 * Does not change the default bootstrap identity unless called with new values.
 */
export async function updateAdminCredentials(
  adminUserId: string,
  newUsername: string,
  newPassword: string
): Promise<{ username: string }> {
  const username = normalizeUsername(newUsername);
  if (!username || newPassword.trim().length < 6) {
    throw new AppError('INVALID_INPUT', 'Username and password (min 6 characters) are required.', 400);
  }

  const passwordHash = await hashPassword(newPassword);
  try {
    const result = await query<{ username: string }>(
      `
      UPDATE admin_users
      SET
        username = $2,
        password_hash = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING username
      `,
      [adminUserId, username, passwordHash]
    );
    const row = result.rows[0];
    if (!row) {
      throw new AppError('NOT_FOUND', 'Admin user not found.', 404);
    }
    // Invalidate other sessions for this admin after credential change.
    await query('DELETE FROM admin_sessions WHERE admin_user_id = $1', [adminUserId]);
    return { username: row.username };
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === '23505'
    ) {
      throw new AppError('INVALID_INPUT', 'Username is already taken.', 409);
    }
    throw err;
  }
}
