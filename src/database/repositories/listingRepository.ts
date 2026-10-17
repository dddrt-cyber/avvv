import { db } from '../index';
import { RawCarListing, EvaluationResult, CarListingRecord, CarConditionCategory } from '../../types';
export class ListingRepository {
  static exists(id: string): boolean { return Boolean(db.prepare('SELECT 1 FROM listings WHERE id = ?').get(id)); }
  static getById(id: string): CarListingRecord | null {
    const r = db.prepare('SELECT * FROM listings WHERE id = ?').get(id) as any;
    return r ? this.map(r) : null;
  }
  static save(car: RawCarListing, ev: EvaluationResult) {
    db.prepare(`
      INSERT INTO listings (id, url, title, price, make, model, year, mileage, city, region, description, photos_json, published_at, category_status, rejection_reason, market_price, discount_percent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(car.id, car.url, car.title, car.price, car.make, car.model, car.year, car.mileage, car.city, car.region, car.description, JSON.stringify(car.photoUrls), car.publishedAt.toISOString(), ev.category, ev.reasons.join('; ') || null, ev.marketPrice || null, ev.discountPercent || null);
  }
  static markAsSent(id: string) { db.prepare('UPDATE listings SET is_sent = 1 WHERE id = ?').run(id); }
  static getRecent(limit = 1, offset = 0): CarListingRecord[] {
    const rows = db.prepare('SELECT * FROM listings WHERE category_status != ? ORDER BY published_at DESC LIMIT ? OFFSET ?').all(CarConditionCategory.REJECTED, limit, offset) as any[];
    return rows.map(this.map);
  }
  static getComparablePrices(make: string, model: string, minYear: number, maxYear: number): number[] {
    const rows = db.prepare('SELECT price FROM listings WHERE LOWER(make) = LOWER(?) AND LOWER(model) = LOWER(?) AND year BETWEEN ? AND ? AND category_status != ?').all(make, model, minYear, maxYear, CarConditionCategory.REJECTED) as { price: number }[];
    return rows.map(r => r.price);
  }
  private static map(r: any): CarListingRecord {
    return {
      id: r.id, url: r.url, title: r.title, price: r.price, make: r.make, model: r.model, year: r.year, mileage: r.mileage, city: r.city, region: r.region, description: r.description, photoUrls: JSON.parse(r.photos_json || '[]'), publishedAt: new Date(r.published_at), categoryStatus: r.category_status, rejectionReason: r.rejection_reason, marketPrice: r.market_price, discountPercent: r.discount_percent, isSent: Boolean(r.is_sent), createdAt: r.created_at, updatedAt: r.updated_at
    };
  }
}
