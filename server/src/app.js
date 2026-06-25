const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

// Route imports
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/users.routes')
const profileRoutes = require('./routes/profile.routes')
const eventRoutes = require('./routes/events.routes')
const messageRoutes = require('./routes/messages.routes')
const reviewRoutes = require('./routes/reviews.routes')
const networkRoutes = require('./routes/network.routes')
const contactRequestRoutes = require('./routes/contactRequest.routes')


const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
} ))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
})

app.use(limiter)

// Logging
app.use(morgan('combined'))

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Freiwilliger server is running' })
})

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/profile', profileRoutes)

// These routes currently use placeholders or are yet to be fully implemented in the build plan
app.use('/api/v1/events', eventRoutes)
app.use('/api/v1/messages', messageRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/network', networkRoutes)
app.use('/api/v1/contact-requests', contactRequestRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

module.exports = app