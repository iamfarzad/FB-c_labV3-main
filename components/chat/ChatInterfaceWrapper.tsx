'use client'

import { isFlagEnabled } from '@/src/core/flags'
import { UnifiedChatInterface } from './unified/UnifiedChatInterface'
import { CleanChatDemo } from './CleanChatDemo'

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
    // Use the new clean chat system
    return <CleanChatDemo />
  }
  
  // Use the legacy system
  return <UnifiedChatInterface {...props} />
}