// We need to mock firebase-admin before requiring fcm.service
jest.mock('../../src/config/firebase.admin', () => ({}));
jest.mock('../../src/models/User.model', () => ({}));

const { isUserOnline } = require('../../src/services/fcm.service');

describe('fcm.service', () => {
  afterEach(() => {
    delete global._io;
  });

  describe('isUserOnline', () => {
    it('returns false when global._io is not set', () => {
      delete global._io;
      expect(isUserOnline('user123')).toBe(false);
    });

    it('returns false when io is null', () => {
      global._io = null;
      expect(isUserOnline('user123')).toBe(false);
    });

    it('returns false when io is undefined', () => {
      global._io = undefined;
      expect(isUserOnline('user123')).toBe(false);
    });

    it('returns falsy when room does not exist', () => {
      global._io = {
        sockets: {
          adapter: {
            rooms: new Map(),
          },
        },
      };
      expect(isUserOnline('user123')).toBeFalsy();
    });

    it('returns false when room has no sockets', () => {
      const rooms = new Map();
      rooms.set('user:user123', new Set());
      global._io = {
        sockets: {
          adapter: { rooms },
        },
      };
      expect(isUserOnline('user123')).toBeFalsy();
    });

    it('returns true when room has active sockets', () => {
      const rooms = new Map();
      rooms.set('user:user123', new Set(['socket1', 'socket2']));
      global._io = {
        sockets: {
          adapter: { rooms },
        },
      };
      expect(isUserOnline('user123')).toBe(true);
    });

    it('handles errors gracefully and returns false', () => {
      global._io = {
        sockets: null, // Will throw when accessing .adapter
      };
      expect(isUserOnline('user123')).toBe(false);
    });
  });
});
