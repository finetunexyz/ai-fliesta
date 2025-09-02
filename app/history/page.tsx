'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ResponseModal } from '@/components/ResponseModal';

interface ChatHistoryItem {
  id: string;
  prompt: string;
  models: string[];
  responses: Record<string, { text: string; error: string | null }>;
  created_at: string;
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    modelName: string;
    response: string;
  }>({
    isOpen: false,
    modelName: '',
    response: ''
  });
  const router = useRouter();

  const loadChatHistory = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading chat history:', error);
      } else {
        console.log('Loaded chat history:', data);
        setChatHistory(data || []);
        // Auto-select the first conversation if available
        if (data && data.length > 0 && !selectedChat) {
          setSelectedChat(data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedChat]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      await loadChatHistory(user.id);
    };

    checkAuth();
  }, [router, loadChatHistory]);

  const deleteConversation = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', chatId);

      if (error) {
        console.error('Error deleting conversation:', error);
        return;
      }

      // Remove from local state
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was selected, select the first available one
      if (selectedChat?.id === chatId) {
        const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
        setSelectedChat(remainingChats.length > 0 ? remainingChats[0] : null);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getModelColor = (modelName: string) => {
    const colors = {
      'GPT': 'from-green-500 to-green-600',
      'Claude': 'from-orange-500 to-orange-600',
      'Gemini': 'from-blue-500 to-blue-600',
      'DeepSeek': 'from-purple-500 to-purple-600'
    } as Record<string, string>;
    return colors[modelName] || 'from-gray-500 to-gray-600';
  };

  const getModelIcon = (modelName: string) => {
    const icons = {
      'GPT': '🤖',
      'Claude': '🤖',
      'Gemini': '🤖',
      'DeepSeek': '🤖'
    } as Record<string, string>;
    return icons[modelName] || '🤖';
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Chat</span>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Chat History</h1>
              <p className="text-purple-100 text-sm">View and manage your past conversations</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm">
                {user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Sidebar - Conversations */}
          <div className="w-80 bg-gray-800/50 border-r border-gray-700/50 flex flex-col">
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold text-white">
                Conversations ({chatHistory.length})
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {chatHistory.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="p-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedChat?.id === chat.id
                          ? 'bg-purple-600/20 border border-purple-500/30'
                          : 'bg-gray-700/30 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {truncateText(chat.prompt, 40)}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {formatDate(chat.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(chat.id);
                          }}
                          className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Selected Conversation */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Conversation Header */}
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {selectedChat.prompt}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Created on {formatFullDate(selectedChat.created_at)}
                  </p>
                </div>

                {/* Conversation Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* User Message */}
                  <div className="flex justify-end mb-6">
                    <div className="bg-white text-gray-900 rounded-lg p-4 max-w-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">You</span>
                      </div>
                      <p className="text-sm">{selectedChat.prompt}</p>
                    </div>
                  </div>

                  {/* AI Model Responses */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {selectedChat.models.map((modelName) => {
                      const response = selectedChat.responses[modelName];
                      return (
                        <div key={modelName} className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden">
                          {/* Model Header */}
                          <div className={`p-3 bg-gradient-to-r ${getModelColor(modelName)}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getModelIcon(modelName)}</span>
                              <div>
                                <h3 className="font-semibold text-white text-sm">{modelName}</h3>
                                <p className="text-white/80 text-xs">
                                  {modelName === 'GPT' ? 'OpenAI' : 
                                   modelName === 'Claude' ? 'Anthropic' :
                                   modelName === 'Gemini' ? 'Google' : 'DeepSeek'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Response Content */}
                          <div className="p-4">
                            {response?.error ? (
                              <div className="text-red-400 text-sm">
                                Error: {response.error}
                              </div>
                            ) : response?.text ? (
                              <div className="text-gray-300 text-sm leading-relaxed">
                                {response.text.length > 200 ? (
                                  <>
                                    {response.text.substring(0, 200)}...
                                    <button
                                      onClick={() => {
                                        setModalState({
                                          isOpen: true,
                                          modelName,
                                          response: response.text
                                        });
                                      }}
                                      className="block mt-2 text-purple-400 hover:text-purple-300 text-xs"
                                    >
                                      Read more
                                    </button>
                                  </>
                                ) : (
                                  response.text
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm italic">
                                No response available
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Select a Conversation</h2>
                  <p className="text-gray-400">
                    Choose a conversation from the sidebar to view the details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Response Modal */}
        <ResponseModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, modelName: '', response: '' })}
          modelName={modalState.modelName}
          response={modalState.response}
        />
      </div>
    </ProtectedRoute>
  );
}
