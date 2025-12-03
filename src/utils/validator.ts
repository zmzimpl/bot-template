/**
 * Validation Utility
 * Schema validation using zod
 */

import { z, ZodError, ZodSchema, ZodType } from 'zod';

// Re-export zod for convenience
export { z, ZodError, ZodSchema };

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

/**
 * Validate data against a schema
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      };
    }
    throw error;
  }
}

/**
 * Validate data and throw on error
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validate data safely (returns undefined on error)
 */
export function validateSafe<T>(
  schema: ZodSchema<T>,
  data: unknown
): T | undefined {
  const result = schema.safeParse(data);
  return result.success ? result.data : undefined;
}

/**
 * Create a validator function for a schema
 */
export function createValidator<T>(schema: ZodSchema<T>) {
  return {
    validate: (data: unknown) => validate(schema, data),
    validateOrThrow: (data: unknown) => validateOrThrow(schema, data),
    validateSafe: (data: unknown) => validateSafe(schema, data),
    isValid: (data: unknown) => schema.safeParse(data).success,
  };
}

/**
 * Async validation for schemas with async refinements
 */
export async function validateAsync<T>(
  schema: ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const result = await schema.parseAsync(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      };
    }
    throw error;
  }
}

// ============================================
// Common Schema Builders
// ============================================

/**
 * Create an optional schema with default value
 */
export function withDefault<T extends ZodType>(
  schema: T,
  defaultValue: z.output<T>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return schema.default(defaultValue as any);
}

/**
 * Create a nullable schema
 */
export function nullable<T extends ZodType>(schema: T) {
  return schema.nullable();
}

/**
 * Create a schema that coerces to string
 */
export const coerceString = z.coerce.string();

/**
 * Create a schema that coerces to number
 */
export const coerceNumber = z.coerce.number();

/**
 * Create a schema that coerces to boolean
 */
export const coerceBoolean = z.coerce.boolean();

// ============================================
// Common Validators
// ============================================

/**
 * Email validator
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * URL validator
 */
export const urlSchema = z.string().url('Invalid URL');

/**
 * UUID validator
 */
export const uuidSchema = z.string().uuid('Invalid UUID');

/**
 * Non-empty string validator
 */
export const nonEmptyString = z.string().min(1, 'String cannot be empty');

/**
 * Positive number validator
 */
export const positiveNumber = z.number().positive('Must be a positive number');

/**
 * Non-negative number validator
 */
export const nonNegativeNumber = z.number().nonnegative('Must be non-negative');

/**
 * Integer validator
 */
export const integerSchema = z.number().int('Must be an integer');

/**
 * Port number validator (1-65535)
 */
export const portSchema = z
  .number()
  .int()
  .min(1)
  .max(65535, 'Invalid port number');

/**
 * Ethereum address validator
 */
export const ethAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

/**
 * Hex string validator
 */
export const hexStringSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]*$/, 'Invalid hex string');

/**
 * Date string validator (ISO format)
 */
export const isoDateSchema = z.string().datetime('Invalid ISO date string');

/**
 * Unix timestamp validator (seconds)
 */
export const unixTimestampSchema = z
  .number()
  .int()
  .positive('Invalid Unix timestamp');

// ============================================
// Environment Variable Validators
// ============================================

/**
 * Create env var schema with validation
 */
export function createEnvSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

/**
 * Validate environment variables
 */
export function validateEnv<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  env: NodeJS.ProcessEnv = process.env
): z.infer<z.ZodObject<T>> {
  const result = schema.safeParse(env);

  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return result.data;
}

/**
 * Optional env string with default
 */
export function envString(defaultValue?: string) {
  return defaultValue !== undefined
    ? z.string().default(defaultValue)
    : z.string();
}

/**
 * Optional env number with default
 */
export function envNumber(defaultValue?: number) {
  if (defaultValue !== undefined) {
    return z
      .string()
      .default(String(defaultValue))
      .transform((val) => {
        const num = Number(val);
        if (isNaN(num)) throw new Error('Invalid number');
        return num;
      });
  }
  return z.string().transform((val) => {
    const num = Number(val);
    if (isNaN(num)) throw new Error('Invalid number');
    return num;
  });
}

/**
 * Optional env boolean with default
 */
export function envBoolean(defaultValue?: boolean) {
  if (defaultValue !== undefined) {
    return z
      .string()
      .default(defaultValue ? 'true' : 'false')
      .transform((val) => {
        return val.toLowerCase() === 'true' || val === '1';
      });
  }
  return z.string().transform((val) => {
    return val.toLowerCase() === 'true' || val === '1';
  });
}

/**
 * Env enum with allowed values
 */
export function envEnum<T extends string>(
  values: readonly [T, ...T[]],
  defaultValue?: T
) {
  const base = z.enum(values);
  return defaultValue !== undefined ? base.default(defaultValue) : base;
}

// ============================================
// API Response Validators
// ============================================

/**
 * Create API response schema
 */
export function apiResponseSchema<T extends ZodType>(dataSchema: T) {
  return z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema,
  });
}

/**
 * Create paginated response schema
 */
export function paginatedResponseSchema<T extends ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });
}

/**
 * Pagination params schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// ============================================
// Request Body Validators
// ============================================

/**
 * Login request schema
 */
export const loginSchema = z.object({
  username: nonEmptyString,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Register request schema
 */
export const registerSchema = z
  .object({
    username: z.string().min(3).max(50),
    email: emailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================
// Type Inference Helpers
// ============================================

/**
 * Infer the type from a schema
 */
export type Infer<T extends ZodSchema> = z.infer<T>;

/**
 * Infer input type (before transforms)
 */
export type InferInput<T extends ZodSchema> = z.input<T>;

/**
 * Infer output type (after transforms)
 */
export type InferOutput<T extends ZodSchema> = z.output<T>;
