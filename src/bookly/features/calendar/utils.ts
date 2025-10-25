import { mockStaff, mockBusinesses } from '@/bookly/data/mock-data'
import type { Booking } from '@/bookly/data/types'
import type {
  CalendarEvent,
  ColorScheme,
  BranchFilter,
  HighlightFilters,
  StaffFilter,
  DateRange,
  AppointmentStatus,
  PaymentStatus,
  SelectionMethod
} from './types'

/**
 * Parse 12-hour time format to hours and minutes
 * @example parseTime12h('3:00 PM') => { hours: 15, minutes: 0 }
 */
export function parseTime12h(time: string): { hours: number; minutes: number } {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return { hours: 9, minutes: 0 }

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridiem = match[3].toUpperCase()

  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0

  return { hours, minutes }
}

/**
 * Map booking status to appointment status
 */
function mapBookingStatus(status: string): AppointmentStatus {
  const statusMap: Record<string, AppointmentStatus> = {
    confirmed: 'confirmed',
    pending: 'pending',
    completed: 'completed',
    cancelled: 'cancelled'
  }
  return (statusMap[status] as AppointmentStatus) || 'pending'
}

/**
 * Generate random payment status and selection method for demo
 */
function generateExtendedProps(booking: Booking, staffId: string) {
  const random = Math.random()

  return {
    status: mapBookingStatus(booking.status),
    paymentStatus: (random > 0.3 ? 'paid' : 'unpaid') as PaymentStatus,
    staffId,
    staffName: booking.staffMemberName,
    selectionMethod: (random > 0.5 ? 'by_client' : 'automatically') as SelectionMethod,
    starred: random > 0.8,
    serviceName: booking.serviceName,
    customerName: booking.notes?.split(' ')[0] || 'Guest',
    price: booking.price,
    notes: booking.notes,
    bookingId: booking.id
  }
}

/**
 * Map a booking to a calendar event
 */
export function mapBookingToEvent(booking: Booking, staffId: string = '1', starredIds: Set<string> = new Set()): CalendarEvent {
  const date = new Date(booking.date)
  const { hours, minutes } = parseTime12h(booking.time)
  date.setHours(hours, minutes, 0, 0)

  const endDate = new Date(date.getTime() + booking.duration * 60 * 1000)

  const extendedProps = generateExtendedProps(booking, staffId)

  // Override starred if in starredIds set
  if (starredIds.has(booking.id)) {
    extendedProps.starred = true
  }

  return {
    id: booking.id,
    title: `${booking.serviceName}`,
    start: date,
    end: endDate,
    extendedProps
  }
}

/**
 * Color schemes for events
 */
