import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ConversationListItem({
  conversation,
  isActive,
  onClick,
  className,
}) {
  const truncateText = (text, length = 50) => {
    if (!text) return 'No messages yet';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const otherParty = conversation.participants?.find(
    (p) => p._id !== conversation.currentUserId
  ) || conversation.otherParty;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left hover:bg-gray-100',
        isActive && 'bg-indigo-50 border-l-4 border-indigo-600'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={otherParty?.avatar} alt={otherParty?.name} />
        <AvatarFallback className="text-sm font-semibold">
          {otherParty?.name?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Conversation info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {otherParty?.name || 'Unknown'}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatTime(conversation.lastMessage?.timestamp)}
          </span>
        </div>

        <p className="text-sm text-gray-600 truncate">
          {truncateText(conversation.lastMessage?.text)}
        </p>
      </div>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <Badge
          variant="default"
          className="ml-2 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 rounded-full h-6 w-6 flex items-center justify-center p-0"
        >
          <span className="text-xs font-bold">
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </span>
        </Badge>
      )}
    </button>
  );
}
