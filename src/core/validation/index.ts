import { z } from 'zod'

// ============================================================================
// CHAT VALIDATION
// ============================================================================

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
  id: z.string().optional(),
  meta: z.record(z.unknown()).optional()
})

export const chatRequestSchema = z.object({
  version: z.literal(1),
  messages: z.array(chatMessageSchema).min(1).max(50)
})

// ============================================================================
// INTELLIGENCE VALIDATION  
// ============================================================================

export const leadCaptureSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  message: z.string().max(1000).optional(),
  source: z.string().default('chat'),
  sessionId: z.string().optional()
})

export const sessionInitSchema = z.object({
  sessionId: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  companyUrl: z.string().url().optional()
})

// ============================================================================
// ADMIN VALIDATION
// ============================================================================

export const leadStatusSchema = z.enum(['new', 'contacted', 'qualified', 'converted'])

export const leadUpdateSchema = z.object({
  status: leadStatusSchema,
  notes: z.string().optional(),
  assigned_to: z.string().optional()
})

export const adminSearchSchema = z.object({
  query: z.string().min(1),
  filters: z.record(z.any()).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
})

// ============================================================================
// FILE UPLOAD VALIDATION
// ============================================================================

export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB
  allowedTypes: z.array(z.string()).default(['image/*', 'application/pdf', 'text/*'])
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-\(\)\s]/g, '').trim()
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type ChatRequest = z.infer<typeof chatRequestSchema>
export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>
export type SessionInitInput = z.infer<typeof sessionInitSchema>
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>
export type AdminSearchInput = z.infer<typeof adminSearchSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>