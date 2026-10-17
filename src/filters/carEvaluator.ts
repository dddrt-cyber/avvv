import { RawCarListing, CarConditionCategory } from '../types';
import { TextFilter } from './textFilter';
import { PriceAnalyzer } from '../pricing/priceAnalyzer';
export class CarEvaluator {
  static async evaluate(car: RawCarListing) {
    const textRes = TextFilter.analyze(`${car.title} ${car.description}`);
    if (textRes.isHardRejected) return { category: CarConditionCategory.REJECTED, reasons: textRes.reasons, score: 0, isSuspiciouslyCheap: false };
    const priceRes = PriceAnalyzer.evaluate(car.make, car.model, car.year, car.price);
    let cat = CarConditionCategory.GOOD_CANDIDATE;
    const reasons: string[] = [];
    if (priceRes.isSuspicious) { cat = CarConditionCategory.NEEDS_CHECK; reasons.push('Подозрительно низкая цена'); }
    else if (textRes.hasMinorIssues) { cat = CarConditionCategory.HAS_ISSUES; reasons.push(...textRes.minorIssues); }
    return { category: cat, reasons, score: 85, marketPrice: priceRes.marketPrice || undefined, discountPercent: priceRes.discountPercent || undefined, isSuspiciouslyCheap: priceRes.isSuspicious };
  }
}
