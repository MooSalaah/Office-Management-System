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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Eye, Edit, Trash2, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Filter, Search, User, LogIn, LogOut, Heart } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useData } from "@/components/data-provider"
import { formatDate, getHijriDate, convertToArabicNumerals } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AttendanceSkeleton } from "@/components/ui/skeleton-loaders"
import { cn } from "@/lib/utils"

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

export default function AttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { attendanceRecords, addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord } = useData()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [newRecord, setNewRecord] = useState({
    userId: "",
    userName: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "08:00",
    checkOut: "",
    status: "present" as const,
    notes: "",
  })

  const [editRecord, setEditRecord] = useState({
    id: "",
    userId: "",
    userName: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "present" as "present" | "absent" | "late" | "half-day" | "leave" | "sick-leave",
    notes: "",
  })

  const employees = [
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

  const handleCreateRecord = async () => {
    try {
      if (!newRecord.userId || !newRecord.date || !newRecord.checkIn) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        })
        return
      }

      const selectedEmployee = employees.find((e) => e.id === newRecord.userId)
      const checkInTime = new Date(`${newRecord.date}T${newRecord.checkIn}`)
      const checkOutTime = newRecord.checkOut ? new Date(`${newRecord.date}T${newRecord.checkOut}`) : undefined
      
      let totalHours = 0
      if (checkOutTime) {
        totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      }

      const record = {
        userId: newRecord.userId,
        userName: selectedEmployee?.name || newRecord.userName,
        date: new Date(newRecord.date).toISOString(),
        dateHijri: getHijriDate(new Date(newRecord.date)),
        checkIn: checkInTime.toISOString(),
        checkOut: checkOutTime?.toISOString(),
        totalHours: totalHours > 0 ? totalHours : undefined,
        status: newRecord.status,
        notes: newRecord.notes,
        createdBy: user?.id || "",
        createdAt: new Date().toISOString(),
      }

      addAttendanceRecord(record)
      setIsCreateDialogOpen(false)
      resetNewRecord()

      toast({
        title: "تم إضافة سجل الحضور بنجاح",
        description: "تم تسجيل الحضور",
      })
    } catch (error) {
      toast({
        title: "خطأ في إضافة سجل الحضور",
        description: "حدث خطأ أثناء إضافة السجل",
        variant: "destructive",
      })
    }
  }

  const handleEditRecord = async () => {
    try {
      if (!editRecord.userId || !editRecord.date || !editRecord.checkIn) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        })
        return
      }

      const selectedEmployee = employees.find((e) => e.id === editRecord.userId)
      const checkInTime = new Date(`${editRecord.date}T${editRecord.checkIn}`)
      const checkOutTime = editRecord.checkOut ? new Date(`${editRecord.date}T${editRecord.checkOut}`) : undefined
      
      let totalHours = 0
      if (checkOutTime) {
        totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      }

      const updatedRecord = {
        userId: editRecord.userId,
        userName: selectedEmployee?.name || editRecord.userName,
        date: new Date(editRecord.date).toISOString(),
        dateHijri: getHijriDate(new Date(editRecord.date)),
        checkIn: checkInTime.toISOString(),
        checkOut: checkOutTime?.toISOString(),
        totalHours: totalHours > 0 ? totalHours : undefined,
        status: editRecord.status,
        notes: editRecord.notes,
      }

      updateAttendanceRecord(editRecord.id, updatedRecord)
      setIsEditDialogOpen(false)

      toast({
        title: "تم تحديث سجل الحضور بنجاح",
        description: "تم تحديث بيانات السجل",
      })
    } catch (error) {
      toast({
        title: "خطأ في تحديث سجل الحضور",
        description: "حدث خطأ أثناء تحديث السجل",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    try {
      deleteAttendanceRecord(recordId)
      toast({
        title: "تم حذف سجل الحضور",
        description: "تم حذف السجل بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في حذف سجل الحضور",
        description: "حدث خطأ أثناء حذف السجل",
        variant: "destructive",
      })
    }
  }

  const resetNewRecord = () => {
    setNewRecord({
      userId: "",
      userName: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "08:00",
      checkOut: "",
      status: "present",
      notes: "",
    })
  }

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesStatus = filterStatus === "all" || record.status === filterStatus
    const matchesDate = !filterDate || new Date(record.date).toDateString() === filterDate.toDateString()
    const matchesSearch = record.userName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesDate && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "half-day":
        return "bg-orange-100 text-orange-800"
      case "leave":
        return "bg-blue-100 text-blue-800"
      case "sick-leave":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "حاضر"
      case "absent":
        return "غائب"
      case "late":
        return "متأخر"
      case "half-day":
        return "نصف يوم"
      case "leave":
        return "إجازة"
      case "sick-leave":
        return "إجازة مرضية"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "half-day":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "leave":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "sick-leave":
        return <Heart className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const todayRecords = attendanceRecords.filter((record) => 
    new Date(record.date).toDateString() === new Date().toDateString()
  )

  const presentToday = todayRecords.filter((record) => record.status === "present").length
  const absentToday = todayRecords.filter((record) => record.status === "absent").length
  const lateToday = todayRecords.filter((record) => record.status === "late").length

  // Show skeleton while loading
  if (isLoading) {
    return <AttendanceSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الحضور والانصراف</h1>
          <p className="text-muted-foreground">تتبع حضور الموظفين</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              تسجيل حضور
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تسجيل حضور جديد</DialogTitle>
              <DialogDescription>أدخل تفاصيل سجل الحضور</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recordEmployee">الموظف *</Label>
                  <Select
                    value={newRecord.userId}
                    onValueChange={(value) => {
                      const employee = employees.find((e) => e.id === value)
                      setNewRecord({
                        ...newRecord,
                        userId: value,
                        userName: employee?.name || "",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recordDate">التاريخ *</Label>
                  <Input
                    id="recordDate"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    className="text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recordCheckIn">وقت الحضور *</Label>
                  <Input
                    id="recordCheckIn"
                    type="time"
                    value={newRecord.checkIn}
                    onChange={(e) => setNewRecord({ ...newRecord, checkIn: e.target.value })}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recordCheckOut">وقت الانصراف</Label>
                  <Input
                    id="recordCheckOut"
                    type="time"
                    value={newRecord.checkOut}
                    onChange={(e) => setNewRecord({ ...newRecord, checkOut: e.target.value })}
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordStatus">الحالة</Label>
                <Select
                  value={newRecord.status}
                  onValueChange={(value) => setNewRecord({ ...newRecord, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">حاضر</SelectItem>
                    <SelectItem value="absent">غائب</SelectItem>
                    <SelectItem value="late">متأخر</SelectItem>
                    <SelectItem value="half-day">نصف يوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordNotes">ملاحظات</Label>
                <Input
                  id="recordNotes"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  placeholder="أدخل ملاحظات إضافية"
                  className="text-right"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateRecord}>تسجيل الحضور</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحضور اليوم</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{convertToArabicNumerals(presentToday)}</div>
            <p className="text-xs text-muted-foreground">موظف حاضر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الغياب اليوم</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{convertToArabicNumerals(absentToday)}</div>
            <p className="text-xs text-muted-foreground">موظف غائب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التأخير اليوم</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{convertToArabicNumerals(lateToday)}</div>
            <p className="text-xs text-muted-foreground">موظف متأخر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{convertToArabicNumerals(employees.length)}</div>
            <p className="text-xs text-muted-foreground">موظف</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>تقويم الحضور</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={filterDate}
            onSelect={setFilterDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

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
              <SelectItem value="present">حاضر</SelectItem>
              <SelectItem value="absent">غائب</SelectItem>
              <SelectItem value="late">متأخر</SelectItem>
              <SelectItem value="half-day">نصف يوم</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="البحث في الموظفين..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-right"
        />
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>سجلات الحضور</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${getStatusColor(record.status).replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{record.userName}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(new Date(record.date))}</div>
                    <div className="text-xs text-muted-foreground">{record.dateHijri}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm">
                    <LogIn className="h-4 w-4 text-green-600" />
                    <span>{new Date(record.checkIn).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {record.checkOut && (
                    <div className="flex items-center gap-2 text-sm">
                      <LogOut className="h-4 w-4 text-red-600" />
                      <span>{new Date(record.checkOut).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  {record.totalHours && (
                    <div className="text-xs text-muted-foreground">
                      {convertToArabicNumerals(record.totalHours.toFixed(1))} ساعة
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRecord(record)
                      setIsViewDialogOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditRecord({
                        id: record.id,
                        userId: record.userId,
                        userName: record.userName,
                        date: new Date(record.date).toISOString().split("T")[0],
                        checkIn: new Date(record.checkIn).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                        checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : "",
                        status: record.status,
                        notes: record.notes || "",
                      })
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteRecord(record.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل سجل الحضور</DialogTitle>
            <DialogDescription>تعديل تفاصيل سجل الحضور</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editRecordEmployee">الموظف *</Label>
                <Select
                  value={editRecord.userId}
                  onValueChange={(value) => {
                    const employee = employees.find((e) => e.id === value)
                    setEditRecord({
                      ...editRecord,
                      userId: value,
                      userName: employee?.name || "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRecordDate">التاريخ *</Label>
                <Input
                  id="editRecordDate"
                  type="date"
                  value={editRecord.date}
                  onChange={(e) => setEditRecord({ ...editRecord, date: e.target.value })}
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editRecordCheckIn">وقت الحضور *</Label>
                <Input
                  id="editRecordCheckIn"
                  type="time"
                  value={editRecord.checkIn}
                  onChange={(e) => setEditRecord({ ...editRecord, checkIn: e.target.value })}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRecordCheckOut">وقت الانصراف</Label>
                <Input
                  id="editRecordCheckOut"
                  type="time"
                  value={editRecord.checkOut}
                  onChange={(e) => setEditRecord({ ...editRecord, checkOut: e.target.value })}
                  className="text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRecordStatus">الحالة</Label>
              <Select
                value={editRecord.status}
                onValueChange={(value) => setEditRecord({ ...editRecord, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">حاضر</SelectItem>
                  <SelectItem value="absent">غائب</SelectItem>
                  <SelectItem value="late">متأخر</SelectItem>
                  <SelectItem value="half-day">نصف يوم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRecordNotes">ملاحظات</Label>
              <Input
                id="editRecordNotes"
                value={editRecord.notes}
                onChange={(e) => setEditRecord({ ...editRecord, notes: e.target.value })}
                placeholder="أدخل ملاحظات إضافية"
                className="text-right"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEditRecord}>حفظ التغييرات</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل سجل الحضور</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الموظف</Label>
                  <p className="font-semibold">{selectedRecord.userName}</p>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRecord.status)}
                    <Badge className={getStatusColor(selectedRecord.status)}>
                      {getStatusText(selectedRecord.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>التاريخ (ميلادي)</Label>
                  <p>{formatDate(new Date(selectedRecord.date))}</p>
                </div>
                <div>
                  <Label>التاريخ (هجري)</Label>
                  <p>{selectedRecord.dateHijri}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>وقت الحضور</Label>
                  <p>{new Date(selectedRecord.checkIn).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {selectedRecord.checkOut && (
                  <div>
                    <Label>وقت الانصراف</Label>
                    <p>{new Date(selectedRecord.checkOut).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
              </div>

              {selectedRecord.totalHours && (
                <div>
                  <Label>إجمالي الساعات</Label>
                  <p>{convertToArabicNumerals(selectedRecord.totalHours.toFixed(1))} ساعة</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <Label>ملاحظات</Label>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}

              <div>
                <Label>تاريخ الإنشاء</Label>
                <p>{formatDate(new Date(selectedRecord.createdAt))}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
