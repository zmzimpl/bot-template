/**
 * Object Property Utilities
 * Get nested object properties by string path
 */

/**
 * Get a nested property from an object using a string path
 * Supports array indices in bracket notation (e.g., "a.b[0].c")
 * @param obj - Object to get property from
 * @param path - Property path (e.g., "a.b.c" or "a.b[0].c")
 */
export const getPropByStringPath = <T = unknown>(
  obj: Record<string, unknown>,
  path: string
): T | undefined => {
  const parts = path.split('.');
  let current: unknown = obj;

  for (let i = 0; i < parts.length; i++) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }

    // Check if the current part is an array index
    const arrayMatch = parts[i].match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const arrayName = arrayMatch[1];
      const index = parseInt(arrayMatch[2], 10);
      const currentObj = current as Record<string, unknown>;

      if (
        Array.isArray(currentObj[arrayName]) &&
        index < (currentObj[arrayName] as unknown[]).length
      ) {
        current = (currentObj[arrayName] as unknown[])[index];
      } else {
        return undefined;
      }
    } else {
      current = (current as Record<string, unknown>)[parts[i]];
    }
  }

  return current as T;
};

/**
 * Set a nested property on an object using a string path
 * @param obj - Object to set property on
 * @param path - Property path
 * @param value - Value to set
 */
export const setPropByStringPath = <T>(
  obj: Record<string, unknown>,
  path: string,
  value: T
): void => {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const arrayMatch = part.match(/(\w+)\[(\d+)\]/);

    if (arrayMatch) {
      const arrayName = arrayMatch[1];
      const index = parseInt(arrayMatch[2], 10);

      if (!Array.isArray(current[arrayName])) {
        current[arrayName] = [];
      }

      const arr = current[arrayName] as unknown[];
      if (typeof arr[index] !== 'object' || arr[index] === null) {
        arr[index] = {};
      }
      current = arr[index] as Record<string, unknown>;
    } else {
      if (typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }
  }

  const lastPart = parts[parts.length - 1];
  const arrayMatch = lastPart.match(/(\w+)\[(\d+)\]/);

  if (arrayMatch) {
    const arrayName = arrayMatch[1];
    const index = parseInt(arrayMatch[2], 10);

    if (!Array.isArray(current[arrayName])) {
      current[arrayName] = [];
    }
    (current[arrayName] as unknown[])[index] = value;
  } else {
    current[lastPart] = value;
  }
};

/**
 * Check if an object has a property at the given path
 * @param obj - Object to check
 * @param path - Property path
 */
export const hasPropByStringPath = (
  obj: Record<string, unknown>,
  path: string
): boolean => {
  return getPropByStringPath(obj, path) !== undefined;
};
