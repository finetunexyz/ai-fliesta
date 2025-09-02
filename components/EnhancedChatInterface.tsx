'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AIModel, ModelResponse, ChatMessage } from '@/lib/ai-models';
import { callOpenRouter } from '@/lib/openrouter';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

interface EnhancedChatInterfaceProps {
  selectedModels: AIModel[];
  onSendMessage?: (sendMessageFn: (message: string) => Promise<void>) => void;
}

interface ModelPanelState {
  [modelId: string]: {
    isCollapsed: boolean;
  };
}

export function EnhancedChatInterface({ selectedModels, onSendMessage }: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [panelStates, setPanelStates] = useState<ModelPanelState>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Typing animation function
  const typeMessage = useCallback((messageId: string, modelId: string, fullText: string, speed = 1) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? {
            ...msg,
            responses: msg.responses.map(resp => 
              resp.modelId === modelId 
                ? { ...resp, isTyping: true, displayText: '' }
                : resp
            )
          }
        : msg
    ));

    let i = 0;
    const timer = setInterval(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              responses: msg.responses.map(resp => 
                resp.modelId === modelId 
                  ? { 
                      ...resp, 
                      displayText: fullText.slice(0, i + 1),
                      isTyping: i < fullText.length - 1
                    }
                  : resp
              )
            }
          : msg
      ));
      
      i++;
      if (i >= fullText.length) {
        clearInterval(timer);
      }
    }, speed);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = useCallback(async (content: string) => {
    if (selectedModels.length === 0) return;

    // Validate content is a string
    if (typeof content !== 'string' || !content.trim()) {
      console.error('Invalid message content:', content);
      return;
    }

    // Use a more unique ID to prevent duplicates
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

      // Start typing animation for successful responses
      responses.forEach(response => {
        if (!response.error && response.response) {
          typeMessage(messageId, response.modelId, response.response);
        }
      });

      // Persist to Supabase if logged in - only save successful responses
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const models = selectedModels.map(m => m.name);
        const successfulResponses = responses.filter(r => !r.error);
        
        if (successfulResponses.length > 0) {
          const payload = {
            user_id: user.id,
            prompt: content,
            models,
            responses: successfulResponses.reduce((acc: Record<string, { text: string; error: string | null }>, r) => {
              const model = selectedModels.find(m => m.id === r.modelId);
              const modelName = model?.name || r.modelId;
              acc[modelName] = { text: r.response, error: null };
              return acc;
            }, {}),
          };
          
          try {
            await supabase.from('chat_history').insert(payload);
          } catch (dbError) {
            console.error('Error saving to database:', dbError);
          }
        }
      }
    } catch (error) {
      console.error('Error sending messages:', error);
    }
  }, [selectedModels, typeMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pass sendMessage function to parent when component mounts or sendMessage changes
  useEffect(() => {
    if (onSendMessage) {
      onSendMessage(sendMessage);
    }
  }, [onSendMessage, sendMessage]);

  const togglePanelCollapse = (modelId: string) => {
    setPanelStates(prev => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        isCollapsed: !prev[modelId]?.isCollapsed
      }
    }));
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show toast notification (you can implement this)
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const estimateTokens = (text: string) => {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  };

  if (selectedModels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Ready to Compare AI Models</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Select AI models from the header to start comparing their responses side by side.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Display - Horizontal Layout */}
      <div className="flex-1 flex overflow-hidden">
        {selectedModels.map((model) => {
          const panelState = panelStates[model.id];
          const isCollapsed = panelState?.isCollapsed || false;
          
          return (
            <div 
              key={model.id} 
              className={cn(
                "border-r border-gray-700/50 last:border-r-0 flex flex-col",
                isCollapsed ? "w-16" : "flex-1"
              )}
            >
              {/* Model Header */}
              <div className={cn(
                "flex-shrink-0 bg-gradient-to-r shadow-lg backdrop-blur-sm",
                getModelColor(model.id)
              )}>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      {!isCollapsed && (
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-white text-sm truncate">{model.name}</h3>
                          <p className="text-white/80 text-xs truncate">{model.provider}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePanelCollapse(model.id)}
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors"
                        title={isCollapsed ? "Expand" : "Collapse"}
                      >
                        <svg className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              {!isCollapsed && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/30">
                  {messages.map((message) => {
                    const response = message.responses.find(r => r.modelId === model.id);
                    if (!response) return null;

                    return (
                      <div key={message.id} className="space-y-4">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="bg-white text-gray-900 rounded-2xl px-4 py-3 max-w-[85%] shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              </div>
                              <span className="text-xs font-medium text-gray-600">You</span>
                              <span className="text-xs text-gray-500 ml-auto">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-4 py-3 max-w-[85%] shadow-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                </div>
                                <span className="text-xs font-medium text-gray-300">{model.name}</span>
                                {response.timestamp && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(response.timestamp)}
                                  </span>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              {!response.isLoading && response.response && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => copyMessage(response.displayText || response.response)}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors"
                                    title="Copy"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                  <button
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors"
                                    title="Edit"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>

                            {response.isLoading ? (
                              <div className="flex items-center gap-3 py-4">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-sm text-gray-400">Thinking...</span>
                              </div>
                            ) : response.isTyping ? (
                              <div className="flex items-center gap-3 py-4">
                                <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                                  {response.displayText}
                                  <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse"></span>
                                </div>
                              </div>
                            ) : response.error ? (
                              <div className="text-red-400 text-sm py-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">Error</span>
                                </div>
                                <p>{response.error}</p>
                              </div>
                            ) : (
                              <div className="group">
                                <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap mb-3">
                                  {response.displayText || response.response}
                                </div>
                                
                                {/* Response metadata */}
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                                  <span>~{estimateTokens(response.displayText || response.response)} tokens</span>
                                  <div className="flex items-center gap-3">
                                    <button className="hover:text-green-400 transition-colors" title="Thumbs up">
                                      👍
                                    </button>
                                    <button className="hover:text-red-400 transition-colors" title="Thumbs down">
                                      👎
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EnhancedChatInterface;
