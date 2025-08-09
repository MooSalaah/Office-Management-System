import { useEffect, useRef, useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  targetUserId?: string
}

export interface UserActivity {
  userId: string
  action: string
  entity: string
  entityId: string
  timestamp: Date
}

export interface UserStatus {
  userId: string
  status: 'online' | 'away' | 'offline'
  timestamp: Date
}

export interface DataChange {
  type: 'create' | 'update' | 'delete'
  entity: 'user' | 'client' | 'project' | 'task' | 'attendance' | 'transaction'
  entityId: string
  data: any
  userId: string
  timestamp: Date
}

export const useSocket = (userId?: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatus>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  // Connect to API
  const connect = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(`${apiUrl}/api/socket?action=connect&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsConnected(true)
        setOnlineUsers(data.onlineUsers || [])
        setNotifications(
          (data.notifications || []).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        )
        setUserActivities(
          (data.userActivities || []).map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          }))
        )
        console.log('✅ Connected to API successfully')
      } else {
        console.error('❌ Connection failed:', response.status)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('❌ Connection error:', error)
      setIsConnected(false)
    }
  }, [userId, apiUrl])

  // Disconnect from API
  const disconnect = useCallback(async () => {
    if (!userId) return

    try {
      await fetch(`${apiUrl}/api/socket?action=disconnect&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      setIsConnected(false)
      console.log('✅ Disconnected from API')
    } catch (error) {
      console.error('❌ Disconnect error:', error)
    }
  }, [userId, apiUrl])

  // Poll for updates
  const pollForUpdates = useCallback(async () => {
    if (!isConnected) return

    try {
      // Poll for notifications
      const notificationsResponse = await fetch(`${apiUrl}/api/socket?action=notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (notificationsResponse.ok) {
        const data = await notificationsResponse.json()
        setNotifications(
          (data.notifications || []).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        )
      }

      // Poll for activities
      const activitiesResponse = await fetch(`${apiUrl}/api/socket?action=activities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (activitiesResponse.ok) {
        const data = await activitiesResponse.json()
        setUserActivities(
          (data.userActivities || []).map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          }))
        )
      }

      // Poll for online users
      const onlineUsersResponse = await fetch(`${apiUrl}/api/socket?action=online-users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (onlineUsersResponse.ok) {
        const data = await onlineUsersResponse.json()
        setOnlineUsers(data.onlineUsers || [])
      }
    } catch (error) {
      console.error('❌ Poll error:', error)
      setIsConnected(false)
    }
  }, [isConnected, apiUrl])

  // Send data to API
  const sendToAPI = useCallback(async (type: string, data: any) => {
    try {
      const response = await fetch(`${apiUrl}/api/socket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          userId
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send data: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Send error:', error)
    }
  }, [apiUrl, userId])

  // Initialize connection
  useEffect(() => {
    if (userId) {
      connect()
    }

    return () => {
      if (userId) {
        disconnect()
      }
    }
  }, [userId, connect, disconnect])

  // Start polling
  useEffect(() => {
    if (isConnected) {
      // Poll every 3 seconds
      intervalRef.current = setInterval(pollForUpdates, 3000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isConnected, pollForUpdates])

  // Send user activity
  const sendUserActivity = useCallback((activity: Omit<UserActivity, 'timestamp'>) => {
    sendToAPI('user-activity', activity)
  }, [sendToAPI])

  // Send notification
  const sendNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    sendToAPI('notification', notification)
  }, [sendToAPI])

  // Emit data update
  const emitDataUpdate = useCallback((change: Omit<DataChange, 'timestamp'>) => {
    sendToAPI('user-activity', {
      userId: change.userId,
      action: change.type,
      entity: change.entity,
      entityId: change.entityId
    })
  }, [sendToAPI])

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Remove specific notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  return {
    isConnected,
    notifications,
    userActivities,
    userStatuses,
    onlineUsers,
    sendUserActivity,
    sendNotification,
    emitDataUpdate,
    clearNotifications,
    removeNotification
  }
} 