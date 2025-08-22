'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Activity, Settings, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AiActivityMonitor } from '@/components/chat/activity/AiActivityMonitor'
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
      {/* Session Info */}
      <Card variant="glass" className="border-border/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-accent" />
            Session Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Connection</span>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
              Live
            </Badge>
          </div>
          
          {sessionId && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Session ID</span>
              <code className="text-xs bg-muted/50 px-2 py-1 rounded">
                {sessionId.slice(0, 8)}...
              </code>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">AI Model</span>
            <span className="text-foreground font-medium">Gemini 1.5 Flash</span>
          </div>
        </CardContent>
      </Card>

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
            <AiActivityMonitor
              activities={activityLog}
              stages={stages}
              currentStage={currentStage}
              stageProgress={stageProgress}
              className="scale-90 origin-top"
            />
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

      {/* Quick Actions */}
      <Card variant="glass" className="border-border/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-accent" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs hover:bg-accent/10"
          >
            Export Conversation
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs hover:bg-accent/10"
          >
            Book Meeting
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs hover:bg-accent/10"
          >
            Share Insights
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}