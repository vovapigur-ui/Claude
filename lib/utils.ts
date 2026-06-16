export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, day] = dateStr.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Whole days from today to dateStr. Negative = in the past (overdue). */
export function daysUntil(dateStr: string): number {
  const [y, m, day] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, day).getTime();
  const t = todayStr().split('-').map(Number);
  const now = new Date(t[0], t[1] - 1, t[2]).getTime();
  return Math.round((target - now) / 86400000);
}

/** Whole days since dateStr (positive = in the past). */
export function daysSince(dateStr: string): number {
  return -daysUntil(dateStr);
}

export function formatDate(dateStr: string): string {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** "in 3d", "today", "2d ago" style relative label. */
export function relativeDateLabel(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d === -1) return 'yesterday';
  if (d > 0) return `in ${d}d`;
  return `${-d}d ago`;
}

export function formatPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)}M`;
  return `$${Math.round(n / 1000)}K`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
