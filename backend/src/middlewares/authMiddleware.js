const supabase = require('../config/supabaseClient')

async function verifySupabaseAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' })

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

module.exports = verifySupabaseAuth
