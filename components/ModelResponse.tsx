'use client';

import { useState } from 'react';
import { ModelResponse as ModelResponseType, AIModel } from '@/lib/ai-models';
import { cn } from '@/lib/utils';

interface ModelResponseProps {
  model: AIModel;
  response: ModelResponseType;
  onFavorite: (modelId: string) => void;
  isFavorite: boolean;
}

export function ModelResponse({ response }: ModelResponseProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response.response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (response.isLoading) {
    return (
      <div className="text-xs text-gray-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <span>Thinking...</span>
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-700/50 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-700/50 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-700/50 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (response.error) {
    return (
      <div className="text-xs text-red-300">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400 font-medium">Error</span>
        </div>
        <div className="text-container">
          {response.error}
        </div>
      </div>
    );
  }

  return (
    <div className="text-xs text-gray-200">
      {/* Response Content */}
      <div className="text-container mb-2">
        {response.response}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
        <div className="flex items-center gap-1">
          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className={cn(
              "p-1 rounded transition-colors",
              copied ? "text-green-400" : "text-gray-400 hover:text-gray-300"
            )}
            title="Copy response"
          >
            {copied ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Thumbs Up */}
          <button
            className="p-1 text-gray-400 hover:text-green-400 transition-colors"
            title="Thumbs up"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </button>

          {/* Thumbs Down */}
          <button
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            title="Thumbs down"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2" />
            </svg>
          </button>

          {/* Share Feedback */}
          <button
            className="text-gray-500 hover:text-gray-400 transition-colors px-1"
            title="Share feedback"
          >
            Share feedback
          </button>
        </div>

        {/* Timestamp */}
        <div className="text-gray-500 flex-shrink-0">
          {response.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
