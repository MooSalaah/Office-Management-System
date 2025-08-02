"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Eye, Edit, Trash2, Calendar, User, Filter, UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useData } from "@/components/data-provider"
import { formatCurrency, formatDate, getHijriDate, getStatusColor, convertToArabicNumerals } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { SaudiRiyalIcon } from "@/components/ui/saudi-riyal-icon"
import { ProjectsSkeleton } from "@/components/ui/skeleton-loaders"

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

const defaultTasks = [
  "المخططات المعمارية",
  "قرار المساحة",
  "مفهوم المخطط الأولي",
  "خطة السلامة",
  "رفع الرخصة",
  "المخطط الإنشائي",
  "التصميم ثلاثي الأبعاد",
  "دمج الرخصة",
  "التقرير الفني الإلكتروني",
  "تعديل/إضافة مكونات المبنى",
  "شهادة إتمام السلامة",
  "مطابقة مخططات السلامة",
  "تقارير الإشراف",
  "إشراف الرخصة",
  "شهادة الإشغال",
  "تقسيم القطعة",
  "مخطط السعة",
  "تقرير إسكان الحج",
  "تقرير السلامة الفوري",
  "تقرير السلامة غير الفوري",
  "رخصة السياج",
  "رخصة البناء",
  "رخصة الهدم",
]

