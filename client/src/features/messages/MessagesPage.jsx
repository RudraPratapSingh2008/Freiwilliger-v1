import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ConversationList from '@/components/messages/ConversationList';
import ChatWindow from '@/components/messages/ChatWindow';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import useSocket from '@/hooks/useSocket';
import useUnreadCount from '@/hooks/useUnreadCount';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const { user } = useSelector((state) => state.auth);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // ── Real data hooks ──────────────────────────────────────────────────────
  const {
    conversations,
    isLoading: isLoadingConversations,
    updateConversation,
  } = useConversations();

  const {
    messages,
    isLoading: isLoadingMessages,
    appendMessage,
  } = useMessages(activeConversation?._id);

  const {
    messages: socketMessages,
    sendMessage: socketSendMessage,
    isTyping,
    setTyping,
  } = useSocket(activeConversation?._id);

  const {
    totalUnread,
    unreadByConversation,
    markAsRead,
    initFromConversations,
  } = useUnreadCount();

  // ── Seed unread counts from conversations API data ────────────────────
  useEffect(() => {
    if (conversations.length > 0) {
      initFromConversations(conversations);
    }
  }, [conversations, initFromConversations]);

  // ── Merge socket messages into message list ──────────────────────────────
  useEffect(() => {
    if (socketMessages.length > 0) {
      const latest = socketMessages[socketMessages.length - 1];
      appendMessage(latest);
    }
  }, [socketMessages, appendMessage]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectConversation = useCallback(
    (conversation) => {
      setActiveConversation(conversation);
      setShowChatOnMobile(true);

      // Mark this conversation as read
      markAsRead(conversation._id);

      // Also reset the unreadCount in the conversation list sidebar
      updateConversation(conversation._id, (conv) => ({
        ...conv,
        unreadCount: 0,
      }));
    },
    [markAsRead, updateConversation]
  );

  const handleSendMessage = useCallback(
    (messageData) => {
      if (!activeConversation?._id || !messageData.text?.trim()) return;

      // Send via Socket.io (primary path)
      socketSendMessage(messageData.text);

      // Optimistically update this conversation's lastMessage in the sidebar
      updateConversation(activeConversation._id, (conv) => ({
        ...conv,
        lastMessage: {
          text: messageData.text,
          timestamp: new Date(),
          senderId: user?._id,
        },
      }));
    },
    [activeConversation?._id, socketSendMessage, updateConversation, user?._id]
  );

  const handleTyping = useCallback(
    (typing) => {
      setTyping(typing);
    },
    [setTyping]
  );

  const handleBackToList = () => {
    setShowChatOnMobile(false);
    setActiveConversation(null);
  };

  // ── Merge live unread counts into conversations for the sidebar ──────
  const conversationsWithUnread = conversations.map((conv) => ({
    ...conv,
    unreadCount: unreadByConversation[conv._id] ?? conv.unreadCount ?? 0,
  }));

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Conversation List - Hidden on mobile when chat is open */}
      <div
        className={cn(
          'w-full md:w-80 flex-shrink-0 border-r border-gray-200 hidden md:flex flex-col',
          !showChatOnMobile && 'flex'
        )}
      >
        <ConversationList
          conversations={conversationsWithUnread}
          activeConversationId={activeConversation?._id}
          onSelectConversation={handleSelectConversation}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Chat Window - Full screen on mobile, right panel on desktop */}
      <div className={cn('flex-1 flex flex-col', !showChatOnMobile && 'hidden md:flex')}>
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          currentUserId={user?._id}
          onSendMessage={handleSendMessage}
          onBack={handleBackToList}
          isLoading={isLoadingMessages}
          isTyping={isTyping}
          onTyping={handleTyping}
        />
      </div>

      {/* Empty state on desktop */}
      {!activeConversation && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 text-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Select a conversation</p>
            <p className="text-sm text-gray-400">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
