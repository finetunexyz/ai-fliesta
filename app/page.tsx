'use client';

import { useState, useEffect } from 'react';
import { AIModel } from '@/lib/ai-models';
import { ModelSelectionModal } from '@/components/ModelSelectionModal';
import { EnhancedChatInterface } from '@/components/EnhancedChatInterface';
import { EnhancedMessageInput } from '@/components/EnhancedMessageInput';
import { EnhancedHeader } from '@/components/EnhancedHeader';
// import { Sidebar } from '@/components/Sidebar';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Home() {
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showModelSelection, setShowModelSelection] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if API key is available from environment variable
    const envApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
      setShowApiKeyInput(false);
    } else {
      setShowApiKeyInput(true);
    }
    setIsLoading(false);
  }, []);

  const handleModelToggle = (model: AIModel) => {
    setSelectedModels(prev => {
      const isSelected = prev.some(m => m.id === model.id);
      if (isSelected) {
        return prev.filter(m => m.id !== model.id);
      } else {
        return [...prev, model];
      }
    });
  };

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    setShowApiKeyInput(false);
  };

  const handleNewChat = () => {
    // Clear current chat and start fresh
    window.location.reload();
  };

  const handleOpenSettings = () => {
    // Open settings modal (to be implemented)
    console.log('Open settings');
  };

  const [sendMessageFn, setSendMessageFn] = useState<((message: string) => Promise<void>) | null>(null);
  const [isSending, setIsSending] = useState(false);



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading AI Flista...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {!apiKey ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome to AI Flista
              </h2>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                Enter your OpenRouter API key to start comparing AI model responses side by side.
              </p>
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-2xl backdrop-blur-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-screen">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Enhanced Header */}
              <EnhancedHeader
                selectedModelsCount={selectedModels.length}
                onNewChat={handleNewChat}
                onOpenSettings={handleOpenSettings}
              />

              {/* Model Selection Bar */}
              <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50 p-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-4">

                    
                    <button
                      onClick={() => setShowModelSelection(true)}
                      className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-200 backdrop-blur-sm"
                    >
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-white font-medium">
                        {selectedModels.length === 0 ? 'Select Models' : `${selectedModels.length} Model${selectedModels.length !== 1 ? 's' : ''} Selected`}
                      </span>
                    </button>
                  </div>

                  {selectedModels.length > 0 && (
                    <div className="flex items-center gap-2">
                      {selectedModels.slice(0, 3).map((model) => (
                        <div key={model.id} className="px-3 py-1.5 bg-gray-700/50 rounded-full">
                          <span className="text-white text-sm font-medium">{model.name}</span>
                        </div>
                      ))}
                      {selectedModels.length > 3 && (
                        <div className="px-3 py-1.5 bg-gray-700/50 rounded-full">
                          <span className="text-gray-300 text-sm">+{selectedModels.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                <EnhancedChatInterface 
                  selectedModels={selectedModels}
                  onSendMessage={(fn: (message: string) => Promise<void>) => {
                    if (fn) setSendMessageFn(() => fn);
                  }}
                />
                
                {/* Enhanced Input */}
                <EnhancedMessageInput
                  onSendMessage={async (message: string) => {
                    if (sendMessageFn && !isSending) {
                      setIsSending(true);
                      try {
                        await sendMessageFn(message);
                      } finally {
                        setIsSending(false);
                      }
                    }
                  }}
                  isLoading={isSending}
                  selectedModelsCount={selectedModels.length}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <ModelSelectionModal
          isOpen={showModelSelection}
          onClose={() => setShowModelSelection(false)}
          selectedModels={selectedModels}
          onModelToggle={handleModelToggle}
        />

        <ApiKeyInput
          onApiKeySet={handleApiKeySet}
          isVisible={showApiKeyInput}
        />
      </div>
    </ProtectedRoute>
  );
}
