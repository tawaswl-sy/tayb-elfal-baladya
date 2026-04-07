import express from 'express';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.complaints || []);
});

router.post('/', (req, res) => {
  const db = getDb();
  const complaintData = { ...req.body };
  delete complaintData.id;
  const newComplaint = {
    ...complaintData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  if (!db.complaints) db.complaints = [];
  db.complaints.push(newComplaint);
  saveDb();
  logActivity('add_complaint', 'admin', `إضافة شكوى جديدة من: ${newComplaint.citizenName}`);
  res.json(newComplaint);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  if (!db.complaints) db.complaints = [];
  const index = db.complaints.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');

  const updatedComplaint = {
    ...db.complaints[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  db.complaints[index] = updatedComplaint;
  saveDb();
  logActivity('update_complaint', 'admin', `تحديث حالة الشكوى رقم: ${updatedComplaint.id}`);
  res.json(updatedComplaint);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  if (!db.complaints) db.complaints = [];
  const index = db.complaints.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');
  db.complaints.splice(index, 1);
  saveDb();
  logActivity('delete_complaint', 'admin', `حذف شكوى`);
  res.json({ success: true });
});

export default router;
