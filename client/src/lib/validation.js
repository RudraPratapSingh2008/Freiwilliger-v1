import { z } from 'zod';

export const phoneSchema = z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits');
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores');
export const otpSchema = z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric');

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const reportSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

export const eventBasicsSchema = z.object({
  eventName: z.string().min(1, 'Event name is required').max(120),
  description: z.string().min(1, 'Description is required').max(2000),
  category: z.string().min(1, 'Category is required'),
});

export const reviewSchema = z.object({
  stars: z.number().min(1, 'Rating is required').max(5),
  text: z.string().optional(),
});
