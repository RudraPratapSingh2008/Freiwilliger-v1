// Message status constants
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

// Message types
export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  LOCATION: 'location',
  SYSTEM: 'system',
};

// Conversation filters
export const CONVERSATION_FILTER = {
  ALL: 'all',
  VOLUNTEERS: 'volunteers',
  ORGANISERS: 'organisers',
  UNREAD: 'unread',
  ARCHIVED: 'archived',
};

// Typing status
export const TYPING_STATUS = {
  TYPING: 'typing',
  STOPPED: 'stopped',
};

// Socket events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Chat
  JOIN_CONVERSATION: 'join:conversation',
  LEAVE_CONVERSATION: 'leave:conversation',
  SEND_MESSAGE: 'send:message',
  NEW_MESSAGE: 'new:message',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_EDITED: 'message:edited',

  // Typing
  USER_TYPING: 'user:typing',
  USER_STOPPED_TYPING: 'user:stopped-typing',

  // Notifications
  NOTIFICATION: 'notification',
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_DELETED: 'conversation:deleted',

  // Online status
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
};

// Error messages
export const ERROR_MESSAGES = {
  SEND_FAILED: 'Failed to send message. Please try again.',
  LOAD_FAILED: 'Failed to load messages. Please try again.',
  DELETE_FAILED: 'Failed to delete message. Please try again.',
  EDIT_FAILED: 'Failed to edit message. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent',
  MESSAGE_DELETED: 'Message deleted',
  MESSAGE_EDITED: 'Message edited',
  CONVERSATION_CREATED: 'Conversation created',
};

// Limits and constraints
export const MESSAGE_LIMITS = {
  MAX_LENGTH: 5000,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  TYPING_TIMEOUT: 3000, // 3 seconds
  DEBOUNCE_DELAY: 300, // 300ms
};

// Date/Time formatting
export const DATE_FORMAT = {
  SAME_DAY: 'HH:mm',
  SAME_WEEK: 'ddd HH:mm',
  SAME_YEAR: 'MMM d HH:mm',
  DIFFERENT_YEAR: 'MMM d yyyy HH:mm',
};

// Emoji categories for message reactions
export const EMOJI_REACTIONS = {
  LIKE: '👍',
  LOVE: '❤️',
  LAUGH: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😠',
};
