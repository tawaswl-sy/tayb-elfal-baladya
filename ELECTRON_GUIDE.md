# دليل تحويل التطبيق إلى تطبيق سطح مكتب (Electron)

لتحويل تطبيق "بنك المعلومات" من تطبيق ويب إلى تطبيق سطح مكتب يعمل بنظام Windows أو Mac أو Linux، يمكنك استخدام إطار عمل **Electron**.

## الخطوات الأساسية:

### 1. تثبيت الحزم اللازمة
افتح الطرفية (Terminal) في مجلد المشروع وقم بتثبيت Electron وأدوات البناء:

```bash
npm install --save-dev electron electron-builder
```

### 2. إنشاء ملف التشغيل الرئيسي (`electron/main.cjs`)
قم بإنشاء مجلد باسم `electron` وفي داخله ملف باسم `main.cjs` (استخدمنا امتداد .cjs لأن المشروع يستخدم ES Modules):

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

// استيراد خادم Express الخاص بك
// ملاحظة: في بيئة الإنتاج، قد ترغب في تشغيل الخادم كعملية فرعية
function startBackend() {
  if (!isDev) {
    require('../server.ts'); // تأكد من أن الخادم مهيأ للعمل في بيئة الإنتاج
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/logo.png') // أيقونة التطبيق
  });

  // في حالة التطوير، قم بتحميل رابط Vite
  // في حالة الإنتاج، قم بتحميل ملف index.html من مجلد dist
  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

### 3. تحديث ملف `package.json`
أضف الإعدادات التالية لربط Electron بالمشروع:

```json
{
  "main": "electron/main.cjs",
  "scripts": {
    "electron:dev": "electron .",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.municipality.databank",
    "productName": "بنك معلومات البلدية",
    "files": [
      "dist/**/*",
      "electron/**/*",
      "server.ts",
      "package.json"
    ],
    "directories": {
      "output": "release"
    },
    "win": {
      "target": "nsis"
    }
  }
}
```

### 4. تشغيل التطبيق
*   **للتطوير:** قم بتشغيل `npm run dev` أولاً، ثم في نافذة أخرى قم بتشغيل `npm run electron:dev`.
*   **للبناء (إنشاء ملف exe):** قم بتشغيل `npm run electron:build`. سيتم إنشاء ملف التثبيت في مجلد `release`.

## ملاحظات هامة للتحويل:
1.  **المسارات (Paths):** تأكد من أن خادم Express يستخدم مسارات نسبية (Relative Paths) للوصول إلى قاعدة البيانات أو الملفات المرفوعة، لأن المسارات المطلقة تختلف عند تثبيت التطبيق.
2.  **قاعدة البيانات:** بما أنك تستخدم ملفات JSON أو SQLite محلية، سيعمل التطبيق بشكل ممتاز كـ Offline App.
3.  **التحديثات:** يمكنك إضافة ميزة التحديث التلقائي (Auto-updater) لاحقاً.

هذا التحويل سيمنح الموظفين أيقونة على سطح المكتب، وسرعة في الوصول، وإمكانية العمل دون الحاجة لفتح المتصفح يدوياً.
