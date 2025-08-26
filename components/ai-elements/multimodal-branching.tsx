'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchNext,
  BranchPage
} from './branch';
import { MultimodalMessage } from './multimodal-message';
import { MultimodalTaskTracker } from './multimodal-task-tracker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusIcon, GitBranchIcon, CompareIcon, CheckCircleIcon } from 'lucide-react';
import { cn } from '@/src/core/utils';
import { multimodalClient } from '@/src/core/multimodal-client';

export interface AnalysisBranch {
  id: string;
  title: string;
  description: string;
  approach: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tools?: any[];
    sources?: any[];
  }>;
  status: 'active' | 'completed' | 'abandoned';
  score?: number;
  createdAt: Date;
  lastActivity: Date;
}

export interface MultimodalBranchingProps {
  sessionId: string;
  userId?: string;
  initialBranches?: AnalysisBranch[];
  onBranchCreate?: (branch: AnalysisBranch) => void;
  onBranchSelect?: (branch: AnalysisBranch) => void;
  onBranchCompare?: (branches: AnalysisBranch[]) => void;
  className?: string;
}

export const MultimodalBranching = ({
  sessionId,
  userId,
  initialBranches = [],
  onBranchCreate,
  onBranchSelect,
  onBranchCompare,
  className
}: MultimodalBranchingProps) => {
  const [branches, setBranches] = useState<AnalysisBranch[]>(() => {
    if (initialBranches.length > 0) return initialBranches;

    // Create initial branch
    return [{
      id: 'main',
      title: 'Main Analysis',
      description: 'Primary analysis approach',
      approach: 'Comprehensive multimodal analysis',
      messages: [],
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date()
    }];
  });

  const [currentBranchIndex, setCurrentBranchIndex] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const currentBranch = branches[currentBranchIndex];
  const activeBranches = branches.filter(b => b.status === 'active');
  const completedBranches = branches.filter(b => b.status === 'completed');

  const createBranch = useCallback((baseBranch: AnalysisBranch, title: string, approach: string) => {
    const newBranch: AnalysisBranch = {
      id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: `Alternative approach: ${approach}`,
      approach,
      messages: [...baseBranch.messages], // Copy existing messages
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    setBranches(prev => [...prev, newBranch]);
    setCurrentBranchIndex(branches.length); // Switch to new branch
    onBranchCreate?.(newBranch);

    return newBranch;
  }, [branches.length, onBranchCreate]);

  const updateBranch = useCallback((branchId: string, updates: Partial<AnalysisBranch>) => {
    setBranches(prev => prev.map(branch =>
      branch.id === branchId
        ? { ...branch, ...updates, lastActivity: new Date() }
        : branch
    ));
  }, []);

  const addMessageToBranch = useCallback((branchId: string, message: any) => {
    setBranches(prev => prev.map(branch =>
      branch.id === branchId
        ? {
            ...branch,
            messages: [...branch.messages, message],
            lastActivity: new Date()
          }
        : branch
    ));
  }, []);

  const compareBranches = useCallback(() => {
    const branchesToCompare = branches.filter(b => b.status === 'active' || b.status === 'completed');
    onBranchCompare?.(branchesToCompare);
    setShowComparison(true);
  }, [branches, onBranchCompare]);

  const selectBranch = useCallback((branch: AnalysisBranch) => {
    const index = branches.findIndex(b => b.id === branch.id);
    if (index !== -1) {
      setCurrentBranchIndex(index);
      onBranchSelect?.(branch);
    }
  }, [branches, onBranchSelect]);

  // Suggested branching strategies
  const branchingStrategies = [
    {
      title: 'Deep Analysis',
      description: 'Detailed, thorough examination with multiple perspectives',
      approach: 'Multi-angle analysis with detailed breakdown'
    },
    {
      title: 'Quick Assessment',
      description: 'Fast evaluation with key insights and recommendations',
      approach: 'Rapid assessment focusing on critical factors'
    },
    {
      title: 'Comparative Study',
      description: 'Compare different scenarios or approaches',
      approach: 'Side-by-side comparison and evaluation'
    },
    {
      title: 'Technical Deep Dive',
      description: 'Focus on technical details and implementation',
      approach: 'Technical analysis with implementation details'
    }
  ];

  const getBranchStatusColor = (status: AnalysisBranch['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'abandoned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Branch Navigation */}
      <Branch>
        <BranchMessages>
          {/* Main branch content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranchIcon className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">{currentBranch?.title}</h3>
                <Badge className={cn('text-xs', getBranchStatusColor(currentBranch?.status || 'active'))}>
                  {currentBranch?.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <BranchPage />
                <BranchPrevious />
                <BranchNext />
              </div>
            </div>

            {/* Branch Description */}
            <div className="text-sm text-muted-foreground">
              {currentBranch?.description}
            </div>

            {/* Branch Content */}
            <div className="space-y-4">
              {currentBranch?.messages.map((message) => (
                <MultimodalMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  sessionId={sessionId}
                  userId={userId}
                  tools={message.tools}
                  sources={message.sources}
                />
              ))}

              {currentBranch?.messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No messages in this branch yet</p>
                  <p className="text-xs">Start analyzing to populate this branch</p>
                </div>
              )}
            </div>
          </div>
        </BranchMessages>

        <BranchSelector from="assistant">
          {/* Branch Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={compareBranches}
              className="gap-1"
            >
              <CompareIcon className="h-3 w-3" />
              Compare
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const baseBranch = currentBranch;
                if (baseBranch) {
                  createBranch(baseBranch, 'New Branch', 'Alternative approach');
                }
              }}
              className="gap-1"
            >
              <PlusIcon className="h-3 w-3" />
              New Branch
            </Button>
          </div>
        </BranchSelector>
      </Branch>

      {/* Branching Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranchIcon className="h-4 w-4" />
            Branching Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {branchingStrategies.map((strategy, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-accent/5 transition-colors">
                <h4 className="font-medium text-sm mb-1">{strategy.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">{strategy.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (currentBranch) {
                      createBranch(currentBranch, strategy.title, strategy.approach);
                    }
                  }}
                  className="w-full text-xs"
                >
                  Create Branch
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Branch Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branch Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Active Branches */}
            {activeBranches.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Active Branches ({activeBranches.length})
                </h4>
                <div className="space-y-2">
                  {activeBranches.map((branch) => (
                    <div
                      key={branch.id}
                      className={cn(
                        'border rounded-lg p-3 cursor-pointer hover:bg-accent/5 transition-colors',
                        branch.id === currentBranch?.id && 'border-blue-500 bg-blue-50'
                      )}
                      onClick={() => selectBranch(branch)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{branch.title}</h5>
                          <p className="text-xs text-muted-foreground">{branch.approach}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {branch.messages.length} messages
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {branch.lastActivity.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Branches */}
            {completedBranches.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <CheckCircleIcon className="h-3 w-3 text-green-600" />
                  Completed Branches ({completedBranches.length})
                </h4>
                <div className="space-y-2">
                  {completedBranches.map((branch) => (
                    <div
                      key={branch.id}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-accent/5 transition-colors"
                      onClick={() => selectBranch(branch)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{branch.title}</h5>
                          <p className="text-xs text-muted-foreground">{branch.approach}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {branch.messages.length} messages
                          </p>
                          {branch.score && (
                            <p className="text-xs font-medium text-green-600">
                              Score: {branch.score}/10
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task Tracker Integration */}
      <MultimodalTaskTracker
        sessionId={sessionId}
        userId={userId}
        onTaskComplete={(task) => {
          // Mark branch as having completed a task
          if (currentBranch) {
            updateBranch(currentBranch.id, {
              messages: [...currentBranch.messages, {
                id: `task_${Date.now()}`,
                role: 'assistant',
                content: `Task "${task.title}" completed successfully!`,
                tools: [{
                  type: 'text',
                  input: { content: `Task completion: ${task.title}` }
                }]
              }]
            });
          }
        }}
      />
    </div>
  );
};

// Hook for using multimodal branching
export const useMultimodalBranching = (sessionId: string, userId?: string) => {
  const [branches, setBranches] = useState<AnalysisBranch[]>([]);

  const createBranch = useCallback((baseBranch: AnalysisBranch, title: string, approach: string) => {
    const newBranch: AnalysisBranch = {
      id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: `Alternative approach: ${approach}`,
      approach,
      messages: [...baseBranch.messages],
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    setBranches(prev => [...prev, newBranch]);
    return newBranch;
  }, []);

  const addMessageToBranch = useCallback((branchId: string, message: any) => {
    setBranches(prev => prev.map(branch =>
      branch.id === branchId
        ? {
            ...branch,
            messages: [...branch.messages, message],
            lastActivity: new Date()
          }
        : branch
    ));
  }, []);

  return {
    branches,
    createBranch,
    addMessageToBranch
  };
};
