import { format, formatDistanceToNow, isToday, isTomorrow, addDays, startOfDay } from 'date-fns'

export function formatDate(date: string | Date | null): string {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatScheduledDate(date: string | null): string {
  if (!date) return 'Not scheduled'
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'EEE, MMM d')
}

export function getNextNDays(n: number): Date[] {
  const today = startOfDay(new Date())
  return Array.from({ length: n }, (_, i) => addDays(today, i))
}
