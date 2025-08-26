/**
 * Example showing how to integrate AI Elements with the multimodal backend
 */

import React, { useState } from 'react';
import { MultimodalConversation, MultimodalMessage } from '@/components/ai-elements/multimodal-message';
import { MultimodalTool, useMultimodalTool } from '@/components/ai-elements/multimodal-tool';
import { multimodalClient } from '@/src/core/multimodal-client';

export const MultimodalAIElementsExample = () => {
  const sessionId = 'example-session-' + Date.now();
  const userId = 'user-123';
  
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tools?: any[];
    sources?: any[];
  }>>([
    {
      id: '1',
      role: 'user',
      content: 'Hello! I need help analyzing this image.',
      tools: [
        {
          type: 'webcam' as const,
          input: {
            imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...' // Base64 image data
          }
        }
      ]
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I can see you\'ve uploaded an image. Let me analyze it for you.',
      tools: [
        {
          type: 'text' as const,
          input: {
            content: 'Analyzing the uploaded image...'
          }
        }
      ]
    }
  ]);

  const { tools, addTool } = useMultimodalTool(sessionId, userId);

  const handleAddMessage = async (content: string, toolType?: 'webcam' | 'screen' | 'upload' | 'voice' | 'text') => {
    const newMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      tools: toolType ? [{ type: toolType, input: {} }] : undefined
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `I've processed your ${toolType || 'message'}. Here's what I found...`,
        tools: [
          {
            type: 'text' as const,
            input: {
              content: `Analysis complete for ${toolType || 'message'}`
            }
          }
        ]
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Multimodal AI Elements Integration</h1>
      
      {/* Multimodal Conversation */}
      <MultimodalConversation>
        {messages.map((message) => (
          <MultimodalMessage
            key={message.id}
            role={message.role}
            content={message.content}
            sessionId={sessionId}
            userId={userId}
            tools={message.tools}
            sources={message.sources}
            avatar={{
              name: message.role === 'user' ? 'You' : 'AI Assistant',
              src: message.role === 'user' ? '/placeholder-user.jpg' : '/placeholder-logo.png'
            }}
          />
        ))}
      </MultimodalConversation>

      {/* Tool Controls */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Add Messages with Tools</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleAddMessage('I want to analyze an image from my webcam', 'webcam')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Webcam Message
          </button>
          <button
            onClick={() => handleAddMessage('Let me share my screen', 'screen')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Screen Share Message
          </button>
          <button
            onClick={() => handleAddMessage('I have a question', 'text')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Add Text Message
          </button>
        </div>
      </div>

      {/* Active Tools */}
      {tools.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Tools</h2>
          {tools.map((tool, index) => (
            <MultimodalTool
              key={index}
              {...tool}
            />
          ))}
        </div>
      )}

      {/* Context Summary */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Multimodal Context</h2>
        <button
          onClick={async () => {
            try {
              const context = await multimodalClient.getContext(sessionId);
              console.log('Multimodal Context:', context);
              alert('Context retrieved! Check console for details.');
            } catch (error) {
              console.error('Failed to get context:', error);
              alert('Failed to get context. Check console for details.');
            }
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Get Context Summary
        </button>
      </div>
    </div>
  );
};

export default MultimodalAIElementsExample;
