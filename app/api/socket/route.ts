import { NextRequest, NextResponse } from 'next/server'
import { Notification } from '@/lib/models/notification'
import { UserActivity } from '@/lib/models/user-activity'
import { checkMongoDb, handleError } from '@/lib/api-utils'

// In-memory storage for real-time data (in production, use Redis or database)
let connections = new Map<string, number>()
let onlineUsers = new Set<string>()

export async function GET(req: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const userId = req.headers.get('X-User-Id')

    switch (action) {
      case 'connect':
        if (userId) {
          onlineUsers.add(userId)
          connections.set(userId, Date.now())
        }
        const [notifications, userActivities] = await Promise.all([
          Notification.find({ targetUserId: { $in: [userId, 'all'] } }).sort({ timestamp: -1 }).limit(10),
          UserActivity.find().sort({ timestamp: -1 }).limit(20)
        ])
        return NextResponse.json({
          success: true,
          message: 'Connected',
          onlineUsers: Array.from(onlineUsers),
          notifications,
          userActivities
        })

      case 'disconnect':
        if (userId) {
          onlineUsers.delete(userId)
          connections.delete(userId)
        }
        return NextResponse.json({ success: true, message: 'Disconnected' })

      case 'notifications':
        const userNotifications = await Notification.find({ targetUserId: { $in: [userId, 'all'] } }).sort({ timestamp: -1 }).limit(10)
        return NextResponse.json({
          success: true,
          notifications: userNotifications
        })

      case 'activities':
        const activities = await UserActivity.find().sort({ timestamp: -1 }).limit(20)
        return NextResponse.json({
          success: true,
          userActivities: activities
        })

      case 'online-users':
        return NextResponse.json({
          success: true,
          onlineUsers: Array.from(onlineUsers)
        })

      default:
        return NextResponse.json({
          success: true,
          message: 'Socket API is running',
          onlineUsers: Array.from(onlineUsers),
          connections: connections.size
        })
    }
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const userId = req.headers.get('X-User-Id')
    if (!userId) {
      throw new Error('User ID not found in token')
    }

    const body = await req.json()
    const { type, data } = body

    switch (type) {
      case 'notification':
        const notification = new Notification({
          id: Math.random().toString(36).slice(2, 11),
          ...data,
          timestamp: new Date()
        })
        await notification.save()
        break

      case 'user-activity':
        const activity = new UserActivity({
          ...data,
          userId,
          timestamp: new Date()
        })
        await activity.save()
        break

      case 'user-online':
        onlineUsers.add(userId)
        connections.set(userId, Date.now())
        break

      case 'user-away':
        onlineUsers.delete(userId)
        connections.delete(userId)
        break
    }

    return NextResponse.json({ success: true, message: 'Data updated' })