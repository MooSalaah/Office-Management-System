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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [newProject, setNewProject] = useState({
    name: "",
    clientName: "",
    clientId: "",
    type: "سكني",
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

  const [taskAssignments, setTaskAssignments] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchEngineers()
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const fetchEngineers = async () => {
    // Simulate API call - get all users who can be assigned to projects
    setEngineers([
      { id: "1", name: "محمد قطب" },
      { id: "2", name: "مصطفى صلاح" },
      { id: "3", name: "عمرو رمضان" },
      { id: "4", name: "محمد مجدي" },
      { id: "5", name: "كرم عبد الرحمن" },
      { id: "6", name: "علي أحمد" },
      { id: "7", name: "مروان جمال" },
      { id: "8", name: "وليد عزام" },
    ])
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

      const project = {
        name: newProject.name,
        clientId: clientId,
        clientName: newProject.clientName,
        type: newProject.type,
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

      // Create default tasks for the project
      for (const task of newProject.selectedTasks) {
        const assigneeId = taskAssignments[task]
        if (assigneeId) {
          const assignee = engineers.find((e) => e.id === assigneeId)
          addTask({
            title: task,
            description: `مهمة من المشروع: ${newProject.name}`,
            projectId: Date.now().toString(), // This would be the actual project ID
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
        }
      }

      setIsCreateDialogOpen(false)
      resetNewProject()

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
        name: editProject.name,
        clientId: clientId,
        clientName: editProject.clientName,
        type: editProject.type,
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
      }

      updateProject(editProject.id, updatedProject)

      setIsEditDialogOpen(false)

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

      const client = {
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

  const resetNewProject = () => {
    setNewProject({
      name: "",
      clientName: "",
      clientId: "",
      type: "سكني",
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
                        <SelectValue placeholder="اختر العميل أو أدخل اسم جديد" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={newProject.clientName}
                      onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                      placeholder="أو أدخل اسم العميل"
                      className="text-right flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsAddClientDialogOpen(true)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectType">نوع المشروع</Label>
                  <Select
                    value={newProject.type}
                    onValueChange={(value) => setNewProject({ ...newProject, type: value })}
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
                <Label>المهام الافتراضية</Label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {defaultTasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between space-x-2 space-x-reverse p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`task-${index}`}
                          checked={newProject.selectedTasks.includes(task)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewProject({
                                ...newProject,
                                selectedTasks: [...newProject.selectedTasks, task],
                              })
                            } else {
                              setNewProject({
                                ...newProject,
                                selectedTasks: newProject.selectedTasks.filter((t) => t !== task),
                              })
                              // Remove task assignment
                              const newAssignments = { ...taskAssignments }
                              delete newAssignments[task]
                              setTaskAssignments(newAssignments)
                            }
                          }}
                        />
                        <Label htmlFor={`task-${index}`} className="text-sm flex-1">
                          {task}
                        </Label>
                      </div>
                      {newProject.selectedTasks.includes(task) && (
                        <Select
                          value={taskAssignments[task] || ""}
                          onValueChange={(value) => setTaskAssignments({ ...taskAssignments, [task]: value })}
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
                <Badge className={getStatusColor(project.status)}>
                  {project.status === "in-progress"
                    ? "قيد التنفيذ"
                    : project.status === "completed"
                      ? "مكتمل"
                      : project.status === "new"
                        ? "جديد"
                        : "ملغي"}
                </Badge>
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
                      assignedEngineers: project.assignedEngineers,
                      price: project.price,
                      downPayment: project.downPayment,
                      description: project.description,
                      startDate: new Date(project.startDate).toISOString().split("T")[0],
                      selectedTasks: project.defaultTasks || [],
                    })
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

              <div className="grid grid-cols-2 gap-4">
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
    </div>
  )
}
