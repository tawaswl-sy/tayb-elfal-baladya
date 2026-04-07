import fs from 'fs';
import path from 'path';

let dbPath = '';
let db: any = null;

export function initDb(dataDir: string) {
  dbPath = path.join(dataDir, 'municipality.db.json');
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
    if (!db.projects) db.projects = [];
    if (!db.complaints) db.complaints = [];
    if (!db.licenses) db.licenses = [];
    if (!db.population_settings) db.population_settings = { total_population: 0 };
    if (!db.neighborhoods) db.neighborhoods = [];
    if (!db.tribes) db.tribes = [];
    if (!db.schools) db.schools = [];
    if (!db.facilities) db.facilities = [];
    if (!db.properties) db.properties = [];
    if (!db.settings) db.settings = {
      headerLine1: 'الجمهورية العربية السورية',
      headerLine2: 'محافظة دير الزور - ناحية البصيرة',
      headerLine3: 'مجلس بلدية طيب الفال',
      logoPath: ''
    };
  } else {
    db = {
      users: [],
      employees: [],
      machinery: [],
      documents: [],
      projects: [],
      complaints: [],
      licenses: [],
      activityLog: [],
      settings: {},
      population_settings: { total_population: 0 },
      neighborhoods: [],
      tribes: [],
      schools: [],
      facilities: [],
      properties: []
    };
    saveDb();
  }
}

export function getDb() {
  return db;
}

export function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

export function logActivity(action: string, user: string, details: string) {
  db.activityLog.push({
    id: Date.now().toString(),
    action,
    user,
    details,
    timestamp: new Date().toISOString()
  });
  saveDb();
}
