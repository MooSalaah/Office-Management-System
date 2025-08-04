# نظام إدارة المكتب الهندسي

نظام شامل لإدارة المكاتب الهندسية في المملكة العربية السعودية، مبني باستخدام Next.js 15 و TypeScript.

## 🚀 المميزات

- **واجهة مستخدم حديثة** مع دعم كامل للغة العربية
- **إدارة المشاريع** مع تتبع المهام والتقدم
- **إدارة العملاء** مع معلومات تفصيلية
- **نظام الحضور والانصراف** للموظفين
- **إدارة المالية** مع تتبع المعاملات
- **إشعارات فورية** باستخدام Socket.io
- **دعم متعدد المنصات** (Netlify, Vercel, Render)

## 🛠️ التقنيات المستخدمة

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Validation**: Zod
- **Icons**: Lucide React

## 📦 التثبيت والتشغيل

### المتطلبات الأساسية
- Node.js 18 أو أحدث
- npm أو yarn
- MongoDB (محلي أو Atlas)

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd Office-Management-System--
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد المتغيرات البيئية
```bash
cp env.example .env.local
```

ثم قم بتعديل `.env.local` بالمعلومات المطلوبة:
```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DB=office_management

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
PORT=3000
```

### 4. تشغيل التطبيق
```bash
# للتطوير
npm run dev

# للإنتاج
npm run build
npm start
```

## 🌐 النشر

### Netlify
```bash
npm run build:netlify
```

### Vercel
```bash
npm run build:vercel
```

### Render
```bash
npm run build:render
```

## 📁 هيكل المشروع

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── attendance/    # نظام الحضور
│   │   ├── clients/       # إدارة العملاء
│   │   ├── finance/       # إدارة المالية
│   │   ├── projects/      # إدارة المشاريع
│   │   ├── socket/        # Socket.io API
│   │   ├── tasks/         # إدارة المهام
│   │   └── users/         # إدارة المستخدمين
│   ├── attendance/        # صفحة الحضور
│   ├── clients/           # صفحة العملاء
│   ├── dashboard/         # لوحة التحكم
│   ├── finance/           # صفحة المالية
│   ├── projects/          # صفحة المشاريع
│   ├── settings/          # الإعدادات
│   └── tasks/             # صفحة المهام
├── components/            # المكونات
│   ├── ui/               # مكونات UI الأساسية
│   ├── layout/           # مكونات التخطيط
│   └── ...               # مكونات أخرى
├── lib/                  # المكتبات والمساعدات
│   ├── models/           # نماذج قاعدة البيانات
│   ├── schemas/          # مخططات التحقق
│   ├── config.ts         # إعدادات التطبيق
│   ├── database.ts       # إعداد قاعدة البيانات
│   └── utils.ts          # الدوال المساعدة
├── hooks/                # React Hooks
├── styles/               # ملفات CSS
└── public/               # الملفات العامة
```

## 🔧 الإعدادات المتقدمة

### إعداد Socket.io
التطبيق يدعم Socket.io للاتصال المباشر. تأكد من:
1. إعداد `NEXT_PUBLIC_API_URL` بشكل صحيح
2. تكوين CORS origins في الإنتاج
3. استخدام polling transport للتوافق مع Render

### إعداد قاعدة البيانات
```typescript
// lib/database.ts
export async function connectDB(): Promise<void> {
  try {
    const client = await clientPromise
    await client.db(DB_CONFIG.name).admin().ping()
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
}
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في الاتصال بقاعدة البيانات**
   - تأكد من صحة `MONGODB_URI`
   - تحقق من إعدادات الشبكة

2. **مشاكل Socket.io**
   - تأكد من إعداد CORS origins
   - استخدم polling transport للتوافق

3. **مشاكل البناء**
   - تأكد من تثبيت جميع التبعيات
   - تحقق من إعدادات TypeScript

## 📝 المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 🤝 الدعم

للدعم والمساعدة:
- افتح issue جديد
- تواصل مع الفريق المطور

---

**ملاحظة**: تأكد من تحديث المتغيرات البيئية قبل النشر على أي منصة. 