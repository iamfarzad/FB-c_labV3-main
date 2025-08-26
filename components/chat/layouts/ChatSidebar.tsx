'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, Activity, Settings, BarChart3, User, Search, FileText, 
  Database, Check, Zap, MessageSquare, Image, Mic, Monitor, 
  Mail, AlertTriangle, Globe, Link, Eye, Star, Loader, Wrench 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/src/core/utils'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  timestamp: Date
}

interface ChatSidebarProps {
  sessionId?: string | null
  context?: any
  activityLog?: ActivityItem[]
  stages?: Array<{ id: string; label: string; done?: boolean; current?: boolean }>
  currentStage?: string
  stageProgress?: number
  className?: string
}

// VerticalProcessChainProps interface removed - replaced with RightStageRail

interface ActivityIconProps {
  type: string
  status: string
}

// TooltipProps interface removed - no longer needed with RightStageRail

// ============================================================================
// CONSTANTS
// ============================================================================

const ACTIVITY_ICONS = {
  user_action: User,
  ai_thinking: Brain,
  ai_stream: MessageSquare,
  ai_request: Zap,
  search: Search,
  doc_analysis: FileText,
  file_upload: FileText,
  image_upload: Image,
  voice_input: Mic,
  screen_share: Monitor,
  email_sent: Mail,
  error: AlertTriangle,
  web_scrape: Globe,
  link: Link,
  vision_analysis: Eye,
  database: Database,
  complete: Check,
  analyze: BarChart3,
  generate: Star,
  processing: Loader,
  tool_used: Wrench
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function useMobileDetection() {
  const isMobile = useRef(false)

  useEffect(() => {
    const checkMobile = () => {
      isMobile.current = window.innerWidth <= 640
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// ============================================================================
// COMPONENTS
// ============================================================================

function ActivityIcon({ type, status }: ActivityIconProps) {
  const IconComponent = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS] || AlertTriangle
  
  return (
    <IconComponent
      className={cn(
        'transition-colors duration-200',
        status === 'in_progress' 
          ? 'w-3 h-3 text-accent' 
          : 'w-2.5 h-2.5 text-muted-foreground'
      )}
    />
  )
}

// ActivityTooltip function removed - replaced with RightStageRail

// ActivityNode function removed - replaced with RightStageRail

// VerticalProcessChain function removed - replaced with RightStageRail from collab system

function ContextDisplay({ context }: { context: any }) {
  if (!context || Object.keys(context).length === 0) return null

  return (
    <Card variant="glass" className="border-border/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          Context Aware
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(context).slice(0, 4).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground capitalize">
              {key.replace(/_/g, ' ')}
            </span>
            <span className="text-foreground font-medium truncate ml-2 max-w-24">
              {typeof value === 'string' 
                ? value 
                : JSON.stringify(value).slice(0, 20)
              }
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ChatSidebar({
  sessionId,
  context,
  activityLog = [],
  stages,
  currentStage,
  stageProgress,
  className
}: ChatSidebarProps) {
  return (
    <div className={cn('h-full p-4 space-y-4 overflow-y-auto', className)}>
      {/* Context Display */}
      <ContextDisplay context={context} />

      {/* AI Activity Monitor */}
      {activityLog && activityLog.length > 0 && (
        <Card variant="glass" className="border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              AI Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activityLog.slice(-5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'failed' ? 'bg-red-500' :
                    activity.status === 'in_progress' ? 'bg-accent animate-pulse' :
                    'bg-muted-foreground/30'
                  )} />
                  <span className="text-muted-foreground truncate">
                    {activity.title}
                  </span>
                </div>
              ))}
              {activityLog.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage Progress */}
      {stages && stages.length > 0 && (
        <Card variant="glass" className="border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Conversation Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stages.map((stageItem, index) => (
                <div
                  key={stageItem.id}
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded-md transition-colors",
                    stageItem.current ? "bg-accent/10 border border-accent/20" :
                    stageItem.done ? "bg-green-50/50 border border-green-200/50" :
                    "hover:bg-muted/30"
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    stageItem.done ? 'bg-green-500' :
                    stageItem.current ? 'bg-accent' :
                    'bg-muted-foreground/30'
                  )} />
                  <span className={cn(
                    "truncate",
                    stageItem.current ? "text-accent font-medium" :
                    stageItem.done ? "text-green-700" :
                    "text-muted-foreground"
                  )}>
                    {stageItem.label}
                  </span>
                  {stageItem.current && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      Current
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            {stageProgress !== undefined && (
              <div className="mt-3 pt-2 border-t border-border/20">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{Math.round(stageProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-accent h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${stageProgress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ChatSidebar now properly displays activity and stage tracking using existing patterns