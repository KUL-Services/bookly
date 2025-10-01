// Timezone utilities for Africa/Cairo (UTC+3) display and UTC storage

export const CAIRO_TIMEZONE = 'Africa/Cairo'
export const CAIRO_UTC_OFFSET = 3 * 60 * 60 * 1000 // 3 hours in milliseconds

/**
 * Convert a date from Cairo local time to UTC
 */
export function cairoToUTC(date: Date): Date {
  const utcDate = new Date(date.getTime() - CAIRO_UTC_OFFSET)
  return utcDate
}

/**
 * Convert a date from UTC to Cairo local time
 */
export function utcToCairo(date: Date): Date {
  const cairoDate = new Date(date.getTime() + CAIRO_UTC_OFFSET)
  return cairoDate
}

/**
 * Format a UTC date to Cairo local time string
 */
export function formatCairoTime(utcDate: Date): string {
  const cairoDate = utcToCairo(utcDate)
  return cairoDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Format a UTC date to Cairo local date string
 */
export function formatCairoDate(utcDate: Date): string {
  const cairoDate = utcToCairo(utcDate)
  return cairoDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Combine date and time string to create UTC timestamp
 * @param date - The date in YYYY-MM-DD format
 * @param time - The time in HH:mm format (Cairo time)
 * @returns ISO string in UTC
 */
export function combineDateTimeToUTC(date: string, time: string): string {
  // Parse the date and time in Cairo timezone
  const [hours, minutes] = time.split(':').map(Number)
  const cairoDate = new Date(`${date}T${time}:00`)

  // Convert to UTC
  const utcDate = cairoToUTC(cairoDate)
  return utcDate.toISOString()
}
