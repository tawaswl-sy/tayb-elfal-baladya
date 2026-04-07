import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();
const docsDir = path.join(process.cwd(), 'data', 'مستندات_البلدية');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || '';
    const targetDir = path.join(docsDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Auto numbering logic
    const db = getDb();
    const folder = req.body.folder || '';
    let prefix = '';
    if (folder === 'الصادر') prefix = 'ص';
    if (folder === 'الوارد') prefix = 'و';
    
    let filename = file.originalname;
    if (prefix) {
      const year = new Date().getFullYear();
      const count = db.documents.filter((d: any) => d.folder === folder && d.year === year).length + 1;
      const paddedCount = count.toString().padStart(4, '0');
      filename = `${prefix}-${year}-${paddedCount}_${file.originalname}`;
    }
    
    cb(null, filename);
  }
});
const upload = multer({ storage });

// Ensure default folders exist
const defaultFolders = ['الصادر', 'الوارد', 'التعاميم', 'الأرشيف', 'القرارات', 'المشاريع', 'العقود'];
defaultFolders.forEach(folder => {
  const dir = path.join(docsDir, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.documents);
});

router.get('/next-number', (req, res) => {
  const db = getDb();
  const folder = req.query.folder as string;
  const year = new Date().getFullYear();
  
  if (!folder) {
    return res.json({ nextNumber: 1 });
  }
  
  const docsInFolder = db.documents.filter((d: any) => d.folder === folder && d.year === year);
  
  // Find the highest number
  let maxNumber = 0;
  docsInFolder.forEach((d: any) => {
    const num = parseInt(d.documentNumber, 10);
    if (!isNaN(num) && num > maxNumber) {
      maxNumber = num;
    }
  });
  
  res.json({ nextNumber: maxNumber + 1 });
});

router.post('/upload', upload.array('files'), (req, res) => {
  const db = getDb();
  const folder = req.body.folder || '';
  const year = new Date().getFullYear();
  
  const newDocs = (req.files as Express.Multer.File[]).map(file => {
    const doc = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: req.body.subject || file.filename,
      originalName: file.originalname,
      folder,
      year,
      path: `/api/uploads/مستندات_البلدية/${folder ? folder + '/' : ''}${file.filename}`,
      size: file.size,
      type: file.mimetype,
      uploadDate: new Date().toISOString(),
      // Metadata fields
      documentNumber: req.body.documentNumber || '',
      documentDate: req.body.documentDate || '',
      documenterName: req.body.documenterName || '',
      subject: req.body.subject || '',
      senderReceiver: req.body.senderReceiver || ''
    };
    db.documents.push(doc);
    return doc;
  });
  
  saveDb();
  logActivity('upload_document', 'admin', `Uploaded ${newDocs.length} documents to ${folder || 'root'}`);
  res.json(newDocs);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.documents.findIndex((d: any) => d.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');
  
  const doc = db.documents[index];
  const filePath = path.join(process.cwd(), 'data', 'مستندات_البلدية', doc.folder, doc.name);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  db.documents.splice(index, 1);
  saveDb();
  logActivity('delete_document', 'admin', `Deleted document ${doc.name}`);
  res.json({ success: true });
});

export default router;
