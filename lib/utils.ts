import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export all utility modules
export * from "./utils/animations"
export * from "./utils/arrays"
export * from "./utils/date-time"
export * from "./utils/spacing"
export * from "./utils/strings"
export * from "./utils/validation"

// Re-export validation schemas for backward compatibility
export {
  chatRequestSchema,
  translationRequestSchema,
  leadCaptureSchema,
  meetingBookingSchema,
  adminAnalyticsSchema,
  emailCampaignSchema,
  leadResearchSchema,
  tokenUsageSchema,
  validateRequest
} from './utils/validation'
