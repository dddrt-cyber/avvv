import { Bot, InlineKeyboard } from 'grammy';
import { CarListingRecord, CarConditionCategory } from '../types';
export class NotificationService {
  static async sendCarNotification(bot: Bot, chatId: number, car: CarListingRecord) {
    const status = car.categoryStatus === CarConditionCategory.GOOD_CANDIDATE ? '✅ Хороший кандидат' : '⚠️ Есть нюансы';
    let p = `💰 Цена: <b>${car.price.toLocaleString('ru-RU')} ₽</b>`;
    if (car.discountPercent && car.discountPercent > 0) p += `\n📉 Выгода: <b>~${car.discountPercent}% ниже рынка</b>`;
    const text = `🚗 <b>НАЙДЕН АВТОМОБИЛЬ</b>\n\n<b>${car.make} ${car.model}, ${car.year} г.</b>\n\n${p}\n📍 Город: ${car.city}\n🛣 Пробег: ${car.mileage ? car.mileage.toLocaleString('ru-RU') + ' км' : 'не указан'}\n🔎 Оценка: ${status}\n\n📝 ${car.description.slice(0, 200)}...\n\n🕒 ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    const kb = new InlineKeyboard().url('🔗 Открыть на Авито', car.url);
    try {
      if (car.photoUrls[0]) await bot.api.sendPhoto(chatId, car.photoUrls[0], { caption: text, parse_mode: 'HTML', reply_markup: kb });
      else await bot.api.sendMessage(chatId, text, { parse_mode: 'HTML', reply_markup: kb });
    } catch {}
  }
}
