import path from 'path';
import Database from 'better-sqlite3';

let dbInstance: any = null;
let dbData: any = null;

export function initDb(dataDir: string) {
  const dbPath = path.join(dataDir, 'municipality.db');
  dbInstance = new Database(dbPath);

  // Enable WAL mode for better performance
  dbInstance.pragma('journal_mode = WAL');

  // Create tables
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      action TEXT,
      user TEXT,
      details TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS neighborhoods (
      id TEXT PRIMARY KEY,
      name TEXT,
      population INTEGER,
      latitude REAL,
      longitude REAL,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      latitude REAL,
      longitude REAL,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      latitude REAL,
      longitude REAL,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      type TEXT,
      latitude REAL,
      longitude REAL,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS social_support (
      id TEXT PRIMARY KEY,
      fullName TEXT,
      nationalId TEXT,
      category TEXT,
      latitude REAL,
      longitude REAL,
      data TEXT
    );

    -- GIS Indices
    CREATE INDEX IF NOT EXISTS idx_neighborhoods_coords ON neighborhoods(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_schools_coords ON schools(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_facilities_coords ON facilities(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_properties_coords ON properties(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_social_support_coords ON social_support(latitude, longitude);
  `);

  // Load data into memory for compatibility
  loadDataFromSqlite();
}

function loadDataFromSqlite() {
  const data: any = {
    users: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('users')?.value || '[]'),
    employees: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('employees')?.value || '[]'),
    machinery: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('machinery')?.value || '[]'),
    documents: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('documents')?.value || '[]'),
    projects: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('projects')?.value || '[]'),
    complaints: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('complaints')?.value || '[]'),
    licenses: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('licenses')?.value || '[]'),
    settings: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('settings')?.value || '{}'),
    population_settings: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('population_settings')?.value || '{"total_population": 0}'),
    tribes: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('tribes')?.value || '[]'),
    tasks: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('tasks')?.value || '[]'),
    decisions: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('decisions')?.value || '[]'),
    budget: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('budget')?.value || '[]'),
    notifications: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('notifications')?.value || '[]'),
    meetings: JSON.parse(dbInstance.prepare('SELECT value FROM kv_store WHERE key = ?').get('meetings')?.value || '[]'),
    
    // Tables with specific columns
    activityLog: dbInstance.prepare('SELECT * FROM activity_log').all(),
    neighborhoods: dbInstance.prepare('SELECT * FROM neighborhoods').all().map((row: any) => ({ ...JSON.parse(row.data), id: row.id, name: row.name, population: row.population, latitude: row.latitude, longitude: row.longitude })),
    schools: dbInstance.prepare('SELECT * FROM schools').all().map((row: any) => ({ ...JSON.parse(row.data), id: row.id, name: row.name, type: row.type, latitude: row.latitude, longitude: row.longitude })),
    facilities: dbInstance.prepare('SELECT * FROM facilities').all().map((row: any) => ({ ...JSON.parse(row.data), id: row.id, name: row.name, type: row.type, latitude: row.latitude, longitude: row.longitude })),
    properties: dbInstance.prepare('SELECT * FROM properties').all().map((row: any) => ({ ...JSON.parse(row.data), id: row.id, type: row.type, latitude: row.latitude, longitude: row.longitude })),
    social_support: dbInstance.prepare('SELECT * FROM social_support').all().map((row: any) => ({ ...JSON.parse(row.data), id: row.id, fullName: row.fullName, nationalId: row.nationalId, category: row.category, latitude: row.latitude, longitude: row.longitude }))
  };

  // Default values
  if (!data.settings.headerLine1) {
    data.settings = {
      headerLine1: 'الجمهورية العربية السورية',
      headerLine2: 'محافظة دير الزور - ناحية البصيرة',
      headerLine3: 'مجلس بلدية طيب الفال',
      logoPath: ''
    };
  }

  dbData = data;
}

export function getDb() {
  return dbData;
}

export function saveDb() {
  const transaction = dbInstance.transaction(() => {
    // Save KV store items
    const upsertKv = dbInstance.prepare('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)');
    upsertKv.run('users', JSON.stringify(dbData.users));
    upsertKv.run('employees', JSON.stringify(dbData.employees));
    upsertKv.run('machinery', JSON.stringify(dbData.machinery));
    upsertKv.run('documents', JSON.stringify(dbData.documents));
    upsertKv.run('projects', JSON.stringify(dbData.projects));
    upsertKv.run('complaints', JSON.stringify(dbData.complaints));
    upsertKv.run('licenses', JSON.stringify(dbData.licenses));
    upsertKv.run('settings', JSON.stringify(dbData.settings));
    upsertKv.run('population_settings', JSON.stringify(dbData.population_settings));
    upsertKv.run('tribes', JSON.stringify(dbData.tribes));
    upsertKv.run('tasks', JSON.stringify(dbData.tasks));
    upsertKv.run('decisions', JSON.stringify(dbData.decisions));
    upsertKv.run('budget', JSON.stringify(dbData.budget));
    upsertKv.run('notifications', JSON.stringify(dbData.notifications));
    upsertKv.run('meetings', JSON.stringify(dbData.meetings));

    // Save specific tables
    dbInstance.prepare('DELETE FROM activity_log').run();
    const insertActivity = dbInstance.prepare('INSERT INTO activity_log (id, action, user, details, timestamp) VALUES (?, ?, ?, ?, ?)');
    for (const log of dbData.activityLog) {
      insertActivity.run(log.id, log.action, log.user, log.details, log.timestamp);
    }

    dbInstance.prepare('DELETE FROM neighborhoods').run();
    const insertNeighborhood = dbInstance.prepare('INSERT INTO neighborhoods (id, name, population, latitude, longitude, data) VALUES (?, ?, ?, ?, ?, ?)');
    for (const n of dbData.neighborhoods) {
      insertNeighborhood.run(n.id, n.name, n.population, n.latitude, n.longitude, JSON.stringify(n));
    }

    dbInstance.prepare('DELETE FROM schools').run();
    const insertSchool = dbInstance.prepare('INSERT INTO schools (id, name, type, latitude, longitude, data) VALUES (?, ?, ?, ?, ?, ?)');
    for (const s of dbData.schools) {
      insertSchool.run(s.id, s.name, s.type, s.latitude, s.longitude, JSON.stringify(s));
    }

    dbInstance.prepare('DELETE FROM facilities').run();
    const insertFacility = dbInstance.prepare('INSERT INTO facilities (id, name, type, latitude, longitude, data) VALUES (?, ?, ?, ?, ?, ?)');
    for (const f of dbData.facilities) {
      insertFacility.run(f.id, f.name, f.type, f.latitude, f.longitude, JSON.stringify(f));
    }

    dbInstance.prepare('DELETE FROM properties').run();
    const insertProperty = dbInstance.prepare('INSERT INTO properties (id, type, latitude, longitude, data) VALUES (?, ?, ?, ?, ?)');
    for (const p of dbData.properties) {
      insertProperty.run(p.id, p.type, p.latitude, p.longitude, JSON.stringify(p));
    }

    dbInstance.prepare('DELETE FROM social_support').run();
    const insertSocial = dbInstance.prepare('INSERT INTO social_support (id, fullName, nationalId, category, latitude, longitude, data) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const s of dbData.social_support) {
      insertSocial.run(s.id, s.fullName, s.nationalId, s.category, s.latitude, s.longitude, JSON.stringify(s));
    }
  });

  transaction();
}

export function logActivity(action: string, user: string, details: string) {
  const log = {
    id: Date.now().toString(),
    action,
    user,
    details,
    timestamp: new Date().toISOString()
  };
  dbData.activityLog.push(log);
  
  // Direct insert for activity log to ensure it's saved even if saveDb isn't called immediately
  dbInstance.prepare('INSERT INTO activity_log (id, action, user, details, timestamp) VALUES (?, ?, ?, ?, ?)').run(
    log.id, log.action, log.user, log.details, log.timestamp
  );
  
  saveDb();
}
