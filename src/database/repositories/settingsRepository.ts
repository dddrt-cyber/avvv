import { db } from '../index';
export class SettingsRepository {
  static get(k: string, d = '') { const r = db.prepare('SELECT value FROM system_settings WHERE key = ?').get(k) as any; return r ? r.value : d; }
  static set(k: string, v: string) { db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)').run(k, v); }
  static getState(userId: number) { return db.prepare('SELECT action, metadata FROM dialog_state WHERE user_id = ?').get(userId) as any; }
  static setState(userId: number, action: string, metadata = '') { db.prepare('INSERT OR REPLACE INTO dialog_state (user_id, action, metadata) VALUES (?, ?, ?)').run(userId, action, metadata); }
  static clearState(userId: number) { db.prepare('DELETE FROM dialog_state WHERE user_id = ?').run(userId); }
}
