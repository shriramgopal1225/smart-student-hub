const supabase = require('../config/supabaseClient')

function checkRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single()

      if (error || !profile) return res.status(403).json({ error: 'Forbidden' })

      if (!allowedRoles.includes(profile.role))
        return res.status(403).json({ error: 'Forbidden' })

      next()
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = checkRole
