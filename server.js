const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')
const cors = require('cors')
const { connectDB } = require('./lib/database')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Initialize Express
const expressApp = express()
const server = createServer(expressApp)

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          process.env.CORS_ORIGIN || 'https://newcornersa.netlify.app',
          'https://*.netlify.app'
        ] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Middleware
expressApp.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || 'https://newcornersa.netlify.app'
    : 'http://localhost:3000',
  credentials: true
}))

expressApp.use(express.json())

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Join user to their room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`)
    socket.join('all-users')
    console.log(`User ${userId} joined their room`)
  })

  // Handle user activity
  socket.on('user-activity', (data) => {
    socket.broadcast.emit('user-activity-update', data)
  })

  // Handle data updates
  socket.on('data-updated', (data) => {
    socket.broadcast.emit('data-changed', data)
  })

  // Handle notifications
  socket.on('send-notification', (data) => {
    if (data.targetUserId) {
      io.to(`user-${data.targetUserId}`).emit('new-notification', data)
    } else {
      socket.broadcast.emit('new-notification', data)
    }
  })

  // Handle presence
  socket.on('user-online', (userId) => {
    socket.broadcast.emit('user-status-changed', {
      userId,
      status: 'online',
      timestamp: new Date()
    })
  })

  socket.on('user-away', (userId) => {
    socket.broadcast.emit('user-status-changed', {
      userId,
      status: 'away',
      timestamp: new Date()
    })
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Start server
app.prepare().then(() => {
  // Connect to database
  connectDB()

  // Handle all other routes with Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
}) 