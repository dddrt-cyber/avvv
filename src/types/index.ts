export enum CarConditionCategory {
  GOOD_CANDIDATE = 'GOOD_CANDIDATE',
  HAS_ISSUES = 'HAS_ISSUES',
  NEEDS_CHECK = 'NEEDS_CHECK',
  REJECTED = 'REJECTED'
}
export interface TariffPlan {
  id: string;
  title: string;
  durationDays: number;
  priceRub: number;
}
export const TARIFF_PLANS: Record<string, TariffPlan> = {
  '1_MONTH': { id: '1_MONTH', title: '1 месяц', durationDays: 30, priceRub: 250 },
  '3_MONTHS': { id: '3_MONTHS', title: '3 месяца', durationDays: 90, priceRub: 650 },
  '6_MONTHS': { id: '6_MONTHS', title: '6 месяцев', durationDays: 180, priceRub: 1200 },
};
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface PaymentRecord {
  id: number;
  userId: number;
  telegramId: number;
  tariffId: string;
  amount: number;
  status: PaymentStatus;
  receiptFileId?: string;
  receiptText?: string;
  createdAt: string;
  reviewedAt?: string;
}
export interface RawCarListing {
  id: string;
  url: string;
  title: string;
  price: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  city: string;
  region: string;
  description: string;
  photoUrls: string[];
  publishedAt: Date;
}
export interface EvaluationResult {
  category: CarConditionCategory;
  reasons: string[];
  score: number;
  marketPrice?: number;
  discountPercent?: number;
  isSuspiciouslyCheap: boolean;
}
export interface CarListingRecord extends RawCarListing {
  categoryStatus: CarConditionCategory;
  rejectionReason: string | null;
  marketPrice: number | null;
  discountPercent: number | null;
  isSent: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface UserProfile {
  id: number;
  telegramId: number;
  username?: string;
  firstName: string;
  isAdmin: boolean;
  notificationsEnabled: boolean;
  minDiscountPercent: number;
  allowNeedsCheck: boolean;
  subscriptionExpiresAt: Date | null;
  trialUsed: boolean;
  hasActiveSubscription: boolean;
  createdAt: string;
}
export interface AdminStats {
  totalChecked: number;
  totalNew: number;
  totalNotified: number;
  totalRejected: number;
  rejectedDisassembly: number;
  rejectedHeavyAccident: number;
  pendingInspection: number;
  sourceErrorsCount: number;
  lastCheckTimestamp: string | null;
}
