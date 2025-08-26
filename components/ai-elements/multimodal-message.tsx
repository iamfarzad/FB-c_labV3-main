'use client';

import { Message, MessageContent, MessageAvatar } from './message';
import { MultimodalTool } from './multimodal-tool';
import { Response } from './response';
import { InlineCitation } from './inline-citation';
import { Reasoning } from './reasoning';
import { Suggestions, Suggestion } from './suggestion';
import { cn } from '@/src/core/utils';

export interface MultimodalMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sessionId: string;
  userId?: string;
  tools?: Array<{
    type: 'webcam' | 'screen' | 'upload' | 'voice' | 'text';
    input?: any;
    result?: any;
  }>;
  sources?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  reasoning?: {
    content: string;
    isStreaming?: boolean;
    duration?: number;
    isOpen?: boolean;
  };
  suggestions?: Array<{
    suggestion: string;
    onClick?: (suggestion: string) => void;
  }>;
  avatar?: {
    src?: string;
    name?: string;
  };
  className?: string;
}

export const MultimodalMessage = ({
  role,
  content,
  sessionId,
  userId,
  tools = [],
  sources = [],
  reasoning,
  suggestions = [],
  avatar,
  className
}: MultimodalMessageProps) => {
  return (
    <Message from={role} className={className}>
      {avatar && (
        <MessageAvatar
          src={avatar.src || ''}
          name={avatar.name || (role === 'user' ? 'You' : 'AI')}
        />
      )}
      <MessageContent>
        {/* Main content */}
        <Response>{content}</Response>

        {/* Multimodal tools */}
        {tools.map((tool, index) => (
          <MultimodalTool
            key={index}
            type={tool.type}
            sessionId={sessionId}
            userId={userId}
            input={tool.input}
            onComplete={(result) => {
              console.log(`Tool ${tool.type} completed:`, result);
            }}
            onError={(error) => {
              console.error(`Tool ${tool.type} failed:`, error);
            }}
          />
        ))}

        {/* Reasoning (only for assistant) */}
        {role === 'assistant' && reasoning && (
          <div className="mt-4">
            <Reasoning
              isStreaming={reasoning.isStreaming}
              open={reasoning.isOpen}
              duration={reasoning.duration}
            >
              <Reasoning.ReasoningTrigger />
              <Reasoning.ReasoningContent>{reasoning.content}</Reasoning.ReasoningContent>
            </Reasoning>
          </div>
        )}

        {/* Citations */}
        {sources.length > 0 && (
          <div className="mt-2">
            <InlineCitation>
              <InlineCitation.InlineCitationCard>
                <InlineCitation.InlineCitationCardTrigger sources={sources.map(s => s.url)} />
                <InlineCitation.InlineCitationCardBody>
                  <div className="p-4 space-y-3">
                    <h4 className="text-sm font-medium">Sources</h4>
                    {sources.map((source, index) => (
                      <InlineCitation.InlineCitationSource
                        key={index}
                        title={source.title}
                        url={source.url}
                        description={source.description}
                      />
                    ))}
                  </div>
                </InlineCitation.InlineCitationCardBody>
              </InlineCitation.InlineCitationCard>
            </InlineCitation>
          </div>
        )}

        {/* Suggestions (only for assistant) */}
        {role === 'assistant' && suggestions.length > 0 && (
          <div className="mt-4">
            <Suggestions>
              {suggestions.map((suggestion, index) => (
                <Suggestion
                  key={index}
                  suggestion={suggestion.suggestion}
                  onClick={suggestion.onClick}
                />
              ))}
            </Suggestions>
          </div>
        )}
      </MessageContent>
    </Message>
  );
};

// Enhanced conversation component for multimodal chat
export const MultimodalConversation = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
};
