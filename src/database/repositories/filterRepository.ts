import { db } from '../index';
export class FilterRepository {
  static getUserFilters(userId: number) {
    return (db.prepare('SELECT * FROM filters WHERE user_id = ?').all(userId) as any[]).map(r => ({ id: r.id, userId: r.user_id, title: r.title, maxPrice: r.max_price, minYear: r.min_year, isActive: Boolean(r.is_active) }));
  }
}
