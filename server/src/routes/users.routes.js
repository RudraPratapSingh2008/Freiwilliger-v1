const express = require('express')

const router = express.Router()

router.get('/me', (req, res) => {
  res.json({ message: 'Get user profile' })
})

router.patch('/me', (req, res) => {
  res.json({ message: 'Update user profile' })
})

router.get('/search', (req, res) => {
  res.json({ message: 'Search users' })
})

router.get('/:username', (req, res) => {
  res.json({ message: 'Get public profile' })
})

module.exports = router
