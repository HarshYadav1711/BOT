import bcrypt from 'bcryptjs';
import { AppError } from './errors';

/** Work factor suitable for serverless Node (bcryptjs, pure JS). */
const BCRYPT_ROUNDS = 12;

/** Dummy hash for timing-safe failed lookups (never a real admin password). */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('__ucer_dummy_password__', BCRYPT_ROUNDS);

export async function hashPassword(plaintext: string): Promise<string> {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new AppError('INVALID_INPUT', 'Password is required.', 400);
  }
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plaintext: string,
  passwordHash: string
): Promise<boolean> {
  if (typeof plaintext !== 'string' || typeof passwordHash !== 'string') {
    return false;
  }
  try {
    return await bcrypt.compare(plaintext, passwordHash);
  } catch {
    return false;
  }
}

/** Compare against a dummy hash when the user row is missing (mitigate timing leaks). */
export async function verifyPasswordOrDummy(
  plaintext: string,
  passwordHash: string | null | undefined
): Promise<boolean> {
  if (passwordHash) {
    return verifyPassword(plaintext, passwordHash);
  }
  await verifyPassword(plaintext, DUMMY_PASSWORD_HASH);
  return false;
}
