'use client'

import { isFlagEnabled } from '@/src/core/flags'
import { UnifiedChatInterface } from './unified/UnifiedChatInterface'

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
  
  if (useCleanChat) {
    // Use the clean chat demo (for testing)
    const { CleanChatDemo } = require('./CleanChatDemo')
    return <CleanChatDemo />
  }
  
  // Use the modernized unified system (now with modern design)
  return <UnifiedChatInterface {...props} />
}