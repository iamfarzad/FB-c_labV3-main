'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from './tool';
import { multimodalClient } from '@/src/core/multimodal-client';
import type { ToolUIPart } from 'ai';

// Extended tool types for multimodal integration
export type MultimodalToolType = 'webcam' | 'screen' | 'upload' | 'voice' | 'text';

export interface MultimodalToolProps {
  type: MultimodalToolType;
  sessionId: string;
  userId?: string;
  input?: any;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

export const MultimodalTool = ({
  type,
  sessionId,
  userId,
  input,
  onComplete,
  onError
}: MultimodalToolProps) => {
  const [state, setState] = useState<ToolUIPart['state']>('input-available');
  const [output, setOutput] = useState<any>(null);
  const [errorText, setErrorText] = useState<string>('');

  const executeTool = useCallback(async () => {
    setState('input-available');
    setErrorText('');

    try {
      let result;

      switch (type) {
        case 'webcam':
          // Handle webcam capture
          if (input?.imageData) {
            result = await multimodalClient.analyzeImage(input.imageData, {
              sessionId,
              userId
            });
          }
          break;

        case 'screen':
          // Handle screen capture
          if (input?.imageData) {
            result = await multimodalClient.analyzeScreen(input.imageData, {
              sessionId,
              userId
            });
          }
          break;

        case 'upload':
          // Handle file upload
          if (input?.file) {
            result = await multimodalClient.uploadFile({
              sessionId,
              userId,
              file: input.file,
              autoAnalyze: true
            });
          }
          break;

        case 'voice':
          // Handle voice transcription
          if (input?.transcription && input?.duration) {
            result = await multimodalClient.sendVoice({
              sessionId,
              userId,
              transcription: input.transcription,
              duration: input.duration
            });
          }
          break;

        case 'text':
          // Handle text message
          if (input?.content) {
            result = await multimodalClient.sendText({
              sessionId,
              userId,
              content: input.content
            });
          }
          break;

        default:
          throw new Error(`Unknown multimodal tool type: ${type}`);
      }

      setState('output-available');
      setOutput(result);
      onComplete?.(result);

    } catch (error) {
      setState('output-error');
      setErrorText(error instanceof Error ? error.message : 'Unknown error');
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [type, sessionId, userId, input, onComplete, onError]);

  // Auto-execute when input is available
  useEffect(() => {
    if (input && state === 'input-available') {
      executeTool();
    }
  }, [input, executeTool, state]);

  return (
    <Tool>
      <ToolHeader
        type={type}
        state={state}
      />
      <ToolContent>
        {input && (
          <ToolInput input={input} />
        )}
        <ToolOutput
          output={output}
          errorText={errorText}
        />
      </ToolContent>
    </Tool>
  );
};

// Hook for using multimodal tools
export const useMultimodalTool = (sessionId: string, userId?: string) => {
  const [tools, setTools] = useState<MultimodalToolProps[]>([]);

  const addTool = useCallback((tool: Omit<MultimodalToolProps, 'sessionId' | 'userId'>) => {
    const newTool: MultimodalToolProps = {
      ...tool,
      sessionId,
      userId
    };
    setTools(prev => [...prev, newTool]);
    return newTool;
  }, [sessionId, userId]);

  const removeTool = useCallback((index: number) => {
    setTools(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    tools,
    addTool,
    removeTool
  };
};
