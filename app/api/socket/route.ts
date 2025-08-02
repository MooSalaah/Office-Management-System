import { NextRequest, NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'

export async function GET(req: NextRequest) {
  try {
    // @ts-ignore - Next.js specific
    if (!req.socket.server.io) {
      console.log('Setting up Socket.io server...')
      
      // @ts-ignore - Next.js specific
      const io = new SocketIOServer(req.socket.server, {
        cors: {
          origin: process.env.NODE_ENV === 'production' 
            ? ['https://your-domain.com'] 
            : ['http://localhost:3000', 'http://localhost:3001'],
          methods: ['GET', 'POST']
        }
      })
      
      // @ts-ignore - Next.js specific
      req.socket.server.io = io

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        // Join user to their room
        socket.on('join-user', (userId: string) => {
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
        socket.on('user-online', (userId: string) => {
          socket.broadcast.emit('user-status-changed', {
            userId,
            status: 'online',
            timestamp: new Date()
          })
        })

        socket.on('user-away', (userId: string) => {
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
    }

    return NextResponse.json({ success: true, message: 'Socket.io server is running' })
  } catch (error) {
    console.error('Socket.io setup error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إعداد Socket.io' },
      { status: 500 }
    )
  }
} 