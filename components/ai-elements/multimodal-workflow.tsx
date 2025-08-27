'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlayIcon,
  PauseIcon,
  SquareIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  GitBranchIcon,
  SearchIcon,
  ClockIcon,
  ArrowRightIcon,
  SettingsIcon
} from 'lucide-react';
import { cn } from '@/core/utils';

// Import our new components
import { WebPreviewAnalysis } from './web-preview-analysis';
import { MultimodalTaskTracker, AnalysisTask } from './multimodal-task-tracker';
import { MultimodalBranching, AnalysisBranch } from './multimodal-branching';
import { MultimodalMessage } from './multimodal-message';

export interface WorkflowStep {
  id: string;
  type: 'web-preview' | 'task' | 'branch' | 'message' | 'delay';
  title: string;
  description: string;
  config: unknown;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  dependencies?: string[]; // IDs of steps that must complete first
  results?: unknown;
}

export interface MultimodalWorkflowProps {
  sessionId: string;
  userId?: string;
  workflowId?: string;
  onWorkflowComplete?: (results: unknown) => void;
  onWorkflowError?: (error: Error) => void;
  className?: string;
}

export const MultimodalWorkflow = ({
  sessionId,
  userId,
  workflowId,
  onWorkflowComplete,
  onWorkflowError,
  className
}: MultimodalWorkflowProps) => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'failed'>('idle');
  const [stepResults, setStepResults] = useState<Record<string, unknown>>({});

  // Example comprehensive workflow for multimodal analysis
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([
    {
      id: 'initial-assessment',
      type: 'message',
      title: 'Initial Assessment',
      description: 'Start with a comprehensive overview',
      config: {
        content: 'Let me begin by analyzing your request with a comprehensive multimodal approach.',
        role: 'assistant'
      },
      status: 'pending'
    },
    {
      id: 'web-research',
      type: 'web-preview',
      title: 'Web Research',
      description: 'Research relevant information from web sources',
      config: {
        urls: ['https://example.com/analysis', 'https://example.com/insights'],
        analysisType: 'comprehensive'
      },
      status: 'pending'
    },
    {
      id: 'task-breakdown',
      type: 'task',
      title: 'Task Breakdown',
      description: 'Break down the analysis into manageable tasks',
      config: {
        tasks: [
          { type: 'webcam', title: 'Visual Analysis', description: 'Analyze visual elements' },
          { type: 'screen', title: 'Content Analysis', description: 'Analyze content structure' },
          { type: 'upload', title: 'Document Processing', description: 'Process related documents' }
        ]
      },
      status: 'pending',
      dependencies: ['web-research']
    },
    {
      id: 'branching-analysis',
      type: 'branch',
      title: 'Branching Analysis',
      description: 'Explore different analysis approaches',
      config: {
        strategies: ['Deep Analysis', 'Quick Assessment', 'Technical Review']
      },
      status: 'pending',
      dependencies: ['task-breakdown']
    },
    {
      id: 'final-synthesis',
      type: 'message',
      title: 'Final Synthesis',
      description: 'Synthesize all findings into a comprehensive report',
      config: {
        content: 'Based on all the analysis conducted, here are my comprehensive findings.',
        role: 'assistant'
      },
      status: 'pending',
      dependencies: ['branching-analysis']
    }
  ]);

  const executeStep = useCallback(async (step: WorkflowStep) => {
    setCurrentStep(step.id);
    setWorkflow(prev => prev.map(s =>
      s.id === step.id ? { ...s, status: 'running' } : s
    ));

    try {
      switch (step.type) {
        case 'web-preview':
          // Simulate web preview analysis
          await new Promise(resolve => setTimeout(resolve, 3000));
          setStepResults(prev => ({
            ...prev,
            [step.id]: {
              analysis: 'Web content analyzed successfully',
              sources: step.config.urls?.length || 1,
              insights: ['Key insights found', 'Patterns identified', 'Recommendations generated']
            }
          }));
          break;

        case 'task':
          // Tasks are handled by the task tracker component
          await new Promise(resolve => setTimeout(resolve, 2000));
          setStepResults(prev => ({
            ...prev,
            [step.id]: {
              tasksCreated: step.config.tasks?.length || 0,
              status: 'Tasks scheduled for execution'
            }
          }));
          break;

        case 'branch':
          // Branches are handled by the branching component
          await new Promise(resolve => setTimeout(resolve, 2000));
          setStepResults(prev => ({
            ...prev,
            [step.id]: {
              branchesCreated: step.config.strategies?.length || 0,
              status: 'Analysis branches created'
            }
          }));
          break;

        case 'message':
          // Display the message
          await new Promise(resolve => setTimeout(resolve, 1000));
          setStepResults(prev => ({
            ...prev,
            [step.id]: {
              displayed: true,
              content: step.config.content
            }
          }));
          break;

        case 'delay':
          // Simple delay step
          await new Promise(resolve => setTimeout(resolve, step.config.duration || 1000));
          setStepResults(prev => ({
            ...prev,
            [step.id]: { delayed: true }
          }));
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      // Mark step as completed
      setWorkflow(prev => prev.map(s =>
        s.id === step.id ? { ...s, status: 'completed' } : s
      ));

    } catch (error) {
      setWorkflow(prev => prev.map(s =>
        s.id === step.id ? { ...s, status: 'failed' } : s
      ));

      onWorkflowError?.(error instanceof Error ? error : new Error('Step execution failed'));
    } finally {
      setCurrentStep(null);
    }
  }, [onWorkflowError]);

  const canExecuteStep = useCallback((step: WorkflowStep) => {
    if (!step.dependencies) return true;

    return step.dependencies.every(depId => {
      const depStep = workflow.find(s => s.id === depId);
      return depStep?.status === 'completed';
    });
  }, [workflow]);

  const executeWorkflow = useCallback(async () => {
    setWorkflowStatus('running');

    try {
      for (const step of workflow) {
        if (step.status === 'pending' && canExecuteStep(step)) {
          await executeStep(step);
        }
      }

      setWorkflowStatus('completed');
      onWorkflowComplete?.(stepResults);

    } catch (error) {
      setWorkflowStatus('failed');
      onWorkflowError?.(error instanceof Error ? error : new Error('Workflow execution failed'));
    }
  }, [workflow, canExecuteStep, executeStep, stepResults, onWorkflowComplete, onWorkflowError]);

  const pauseWorkflow = useCallback(() => {
    setWorkflowStatus('paused');
    setCurrentStep(null);
  }, []);

  const resumeWorkflow = useCallback(() => {
    setWorkflowStatus('running');
    // Continue from where we left off
    executeWorkflow();
  }, [executeWorkflow]);

  const resetWorkflow = useCallback(() => {
    setWorkflowStatus('idle');
    setCurrentStep(null);
    setStepResults({});
    setWorkflow(prev => prev.map(step => ({
      ...step,
      status: 'pending' as const
    })));
  }, []);

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'web-preview':
        return <SearchIcon className="h-4 w-4" />;
      case 'task':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'branch':
        return <GitBranchIcon className="h-4 w-4" />;
      case 'message':
        return <ArrowRightIcon className="h-4 w-4" />;
      case 'delay':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <SettingsIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'skipped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const completedSteps = workflow.filter(s => s.status === 'completed').length;
  const totalSteps = workflow.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Multimodal Analysis Workflow
              <Badge className={cn('text-xs', getStatusColor(
                workflowStatus === 'running' ? 'running' :
                workflowStatus === 'completed' ? 'completed' :
                workflowStatus === 'failed' ? 'failed' : 'pending'
              ))}>
                {workflowStatus}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {workflowStatus === 'idle' && (
                <Button onClick={executeWorkflow} className="gap-2">
                  <PlayIcon className="h-4 w-4" />
                  Start Workflow
                </Button>
              )}

              {workflowStatus === 'running' && (
                <Button onClick={pauseWorkflow} variant="outline" className="gap-2">
                  <PauseIcon className="h-4 w-4" />
                  Pause
                </Button>
              )}

              {workflowStatus === 'paused' && (
                <Button onClick={resumeWorkflow} className="gap-2">
                  <PlayIcon className="h-4 w-4" />
                  Resume
                </Button>
              )}

              <Button onClick={resetWorkflow} variant="outline">
                Reset
              </Button>
            </div>
          </CardTitle>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress: {completedSteps} / {totalSteps} steps</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Workflow Steps */}
            {workflow.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium',
                  step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  step.status === 'running' ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                  step.status === 'failed' ? 'bg-red-500 border-red-500 text-white' :
                  step.status === 'skipped' ? 'bg-gray-400 border-gray-400 text-white' :
                  'bg-white border-gray-300 text-gray-600'
                )}>
                  {step.status === 'completed' ? <CheckCircleIcon className="h-4 w-4" /> :
                   step.status === 'running' ? <ClockIcon className="h-4 w-4" /> :
                   step.status === 'failed' ? <AlertCircleIcon className="h-4 w-4" /> :
                   index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStepIcon(step.type)}
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <Badge className={cn('text-xs', getStatusColor(step.status))}>
                      {step.status}
                    </Badge>
                    {step.dependencies && step.dependencies.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Depends on: {step.dependencies.join(', ')}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{step.description}</p>

                  {stepResults[step.id] && (
                    <div className="text-xs bg-muted/50 rounded p-2">
                      <div className="font-medium">Results:</div>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {JSON.stringify(stepResults[step.id], null, 2)}
                      </pre>
                    </div>
                  )}

                  {!canExecuteStep(step) && (
                    <p className="text-xs text-orange-600 mt-1">
                      Waiting for dependencies: {step.dependencies?.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrated Components */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview">Web Preview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <WebPreviewAnalysis
            sessionId={sessionId}
            userId={userId}
            onAnalysisComplete={(result) => {
              // Action logged
            }}
            onError={(error) => {
              // Error: Web analysis error
            }}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <MultimodalTaskTracker
            sessionId={sessionId}
            userId={userId}
            onTaskComplete={(task) => {
              // Action logged
            }}
            onTaskError={(task, error) => {
              // Error: Task error
            }}
          />
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <MultimodalBranching
            sessionId={sessionId}
            userId={userId}
            onBranchCreate={(branch) => {
              // Action logged
            }}
            onBranchSelect={(branch) => {
              // Action logged
            }}
            onBranchCompare={(branches) => {
              // Action logged
            }}
          />
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Workflow Messages</h3>

            {/* Example workflow messages */}
            <MultimodalMessage
              role="assistant"
              content="Starting comprehensive multimodal analysis workflow..."
              sessionId={sessionId}
              userId={userId}
            />

            {workflow.map((step) => (
              step.type === 'message' && stepResults[step.id] && (
                <MultimodalMessage
                  key={step.id}
                  role={step.config.role || 'assistant'}
                  content={step.config.content}
                  sessionId={sessionId}
                  userId={userId}
                  reasoning={{
                    content: `Step "${step.title}" completed successfully`,
                    isStreaming: false,
                    duration: 2
                  }}
                  suggestions={[
                    {
                      suggestion: 'Continue with next step',
                      onClick: () => { /* Action logged */ }
                    },
                    {
                      suggestion: 'Review results',
                      onClick: () => { /* Action logged */ }
                    }
                  ]}
                />
              )
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
