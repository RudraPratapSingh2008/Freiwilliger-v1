const express = require('express')

const router = express.Router()

router.post('/', (req, res) => {
  res.json({ message: 'Create review' })
})

router.get('/user/:userId', (req, res) => {
  res.json({ message: 'Get user reviews' })
})

router.get('/event/:eventId', (req, res) => {
  res.json({ message: 'Get event reviews' })
})

module.exports = router
