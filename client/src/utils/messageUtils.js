import { MESSAGE_LIMITS } from '@/constants/messages';

/**
 * Format timestamp to readable format
 * @param {Date|string} timestamp - The timestamp to format
 * @param {string} format - Format type: 'time', 'date', 'datetime', 'relative'
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (timestamp, format = 'time') => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  const diffInDays = Math.floor(diffInHours / 24);

  switch (format) {
    case 'time':
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

    case 'date':
      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      }

    case 'datetime':
      if (diffInDays === 0) {
        return date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } else if (diffInDays === 1) {
        return 'Yesterday ' +
          date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
      } else {
        return date.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }

    case 'relative':
      if (diffInHours < 1) {
        const minutes = Math.floor((now - date) / (1000 * 60));
        return minutes === 0 ? 'just now' : `${minutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      }

    default:
      return date.toLocaleString('en-IN');
  }
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return 'No messages yet';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Validate message text
 * @param {string} text - Message text to validate
 * @returns {object} Validation result { isValid, error }
 */
export const validateMessage = (text) => {
  if (!text || !text.trim()) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (text.length > MESSAGE_LIMITS.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Message cannot exceed ${MESSAGE_LIMITS.MAX_LENGTH} characters`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate file for upload
 * @param {File} file - File to validate
 * @returns {object} Validation result { isValid, error }
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (file.size > MESSAGE_LIMITS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size cannot exceed ${MESSAGE_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Check if message should show timestamp separator
 * @param {object} currentMessage - Current message
 * @param {object} previousMessage - Previous message
 * @param {number} threshold - Time threshold in milliseconds (default: 5 minutes)
 * @returns {boolean}
 */
export const shouldShowTimestampSeparator = (
  currentMessage,
  previousMessage,
  threshold = 300000
) => {
  if (!previousMessage) return true;

  const currentTime = new Date(currentMessage.timestamp).getTime();
  const previousTime = new Date(previousMessage.timestamp).getTime();

  return currentTime - previousTime > threshold;
};

/**
 * Group messages by date
 * @param {array} messages - Array of messages
 * @returns {object} Messages grouped by date
 */
export const groupMessagesByDate = (messages) => {
  const grouped = {};

  messages.forEach((message) => {
    const date = new Date(message.timestamp);
    const dateKey = date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });

  return grouped;
};

/**
 * Sort conversations by last message timestamp
 * @param {array} conversations - Array of conversations
 * @returns {array} Sorted conversations
 */
export const sortConversationsByRecent = (conversations) => {
  return [...conversations].sort((a, b) => {
    const timeA = new Date(a.lastMessage?.timestamp || 0).getTime();
    const timeB = new Date(b.lastMessage?.timestamp || 0).getTime();
    return timeB - timeA;
  });
};

/**
 * Filter conversations by role
 * @param {array} conversations - Array of conversations
 * @param {string} role - Role to filter by ('volunteer' or 'organiser')
 * @returns {array} Filtered conversations
 */
export const filterConversationsByRole = (conversations, role) => {
  return conversations.filter((conv) => conv.otherParty?.role === role);
};

/**
 * Search conversations
 * @param {array} conversations - Array of conversations
 * @param {string} query - Search query
 * @returns {array} Filtered conversations
 */
export const searchConversations = (conversations, query) => {
  if (!query.trim()) return conversations;

  const lowerQuery = query.toLowerCase();
  return conversations.filter((conv) => {
    const name = conv.otherParty?.name?.toLowerCase() || '';
    const lastMessage = conv.lastMessage?.text?.toLowerCase() || '';
    return name.includes(lowerQuery) || lastMessage.includes(lowerQuery);
  });
};

/**
 * Get conversation display name
 * @param {object} conversation - Conversation object
 * @returns {string} Display name
 */
export const getConversationDisplayName = (conversation) => {
  if (conversation.isGroupChat) {
    return `📢 Group · ${conversation.eventName || 'Unnamed Group'}`;
  }
  return conversation.otherParty?.name || 'Unknown';
};

/**
 * Check if message is recent (within last hour)
 * @param {Date|string} timestamp - Message timestamp
 * @returns {boolean}
 */
export const isRecentMessage = (timestamp) => {
  const messageTime = new Date(timestamp).getTime();
  const now = new Date().getTime();
  const diffInMinutes = (now - messageTime) / (1000 * 60);
  return diffInMinutes < 60;
};

/**
 * Sanitize message text (basic XSS prevention)
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeMessageText = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};
