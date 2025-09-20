const supabase = require('../config/supabaseClient')

// Get faculty details for dashboard greeting
async function getFacultyDetails(req, res) {
  try {
    const facultyId = req.user.id

    // Join profiles and faculty table to get full info
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role, email, faculty(department, designation)')
      .eq('id', facultyId)
      .single()

    if (error) throw error

    res.json({
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      department: data.faculty?.department,
      designation: data.faculty?.designation,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
// Get pending verifications assigned to faculty, including attached proof URLs
async function getPendingActivityVerifications(req, res) {
  try {
    const facultyId = req.user.id

    // Fetch pending activities and join proofs for each
    const { data, error } = await supabase
      .from('activities')
      .select(`
        activity_id,
        student_id,
        category_id,
        title,
        description,
        approval_status,
        start_date,
        end_date,
        credits_earned,
        verifier_id,
        activity_proofs (
          proof_id,
          file_url,
          file_type,
          file_size,
          uploaded_at
        )
      `)
      .eq('approval_status', 'PENDING')
      .eq('verifier_id', facultyId)
      .order('start_date', { ascending: true })

    if (error) throw error

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


// GET /faculty/coordinator/events
async function getCoordinatedEvents(req, res) {
  try {
    const facultyId = req.user.id

    const { data, error } = await supabase
      .from('events')
      .select('event_id, name, start_date, end_date, description')
      .eq('coordinator_id', facultyId)
      .order('start_date', { ascending: true })

    if (error) throw error

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /faculty/coordinator/events/:eventId
async function getEventParticipants(req, res) {
  try {
    const { eventId } = req.params

    const { data, error } = await supabase
      .from('event_participants')
      .select(`
        participant_id,
        student_id,
        role,
        approval_status,
        submitted_at,
        students (
          id,
          enrollment_no,
          profiles (
            full_name
          )
        )
      `)
      .eq('event_id', eventId)
      .order('submitted_at', { ascending: true })

    if (error) throw error

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /faculty/coordinator/events/:eventId/verify
async function bulkApproveParticipants(req, res) {
  try {
    const { eventId } = req.params
    const { participantIds } = req.body

    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ error: "participantIds must be an array" })
    }

    const { data, error } = await supabase
      .from('event_participants')
      .update({ approval_status: 'APPROVED' })
      .in('participant_id', participantIds)
      .eq('event_id', eventId)
      .select();

    if (error) throw error

    res.json({ message: `Approved ${data ? data.length : 0} participants.` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function approveActivityVerification(req, res) {
  try {
    const { activityId } = req.params

    const { data, error } = await supabase
      .from('activities')
      .update({ approval_status: 'APPROVED' })
      .eq('activity_id', activityId)
      .select()

    if (error || !data.length) return res.status(404).json({ error: 'Activity not found or update failed' })

    res.json({ message: 'Activity approved successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


async function rejectActivityVerification(req, res) {
  try {
    const { activityId } = req.params
    const { feedback } = req.body

    if (!feedback) return res.status(400).json({ error: 'Feedback is required to reject' })

    const { data, error } = await supabase
      .from('activities')
      .update({ approval_status: 'REJECTED', feedback })
      .eq('activity_id', activityId)
      .select()

    if (error || !data.length) return res.status(404).json({ error: 'Activity not found or update failed' })

    res.json({ message: 'Activity rejected successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


async function getStudentProfile(req, res) {
  try {
    const { studentId } = req.params

    // Fetch student info, including profile and activities
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        enrollment_no,
        course,
        year,
        gpa,
        cgpa,
        total_credits,
        profiles (
          full_name,
          email
        ),
        event_participants (
          participant_id,
          event_id,
          role,
          approval_status,
          events (
            name,
            start_date,
            end_date
          )
        ),
        activities (
          activity_id,
          title,
          description,
          approval_status,
          start_date,
          end_date,
          credits_earned
        )
      `)
      .eq('id', studentId)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Student not found' })

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /faculty/my-profile
async function getMyFacultyProfile(req, res) {
  try {
    const facultyId = req.user.id

    // Fetch faculty's profile and achievements
    const profileQuery = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        role,
        faculty (
          department,
          designation
        )
      `)
      .eq('id', facultyId)
      .single()

    if (profileQuery.error) throw profileQuery.error

    const achievementsQuery = await supabase
      .from('faculty_achievements')
      .select('faculty_achievement_id, achievements, updated_at')
      .eq('faculty_id', facultyId)
      .order('updated_at', { ascending: false })

    if (achievementsQuery.error) throw achievementsQuery.error

    res.json({
      profile: profileQuery.data,
      achievements: achievementsQuery.data
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getFacultyDetails,
  getPendingActivityVerifications,
  getCoordinatedEvents,
  getEventParticipants,
  bulkApproveParticipants,
  approveActivityVerification,
  rejectActivityVerification,
  getStudentProfile,
  getMyFacultyProfile,
};
