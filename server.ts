import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initDb, getDb, saveDb } from './src/server/database.js';
import authRoutes from './src/server/routes/auth.js';
import employeeRoutes from './src/server/routes/employees.js';
import machineryRoutes from './src/server/routes/machinery.js';
import documentRoutes from './src/server/routes/documents.js';
import backupRoutes, { setupScheduledBackups } from './src/server/routes/backup.js';
import activityRoutes from './src/server/routes/activity.js';
import projectsRoutes from './src/server/routes/projects.js';
import complaintsRoutes from './src/server/routes/complaints.js';
import licensesRoutes from './src/server/routes/licenses.js';
import uploadRoutes from './src/server/routes/upload.js';
import settingsRoutes from './src/server/routes/settings.js';
import usersRoutes from './src/server/routes/users.js';
import systemRoutes from './src/server/routes/system.js';
import databankRoutes from './src/server/routes/databank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Ensure data directories exist
const dataDir = path.join(__dirname, 'data');
const dirs = [
  dataDir,
  path.join(dataDir, 'مستندات_البلدية'),
  path.join(dataDir, 'employee_photos'),
  path.join(dataDir, 'machinery_photos'),
  path.join(dataDir, 'logos'),
  path.join(dataDir, 'backups')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize DB
initDb(dataDir);

// Initialize cron job on startup
setupScheduledBackups();

app.use(cors());
app.use(express.json());

// Serve static files for uploads
app.use('/api/uploads', express.static(dataDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/machinery', machineryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/licenses', licensesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/databank', databankRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/dashboard', (req, res) => {
  const db = getDb();
  
  // Calculate employees by department
  const employeesByDept = db.employees.reduce((acc: any, emp: any) => {
    const dept = emp.department || 'غير محدد';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Calculate machinery by status
  const machineryByStatus = db.machinery.reduce((acc: any, m: any) => {
    const status = m.status || 'غير محدد';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Calculate projects by status
  const projectsByStatus = (db.projects || []).reduce((acc: any, p: any) => {
    const status = p.status || 'غير محدد';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Calculate complaints by status
  const complaintsByStatus = (db.complaints || []).reduce((acc: any, c: any) => {
    const status = c.status || 'غير محدد';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Calculate Databank stats
  const totalPopulation = db.population_settings?.total_population || 0;
  const neighborhoodsCount = (db.neighborhoods || []).length;
  const schoolsCount = (db.schools || []).length;
  let studentsCount = 0;
  (db.schools || []).forEach((s: any) => {
    studentsCount += Number(s.students?.primary || 0) + Number(s.students?.middle || 0) + Number(s.students?.secondary || 0);
  });
  const facilitiesCount = (db.facilities || []).length;
  const propertiesCount = (db.properties || []).length;

  res.json({
    employeesCount: db.employees.length,
    activeEmployeesCount: db.employees.filter((e: any) => e.serviceStatus === 'في الخدمة').length,
    machineryCount: db.machinery.length,
    documentsCount: db.documents.length,
    projectsCount: db.projects ? db.projects.length : 0,
    complaintsCount: db.complaints ? db.complaints.length : 0,
    licensesCount: db.licenses ? db.licenses.length : 0,
    departmentsCount: Object.keys(employeesByDept).length,
    employeesByDept: Object.entries(employeesByDept).map(([name, value]) => ({ name, value })),
    machineryByStatus: Object.entries(machineryByStatus).map(([name, value]) => ({ name, value })),
    projectsByStatus: Object.entries(projectsByStatus).map(([name, value]) => ({ name, value })),
    complaintsByStatus: Object.entries(complaintsByStatus).map(([name, value]) => ({ name, value })),
    recentActivities: db.activityLog.slice(-10).reverse(), // Get last 10 activities
    databank: {
      totalPopulation,
      neighborhoodsCount,
      schoolsCount,
      studentsCount,
      facilitiesCount,
      propertiesCount
    }
  });
});

async function startServer() {
  // Return 404 for unhandled API/upload routes instead of SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    app.all('/api/*', (req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
