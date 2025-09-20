const express = require('express')
const cors = require('cors')
const apiRoutes = require('./routes/apiRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', apiRoutes)

// Default error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app
