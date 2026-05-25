const express = require('express')

const router = express.Router()

router.post('/:userId', (req, res) => {
  res.json({ message: 'Add to network' })
})

router.delete('/:userId', (req, res) => {
  res.json({ message: 'Remove from network' })
})

router.get('/', (req, res) => {
  res.json({ message: 'Get network' })
})

router.post('/favourites/:userId', (req, res) => {
  res.json({ message: 'Add to favourites' })
})

router.delete('/favourites/:userId', (req, res) => {
  res.json({ message: 'Remove from favourites' })
})

module.exports = router
