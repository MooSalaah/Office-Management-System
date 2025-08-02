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
import { Plus, Eye, Edit, Trash2, Calendar, DollarSign, TrendingUp, TrendingDown, Download, FileText, Filter, Search } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useData } from "@/components/data-provider"
import { formatCurrency, formatDate, getHijriDate, convertToArabicNumerals } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { SaudiRiyalIcon } from "@/components/ui/saudi-riyal-icon"
import { FinanceSkeleton } from "@/components/ui/skeleton-loaders"
import dynamic from "next/dynamic"

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

interface Transaction {
  id: string
  type: "income" | "expense"
  category: string
  amount: number
  description: string
  date: string
  dateHijri: string
  status: "completed" | "pending" | "cancelled"
  paymentMethod: string
  projectId?: string
  projectName?: string
  clientId?: string
  clientName?: string
  createdBy: string
  createdAt: string
}

export default function FinancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { transactions, projects, clients, addTransaction, updateTransaction, deleteTransaction } = useData()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [newTransaction, setNewTransaction] = useState({
    type: "income" as const,
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    projectName: "",
    clientId: "",
    clientName: "",
  })

  const [editTransaction, setEditTransaction] = useState({
    id: "",
    type: "income" as "income" | "expense",
    category: "",
    amount: 0,
    description: "",
    date: "",
    projectId: "",
    projectName: "",
    clientId: "",
    clientName: "",
  })

  const incomeCategories = [
    "إيرادات المشاريع",
    "مدفوعات العملاء",
    "رسوم الخدمات",
    "إيرادات أخرى",
  ]

  const expenseCategories = [
    "رواتب الموظفين",
    "مصاريف المكتب",
    "مصاريف المشاريع",
    "مصاريف السفر",
    "مصاريف أخرى",
  ]

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateTransaction = async () => {
    try {
      if (!newTransaction.category || !newTransaction.amount) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال الفئة والمبلغ",
          variant: "destructive",
        })
        return
      }

      const selectedProject = projects.find((p) => p.id === newTransaction.projectId)
      const selectedClient = clients.find((c) => c.id === newTransaction.clientId)

      const transaction = {
        type: newTransaction.type,
        category: newTransaction.category,
        amount: newTransaction.amount,
        description: newTransaction.description,
        date: new Date(newTransaction.date).toISOString(),
        dateHijri: getHijriDate(new Date(newTransaction.date)),
        status: "completed" as const,
        paymentMethod: "cash",
        projectId: newTransaction.projectId || undefined,
        projectName: selectedProject?.name || newTransaction.projectName,
        clientId: newTransaction.clientId || undefined,
        clientName: selectedClient?.name || newTransaction.clientName,
        createdBy: user?.id || "",
        createdAt: new Date().toISOString(),
      }

      addTransaction(transaction)
      setIsCreateDialogOpen(false)
      resetNewTransaction()

      toast({
        title: "تم إضافة المعاملة بنجاح",
        description: "تم تسجيل المعاملة المالية",
      })
    } catch (error) {
      toast({
        title: "خطأ في إضافة المعاملة",
        description: "حدث خطأ أثناء إضافة المعاملة",
        variant: "destructive",
      })
    }
  }

  const handleEditTransaction = async () => {
    try {
      if (!editTransaction.category || !editTransaction.amount) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال الفئة والمبلغ",
          variant: "destructive",
        })
        return
      }

      const selectedProject = projects.find((p) => p.id === editTransaction.projectId)
      const selectedClient = clients.find((c) => c.id === editTransaction.clientId)

      const updatedTransaction = {
        type: editTransaction.type,
        category: editTransaction.category,
        amount: editTransaction.amount,
        description: editTransaction.description,
        date: new Date(editTransaction.date).toISOString(),
        dateHijri: getHijriDate(new Date(editTransaction.date)),
        projectId: editTransaction.projectId || undefined,
        projectName: selectedProject?.name || editTransaction.projectName,
        clientId: editTransaction.clientId || undefined,
        clientName: selectedClient?.name || editTransaction.clientName,
      }

      updateTransaction(editTransaction.id, updatedTransaction)
      setIsEditDialogOpen(false)

      toast({
        title: "تم تحديث المعاملة بنجاح",
        description: "تم تحديث بيانات المعاملة",
      })
    } catch (error) {
      toast({
        title: "خطأ في تحديث المعاملة",
        description: "حدث خطأ أثناء تحديث المعاملة",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      deleteTransaction(transactionId)
      toast({
        title: "تم حذف المعاملة",
        description: "تم حذف المعاملة بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في حذف المعاملة",
        description: "حدث خطأ أثناء حذف المعاملة",
        variant: "destructive",
      })
    }
  }

  const resetNewTransaction = () => {
    setNewTransaction({
      type: "income",
      category: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      projectId: "",
      projectName: "",
      clientId: "",
      clientName: "",
    })
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.projectName && transaction.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.clientName && transaction.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesType && matchesCategory && matchesSearch
  })

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

  const monthlyData = [
    { month: "يناير", income: 150000, expenses: 80000 },
    { month: "فبراير", income: 180000, expenses: 90000 },
    { month: "مارس", income: 220000, expenses: 110000 },
    { month: "أبريل", income: 200000, expenses: 95000 },
    { month: "مايو", income: 250000, expenses: 120000 },
    { month: "يونيو", income: 280000, expenses: 130000 },
  ]

  // Show skeleton while loading
  if (isLoading) {
    return <FinanceSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المالية</h1>
          <p className="text-muted-foreground">إدارة المعاملات المالية والتقارير</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              معاملة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة معاملة جديدة</DialogTitle>
              <DialogDescription>أدخل تفاصيل المعاملة المالية</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionType">نوع المعاملة *</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">إيراد</SelectItem>
                      <SelectItem value="expense">مصروف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionCategory">الفئة *</Label>
                  <Select
                    value={newTransaction.category}
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {newTransaction.type === "income"
                        ? incomeCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))
                        : expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionAmount">المبلغ *</Label>
                <div className="relative">
                  <Input
                    id="transactionAmount"
                    type="number"
                    min="0"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                    placeholder="0"
                    className="text-right pl-12"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <SaudiRiyalIcon size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionDescription">الوصف</Label>
                <Textarea
                  id="transactionDescription"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="أدخل وصف المعاملة"
                  className="text-right"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionDate">التاريخ</Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>التاريخ (هجري)</Label>
                  <Input
                    value={newTransaction.date ? getHijriDate(new Date(newTransaction.date)) : ""}
                    disabled
                    className="text-right bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionProject">المشروع (اختياري)</Label>
                  <Select
                    value={newTransaction.projectId}
                    onValueChange={(value) => {
                      const project = projects.find((p) => p.id === value)
                      setNewTransaction({
                        ...newTransaction,
                        projectId: value,
                        projectName: project?.name || "",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون مشروع</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionClient">العميل (اختياري)</Label>
                  <Select
                    value={newTransaction.clientId}
                    onValueChange={(value) => {
                      const client = clients.find((c) => c.id === value)
                      setNewTransaction({
                        ...newTransaction,
                        clientId: value,
                        clientName: client?.name || "",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون عميل</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateTransaction}>إضافة المعاملة</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">إيرادات هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">مصروفات هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">الربح الصافي</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل الإيرادات والمصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value as number), "المبلغ"]} />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="الإيرادات" />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="المصروفات" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المعاملات</SelectItem>
              <SelectItem value="income">الإيرادات</SelectItem>
              <SelectItem value="expense">المصروفات</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {incomeCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              {expenseCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="البحث في المعاملات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-right"
        />
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>المعاملات المالية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                    {transaction.type === "income" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{transaction.category}</div>
                    <div className="text-sm text-muted-foreground">{transaction.description}</div>
                    {transaction.projectName && (
                      <div className="text-xs text-muted-foreground">المشروع: {transaction.projectName}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">{formatDate(new Date(transaction.date))}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTransaction(transaction)
                      setIsViewDialogOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditTransaction({
                        id: transaction.id,
                        type: transaction.type,
                        category: transaction.category,
                        amount: transaction.amount,
                        description: transaction.description,
                        date: new Date(transaction.date).toISOString().split("T")[0],
                        projectId: transaction.projectId || "",
                        projectName: transaction.projectName || "",
                        clientId: transaction.clientId || "",
                        clientName: transaction.clientName || "",
                      })
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteTransaction(transaction.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل المعاملة</DialogTitle>
            <DialogDescription>تعديل تفاصيل المعاملة المالية</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTransactionType">نوع المعاملة *</Label>
                <Select
                  value={editTransaction.type}
                  onValueChange={(value) => setEditTransaction({ ...editTransaction, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">إيراد</SelectItem>
                    <SelectItem value="expense">مصروف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTransactionCategory">الفئة *</Label>
                <Select
                  value={editTransaction.category}
                  onValueChange={(value) => setEditTransaction({ ...editTransaction, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {editTransaction.type === "income"
                      ? incomeCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      : expenseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTransactionAmount">المبلغ *</Label>
              <div className="relative">
                <Input
                  id="editTransactionAmount"
                  type="number"
                  min="0"
                  value={editTransaction.amount}
                  onChange={(e) => setEditTransaction({ ...editTransaction, amount: Number(e.target.value) })}
                  placeholder="0"
                  className="text-right pl-12"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <SaudiRiyalIcon size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTransactionDescription">الوصف</Label>
              <Textarea
                id="editTransactionDescription"
                value={editTransaction.description}
                onChange={(e) => setEditTransaction({ ...editTransaction, description: e.target.value })}
                placeholder="أدخل وصف المعاملة"
                className="text-right"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTransactionDate">التاريخ</Label>
                <Input
                  id="editTransactionDate"
                  type="date"
                  value={editTransaction.date}
                  onChange={(e) => setEditTransaction({ ...editTransaction, date: e.target.value })}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label>التاريخ (هجري)</Label>
                <Input
                  value={editTransaction.date ? getHijriDate(new Date(editTransaction.date)) : ""}
                  disabled
                  className="text-right bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTransactionProject">المشروع (اختياري)</Label>
                <Select
                  value={editTransaction.projectId}
                  onValueChange={(value) => {
                    const project = projects.find((p) => p.id === value)
                    setEditTransaction({
                      ...editTransaction,
                      projectId: value,
                      projectName: project?.name || "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون مشروع</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTransactionClient">العميل (اختياري)</Label>
                <Select
                  value={editTransaction.clientId}
                  onValueChange={(value) => {
                    const client = clients.find((c) => c.id === value)
                    setEditTransaction({
                      ...editTransaction,
                      clientId: value,
                      clientName: client?.name || "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون عميل</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEditTransaction}>حفظ التغييرات</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المعاملة</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نوع المعاملة</Label>
                  <Badge className={selectedTransaction.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {selectedTransaction.type === "income" ? "إيراد" : "مصروف"}
                  </Badge>
                </div>
                <div>
                  <Label>الفئة</Label>
                  <p className="font-semibold">{selectedTransaction.category}</p>
                </div>
              </div>

              <div>
                <Label>المبلغ</Label>
                <p className={`text-2xl font-bold ${selectedTransaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {selectedTransaction.type === "income" ? "+" : "-"} {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>

              {selectedTransaction.description && (
                <div>
                  <Label>الوصف</Label>
                  <p>{selectedTransaction.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>التاريخ (ميلادي)</Label>
                  <p>{formatDate(new Date(selectedTransaction.date))}</p>
                </div>
                <div>
                  <Label>التاريخ (هجري)</Label>
                  <p>{selectedTransaction.dateHijri}</p>
                </div>
              </div>

              {selectedTransaction.projectName && (
                <div>
                  <Label>المشروع</Label>
                  <p>{selectedTransaction.projectName}</p>
                </div>
              )}

              {selectedTransaction.clientName && (
                <div>
                  <Label>العميل</Label>
                  <p>{selectedTransaction.clientName}</p>
                </div>
              )}

              <div>
                <Label>تاريخ الإنشاء</Label>
                <p>{formatDate(new Date(selectedTransaction.createdAt))}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
