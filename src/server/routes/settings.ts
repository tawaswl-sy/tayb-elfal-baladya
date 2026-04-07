import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getDb, saveDb, logActivity } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../../data/logos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.settings || {
    headerLine1: 'الجمهورية العربية السورية',
    headerLine2: 'محافظة دير الزور - ناحية البصيرة',
    headerLine3: 'مجلس بلدية طيب الفال',
    logoPath: ''
  });
});

router.put('/', upload.single('logo'), (req, res) => {
  const db = getDb();
  const { headerLine1, headerLine2, headerLine3 } = req.body;
  
  if (!db.settings) {
    db.settings = {};
  }

  if (headerLine1 !== undefined) db.settings.headerLine1 = headerLine1;
  if (headerLine2 !== undefined) db.settings.headerLine2 = headerLine2;
  if (headerLine3 !== undefined) db.settings.headerLine3 = headerLine3;

  if (req.file) {
    db.settings.logoPath = `/api/uploads/logos/${req.file.filename}`;
  }

  saveDb();
  logActivity('تحديث الإعدادات', 'مدير النظام', 'تم تحديث إعدادات النظام والترويسة');
  res.json(db.settings);
});

export default router;
