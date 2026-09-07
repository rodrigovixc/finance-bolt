/**
 * Helpers para trabalhar com datas no formato 'YYYY-MM-DD' usado pela coluna
 * `date` (DATE) do Postgres. Evita `new Date(string)`, que interpreta a data
 * como UTC e desloca o dia no fuso do Brasil.
 */

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatISODate(value: string): string {
  return fromISODate(value).toLocaleDateString('pt-BR');
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffInDays(startISO: string, endISO: string): number {
  const ms = fromISODate(endISO).getTime() - fromISODate(startISO).getTime();
  return Math.round(ms / 86400000) + 1;
}

export interface Period {
  start: string;
  end: string;
}

export function currentMonth(reference = new Date()): Period {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

export function previousMonth(reference = new Date()): Period {
  return currentMonth(new Date(reference.getFullYear(), reference.getMonth() - 1, 1));
}

export function lastDays(days: number, reference = new Date()): Period {
  return { start: toISODate(addDays(reference, -(days - 1))), end: toISODate(reference) };
}

/**
 * Período imediatamente anterior, com a mesma duração — usado para comparar
 * a evolução dos gastos entre um fechamento e o anterior.
 */
export function precedingPeriod(period: Period): Period {
  const length = diffInDays(period.start, period.end);
  const end = addDays(fromISODate(period.start), -1);
  return { start: toISODate(addDays(end, -(length - 1))), end: toISODate(end) };
}

/**
 * Ciclo da fatura de um cartão a partir do dia de vencimento: fecha no dia
 * anterior ao vencimento e abre no vencimento do mês anterior.
 */
export function cardCycle(dueDay: number, reference = new Date()): Period {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const clamp = (y: number, m: number) => Math.min(dueDay, new Date(y, m + 1, 0).getDate());

  const currentDue = new Date(year, month, clamp(year, month));
  const open = reference >= currentDue
    ? currentDue
    : new Date(year, month - 1, clamp(year, month - 1));
  const close = new Date(open.getFullYear(), open.getMonth() + 1, clamp(open.getFullYear(), open.getMonth() + 1));

  return { start: toISODate(open), end: toISODate(addDays(close, -1)) };
}
