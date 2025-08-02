"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  FolderPlus,
  UserPlus,
  Receipt,
  Calendar,
  BarChart3,
  PieChartIcon,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useData } from "@/components/data-provider"
import { useRealtime } from "@/components/realtime-provider"
import { useRouter } from "next/navigation"
import { formatCurrency, formatDate, getHijriDate, convertToArabicNumerals } from "@/lib/utils"
import dynamic from "next/dynamic"
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders"
import { RealtimeActivity, OnlineUsers } from "@/components/realtime-activity"

// Dynamic imports for charts
const LineChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.LineChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center">جاري تحميل الرسم البياني...</div>
})

const Line = dynamic(() => import("recharts").then((mod) => ({ default: mod.Line })), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => ({ default: mod.XAxis })), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => ({ default: mod.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => ({ default: mod.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => ({ default: mod.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })), { ssr: false })
const PieChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.PieChart })), { ssr: false })
const Pie = dynamic(() => import("recharts").then((mod) => ({ default: mod.Pie })), { ssr: false })
const Cell = dynamic(() => import("recharts").then((mod) => ({ default: mod.Cell })), { ssr: false })

interface RecentActivity {
  id: string
  type: "project" | "task" | "finance" | "attendance"
  title: string
  description: string
  status: string
  timestamp: string
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]

// Memoized Stat Card Component
const StatCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  onClick, 
  iconColor 
}: {
  title: string
  value: string | number
  icon: any
  subtitle?: string
  onClick?: () => void
  iconColor?: string
}) => (
  <Card 
    className="card-hover border border-gray-200 cursor-pointer" 
    onClick={onClick}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-8 w-8 ${iconColor || 'text-blue-500'}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span>{subtitle}</span>
        </div>
      )}
    </CardContent>
  </Card>
))

StatCard.displayName = 'StatCard'

// Memoized Quick Action Component
const QuickAction = React.memo(({ 
  action, 
  onClick 
}: {
  action: {
    title: string
    description: string
    icon: any
    color: string
  }
  onClick: () => void
}) => (
  <Button
    variant="outline"
    className="justify-start h-auto p-4 border border-gray-200 bg-transparent"
    onClick={onClick}
  >
    <div className={`p-2 rounded-lg ${action.color} mr-3`}>
      <action.icon className="h-6 w-6 text-white" />
    </div>
    <div className="text-right">
      <div className="font-semibold">{action.title}</div>
      <div className="text-sm text-muted-foreground">{action.description}</div>
    </div>
  </Button>
))

QuickAction.displayName = 'QuickAction'

// Memoized Activity Item Component
const ActivityItem = React.memo(({ activity }: { activity: RecentActivity }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "status-completed"
      case "in-progress":
        return "status-in-progress"
      case "new":
        return "status-new"
      default:
        return "status-new"
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <div className="flex-1 text-right">
        <div className="font-semibold">{activity.title}</div>
        <div className="text-sm text-muted-foreground">{activity.description}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatDate(new Date(activity.timestamp))}
        </div>
      </div>
      <Badge className={getStatusColor(activity.status)}>
        {activity.status === "completed"
          ? "مكتمل"
          : activity.status === "in-progress"
            ? "قيد التنفيذ"
            : "جديد"}
      </Badge>
    </div>
  )
})

ActivityItem.displayName = 'ActivityItem'

// Memoized Chart Components
const RevenueChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip formatter={(value) => [formatCurrency(value as number), "الإيرادات"]} />
      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
))

RevenueChart.displayName = 'RevenueChart'

const ProjectDistributionChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        label={({ name, value }) => `${name}: ${convertToArabicNumerals(value || 0)}`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => [convertToArabicNumerals(value as number)]} />
    </PieChart>
  </ResponsiveContainer>
))

ProjectDistributionChart.displayName = 'ProjectDistributionChart'

