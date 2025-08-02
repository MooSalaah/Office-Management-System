"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import { isCurrentMonth } from "@/lib/utils"

interface Project {
  id: string
  name: string
  clientId: string
  clientName: string
  type: string
  status: "in-progress" | "completed" | "new" | "cancelled"
  assignedEngineers: string[]
  assignedEngineerNames: string[]
  startDate: string
  startDateHijri: string
  price: number
  downPayment: number
  remainingBalance: number
  progress: number
  description: string
  defaultTasks: string[]
}

interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
  contactPerson: string
  totalProjects: number
  totalRevenue: number
  status: "active" | "inactive"
  avatar?: string
  createdAt: string
}

interface Task {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  assigneeId: string
  assigneeName: string
  priority: "high" | "medium" | "low"
  status: "todo" | "in-progress" | "completed" | "cancelled"
  dueDate: string
  dueDateHijri: string
  createdBy: string
  createdAt: string
}

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  category: string
  paymentMethod: string
  date: string
  dateHijri: string
  status: "completed" | "pending" | "cancelled"
  clientId?: string
  clientName?: string
  projectId?: string
  projectName?: string
  invoiceNumber?: string
  createdBy: string
  createdAt: string
}

interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  date: string
  dateHijri: string
  checkIn: string
  checkOut?: string
  totalHours?: number
  status: "present" | "absent" | "late" | "half-day" | "leave" | "sick-leave"
  notes?: string
  createdBy: string
  createdAt: string
}

