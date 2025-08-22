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

interface VerticalProcessChainProps {
  activities: Array<{
    id: string
    type: string
    title: string
    description: string
    status: string
  }>
  className?: string
}

interface ActivityIconProps {
  type: string
  status: string
}

interface TooltipProps {
  activity: {
    id: string
    title: string
    description: string
    status: string
  }
  isVisible: boolean
  isMobile: boolean
}

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

function ActivityTooltip({ activity, isVisible, isMobile }: TooltipProps) {
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'in_progress':
        return 'bg-accent/10 text-accent border-accent/20'
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      default:
        return 'bg-muted/50 text-muted-foreground border-muted-foreground/30'
    }
  }

  return (
    <div
      className={cn(
        'absolute z-50 pointer-events-none opacity-0 transition-all duration-200 ease-out',
        'bg-card/95 backdrop-blur-sm border border-border/50 text-foreground rounded-lg shadow-lg',
        'min-w-56 max-w-72 p-3',
        isVisible && 'opacity-100 pointer-events-auto',
        isMobile
          ? 'left-1/2 top-full -translate-x-1/2 translate-y-2 origin-top-center scale-95'
          : 'right-16 top-1/2 -translate-y-1/2 translate-x-2 scale-95'
      )}
    >
      <div className="space-y-2">
        <div className="text-sm font-medium">{activity.title}</div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {activity.description}
        </p>
        <Badge
          variant="secondary"
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            getStatusBadgeStyle(activity.status)
          )}
        >
          {activity.status.replace('_', ' ')}
        </Badge>
      </div>
      
      {!isMobile && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-card/95" />
      )}
    </div>
  )
}

function ActivityNode({ 
  activity, 
  isLast, 
  onMouseEnter, 
  onMouseLeave, 
  onClick 
}: {
  activity: VerticalProcessChainProps['activities'][0]
  isLast: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}) {
  const getNodeStyle = (status: string) => {
    const baseStyle = 'relative grid place-items-center rounded-full transition-all duration-200 border bg-card/50 backdrop-blur-sm group-hover:scale-105 group-hover:border-muted-foreground/50 group-hover:bg-card/80'
    
    switch (status) {
      case 'in_progress':
        return cn(baseStyle, 'w-6 h-6 border-2 border-accent bg-accent/10 shadow-sm shadow-accent/20')
      case 'completed':
        return cn(baseStyle, 'w-5 h-5 border-muted-foreground/40 bg-muted/30')
      case 'failed':
        return cn(baseStyle, 'w-5 h-5 border-destructive/40 bg-destructive/10')
      default:
        return cn(baseStyle, 'w-4 h-4 border-muted-foreground/20 bg-muted/20 opacity-60')
    }
  }

  return (
    <div
      className="relative flex items-center justify-center group cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Connector line */}
      {!isLast && (
        <div className="absolute top-full left-1/2 w-px h-4 -translate-x-0.5 bg-muted-foreground/15" />
      )}

      {/* Activity node */}
      <div className={getNodeStyle(activity.status)}>
        {/* Ping animation for in_progress */}
        {activity.status === 'in_progress' && (
          <div className="absolute inset-[-2px] rounded-full border border-accent/40 animate-ping" />
        )}

        {/* Icon */}
        {activity.status !== 'pending' && (
          <ActivityIcon type={activity.type} status={activity.status} />
        )}
      </div>
    </div>
  )
}

function VerticalProcessChain({ activities, className }: VerticalProcessChainProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mobileTooltipId, setMobileTooltipId] = useState<string | null>(null)
  const isMobile = useMobileDetection()

  const hasActive = activities.some(a => a.status === 'in_progress')

  const handleNodeClick = (activityId: string) => {
    if (isMobile.current) {
      setMobileTooltipId(mobileTooltipId === activityId ? null : activityId)
    }
  }

  const handleMouseEnter = (activityId: string) => {
    if (!isMobile.current) {
      setHoveredId(activityId)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile.current) {
      setHoveredId(null)
    }
  }

  return (
    <div className={cn('relative flex flex-col items-center gap-3 pointer-events-auto', className)}>
      {/* Subtle rail line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-0.5 bg-muted-foreground/20" />

      {activities.map((activity, idx) => {
        const isVisible = hoveredId === activity.id || mobileTooltipId === activity.id
        
        return (
          <div key={activity.id} className="relative">
            <ActivityNode
              activity={activity}
              isLast={idx === activities.length - 1}
              onMouseEnter={() => handleMouseEnter(activity.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleNodeClick(activity.id)}
            />
            
            <ActivityTooltip
              activity={activity}
              isVisible={isVisible}
              isMobile={isMobile.current}
            />
          </div>
        )
      })}
    </div>
  )
}

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

      {/* AI Activity Monitor - DISABLED */}
      {/* {activityLog && activityLog.length > 0 && (
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
      )} */}
    </div>
  )
}

// Export VerticalProcessChain for use in other components
export { VerticalProcessChain }