import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ConversationList from '@/components/messages/ConversationList';
import ChatWindow from '@/components/messages/ChatWindow';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      // TODO: Replace with actual API call
      // const response = await axios.get('/api/messages/conversations');
      // setConversations(response.data);
      
      // Mock data for development
      setConversations([
        {
          _id: '1',
          otherParty: {
            _id: 'user2',
            name: 'Rajesh Kumar',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
            role: 'volunteer',
            isOnline: true,
          },
          lastMessage: {
            text: 'Thanks for the opportunity! I am interested in this event.',
            timestamp: new Date(Date.now() - 3600000),
            senderId: 'user2',
          },
          unreadCount: 2,
          currentUserId: user?._id,
          isGroupChat: false,
        },
        {
          _id: '2',
          otherParty: {
            _id: 'org1',
            name: 'NGO India Foundation',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NGO',
            role: 'organiser',
            isOnline: false,
          },
          lastMessage: {
            text: 'Your application has been approved!',
            timestamp: new Date(Date.now() - 86400000),
            senderId: 'org1',
          },
          unreadCount: 0,
          currentUserId: user?._id,
          isGroupChat: false,
        },
      ]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user?._id]);

  const handleSelectConversation = useCallback((conversation) => {
    setActiveConversation(conversation);
    setShowChatOnMobile(true);
    fetchMessages(conversation._id);
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      setIsLoadingMessages(true);
      // TODO: Replace with actual API call
      // const response = await axios.get(`/api/messages/conversations/${conversationId}`);
      // setMessages(response.data.messages);

      // Mock data for development
      setMessages([
        {
          _id: 'msg1',
          conversationId,
          senderId: 'user2',
          sender: {
            _id: 'user2',
            name: 'Rajesh Kumar',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
          },
          text: 'Hi! I saw your event posting.',
          timestamp: new Date(Date.now() - 7200000),
          readStatus: 'read',
        },
        {
          _id: 'msg2',
          conversationId,
          senderId: user?._id,
          sender: {
            _id: user?._id,
            name: user?.name,
          },
          text: 'Hey! Thanks for your interest. Tell me more about your experience.',
          timestamp: new Date(Date.now() - 5400000),
          readStatus: 'read',
        },
        {
          _id: 'msg3',
          conversationId,
          senderId: 'user2',
          sender: {
            _id: 'user2',
            name: 'Rajesh Kumar',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
          },
          text: 'Thanks for the opportunity! I am interested in this event.',
          timestamp: new Date(Date.now() - 3600000),
          readStatus: 'delivered',
        },
      ]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user?._id]);

  const handleSendMessage = useCallback(
    async (messageData) => {
      try {
        // TODO: Replace with actual API call
        // const response = await axios.post('/api/messages/send', messageData);
        // const newMessage = response.data;

        // Mock: Add message to local state
        const newMessage = {
          _id: `msg_${Date.now()}`,
          conversationId: messageData.conversationId,
          senderId: user?._id,
          sender: {
            _id: user?._id,
            name: user?.name,
          },
          text: messageData.text,
          timestamp: messageData.timestamp,
          readStatus: 'sent',
        };

        setMessages((prev) => [...prev, newMessage]);

        // Update conversation's last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === messageData.conversationId
              ? {
                  ...conv,
                  lastMessage: {
                    text: messageData.text,
                    timestamp: messageData.timestamp,
                    senderId: user?._id,
                  },
                }
              : conv
          )
        );
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [user?._id]
  );

  const handleBackToList = () => {
    setShowChatOnMobile(false);
    setActiveConversation(null);
  };

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
          conversations={conversations}
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
