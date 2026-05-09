const express = require('express')
const cors = require('cors')
require('dotenv').config()
require('./models/index')

const app = express()

// handle cors manually
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  next()
})

app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/tasks', require('./routes/tasks'))
app.use('/api/users', require('./routes/users'))

app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API running' })
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})