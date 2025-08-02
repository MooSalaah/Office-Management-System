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
import { Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, User, Search, Filter } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useData } from "@/components/data-provider"
import { formatCurrency, formatDate, convertToArabicNumerals } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ClientsSkeleton } from "@/components/ui/skeleton-loaders"

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
  createdAt: string
}

export default function ClientsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { clients, addClient, updateClient, deleteClient } = useData()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    contactPerson: "",
  })

  const [editClient, setEditClient] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    contactPerson: "",
  })

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateClient = async () => {
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
      setIsCreateDialogOpen(false)
      resetNewClient()

      toast({
        title: "تم إضافة العميل بنجاح",
        description: "تم إضافة العميل الجديد",
      })
    } catch (error) {
      toast({
        title: "خطأ في إضافة العميل",
        description: "حدث خطأ أثناء إضافة العميل",
        variant: "destructive",
      })
    }
  }

  const handleEditClient = async () => {
    try {
      if (!editClient.name || !editClient.phone) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال الاسم ورقم الهاتف على الأقل",
          variant: "destructive",
        })
        return
      }

      const updatedClient = {
        name: editClient.name,
        phone: editClient.phone,
        email: editClient.email,
        address: editClient.address,
        contactPerson: editClient.contactPerson || editClient.name,
      }

      updateClient(editClient.id, updatedClient)
      setIsEditDialogOpen(false)

      toast({
        title: "تم تحديث العميل بنجاح",
        description: "تم تحديث بيانات العميل",
      })
    } catch (error) {
      toast({
        title: "خطأ في تحديث العميل",
        description: "حدث خطأ أثناء تحديث العميل",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      deleteClient(clientId)
      toast({
        title: "تم حذف العميل",
        description: "تم حذف العميل بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في حذف العميل",
        description: "حدث خطأ أثناء حذف العميل",
        variant: "destructive",
      })
    }
  }

  const resetNewClient = () => {
    setNewClient({
      name: "",
      phone: "",
      email: "",
      address: "",
      contactPerson: "",
    })
  }

  const filteredClients = clients.filter((client) => {
    const matchesStatus = filterStatus === "all" || client.status === filterStatus
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Show skeleton while loading
  if (isLoading) {
    return <ClientsSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة العملاء</h1>
          <p className="text-muted-foreground">إدارة قاعدة بيانات العملاء</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
              <DialogDescription>أدخل بيانات العميل الجديد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">اسم العميل *</Label>
                  <Input
                    id="clientName"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="أدخل اسم العميل"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">رقم الهاتف *</Label>
                  <Input
                    id="clientPhone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">البريد الإلكتروني</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="example@email.com"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientContactPerson">الشخص المسؤول</Label>
                  <Input
                    id="clientContactPerson"
                    value={newClient.contactPerson}
                    onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                    placeholder="اسم الشخص المسؤول"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientAddress">العنوان</Label>
                <Textarea
                  id="clientAddress"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="أدخل عنوان العميل"
                  className="text-right"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateClient}>إضافة العميل</Button>
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
              <SelectItem value="all">جميع العملاء</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="البحث في العملاء..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-right"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="card-hover border border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="text-right flex-1">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {client.contactPerson !== client.name ? `المسؤول: ${client.contactPerson}` : ""}
                  </p>
                </div>
                <Badge className={client.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {client.status === "active" ? "نشط" : "غير نشط"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-600">{convertToArabicNumerals(client.totalProjects)}</div>
                  <div className="text-xs text-muted-foreground">المشاريع</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">{formatCurrency(client.totalRevenue)}</div>
                  <div className="text-xs text-muted-foreground">الإيرادات</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedClient(client)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditClient({
                      id: client.id,
                      name: client.name,
                      phone: client.phone,
                      email: client.email,
                      address: client.address,
                      contactPerson: client.contactPerson,
                    })
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteClient(client.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل العميل</DialogTitle>
            <DialogDescription>تعديل بيانات العميل</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editClientName">اسم العميل *</Label>
                <Input
                  id="editClientName"
                  value={editClient.name}
                  onChange={(e) => setEditClient({ ...editClient, name: e.target.value })}
                  placeholder="أدخل اسم العميل"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClientPhone">رقم الهاتف *</Label>
                <Input
                  id="editClientPhone"
                  value={editClient.phone}
                  onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editClientEmail">البريد الإلكتروني</Label>
                <Input
                  id="editClientEmail"
                  type="email"
                  value={editClient.email}
                  onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                  placeholder="example@email.com"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClientContactPerson">الشخص المسؤول</Label>
                <Input
                  id="editClientContactPerson"
                  value={editClient.contactPerson}
                  onChange={(e) => setEditClient({ ...editClient, contactPerson: e.target.value })}
                  placeholder="اسم الشخص المسؤول"
                  className="text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editClientAddress">العنوان</Label>
              <Textarea
                id="editClientAddress"
                value={editClient.address}
                onChange={(e) => setEditClient({ ...editClient, address: e.target.value })}
                placeholder="أدخل عنوان العميل"
                className="text-right"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEditClient}>حفظ التغييرات</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم العميل</Label>
                  <p className="font-semibold">{selectedClient.name}</p>
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <p className="font-semibold">{selectedClient.phone}</p>
                </div>
              </div>

              {selectedClient.email && (
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <p>{selectedClient.email}</p>
                </div>
              )}

              {selectedClient.contactPerson && selectedClient.contactPerson !== selectedClient.name && (
                <div>
                  <Label>الشخص المسؤول</Label>
                  <p>{selectedClient.contactPerson}</p>
                </div>
              )}

              {selectedClient.address && (
                <div>
                  <Label>العنوان</Label>
                  <p>{selectedClient.address}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">{convertToArabicNumerals(selectedClient.totalProjects)}</div>
                  <div className="text-sm text-muted-foreground">إجمالي المشاريع</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedClient.totalRevenue)}</div>
                  <div className="text-sm text-muted-foreground">إجمالي الإيرادات</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label>الحالة:</Label>
                <Badge className={selectedClient.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {selectedClient.status === "active" ? "نشط" : "غير نشط"}
                </Badge>
              </div>

              <div>
                <Label>تاريخ التسجيل</Label>
                <p>{formatDate(new Date(selectedClient.createdAt))}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
