const express = require('express')
const verifySupabaseAuth = require('../middlewares/authMiddleware')
const checkRole = require('../middlewares/roleMiddleware')

const router = express.Router()

// Student-only route example
router.get(
  '/student-dashboard',
  verifySupabaseAuth,
  checkRole('student'),
  (req, res) => {
    res.json({ message: `Welcome student ${req.user.email}!` })
  }
)

// Faculty-only route example
router.get(
  '/faculty-dashboard',
  verifySupabaseAuth,
  checkRole('faculty'),
  (req, res) => {
    res.json({ message: `Welcome faculty ${req.user.email}!` })
  }
)

// Admin-only route example
router.get(
  '/admin-panel',
  verifySupabaseAuth,
  checkRole('admin'),
  (req, res) => {
    res.json({ message: `Welcome admin ${req.user.email}!` })
  }
)

module.exports = router
