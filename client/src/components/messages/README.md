# Messages UI Components

This directory contains all the UI components for the Messages section of Freiwilliger.

## Components Overview

### Core Components

#### `ConversationList.jsx`
Left panel showing list of conversations with search and filtering.

**Features:**
- Search conversations by name or message content
- Filter by role (All, Volunteers, Organisers)
- Display unread badge count
- Show last message preview with timestamp
- Highlight active conversation

**Props:**
- `conversations` (array): List of conversation objects
- `activeConversationId` (string): ID of currently selected conversation
- `onSelectConversation` (function): Callback when conversation is selected
- `isLoading` (boolean): Loading state
- `className` (string): Additional CSS classes

**Usage:**
```jsx
<ConversationList
  conversations={conversations}
  activeConversationId={activeId}
  onSelectConversation={handleSelect}
  isLoading={isLoading}
/>
```

---

#### `ChatWindow.jsx`
Right panel showing the active conversation with message display and input.

**Features:**
- Display messages with sender info
- Show online/offline indicator
- Auto-scroll to latest message
- Typing indicator
- Message input with send button
- Read receipts (single/double check marks)
- Group chat support with sender names
- Mobile back button

**Props:**
- `conversation` (object): Current conversation object
- `messages` (array): Array of message objects
- `currentUserId` (string): ID of current user
- `onSendMessage` (function): Callback to send message
- `onBack` (function): Callback for back button (mobile)
- `isLoading` (boolean): Loading state
- `isTyping` (boolean): Typing indicator state
- `className` (string): Additional CSS classes

**Usage:**
```jsx
<ChatWindow
  conversation={activeConversation}
  messages={messages}
  currentUserId={user._id}
  onSendMessage={handleSendMessage}
  onBack={handleBack}
  isLoading={isLoading}
  isTyping={isTyping}
/>
```

---

#### `ConversationListItem.jsx`
Individual conversation item in the list.

**Features:**
- Avatar with fallback initials
- Conversation name
- Last message preview (truncated)
- Timestamp (relative or date)
- Unread count badge

**Props:**
- `conversation` (object): Conversation object
- `isActive` (boolean): Whether this is the active conversation
- `onClick` (function): Callback when clicked
- `className` (string): Additional CSS classes

---

#### `MessageBubble.jsx`
Individual message bubble component.

**Features:**
- Different styling for own vs other messages
- Avatar display for group chats
- Sender name for group chats
- Timestamp display
- Read receipt indicators
- Message text with word wrapping

**Props:**
- `message` (object): Message object with `text`, `timestamp`, `readStatus`
- `isOwn` (boolean): Whether message is from current user
- `senderAvatar` (string): Avatar URL of sender
- `senderName` (string): Name of sender
- `showAvatar` (boolean): Whether to show avatar
- `showTimestamp` (boolean): Whether to show timestamp
- `className` (string): Additional CSS classes

---

#### `TypingIndicator.jsx`
Animated typing indicator component.

**Features:**
- Animated bouncing dots
- "typing" text label
- Smooth animation

**Props:**
- `className` (string): Additional CSS classes

**Usage:**
```jsx
{isTyping && <TypingIndicator />}
```

---

#### `ReadReceipt.jsx`
Message read receipt indicator (check marks).

**Features:**
- Single check for sent
- Double check for delivered
- Double check in indigo for read

**Props:**
- `status` (string): One of 'sent', 'delivered', 'read'
- `className` (string): Additional CSS classes

---

## Data Structure

### Conversation Object
```javascript
{
  _id: "conv_123",
  otherParty: {
    _id: "user_456",
    name: "Rajesh Kumar",
    avatar: "https://...",
    role: "volunteer", // or "organiser"
    isOnline: true
  },
  lastMessage: {
    text: "Thanks for the opportunity!",
    timestamp: "2024-01-15T10:30:00Z",
    senderId: "user_456"
  },
  unreadCount: 2,
  isGroupChat: false,
  eventName: null, // For group chats
  currentUserId: "user_123",
  isMuted: false,
  isArchived: false
}
```

### Message Object
```javascript
{
  _id: "msg_789",
  conversationId: "conv_123",
  senderId: "user_456",
  sender: {
    _id: "user_456",
    name: "Rajesh Kumar",
    avatar: "https://..."
  },
  text: "Thanks for the opportunity!",
  timestamp: "2024-01-15T10:30:00Z",
  readStatus: "read", // 'sent', 'delivered', 'read'
  type: "text", // 'text', 'image', 'file', etc.
  attachments: [],
  edited: false,
  editedAt: null
}
```

---

## Integration with MessagesPage

The `MessagesPage.jsx` in `/features/messages/` orchestrates all these components:

```jsx
<div className="h-screen flex flex-col md:flex-row">
  {/* Left panel - Conversation List */}
  <ConversationList
    conversations={conversations}
    activeConversationId={activeConversation?._id}
    onSelectConversation={handleSelectConversation}
  />

  {/* Right panel - Chat Window */}
  <ChatWindow
    conversation={activeConversation}
    messages={messages}
    currentUserId={user?._id}
    onSendMessage={handleSendMessage}
    onBack={handleBackToList}
  />
</div>
```

---

## Styling

All components use:
- **Tailwind CSS** for styling
- **shadcn/ui** components (Button, Input, Badge, etc.)
- **Lucide React** icons
- **Color scheme**: Indigo primary, gray accents

### Key Colors
- Primary: `indigo-600`
- Own messages: `bg-indigo-600 text-white`
- Other messages: `bg-gray-200 text-gray-900`
- Active state: `bg-indigo-50 border-l-4 border-indigo-600`

---

## Mobile Responsiveness

- **Desktop (md+)**: Split view with conversation list on left, chat on right
- **Mobile**: Full-screen conversation list, chat slides in when selected
- Back button appears on mobile chat view to return to list

---

## Next Steps

1. **Connect to Backend APIs**: Replace mock data with actual API calls from `messagesApi.js`
2. **Implement Socket.io**: Use `useSocket` hook for real-time messaging
3. **Add Message Reactions**: Implement emoji reactions on messages
4. **File Uploads**: Add image/file attachment support
5. **Message Search**: Implement message search within conversations
6. **Notifications**: Add toast notifications for new messages
7. **Typing Indicators**: Emit typing events via Socket.io
8. **Read Receipts**: Update read status in real-time

---

## Component Dependencies

```
ConversationList
├── Input (shadcn/ui)
├── Tabs, TabsList, TabsTrigger, TabsContent (shadcn/ui)
├── ScrollArea (shadcn/ui)
├── Search icon (lucide-react)
└── ConversationListItem
    ├── Avatar, AvatarImage, AvatarFallback (shadcn/ui)
    └── Badge (shadcn/ui)

ChatWindow
├── Avatar, AvatarImage, AvatarFallback (shadcn/ui)
├── Button (shadcn/ui)
├── Input (shadcn/ui)
├── ScrollArea (shadcn/ui)
├── Separator (shadcn/ui)
├── Icons (lucide-react)
├── MessageBubble
│   ├── Avatar (shadcn/ui)
│   └── ReadReceipt
└── TypingIndicator
```

---

## Testing

When testing these components:

1. Verify conversation list filters work correctly
2. Test message sending and display
3. Check mobile responsiveness
4. Verify read receipts update correctly
5. Test typing indicator animation
6. Check timestamp formatting for different time ranges
7. Test unread badge display and updates
