// Third-party Imports
import type { EventInput } from '@fullcalendar/core'

// Data Imports
import { mockBookings } from '@/bookly/data/mock-data'

const parseTime = (date: Date, time: string) => {
  const [timePart, period] = time.split(' ')
  const [hourStr, minuteStr] = timePart.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)
  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0
  const result = new Date(date)
  result.setHours(hour, minute, 0, 0)
  return result
}

export const events: EventInput[] = mockBookings.map((booking, index) => {
  const start = parseTime(booking.date, booking.time)
  const end = new Date(start.getTime() + booking.duration * 60000)
  return {
    id: `${index + 1}`,
    url: '',
    title: booking.serviceName,
    start,
    end,
    allDay: false,
    extendedProps: {
      calendar: booking.status
    }
  }
})
