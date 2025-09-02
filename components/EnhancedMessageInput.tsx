'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedMessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  selectedModelsCount: number;
}

export function EnhancedMessageInput({ 
  onSendMessage, 
  isLoading, 
  disabled,
  selectedModelsCount 
}: EnhancedMessageInputProps) {
  const [message, setMessage] = useState('');
  const [searchWeb, setSearchWeb] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !isLoading && !disabled && selectedModelsCount > 0) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 120; // max 5 lines approximately
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const canSend = message.trim() && !isLoading && !disabled && selectedModelsCount > 0;

  return (
    <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto p-4">
        {/* Web Search Toggle */}
        {searchWeb && (
          <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium">Web search enabled</span>
              <button
                onClick={() => setSearchWeb(false)}
                className="ml-auto p-1 hover:bg-blue-500/20 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-blue-300/80 text-xs mt-1">
              AI models will search the web for current information to enhance their responses
            </p>
          </div>
        )}

        <div className="relative">
          {/* Main input container */}
          <div className={cn(
            "relative flex items-end gap-3 p-3 bg-gray-800/50 backdrop-blur-sm rounded-2xl border transition-all duration-200",
            canSend 
              ? "border-purple-500/50 shadow-lg shadow-purple-500/10" 
              : "border-gray-600/50",
            disabled && "opacity-50"
          )}>
            {/* Left side attachments */}
            <div className="flex items-center gap-1 pb-2">
              {/* File upload */}
              <button
                onClick={handleFileUpload}
                disabled={disabled || isLoading}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Attach file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Image upload */}
              <button
                onClick={handleFileUpload}
                disabled={disabled || isLoading}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Upload image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedModelsCount === 0 
                    ? "Select models to start chatting..." 
                    : searchWeb 
                    ? "Search the web and ask anything..." 
                    : "Message AI models..."
                }
                className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed min-h-[20px] max-h-[120px]"
                rows={1}
                disabled={disabled || isLoading || selectedModelsCount === 0}
              />
              
              {/* Character count */}
              {message.length > 0 && (
                <div className="absolute -bottom-5 right-0 text-xs text-gray-500">
                  {message.length}/4000
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 pb-2">
              {/* Web search toggle */}
              <button
                onClick={() => setSearchWeb(!searchWeb)}
                disabled={disabled || isLoading}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  searchWeb 
                    ? "text-blue-400 bg-blue-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                )}
                title="Search the web"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Voice input */}
              <button
                onClick={handleVoiceRecord}
                disabled={disabled || isLoading}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isRecording 
                    ? "text-red-400 bg-red-500/20 animate-pulse" 
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                )}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Send button */}
              <button
                onClick={handleSubmit}
                disabled={!canSend}
                className={cn(
                  "p-2 rounded-lg font-medium transition-all duration-200",
                  canSend
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                )}
                title="Send message"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Model selection hint */}
          {selectedModelsCount === 0 && (
            <div className="absolute -top-12 left-0 right-0 text-center">
              <p className="text-gray-400 text-sm">
                Select AI models above to start comparing responses
              </p>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,.txt,.doc,.docx"
          onChange={(e) => {
            // Handle file upload
            console.log('Files selected:', e.target.files);
          }}
        />

        {/* Usage hint */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {searchWeb && (
              <span className="flex items-center gap-1 text-blue-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Web search active
              </span>
            )}
          </div>
          {selectedModelsCount > 0 && (
            <span>{selectedModelsCount} model{selectedModelsCount !== 1 ? 's' : ''} selected</span>
          )}
        </div>
      </div>
    </div>
  );
}
