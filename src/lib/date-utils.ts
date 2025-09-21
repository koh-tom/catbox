import { differenceInCalendarDays } from 'date-fns';

export function getRelativeDateLabel(dateStr: string): string {
  if (!dateStr) return '';

  const parts = dateStr.split('/');
  if (parts.length !== 2) return '';

  const month = Number.parseInt(parts[0], 10);
  const day = Number.parseInt(parts[1], 10);
  const now = new Date();
  const currentYear = now.getFullYear();

  const targetDate = new Date(currentYear, month - 1, day);
  
  const diff = differenceInCalendarDays(targetDate, now);

  if (diff === 0) return '今日';
  if (diff === 1) return '明日';
  if (diff > 1) return `あと${diff}日`;
  if (diff < 0) return `${Math.abs(diff)}日遅れ`;

  return '';
}

export function getRelativeDateColor(dateStr: string): string {
    const label = getRelativeDateLabel(dateStr);
    if (!label) return '';
    if (label.includes('遅れ')) return 'text-red-500 font-bold';
    if (label === '今日') return 'text-orange-500 font-bold';
    if (label === '明日') return 'text-green-600';
    return 'text-muted-foreground';
}
