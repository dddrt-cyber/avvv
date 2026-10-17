import { Composer } from 'grammy';
import { CONFIG } from '../../config';
import { LogRepository } from '../../database/repositories/logRepository';
import { PaymentRepository } from '../../database/repositories/paymentRepository';
import { UserRepository } from '../../database/repositories/userRepository';
import { TARIFF_PLANS } from '../../types';

export function createAdminHandlers(): Composer {
  const admin = new Composer();
  admin.use(async (ctx, next) => {
    if (!CONFIG.isAdmin(ctx.from?.id)) return;
    await next();
  });

  admin.callbackQuery('admin:main', async (ctx) => {
    const s = LogRepository.getStats();
    await ctx.editMessageText(`👑 <b>Панель Администратора</b>\n\n🔍 Проверено: <b>${s.totalChecked}</b>\n📩 Отправлено: <b>${s.totalNotified}</b>\n⛔ Отсеяно хлама: <b>${s.totalRejected}</b>\n\nВсе системы работают в штатном режиме.`, { parse_mode: 'HTML' });
  });

  admin.callbackQuery(/^admin:pay:ok:(\d+)$/, async (ctx) => {
    const p = PaymentRepository.getById(parseInt(ctx.match[1], 10));
    if (!p || p.status !== 'PENDING') return ctx.answerCallbackQuery({ text: 'Уже обработано' });
    const t = TARIFF_PLANS[p.tariff_id];
    PaymentRepository.setStatus(p.id, 'APPROVED');
    const exp = UserRepository.addSubscriptionDays(p.user_id, t.durationDays);
    await ctx.editMessageCaption({ caption: `${ctx.callbackQuery.message?.caption || ''}\n\n✅ <b>ОПЛАТА ОДОБРЕНА!</b>`, parse_mode: 'HTML' });
    await ctx.api.sendMessage(p.telegram_id, `🎉 <b>Оплата подтверждена!</b>\nТариф: <b>${t.title}</b> активен до <b>${exp.toLocaleDateString('ru-RU')}</b>. Уведомления включены!`, { parse_mode: 'HTML' });
    await ctx.answerCallbackQuery({ text: 'Одобрено!' });
  });

  admin.callbackQuery(/^admin:pay:no:(\d+)$/, async (ctx) => {
    const pId = parseInt(ctx.match[1], 10);
    PaymentRepository.setStatus(pId, 'REJECTED');
    await ctx.editMessageCaption({ caption: `${ctx.callbackQuery.message?.caption || ''}\n\n❌ <b>ОПЛАТА ОТКЛОНЕНА</b>`, parse_mode: 'HTML' });
    await ctx.answerCallbackQuery({ text: 'Отклонено' });
  });

  return admin;
}
