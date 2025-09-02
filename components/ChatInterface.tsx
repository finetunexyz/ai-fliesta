'use client';

import { useState } from 'react';
import { AIModel, ModelResponse, ChatMessage } from '@/lib/ai-models';
import { callOpenRouter } from '@/lib/openrouter';
import { ModelResponse as ModelResponseComponent } from './ModelResponse';
import { MessageInput } from './MessageInput';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

interface ChatInterfaceProps {
  selectedModels: AIModel[];
}

export function ChatInterface({ selectedModels }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const sendMessage = async (content: string) => {
    if (selectedModels.length === 0) return;

    const messageId = Date.now().toString();
    const newMessage: ChatMessage = {
      id: messageId,
      content,
      timestamp: new Date(),
      responses: selectedModels.map(model => ({
        modelId: model.id,
        response: '',
        displayText: '',
        isLoading: true,
        isTyping: false,
        timestamp: new Date(),
      }))
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    // Send requests to all selected models simultaneously
    const promises = selectedModels.map(async (model) => {
      try {
        const response = await callOpenRouter(model, content);
        return {
          modelId: model.id,
          response,
          displayText: '',
          isLoading: false,
          isTyping: false,
          timestamp: new Date(),
        } as ModelResponse;
      } catch (error) {
        return {
          modelId: model.id,
          response: '',
          displayText: '',
          isLoading: false,
          isTyping: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        } as ModelResponse;
      }
    });

    try {
      const responses = await Promise.all(promises);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, responses }
          : msg
      ));

      // Persist to Supabase if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const models = selectedModels.map(m => m.name);
        const payload = {
          user_id: user.id,
          prompt: content,
          models,
          responses: responses.reduce((acc: Record<string, { text: string; error: string | null }>, r) => {
            // Find the model name for this modelId - use the exact name from the models array
            const model = selectedModels.find(m => m.id === r.modelId);
            const modelName = model?.name || r.modelId;
            acc[modelName] = { text: r.response, error: r.error ?? null };
            return acc;
          }, {}),
        };
        console.log('Saving chat to database:', payload); // Debug log
        await supabase.from('chat_history').insert(payload);
      }
    } catch (error) {
      console.error('Error sending messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = (modelId: string) => {
    setFavorites(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const getModelColor = (modelId: string) => {
    const colors = {
      'gpt': 'from-green-500 to-green-600',
      'claude': 'from-orange-500 to-orange-600',
      'gemini': 'from-blue-500 to-blue-600',
      'deepseek': 'from-purple-500 to-purple-600'
    } as Record<string, string>;
    return colors[modelId] || 'from-gray-500 to-gray-600';
  };

  if (selectedModels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">
            Select at least one AI model to start comparing responses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Display - Horizontal Layout */}
      <div className="flex-1 flex overflow-hidden flex-container">
        {selectedModels.map((model) => (
          <div key={model.id} className="chat-column border-r border-gray-700/50 last:border-r-0 flex flex-col">
            {/* Colored Model Header */}
            <div className={cn(
              "flex-shrink-0 p-3 bg-gradient-to-r",
              getModelColor(model.id),
              "shadow-lg"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {model.name.split(' ')[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-sm truncate">{model.name}</h3>
                    <p className="text-white/80 text-xs truncate">{model.provider}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 chat-scrollbar">
              {messages.map((message) => {
                const response = message.responses.find(r => r.modelId === model.id);
                if (!response) return null;

                return (
                  <div key={message.id} className="space-y-3">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-white text-gray-900 rounded-lg p-2 max-w-[80%] chat-container">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-600">You</span>
                        </div>
                        <div className="text-xs text-container">
                          {message.content}
                        </div>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-lg p-2 max-w-[80%] chat-container">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-400">{model.name}</span>
                        </div>
                        <ModelResponseComponent
                          model={model}
                          response={response}
                          onFavorite={handleFavorite}
                          isFavorite={favorites.includes(model.id)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input at Bottom */}
      <MessageInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        disabled={selectedModels.length === 0}
      />
    </div>
  );
}
