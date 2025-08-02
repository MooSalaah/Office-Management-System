import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

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
  
  const socketRef = useRef<Socket | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize socket
      socketRef.current = io(process.env.NODE_ENV === 'production' 
        ? (process.env.NEXT_PUBLIC_API_URL || 'https://office-management-system-v82i.onrender.com')
        : 'http://localhost:3001'
      )

      const socket = socketRef.current

      // Connection events
      socket.on('connect', () => {
        console.log('Connected to Socket.io server')
        setIsConnected(true)
        
        // Join user room if userId is provided
        if (userId) {
          socket.emit('join-user', userId)
          socket.emit('user-online', userId)
        }
      })

      socket.on('disconnect', () => {
        console.log('Disconnected from Socket.io server')
        setIsConnected(false)
      })

      // Listen for notifications
      socket.on('new-notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10 notifications
      })

      // Listen for user activities
      socket.on('user-activity-update', (activity: UserActivity) => {
        setUserActivities(prev => [activity, ...prev.slice(0, 19)]) // Keep last 20 activities
      })

      // Listen for data changes
      socket.on('data-changed', (change: DataChange) => {
        // Emit custom event for data changes
        window.dispatchEvent(new CustomEvent('data-changed', { detail: change }))
      })

      // Listen for user status changes
      socket.on('user-status-changed', (status: UserStatus) => {
        setUserStatuses(prev => {
          const newMap = new Map(prev)
          newMap.set(status.userId, status)
          return newMap
        })

        // Update online users list
        if (status.status === 'online') {
          setOnlineUsers(prev => [...new Set([...prev, status.userId])])
        } else if (status.status === 'offline') {
          setOnlineUsers(prev => prev.filter(id => id !== status.userId))
        }
      })

      // Cleanup on unmount
      return () => {
        if (userId) {
          socket.emit('user-away', userId)
        }
        socket.disconnect()
      }
    }
  }, [userId])

  // Send user activity
  const sendUserActivity = useCallback((activity: Omit<UserActivity, 'timestamp'>) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('user-activity', {
        ...activity,
        timestamp: new Date()
      })
    }
  }, [isConnected])

  // Send notification
  const sendNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-notification', {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date()
      })
    }
  }, [isConnected])

  // Emit data update
  const emitDataUpdate = useCallback((change: Omit<DataChange, 'timestamp'>) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('data-updated', {
        ...change,
        timestamp: new Date()
      })
    }
  }, [isConnected])

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