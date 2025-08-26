'use client';

import React, { useState, useCallback } from 'react';
import { WebPreview, WebPreviewNavigation, WebPreviewNavigationButton, WebPreviewUrl, WebPreviewBody } from './web-preview';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from './tool';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from './loader';
import { multimodalClient } from '@/src/core/multimodal-client';
import { ExternalLinkIcon, SearchIcon, GlobeIcon } from 'lucide-react';
import { cn } from '@/src/core/utils';

export interface WebPreviewAnalysisProps {
  sessionId: string;
  userId?: string;
  onAnalysisComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const WebPreviewAnalysis = ({
  sessionId,
  userId,
  onAnalysisComplete,
  onError,
  className
}: WebPreviewAnalysisProps) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      // First, fetch the web content
      const response = await fetch('/api/tools/web-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch web content: ${response.statusText}`);
      }

      const webData = await response.json();

      // Send for multimodal analysis
      const analysisResult = await multimodalClient.sendVision({
        sessionId,
        userId,
        content: `Web page analysis for: ${url}`,
        imageData: webData.screenshot || '',
        imageType: 'image/png',
        imageSize: webData.screenshot?.length || 0
      });

      // Add web-specific metadata
      const enrichedResult = {
        ...analysisResult,
        webMetadata: {
          url: url.trim(),
          title: webData.title,
          description: webData.description,
          content: webData.content,
          links: webData.links
        }
      };

      setAnalysisResult(enrichedResult);
      onAnalysisComplete?.(enrichedResult);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsAnalyzing(false);
    }
  }, [url, sessionId, userId, onAnalysisComplete, onError]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnalyze();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* URL Input */}
      <div className="flex gap-2">
        <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <GlobeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
              disabled={isAnalyzing}
            />
          </div>
          <Button
            type="submit"
            disabled={!url.trim() || isAnalyzing}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader size={16} type="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <SearchIcon className="h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Web Preview */}
      {url && !isAnalyzing && (
        <WebPreview defaultUrl={url} className="border rounded-lg">
          <WebPreviewNavigation>
            <div className="flex items-center gap-2 flex-1">
              <WebPreviewUrl />
            </div>
            <WebPreviewNavigationButton tooltip="Open in new tab">
              <ExternalLinkIcon className="h-4 w-4" />
            </WebPreviewNavigationButton>
          </WebPreviewNavigation>
          <WebPreviewBody />
        </WebPreview>
      )}

      {/* Analysis Results */}
      {(analysisResult || error) && (
        <Tool>
          <ToolHeader
            type="web_preview_analysis"
            state={error ? 'output-error' : 'output-available'}
          />
          <ToolContent>
            {analysisResult && (
              <ToolInput input={{
                url: url.trim(),
                metadata: analysisResult.webMetadata
              }} />
            )}
            <ToolOutput
              output={analysisResult ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Page Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      {analysisResult.output?.analysis || 'Analysis completed'}
                    </p>
                  </div>
                  {analysisResult.webMetadata && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Web Metadata</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div><strong>Title:</strong> {analysisResult.webMetadata.title}</div>
                        <div><strong>Description:</strong> {analysisResult.webMetadata.description}</div>
                        <div><strong>URL:</strong> {analysisResult.webMetadata.url}</div>
                        {analysisResult.webMetadata.links && (
                          <div><strong>Links:</strong> {analysisResult.webMetadata.links.length}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
              errorText={error}
            />
          </ToolContent>
        </Tool>
      )}
    </div>
  );
};
