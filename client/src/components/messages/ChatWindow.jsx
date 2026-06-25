import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Send,
  MoreVertical,
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { cn } from '@/lib/utils';

export default function ChatWindow({
  conversation,
  messages = [],
  currentUserId,
  onSendMessage,
  onBack,
  isLoading = false,
  isTyping = false,
  className,
}) {
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    onSendMessage({
      conversationId: conversation._id,
      text: messageText,
      timestamp: new Date(),
    });

    setMessageText('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className={cn(
        'flex items-center justify-center h-full bg-gray-50 text-gray-500',
        className
      )}>
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  const isGroupChat = conversation.isGroupChat;
  const otherParty = conversation.participants?.find(
    (p) => p._id !== currentUserId
  ) || conversation.otherParty;

  const isOnline = otherParty?.isOnline;

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          {/* Back button (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Avatar and info */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParty?.avatar} alt={otherParty?.name} />
            <AvatarFallback className="text-sm font-semibold">
              {otherParty?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {isGroupChat
                  ? `📢 Group · ${conversation.eventName || 'Unnamed Group'}`
                  : otherParty?.name || 'Unknown'}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
              <span className="text-xs text-gray-500">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* More options button */}
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs text-gray-400">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const showTimestamp =
                index === 0 ||
                new Date(messages[index - 1].timestamp).getTime() -
                  new Date(message.timestamp).getTime() >
                  300000; // 5 minutes

              return (
                <div key={message._id || index}>
                  {/* Timestamp separator */}
                  {showTimestamp && (
                    <div className="flex items-center justify-center my-4">
                      <Separator className="flex-1" />
                      <span className="px-3 text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                      <Separator className="flex-1" />
                    </div>
                  )}

                  {/* Message bubble */}
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    senderAvatar={isGroupChat ? message.sender?.avatar : null}
                    senderName={isGroupChat ? message.sender?.name : null}
                    showAvatar={isGroupChat}
                    showTimestamp={true}
                  />
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-3">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 resize-none rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
