"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"
import { CompanySettings, UserProfile } from "@/lib/schemas"
import { Settings, User, Building2, Shield, Bell, Globe, Clock } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("company")
  
  // Company Settings API
  const companyApi = useApi<CompanySettings>()
  
  // User Profile API (assuming current user ID is "1" for demo)
  const userProfileApi = useApi<UserProfile>()
  
  // Company Settings Form
  const [companySettings, setCompanySettings] = useState({
    companyName: "",
    companyNameEn: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "المملكة العربية السعودية"
    },
    workingHours: {
      startTime: "08:00",
      endTime: "17:00",
      workDays: [0, 1, 2, 3, 4],
      weekendDays: [5, 6]
    },
    systemSettings: {
      defaultLanguage: "ar" as "ar" | "en",
      defaultTimezone: "Asia/Riyadh",
      dateFormat: "DD/MM/YYYY" as "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD",
      timeFormat: "24h" as "12h" | "24h",
      currency: "SAR",
      currencySymbol: "ر.س",
      decimalPlaces: 2
    }
  })

  // User Profile Form
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    phone: "",
    email: "",
    role: "employee" as "admin" | "engineer" | "accountant" | "hr" | "employee",
    salary: 0,
    department: "",
    position: "",
    address: "",
    city: "",
    country: "المملكة العربية السعودية",
    preferences: {
      language: "ar" as "ar" | "en",
      theme: "light" as "light" | "dark" | "auto",
      timezone: "Asia/Riyadh",
      dateFormat: "DD/MM/YYYY" as "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD",
      timeFormat: "24h" as "12h" | "24h",
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  })

  // Load data on component mount
  useEffect(() => {
    loadCompanySettings()
    loadUserProfile()
  }, [])

  const loadCompanySettings = async () => {
    try {
      await companyApi.fetchData('/api/company-settings')
      if (companyApi.data) {
        setCompanySettings({
          companyName: companyApi.data.companyName,
          companyNameEn: companyApi.data.companyNameEn || "",
          description: companyApi.data.description || "",
          website: companyApi.data.website || "",
          email: companyApi.data.email,
          phone: companyApi.data.phone,
          address: {
            street: companyApi.data.address.street,
            city: companyApi.data.address.city,
            state: companyApi.data.address.state || "",
            postalCode: companyApi.data.address.postalCode || "",
            country: companyApi.data.address.country
          },
          workingHours: companyApi.data.workingHours,
          systemSettings: companyApi.data.systemSettings
        })
      }
    } catch (error) {
      console.error('Error loading company settings:', error)
    }
  }

  const loadUserProfile = async () => {
    try {
      await userProfileApi.fetchData('/api/user-profiles/1') // Assuming user ID is 1
      if (userProfileApi.data) {
        setUserProfile({
          firstName: userProfileApi.data.firstName,
          lastName: userProfileApi.data.lastName,
          displayName: userProfileApi.data.displayName || "",
          phone: userProfileApi.data.phone || "",
          email: userProfileApi.data.email,
          role: userProfileApi.data.role,
          salary: userProfileApi.data.salary || 0,
          department: userProfileApi.data.department || "",
          position: userProfileApi.data.position || "",
          address: userProfileApi.data.address || "",
          city: userProfileApi.data.city || "",
          country: userProfileApi.data.country,
          preferences: userProfileApi.data.preferences
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const handleCompanySettingsSave = async () => {
    try {
      if (companyApi.data?._id) {
        await companyApi.putData('/api/company-settings', companySettings)
      } else {
        await companyApi.postData('/api/company-settings', {
          ...companySettings,
          createdBy: "1" // Assuming current user ID
        })
      }
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات الشركة بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ إعدادات الشركة",
        variant: "destructive",
      })
    }
  }

  const handleUserProfileSave = async () => {
    try {
      if (userProfileApi.data?._id) {
        await userProfileApi.putData('/api/user-profiles/1', userProfile)
      } else {
        await userProfileApi.postData('/api/user-profiles', {
          ...userProfile,
          userId: "1" // Assuming current user ID
        })
      }
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث الملف الشخصي بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ الملف الشخصي",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
          <p className="text-muted-foreground">
            إدارة إعدادات النظام والملف الشخصي
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            إعدادات الشركة
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إعدادات النظام
          </TabsTrigger>
        </TabsList>

        {/* Company Settings Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                معلومات الشركة الأساسية
              </CardTitle>
              <CardDescription>
                تحديث معلومات الشركة والبيانات الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input
                    id="companyName"
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      companyName: e.target.value
                    }))}
                    placeholder="اسم الشركة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyNameEn">Company Name (English)</Label>
                  <Input
                    id="companyNameEn"
                    value={companySettings.companyNameEn}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      companyNameEn: e.target.value
                    }))}
                    placeholder="Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="info@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    placeholder="+966 50 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      website: e.target.value
                    }))}
                    placeholder="https://www.company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    value={companySettings.address.city}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="الرياض"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">وصف الشركة</Label>
                <Textarea
                  id="description"
                  value={companySettings.description}
                  onChange={(e) => setCompanySettings(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="وصف مختصر عن الشركة ونشاطها"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">العنوان التفصيلي</Label>
                <Input
                  id="street"
                  value={companySettings.address.street}
                  onChange={(e) => setCompanySettings(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  placeholder="شارع الملك فهد، حي النزهة"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                ساعات العمل
              </CardTitle>
              <CardDescription>
                تحديد ساعات العمل وأيام العمل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">وقت بداية العمل</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={companySettings.workingHours.startTime}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, startTime: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">وقت نهاية العمل</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={companySettings.workingHours.endTime}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, endTime: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleCompanySettingsSave}
              disabled={companyApi.loading}
            >
              {companyApi.loading ? "جاري الحفظ..." : "حفظ إعدادات الشركة"}
            </Button>
          </div>
        </TabsContent>

        {/* User Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                المعلومات الشخصية
              </CardTitle>
              <CardDescription>
                تحديث المعلومات الشخصية والبيانات الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input
                    id="firstName"
                    value={userProfile.firstName}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      firstName: e.target.value
                    }))}
                    placeholder="الاسم الأول"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">اسم العائلة</Label>
                  <Input
                    id="lastName"
                    value={userProfile.lastName}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      lastName: e.target.value
                    }))}
                    placeholder="اسم العائلة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">الاسم المعروض</Label>
                  <Input
                    id="displayName"
                    value={userProfile.displayName}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      displayName: e.target.value
                    }))}
                    placeholder="الاسم المعروض"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">البريد الإلكتروني</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="user@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userPhone">رقم الهاتف</Label>
                  <Input
                    id="userPhone"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    placeholder="+966 50 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">الدور الوظيفي</Label>
                  <Select
                    value={userProfile.role}
                    onValueChange={(value: "admin" | "engineer" | "accountant" | "hr" | "employee") => 
                      setUserProfile(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="engineer">مهندس</SelectItem>
                      <SelectItem value="accountant">محاسب</SelectItem>
                      <SelectItem value="hr">موارد بشرية</SelectItem>
                      <SelectItem value="employee">موظف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">القسم</Label>
                  <Input
                    id="department"
                    value={userProfile.department}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      department: e.target.value
                    }))}
                    placeholder="قسم تقنية المعلومات"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">المنصب</Label>
                  <Input
                    id="position"
                    value={userProfile.position}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      position: e.target.value
                    }))}
                    placeholder="مطور برمجيات"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">الراتب</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={userProfile.salary}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      salary: Number(e.target.value)
                    }))}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userCity">المدينة</Label>
                  <Input
                    id="userCity"
                    value={userProfile.city}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      city: e.target.value
                    }))}
                    placeholder="الرياض"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userAddress">العنوان</Label>
                <Input
                  id="userAddress"
                  value={userProfile.address}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    address: e.target.value
                  }))}
                  placeholder="العنوان التفصيلي"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                التفضيلات الشخصية
              </CardTitle>
              <CardDescription>
                إعدادات اللغة والثيم والإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">اللغة</Label>
                  <Select
                    value={userProfile.preferences.language}
                    onValueChange={(value: "ar" | "en") => 
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, language: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللغة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">المظهر</Label>
                  <Select
                    value={userProfile.preferences.theme}
                    onValueChange={(value: "light" | "dark" | "auto") => 
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, theme: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المظهر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">فاتح</SelectItem>
                      <SelectItem value="dark">داكن</SelectItem>
                      <SelectItem value="auto">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">
                      استلام إشعارات عبر البريد الإلكتروني
                    </p>
                  </div>
                  <Switch
                    checked={userProfile.preferences.notifications.email}
                    onCheckedChange={(checked) => 
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, email: checked }
                        }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات التطبيق</Label>
                    <p className="text-sm text-muted-foreground">
                      استلام إشعارات داخل التطبيق
                    </p>
                  </div>
                  <Switch
                    checked={userProfile.preferences.notifications.push}
                    onCheckedChange={(checked) => 
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, push: checked }
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleUserProfileSave}
              disabled={userProfileApi.loading}
            >
              {userProfileApi.loading ? "جاري الحفظ..." : "حفظ الملف الشخصي"}
            </Button>
          </div>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                إعدادات النظام
              </CardTitle>
              <CardDescription>
                إعدادات النظام العامة واللغة والعملة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemLanguage">اللغة الافتراضية</Label>
                  <Select
                    value={companySettings.systemSettings.defaultLanguage}
                    onValueChange={(value: "ar" | "en") => 
                      setCompanySettings(prev => ({
                        ...prev,
                        systemSettings: { ...prev.systemSettings, defaultLanguage: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللغة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <Select
                    value={companySettings.systemSettings.currency}
                    onValueChange={(value) => 
                      setCompanySettings(prev => ({
                        ...prev,
                        systemSettings: { ...prev.systemSettings, currency: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                  <Select
                    value={companySettings.systemSettings.dateFormat}
                    onValueChange={(value: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD") => 
                      setCompanySettings(prev => ({
                        ...prev,
                        systemSettings: { ...prev.systemSettings, dateFormat: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التنسيق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">تنسيق الوقت</Label>
                  <Select
                    value={companySettings.systemSettings.timeFormat}
                    onValueChange={(value: "12h" | "24h") => 
                      setCompanySettings(prev => ({
                        ...prev,
                        systemSettings: { ...prev.systemSettings, timeFormat: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التنسيق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 ساعة</SelectItem>
                      <SelectItem value="24h">24 ساعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleCompanySettingsSave}
              disabled={companyApi.loading}
            >
              {companyApi.loading ? "جاري الحفظ..." : "حفظ إعدادات النظام"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {(companyApi.error || userProfileApi.error) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">
              {companyApi.error && <p>خطأ في إعدادات الشركة: {companyApi.error}</p>}
              {userProfileApi.error && <p>خطأ في الملف الشخصي: {userProfileApi.error}</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
