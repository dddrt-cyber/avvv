export class TextFilter {
  private static readonly HARD = [
    { r: /(?:только\s+)?на\s+(?:запчасти|разбор|донор)/i, reason: 'Продажа на запчасти/разбор' },
    { r: /по\s+запчастям/i, reason: 'Продажа по частям' },
    { r: /не\s+на\s+ходу/i, reason: 'Не на ходу' },
    { r: /кузов\s+в\s+хлам/i, reason: 'Кузов уничтожен' },
    { r: /перев[её]ртыш/i, reason: 'Перевертыш' },
    { r: /(?:мотор|двигатель)\s+(?:стуканул|заклинил|разобран)/i, reason: 'Заклинил двигатель' },
    { r: /(?:двигател[яь]|мотор[а]?)\s+нет/i, reason: 'Двигатель отсутствует' },
    { r: /в\s+металлолом|на\s+металл/i, reason: 'Металлолом' },
    { r: /после\s+(?:сильного|тяж[её]лого|лобового)\s+дтп/i, reason: 'Тяжелое ДТП' },
  ];
  private static readonly NEG = [/не\s+на\s+запчасти/i, /не\s+в\s+разбор/i, /на\s+полном\s+ходу/i];
  private static readonly MINOR = [{ r: /косметик|прит[её]ртость|царапин|жучки/i, issue: 'Косметические нюансы' }];
  static analyze(text: string) {
    const norm = text.replace(/[\r\n]+/g, ' ').toLowerCase();
    const reasons: string[] = [];
    const issues: string[] = [];
    for (const h of this.HARD) {
      if (h.r.test(norm) && !this.NEG.some(n => n.test(norm))) reasons.push(h.reason);
    }
    if (reasons.length === 0) {
      for (const m of this.MINOR) { if (m.r.test(norm)) issues.push(m.issue); }
    }
    return { isHardRejected: reasons.length > 0, reasons, hasMinorIssues: issues.length > 0, minorIssues: issues };
  }
}