export default function DashboardPage() {
  const { user } = useAuth()
  const { getDashboardStats } = useData()
  const { isConnected } = useRealtime()
  const router = useRouter()
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const stats = getDashboardStats()

  // Memoized revenue data
  const revenueData = useMemo(() => {
    const months = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الثانية"]
    const data = months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 50000 + index * 10000,
    }))
    data[data.length - 1].revenue = stats.monthlyRevenue // Current month
    return data
  }, [stats.monthlyRevenue])

  // Memoized project distribution
  const projectDistribution = useMemo(() => [
    { name: "مكتمل", value: stats.completedProjects, color: "#10B981" },
    { name: "قيد التنفيذ", value: stats.ongoingProjects, color: "#F59E0B" },
    { name: "جديد", value: stats.newProjects, color: "#EF4444" },
  ], [stats.completedProjects, stats.ongoingProjects, stats.newProjects])

  // Memoized quick actions
  const quickActions = useMemo(() => [
    {
      title: "إضافة مشروع جديد",
      description: "إنشاء مشروع جديد",
      icon: FolderPlus,
      href: "/projects",
      color: "bg-blue-500",
    },
    {
      title: "إنشاء مهمة",
      description: "إضافة مهمة جديدة",
      icon: Plus,
      href: "/tasks",
      color: "bg-green-500",
    },
    {
      title: "إضافة عميل",
      description: "إضافة عميل جديد",
      icon: UserPlus,
      href: "/clients",
      color: "bg-purple-500",
    },
    {
      title: "تسجيل معاملة",
      description: "تسجيل معاملة مالية",
      icon: Receipt,
      href: "/finance",
      color: "bg-orange-500",
    },
    {
      title: "تسجيل حضور",
      description: "تسجيل الحضور أو الانصراف",
      icon: Clock,
      href: "/attendance",
      color: "bg-red-500",
    },
  ], [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setRecentActivities([
          {
            id: "1",
            type: "project",
            title: "مشروع فيلا الرياض",
            description: "تم إنشاء مشروع جديد",
            status: "new",
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            type: "task",
            title: "مراجعة المخططات",
            description: "تم إكمال المهمة",
            status: "completed",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleQuickAction = useCallback((href: string) => {
    router.push(href)
  }, [router])

  const handleStatCardClick = useCallback((href: string) => {
    router.push(href)
  }, [router])

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header with Date */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">مرحباً {user?.name}</h1>
          <p className="text-muted-foreground">أهلاً بك في لوحة التحكم</p>
        </div>
        <div className="flex items-center gap-2 p-4 border rounded-lg">
          <Calendar className="w-6 h-6 text-primary" />
          <div className="text-right">
            <div className="font-semibold text-lg">{formatDate(new Date())}</div>
            <div className="text-sm text-muted-foreground">{getHijriDate(new Date())}</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="المشاريع"
          value={convertToArabicNumerals(stats.totalProjects)}
          icon={Building2}
          subtitle={`مكتمل: ${convertToArabicNumerals(stats.completedProjects)} جاري: ${convertToArabicNumerals(stats.ongoingProjects)}`}
          onClick={() => handleStatCardClick("/projects")}
          iconColor="text-blue-500"
        />

        <StatCard
          title="العملاء"
          value={convertToArabicNumerals(stats.totalClients)}
          icon={Users}
          subtitle={`جديد هذا الشهر: ${convertToArabicNumerals(stats.newClientsThisMonth)}`}
          onClick={() => handleStatCardClick("/clients")}
          iconColor="text-purple-500"
        />

        <StatCard
          title="المهام الجارية"
          value={convertToArabicNumerals(stats.ongoingTasks)}
          icon={stats.ongoingTasks > 0 ? AlertTriangle : CheckCircle}
          subtitle={`مكتمل: ${convertToArabicNumerals(stats.completedTasks)}`}
          onClick={() => handleStatCardClick("/tasks")}
          iconColor={stats.ongoingTasks > 0 ? "text-yellow-500" : "text-green-500"}
        />

        <StatCard
          title="الإيرادات الشهرية"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={DollarSign}
          subtitle="نمو شهري"
          onClick={() => handleStatCardClick("/finance")}
          iconColor="text-green-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              اتجاه الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              توزيع المشاريع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectDistributionChart data={projectDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <QuickAction
                  key={index}
                  action={action}
                  onClick={() => handleQuickAction(action.href)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأنشطة الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Features */}
      {isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealtimeActivity />
          <OnlineUsers />
        </div>
      )}

      {/* Attendance Cards (for Admin/HR) */}
      {(user?.role === "admin" || user?.role === "hr") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="الحضور اليوم"
            value={convertToArabicNumerals(8)}
            icon={CheckCircle}
            subtitle={`من أصل ${convertToArabicNumerals(10)} موظف`}
            onClick={() => handleStatCardClick("/attendance")}
            iconColor="text-green-500"
          />

          <StatCard
            title="الغياب اليوم"
            value={convertToArabicNumerals(2)}
            icon={AlertTriangle}
            subtitle="موظف غائب"
            onClick={() => handleStatCardClick("/attendance")}
            iconColor="text-red-500"
          />

          <StatCard
            title="متوسط ساعات العمل"
            value={convertToArabicNumerals(8.5)}
            icon={Clock}
            subtitle="ساعة يومياً"
            onClick={() => handleStatCardClick("/attendance")}
            iconColor="text-blue-500"
          />
        </div>
      )}
    </div>
  )
}
