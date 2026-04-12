import express from 'express';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.decisions || []);
});

router.post('/', (req, res) => {
  const db = getDb();
  const newDecision = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.decisions.push(newDecision);
  saveDb();
  logActivity('إضافة قرار', 'مدير', `تم إضافة قرار جديد رقم: ${newDecision.number}`);
  res.status(201).json(newDecision);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const index = db.decisions.findIndex((d: any) => d.id === req.params.id);
  if (index !== -1) {
    db.decisions[index] = { ...db.decisions[index], ...req.body, updatedAt: new Date().toISOString() };
    saveDb();
    logActivity('تحديث قرار', 'مدير', `تم تحديث القرار رقم: ${db.decisions[index].number}`);
    res.json(db.decisions[index]);
  } else {
    res.status(404).json({ error: 'Decision not found' });
  }
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.decisions.findIndex((d: any) => d.id === req.params.id);
  if (index !== -1) {
    const deleted = db.decisions.splice(index, 1)[0];
    saveDb();
    logActivity('حذف قرار', 'مدير', `تم حذف القرار رقم: ${deleted.number}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Decision not found' });
  }
});

export default router;
