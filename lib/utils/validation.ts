/**
 * Validation utilities
 * Consolidated from various scattered implementations across the codebase
 */

import { z } from 'zod';

/**
 * Generic validation function with consistent error handling
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * Check if value is null or undefined
 */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (isNil(value)) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if string is a valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Check if string is a valid URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is a valid phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  // Allow digits, spaces, hyphens, parentheses, and + at the beginning
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,15}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Check if string contains only numeric characters
 */
export function isNumeric(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^\d+$/.test(str);
}

/**
 * Check if value is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Check if array has unique values
 */
export function hasUniqueValues<T>(array: T[]): boolean {
  const set = new Set(array);
  return set.size === array.length;
}

/**
 * Check if object has required properties
 */
export function hasRequiredProps(obj: Record<string, unknown>, requiredProps: string[]): boolean {
  return requiredProps.every(prop => !isNil(obj[prop]));
}

/**
 * Validate file type against allowed types
 */
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  if (!filename || !allowedTypes.length) return false;
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSizeBytes: number): boolean {
  return size > 0 && size <= maxSizeBytes;
}

/**
 * Common validation schemas
 */

export const emailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters');

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .optional();

export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2048, 'URL must be less than 2048 characters');

export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const timeSchema = z.string()
  .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format');

export const alphanumericSchema = z.string()
  .regex(/^[a-zA-Z0-9]+$/, 'Must contain only letters and numbers');

export const positiveNumberSchema = z.number()
  .positive('Must be a positive number');

export const nonNegativeNumberSchema = z.number()
  .min(0, 'Must be non-negative');

/**
 * Business validation schemas
 */

export const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, 'Message content is required'),
    imageUrl: z.string().url().optional(),
  })).min(1, 'At least one message is required'),
  sessionId: z.string().optional(),
  enableLeadGeneration: z.boolean().optional(),
  leadContext: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
    industry: z.string().optional(),
  }).optional(),
});

export const translationRequestSchema = z.object({
  text: z.string().min(1, 'Text to translate is required'),
  sourceLang: z.string().min(2, 'Source language is required'),
  targetLang: z.string().min(2, 'Target language is required'),
  context: z.string().optional(),
});

export const leadCaptureSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: emailSchema,
  company: z.string().max(255).optional(),
  phone: phoneSchema,
  message: z.string().min(1, 'Message is required').max(1000),
  source: z.string().optional(),
  consent: z.boolean().optional(),
});

export const meetingBookingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: emailSchema,
  company: z.string().max(255).optional(),
  phone: phoneSchema,
  date: dateSchema,
  time: timeSchema,
  timezone: z.string().optional(),
  message: z.string().max(500).optional(),
});

export const adminAnalyticsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  metrics: z.array(z.enum(['leads', 'conversions', 'engagement', 'performance'])).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});

export const emailCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255),
  subject: z.string().min(1, 'Subject is required').max(255),
  content: z.string().min(1, 'Content is required'),
  recipients: z.array(emailSchema).min(1, 'At least one recipient is required'),
  scheduledDate: dateSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const leadResearchSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  companyUrl: urlSchema.optional(),
  researchType: z.enum(['basic', 'deep', 'comprehensive']).default('basic'),
  includeSocial: z.boolean().optional(),
  includeNews: z.boolean().optional(),
});

export const tokenUsageSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  userId: z.string().optional(),
  tokensUsed: positiveNumberSchema,
  model: z.string().min(1, 'Model is required'),
  operation: z.enum(['chat', 'translation', 'analysis', 'generation']),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
});

/**
 * Validation result type
 */
export type ValidationResult<T> = { success: true; data: T } | { success: false; errors: string[] };
