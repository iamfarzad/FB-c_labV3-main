'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile } from './task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader } from './loader';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon, PlayIcon, PauseIcon } from 'lucide-react';
import { cn } from '@/src/core/utils';
import { multimodalClient } from '@/src/core/multimodal-client';

export interface AnalysisTask {
  id: string;
  type: 'webcam' | 'screen' | 'upload' | 'web-preview' | 'batch-analysis';
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  result?: unknown;
  error?: string;
  metadata?: {
    files?: Array<{ name: string; size: number; type: string }>;
    urls?: string[];
    sessionId: string;
    userId?: string;
  };
}

export interface MultimodalTaskTrackerProps {
  sessionId: string;
  userId?: string;
  onTaskComplete?: (task: AnalysisTask) => void;
  onTaskError?: (task: AnalysisTask, error: Error) => void;
  className?: string;
}

export const MultimodalTaskTracker = ({
  sessionId,
  userId,
  onTaskComplete,
  onTaskError,
  className
}: MultimodalTaskTrackerProps) => {
  const [tasks, setTasks] = useState<AnalysisTask[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load existing tasks from context
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const context = await multimodalClient.getContext(sessionId);
        if (context?.metadata?.tasks) {
          setTasks(context.metadata.tasks);
        }
      } catch (error) {
        // Warning log removed - could add proper error handling here
      }
    };

    loadTasks();
  }, [sessionId]);

  const createTask = useCallback((
    type: AnalysisTask['type'],
    title: string,
    description: string,
    metadata?: Partial<AnalysisTask['metadata']>
  ): AnalysisTask => {
    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      description,
      status: 'pending',
      progress: 0,
      metadata: {
        sessionId,
        userId,
        ...metadata
      }
    };
  }, [sessionId, userId]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<AnalysisTask>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));

    // Persist to multimodal context
    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );

      // Store in multimodal context
      await fetch('/api/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modality: 'text',
          content: `Task update: ${updates.title || 'Task'} - ${updates.status}`,
          metadata: {
            sessionId,
            userId,
            taskUpdate: { taskId, ...updates }
          }
        })
      });
    } catch (error) {
      // Warning log removed - could add proper error handling here
    }
  }, [tasks, sessionId, userId]);

  const executeTask = useCallback(async (task: AnalysisTask) => {
    updateTask(task.id, { status: 'running', startTime: new Date() });

    try {
      switch (task.type) {
        case 'webcam':
          // Webcam analysis task
          if (navigator.mediaDevices?.getUserMedia) {
            // This would trigger webcam capture
            // Action logged
            // Simulate progress
            for (let i = 0; i <= 100; i += 10) {
              await new Promise(resolve => setTimeout(resolve, 200));
              updateTask(task.id, { progress: i });
            }
          }
          break;

        case 'screen':
          // Screen capture task
          if (navigator.mediaDevices?.getDisplayMedia) {
            // Action logged
            for (let i = 0; i <= 100; i += 15) {
              await new Promise(resolve => setTimeout(resolve, 150));
              updateTask(task.id, { progress: i });
            }
          }
          break;

        case 'upload':
          // File processing task
          // Action logged
          for (let i = 0; i <= 100; i += 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            updateTask(task.id, { progress: i });
          }
          break;

        case 'web-preview':
          // Web page analysis task
          // Action logged
          for (let i = 0; i <= 100; i += 25) {
            await new Promise(resolve => setTimeout(resolve, 80));
            updateTask(task.id, { progress: i });
          }
          break;

        case 'batch-analysis':
          // Batch processing task
          // Action logged
          const batchSize = task.metadata?.files?.length || task.metadata?.urls?.length || 1;
          for (let i = 0; i < batchSize; i++) {
            const progress = ((i + 1) / batchSize) * 100;
            updateTask(task.id, { progress });
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          break;

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      updateTask(task.id, {
        status: 'completed',
        progress: 100,
        endTime: new Date(),
        result: { success: true, message: `${task.title} completed successfully` }
      });

      onTaskComplete?.(task);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Task failed';
      updateTask(task.id, {
        status: 'failed',
        error: errorMessage,
        endTime: new Date()
      });

      onTaskError?.(task, error instanceof Error ? error : new Error(errorMessage));
    }
  }, [updateTask, onTaskComplete, onTaskError]);

  const addTask = useCallback((task: Omit<AnalysisTask, 'id' | 'status' | 'progress'>) => {
    const newTask = createTask(task.type, task.title, task.description, task.metadata);
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [createTask]);

  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const getStatusIcon = (status: AnalysisTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'running':
        return <Loader size={16} type="spinner" />;
      case 'failed':
        return <AlertCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: AnalysisTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeTasks = tasks.filter(t => t.status === 'running' || t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  return (
    <div className={cn('space-y-2', className)}>
      <Task defaultOpen={isExpanded} onOpenChange={setIsExpanded}>
        <TaskTrigger title={`Analysis Tasks (${tasks.length})`}>
          <div className="flex items-center gap-2 ml-2">
            {activeTasks.length > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeTasks.length} running
              </Badge>
            )}
            {failedTasks.length > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {failedTasks.length} failed
              </Badge>
            )}
          </div>
        </TaskTrigger>

        <TaskContent>
          <div className="space-y-3">
            {/* Active Tasks */}
            {activeTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <div>
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                  <Badge className={cn('text-xs', getStatusColor(task.status))}>
                    {task.status}
                  </Badge>
                </div>

                {task.status === 'running' && (
                  <div className="space-y-1">
                    <Progress value={task.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {task.progress}% complete
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {task.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => executeTask(task)}
                      className="gap-1"
                    >
                      <PlayIcon className="h-3 w-3" />
                      Start
                    </Button>
                  )}
                  {task.status === 'running' && (
                    <Button size="sm" variant="outline" disabled className="gap-1">
                      <PauseIcon className="h-3 w-3" />
                      Running...
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeTask(task.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Completed ({completedTasks.length})</h4>
                {completedTasks.map((task) => (
                  <TaskItem key={task.id}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm">{task.title}</span>
                      {task.endTime && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {task.endTime.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </TaskItem>
                ))}
              </div>
            )}

            {/* Failed Tasks */}
            {failedTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-600">Failed ({failedTasks.length})</h4>
                {failedTasks.map((task) => (
                  <TaskItem key={task.id}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm">{task.title}</span>
                      {task.error && (
                        <span className="text-xs text-red-600 ml-auto">
                          {task.error}
                        </span>
                      )}
                    </div>
                  </TaskItem>
                ))}
              </div>
            )}

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No analysis tasks yet</p>
                <p className="text-xs">Add tasks to track your multimodal analysis workflows</p>
              </div>
            )}
          </div>
        </TaskContent>
      </Task>
    </div>
  );
};

// Hook for using task tracker
export const useMultimodalTaskTracker = (sessionId: string, userId?: string) => {
  const [trackerRef, setTrackerRef] = useState<unknown>(null);

  const addTask = useCallback((task: Omit<AnalysisTask, 'id' | 'status' | 'progress'>) => {
    return trackerRef?.addTask(task);
  }, [trackerRef]);

  return {
    addTask,
    trackerRef: setTrackerRef
  };
};
