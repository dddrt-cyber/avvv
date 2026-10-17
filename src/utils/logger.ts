export class Logger {
  static info(m: string, c?: unknown) { console.log(`[INFO] [${new Date().toLocaleTimeString()}] ${m}`, c ?? ''); }
  static warn(m: string, c?: unknown) { console.warn(`[WARN] [${new Date().toLocaleTimeString()}] ${m}`, c ?? ''); }
  static error(m: string, e?: unknown) { console.error(`[ERROR] [${new Date().toLocaleTimeString()}] ${m}`, e ?? ''); }
}
