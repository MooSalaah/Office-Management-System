const express = require('express')
const { createServer } = require('http')
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

// Middleware
expressApp.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || 'https://newcornersa.netlify.app'
    : 'http://localhost:3000',
  credentials: true
}))

expressApp.use(express.json())

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