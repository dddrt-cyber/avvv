import { Composer } from 'grammy';
import { Keyboards } from '../keyboards';
import { UserRepository } from '../../database/repositories/userRepository';
import { PaymentRepository } from '../../database/repositories/paymentRepository';
import { ListingRepository } from '../../database/repositories/listingRepository';
import { SettingsRepository } from '../../database/repositories/settingsRepository';
import { CONFIG } from '../../config';
import { TARIFF_PLANS } from '../../types';

export const userHandlers = new Composer();

userHandlers.command('start', async (ctx) => {
  const isAdmin = CONFIG.isAdmin(ctx.from?.id);
  const u = UserRepository.getOrCreate(ctx.from!.id, ctx.from!.first_name, ctx.from?.username, isAdmin);
  await ctx.reply(`👋 Привет, <b>${ctx.from!.first_name}</b>!\n\nЯ бот-автоподборщик выгодных авто на Авито. Я отсеиваю битые, тотал и разбор, присылая только выгодные авто ниже рынка.\n\n🎁 <i>Нажмите «Тарифы и Оплата», чтобы активировать бесплатный тест на 5 дней!</i>`, { parse_mode: 'HTML', reply_markup: Keyboards.mainMenu(isAdmin, u.hasActiveSubscription) });
});

userHandlers.callbackQuery('menu:back', async (ctx) => {
  const u = UserRepository.getOrCreate(ctx.from.id, ctx.from.first_name);
  await ctx.editMessageText('Главное меню:', { reply_markup: Keyboards.mainMenu(CONFIG.isAdmin(ctx.from.id), u.hasActiveSubscription) });
});

userHandlers.callbackQuery('menu:help', async (ctx) => {
  await ctx.editMessageText('📖 <b>Как работает бот:</b>\n1. Сканирует свежие авто на Авито.\n2. Отсеивает хлам, авто на запчасти и битые машины.\n3. Сравнивает цену с рыночной и присылает вам варианты со скидкой.\n\nДля работы требуется активный тариф или 5-дневный триал.', { parse_mode: 'HTML', reply_markup: Keyboards.mainMenu(CONFIG.isAdmin(ctx.from.id), false) });
});

userHandlers.callbackQuery('menu:subscription', async (ctx) => {
  const u = UserRepository.getOrCreate(ctx.from.id, ctx.from.first_name);
  let s = '❌ <b>Подписка не активна.</b>';
  if (u.hasActiveSubscription && u.subscriptionExpiresAt) s = `✅ <b>Активна до:</b> ${u.subscriptionExpiresAt.toLocaleDateString('ru-RU')}`;
  await ctx.editMessageText(`💎 <b>ТАРИФЫ И ПОДПИСКА</b>\n\n${s}\n\nВыберите тариф:`, { parse_mode: 'HTML', reply_markup: Keyboards.subscription(!u.trialUsed) });
});

userHandlers.callbackQuery('sub:trial', async (ctx) => {
  const u = UserRepository.getOrCreate(ctx.from.id, ctx.from.first_name);
  if (u.trialUsed) return ctx.answerCallbackQuery({ text: 'Вы уже брали тест!', show_alert: true });
  UserRepository.activateTrial(u.id);
  await ctx.answerCallbackQuery({ text: '🎉 5 дней включены!' });
  await ctx.reply('🎁 <b>Пробный период на 5 дней активирован!</b> Теперь вы будете получать карточки новых авто.', { parse_mode: 'HTML', reply_markup: Keyboards.mainMenu(CONFIG.isAdmin(ctx.from.id), true) });
});

userHandlers.callbackQuery(/^sub:buy:(.+)$/, async (ctx) => {
  const t = TARIFF_PLANS[ctx.match[1]];
  if (!t) return;
  SettingsRepository.setState(ctx.from.id, 'WAIT_RECEIPT', t.id);
  await ctx.editMessageText(`💳 <b>Оплата тарифа: ${t.title} (${t.priceRub} ₽)</b>\n\nПереведите <b>${t.priceRub} ₽</b> на карту:\n💳 <code>${CONFIG.PAYMENT_CARD_NUMBER}</code>\n<i>(нажмите чтобы скопировать)</i>\n\nПосле оплаты <b>отправьте скриншот чека прямо сюда в чат</b>.`, { parse_mode: 'HTML' });
});

userHandlers.on(['message:photo', 'message:text'], async (ctx, next) => {
  const st = SettingsRepository.getState(ctx.from.id);
  if (!st || st.action !== 'WAIT_RECEIPT') return next();
  const t = TARIFF_PLANS[st.metadata || '1_MONTH'];
  const u = UserRepository.getOrCreate(ctx.from.id, ctx.from.first_name, ctx.from.username);
  let fId = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1].file_id : undefined;
  const payId = PaymentRepository.create(u.id, t.id, t.priceRub, fId, ctx.message.caption || ctx.message.text);
  SettingsRepository.clearState(ctx.from.id);
  await ctx.reply('✅ <b>Чек отправлен администратору на проверку!</b> Подписка включится сразу после подтверждения.', { parse_mode: 'HTML' });
  for (const aId of CONFIG.ADMIN_IDS) {
    try {
      const msg = `🔔 <b>Новая оплата #${payId}</b>\nОт: ${u.firstName} (@${u.username || 'нет'})\nТариф: <b>${t.title} (${t.priceRub} ₽)</b>`;
      if (fId) await ctx.api.sendPhoto(aId, fId, { caption: msg, parse_mode: 'HTML', reply_markup: Keyboards.adminPay(payId) });
      else await ctx.api.sendMessage(aId, msg, { parse_mode: 'HTML', reply_markup: Keyboards.adminPay(payId) });
    } catch {}
  }
});

userHandlers.callbackQuery(/^menu:recent:(\d+)$/, async (ctx) => {
  const offset = parseInt(ctx.match[1], 10);
  const items = ListingRepository.getRecent(1, offset);
  if (items.length === 0) return ctx.editMessageText('Пока нет найденных авто. Бот собирает их в реальном времени.', { reply_markup: Keyboards.mainMenu(CONFIG.isAdmin(ctx.from.id), false) });
  const c = items[0];
  await ctx.editMessageText(`🚘 <b>${c.make} ${c.model} (${c.year})</b>\n💰 Цена: <b>${c.price.toLocaleString('ru-RU')} ₽</b>\n📍 Город: ${c.city}\n\n🔗 <a href="${c.url}">Открыть на Авито</a>`, { parse_mode: 'HTML', reply_markup: Keyboards.mainMenu(CONFIG.isAdmin(ctx.from.id), false) });
});