export const colorSchemes = {
  vivid: {
    confirmed: { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
    pending: { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
    completed: { bg: '#9ca3af', border: '#6b7280', text: '#ffffff' },
    cancelled: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
    need_confirm: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },
    no_show: { bg: '#f43f5e', border: '#e11d48', text: '#ffffff' }
  },
  pastel: {
    confirmed: { bg: '#93c5fd', border: '#60a5fa', text: '#1e3a8a' },
    pending: { bg: '#fcd34d', border: '#fbbf24', text: '#78350f' },
    completed: { bg: '#d1d5db', border: '#9ca3af', text: '#1f2937' },
    cancelled: { bg: '#fca5a5', border: '#f87171', text: '#7f1d1d' },
    need_confirm: { bg: '#86efac', border: '#4ade80', text: '#14532d' },
    no_show: { bg: '#fda4af', border: '#fb7185', text: '#881337' }
  }
}

/**
 * Build event colors based on color scheme
 */
export function buildEventColors(colorScheme: ColorScheme, status: AppointmentStatus) {
  const scheme = colorSchemes[colorScheme]
  const colors = scheme[status] || scheme.pending
  return colors
}

/**
 * Get event class names based on highlights
 */
export function getEventClassNames(
  event: CalendarEvent,
  colorScheme: ColorScheme,
  highlights: HighlightFilters
): string[] {
  const classes: string[] = ['bookly-calendar-event']

  const props = event.extendedProps

  // Apply highlight classes
  if (highlights.payments.length > 0 && highlights.payments.includes(props.paymentStatus)) {
    classes.push(`payment-${props.paymentStatus}`)
  }

  if (highlights.statuses.length > 0 && highlights.statuses.includes(props.status)) {
    classes.push(`status-${props.status}`)
  }

  if (highlights.selection.length > 0 && highlights.selection.includes(props.selectionMethod)) {
    classes.push(`selection-${props.selectionMethod}`)
  }

  if (highlights.details.includes('starred') && props.starred) {
    classes.push('event-starred')
  }

  if (highlights.details.includes('unstarred') && !props.starred) {
    classes.push('event-unstarred')
  }

  classes.push(`scheme-${colorScheme}`)
  classes.push(`status-${props.status}`)

  return classes
}

/**
 * Filter events based on date range, branch filters, staff filters, and highlights
 */
export function filterEvents(
  events: CalendarEvent[],
  filters: {
    range?: DateRange | null
    branchFilters?: BranchFilter
    staffFilters?: StaffFilter
    highlights?: HighlightFilters
  }
): CalendarEvent[] {
  let filtered = [...events]

  // Filter by date range
  if (filters.range) {
    const { start, end } = filters.range
    filtered = filtered.filter(event => {
      const eventStart = new Date(event.start)
      return eventStart >= start && eventStart <= end
    })
  }

  // Filter by branch (affects which staff are considered)
  let validStaffIds: string[] | null = null
  if (filters.branchFilters && !filters.branchFilters.allBranches && filters.branchFilters.branchIds.length > 0) {
    // Get staff IDs from selected branches
    validStaffIds = mockStaff
      .filter(staff => filters.branchFilters!.branchIds.includes(staff.branchId))
      .map(staff => staff.id)

    // Filter events to only include staff from selected branches
    filtered = filtered.filter(event => validStaffIds!.includes(event.extendedProps.staffId))
  }

  // Filter by staff
  if (filters.staffFilters) {
    const { onlyMe, staffIds } = filters.staffFilters

    if (onlyMe) {
      // Filter to current user's events only (staffId '1' for demo)
      filtered = filtered.filter(event => event.extendedProps.staffId === '1')
    } else if (staffIds.length > 0) {
      // If branches are selected, intersection of staff filter and branch filter
      if (validStaffIds !== null) {
        const intersectionIds = staffIds.filter(id => validStaffIds!.includes(id))
        filtered = filtered.filter(event => intersectionIds.includes(event.extendedProps.staffId))
      } else {
        filtered = filtered.filter(event => staffIds.includes(event.extendedProps.staffId))
      }
    }
  }

  // Filter by highlights
  if (filters.highlights) {
    const { payments, statuses, selection, details } = filters.highlights

    if (payments.length > 0) {
      filtered = filtered.filter(event => payments.includes(event.extendedProps.paymentStatus))
    }

    if (statuses.length > 0) {
      filtered = filtered.filter(event => statuses.includes(event.extendedProps.status))
    }

    if (selection.length > 0) {
      filtered = filtered.filter(event => selection.includes(event.extendedProps.selectionMethod))
    }

    if (details.length > 0) {
      if (details.includes('starred') && !details.includes('unstarred')) {
        filtered = filtered.filter(event => event.extendedProps.starred)
      } else if (details.includes('unstarred') && !details.includes('starred')) {
        filtered = filtered.filter(event => !event.extendedProps.starred)
      }
    }
  }

  return filtered
}

/**
 * Format date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = start.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}

/**
 * Get title for current view
 */
export function getViewTitle(view: string, date: Date): string {
  const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dayMonthYear = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  switch (view) {
    case 'dayGridMonth':
      return monthYear
    case 'timeGridDay':
      return dayMonthYear
    case 'timeGridWeek':
    case 'listMonth':
      return monthYear
    default:
      return monthYear
  }
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + weeks * 7)
  return newDate
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + months)
  return newDate
}

/**
 * Get branch name by branch ID
 */
export function getBranchName(branchId: string): string {
  const allBranches = mockBusinesses.flatMap(business => business.branches)
  const branch = allBranches.find(b => b.id === branchId)
  return branch?.name || 'Unknown Branch'
}

/**
 * Get branch by ID
 */
