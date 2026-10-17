import { InlineKeyboard } from 'grammy';
import { TARIFF_PLANS } from '../types';
export const Keyboards = {
  mainMenu(isAdmin = false, hasSub = false) {
    const kb = new InlineKeyboard()
      .text('🆕 Свежие авто', 'menu:recent:0')
      .text(hasSub ? '💎 Подписка (ВКЛ)' : '💳 Тарифы и Оплата', 'menu:subscription')
      .row()
      .text('❓ Помощь', 'menu:help');
    if (isAdmin) kb.row().text('👑 Панель Администратора', 'admin:main');
    return kb;
  },
  subscription(canTrial: boolean) {
    const kb = new InlineKeyboard();
    if (canTrial) kb.text('🎁 Включить тест на 5 дней (БЕСПЛАТНО)', 'sub:trial').row();
    kb.text(`1 месяц — ${TARIFF_PLANS['1_MONTH'].priceRub} ₽`, 'sub:buy:1_MONTH').row()
      .text(`3 месяца — ${TARIFF_PLANS['3_MONTHS'].priceRub} ₽`, 'sub:buy:3_MONTHS').row()
      .text(`6 месяцев — ${TARIFF_PLANS['6_MONTHS'].priceRub} ₽`, 'sub:buy:6_MONTHS').row()
      .text('🔙 Назад', 'menu:back');
    return kb;
  },
  adminPay(id: number) {
    return new InlineKeyboard().text('✅ Одобрить', `admin:pay:ok:${id}`).text('❌ Отклонить', `admin:pay:no:${id}`);
  }
};
