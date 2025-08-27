'use client';

import { useState, useRef } from 'react';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit
} from './prompt-input';
import { ToolMenu } from '@/components/chat/ToolMenu';
import { multimodalClient } from '@/src/core/multimodal-client';

export interface MultimodalPromptInputProps {
  onSubmit?: (content: string, modality?: string, data?: unknown) => void;
  onToolAction?: (tool: string, data?: unknown) => void;
  placeholder?: string;
  sessionId?: string;
  userId?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export const MultimodalPromptInput = ({
  onSubmit,
  onToolAction,
  placeholder = 'Message with text, images, or tools...',
  sessionId,
  userId,
  isLoading = false,
  disabled = false
}: MultimodalPromptInputProps) => {
  const [input, setInput] = useState('');
  const [currentModality, setCurrentModality] = useState<'text' | 'webcam' | 'screen' | 'upload' | 'voice'>('text');
  const [toolData, setToolData] = useState<unknown>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() && !toolData) return;

    // Handle different modalities
    switch (currentModality) {
      case 'text':
        onSubmit?.(input.trim());
        setInput('');
        break;

      case 'webcam':
        if (toolData) {
          // Send to multimodal backend
          try {
            const result = await multimodalClient.sendVision({
              sessionId: sessionId || '',
              userId,
              content: 'User captured image from webcam',
              imageData: toolData,
              imageType: 'image/jpeg',
              imageSize: toolData.length
            });
            onSubmit?.(input.trim() || 'Captured image from webcam', 'vision', result);
          } catch (error) {
    console.error('Webcam analysis failed', error)
            onSubmit?.(input.trim() || 'Failed to capture image', 'error', error);
          }
        }
        break;

      case 'screen':
        if (toolData) {
          // Send to multimodal backend
          try {
            const result = await multimodalClient.sendVision({
              sessionId: sessionId || '',
              userId,
              content: 'User captured screen',
              imageData: toolData,
              imageType: 'image/png',
              imageSize: toolData.length
            });
            onSubmit?.(input.trim() || 'Captured screen', 'vision', result);
          } catch (error) {
    console.error('Screen analysis failed', error)
            onSubmit?.(input.trim() || 'Failed to capture screen', 'error', error);
          }
        }
        break;

      case 'upload':
        if (toolData) {
          // Send to multimodal backend
          try {
            const result = await multimodalClient.uploadFile({
              sessionId: sessionId || '',
              userId,
              file: toolData,
              autoAnalyze: true
            });
            onSubmit?.(input.trim() || 'Uploaded file', 'upload', result);
          } catch (error) {
    console.error('File upload failed', error)
            onSubmit?.(input.trim() || 'Failed to upload file', 'error', error);
          }
        }
        break;

      case 'voice':
        if (toolData) {
          // Send to multimodal backend
          try {
            const result = await multimodalClient.sendVoice({
              sessionId: sessionId || '',
              userId,
              transcription: toolData.transcription || input.trim(),
              duration: toolData.duration || 0
            });
            onSubmit?.(toolData.transcription || input.trim(), 'voice', result);
          } catch (error) {
    console.error('Voice processing failed', error)
            onSubmit?.(input.trim() || 'Voice input failed', 'error', error);
          }
        }
        break;
    }

    // Reset state
    setInput('');
    setToolData(null);
    setCurrentModality('text');
  };

  const handleToolAction = (tool: string, data?: unknown) => {
    // Action logged

    switch (tool) {
      case 'webcam':
        // Open webcam capture
        setCurrentModality('webcam');
        onToolAction?.('webcam');
        break;

      case 'screen':
        // Open screen capture
        setCurrentModality('screen');
        onToolAction?.('screen');
        break;

      case 'document':
      case 'image':
        // Open file upload
        setCurrentModality('upload');
        fileInputRef.current?.click();
        break;

      case 'roi':
        // Handle ROI calculator
        onToolAction?.('roi');
        break;

      case 'video':
        // Handle video to app (coming soon)
        onToolAction?.('video');
        break;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setToolData(file);
      setCurrentModality('upload');
      // Action logged
    }
  };

  return (
    <PromptInput onSubmit={handleSubmit}>
      <PromptInputToolbar>
        <PromptInputTools>
          <ToolMenu
            onUploadDocument={() => handleToolAction('document')}
            onUploadImage={() => handleToolAction('image')}
            onWebcam={() => handleToolAction('webcam')}
            onScreenShare={() => handleToolAction('screen')}
            onROI={() => handleToolAction('roi')}
            onVideoToApp={() => handleToolAction('video')}
            comingSoon={['video']} // Only video-to-app is coming soon
          />
          {currentModality !== 'text' && (
            <div className="ml-2 text-xs text-muted-foreground bg-accent/10 px-2 py-1 rounded">
              Mode: {currentModality}
              {toolData && ` (${toolData.name || toolData.type || 'ready'})`}
            </div>
          )}
        </PromptInputTools>
      </PromptInputToolbar>

      <PromptInputTextarea
        placeholder={placeholder}
        className="min-h-[64px] text-base"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
      />

      <div className="flex items-center justify-between p-1">
        <div className="text-xs text-muted-foreground">
          Press Enter to send • Shift+Enter for new line
        </div>
        <PromptInputSubmit disabled={isLoading || disabled} />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.txt,.json"
        onChange={handleFileUpload}
        multiple={false}
      />
    </PromptInput>
  );
};