interface DataContextType {
  projects: Project[]
  clients: Client[]
  tasks: Task[]
  transactions: Transaction[]
  attendanceRecords: AttendanceRecord[]
  companyName: string
  setCompanyName: (name: string) => void
  addProject: (project: Omit<Project, "id">) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void
  addClient: (client: Omit<Client, "id">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  addTask: (task: Omit<Task, "id">) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addAttendanceRecord: (record: Omit<AttendanceRecord, "id">) => void
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => void
  deleteAttendanceRecord: (id: string) => void
  // Dashboard stats
  getDashboardStats: () => {
    totalProjects: number
    completedProjects: number
    ongoingProjects: number
    newProjects: number
    totalClients: number
    newClientsThisMonth: number
    ongoingTasks: number
    completedTasks: number
    monthlyRevenue: number
    totalIncome: number
    totalExpenses: number
    netProfit: number
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Memoized mock data to prevent recreation on every render
const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "فيلا الرياض الحديثة",
    clientId: "1",
    clientName: "أحمد محمد السعيد",
    type: "سكني",
    status: "in-progress",
    assignedEngineers: ["3"],
    assignedEngineerNames: ["عمرو رمضان"],
    startDate: new Date().toISOString(),
    startDateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    price: 250000,
    downPayment: 100000,
    remainingBalance: 150000,
    progress: 65,
    description: "مشروع فيلا حديثة في الرياض",
    defaultTasks: [],
  },
  {
    id: "2",
    name: "مجمع تجاري الدمام",
    clientId: "2",
    clientName: "شركة البناء المتطور",
    type: "تجاري",
    status: "completed",
    assignedEngineers: ["4"],
    assignedEngineerNames: ["محمد مجدي"],
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    startDateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
    price: 500000,
    downPayment: 200000,
    remainingBalance: 0,
    progress: 100,
    description: "مجمع تجاري في الدمام",
    defaultTasks: [],
  },
  {
    id: "3",
    name: "فيلا جدة الساحلية",
    clientId: "3",
    clientName: "محمد علي الخالدي",
    type: "سكني",
    status: "new",
    assignedEngineers: ["5"],
    assignedEngineerNames: ["كرم عبد الرحمن"],
    startDate: new Date().toISOString(),
    startDateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    price: 180000,
    downPayment: 50000,
    remainingBalance: 130000,
    progress: 10,
    description: "فيلا ساحلية في جدة",
    defaultTasks: [],
  },
]

const MOCK_CLIENTS: Client[] = [
  {
    id: "1",
    name: "أحمد محمد السعيد",
    phone: "0501234567",
    email: "ahmed.mohammed@email.com",
    address: "الرياض، حي النرجس",
    contactPerson: "أحمد محمد",
    totalProjects: 1,
    totalRevenue: 250000,
    status: "active",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "شركة البناء المتطور",
    phone: "0509876543",
    email: "info@advanced-construction.com",
    address: "جدة، حي الزهراء",
    contactPerson: "سارة أحمد",
    totalProjects: 1,
    totalRevenue: 500000,
    status: "active",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "محمد علي الخالدي",
    phone: "0555555555",
    email: "mohammed.ali@email.com",
    address: "الدمام، حي الشاطئ",
    contactPerson: "محمد علي",
    totalProjects: 1,
    totalRevenue: 180000,
    status: "active",
    createdAt: new Date().toISOString(),
  },
]

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "مراجعة المخططات المعمارية",
    description: "مراجعة وتدقيق المخططات المعمارية للمشروع",
    projectId: "1",
    projectName: "فيلا الرياض الحديثة",
    assigneeId: "3",
    assigneeName: "عمرو رمضان",
    priority: "high",
    status: "in-progress",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "إعداد تقرير السلامة",
    description: "إعداد تقرير السلامة الأولي للمشروع",
    projectId: "1",
    projectName: "فيلا الرياض الحديثة",
    assigneeId: "4",
    assigneeName: "محمد مجدي",
    priority: "medium",
    status: "todo",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    dueDateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "التصميم ثلاثي الأبعاد",
    description: "إنشاء التصميم ثلاثي الأبعاد للمشروع",
    projectId: "3",
    projectName: "فيلا جدة الساحلية",
    assigneeId: "5",
    assigneeName: "كرم عبد الرحمن",
    priority: "low",
    status: "completed",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    createdBy: "1",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 100000,
    description: "دفعة أولى لمشروع فيلا الرياض",
    category: "التصميم",
    paymentMethod: "تحويل بنكي",
    date: new Date().toISOString(),
    dateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    status: "completed",
    clientName: "أحمد محمد السعيد",
    projectName: "فيلا الرياض الحديثة",
    invoiceNumber: "INV-001",
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "income",
    amount: 200000,
    description: "دفعة أولى لمشروع المجمع التجاري",
    category: "رخصة البناء",
    paymentMethod: "شيك",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    status: "completed",
    clientName: "شركة البناء المتطور",
    projectName: "مجمع تجاري الدمام",
    invoiceNumber: "INV-002",
    createdBy: "1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    type: "expense",
    amount: 15000,
    description: "شراء مواد البناء",
    category: "مواد البناء",
    paymentMethod: "نقدي",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    status: "completed",
    createdBy: "1",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    type: "income",
    amount: 50000,
    description: "دفعة أولى لفيلا جدة",
    category: "التصميم",
    paymentMethod: "تحويل بنكي",
    date: new Date().toISOString(),
    dateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    status: "completed",
    clientName: "محمد علي الخالدي",
    projectName: "فيلا جدة الساحلية",
    invoiceNumber: "INV-003",
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
]

