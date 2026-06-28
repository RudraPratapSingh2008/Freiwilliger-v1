import { describe, it, expect } from 'vitest';
import { phoneSchema, emailSchema, usernameSchema, otpSchema, passwordSchema } from '../../lib/validation';

describe('validation schemas', () => {
  describe('phoneSchema', () => {
    it('accepts valid 10-digit phone', () => {
      expect(phoneSchema.safeParse('9876543210').success).toBe(true);
    });

    it('accepts another valid 10-digit phone', () => {
      expect(phoneSchema.safeParse('7012345678').success).toBe(true);
    });

    it('rejects non-10-digit (too short)', () => {
      expect(phoneSchema.safeParse('123').success).toBe(false);
    });

    it('rejects non-10-digit (too long)', () => {
      expect(phoneSchema.safeParse('12345678901').success).toBe(false);
    });

    it('rejects letters', () => {
      expect(phoneSchema.safeParse('98765abcde').success).toBe(false);
    });

    it('rejects empty string', () => {
      expect(phoneSchema.safeParse('').success).toBe(false);
    });
  });

  describe('emailSchema', () => {
    it('accepts valid email', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
    });

    it('accepts email with subdomain', () => {
      expect(emailSchema.safeParse('user@mail.example.co.in').success).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(emailSchema.safeParse('notanemail').success).toBe(false);
    });

    it('rejects email without domain', () => {
      expect(emailSchema.safeParse('user@').success).toBe(false);
    });
  });

  describe('usernameSchema', () => {
    it('accepts valid username', () => {
      expect(usernameSchema.safeParse('john_doe').success).toBe(true);
    });

    it('accepts username with numbers', () => {
      expect(usernameSchema.safeParse('user123').success).toBe(true);
    });

    it('rejects uppercase letters', () => {
      expect(usernameSchema.safeParse('JohnDoe').success).toBe(false);
    });

    it('rejects too short (less than 3 chars)', () => {
      expect(usernameSchema.safeParse('ab').success).toBe(false);
    });

    it('rejects special characters', () => {
      expect(usernameSchema.safeParse('user@name').success).toBe(false);
    });

    it('rejects spaces', () => {
      expect(usernameSchema.safeParse('john doe').success).toBe(false);
    });
  });

  describe('otpSchema', () => {
    it('accepts 6-digit OTP', () => {
      expect(otpSchema.safeParse('123456').success).toBe(true);
    });

    it('rejects non-numeric OTP', () => {
      expect(otpSchema.safeParse('12345a').success).toBe(false);
    });

    it('rejects too short OTP', () => {
      expect(otpSchema.safeParse('12345').success).toBe(false);
    });

    it('rejects too long OTP', () => {
      expect(otpSchema.safeParse('1234567').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('accepts valid password (8+ chars)', () => {
      expect(passwordSchema.safeParse('securePass123').success).toBe(true);
    });

    it('rejects too short password', () => {
      expect(passwordSchema.safeParse('short').success).toBe(false);
    });

    it('accepts exactly 8 characters', () => {
      expect(passwordSchema.safeParse('12345678').success).toBe(true);
    });
  });
});
