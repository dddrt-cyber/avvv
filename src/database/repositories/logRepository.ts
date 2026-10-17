import { db } from '../index';
export class LogRepository {
  static addLog(level: string, source: string, message: string) { db.prepare('INSERT INTO logs (level, source, message) VALUES (?, ?, ?)').run(level, source, message); }
  static getStats() {
    const total = (db.prepare('SELECT COUNT(*) as c FROM listings').get() as any).c;
    const sent = (db.prepare('SELECT COUNT(*) as c FROM listings WHERE is_sent = 1').get() as any).c;
    const rej = (db.prepare("SELECT COUNT(*) as c FROM listings WHERE category_status = 'REJECTED'").get() as any).c;
    const rejDis = (db.prepare("SELECT COUNT(*) as c FROM listings WHERE category_status = 'REJECTED' AND (rejection_reason LIKE '%запчаст%' OR rejection_reason LIKE '%разбор%')").get() as any).c;
    const rejCrash = (db.prepare("SELECT COUNT(*) as c FROM listings WHERE category_status = 'REJECTED' AND (rejection_reason LIKE '%ДТП%' OR rejection_reason LIKE '%хлам%')").get() as any).c;
    return { totalChecked: total, totalNew: total, totalNotified: sent, totalRejected: rej, rejectedDisassembly: rejDis, rejectedHeavyAccident: rejCrash, pendingInspection: 0, sourceErrorsCount: 0, lastCheckTimestamp: new Date().toLocaleTimeString('ru-RU') };
  }
}
