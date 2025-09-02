'use client';


import Link from 'next/link';
import { HeaderAuth } from './HeaderAuth';

interface EnhancedHeaderProps {
  selectedModelsCount: number;
  onNewChat?: () => void;
  onOpenSettings?: () => void;
}

export function EnhancedHeader({ selectedModelsCount, onNewChat, onOpenSettings }: EnhancedHeaderProps) {

  return (
    <header className="relative bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 shadow-xl border-b border-purple-400/20">
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-purple-500/90 to-blue-600/90 backdrop-blur-sm"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and attribution */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">AI Flista</h1>
              </div>
            </div>
            
            {/* Attribution */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
              <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <a 
                href="https://github.com/finetunexyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 text-sm font-medium hover:text-white transition-colors"
              >
                Made by Dhruv
              </a>
            </div>
          </div>

          {/* Center - Model count (if any selected) */}
          {selectedModelsCount > 0 && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{selectedModelsCount}</span>
              </div>
              <span className="text-white/90 text-sm font-medium">
                {selectedModelsCount === 1 ? 'Model Selected' : 'Models Selected'}
              </span>
            </div>
          )}

          {/* Right side - Actions and user */}
          <div className="flex items-center gap-3">

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* New Chat */}
              <button
                onClick={onNewChat}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="New Chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>

              {/* History */}
              <Link
                href="/history"
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="Chat History"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>

              {/* Settings */}
              <button
                onClick={onOpenSettings}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* User authentication */}
            <HeaderAuth />
          </div>
        </div>
      </div>
    </header>
  );
}
