"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import { isCurrentMonth } from "@/lib/utils"
import Cookies from 'js-cookie'
import { useAuth } from './auth-provider'

interface Project {
  id: string
  name: string
  clientId: string
  clientName: string
  type: string
  priority?: "low" | "medium" | "high"
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
  addProject: (project: Omit<Project, "id">) => Promise<void>
  updateProject: (id: string, project: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  addClient: (client: Omit<Client, "id">) => Promise<void>
  updateClient: (id: string, client: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  addTask: (task: Omit<Task, "id">) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addAttendanceRecord: (record: Omit<AttendanceRecord, "id">) => Promise<void>
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => Promise<void>
  deleteAttendanceRecord: (id: string) => Promise<void>
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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [companyName, setCompanyName] = useState("المكتب الهندسي المتقدم")

  const { user } = useAuth()

  const fetchData = useCallback(async () => {
    const token = Cookies.get('token')
    if (!token) return

    const headers = {
      'Authorization': `Bearer ${token}`,
    }

    try {
      const [projectsRes, clientsRes, tasksRes, transactionsRes, attendanceRes] = await Promise.all([
        fetch('/api/projects', { headers }),
        fetch('/api/clients', { headers }),
        fetch('/api/tasks', { headers }),
        fetch('/api/finance/transactions', { headers }),
        fetch('/api/attendance', { headers }),
      ])

      const [projectsData, clientsData, tasksData, transactionsData, attendanceData] = await Promise.all([
        projectsRes.json(),
        clientsRes.json(),
        tasksRes.json(),
        transactionsRes.json(),
        attendanceRes.json(),
      ])

      if (projectsData.success) setProjects(projectsData.data)
      if (clientsData.success) setClients(clientsData.data)
      if (tasksData.success) setTasks(tasksData.data)
      if (transactionsData.success) setTransactions(transactionsData.data)
      if (attendanceData.success) setAttendanceRecords(attendanceData.data)

    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, fetchData])

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

  const addProject = useCallback(async (project: Omit<Project, "id">) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(project),
    })
    const data = await response.json()
    if (data.success) {
      setProjects((prev) => [data.data, ...prev])
      // Re-fetch clients to update their project count and revenue
      fetchData()
    }
  }, [fetchData])

  const updateProject = useCallback(async (id: string, updatedProject: Partial<Project>) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedProject),
    })
    const data = await response.json()
    if (data.success) {
      setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, ...updatedProject } : project)))
      fetchData()
    }
  }, [fetchData])

  const deleteProject = useCallback(async (id: string) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const data = await response.json()
    if (data.success) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      fetchData()
    }
  }, [fetchData])

  const addClient = useCallback(async (client: Omit<Client, "id">) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(client),
    })
    const data = await response.json()
    if (data.success) {
      setClients((prev) => [data.data, ...prev])
    }
  }, [])

  const updateClient = useCallback(async (id: string, updatedClient: Partial<Client>) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedClient),
    })
    const data = await response.json()
    if (data.success) {
      setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...updatedClient } : client)))
    }
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/clients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const data = await response.json()
    if (data.success) {
      setClients((prev) => prev.filter((c) => c.id !== id))
    }
  }, [])

  const addTask = useCallback(async (task: Omit<Task, "id">) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    })
    const data = await response.json()
    if (data.success) {
      setTasks((prev) => [data.data, ...prev])
    }
  }, [])

  const updateTask = useCallback(async (id: string, updatedTask: Partial<Task>) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTask),
    })
    const data = await response.json()
    if (data.success) {
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updatedTask } : task)))
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const data = await response.json()
    if (data.success) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    }
  }, [])

  const addTransaction = useCallback(async (transaction: Omit<Transaction, "id">) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch('/api/finance/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transaction),
    })
    const data = await response.json()
    if (data.success) {
      setTransactions((prev) => [data.data, ...prev])
    }
  }, [])

  const updateTransaction = useCallback(async (id: string, updatedTransaction: Partial<Transaction>) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/finance/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTransaction),
    })
    const data = await response.json()
    if (data.success) {
      setTransactions((prev) =>
        prev.map((transaction) => (transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction)),
      )
    }
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/finance/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const data = await response.json()
    if (data.success) {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    }
  }, [])

  const addAttendanceRecord = useCallback(async (record: Omit<AttendanceRecord, "id">) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(record),
    })
    const data = await response.json()
    if (data.success) {
      setAttendanceRecords((prev) => [data.data, ...prev])
    }
  }, [])

  const updateAttendanceRecord = useCallback(async (id: string, updatedRecord: Partial<AttendanceRecord>) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/attendance/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedRecord),
    })
    const data = await response.json()
    if (data.success) {
      setAttendanceRecords((prev) =>
        prev.map((record) => (record.id === id ? { ...record, ...updatedRecord } : record)),
      )
    }
  }, [])

  const deleteAttendanceRecord = useCallback(async (id: string) => {
    const token = Cookies.get('token')
    if (!token) return
    const response = await fetch(`/api/attendance/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const data = await response.json()
    if (data.success) {
      setAttendanceRecords((prev) => prev.filter((r) => r.id !== id))
    }
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