export function getBranch(branchId: string) {
  const allBranches = mockBusinesses.flatMap(business => business.branches)
  return allBranches.find(b => b.id === branchId)
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Parse 24-hour time format to minutes from midnight
 * @example parseTime24h('14:30') => 870
 */
export function parseTime24h(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Get day of week abbreviation from date
 * @example getDayOfWeek(new Date('2025-01-13')) => 'Mon'
 */
export function getDayOfWeek(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[date.getDay()]
}

/**
 * Check if staff member is available on a specific day and time
 */
export function isStaffAvailable(
  staffId: string,
  date: Date,
  startTime: string,
  endTime: string
): { available: boolean; reason?: string } {
  const staff = mockStaff.find(s => s.id === staffId)
  if (!staff) {
    return { available: false, reason: 'Staff member not found' }
  }

  const dayOfWeek = getDayOfWeek(date)
  const schedule = staff.schedule?.find(s => s.dayOfWeek === dayOfWeek)

  if (!schedule) {
    return { available: false, reason: 'No schedule found for this day' }
  }

  if (!schedule.isAvailable) {
    return { available: false, reason: 'Staff member is not working on this day' }
  }

  // Parse times to minutes from midnight
  const requestStart = parseTime24h(startTime)
  const requestEnd = parseTime24h(endTime)
  const scheduleStart = parseTime24h(schedule.startTime)
  const scheduleEnd = parseTime24h(schedule.endTime)

  if (requestStart < scheduleStart || requestEnd > scheduleEnd) {
    return {
      available: false,
      reason: `Staff working hours are ${schedule.startTime} - ${schedule.endTime}`
    }
  }

  return { available: true }
}

/**
 * Check for appointment conflicts (double-bookings)
 */
export function hasConflict(
  events: CalendarEvent[],
  staffId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeEventId?: string
): { conflict: boolean; conflictingEvent?: CalendarEvent } {
  const requestStart = parseTime24h(startTime)
  const requestEnd = parseTime24h(endTime)

  for (const event of events) {
    // Skip the event being edited
    if (excludeEventId && event.id === excludeEventId) continue

    // Only check same staff and same day
    if (event.extendedProps.staffId !== staffId) continue
    if (!isSameDay(new Date(event.start), date)) continue

    // Skip cancelled appointments
    if (event.extendedProps.status === 'cancelled') continue

    // Parse event times
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const eventStartMinutes = eventStart.getHours() * 60 + eventStart.getMinutes()
    const eventEndMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes()

    // Check for overlap
    const hasOverlap =
      (requestStart >= eventStartMinutes && requestStart < eventEndMinutes) ||
      (requestEnd > eventStartMinutes && requestEnd <= eventEndMinutes) ||
      (requestStart <= eventStartMinutes && requestEnd >= eventEndMinutes)

    if (hasOverlap) {
      return { conflict: true, conflictingEvent: event }
    }
  }

  return { conflict: false }
}

/**
 * Generate available time slots for a staff member on a specific date
 */
export function getAvailableTimeSlots(
  events: CalendarEvent[],
  staffId: string,
  date: Date,
  slotDuration: number = 30 // in minutes
): string[] {
  const staff = mockStaff.find(s => s.id === staffId)
  if (!staff) return []

  const dayOfWeek = getDayOfWeek(date)
  const schedule = staff.schedule?.find(s => s.dayOfWeek === dayOfWeek)

  if (!schedule || !schedule.isAvailable) return []

  const scheduleStart = parseTime24h(schedule.startTime)
  const scheduleEnd = parseTime24h(schedule.endTime)

  // Get all booked slots for this staff on this date
  const bookedSlots: Array<{ start: number; end: number }> = []
  for (const event of events) {
    if (event.extendedProps.staffId !== staffId) continue
    if (!isSameDay(new Date(event.start), date)) continue
    if (event.extendedProps.status === 'cancelled') continue

    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    bookedSlots.push({
      start: eventStart.getHours() * 60 + eventStart.getMinutes(),
      end: eventEnd.getHours() * 60 + eventEnd.getMinutes()
    })
  }

  // Generate all possible slots
  const availableSlots: string[] = []
  for (let minutes = scheduleStart; minutes + slotDuration <= scheduleEnd; minutes += slotDuration) {
    const slotEnd = minutes + slotDuration

    // Check if this slot conflicts with any booked slot
    const isBooked = bookedSlots.some(
      booked =>
        (minutes >= booked.start && minutes < booked.end) ||
        (slotEnd > booked.start && slotEnd <= booked.end) ||
        (minutes <= booked.start && slotEnd >= booked.end)
    )

    if (!isBooked) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      availableSlots.push(timeString)
    }
  }

  return availableSlots
}
