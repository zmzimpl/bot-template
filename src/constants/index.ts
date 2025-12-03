/**
 * Application Constants
 */

export const LOADER_FRAMES = ['-', '\\', '|', '/'] as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const API_CODES = {
  SUCCESS: 200,
  SUCCESS_ALT: 0,
  ERROR: -1,
} as const;
