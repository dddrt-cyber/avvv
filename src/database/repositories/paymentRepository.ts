import { db } from '../index';
export class PaymentRepository {
  static create(userId: number, tariffId: string, amount: number, receiptFileId?: string, receiptText?: string): number {
    return Number(db.prepare("INSERT INTO payments (user_id, tariff_id, amount, status, receipt_file_id, receipt_text) VALUES (?, ?, ?, 'PENDING', ?, ?)").run(userId, tariffId, amount, receiptFileId || null, receiptText || null).lastInsertRowid);
  }
  static getById(id: number) {
    return db.prepare('SELECT p.*, u.telegram_id, u.first_name, u.username FROM payments p JOIN users u ON u.id = p.user_id WHERE p.id = ?').get(id) as any;
  }
  static setStatus(id: number, status: string) {
    db.prepare('UPDATE payments SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  }
}
