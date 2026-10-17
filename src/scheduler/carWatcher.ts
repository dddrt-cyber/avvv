import { Bot } from 'grammy';
import { AvitoParser } from '../parser/avitoParser';
import { ListingRepository } from '../database/repositories/listingRepository';
import { UserRepository } from '../database/repositories/userRepository';
import { CarEvaluator } from '../filters/carEvaluator';
import { NotificationService } from '../services/notificationService';
import { CarConditionCategory } from '../types';
export class CarWatcher {
  private parser = new AvitoParser();
  constructor(private bot: Bot) {}
  start() { this.run(); setInterval(() => this.run(), 180000); }
  async run() {
    try {
      const items = await this.parser.fetchNewListings();
      for (const item of items) {
        if (ListingRepository.exists(item.id)) continue;
        const ev = await CarEvaluator.evaluate(item);
        ListingRepository.save(item, ev);
        if (ev.category === CarConditionCategory.REJECTED) continue;
        const rec = ListingRepository.getById(item.id);
        if (!rec) continue;
        const subs = UserRepository.getSubscribedUsers();
        for (const s of subs) {
          await NotificationService.sendCarNotification(this.bot, s.telegramId, rec);
        }
        ListingRepository.markAsSent(rec.id);
      }
    } catch {}
  }
}
