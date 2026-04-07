import express from 'express';
import bcrypt from 'bcrypt';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();

// Get all users (excluding passwords)
router.get('/', (req, res) => {
  const db = getDb();
  const users = db.users.map((u: any) => ({ id: u.id, username: u.username, role: u.role }));
  res.json(users);
});

// Create new user
router.post('/', async (req, res) => {
  const { username, password, role } = req.body;
  const db = getDb();

  if (db.users.find((u: any) => u.username === username)) {
    return res.status(400).json({ error: 'اسم المستخدم موجود مسبقاً' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    role
  };

  db.users.push(newUser);
  saveDb();
  logActivity('create_user', 'admin', `Created user ${username} with role ${role}`);
  res.json({ success: true });
});

// Delete user
router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.users.findIndex((u: any) => u.id === req.params.id);
  
  if (index === -1) return res.status(404).json({ error: 'المستخدم غير موجود' });
  if (db.users[index].role === 'admin') return res.status(403).json({ error: 'لا يمكن حذف مدير النظام' });

  const username = db.users[index].username;
  db.users.splice(index, 1);
  saveDb();
  logActivity('delete_user', 'admin', `Deleted user ${username}`);
  res.json({ success: true });
});

export default router;
