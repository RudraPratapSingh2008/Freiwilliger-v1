const path = require('path')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const connectDB = require('./src/config/db')
const authRoutes = require('./src/routes/auth.routes')

const app = express()

// Security middleware
app.use(helmet())

// CORS — credentials: true is required for httpOnly cookie to be sent/received
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Global rate limit (auth routes have their own tighter limiters)
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

// Cookie parser — required for httpOnly refreshToken cookie
app.use(cookieParser())

// ── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Freiwilliger server is running' })
})

app.use('/api/v1/auth', authRoutes)

// Placeholder routes — will be replaced on their respective days
app.use('/api/v1/users', (req, res) => {
  res.json({ message: 'User routes not yet implemented' })
})
app.use('/api/v1/events', (req, res) => {
  res.json({ message: 'Event routes not yet implemented' })
})
app.use('/api/v1/messages', (req, res) => {
  res.json({ message: 'Message routes not yet implemented' })
})
app.use('/api/v1/reviews', (req, res) => {
  res.json({ message: 'Review routes not yet implemented' })
})
app.use('/api/v1/network', (req, res) => {
  res.json({ message: 'Network routes not yet implemented' })
})

// ── Error handlers ───────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('❌ Server startup failed:', error)
  process.exit(1)
})

module.exports = app