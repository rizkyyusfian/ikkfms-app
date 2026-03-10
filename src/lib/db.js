import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// In packaged Electron, DB path is passed via env var.
// In dev, use data/ in the project root.
const DB_PATH =
  process.env.IKKFMS_DB_PATH || path.join(process.cwd(), "data", "ikkfms.db");
const DB_DIR = path.dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_name TEXT NOT NULL,
      head_nik TEXT NOT NULL UNIQUE,
      head_name TEXT NOT NULL,
      head_birth_place TEXT,
      head_birth_date TEXT,
      head_gender TEXT DEFAULT 'Laki-laki',
      head_job TEXT,
      head_education TEXT,
      head_phone TEXT,
      home_address TEXT,
      wife_name TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      nik TEXT NOT NULL,
      name TEXT NOT NULL,
      birth_place TEXT,
      birth_date TEXT,
      gender TEXT,
      family_status TEXT NOT NULL DEFAULT 'Anak',
      job TEXT,
      education TEXT,
      phone TEXT,
      child_order INTEGER,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
    );
  `);
}

export default getDb;
