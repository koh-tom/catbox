import { differenceInCalendarDays, isValid, parse, startOfToday, addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import type { RecurrenceRule } from '@/types/todo';

export function parseTodoDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;

  const now = startOfToday();

  if (dateStr.includes('-')) {
    const parsed = parse(dateStr, 'yyyy-MM-dd', now);
    if (isValid(parsed)) return parsed;
  }

  return undefined;
}

export function getRelativeDateLabel(dateStr: string): string {
  const targetDate = parseTodoDate(dateStr);
  if (!targetDate) return '';

  const now = startOfToday();
  const diff = differenceInCalendarDays(targetDate, now);

  if (diff === 0) return '今日';
  if (diff === 1) return '明日';
  if (diff > 1) return `あと${diff}日`;
  if (diff < 0) return `${Math.abs(diff)}日遅れ`;

  return '';
}

export function getDeadlineBadgeVariant(dateStr: string): string {
  const targetDate = parseTodoDate(dateStr);
  if (!targetDate) return '';

  const now = startOfToday();
  const diff = differenceInCalendarDays(targetDate, now);

  if (diff < 0) {
    // 期限切れ: 赤
    return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-900';
  }
  if (diff === 0) {
    // 今日: オレンジ
    return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-900';
  }
  if (diff <= 3) {
    // 3日以内: 黄/琥珀
    return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900';
  }

  // 余裕あり: 青/スレート
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}

export function isOverdue(dateStr?: string): boolean {
  const targetDate = parseTodoDate(dateStr);
  if (!targetDate) return false;

  const now = startOfToday();
  return differenceInCalendarDays(targetDate, now) < 0;
}

export function isTodayTask(dateStr?: string): boolean {
  const targetDate = parseTodoDate(dateStr);
  if (!targetDate) return false;

  const now = startOfToday();
  return differenceInCalendarDays(targetDate, now) === 0;
}

export function calcNextRecurrenceDate(deadlineDate?: string, rule?: RecurrenceRule): string | undefined {
  if (!rule) return undefined;

  const baseDate = parseTodoDate(deadlineDate) || startOfToday();
  let nextDate = baseDate;

  switch (rule) {
    case 'daily':
      nextDate = addDays(baseDate, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(baseDate, 1);
      break;
    case 'biweekly':
      nextDate = addWeeks(baseDate, 2);
      break;
    case 'monthly':
      nextDate = addMonths(baseDate, 1);
      break;
    case 'yearly':
      nextDate = addYears(baseDate, 1);
      break;
  }

  return format(nextDate, 'yyyy-MM-dd');
}
