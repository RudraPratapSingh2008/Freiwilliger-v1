require('dotenv').config()

const http = require('http')
const { Server } = require('socket.io')
const app = require('./src/app')
const connectDB = require('./src/config/db')

// Connect to MongoDB
connectDB()

// Create HTTP server
const httpServer = http.createServer(app)

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Socket.io middleware for authentication (placeholder)
io.use((socket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error('Authentication error'))
  }

  // TODO: Verify JWT token here
  socket.userId = 'placeholder-user-id'
  next()
})

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`📱 User connected: ${socket.id}`)

  // Join personal room
  socket.join(`user:${socket.userId}`)

  socket.on('disconnect', () => {
    console.log(`📱 User disconnected: ${socket.id}`)
  })
})

// Make io accessible to routes
app.set('io', io)

// Start server
const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