// Mock attendance records
const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: "1",
    userId: "1",
    userName: "محمد قطب",
    date: new Date().toISOString(),
    dateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    checkIn: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    checkOut: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    totalHours: 9,
    status: "present",
    notes: "",
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "2",
    userName: "مصطفى صلاح",
    date: new Date().toISOString(),
    dateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    checkIn: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(),
    checkOut: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(),
    totalHours: 9,
    status: "late",
    notes: "تأخر 30 دقيقة",
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    userId: "3",
    userName: "عمرو رمضان",
    date: new Date().toISOString(),
    dateHijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    checkIn: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    checkOut: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    totalHours: 5,
    status: "half-day",
    notes: "إجازة نصف يوم",
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
]

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [companyName, setCompanyName] = useState("المكتب الهندسي المتقدم")

  // Initialize data only once
  useEffect(() => {
    setProjects(MOCK_PROJECTS)
    setClients(MOCK_CLIENTS)
    setTasks(MOCK_TASKS)
    setTransactions(MOCK_TRANSACTIONS)
    setAttendanceRecords(MOCK_ATTENDANCE_RECORDS)
  }, [])

  // Memoized dashboard stats with better performance
  const dashboardStats = useMemo(() => {
    const totalProjects = projects.length
    const completedProjects = projects.filter((p) => p.status === "completed").length
    const ongoingProjects = projects.filter((p) => p.status === "in-progress").length
    const newProjects = projects.filter((p) => p.status === "new").length

    const totalClients = clients.length
    const newClientsThisMonth = clients.filter((c) => isCurrentMonth(c.createdAt)).length

    const ongoingTasks = tasks.filter((t) => t.status === "in-progress" || t.status === "todo").length
    const completedTasks = tasks.filter((t) => t.status === "completed").length

    const currentMonthTransactions = transactions.filter((t) => isCurrentMonth(t.date) && t.status === "completed")
    const monthlyRevenue = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalIncome = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0)

    const netProfit = totalIncome - totalExpenses

    return {
      totalProjects,
      completedProjects,
      ongoingProjects,
      newProjects,
      totalClients,
      newClientsThisMonth,
      ongoingTasks,
      completedTasks,
      monthlyRevenue,
      totalIncome,
      totalExpenses,
      netProfit,
    }
  }, [projects, clients, tasks, transactions])

  const getDashboardStats = useCallback(() => {
    return dashboardStats
  }, [dashboardStats])

  const addProject = useCallback((project: Omit<Project, "id">) => {
    const newProject = { ...project, id: Date.now().toString() }
    setProjects((prev) => [newProject, ...prev])

    // Update client's project count and revenue
    setClients((prev) =>
      prev.map((client) =>
        client.id === project.clientId
          ? {
              ...client,
              totalProjects: client.totalProjects + 1,
              totalRevenue: client.totalRevenue + project.price,
            }
          : client,
      ),
    )
  }, [])

  const updateProject = useCallback((id: string, updatedProject: Partial<Project>) => {
    setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, ...updatedProject } : project)))
  }, [])

  const deleteProject = useCallback((id: string) => {
    const project = projects.find((p) => p.id === id)
    if (project) {
      setProjects((prev) => prev.filter((p) => p.id !== id))

      // Update client's project count and revenue
      setClients((prev) =>
        prev.map((client) =>
          client.id === project.clientId
            ? {
                ...client,
                totalProjects: Math.max(0, client.totalProjects - 1),
                totalRevenue: Math.max(0, client.totalRevenue - project.price),
              }
            : client,
        ),
      )
    }
  }, [projects])

  const addClient = useCallback((client: Omit<Client, "id">) => {
    const newClient = { ...client, id: Date.now().toString() }
    setClients((prev) => [newClient, ...prev])
  }, [])

  const updateClient = useCallback((id: string, updatedClient: Partial<Client>) => {
    setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...updatedClient } : client)))
  }, [])

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const addTask = useCallback((task: Omit<Task, "id">) => {
    const newTask = { ...task, id: Date.now().toString() }
    setTasks((prev) => [newTask, ...prev])
  }, [])

  const updateTask = useCallback((id: string, updatedTask: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updatedTask } : task)))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addTransaction = useCallback((transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      invoiceNumber: transaction.type === "income" ? `INV-${Date.now().toString().slice(-6)}` : undefined,
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }, [])

  const updateTransaction = useCallback((id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((transaction) => (transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction)),
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addAttendanceRecord = useCallback((record: Omit<AttendanceRecord, "id">) => {
    const newRecord = { ...record, id: Date.now().toString() }
    setAttendanceRecords((prev) => [newRecord, ...prev])
  }, [])

  const updateAttendanceRecord = useCallback((id: string, updatedRecord: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) =>
      prev.map((record) => (record.id === id ? { ...record, ...updatedRecord } : record)),
    )
  }, [])

  const deleteAttendanceRecord = useCallback((id: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const contextValue = useMemo(() => ({
    projects,
    clients,
    tasks,
    transactions,
    attendanceRecords,
    companyName,
    setCompanyName,
    addProject,
    updateProject,
    deleteProject,
    addClient,
    updateClient,
    deleteClient,
    addTask,
    updateTask,
    deleteTask,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    getDashboardStats,
  }), [
    projects,
    clients,
    tasks,
    transactions,
    attendanceRecords,
    companyName,
    addProject,
    updateProject,
    deleteProject,
    addClient,
    updateClient,
    deleteClient,
    addTask,
    updateTask,
    deleteTask,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    getDashboardStats,
  ])

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
