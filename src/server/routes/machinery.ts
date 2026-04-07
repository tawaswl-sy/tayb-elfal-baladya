import express from 'express';
import multer from 'multer';
import path from 'path';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'data', 'machinery_photos'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.machinery);
});

router.post('/', upload.single('photo'), (req, res) => {
  const db = getDb();
  const machineryData = { ...req.body };
  delete machineryData.id;
  
  const newMachinery = {
    ...machineryData,
    id: Date.now().toString(),
    photoPath: req.file ? `/api/uploads/machinery_photos/${req.file.filename}` : null,
    maintenanceLog: []
  };
  db.machinery.push(newMachinery);
  saveDb();
  logActivity('add_machinery', 'admin', `Added machinery ${newMachinery.name}`);
  res.json(newMachinery);
});

router.put('/:id', upload.single('photo'), (req, res) => {
  const db = getDb();
  const index = db.machinery.findIndex((m: any) => m.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');

  const updatedMachinery = {
    ...db.machinery[index],
    ...req.body,
    photoPath: req.file ? `/api/uploads/machinery_photos/${req.file.filename}` : db.machinery[index].photoPath
  };
  db.machinery[index] = updatedMachinery;
  saveDb();
  logActivity('update_machinery', 'admin', `Updated machinery ${updatedMachinery.name}`);
  res.json(updatedMachinery);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.machinery.findIndex((m: any) => m.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');
  const name = db.machinery[index].name;
  db.machinery.splice(index, 1);
  saveDb();
  logActivity('delete_machinery', 'admin', `Deleted machinery ${name}`);
  res.json({ success: true });
});

router.post('/:id/maintenance', (req, res) => {
  const db = getDb();
  const index = db.machinery.findIndex((m: any) => m.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');

  const logEntry = {
    id: Date.now().toString(),
    ...req.body,
    date: new Date().toISOString()
  };
  
  if (!db.machinery[index].maintenanceLog) {
    db.machinery[index].maintenanceLog = [];
  }
  db.machinery[index].maintenanceLog.push(logEntry);
  saveDb();
  logActivity('add_maintenance', 'admin', `Added maintenance log for ${db.machinery[index].name}`);
  res.json(db.machinery[index]);
});

export default router;
