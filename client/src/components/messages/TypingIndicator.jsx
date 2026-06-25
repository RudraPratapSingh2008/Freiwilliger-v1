import React from 'react';
import { cn } from '@/lib/utils';

export default function TypingIndicator({ className }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-xs text-gray-500 mr-1">typing</span>
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
