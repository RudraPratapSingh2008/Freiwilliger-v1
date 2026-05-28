let io;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a private room for the user to receive targeted notifications
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized!');
  }
  return io;
};

const emitNotification = (userId, data) => {
  const ioInstance = getIO();
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit('notification', data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNotification,
};
