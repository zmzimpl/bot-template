/**
 * Directory Utilities
 * Get paths relative to project root
 */

import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Get absolute path to a file in the project root
 * @param file - Relative file path
 */
export const getDir = (file: string): string => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, '../..', file);
};

/**
 * Get the project root directory
 */
export const getRootDir = (): string => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, '../..');
};

/**
 * Get the current directory of the calling file
 */
export const getCurrentDir = (): string => {
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
};
