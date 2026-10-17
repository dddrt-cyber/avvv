import { Bot } from 'grammy';
import { CONFIG } from '../config';
import { userHandlers } from './handlers/userHandlers';
import { createAdminHandlers } from './handlers/adminHandlers';
export function setupBot(): Bot {
  const bot = new Bot(CONFIG.BOT_TOKEN);
  bot.use(userHandlers);
  bot.use(createAdminHandlers());
  return bot;
}
