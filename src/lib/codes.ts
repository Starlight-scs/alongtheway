import crypto from 'crypto';

// Alphabet without confusing characters (0/O, 1/I)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a unique, URL-safe access code
 * @param length - Length of the code (default: 8)
 * @returns A random alphanumeric code
 */
export function generateAccessCode(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }

  return code;
}

/**
 * Normalize a code for comparison (uppercase, trim whitespace)
 * @param code - The code to normalize
 * @returns Normalized code
 */
export function normalizeCode(code: string): string {
  return code.toUpperCase().trim().replace(/\s/g, '');
}
