const express = require('express')

const router = express.Router()

router.get('/feed', (req, res) => {
  res.json({ message: 'Get event feed' })
})

router.post('/', (req, res) => {
  res.json({ message: 'Create event' })
})

router.get('/:id', (req, res) => {
  res.json({ message: 'Get event details' })
})

router.post('/:id/apply', (req, res) => {
  res.json({ message: 'Apply to event' })
})

router.delete('/:id/apply', (req, res) => {
  res.json({ message: 'Withdraw application' })
})

router.patch('/:id/applicants/:userId', (req, res) => {
  res.json({ message: 'Manage applicant' })
})

module.exports = router
