// Utility to generate .ics calendar files for bookings

export interface ICSEvent {
  title: string
  description?: string
  location?: string
  startTime: Date
  endTime: Date
  organizer?: {
    name: string
    email: string
  }
}

/**
 * Format a date to ICS format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Generate ICS file content
 */
export function generateICS(event: ICSEvent): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bookly//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@bookly.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(event.startTime)}`,
    `DTEND:${formatICSDate(event.endTime)}`,
    `SUMMARY:${event.title}`
  ]

  if (event.description) {
    lines.push(`DESCRIPTION:${event.description}`)
  }

  if (event.location) {
    lines.push(`LOCATION:${event.location}`)
  }

  if (event.organizer) {
    lines.push(`ORGANIZER;CN=${event.organizer.name}:mailto:${event.organizer.email}`)
  }

  lines.push('STATUS:CONFIRMED', 'SEQUENCE:0', 'END:VEVENT', 'END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Download ICS file
 */
export function downloadICS(event: ICSEvent, filename: string = 'booking.ics'): void {
  const icsContent = generateICS(event)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
