import express from 'express';
import { getDb, saveDb, logActivity } from '../database';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getDb().meetings || []);
});

router.post('/', (req, res) => {
  const db = getDb();
  const newMeeting = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  if (!db.meetings) db.meetings = [];
  db.meetings.push(newMeeting);
  saveDb();
  
  logActivity('إضافة محضر اجتماع', 'مدير النظام', `تم إضافة محضر: ${newMeeting.title}`);
  res.status(201).json(newMeeting);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const index = db.meetings.findIndex((m: any) => m.id === req.params.id);
  
  if (index !== -1) {
    db.meetings[index] = { ...db.meetings[index], ...req.body };
    saveDb();
    logActivity('تعديل محضر اجتماع', 'مدير النظام', `تم تعديل محضر: ${db.meetings[index].title}`);
    res.json(db.meetings[index]);
  } else {
    res.status(404).send('Meeting not found');
  }
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.meetings.findIndex((m: any) => m.id === req.params.id);
  
  if (index !== -1) {
    const deleted = db.meetings.splice(index, 1);
    saveDb();
    logActivity('حذف محضر اجتماع', 'مدير النظام', `تم حذف محضر: ${deleted[0].title}`);
    res.status(204).send();
  } else {
    res.status(404).send('Meeting not found');
  }
});

export default router;
