import express from 'express';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.tasks || []);
});

router.post('/', (req, res) => {
  const db = getDb();
  const newTask = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.tasks.push(newTask);
  saveDb();
  logActivity('إضافة مهمة', 'مدير', `تم إضافة مهمة جديدة: ${newTask.title}`);
  res.status(201).json(newTask);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const index = db.tasks.findIndex((t: any) => t.id === req.params.id);
  if (index !== -1) {
    db.tasks[index] = { ...db.tasks[index], ...req.body, updatedAt: new Date().toISOString() };
    saveDb();
    logActivity('تحديث مهمة', 'مدير', `تم تحديث المهمة: ${db.tasks[index].title}`);
    res.json(db.tasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.tasks.findIndex((t: any) => t.id === req.params.id);
  if (index !== -1) {
    const deleted = db.tasks.splice(index, 1)[0];
    saveDb();
    logActivity('حذف مهمة', 'مدير', `تم حذف المهمة: ${deleted.title}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

export default router;
