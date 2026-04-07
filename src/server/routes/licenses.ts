import express from 'express';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.licenses || []);
});

router.post('/', (req, res) => {
  const db = getDb();
  const licenseData = { ...req.body };
  delete licenseData.id;
  const newLicense = {
    ...licenseData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  if (!db.licenses) db.licenses = [];
  db.licenses.push(newLicense);
  saveDb();
  logActivity('add_license', 'admin', `إصدار رخصة جديدة باسم: ${newLicense.citizenName}`);
  res.json(newLicense);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  if (!db.licenses) db.licenses = [];
  const index = db.licenses.findIndex((l: any) => l.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');

  const updatedLicense = {
    ...db.licenses[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  db.licenses[index] = updatedLicense;
  saveDb();
  logActivity('update_license', 'admin', `تحديث رخصة رقم: ${updatedLicense.id}`);
  res.json(updatedLicense);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  if (!db.licenses) db.licenses = [];
  const index = db.licenses.findIndex((l: any) => l.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');
  db.licenses.splice(index, 1);
  saveDb();
  logActivity('delete_license', 'admin', `حذف رخصة`);
  res.json({ success: true });
});

export default router;
