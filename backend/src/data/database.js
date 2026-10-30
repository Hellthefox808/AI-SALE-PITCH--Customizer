import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let activeDb = null

export function getDb (customPath = null) {
  if (activeDb && !customPath) {
    return activeDb
  }

  const dbPath = customPath || process.env.DB_PATH || path.resolve(__dirname, '../../sales_pitch.db')
  const db = new DatabaseSync(dbPath)

  if (dbPath !== ':memory:') {
    try {
      db.exec('PRAGMA journal_mode = WAL;')
      db.exec('PRAGMA foreign_keys = ON;')
      db.exec('PRAGMA busy_timeout = 5000;')
    } catch {
      // Memory or certain environments can ignore WAL pragma safely
    }
  }

  initSchema(db)

  if (!customPath) {
    activeDb = db
  }

  return db
}

export function closeDb (db = null) {
  const target = db || activeDb
  if (target) {
    try {
      target.close()
    } catch {
      // Ignore if already closed
    }
    if (target === activeDb) {
      activeDb = null
    }
  }
}

export function initSchema (db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      industry TEXT NOT NULL,
      size TEXT NOT NULL,
      hq_location TEXT,
      annual_revenue TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      email TEXT NOT NULL,
      linkedin_url TEXT,
      persona_type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS news_triggers (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      source_url TEXT,
      published_date TEXT NOT NULL,
      trigger_category TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      key_facts_json TEXT NOT NULL,
      relevance_score REAL DEFAULT 0.85,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT NOT NULL,
      value_prop TEXT NOT NULL,
      pain_points_json TEXT NOT NULL,
      target_personas_json TEXT NOT NULL,
      proof_points_json TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pitch_templates (
      id TEXT PRIMARY KEY,
      framework TEXT NOT NULL,
      name TEXT NOT NULL,
      structure_prompt TEXT NOT NULL,
      default_tone TEXT NOT NULL,
      is_system INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pitches (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      news_trigger_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      framework TEXT NOT NULL,
      tone TEXT NOT NULL,
      subject_line TEXT NOT NULL,
      body_content TEXT NOT NULL,
      variants_json TEXT NOT NULL,
      spam_score REAL NOT NULL,
      readability_grade REAL NOT NULL,
      word_count INTEGER NOT NULL,
      status TEXT DEFAULT 'draft',
      feedback_rating INTEGER DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (news_trigger_id) REFERENCES news_triggers(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_role TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);
    CREATE INDEX IF NOT EXISTS idx_news_account ON news_triggers(account_id);
    CREATE INDEX IF NOT EXISTS idx_news_category ON news_triggers(trigger_category);
    CREATE INDEX IF NOT EXISTS idx_pitches_account ON pitches(account_id);
    CREATE INDEX IF NOT EXISTS idx_pitches_status ON pitches(status);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
  `)
}
