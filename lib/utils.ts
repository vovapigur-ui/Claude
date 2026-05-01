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

export function getDayOfWeek(dateStr: string): number {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, day).getDay();
}

export function getDayName(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[getDayOfWeek(dateStr)];
}

export function formatDate(dateStr: string): string {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const [, m, day] = dateStr.split('-').map(Number);
  return `${m}/${day}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

export function calculateCompletionPercent(
  meals: { [key: string]: boolean },
  habits: { [key: string]: boolean },
  workoutCompleted: boolean
): number {
  const mealCount = Object.values(meals).filter(Boolean).length;
  const habitCount = Object.values(habits).filter(Boolean).length;
  const total = mealCount + habitCount + (workoutCompleted ? 1 : 0);
  return Math.round((total / 12) * 100);
}

export function getWeekNumber(startDateStr: string): 1 | 2 {
  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const today = new Date();
  const diffDays = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
  return ((Math.floor(diffDays / 7) % 2) + 1) as 1 | 2;
}

export function sevenDayAverage(
  logs: { date: string; weight: number | null }[]
): number | null {
  const withWeight = logs
    .filter((l) => l.weight !== null)
    .slice(-7)
    .map((l) => l.weight as number);
  if (withWeight.length === 0) return null;
  return withWeight.reduce((a, b) => a + b, 0) / withWeight.length;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
