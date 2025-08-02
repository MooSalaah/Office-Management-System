# إعداد نظام إدارة المكتب الهندسي

## المتطلبات الأساسية

- Node.js 18+ 
- MongoDB 5.0+
- npm أو yarn

## التثبيت والإعداد

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد قاعدة البيانات

1. تأكد من تشغيل MongoDB على جهازك
2. أنشئ ملف `.env.local` في مجلد المشروع وأضف المتغيرات التالية:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/office_management
MONGODB_DB=office_management

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here-change-in-production
```

### 3. تشغيل المشروع

```bash
npm run dev
```

المشروع سيعمل على `http://localhost:3000`

## بنية المشروع

### السكيمات (Schemas)
- `lib/schemas/user.ts` - سكيما المستخدمين
- `lib/schemas/client.ts` - سكيما العملاء  
- `lib/schemas/project.ts` - سكيما المشاريع
- `lib/schemas/task.ts` - سكيما المهام
- `lib/schemas/finance.ts` - سكيما المالية
- `lib/schemas/attendance.ts` - سكيما الحضور

### النماذج (Models)
- `lib/models/user.ts` - نموذج المستخدمين
- `lib/models/client.ts` - نموذج العملاء
- `lib/models/project.ts` - نموذج المشاريع

### قاعدة البيانات
- `lib/database.ts` - اتصال MongoDB

## الميزات المضافة

### 1. Container Component
- تم إضافة مكون Container لتغليف جميع الصفحات
- يوفر تخطيط موحد ومتجاوب

### 2. MongoDB Integration
- سكيمات Zod للتحقق من صحة البيانات
- نماذج للتعامل مع قاعدة البيانات
- فهارس محسنة للأداء

### 3. Authentication Ready
- نظام مصادقة جاهز مع JWT
- تشفير كلمات المرور بـ bcrypt
- إدارة الأدوار والصلاحيات

## الخطوات التالية

1. إضافة باقي النماذج (Tasks, Finance, Attendance)
2. إنشاء API Routes
3. ربط الواجهة الأمامية مع قاعدة البيانات
4. إضافة نظام المصادقة
5. إضافة التحقق من الصلاحيات 