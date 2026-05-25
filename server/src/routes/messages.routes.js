const express = require('express')

const router = express.Router()

router.get('/conversations', (req, res) => {
  res.json({ message: 'Get conversations' })
})

router.post('/conversations', (req, res) => {
  res.json({ message: 'Create conversation' })
})

router.get('/conversations/:id/messages', (req, res) => {
  res.json({ message: 'Get messages' })
})

router.post('/conversations/:id/messages', (req, res) => {
  res.json({ message: 'Send message' })
})

module.exports = router
