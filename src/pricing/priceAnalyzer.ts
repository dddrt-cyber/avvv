import { ListingRepository } from '../database/repositories/listingRepository';
export class PriceAnalyzer {
  static evaluate(make: string, model: string, year: number, price: number) {
    const list = ListingRepository.getComparablePrices(make, model, year - 1, year + 1);
    if (list.length < 3) return { marketPrice: null, discountPercent: null, isSuspicious: false };
    list.sort((a, b) => a - b);
    const median = list[Math.floor(list.length / 2)];
    const discount = Math.round(((median - price) / median) * 100);
    return { marketPrice: median, discountPercent: discount, isSuspicious: discount > 50 || price < 40000 };
  }
}
