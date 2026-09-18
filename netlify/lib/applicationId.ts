import { CURRENT_RECRUITMENT_YEAR, type YearType } from './types';

const MAX_APPLICATION_ID_ATTEMPTS = 64;

/** Preserve the existing public application-ID format. */
export function buildApplicationIdCandidate(year: YearType): string {
  const prefix = year === '2nd Year' ? 'V' : 'H';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ENIGMA-${CURRENT_RECRUITMENT_YEAR}-${prefix}${randomNum}`;
}

export function getMaxApplicationIdAttempts(): number {
  return MAX_APPLICATION_ID_ATTEMPTS;
}
