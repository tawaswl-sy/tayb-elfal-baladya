import express from 'express';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import cron, { ScheduledTask } from 'node-cron';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();
const dataDir = path.join(process.cwd(), 'data');
const backupsDir = path.join(dataDir, 'backups');

const upload = multer({ dest: path.join(process.cwd(), 'data', 'temp') });

// Helper function to create a backup file on disk
export const createBackupFile = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}.zip`;
    const backupPath = path.join(backupsDir, backupName);
    
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      logActivity('create_backup', 'system', `Created scheduled backup ${backupName}`);
      resolve(backupName);
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Add directories to archive
    const dirsToBackup = ['مستندات_البلدية', 'employee_photos', 'machinery_photos', 'logos'];
    dirsToBackup.forEach(dir => {
      const dirPath = path.join(dataDir, dir);
      if (fs.existsSync(dirPath)) {
        archive.directory(dirPath, dir);
      }
    });
    
    const dbPath = path.join(dataDir, 'municipality.db.json');
    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: 'municipality.db.json' });
    }
    
    archive.finalize();
  });
};

// Setup Scheduled Backups
let currentCronJob: ScheduledTask | null = null;

export const setupScheduledBackups = () => {
  const db = getDb();
  const backupSettings = db.settings?.backup || { enabled: false, schedule: 'daily', time: '00:00' };
  
  if (currentCronJob) {
    currentCronJob.stop();
    currentCronJob = null;
  }

  if (backupSettings.enabled) {
    const [hours, minutes] = (backupSettings.time || '00:00').split(':');
    let cronExpression = `${minutes} ${hours} * * *`; // daily
    
    if (backupSettings.schedule === 'weekly') {
      cronExpression = `${minutes} ${hours} * * 0`; // Sunday
    } else if (backupSettings.schedule === 'monthly') {
      cronExpression = `${minutes} ${hours} 1 * *`; // 1st of month
    }

    currentCronJob = cron.schedule(cronExpression, async () => {
      try {
        console.log('Running scheduled backup...');
        await createBackupFile();
        console.log('Scheduled backup completed successfully.');
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    });
    console.log(`Scheduled backup enabled: ${backupSettings.schedule} at ${backupSettings.time}`);
  } else {
    console.log('Scheduled backup is disabled.');
  }
};

router.post('/settings', (req, res) => {
  try {
    const db = getDb();
    if (!db.settings) db.settings = {};
    db.settings.backup = req.body;
    saveDb();
    setupScheduledBackups();
    logActivity('update_backup_settings', 'admin', 'Updated scheduled backup settings');
    res.json({ success: true, settings: db.settings.backup });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/settings', (req, res) => {
  const db = getDb();
  res.json(db.settings?.backup || { enabled: false, schedule: 'daily', time: '00:00' });
});

router.get('/create', (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup-${timestamp}.zip`;
  const backupPath = path.join(backupsDir, backupName);
  
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const output = fs.createWriteStream(backupPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    logActivity('create_backup', 'admin', `Created manual backup ${backupName}`);
    res.download(backupPath);
  });
  
  archive.on('error', (err) => {
    res.status(500).send({ error: err.message });
  });
  
  archive.pipe(output);
  
  // Add directories to archive
  const dirsToBackup = ['مستندات_البلدية', 'employee_photos', 'machinery_photos', 'logos'];
  dirsToBackup.forEach(dir => {
    const dirPath = path.join(dataDir, dir);
    if (fs.existsSync(dirPath)) {
      archive.directory(dirPath, dir);
    }
  });
  
  const dbPath = path.join(dataDir, 'municipality.db.json');
  if (fs.existsSync(dbPath)) {
    archive.file(dbPath, { name: 'municipality.db.json' });
  }
  
  archive.finalize();
});

router.post('/manual', async (req, res) => {
  try {
    const backupName = await createBackupFile();
    logActivity('create_backup', 'admin', `Created manual backup ${backupName} to server`);
    res.json({ success: true, backupName });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', (req, res) => {
  try {
    if (!fs.existsSync(backupsDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.endsWith('.zip'))
      .map(f => {
        const stats = fs.statSync(path.join(backupsDir, f));
        return {
          name: f,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const backupPath = path.join(backupsDir, filename);
  if (fs.existsSync(backupPath)) {
    res.download(backupPath);
  } else {
    res.status(404).send('Backup not found');
  }
});

router.delete('/:filename', (req, res) => {
  const filename = req.params.filename;
  const backupPath = path.join(backupsDir, filename);
  if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath);
    logActivity('delete_backup', 'admin', `Deleted backup ${filename}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Backup not found' });
  }
});

router.post('/restore', upload.single('backup'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  
  try {
    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(dataDir, true);
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    // Reload DB
    const dbPath = path.join(dataDir, 'municipality.db.json');
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      const newDb = JSON.parse(data);
      const currentDb = getDb();
      // Keep current users to avoid lockout
      newDb.users = currentDb.users;
      Object.assign(currentDb, newDb);
      saveDb();
    }
    
    logActivity('restore_backup', 'admin', 'Restored system from backup');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
