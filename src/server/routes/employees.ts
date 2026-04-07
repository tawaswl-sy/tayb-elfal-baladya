import express from 'express';
import multer from 'multer';
import path from 'path';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'data', 'employee_photos'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.employees);
});

router.post('/', upload.single('photo'), (req, res) => {
  const db = getDb();
  const employeeData = { ...req.body };
  delete employeeData.id; // Ensure we don't overwrite the generated ID
  
  const newEmployee = {
    ...employeeData,
    id: Date.now().toString(),
    photoPath: req.file ? `/api/uploads/employee_photos/${req.file.filename}` : null
  };
  db.employees.push(newEmployee);
  saveDb();
  logActivity('add_employee', 'admin', `Added employee ${newEmployee.name}`);
  res.json(newEmployee);
});

router.put('/:id', upload.single('photo'), (req, res) => {
  const db = getDb();
  const index = db.employees.findIndex((e: any) => e.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');

  const updatedEmployee = {
    ...db.employees[index],
    ...req.body,
    photoPath: req.file ? `/api/uploads/employee_photos/${req.file.filename}` : db.employees[index].photoPath
  };
  db.employees[index] = updatedEmployee;
  saveDb();
  logActivity('update_employee', 'admin', `Updated employee ${updatedEmployee.name}`);
  res.json(updatedEmployee);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.employees.findIndex((e: any) => e.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');
  const name = db.employees[index].name;
  db.employees.splice(index, 1);
  saveDb();
  logActivity('delete_employee', 'admin', `Deleted employee ${name}`);
  res.json({ success: true });
});

export default router;
