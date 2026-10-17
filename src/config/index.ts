import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
function getEnv(k: string, d = '') { return process.env[k] || d; }
const rawAdmins = getEnv('ADMIN_IDS', getEnv('ADMIN_ID', '6302785296'));
const adminList = rawAdmins.split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
export const CONFIG = {
  BOT_TOKEN: getEnv('BOT_TOKEN', '8957649777:AAGr3o0MY7J_A8HpOWY82qhUiQC6hEqDy4M'),
  ADMIN_ID: adminList[0] || 6302785296,
  ADMIN_IDS: adminList,
  isAdmin: (id?: number) => Boolean(id && adminList.includes(id)),
  PAYMENT_CARD_NUMBER: getEnv('PAYMENT_CARD_NUMBER', '2204320364512683'),
  DATABASE_PATH: getEnv('DATABASE_PATH', path.join(process.cwd(), 'data', 'bot.sqlite')),
  CHECK_INTERVAL_SEC: parseInt(getEnv('CHECK_INTERVAL_SEC', '180'), 10),
  MAX_ITEMS_PER_CHECK: parseInt(getEnv('MAX_ITEMS_PER_CHECK', '30'), 10),
  OPENAI_API_KEY: getEnv('OPENAI_API_KEY', ''),
  ENABLE_VISION_FILTER: getEnv('ENABLE_VISION_FILTER', 'false') === 'true',
};
