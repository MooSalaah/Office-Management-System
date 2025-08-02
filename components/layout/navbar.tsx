"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  LayoutDashboard,
  FolderOpen,
  Users,
  CheckSquare,
  DollarSign,
  Clock,
  Settings,
  Bell,
  LogOut,
  User,
  Moon,
  Sun,
  Eye,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useData } from "@/components/data-provider"
import { useTheme } from "next-themes"
import { useRealtime } from "@/components/realtime-provider"
import { cn } from "@/lib/utils"
import React from "react"

interface NavigationItem {
  name: string
  href: string
  icon: any
  roles: string[]
}

const navigationItems: NavigationItem[] = [
  {
    name: "لوحة التحكم",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "engineer", "accountant", "hr", "employee"],
  },
  { name: "المشاريع", href: "/projects", icon: FolderOpen, roles: ["admin", "engineer"] },
  { name: "العملاء", href: "/clients", icon: Users, roles: ["admin", "accountant"] },
  { name: "المهام", href: "/tasks", icon: CheckSquare, roles: ["admin", "engineer", "employee"] },
  { name: "المالية", href: "/finance", icon: DollarSign, roles: ["admin", "accountant"] },
  { name: "الحضور", href: "/attendance", icon: Clock, roles: ["admin", "hr", "employee"] },
  { name: "الإعدادات", href: "/settings", icon: Settings, roles: ["admin", "hr"] },
]

// Memoized Navigation Link Component
const NavigationLink = React.memo(({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: NavigationItem
  isActive: boolean
  onClick: () => void
}) => {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {item.name}
    </Link>
  )
})

NavigationLink.displayName = 'NavigationLink'

// Memoized Notification Item Component
const NotificationItem = React.memo(({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: any
  onMarkAsRead: (id: number) => void
  onDelete: (id: number) => void
}) => (
  <div className="flex items-start gap-2 p-3 hover:bg-accent">
    <div className="flex-1 text-right">
      <div
        className={`font-semibold ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}
      >
        {notification.title}
      </div>
      <div className="text-sm text-muted-foreground">{notification.message}</div>
      {notification.unread && <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>}
    </div>
    <div className="flex gap-1">
      {notification.unread && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkAsRead(notification.id)}
          className="h-6 w-6 p-0"
        >
          <Eye className="h-3 w-3" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(notification.id)}
        className="h-6 w-6 p-0"
      >
        <Trash2 className="h-3 w-3 text-red-500" />
      </Button>
    </div>
  </div>
))

NotificationItem.displayName = 'NotificationItem'

export function Navbar() {
  const { user, logout } = useAuth()
  const { companyName } = useData()
  const { theme, setTheme } = useTheme()
  const { isConnected } = useRealtime()
  const pathname = usePathname()
  const router = useRouter()
  const [notifications, setNotifications] = useState([
    { id: 1, title: "مهمة جديدة", message: "تم تعيين مهمة جديدة لك", unread: true, type: "task" },
    { id: 2, title: "دفعة مستلمة", message: "تم استلام دفعة من العميل", unread: true, type: "finance" },
    { id: 3, title: "مشروع مكتمل", message: "تم إكمال مشروع فيلا الرياض", unread: false, type: "project" },
  ])

  // Memoized filtered navigation
  const filteredNavigation = useMemo(() => 
    navigationItems.filter((item) => user?.role && item.roles.includes(user.role)),
    [user?.role]
  )

  // Memoized unread count
  const unreadCount = useMemo(() => 
    notifications.filter((n) => n.unread).length,
    [notifications]
  )

  const handleLogout = useCallback(() => {
    logout()
    router.push("/")
  }, [logout, router])

  const markAsRead = useCallback((notificationId: number) => {
    setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, unread: false } : n)))
  }, [notifications])

  const deleteNotification = useCallback((notificationId: number) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId))
  }, [notifications])

  const markAllAsRead = useCallback(() => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })))
  }, [notifications])

  const handleNavigationClick = useCallback(() => {
    // Optional: Add any navigation click logic here
  }, [])

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 w-full">
      <div className="w-full px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Company Name */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">{companyName}</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-reverse space-x-8">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <NavigationLink
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  onClick={handleNavigationClick}
                />
              )
            })}
          </div>

          {/* Right side - User menu, notifications, theme toggle */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-1 text-xs">
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span className={isConnected ? "text-green-500" : "text-red-500"}>
                {isConnected ? "متصل" : "غير متصل"}
              </span>
            </div>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">تبديل المظهر</span>
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>الإشعارات</span>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      تحديد الكل كمقروء
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
                {notifications.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">لا توجد إشعارات</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <Badge variant="secondary" className="w-fit">
                      {user?.role === "admin"
                        ? "مدير"
                        : user?.role === "engineer"
                          ? "مهندس"
                          : user?.role === "accountant"
                            ? "محاسب"
                            : user?.role === "hr"
                              ? "موارد بشرية"
                              : "موظف"}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
