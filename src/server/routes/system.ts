import express from 'express';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
import { logActivity } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../../data');

const router = express.Router();

router.post('/open-folder', async (req, res) => {
  const { target } = req.body;
  let targetPath = dataDir;

  if (target === 'employees') {
    targetPath = path.join(dataDir, 'employee_photos');
  } else if (target === 'machinery') {
    targetPath = path.join(dataDir, 'machinery_photos');
  }

  try {
    // This will open the folder in the host operating system's file explorer
    await open(targetPath);
    logActivity('open_folder', 'admin', `Opened folder: ${target}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error opening folder:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/restart', (req, res) => {
  logActivity('system_restart', 'admin', 'Initiated server restart');
  res.json({ success: true, message: 'Restarting...' });
  
  // Exit with code 1 to trigger a restart if running under nodemon/pm2/docker
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

router.post('/shutdown', (req, res) => {
  logActivity('system_shutdown', 'admin', 'Initiated server shutdown');
  res.json({ success: true, message: 'Shutting down...' });
  
  // Exit with code 0 to gracefully shut down
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

export default router;
