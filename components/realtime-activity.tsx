'use client'

import React from 'react'
import { useRealtime } from '@/components/realtime-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity, User, Clock, CheckCircle, AlertCircle, Info, WifiOff, Users } from 'lucide-react'

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'created':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'updated':
      return <Info className="w-4 h-4 text-blue-500" />
    case 'deleted':
      return <AlertCircle className="w-4 h-4 text-red-500" />
    default:
      return <Activity className="w-4 h-4 text-gray-500" />
  }
}

const getEntityName = (entity: string) => {
  switch (entity) {
    case 'user':
      return 'مستخدم'
    case 'client':
      return 'عميل'
    case 'project':
      return 'مشروع'
    case 'task':
      return 'مهمة'
    case 'attendance':
      return 'حضور'
    case 'transaction':
      return 'معاملة مالية'
    default:
      return entity
  }
}

const getActionName = (action: string) => {
  switch (action) {
    case 'created':
      return 'أنشأ'
    case 'updated':
      return 'حدث'
    case 'deleted':
      return 'حذف'
    default:
      return action
  }
}

export const RealtimeActivity: React.FC = () => {
  const { userActivities, isConnected } = useRealtime()

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            النشاطات اللحظية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <WifiOff className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p>غير متصل بالخادم</p>
            <p className="text-sm">لا يمكن عرض النشاطات اللحظية</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          النشاطات اللحظية
          <Badge variant="secondary" className="ml-auto">
            {userActivities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {userActivities.length > 0 ? (
            <div className="space-y-3">
              {userActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{activity.userId}</span>
                      <span className="text-sm text-muted-foreground">
                        {getActionName(activity.action)}
                      </span>
                      <span className="font-medium text-sm">
                        {getEntityName(activity.entity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <p>لا توجد نشاطات حديثة</p>
              <p className="text-sm">ستظهر النشاطات هنا عند حدوثها</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export const OnlineUsers: React.FC = () => {
  const { onlineUsers, isConnected } = useRealtime()

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            المستخدمون المتصلون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <WifiOff className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p className="text-sm">غير متصل</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          المستخدمون المتصلون
          <Badge variant="secondary" className="ml-auto">
            {onlineUsers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32">
          {onlineUsers.length > 0 ? (
            <div className="space-y-2">
              {onlineUsers.map((userId, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{userId}</span>
                  <Badge variant="outline" className="text-xs">
                    متصل
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">لا يوجد مستخدمون متصلون</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 