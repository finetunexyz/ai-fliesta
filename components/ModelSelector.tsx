'use client';


import { AI_MODELS, AIModel } from '@/lib/ai-models';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModels: AIModel[];
  onModelToggle: (model: AIModel) => void;
}

export function ModelSelector({ selectedModels, onModelToggle }: ModelSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-base font-semibold mb-3 text-white">
        Select AI Models to Compare
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {AI_MODELS.map((model) => {
          const isSelected = selectedModels.some(m => m.id === model.id);
          return (
            <button
              key={model.id}
              onClick={() => onModelToggle(model)}
              className={cn(
                "flex-shrink-0 p-3 rounded-lg border-2 transition-all duration-300 min-w-[180px]",
                "hover:shadow-lg hover:scale-105 transform",
                isSelected
                  ? "border-purple-400 bg-gradient-to-br from-purple-500/20 to-blue-600/20 backdrop-blur-sm"
                  : "border-gray-600 bg-gray-800/50 backdrop-blur-sm hover:border-gray-500"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center",
                  isSelected 
                    ? "bg-gradient-to-r from-purple-400 to-blue-500" 
                    : "bg-gray-600"
                )}>
                  <span className="text-white font-bold text-xs">
                    {model.name.split(' ')[0]}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-xs text-white">
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {model.provider}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-300 leading-relaxed">
                {model.description}
              </div>
              {isSelected && (
                <div className="mt-2 flex items-center gap-1 text-purple-400 text-xs font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
