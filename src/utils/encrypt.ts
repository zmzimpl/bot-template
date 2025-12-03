/**
 * Encryption Utilities
 * AES-256-CBC encryption and decryption
 */

import crypto from 'crypto';

/**
 * Pad a key to the required length
 * @param key - Key to pad
 * @param length - Required length
 */
const padKey = (key: string, length: number): string => {
  if (key.length >= length) {
    return key.slice(0, length);
  }
  return key.padEnd(length, '0');
};

/**
 * Encrypt text using AES-256-CBC
 * @param text - Text to encrypt
 * @param password1 - First part of the key
 * @param password2 - Second part of the key (also used as IV base)
 */
export const encrypt = (text: string, password1: string, password2: string): string => {
  const iv = padKey(password2, 16);
  const key = padKey(password1 + password2, 32);

  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key),
    Buffer.from(iv)
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString('hex');
};

/**
 * Decrypt text using AES-256-CBC
 * @param encryptedText - Encrypted text (hex string)
 * @param password1 - First part of the key
 * @param password2 - Second part of the key (also used as IV base)
 */
export const decrypt = (encryptedText: string, password1: string, password2: string): string => {
  const iv = padKey(password2, 16);
  const key = padKey(password1 + password2, 32);

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key),
    Buffer.from(iv)
  );

  let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

/**
 * Generate a random encryption key
 * @param length - Key length in bytes (default 32 for AES-256)
 */
export const generateKey = (length = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a string using SHA-256
 * @param text - Text to hash
 */
export const hash = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Compare a plain text with a hash (timing-safe)
 * @param text - Plain text
 * @param hashValue - Hash to compare with
 */
export const compareHash = (text: string, hashValue: string): boolean => {
  const textHash = hash(text);
  return crypto.timingSafeEqual(Buffer.from(textHash), Buffer.from(hashValue));
};
