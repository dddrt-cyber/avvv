import { initDatabase } from './database';
import { CarWatcher } from './scheduler/carWatcher';
import { setupBot } from './bot';
import { Logger } from './utils/logger';
import http from "http";

http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
  })
  .listen(process.env.PORT || 3000);
async function main() {
  Logger.info('Запуск бота...');
  initDatabase();
  const bot = setupBot();
  const watcher = new CarWatcher(bot);
  watcher.start();
  bot.start({ onStart: (info) => Logger.info(`Бот работает: @${info.username}`) });
}
main();