export default function ProjectsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { projects, clients, addProject, updateProject, deleteProject, addClient, addTask } = useData()
  const [engineers, setEngineers] = useState<{ id: string; name: string }[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false)
  const [isAddProjectTypeDialogOpen, setIsAddProjectTypeDialogOpen] = useState(false)
  const [isAddDefaultTaskDialogOpen, setIsAddDefaultTaskDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filterStatus, setFilterStatus] = useState("in-progress")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [newProject, setNewProject] = useState({
    name: "",
    clientName: "",
    clientId: "",
    type: "سكني",
    priority: "medium" as "low" | "medium" | "high",
    assignedEngineers: [] as string[],
    price: 0,
    downPayment: 0,
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    selectedTasks: [] as string[],
  })

  const [editProject, setEditProject] = useState({
    id: "",
    name: "",
    clientName: "",
    clientId: "",
    type: "سكني",
    priority: "medium" as "low" | "medium" | "high",
    assignedEngineers: [] as string[],
    price: 0,
    downPayment: 0,
    description: "",
    startDate: "",
    selectedTasks: [] as string[],
  })

  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    contactPerson: "",
  })

  const [newProjectType, setNewProjectType] = useState({
    name: "",
    description: "",
  })

  const [newDefaultTask, setNewDefaultTask] = useState({
    title: "",
    description: "",
    category: "other" as const,
  })

  const [taskAssignments, setTaskAssignments] = useState<{ [key: string]: string }>({})
  const [defaultTasks, setDefaultTasks] = useState<{ id: string; title: string; description?: string; category: string; isActive: boolean }[]>([])
  const [projectTypes, setProjectTypes] = useState<{ id: string; name: string; description?: string; isActive: boolean }[]>([])
  const [projectTasks, setProjectTasks] = useState<{ id: string; title: string; description?: string; status: string; assigneeName?: string; dueDate?: string }[]>([])

  useEffect(() => {
    fetchEngineers()
    fetchDefaultTasks()
    fetchProjectTypes()
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const fetchEngineers = async () => {
    // Simulate API call - get only engineers and managers
    setEngineers([
      { id: "1", name: "محمد قطب", role: "engineer" },
      { id: "2", name: "مصطفى صلاح", role: "engineer" },
      { id: "3", name: "عمرو رمضان", role: "engineer" },
      { id: "4", name: "محمد مجدي", role: "manager" },
      { id: "5", name: "كرم عبد الرحمن", role: "engineer" },
      { id: "6", name: "علي أحمد", role: "engineer" },
      { id: "7", name: "مروان جمال", role: "manager" },
      { id: "8", name: "وليد عزام", role: "engineer" },
    ].filter(user => user.role === "engineer" || user.role === "manager"))
  }

  const fetchDefaultTasks = async () => {
    try {
      const response = await fetch('/api/default-tasks?active=true')
      if (response.ok) {
        const result = await response.json()
        setDefaultTasks(result.data)
      } else {
        // Fallback to mock data if API fails
        setDefaultTasks([
          { id: "1", title: "تصميم معماري", description: "تصميم المخططات المعمارية", category: "architectural", isActive: true },
          { id: "2", title: "تصميم إنشائي", description: "تصميم المخططات الإنشائية", category: "structural", isActive: true },
          { id: "3", title: "تصميم كهربائي", description: "تصميم المخططات الكهربائية", category: "electrical", isActive: true },
          { id: "4", title: "تصميم ميكانيكي", description: "تصميم المخططات الميكانيكية", category: "mechanical", isActive: true },
          { id: "5", title: "تصميم سباكة", description: "تصميم مخططات السباكة", category: "plumbing", isActive: true },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch default tasks:', error)
      // Fallback to mock data
      setDefaultTasks([
        { id: "1", title: "تصميم معماري", description: "تصميم المخططات المعمارية", category: "architectural", isActive: true },
        { id: "2", title: "تصميم إنشائي", description: "تصميم المخططات الإنشائية", category: "structural", isActive: true },
        { id: "3", title: "تصميم كهربائي", description: "تصميم المخططات الكهربائية", category: "electrical", isActive: true },
        { id: "4", title: "تصميم ميكانيكي", description: "تصميم المخططات الميكانيكية", category: "mechanical", isActive: true },
        { id: "5", title: "تصميم سباكة", description: "تصميم مخططات السباكة", category: "plumbing", isActive: true },
      ])
    }
  }

  const fetchProjectTypes = async () => {
    try {
      const response = await fetch('/api/project-types?active=true')
      if (response.ok) {
        const result = await response.json()
        setProjectTypes(result.data)
      } else {
        // Fallback to mock data if API fails
        setProjectTypes([
          { id: "1", name: "سكني", description: "مشاريع سكنية", isActive: true },
          { id: "2", name: "تجاري", description: "مشاريع تجارية", isActive: true },
          { id: "3", name: "صناعي", description: "مشاريع صناعية", isActive: true },
          { id: "4", name: "إداري", description: "مشاريع إدارية", isActive: true },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch project types:', error)
      // Fallback to mock data
      setProjectTypes([
        { id: "1", name: "سكني", description: "مشاريع سكنية", isActive: true },
        { id: "2", name: "تجاري", description: "مشاريع تجارية", isActive: true },
        { id: "3", name: "صناعي", description: "مشاريع صناعية", isActive: true },
        { id: "4", name: "إداري", description: "مشاريع إدارية", isActive: true },
      ])
    }
  }

  const fetchProjectTasks = async (projectId: string) => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`)
      if (response.ok) {
        const result = await response.json()
        setProjectTasks(result.data)
      } else {
        setProjectTasks([])
      }
    } catch (error) {
      console.error('Failed to fetch project tasks:', error)
      setProjectTasks([])
    }
  }

  const handleCreateProject = async () => {
    try {
      if (!newProject.name || !newProject.clientName || !newProject.price) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        })
        return
      }

      const selectedClient = clients.find((c) => c.name === newProject.clientName)
      const clientId = selectedClient?.id || newProject.clientId

      const projectData = {
        title: newProject.name,
        clientId: clientId,
        type: newProject.type as any,
        priority: newProject.priority,
        status: "in-progress" as const,
        assignedTo: newProject.assignedEngineers,
        budget: newProject.price,
        description: newProject.description,
        startDate: new Date(newProject.startDate),
      }

      // Call API to create project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const result = await response.json()
      const project = {
        id: result.data._id,
        name: newProject.name,
        clientId: clientId,
        clientName: newProject.clientName,
        type: newProject.type,
        priority: newProject.priority,
        status: "in-progress" as const,
        assignedEngineers: newProject.assignedEngineers,
        assignedEngineerNames: newProject.assignedEngineers.map((id) => engineers.find((e) => e.id === id)?.name || ""),
        startDate: new Date(newProject.startDate).toISOString(),
        startDateHijri: getHijriDate(new Date(newProject.startDate)),
        price: newProject.price,
        downPayment: newProject.downPayment,
        remainingBalance: newProject.price - newProject.downPayment,
        progress: 0,
        description: newProject.description,
        defaultTasks: newProject.selectedTasks,
      }

      addProject(project)

      // Send notification to all users about new project
      toast({
        title: "تم إنشاء المشروع بنجاح",
        description: `تم إنشاء مشروع جديد: ${newProject.name}`,
      })

      // Create default tasks for the project
      for (const taskTitle of newProject.selectedTasks) {
        const assigneeId = taskAssignments[taskTitle]
        if (assigneeId) {
          const assignee = engineers.find((e) => e.id === assigneeId)
          const defaultTask = defaultTasks.find(t => t.title === taskTitle)
          const taskData = {
            title: taskTitle,
            description: defaultTask?.description || `مهمة من المشروع: ${newProject.name}`,
            projectId: result.data._id,
            assignedTo: [assigneeId],
            priority: "medium" as const,
            status: "pending" as const,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
          
          // Call API to create task
          const taskResponse = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
          })

          if (taskResponse.ok) {
            const taskResult = await taskResponse.json()
            addTask({
              title: taskTitle,
              description: defaultTask?.description || `مهمة من المشروع: ${newProject.name}`,
              projectId: result.data._id,
              projectName: newProject.name,
              assigneeId: assigneeId,
              assigneeName: assignee?.name || "",
              priority: "medium" as const,
              status: "todo" as const,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              dueDateHijri: getHijriDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
              createdBy: user?.id || "",
              createdAt: new Date().toISOString(),
            })

            // Send notification to assigned user
            toast({
              title: "تم تعيين مهمة جديدة",
              description: `تم تعيين مهمة "${taskTitle}" للمهندس ${assignee?.name} من قبل ${user?.name || 'المستخدم'}`,
            })
          }
        }
      }

      setIsCreateDialogOpen(false)
      resetNewProject()

      // Fetch project tasks after creation
      if (result.data._id) {
        setTimeout(() => {
          fetchProjectTasks(result.data._id)
        }, 1000) // Wait for tasks to be created
      }

      toast({
        title: "تم إنشاء المشروع بنجاح",
        description: "تم إنشاء المشروع والمهام الافتراضية",
      })
    } catch (error) {
      toast({
        title: "خطأ في إنشاء المشروع",
        description: "حدث خطأ أثناء إنشاء المشروع",
        variant: "destructive",
      })
    }
  }

  const handleEditProject = async () => {
    try {
      if (!editProject.name || !editProject.clientName || !editProject.price) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        })
        return
      }

      const selectedClient = clients.find((c) => c.name === editProject.clientName)
      const clientId = selectedClient?.id || editProject.clientId

      const updatedProject = {
        title: editProject.name,
        clientId: clientId,
        type: editProject.type as any,
        priority: editProject.priority,
        assignedTo: editProject.assignedEngineers,
        budget: editProject.price,
        description: editProject.description,
        startDate: new Date(editProject.startDate),
      }

      // Call API to update project
      const response = await fetch(`/api/projects/${editProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject),
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      // Update local state
      updateProject(editProject.id, {
        name: editProject.name,
        clientId: clientId,
        clientName: editProject.clientName,
        type: editProject.type,
        priority: editProject.priority,
        assignedEngineers: editProject.assignedEngineers,
        assignedEngineerNames: editProject.assignedEngineers.map(
          (id) => engineers.find((e) => e.id === id)?.name || "",
        ),
        startDate: new Date(editProject.startDate).toISOString(),
        startDateHijri: getHijriDate(new Date(editProject.startDate)),
        price: editProject.price,
        downPayment: editProject.downPayment,
        remainingBalance: editProject.price - editProject.downPayment,
        description: editProject.description,
        defaultTasks: editProject.selectedTasks,
      })

      setIsEditDialogOpen(false)

      // Fetch project tasks after update
      fetchProjectTasks(editProject.id)

      // Send notification to assigned engineers about project update
      editProject.assignedEngineers.forEach(engineerId => {
        const engineer = engineers.find(e => e.id === engineerId)
        toast({
          title: "تم تحديث المشروع",
          description: `تم تحديث مشروع: ${editProject.name} - المهندس: ${engineer?.name}`,
        })
      })

      toast({
        title: "تم تحديث المشروع بنجاح",
        description: "تم تحديث بيانات المشروع",
      })
    } catch (error) {
      toast({
        title: "خطأ في تحديث المشروع",
        description: "حدث خطأ أثناء تحديث المشروع",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      deleteProject(projectId)
      toast({
        title: "تم حذف المشروع",
        description: "تم حذف المشروع بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في حذف المشروع",
        description: "حدث خطأ أثناء حذف المشروع",
        variant: "destructive",
      })
    }
  }

  const handleAddClient = async () => {
    try {
      if (!newClient.name || !newClient.phone) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال الاسم ورقم الهاتف على الأقل",
          variant: "destructive",
        })
        return
      }

      const clientData = {
        name: newClient.name,
        phone: newClient.phone,
        email: newClient.email,
        address: newClient.address,
        contactPerson: newClient.contactPerson || newClient.name,
        status: "active" as const,
      }

      // Call API to create client
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        throw new Error('Failed to create client')
      }

      const result = await response.json()
      const client = {
        id: result.data._id,
        name: newClient.name,
        phone: newClient.phone,
        email: newClient.email,
        address: newClient.address,
        contactPerson: newClient.contactPerson || newClient.name,
        totalProjects: 0,
        totalRevenue: 0,
        status: "active" as const,
        createdAt: new Date().toISOString(),
      }

      addClient(client)
      setNewProject({ ...newProject, clientName: newClient.name })
      setIsAddClientDialogOpen(false)
      setNewClient({
        name: "",
        phone: "",
        email: "",
        address: "",
        contactPerson: "",
      })

      toast({
        title: "تم إضافة العميل بنجاح",
        description: "تم إضافة العميل الجديد وتحديد اسمه في المشروع",
      })
    } catch (error) {
      toast({
        title: "خطأ في إضافة العميل",
        description: "حدث خطأ أثناء إضافة العميل",
        variant: "destructive",
      })
    }
  }

  const handleAddProjectType = async () => {
    try {
      if (!newProjectType.name) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال اسم نوع المشروع",
          variant: "destructive",
        })
        return
      }

      const typeData = {
        name: newProjectType.name,
        description: newProjectType.description,
        isActive: true,
      }

      // Call API to create project type
      const response = await fetch('/api/project-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeData),
      })

      if (!response.ok) {
        throw new Error('Failed to create project type')
      }

      const result = await response.json()
      
      // Add the new project type to the list
      setNewProject({ ...newProject, type: newProjectType.name })
      setIsAddProjectTypeDialogOpen(false)
      setNewProjectType({
        name: "",
        description: "",
      })

      toast({
        title: "تم إضافة نوع المشروع بنجاح",
        description: "تم إضافة نوع المشروع الجديد وتحديده في المشروع",
      })
    } catch (error) {
      toast({
        title: "خطأ في إضافة نوع المشروع",
        description: "حدث خطأ أثناء إضافة نوع المشروع",
        variant: "destructive",
      })
    }
  }

    const handleAddDefaultTask = async () => {
    try {
      if (!newDefaultTask.title) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال عنوان المهمة",
          variant: "destructive",
        })
        return
      }

      const taskData = {
        title: newDefaultTask.title,
        description: newDefaultTask.description,
        category: newDefaultTask.category,
        isActive: true,
      }

      // Call API to create default task
      const response = await fetch('/api/default-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error('Failed to create default task')
      }

      const result = await response.json()
      
      // Add the new task to the default tasks list
      setDefaultTasks(prev => [...prev, {
        id: result.data._id,
        title: newDefaultTask.title,
        description: newDefaultTask.description,
        category: newDefaultTask.category,
        isActive: true,
      }])

      setNewProject({ 
        ...newProject, 
        selectedTasks: [...newProject.selectedTasks, newDefaultTask.title]
      })
      setIsAddDefaultTaskDialogOpen(false)
      setNewDefaultTask({
        title: "",
        description: "",
        category: "other",
      })

      toast({
        title: "تم إضافة المهمة الافتراضية بنجاح",
        description: "تم إضافة المهمة الافتراضية الجديدة وتحديدها في المشروع",
      })
    } catch (error) {
      toast({
        title: "خطأ في إضافة المهمة الافتراضية",
        description: "حدث خطأ أثناء إضافة المهمة الافتراضية",
        variant: "destructive",
      })
    }
  }

  const resetNewProject = () => {
    setNewProject({
      name: "",
      clientName: "",
      clientId: "",
      type: "سكني",
      priority: "medium" as "low" | "medium" | "high",
      assignedEngineers: [],
      price: 0,
      downPayment: 0,
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      selectedTasks: [],
    })
    setTaskAssignments({})
  }

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = filterStatus === "all" || project.status === filterStatus
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Show skeleton while loading
  if (isLoading) {
    return <ProjectsSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المشاريع</h1>
          <p className="text-muted-foreground">إدارة وتتبع جميع المشاريع</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              مشروع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء مشروع جديد</DialogTitle>
              <DialogDescription>أدخل تفاصيل المشروع الجديد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">اسم المشروع</Label>
                  <Input
                    id="projectName"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="أدخل اسم المشروع"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">اسم العميل</Label>
                  <div className="flex gap-2">
                    <Select
                      value={newProject.clientName}
                      onValueChange={(value) => setNewProject({ ...newProject, clientName: value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsAddClientDialogOpen(true)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectType">نوع المشروع</Label>
                  <div className="flex gap-2">
                    <Select
                      value={newProject.type}
                      onValueChange={(value) => setNewProject({ ...newProject, type: value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="اختر نوع المشروع" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsAddProjectTypeDialogOpen(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectPriority">أهمية المشروع</Label>
                  <Select
                    value={newProject.priority}
                    onValueChange={(value) => setNewProject({ ...newProject, priority: value as "low" | "medium" | "high" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر أهمية المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المهندسون المسؤولون</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !newProject.assignedEngineers.includes(value)) {
                        setNewProject({
                          ...newProject,
                          assignedEngineers: [...newProject.assignedEngineers, value],
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المهندسين" />
                    </SelectTrigger>
                    <SelectContent>
                      {engineers.map((engineer) => (
                        <SelectItem key={engineer.id} value={engineer.id}>
                          {engineer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newProject.assignedEngineers.map((engineerId) => {
                      const engineer = engineers.find((e) => e.id === engineerId)
                      return (
                        <Badge key={engineerId} variant="secondary" className="flex items-center gap-1">
                          {engineer?.name}
                          <button
                            onClick={() =>
                              setNewProject({
                                ...newProject,
                                assignedEngineers: newProject.assignedEngineers.filter((id) => id !== engineerId),
                              })
                            }
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalPrice">إجمالي القيمة</Label>
                  <div className="relative">
                    <Input
                      id="totalPrice"
                      type="number"
                      min="0"
                      value={newProject.price}
                      onChange={(e) => setNewProject({ ...newProject, price: Number(e.target.value) })}
                      placeholder="0"
                      className="text-right pl-12"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <SaudiRiyalIcon size={16} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downPayment">المبلغ المقدم</Label>
                  <div className="relative">
                    <Input
                      id="downPayment"
                      type="number"
                      min="0"
                      max={newProject.price}
                      value={newProject.downPayment}
                      onChange={(e) => setNewProject({ ...newProject, downPayment: Number(e.target.value) })}
                      placeholder="0"
                      className="text-right pl-12"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <SaudiRiyalIcon size={16} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>المبلغ المتبقي</Label>
                  <div className="relative">
                    <Input
                      value={convertToArabicNumerals(newProject.price - newProject.downPayment)}
                      disabled
                      className="text-right pl-12 bg-muted"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <SaudiRiyalIcon size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">تاريخ البداية (ميلادي)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ البداية (هجري)</Label>
                  <Input
                    value={newProject.startDate ? getHijriDate(new Date(newProject.startDate)) : ""}
                    disabled
                    className="text-right bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف المشروع</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="أدخل وصف المشروع"
                  className="text-right"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>المهام الافتراضية</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddDefaultTaskDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة مهمة
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {defaultTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between space-x-2 space-x-reverse p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={newProject.selectedTasks.includes(task.title)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewProject({
                                ...newProject,
                                selectedTasks: [...newProject.selectedTasks, task.title],
                              })
                            } else {
                              setNewProject({
                                ...newProject,
                                selectedTasks: newProject.selectedTasks.filter((t) => t !== task.title),
                              })
                              // Remove task assignment
                              const newAssignments = { ...taskAssignments }
                              delete newAssignments[task.title]
                              setTaskAssignments(newAssignments)
                            }
                          }}
                        />
                        <Label htmlFor={`task-${task.id}`} className="text-sm flex-1">
                          {task.title}
                        </Label>
                      </div>
                      {newProject.selectedTasks.includes(task.title) && (
                        <Select
                          value={taskAssignments[task.title] || ""}
                          onValueChange={(value) => setTaskAssignments({ ...taskAssignments, [task.title]: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="اختر المسؤول" />
                          </SelectTrigger>
                          <SelectContent>
                            {engineers.map((engineer) => (
                              <SelectItem key={engineer.id} value={engineer.id}>
                                {engineer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateProject}>إنشاء المشروع</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة عميل جديد</DialogTitle>
            <DialogDescription>أدخل بيانات العميل الجديد</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newClientName">اسم العميل *</Label>
                <Input
                  id="newClientName"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="أدخل اسم العميل"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClientPhone">رقم الهاتف *</Label>
                <Input
                  id="newClientPhone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newClientEmail">البريد الإلكتروني</Label>
                <Input
                  id="newClientEmail"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="example@email.com"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClientContactPerson">الشخص المسؤول</Label>
                <Input
                  id="newClientContactPerson"
                  value={newClient.contactPerson}
                  onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                  placeholder="اسم الشخص المسؤول"
                  className="text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newClientAddress">العنوان</Label>
              <Textarea
                id="newClientAddress"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                placeholder="أدخل عنوان العميل"
                className="text-right"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddClientDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddClient}>إضافة العميل</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Project Type Dialog */}
      <Dialog open={isAddProjectTypeDialogOpen} onOpenChange={setIsAddProjectTypeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة نوع مشروع جديد</DialogTitle>
            <DialogDescription>أدخل بيانات نوع المشروع الجديد</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newProjectTypeName">اسم نوع المشروع *</Label>
              <Input
                id="newProjectTypeName"
                value={newProjectType.name}
                onChange={(e) => setNewProjectType({ ...newProjectType, name: e.target.value })}
                placeholder="أدخل اسم نوع المشروع"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newProjectTypeDescription">الوصف</Label>
              <Textarea
                id="newProjectTypeDescription"
                value={newProjectType.description}
                onChange={(e) => setNewProjectType({ ...newProjectType, description: e.target.value })}
                placeholder="أدخل وصف نوع المشروع"
                className="text-right"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddProjectTypeDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddProjectType}>إضافة نوع المشروع</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Default Task Dialog */}
      <Dialog open={isAddDefaultTaskDialogOpen} onOpenChange={setIsAddDefaultTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مهمة افتراضية جديدة</DialogTitle>
            <DialogDescription>أدخل بيانات المهمة الافتراضية الجديدة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newDefaultTaskTitle">عنوان المهمة *</Label>
              <Input
                id="newDefaultTaskTitle"
                value={newDefaultTask.title}
                onChange={(e) => setNewDefaultTask({ ...newDefaultTask, title: e.target.value })}
                placeholder="أدخل عنوان المهمة"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDefaultTaskDescription">الوصف</Label>
              <Textarea
                id="newDefaultTaskDescription"
                value={newDefaultTask.description}
                onChange={(e) => setNewDefaultTask({ ...newDefaultTask, description: e.target.value })}
                placeholder="أدخل وصف المهمة"
                className="text-right"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDefaultTaskCategory">الفئة</Label>
              <Select
                value={newDefaultTask.category}
                onValueChange={(value) => setNewDefaultTask({ ...newDefaultTask, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة المهمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="architectural">معماري</SelectItem>
                  <SelectItem value="structural">إنشائي</SelectItem>
                  <SelectItem value="electrical">كهربائي</SelectItem>
                  <SelectItem value="mechanical">ميكانيكي</SelectItem>
                  <SelectItem value="plumbing">سباكة</SelectItem>
                  <SelectItem value="safety">سلامة</SelectItem>
                  <SelectItem value="permits">تراخيص</SelectItem>
                  <SelectItem value="supervision">إشراف</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDefaultTaskDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddDefaultTask}>إضافة المهمة</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المشاريع</SelectItem>
              <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="new">جديد</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="البحث في المشاريع..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-right"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="card-hover border border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="text-right flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">العميل: {project.clientName}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status === "in-progress"
                      ? "قيد التنفيذ"
                      : project.status === "completed"
                        ? "مكتمل"
                        : project.status === "new"
                          ? "جديد"
                          : "ملغي"}
                  </Badge>
                  <Badge 
                    variant={project.priority && project.priority === "high" ? "destructive" : project.priority && project.priority === "medium" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {project.priority && project.priority === "high" ? "عالية" : project.priority && project.priority === "medium" ? "متوسطة" : project.priority && project.priority === "low" ? "منخفضة" : "غير محدد"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>التقدم</span>
                  <span>{convertToArabicNumerals(project.progress)}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(new Date(project.startDate))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{project.assignedEngineerNames[0] || "غير محدد"}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>القيمة الإجمالية:</span>
                <span className="font-semibold">{formatCurrency(project.price)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>المبلغ المتبقي:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(project.remainingBalance)}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedProject(project)
                    setIsViewDialogOpen(true)
                    // Fetch project tasks
                    fetchProjectTasks(project.id)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditProject({
                      id: project.id,
                      name: project.name,
                      clientName: project.clientName,
                      clientId: project.clientId,
                      type: project.type,
                      priority: project.priority || "medium" as "low" | "medium" | "high",
                      assignedEngineers: project.assignedEngineers,
                      price: project.price,
                      downPayment: project.downPayment,
                      description: project.description,
                      startDate: new Date(project.startDate).toISOString().split("T")[0],
                      selectedTasks: project.defaultTasks || [],
                    })
                    
                    // Fetch project tasks
                    fetchProjectTasks(project.id)
                    // Set task assignments
                    const assignments: { [key: string]: string } = {}
                    project.defaultTasks?.forEach((task) => {
                      assignments[task] = ""
                    })
                    setTaskAssignments(assignments)
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteProject(project.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Project Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المشروع</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم المشروع</Label>
                  <p className="font-semibold">{selectedProject.name}</p>
                </div>
                <div>
                  <Label>العميل</Label>
                  <p className="font-semibold">{selectedProject.clientName}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>نوع المشروع</Label>
                  <p>{selectedProject.type}</p>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Badge className={getStatusColor(selectedProject.status)}>
                    {selectedProject.status === "in-progress"
                      ? "قيد التنفيذ"
                      : selectedProject.status === "completed"
                        ? "مكتمل"
                        : selectedProject.status === "new"
                          ? "جديد"
                          : "ملغي"}
                  </Badge>
                </div>
                <div>
                  <Label>الأهمية</Label>
                  <Badge 
                    variant={selectedProject.priority && selectedProject.priority === "high" ? "destructive" : selectedProject.priority && selectedProject.priority === "medium" ? "default" : "secondary"}
                  >
                    {selectedProject.priority && selectedProject.priority === "high" ? "عالية" : selectedProject.priority && selectedProject.priority === "medium" ? "متوسطة" : selectedProject.priority && selectedProject.priority === "low" ? "منخفضة" : "غير محدد"}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>المهندسون المسؤولون</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedProject.assignedEngineerNames.map((name, index) => (
                    <Badge key={index} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>القيمة الإجمالية</Label>
                  <p className="font-semibold">{formatCurrency(selectedProject.price)}</p>
                </div>
                <div>
                  <Label>المبلغ المقدم</Label>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedProject.downPayment)}</p>
                </div>
                <div>
                  <Label>المبلغ المتبقي</Label>
                  <p className="font-semibold text-orange-600">{formatCurrency(selectedProject.remainingBalance)}</p>
                </div>
              </div>

              <div>
                <Label>التقدم</Label>
                <div className="space-y-2">
                  <Progress value={selectedProject.progress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {convertToArabicNumerals(selectedProject.progress)}% مكتمل
                  </p>
                </div>
              </div>

              <div>
                <Label>مهام المشروع</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {projectTasks.length > 0 ? (
                    projectTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={task.status === "completed" ? "default" : task.status === "in-progress" ? "secondary" : "outline"}>
                              {task.status === "completed" ? "مكتملة" : task.status === "in-progress" ? "قيد التنفيذ" : task.status === "pending" ? "في الانتظار" : "ملغية"}
                            </Badge>
                            {task.assigneeName && (
                              <Badge variant="outline">{task.assigneeName}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">لا توجد مهام لهذا المشروع</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>تاريخ البداية (ميلادي)</Label>
                  <p>{formatDate(new Date(selectedProject.startDate))}</p>
                </div>
                <div>
                  <Label>تاريخ البداية (هجري)</Label>
                  <p>{selectedProject.startDateHijri}</p>
                </div>
              </div>

              <div>
                <Label>الوصف</Label>
                <p className="text-sm text-muted-foreground">{selectedProject.description || "لا يوجد وصف"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المشروع</DialogTitle>
            <DialogDescription>عدل تفاصيل المشروع</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editProjectName">اسم المشروع</Label>
                <Input
                  id="editProjectName"
                  value={editProject.name}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  placeholder="أدخل اسم المشروع"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClientName">اسم العميل</Label>
                <Select
                  value={editProject.clientName}
                  onValueChange={(value) => setEditProject({ ...editProject, clientName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editProjectType">نوع المشروع</Label>
                <Select
                  value={editProject.type}
                  onValueChange={(value) => setEditProject({ ...editProject, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="سكني">سكني</SelectItem>
                    <SelectItem value="تجاري">تجاري</SelectItem>
                    <SelectItem value="صناعي">صناعي</SelectItem>
                    <SelectItem value="إداري">إداري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editProjectPriority">أهمية المشروع</Label>
                <Select
                  value={editProject.priority}
                  onValueChange={(value) => setEditProject({ ...editProject, priority: value as "low" | "medium" | "high" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر أهمية المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>المهندسون المسؤولون</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !editProject.assignedEngineers.includes(value)) {
                    setEditProject({
                      ...editProject,
                      assignedEngineers: [...editProject.assignedEngineers, value],
                    })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المهندسين" />
                </SelectTrigger>
                <SelectContent>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {editProject.assignedEngineers.map((engineerId) => {
                  const engineer = engineers.find((e) => e.id === engineerId)
                  return (
                    <Badge key={engineerId} variant="secondary" className="flex items-center gap-1">
                      {engineer?.name}
                      <button
                        onClick={() =>
                          setEditProject({
                            ...editProject,
                            assignedEngineers: editProject.assignedEngineers.filter((id) => id !== engineerId),
                          })
                        }
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTotalPrice">إجمالي القيمة</Label>
                <div className="relative">
                  <Input
                    id="editTotalPrice"
                    type="number"
                    min="0"
                    value={editProject.price}
                    onChange={(e) => setEditProject({ ...editProject, price: Number(e.target.value) })}
                    placeholder="0"
                    className="text-right pl-12"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <SaudiRiyalIcon size={16} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDownPayment">المبلغ المقدم</Label>
                <div className="relative">
                  <Input
                    id="editDownPayment"
                    type="number"
                    min="0"
                    max={editProject.price}
                    value={editProject.downPayment}
                    onChange={(e) => setEditProject({ ...editProject, downPayment: Number(e.target.value) })}
                    placeholder="0"
                    className="text-right pl-12"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <SaudiRiyalIcon size={16} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>المبلغ المتبقي</Label>
                <div className="relative">
                  <Input
                    value={convertToArabicNumerals(editProject.price - editProject.downPayment)}
                    disabled
                    className="text-right pl-12 bg-muted"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <SaudiRiyalIcon size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editStartDate">تاريخ البداية (ميلادي)</Label>
                <Input
                  id="editStartDate"
                  type="date"
                  value={editProject.startDate}
                  onChange={(e) => setEditProject({ ...editProject, startDate: e.target.value })}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label>تاريخ البداية (هجري)</Label>
                <Input
                  value={editProject.startDate ? getHijriDate(new Date(editProject.startDate)) : ""}
                  disabled
                  className="text-right bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">وصف المشروع</Label>
              <Textarea
                id="editDescription"
                value={editProject.description}
                onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                placeholder="أدخل وصف المشروع"
                className="text-right"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEditProject}>حفظ التعديلات</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
