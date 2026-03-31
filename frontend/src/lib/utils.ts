import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateWorkingDays(fromDate: Date, toDate: Date, workingDays: string[], holidays: Date[]): number {
  let count = 0;
  const current = new Date(fromDate);
  const end = new Date(toDate);
  const holidayStrings = holidays.map(h => h.toDateString());

  while (current <= end) {
    const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = current.toDateString();

    if (workingDays.includes(dayName) && !holidayStrings.includes(dateStr)) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}
