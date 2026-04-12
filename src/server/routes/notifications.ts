import express from 'express';
import { getDb, saveDb } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  
  // Generate dynamic alerts
  const alerts: any[] = [];
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // 1. Vehicle license expiry (after a week)
  (db.machinery || []).forEach((m: any) => {
    if (m.licenseExpiry) {
      const expiry = new Date(m.licenseExpiry);
      if (expiry <= nextWeek && expiry >= now) {
        alerts.push({
          id: `machinery-license-${m.id}`,
          type: 'warning',
          title: 'انتهاء رخصة آلية',
          message: `رخصة الآلية ${m.name} تنتهي بتاريخ ${m.licenseExpiry}`,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // 2. Employee contract expiry (within a month)
  (db.employees || []).forEach((e: any) => {
    if (e.contractExpiry) {
      const expiry = new Date(e.contractExpiry);
      if (expiry <= nextMonth && expiry >= now) {
        alerts.push({
          id: `employee-contract-${e.id}`,
          type: 'info',
          title: 'انتهاء عقد موظف',
          message: `عقد الموظف ${e.name} ينتهي خلال أقل من شهر (${e.contractExpiry})`,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // 3. Vehicle maintenance (1 month since last maintenance)
  (db.machinery || []).forEach((m: any) => {
    if (m.lastMaintenance) {
      const last = new Date(m.lastMaintenance);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (last <= oneMonthAgo) {
        alerts.push({
          id: `machinery-maintenance-${m.id}`,
          type: 'warning',
          title: 'موعد صيانة آلية',
          message: `الآلية ${m.name} لم تخضع للصيانة منذ أكثر من شهر (آخر صيانة: ${m.lastMaintenance})`,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // 4. Budget overrun
  (db.budget || []).forEach((b: any) => {
    if (Number(b.spent) > Number(b.allocated)) {
      alerts.push({
        id: `budget-overrun-${b.id}`,
        type: 'danger',
        title: 'تجاوز ميزانية',
        message: `تم تجاوز الميزانية المخصصة لبند ${b.title}`,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Combine with manual notifications
  const allNotifications = [...alerts, ...(db.notifications || [])].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  res.json(allNotifications);
});

router.post('/read/:id', (req, res) => {
  const db = getDb();
  // For manual notifications, we can mark as read. 
  // For dynamic alerts, they disappear when condition is fixed.
  res.json({ success: true });
});

export default router;
