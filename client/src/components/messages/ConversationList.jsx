import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import ConversationListItem from './ConversationListItem';
import { cn } from '@/lib/utils';

export default function ConversationList({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  isLoading = false,
  className,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter conversations based on search and tab
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filter by role (Volunteers or Organisers)
    if (activeTab === 'volunteers') {
      filtered = filtered.filter((conv) => conv.otherParty?.role === 'volunteer');
    } else if (activeTab === 'organisers') {
      filtered = filtered.filter((conv) => conv.otherParty?.role === 'organiser');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((conv) => {
        const name = conv.otherParty?.name?.toLowerCase() || '';
        const lastMessage = conv.lastMessage?.text?.toLowerCase() || '';
        return name.includes(query) || lastMessage.includes(query);
      });
    }

    return filtered;
  }, [conversations, searchQuery, activeTab]);

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-3 border-b border-gray-200">
          <TabsList className="w-full bg-gray-100">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex-1">
              Volunteers
            </TabsTrigger>
            <TabsTrigger value="organisers" className="flex-1">
              Organisers
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Conversation list */}
        <TabsContent value={activeTab} className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <p>Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                  <p className="text-sm">No conversations found</p>
                  <p className="text-xs text-gray-400">
                    {searchQuery
                      ? 'Try a different search'
                      : 'Start a new conversation'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <ConversationListItem
                      key={conversation._id}
                      conversation={conversation}
                      isActive={activeConversationId === conversation._id}
                      onClick={() => onSelectConversation(conversation)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
