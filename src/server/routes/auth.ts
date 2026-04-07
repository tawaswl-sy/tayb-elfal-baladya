import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb, saveDb, logActivity } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const SECRET = 'municipality-secret-key-2026';

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

router.get('/setup', (req, res) => {
  const db = getDb();
  if (db.users.length > 0) {
    return res.status(400).json({ error: 'Setup already completed' });
  }
  res.json({ success: true });
});

router.post('/setup', upload.single('logo'), async (req, res) => {
  const db = getDb();
  if (db.users.length > 0) {
    return res.status(400).json({ error: 'Setup already completed' });
  }

  const { username, password, headerLine1, headerLine2, headerLine3, additionalUsers } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.users.push({
    id: '1',
    username,
    password: hashedPassword,
    role: 'admin'
  });

  // Handle additional users
  if (additionalUsers) {
    try {
      const parsedUsers = JSON.parse(additionalUsers);
      for (const user of parsedUsers) {
        const hashedUserPassword = await bcrypt.hash(user.password, 10);
        db.users.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          username: user.username,
          password: hashedUserPassword,
          role: user.role
        });
      }
    } catch (e) {
      console.error('Failed to parse additional users', e);
    }
  }

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
  logActivity('setup', username, 'Initial setup completed');
  res.json({ success: true });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const user = db.users.find((u: any) => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '8h' });
  logActivity('login', username, 'User logged in');
  res.json({ token, user: { username: user.username, role: user.role } });
});

export default router;
