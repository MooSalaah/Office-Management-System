export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for real-time data (in production, use Redis or database)
let connections = new Map<string, number>()
let notifications: any[] = []
let userActivities: any[] = []
let onlineUsers = new Set<string>()

export async function GET(req: NextRequest) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
          ? process.env.CORS_ORIGIN || 'https://newcornersa.netlify.app'
          : 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    })
  }

  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    switch (action) {
      case 'connect':
        if (userId) {
          onlineUsers.add(userId)
          connections.set(userId, Date.now())
        }
        return NextResponse.json({ 
          success: true, 
          message: 'Connected',
          onlineUsers: Array.from(onlineUsers),
          notifications: notifications.slice(-10),
          userActivities: userActivities.slice(-20)
        })

      case 'disconnect':
        if (userId) {
          onlineUsers.delete(userId)
          connections.delete(userId)
        }
        return NextResponse.json({ success: true, message: 'Disconnected' })

      case 'notifications':
        return NextResponse.json({ 
          success: true, 
          notifications: notifications.slice(-10) 
        })

      case 'activities':
        return NextResponse.json({ 
          success: true, 
          userActivities: userActivities.slice(-20) 
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
    console.error('Socket API error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في معالجة الطلب' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data, userId } = body

    switch (type) {
      case 'notification':
        const notification = {
          id: Math.random().toString(36).slice(2, 11),
          ...data,
          timestamp: new Date()
        }
        notifications.push(notification)
        if (notifications.length > 50) {
          notifications = notifications.slice(-50)
        }
        break

      case 'user-activity':
        const activity = {
          ...data,
          timestamp: new Date()
        }
        userActivities.push(activity)
        if (userActivities.length > 100) {
          userActivities = userActivities.slice(-100)
        }
        break

      case 'user-online':
        if (userId) {
          onlineUsers.add(userId)
          connections.set(userId, Date.now())
        }
        break

      case 'user-away':
        if (userId) {
          onlineUsers.delete(userId)
          connections.delete(userId)
        }
        break
    }

    return NextResponse.json({ success: true, message: 'Data updated' })
  } catch (error) {
    console.error('Socket API POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث البيانات' },
      { status: 500 }
    )
  }
} 