'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSocket, Notification, UserActivity, UserStatus } from '@/hooks/use-socket'
import { toast } from '@/hooks/use-toast'
import { Bell, Users, Activity, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface RealtimeContextType {
  isConnected: boolean
  notifications: Notification[]
  userActivities: UserActivity[]
  userStatuses: Map<string, UserStatus>
  onlineUsers: string[]
  sendNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  sendUserActivity: (activity: Omit<UserActivity, 'timestamp'>) => void
  emitDataUpdate: (change: any) => void
  clearNotifications: () => void
  removeNotification: (id: string) => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

interface RealtimeProviderProps {
  children: React.ReactNode
  userId?: string
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ 
  children, 
  userId 
}) => {
  const {
    isConnected,
    notifications,
    userActivities,
    userStatuses,
    onlineUsers,
    sendNotification,
    sendUserActivity,
    emitDataUpdate,
    clearNotifications,
    removeNotification
  } = useSocket(userId)

  // Show connection status toast
  useEffect(() => {
    if (isConnected) {
      toast({
        title: "متصل بالخادم",
        description: "التحديثات اللحظية مفعلة",
        duration: 3000,
      })
    }
  }, [isConnected])

  // Show notifications as toast
  useEffect(() => {
    notifications.forEach(notification => {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
        duration: 5000,
      })
    })
  }, [notifications])

  const value: RealtimeContextType = {
    isConnected,
    notifications,
    userActivities,
    userStatuses,
    onlineUsers,
    sendNotification,
    sendUserActivity,
    emitDataUpdate,
    clearNotifications,
    removeNotification
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      <RealtimeIndicators />
    </RealtimeContext.Provider>
  )
}

// Real-time indicators component
const RealtimeIndicators: React.FC = () => {
  const {
    isConnected,
    notifications,
    userActivities,
    onlineUsers,
    clearNotifications,
    removeNotification,
  } = useRealtime()

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50">
      {/* Connection Status */}
      <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isConnected ? "متصل" : "غير متصل"}
      </Badge>

      {/* Online Users */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{onlineUsers.length}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-2">
            <h4 className="font-medium">المستخدمون المتصلون</h4>
            <ScrollArea className="h-32">
              {onlineUsers.length > 0 ? (
                <div className="space-y-1">
                  {onlineUsers.map(userId => (
                    <div key={userId} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{userId}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا يوجد مستخدمون متصلون</p>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {/* Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1 relative">
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs">
                {notifications.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">الإشعارات</h4>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                >
                  مسح الكل
                </Button>
              )}
            </div>
            <ScrollArea className="h-64">
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map(notification => (
                    <div key={notification.id} className="p-2 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد إشعارات جديدة</p>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {/* Recent Activities */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span>{userActivities.length}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-2">
            <h4 className="font-medium">النشاطات الأخيرة</h4>
            <ScrollArea className="h-64">
              {userActivities.length > 0 ? (
                <div className="space-y-2">
                  {userActivities.map((activity, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.userId}</span>
                            <span className="mx-1">{activity.action}</span>
                            <span className="font-medium">{activity.entity}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد نشاطات حديثة</p>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
