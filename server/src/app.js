const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

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

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Freiwilliger server is running' })
})

// API Routes (placeholder)
app.use('/api/v1/auth', (req, res) => {
  res.json({ message: 'Auth routes not yet implemented' })
})

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
