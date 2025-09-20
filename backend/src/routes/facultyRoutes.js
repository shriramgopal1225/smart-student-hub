const express = require('express')
const {
  getFacultyDetails,
  getPendingActivityVerifications,
  getCoordinatedEvents,
  getEventParticipants,
  bulkApproveParticipants,
  approveActivityVerification,
  rejectActivityVerification,
  getStudentProfile,
  getMyFacultyProfile,
} = require('../controllers/facultyController')
const verifySupabaseAuth = require('../middlewares/authMiddleware')
const checkRole = require('../middlewares/roleMiddleware')

const router = express.Router()

// Middleware to check login and role = faculty or coordinator
router.use(verifySupabaseAuth)
router.use(checkRole('faculty'))

router.get('/me', getFacultyDetails)
router.get('/test', (req, res) => res.json({ message: 'Faculty route is working' }))
router.get('/coordinator/events', getCoordinatedEvents)
router.get('/coordinator/events/:eventId', getEventParticipants)
router.post('/coordinator/events/:eventId/verify', bulkApproveParticipants)
router.get('/students/:studentId', getStudentProfile)
router.get('/activities/verifications/pending', getPendingActivityVerifications)
router.post('/activities/verifications/:activityId/approve', approveActivityVerification)
router.post('/activities/verifications/:activityId/reject', rejectActivityVerification)
router.get('/my-profile', getMyFacultyProfile)


module.exports = router
