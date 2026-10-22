/**
 * Date manipulation and formatting utilities for StudySOS
 */

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayDateString(refDate: Date = new Date()): string {
  const year = refDate.getFullYear();
  const month = pad2(refDate.getMonth() + 1);
  const day = pad2(refDate.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Combines YYYY-MM-DD and HH:mm into a valid Date object.
 * Returns null if invalid.
 */
export function parseDueDateTime(dateStr: string, timeStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const time = timeStr && timeStr.trim().length > 0 ? timeStr.trim() : '23:59';
  const isoString = `${dateStr}T${time}:00`;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Formats a date string (YYYY-MM-DD) into human-readable text
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formats time (HH:mm) into 12-hour or standard format
 */
export function formatFriendlyTime(timeStr?: string | null): string {
  if (!timeStr) return '11:59 PM';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  return `${displayHours}:${pad2(m)} ${period}`;
}

/**
 * Add minutes to a Date object, returns a new Date
 */
export function addMinutesToDate(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Formats a Date object to HH:mm string
 */
export function formatHoursMinutes(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Returns human-readable relative time string from due date
 */
export function getRelativeDueDescription(dueDate: string, dueTime?: string, refDate: Date = new Date()): string {
  const due = parseDueDateTime(dueDate, dueTime);
  if (!due) return 'No due date';

  const diffMs = due.getTime() - refDate.getTime();
  const absMs = Math.abs(diffMs);
  const hours = Math.round(absMs / (1000 * 60 * 60));
  const days = Math.round(absMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    if (hours < 1) return 'Overdue (just now)';
    if (hours < 24) return `Overdue by ${hours}h`;
    return `Overdue by ${days}d`;
  }

  if (hours < 1) {
    const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return `Due in ${mins}m`;
  }
  if (hours < 24) return `Due in ${hours}h`;
  if (days === 1) return 'Due tomorrow';
  if (days <= 7) return `Due in ${days} days`;
  return `Due ${formatFriendlyDate(dueDate)}`;
}
