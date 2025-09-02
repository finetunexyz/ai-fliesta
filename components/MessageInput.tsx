'use client';

import { useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, isLoading, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm p-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              className={cn(
                "w-full p-3 pr-12 border border-gray-600/50 rounded-lg",
                "bg-gray-800/50 text-white placeholder-gray-400 text-sm",
                "resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
                "backdrop-blur-sm transition-all duration-200",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              rows={1}
              disabled={disabled || isLoading}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-500">
              {message.length}/1000
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading || disabled}
            className={cn(
              "px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-medium text-sm",
              "hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50",
              "transition-all duration-200 transform hover:scale-105 shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
              isLoading && "animate-pulse"
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sending...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>Send</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
