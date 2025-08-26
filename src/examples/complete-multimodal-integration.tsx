/**
 * Complete Multimodal AI Integration Example
 *
 * This example demonstrates how to integrate all the new AI Elements
 * components with the multimodal backend system for a comprehensive
 * multimodal AI experience.
 */

import React, { useState } from 'react';
import { MultimodalWorkflow } from '@/components/ai-elements/multimodal-workflow';
import { MultimodalMessage } from '@/components/ai-elements/multimodal-message';
import { MultimodalPromptInput } from '@/components/ai-elements/multimodal-prompt-input';
import { WebPreviewAnalysis } from '@/components/ai-elements/web-preview-analysis';
import { MultimodalTaskTracker } from '@/components/ai-elements/multimodal-task-tracker';
import { MultimodalBranching } from '@/components/ai-elements/multimodal-branching';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BrainIcon,
  MessageSquareIcon,
  WorkflowIcon,
  SettingsIcon,
  ZapIcon
} from 'lucide-react';

export const CompleteMultimodalIntegration = () => {
  const sessionId = 'complete-multimodal-' + Date.now();
  const userId = 'demo-user';

  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tools?: any[];
    sources?: any[];
    reasoning?: any;
    suggestions?: any[];
  }>>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the complete multimodal AI experience! I can analyze images, documents, web content, and manage complex workflows.',
      suggestions: [
        { suggestion: 'Analyze a webpage', onClick: () => setActiveTab('web') },
        { suggestion: 'Start a workflow', onClick: () => setActiveTab('workflow') },
        { suggestion: 'Manage tasks', onClick: () => setActiveTab('tasks') },
        { suggestion: 'Explore branches', onClick: () => setActiveTab('branches') }
      ]
    }
  ]);

  const handleSubmit = async (content: string, modality?: string, data?: any) => {
    // Add user message
    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user' as const,
      content: content || 'Processing multimodal input...'
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response with multimodal features
    setTimeout(() => {
      const aiMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant' as const,
        content: `I've processed your ${modality || 'text'} input. Here's what I found:`,
        tools: modality ? [{
          type: modality,
          input: { content },
          result: data
        }] : undefined,
        reasoning: {
          content: 'Analyzing multimodal input and generating insights...',
          isStreaming: false,
          duration: 3
        },
        suggestions: [
          { suggestion: 'Continue analysis', onClick: () => console.log('Continue clicked') },
          { suggestion: 'Export results', onClick: () => console.log('Export clicked') },
          { suggestion: 'Create workflow', onClick: () => setActiveTab('workflow') }
        ]
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BrainIcon className="h-6 w-6 text-primary" />
              Complete Multimodal AI Integration
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <ZapIcon className="h-3 w-3 mr-1" />
                Advanced
              </Badge>
            </CardTitle>
            <p className="text-muted-foreground">
              Experience the full power of multimodal AI with integrated web analysis,
              task tracking, conversation branching, and automated workflows.
            </p>
          </CardHeader>
        </Card>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquareIcon className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="web" className="gap-2">
              <BrainIcon className="h-4 w-4" />
              Web Analysis
            </TabsTrigger>
            <TabsTrigger value="workflow" className="gap-2">
              <WorkflowIcon className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="branches" className="gap-2">
              <BrainIcon className="h-4 w-4" />
              Branches
            </TabsTrigger>
          </TabsList>

          {/* Chat Interface */}
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareIcon className="h-5 w-5" />
                  Multimodal Chat
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Chat with multimodal capabilities - analyze images, documents, and more
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <MultimodalMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      sessionId={sessionId}
                      userId={userId}
                      tools={message.tools}
                      sources={message.sources}
                      reasoning={message.reasoning}
                      suggestions={message.suggestions}
                    />
                  ))}
                </div>

                <Separator />

                {/* Input */}
                <MultimodalPromptInput
                  onSubmit={handleSubmit}
                  placeholder="Type a message or use multimodal tools..."
                  sessionId={sessionId}
                  userId={userId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Web Analysis */}
          <TabsContent value="web" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainIcon className="h-5 w-5" />
                  Web Preview Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Analyze web content and integrate findings into multimodal context
                </p>
              </CardHeader>
              <CardContent>
                <WebPreviewAnalysis
                  sessionId={sessionId}
                  userId={userId}
                  onAnalysisComplete={(result) => {
                    console.log('Web analysis completed:', result);
                    // Add to chat context
                    const message = {
                      id: `web_${Date.now()}`,
                      role: 'assistant' as const,
                      content: `Web analysis complete! Found ${result.webMetadata?.links?.length || 0} links and key insights.`,
                      tools: [{
                        type: 'web-preview',
                        input: { url: result.webMetadata?.url },
                        result
                      }]
                    };
                    setMessages(prev => [...prev, message]);
                  }}
                  onError={(error) => {
                    console.error('Web analysis error:', error);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow */}
          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WorkflowIcon className="h-5 w-5" />
                  Multimodal Workflow
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automated multimodal analysis workflows with progress tracking
                </p>
              </CardHeader>
              <CardContent>
                <MultimodalWorkflow
                  sessionId={sessionId}
                  userId={userId}
                  onWorkflowComplete={(results) => {
                    console.log('Workflow completed:', results);
                    // Add completion message to chat
                    const message = {
                      id: `workflow_${Date.now()}`,
                      role: 'assistant' as const,
                      content: 'Multimodal workflow completed successfully! All analysis steps finished.',
                      reasoning: {
                        content: 'Workflow execution completed with comprehensive results',
                        isStreaming: false,
                        duration: 5
                      }
                    };
                    setMessages(prev => [...prev, message]);
                  }}
                  onWorkflowError={(error) => {
                    console.error('Workflow error:', error);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Task Tracking
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track and manage multimodal analysis tasks with progress monitoring
                </p>
              </CardHeader>
              <CardContent>
                <MultimodalTaskTracker
                  sessionId={sessionId}
                  userId={userId}
                  onTaskComplete={(task) => {
                    console.log('Task completed:', task);
                    // Add to chat context
                    const message = {
                      id: `task_${Date.now()}`,
                      role: 'assistant' as const,
                      content: `Task "${task.title}" completed successfully!`,
                      tools: [{
                        type: task.type as any,
                        input: { content: task.description },
                        result: task.result
                      }]
                    };
                    setMessages(prev => [...prev, message]);
                  }}
                  onTaskError={(task, error) => {
                    console.error('Task error:', task, error);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branches */}
          <TabsContent value="branches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainIcon className="h-5 w-5" />
                  Conversation Branching
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Explore different analysis approaches and compare results
                </p>
              </CardHeader>
              <CardContent>
                <MultimodalBranching
                  sessionId={sessionId}
                  userId={userId}
                  onBranchCreate={(branch) => {
                    console.log('Branch created:', branch);
                    // Add to chat context
                    const message = {
                      id: `branch_${Date.now()}`,
                      role: 'assistant' as const,
                      content: `Created new analysis branch: "${branch.title}"`,
                      tools: [{
                        type: 'branch',
                        input: { branchId: branch.id },
                        result: branch
                      }]
                    };
                    setMessages(prev => [...prev, message]);
                  }}
                  onBranchSelect={(branch) => {
                    console.log('Branch selected:', branch);
                  }}
                  onBranchCompare={(branches) => {
                    console.log('Branches compared:', branches);
                    // Add comparison to chat
                    const message = {
                      id: `compare_${Date.now()}`,
                      role: 'assistant' as const,
                      content: `Compared ${branches.length} analysis branches. Key differences identified.`,
                      tools: [{
                        type: 'branch',
                        input: { comparison: true },
                        result: { branchesCompared: branches.length }
                      }]
                    };
                    setMessages(prev => [...prev, message]);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Overview */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Integration Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <MessageSquareIcon className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold mb-1">Multimodal Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Enhanced messages with reasoning, citations, and interactive tools
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <BrainIcon className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-semibold mb-1">Web Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze web content and integrate findings into multimodal context
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <WorkflowIcon className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-semibold mb-1">Automated Workflows</h3>
                <p className="text-sm text-muted-foreground">
                  Orchestrate complex multimodal analysis with progress tracking
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <SettingsIcon className="h-8 w-8 text-orange-500 mb-2" />
                <h3 className="font-semibold mb-1">Task Management</h3>
                <p className="text-sm text-muted-foreground">
                  Track and manage multimodal analysis tasks with detailed progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteMultimodalIntegration;
