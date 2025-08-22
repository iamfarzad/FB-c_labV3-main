'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Activity, Settings, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import { AiActivityMonitor } from '@/components/chat/activity/AiActivityMonitor' // Temporarily disabled
import { cn } from '@/src/core/utils'

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
      {/* Session info removed - now only in header */}

      {/* Context Display */}
      {context && Object.keys(context).length > 0 && (
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
                  {typeof value === 'string' ? value : JSON.stringify(value).slice(0, 20)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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

      {/* Conversation Stages */}
      {stages && stages.length > 0 && (
        <Card variant="glass" className="border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Conversation Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg transition-colors',
                  stage.current ? 'bg-accent/10 border border-accent/20' : 'hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  stage.done ? 'bg-green-500' : stage.current ? 'bg-accent animate-pulse' : 'bg-muted-foreground/30'
                )} />
                <span className={cn(
                  'text-xs font-medium',
                  stage.current ? 'text-accent' : stage.done ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {stage.label}
                </span>
              </motion.div>
            ))}
            
            {stageProgress && (
              <div className="mt-3 pt-3 border-t border-border/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{Math.round((stageProgress / stages.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <motion.div
                    className="bg-accent h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(stageProgress / stages.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions removed - handled by SuggestedActions in composer */}
    </div>
  )
}