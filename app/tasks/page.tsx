"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Eye, Edit, Trash2, Calendar, User, Filter, Search, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useData } from "@/components/data-provider"
import { formatDate, getHijriDate, convertToArabicNumerals } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { TasksSkeleton } from "@/components/ui/skeleton-loaders"

interface Task {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  assigneeId: string
  assigneeName: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed" | "cancelled"
  dueDate: string
  dueDateHijri: string
  createdBy: string
  createdAt: string
}

export default function TasksPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { tasks, projects, addTask, updateTask, deleteTask } = useData()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    projectId: "",
    projectName: "",
    assigneeId: "",
    assigneeName: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  })

  const [editTask, setEditTask] = useState({
    id: "",
    title: "",
    description: "",
    projectId: "",
    projectName: "",
    assigneeId: "",
    assigneeName: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "in-progress" | "completed" | "cancelled",
    dueDate: "",
  })

  const engineers = [
    { id: "1", name: "محمد قطب" },
    { id: "2", name: "مصطفى صلاح" },
    { id: "3", name: "عمرو رمضان" },
    { id: "4", name: "محمد مجدي" },
    { id: "5", name: "كرم عبد الرحمن" },
    { id: "6", name: "علي أحمد" },
    { id: "7", name: "مروان جمال" },
    { id: "8", name: "وليد عزام" },
  ]

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateTask = async () => {
    try {
      if (!newTask.title || !newTask.projectId || !newTask.assigneeId) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        })
        return
      }

      const selectedProject = projects.find((p) => p.id === newTask.projectId)
      const selectedEngineer = engineers.find((e) => e.id === newTask.assigneeId)

      const task = {
        title: newTask.title,
        description: newTask.description,
        projectId: newTask.projectId,
        projectName: selectedProject?.name || newTask.projectName,
        assigneeId: newTask.assigneeId,
        assigneeName: selectedEngineer?.name || newTask.assigneeName,
        priority: newTask.priority,
        status: "todo" as const,
        dueDate: new Date(newTask.dueDate).toISOString(),
        dueDateHijri: getHijriDate(new Date(newTask.dueDate)),
        createdBy: user?.id || "",
        createdAt: new Date().toISOString(),
      }

      addTask(task)
      setIsCreateDialogOpen(false)
      resetNewTask()

      toast({
        title: "تم إنشاء المهمة بنجاح",
        description: "تم إضافة المهمة الجديدة",
      })
    } catch (error) {
      toast({
        title: "خطأ في إنشاء المهمة",
        description: "حدث خطأ أثناء إنشاء المهمة",
        variant: "destructive",
      })
    }
  }

  const handleEditTask = async () => {
    try {
      if (!editTask.title || !editTask.projectId || !editTask.assigneeId) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        })
        return
      }

      const selectedProject = projects.find((p) => p.id === editTask.projectId)
      const selectedEngineer = engineers.find((e) => e.id === editTask.assigneeId)

      const updatedTask = {
        title: editTask.title,
        description: editTask.description,
        projectId: editTask.projectId,
        projectName: selectedProject?.name || editTask.projectName,
        assigneeId: editTask.assigneeId,
        assigneeName: selectedEngineer?.name || editTask.assigneeName,
        priority: editTask.priority,
        status: editTask.status,
        dueDate: new Date(editTask.dueDate).toISOString(),
        dueDateHijri: getHijriDate(new Date(editTask.dueDate)),
      }

      updateTask(editTask.id, updatedTask)
      setIsEditDialogOpen(false)

      toast({
        title: "تم تحديث المهمة بنجاح",
        description: "تم تحديث بيانات المهمة",
      })
    } catch (error) {
      toast({
        title: "خطأ في تحديث المهمة",
        description: "حدث خطأ أثناء تحديث المهمة",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      deleteTask(taskId)
      toast({
        title: "تم حذف المهمة",
        description: "تم حذف المهمة بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في حذف المهمة",
        description: "حدث خطأ أثناء حذف المهمة",
        variant: "destructive",
      })
    }
  }

  const resetNewTask = () => {
    setNewTask({
      title: "",
      description: "",
      projectId: "",
      projectName: "",
      assigneeId: "",
      assigneeName: "",
      priority: "medium",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigneeName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesPriority && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "todo":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "todo":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  // Show skeleton while loading
  if (isLoading) {
    return <TasksSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المهام</h1>
          <p className="text-muted-foreground">إدارة وتتبع جميع المهام</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              مهمة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
              <DialogDescription>أدخل تفاصيل المهمة الجديدة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taskTitle">عنوان المهمة *</Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="أدخل عنوان المهمة"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskDescription">وصف المهمة</Label>
                <Textarea
                  id="taskDescription"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="أدخل وصف المهمة"
                  className="text-right"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskProject">المشروع *</Label>
                  <Select
                    value={newTask.projectId}
                    onValueChange={(value) => {
                      const project = projects.find((p) => p.id === value)
                      setNewTask({
                        ...newTask,
                        projectId: value,
                        projectName: project?.name || "",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskAssignee">المسؤول *</Label>
                  <Select
                    value={newTask.assigneeId}
                    onValueChange={(value) => {
                      const engineer = engineers.find((e) => e.id === value)
                      setNewTask({
                        ...newTask,
                        assigneeId: value,
                        assigneeName: engineer?.name || "",
                      })
                    }}
                  >
                    <SelectTrigger>
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskPriority">الأولوية</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDueDate">تاريخ الاستحقاق</Label>
                  <Input
                    id="taskDueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="text-right"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateTask}>إنشاء المهمة</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="todo">قيد الانتظار</SelectItem>
              <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأولويات</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="low">منخفضة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="البحث في المهام..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-right"
        />
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="card-hover border border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="text-right flex-1">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">المشروع: {task.projectName}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status === "completed"
                      ? "مكتمل"
                      : task.status === "in-progress"
                        ? "قيد التنفيذ"
                        : task.status === "todo"
                          ? "قيد الانتظار"
                          : "ملغي"}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority === "high" ? "عالية" : task.priority === "medium" ? "متوسطة" : "منخفضة"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{task.assigneeName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(new Date(task.dueDate))}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedTask(task)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditTask({
                      id: task.id,
                      title: task.title,
                      description: task.description,
                      projectId: task.projectId,
                      projectName: task.projectName,
                      assigneeId: task.assigneeId,
                      assigneeName: task.assigneeName,
                      priority: task.priority,
                      status: task.status,
                      dueDate: new Date(task.dueDate).toISOString().split("T")[0],
                    })
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteTask(task.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل المهمة</DialogTitle>
            <DialogDescription>تعديل تفاصيل المهمة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTaskTitle">عنوان المهمة *</Label>
              <Input
                id="editTaskTitle"
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                placeholder="أدخل عنوان المهمة"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTaskDescription">وصف المهمة</Label>
              <Textarea
                id="editTaskDescription"
                value={editTask.description}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                placeholder="أدخل وصف المهمة"
                className="text-right"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTaskProject">المشروع *</Label>
                <Select
                  value={editTask.projectId}
                  onValueChange={(value) => {
                    const project = projects.find((p) => p.id === value)
                    setEditTask({
                      ...editTask,
                      projectId: value,
                      projectName: project?.name || "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTaskAssignee">المسؤول *</Label>
                <Select
                  value={editTask.assigneeId}
                  onValueChange={(value) => {
                    const engineer = engineers.find((e) => e.id === value)
                    setEditTask({
                      ...editTask,
                      assigneeId: value,
                      assigneeName: engineer?.name || "",
                    })
                  }}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTaskPriority">الأولوية</Label>
                <Select
                  value={editTask.priority}
                  onValueChange={(value) => setEditTask({ ...editTask, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTaskStatus">الحالة</Label>
                <Select
                  value={editTask.status}
                  onValueChange={(value) => setEditTask({ ...editTask, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">قيد الانتظار</SelectItem>
                    <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTaskDueDate">تاريخ الاستحقاق</Label>
                <Input
                  id="editTaskDueDate"
                  type="date"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                  className="text-right"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEditTask}>حفظ التغييرات</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المهمة</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>عنوان المهمة</Label>
                  <p className="font-semibold">{selectedTask.title}</p>
                </div>
                <div>
                  <Label>المشروع</Label>
                  <p className="font-semibold">{selectedTask.projectName}</p>
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <Label>الوصف</Label>
                  <p>{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المسؤول</Label>
                  <p>{selectedTask.assigneeName}</p>
                </div>
                <div>
                  <Label>تاريخ الاستحقاق</Label>
                  <p>{formatDate(new Date(selectedTask.dueDate))}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الحالة</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTask.status)}
                    <Badge className={getStatusColor(selectedTask.status)}>
                      {selectedTask.status === "completed"
                        ? "مكتمل"
                        : selectedTask.status === "in-progress"
                          ? "قيد التنفيذ"
                          : selectedTask.status === "todo"
                            ? "قيد الانتظار"
                            : "ملغي"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>الأولوية</Label>
                  <Badge className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority === "high" ? "عالية" : selectedTask.priority === "medium" ? "متوسطة" : "منخفضة"}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>تاريخ الإنشاء</Label>
                <p>{formatDate(new Date(selectedTask.createdAt))}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
