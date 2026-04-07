import express from 'express';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.projects || []);
});

router.post('/', (req, res) => {
  const db = getDb();
  const projectData = { ...req.body };
  delete projectData.id;
  const newProject = {
    ...projectData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  if (!db.projects) db.projects = [];
  db.projects.push(newProject);
  saveDb();
  logActivity('add_project', 'admin', `إضافة مشروع جديد: ${newProject.name}`);
  res.json(newProject);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  if (!db.projects) db.projects = [];
  const index = db.projects.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');

  const updatedProject = {
    ...db.projects[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  db.projects[index] = updatedProject;
  saveDb();
  logActivity('update_project', 'admin', `تعديل مشروع: ${updatedProject.name}`);
  res.json(updatedProject);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  if (!db.projects) db.projects = [];
  const index = db.projects.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');
  const name = db.projects[index].name;
  db.projects.splice(index, 1);
  saveDb();
  logActivity('delete_project', 'admin', `حذف مشروع: ${name}`);
  res.json({ success: true });
});

export default router;
