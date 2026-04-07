import express from 'express';
import { getDb } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.activityLog);
});

export default router;
