import express from 'express';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.budget || []);
});

router.post('/', (req, res) => {
  const db = getDb();
  const newItem = {
    id: Date.now().toString(),
    ...req.body,
    spent: Number(req.body.spent || 0),
    allocated: Number(req.body.allocated || 0),
    createdAt: new Date().toISOString()
  };
  db.budget.push(newItem);
  saveDb();
  logActivity('إضافة بند ميزانية', 'مدير', `تم إضافة بند ميزانية جديد: ${newItem.title}`);
  res.status(201).json(newItem);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const index = db.budget.findIndex((b: any) => b.id === req.params.id);
  if (index !== -1) {
    db.budget[index] = { 
      ...db.budget[index], 
      ...req.body, 
      spent: Number(req.body.spent ?? db.budget[index].spent),
      allocated: Number(req.body.allocated ?? db.budget[index].allocated),
      updatedAt: new Date().toISOString() 
    };
    saveDb();
    logActivity('تحديث ميزانية', 'مدير', `تم تحديث بند الميزانية: ${db.budget[index].title}`);
    res.json(db.budget[index]);
  } else {
    res.status(404).json({ error: 'Budget item not found' });
  }
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.budget.findIndex((b: any) => b.id === req.params.id);
  if (index !== -1) {
    const deleted = db.budget.splice(index, 1)[0];
    saveDb();
    logActivity('حذف بند ميزانية', 'مدير', `تم حذف بند الميزانية: ${deleted.title}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Budget item not found' });
  }
});

export default router;
