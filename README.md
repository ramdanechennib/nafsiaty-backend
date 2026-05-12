# 🏫 نظام إدارة الحالات النفسية المدرسية - Backend API

> واجهة برمجة التطبيقات (API) الخاصة بنظام إدارة الحالات النفسية في المدارس. هذا الجزء يعمل على خادم Node.js مع قاعدة بيانات PostgreSQL.

---

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من تثبيت ما يلي على جهازك:

| البرنامج | الإصدار | رابط التحميل |
|----------|---------|-------------|
| Node.js | v18 أو أحدث | [nodejs.org](https://nodejs.org) |
| PostgreSQL | v14 أو أحدث | [postgresql.org](https://www.postgresql.org/download/) |

---

## 🚀 خطوات التشغيل المحلي

### 1. استنساخ المشروع

```bash
# افتح سطر الأوامر (Terminal) وانتقل للمجلد الرئيسي
cd project_nafsiaty/backend
```

### 2. تثبيت الحزم Dependencies

```bash
npm install
```

### 3. إعداد قاعدة البيانات

#### أ. إنشاء قاعدة البيانات في PostgreSQL

```sql
-- افتح برنامج pgAdmin أو سطر أوامر PostgreSQL ونفّذ:

CREATE DATABASE school_psychology_db;
```

#### ب. تشغيل ملف الـ Schema

```bash
# تأكد أنك في مجلد backend
psql -U postgres -d school_psychology_db -f ../database/schema.sql
```

> **ملاحظة:** إذا واجهت مشكلة، تأكد من صحة اسم المستخدم (افتراضي: `postgres`) وكلمة المرور.

### 4. إعداد ملف البيئة (.env)

أنشئ ملف جديد باسم `.env` في مجلد `backend` وضع فيه:

```env
# بيئة التطوير المحلي
NODE_ENV=development
PORT=5000

# رابط قاعدة البيانات (عدّل حسب إعداداتك)
DATABASE_URL=postgres://postgres:your_password@localhost:5432/school_psychology_db

# مفتاح JWT للأمان (يمكنك كتابة أي نص عشوائي)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# الرابط الأمامي (لـ CORS)
FRONTEND_URL=http://localhost:5173
```

### 5. تشغيل الخادم

```bash
# وضع التطوير (مع إعادة التشغيل التلقائي عند التعديل)
npm run dev

# أو لوضع الإنتاج
npm start
```

سترى رسالة类似于:
```
🚀 Server running on port 5000
📦 Database connected successfully
```

---

## 🔑 بيانات الدخول الافتراضية

بعد تشغيل الخادم، يمكنك تسجيل الدخول باستخدام:

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|------------------|-------------|
| مدير النظام | admin@school.com | admin123 |
| مستشار نفسي | counselor@school.com | counselor123 |
| معلم | teacher@school.com | teacher123 |
| ولي أمر | parent@school.com | parent123 |

> ⚠️ **مهم:** غيّر كلمات المرور هذه فوراً في بيئة الإنتاج!

---

## 📁 هيكل المشروع

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # إعدادات الاتصال بقاعدة البيانات
│   ├── controllers/
│   │   ├── authController.js      # تسجيل الدخول وإنشاء الحسابات
│   │   ├── adminController.js     # إدارة النظام
│   │   ├── studentController.js   # إدارة الطلاب
│   │   ├── caseController.js     # الحالات النفسية
│   │   ├── sessionRequestController.js  # طلبات الجلسات
│   │   ├── reportController.js    # التقارير
│   │   ├── behavioralNoteController.js  # الملاحظات السلوكية
│   │   ├── chatController.js      # الدردشة
│   │   ├── paymentController.js   # المدفوعات
│   │   └── groupController.js     # المجموعات
│   ├── middleware/
│   │   └── auth.js          # التحقق من الهوية والصلاحيات
│   ├── models/
│   │   └── *.js             # نماذج قاعدة البيانات
│   ├── routes/
│   │   └── *.js             # مسارات API
│   ├── services/
│   │   └── emailService.js   # خدمة إرسال البريد
│   ├── utils/
│   │   └── password.js       # أدوات التعامل مع كلمات المرور
│   └── app.js               # إعدادات تطبيق Express
├── server.js                 # نقطة البدء
├── package.json
└── .env                      # متغيرات البيئة (لا تشاركه!)
```

---

## 🌐 مسارات API الرئيسية

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| POST | `/api/auth/login` | تسجيل الدخول |
| POST | `/api/auth/register` | إنشاء حساب جديد |
| GET | `/api/students` | جلب قائمة الطلاب |
| GET | `/api/students/my-students` | طلاب المعلم الحالي |
| POST | `/api/cases` | فتح حالة نفسية جديدة |
| GET | `/api/cases` | جلب جميع الحالات |
| POST | `/api/session-requests` | طلب جلسة إرشادية |
| GET | `/api/reports/my-reports` | تقارير ولي الأمر |
| POST | `/api/payments/process` | معالجة دفعة |

---

## 🔧 استكشاف الأخطاء

### خطأ "Database connection failed"

1. تأكد من تشغيل PostgreSQL
2. تحقق من صحة `DATABASE_URL` في ملف `.env`
3. تأكد من إنشاء قاعدة البيانات `school_psychology_db`

### خطأ "Port already in use"

```bash
# استخدم منفذ مختلف
PORT=3000 npm run dev
```

### خطأ "Module not found"

```bash
# أعد تثبيت الحزم
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.

---

**تم تطوير هذا النظام بواسطة فريق Nafsiaty 🎓