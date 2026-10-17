import { db } from '../index';
import { UserProfile } from '../../types';
export class UserRepository {
  static getOrCreate(telegramId: number, firstName: string, username?: string, isAdmin = false): UserProfile {
    let row = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId) as any;
    if (!row) {
      const info = db.prepare('INSERT INTO users (telegram_id, username, first_name, is_admin) VALUES (?, ?, ?, ?)').run(telegramId, username || null, firstName, isAdmin ? 1 : 0);
      row = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    } else if (isAdmin && !row.is_admin) {
      db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(row.id);
      row.is_admin = 1;
    }
    return this.map(row);
  }
  static activateTrial(userId: number): boolean {
    const user = db.prepare('SELECT trial_used FROM users WHERE id = ?').get(userId) as any;
    if (!user || user.trial_used) return false;
    const end = new Date(); end.setDate(end.getDate() + 5);
    db.prepare('UPDATE users SET trial_used = 1, subscription_expires_at = ? WHERE id = ?').run(end.toISOString(), userId);
    return true;
  }
  static addSubscriptionDays(userId: number, days: number): Date {
    const user = db.prepare('SELECT subscription_expires_at FROM users WHERE id = ?').get(userId) as any;
    let base = new Date();
    if (user?.subscription_expires_at) {
      const cur = new Date(user.subscription_expires_at);
      if (cur > base) base = cur;
    }
    base.setDate(base.getDate() + days);
    db.prepare('UPDATE users SET subscription_expires_at = ? WHERE id = ?').run(base.toISOString(), userId);
    return base;
  }
  static getSubscribedUsers(): UserProfile[] {
    const rows = db.prepare('SELECT * FROM users WHERE notifications_enabled = 1 AND subscription_expires_at IS NOT NULL AND subscription_expires_at > ?').all(new Date().toISOString()) as any[];
    return rows.map(this.map);
  }
  private static map(r: any): UserProfile {
    const exp = r.subscription_expires_at ? new Date(r.subscription_expires_at) : null;
    return {
      id: r.id,
      telegramId: r.telegram_id,
      username: r.username,
      firstName: r.first_name,
      isAdmin: Boolean(r.is_admin),
      notificationsEnabled: Boolean(r.notifications_enabled),
      minDiscountPercent: r.min_discount_percent || 10,
      allowNeedsCheck: Boolean(r.allow_needs_check),
      subscriptionExpiresAt: exp,
      trialUsed: Boolean(r.trial_used),
      hasActiveSubscription: exp !== null && exp > new Date(),
      createdAt: r.created_at,
    };
  }
}
