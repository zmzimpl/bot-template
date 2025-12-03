/**
 * Validator Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  z,
  validate,
  validateOrThrow,
  validateSafe,
  createValidator,
  emailSchema,
  urlSchema,
  nonEmptyString,
  positiveNumber,
  ethAddressSchema,
  hexStringSchema,
  portSchema,
  loginSchema,
  registerSchema,
  paginationSchema,
  apiResponseSchema,
  paginatedResponseSchema,
} from '../../src/utils/validator.js';

describe('validator utilities', () => {
  describe('validate', () => {
    it('should return success for valid data', () => {
      const schema = z.object({ name: z.string() });
      const result = validate(schema, { name: 'test' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'test' });
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const schema = z.object({ name: z.string() });
      const result = validate(schema, { name: 123 });

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should include path in errors', () => {
      const schema = z.object({ user: z.object({ email: z.string().email() }) });
      const result = validate(schema, { user: { email: 'invalid' } });

      expect(result.success).toBe(false);
      expect(result.errors![0].path).toBe('user.email');
    });
  });

  describe('validateOrThrow', () => {
    it('should return data for valid input', () => {
      const schema = z.object({ id: z.number() });
      const result = validateOrThrow(schema, { id: 1 });

      expect(result).toEqual({ id: 1 });
    });

    it('should throw for invalid input', () => {
      const schema = z.object({ id: z.number() });

      expect(() => validateOrThrow(schema, { id: 'not a number' })).toThrow();
    });
  });

  describe('validateSafe', () => {
    it('should return data for valid input', () => {
      const schema = z.string();
      const result = validateSafe(schema, 'hello');

      expect(result).toBe('hello');
    });

    it('should return undefined for invalid input', () => {
      const schema = z.number();
      const result = validateSafe(schema, 'not a number');

      expect(result).toBeUndefined();
    });
  });

  describe('createValidator', () => {
    it('should create a validator with all methods', () => {
      const schema = z.object({ value: z.number() });
      const validator = createValidator(schema);

      expect(validator.validate).toBeInstanceOf(Function);
      expect(validator.validateOrThrow).toBeInstanceOf(Function);
      expect(validator.validateSafe).toBeInstanceOf(Function);
      expect(validator.isValid).toBeInstanceOf(Function);
    });

    it('should validate correctly', () => {
      const schema = z.object({ value: z.number() });
      const validator = createValidator(schema);

      expect(validator.isValid({ value: 1 })).toBe(true);
      expect(validator.isValid({ value: 'x' })).toBe(false);
    });
  });

  describe('common schemas', () => {
    describe('emailSchema', () => {
      it('should validate correct emails', () => {
        expect(emailSchema.safeParse('test@example.com').success).toBe(true);
        expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true);
      });

      it('should reject invalid emails', () => {
        expect(emailSchema.safeParse('invalid').success).toBe(false);
        expect(emailSchema.safeParse('missing@').success).toBe(false);
        expect(emailSchema.safeParse('@nodomain.com').success).toBe(false);
      });
    });

    describe('urlSchema', () => {
      it('should validate correct URLs', () => {
        expect(urlSchema.safeParse('https://example.com').success).toBe(true);
        expect(urlSchema.safeParse('http://localhost:3000').success).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(urlSchema.safeParse('not-a-url').success).toBe(false);
        expect(urlSchema.safeParse('ftp://incomplete').success).toBe(true); // FTP is valid URL
      });
    });

    describe('nonEmptyString', () => {
      it('should accept non-empty strings', () => {
        expect(nonEmptyString.safeParse('hello').success).toBe(true);
        expect(nonEmptyString.safeParse('a').success).toBe(true);
      });

      it('should reject empty strings', () => {
        expect(nonEmptyString.safeParse('').success).toBe(false);
      });
    });

    describe('positiveNumber', () => {
      it('should accept positive numbers', () => {
        expect(positiveNumber.safeParse(1).success).toBe(true);
        expect(positiveNumber.safeParse(0.001).success).toBe(true);
      });

      it('should reject non-positive numbers', () => {
        expect(positiveNumber.safeParse(0).success).toBe(false);
        expect(positiveNumber.safeParse(-1).success).toBe(false);
      });
    });

    describe('portSchema', () => {
      it('should accept valid ports', () => {
        expect(portSchema.safeParse(80).success).toBe(true);
        expect(portSchema.safeParse(443).success).toBe(true);
        expect(portSchema.safeParse(65535).success).toBe(true);
      });

      it('should reject invalid ports', () => {
        expect(portSchema.safeParse(0).success).toBe(false);
        expect(portSchema.safeParse(65536).success).toBe(false);
        expect(portSchema.safeParse(-1).success).toBe(false);
      });
    });

    describe('ethAddressSchema', () => {
      it('should accept valid Ethereum addresses', () => {
        expect(
          ethAddressSchema.safeParse('0x742d35Cc6634C0532925a3b844Bc9e7595f4e2E1').success
        ).toBe(true);
      });

      it('should reject invalid Ethereum addresses', () => {
        expect(ethAddressSchema.safeParse('0x123').success).toBe(false);
        expect(ethAddressSchema.safeParse('not-an-address').success).toBe(false);
      });
    });

    describe('hexStringSchema', () => {
      it('should accept valid hex strings', () => {
        expect(hexStringSchema.safeParse('0x').success).toBe(true);
        expect(hexStringSchema.safeParse('0xabcdef123').success).toBe(true);
        expect(hexStringSchema.safeParse('0xABCDEF').success).toBe(true);
      });

      it('should reject invalid hex strings', () => {
        expect(hexStringSchema.safeParse('abcdef').success).toBe(false);
        expect(hexStringSchema.safeParse('0xGHIJ').success).toBe(false);
      });
    });
  });

  describe('request schemas', () => {
    describe('loginSchema', () => {
      it('should validate correct login data', () => {
        const result = loginSchema.safeParse({
          username: 'testuser',
          password: 'password123',
        });
        expect(result.success).toBe(true);
      });

      it('should reject short passwords', () => {
        const result = loginSchema.safeParse({
          username: 'testuser',
          password: '12345',
        });
        expect(result.success).toBe(false);
      });

      it('should reject empty username', () => {
        const result = loginSchema.safeParse({
          username: '',
          password: 'password123',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('registerSchema', () => {
      it('should validate correct registration data', () => {
        const result = registerSchema.safeParse({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });
        expect(result.success).toBe(true);
      });

      it('should reject mismatched passwords', () => {
        const result = registerSchema.safeParse({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'different',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('paginationSchema', () => {
      it('should use defaults', () => {
        const result = paginationSchema.parse({});
        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(20);
      });

      it('should accept valid pagination', () => {
        const result = paginationSchema.parse({ page: 5, pageSize: 50 });
        expect(result.page).toBe(5);
        expect(result.pageSize).toBe(50);
      });

      it('should reject invalid page size', () => {
        expect(paginationSchema.safeParse({ pageSize: 200 }).success).toBe(false);
      });
    });
  });

  describe('response schemas', () => {
    describe('apiResponseSchema', () => {
      it('should validate API response', () => {
        const schema = apiResponseSchema(z.object({ id: z.number() }));
        const result = schema.safeParse({
          code: 200,
          message: 'Success',
          data: { id: 1 },
        });
        expect(result.success).toBe(true);
      });
    });

    describe('paginatedResponseSchema', () => {
      it('should validate paginated response', () => {
        const schema = paginatedResponseSchema(z.object({ name: z.string() }));
        const result = schema.safeParse({
          items: [{ name: 'item1' }, { name: 'item2' }],
          total: 100,
          page: 1,
          pageSize: 20,
          totalPages: 5,
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
