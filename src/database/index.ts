import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';
const dbDir = path.dirname(CONFIG.DATABASE_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
export const db = new Database(CONFIG.DATABASE_PATH);
db.pragma('journal_mode = WAL');
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT 0,
      notifications_enabled BOOLEAN NOT NULL DEFAULT 1,
      min_discount_percent INTEGER NOT NULL DEFAULT 10,
      allow_needs_check BOOLEAN NOT NULL DEFAULT 0,
      subscription_expires_at DATETIME DEFAULT NULL,
      trial_used BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tariff_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      receipt_file_id TEXT,
      receipt_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS filters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      max_price INTEGER,
      min_year INTEGER,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      price INTEGER NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      mileage INTEGER NOT NULL,
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT NOT NULL,
      photos_json TEXT NOT NULL,
      published_at DATETIME NOT NULL,
      category_status TEXT NOT NULL,
      rejection_reason TEXT,
      market_price INTEGER,
      discount_percent REAL,
      is_sent BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, level TEXT, source TEXT, message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS dialog_state (user_id INTEGER PRIMARY KEY, action TEXT, metadata TEXT);
  `);
  db.prepare('INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)').run('parsing_enabled', '1');
}
