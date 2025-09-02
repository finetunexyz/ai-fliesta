'use client';

import { useState, useEffect } from 'react';
import { AIModel, AI_MODELS } from '@/lib/ai-models';
import { cn } from '@/lib/utils';

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModels: AIModel[];
  onModelToggle: (model: AIModel) => void;
  maxModels?: number;
}

type ModelCategory = 'all' | 'pro' | 'free' | 'openai' | 'anthropic' | 'google' | 'deepseek';

export function ModelSelectionModal({ 
  isOpen, 
  onClose, 
  selectedModels, 
  onModelToggle, 
  maxModels = 5 
}: ModelSelectionModalProps) {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const categories = [
    { id: 'all' as ModelCategory, label: 'All Models', count: AI_MODELS.length },
    { id: 'pro' as ModelCategory, label: 'Pro Models', count: AI_MODELS.filter(m => ['gpt', 'claude', 'gemini'].includes(m.id)).length },
    { id: 'free' as ModelCategory, label: 'Free Models', count: AI_MODELS.filter(m => !['gpt', 'claude', 'gemini'].includes(m.id)).length },
    { id: 'openai' as ModelCategory, label: 'OpenAI', count: AI_MODELS.filter(m => m.provider === 'OpenAI').length },
    { id: 'anthropic' as ModelCategory, label: 'Anthropic', count: AI_MODELS.filter(m => m.provider === 'Anthropic').length },
    { id: 'google' as ModelCategory, label: 'Google', count: AI_MODELS.filter(m => m.provider === 'Google').length },
  ];

  const filteredModels = AI_MODELS.filter(model => {
    // Category filter
    if (activeCategory === 'pro' && !['gpt', 'claude', 'gemini'].includes(model.id)) return false;
    if (activeCategory === 'free' && ['gpt', 'claude', 'gemini'].includes(model.id)) return false;
    if (activeCategory === 'openai' && model.provider !== 'OpenAI') return false;
    if (activeCategory === 'anthropic' && model.provider !== 'Anthropic') return false;
    if (activeCategory === 'google' && model.provider !== 'Google') return false;
    if (activeCategory === 'deepseek' && model.provider !== 'DeepSeek') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Select Models</h2>
            <p className="text-gray-400 text-sm">
              Choose up to {maxModels} models • {selectedModels.length}/{maxModels} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0",
                  activeCategory === category.id
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                )}
              >
                {category.label}
                <span className="ml-2 text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Models Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredModels.map((model) => {
              const isSelected = selectedModels.some(m => m.id === model.id);
              const canSelect = selectedModels.length < maxModels || isSelected;
              const isPro = ['gpt', 'claude', 'gemini'].includes(model.id);
              
              return (
                <div
                  key={model.id}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200 group",
                    isSelected
                      ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20 cursor-pointer"
                      : canSelect
                      ? "border-gray-600/50 bg-gray-800/30 hover:border-gray-500/50 hover:bg-gray-800/50 cursor-pointer"
                      : "border-gray-700/30 bg-gray-800/20 opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (canSelect) {
                      onModelToggle(model);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white text-sm truncate">{model.name}</h3>
                        {isPro && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{model.provider}</p>
                      <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                        {model.description}
                      </p>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border-2 border-purple-500 bg-purple-500/5 flex items-center justify-center">
                      <div className="bg-purple-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredModels.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-400">No models found matching your search.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50 bg-gray-900/50">
          <div className="text-sm text-gray-400">
            {selectedModels.length > 0 && (
              <span>
                {selectedModels.map(m => m.name).join(', ')} selected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              disabled={selectedModels.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Continue with {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
