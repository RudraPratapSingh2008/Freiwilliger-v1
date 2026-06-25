import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ReadReceipt from './ReadReceipt';
import { cn } from '@/lib/utils';

export default function MessageBubble({
  message,
  isOwn,
  senderAvatar,
  senderName,
  showAvatar = true,
  showTimestamp = true,
  className,
}) {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        'flex gap-2 mb-3',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar (left side for others, hidden for own) */}
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="text-xs">
            {senderName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div
        className={cn(
          'flex flex-col gap-1 max-w-xs',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender name (for group chats, left side only) */}
        {!isOwn && senderName && (
          <span className="text-xs font-semibold text-gray-600 px-3">
            {senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-4 py-2 rounded-2xl break-words',
            isOwn
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none'
          )}
        >
          <p className="text-sm">{message.text}</p>
        </div>

        {/* Timestamp and read receipt */}
        <div
          className={cn(
            'flex items-center gap-1 px-3 text-xs text-gray-500',
            isOwn ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          {showTimestamp && <span>{formatTime(message.timestamp)}</span>}
          {isOwn && message.readStatus && (
            <ReadReceipt status={message.readStatus} />
          )}
        </div>
      </div>
    </div>
  );
}
