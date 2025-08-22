'use client'

import { isFlagEnabled } from '@/src/core/flags'
import { UnifiedChatInterface } from './unified/UnifiedChatInterface'
import { ModernChatInterface } from './ModernChatInterface'

interface ChatInterfaceWrapperProps {
  messages?: any[]
  isLoading?: boolean
  sessionId?: string | null
  mode?: string
  onSendMessage?: (message: string) => void
  onClearMessages?: () => void
  onToolAction?: (action: any) => void
  className?: string
  stickyHeaderSlot?: React.ReactNode
  composerTopSlot?: React.ReactNode
}

export function ChatInterfaceWrapper(props: ChatInterfaceWrapperProps) {
  const useCleanChat = isFlagEnabled('use_clean_chat_api')
  const useModernDesign = isFlagEnabled('use_modern_design') ?? true // Default to modern
  
  if (useCleanChat && useModernDesign) {
    // Use the new modern chat interface
    return <ModernChatInterface mode="public" showModeToggle={true} />
  }
  
  if (useCleanChat) {
    // Use the clean chat demo (simpler version)
    const { CleanChatDemo } = require('./CleanChatDemo')
    return <CleanChatDemo />
  }
  
  // Use the legacy system
  return <UnifiedChatInterface {...props} />
}