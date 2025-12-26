import { mockStaff, mockBusinesses, mockServices } from '@/bookly/data/mock-data'
import { mockTimeOffRequests } from '@/bookly/data/staff-management-mock-data'
import type { Booking } from '@/bookly/data/types'
import type {
  CalendarEvent,
  ColorScheme,
  BranchFilter,
  HighlightFilters,
  StaffFilter,
  RoomFilter,
  DateRange,
  AppointmentStatus,
  PaymentStatus,
  SelectionMethod,
  SchedulingMode
} from './types'

const getDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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
    bookingId: booking.id,
    slotId: booking.slotId,
    roomId: booking.roomId,
    partySize: booking.partySize
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
    confirmed: { bg: '#51b4b7', border: '#3d9598', text: '#f7f8f9' },
    pending: { bg: '#202c39', border: '#141c27', text: '#f7f8f9' },
    completed: { bg: '#77b6a3', border: '#5a9a87', text: '#0a2c24' },
    cancelled: { bg: '#e88682', border: '#d56560', text: '#0a2c24' },
    need_confirm: { bg: '#0a2c24', border: '#051612', text: '#f7f8f9' },
    no_show: { bg: '#3d4a5a', border: '#202c39', text: '#f7f8f9' }
  },
  pastel: {
    confirmed: { bg: 'rgba(81, 180, 183, 0.2)', border: '#51b4b7', text: '#0a2c24' },
    pending: { bg: 'rgba(32, 44, 57, 0.18)', border: '#202c39', text: '#0a2c24' },
    completed: { bg: 'rgba(119, 182, 163, 0.2)', border: '#77b6a3', text: '#0a2c24' },
    cancelled: { bg: 'rgba(232, 134, 130, 0.2)', border: '#e88682', text: '#0a2c24' },
    need_confirm: { bg: 'rgba(10, 44, 36, 0.2)', border: '#0a2c24', text: '#0a2c24' },
    no_show: { bg: 'rgba(61, 74, 90, 0.18)', border: '#3d4a5a', text: '#0a2c24' }
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
 * Filter events based on date range, branch filters, staff filters, room filters, and highlights
 */
export function filterEvents(
  events: CalendarEvent[],
  filters: {
    range?: DateRange | null
    branchFilters?: BranchFilter
    staffFilters?: StaffFilter
    roomFilters?: RoomFilter
    highlights?: HighlightFilters
    schedulingMode?: SchedulingMode
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
    filtered = filtered.filter(event => {
      const eventBranchId = event.extendedProps.branchId
      if (eventBranchId && filters.branchFilters!.branchIds.includes(eventBranchId)) return true
      return validStaffIds!.includes(event.extendedProps.staffId)
    })
  }

  // Filter by staff (only in dynamic mode)
  if (filters.staffFilters && filters.schedulingMode !== 'static') {
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

  // Filter by room (only in static mode)
  if (filters.roomFilters && filters.schedulingMode === 'static') {
    const { allRooms, roomIds } = filters.roomFilters

    if (!allRooms && roomIds.length > 0) {
      filtered = filtered.filter(event =>
        event.extendedProps.roomId && roomIds.includes(event.extendedProps.roomId)
      )
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

/**
 * Get service duration by service ID
 * @param serviceId - The ID of the service
 * @returns Duration in minutes, or null if not found
 */
export function getServiceDuration(serviceId: string): number | null {
  const service = mockServices.find(s => s.id === serviceId)
  return service?.duration ?? null
}

/**
 * Get service by service ID
 * @param serviceId - The ID of the service
 * @returns Service object or null if not found
 */
export function getService(serviceId: string) {
  return mockServices.find(s => s.id === serviceId) || null
}

/**
 * Get slots for a specific date from static service slots
 * @param slots - Array of static service slots
 * @param branchId - Branch ID to filter by
 * @param date - Date to get slots for
 * @returns Array of matching slots
 */
export function getSlotsForDate(
  slots: import('./types').StaticServiceSlot[],
  branchId: string,
  date: Date
): import('./types').StaticServiceSlot[] {
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()] as import('./types').DayOfWeek
  const dateStr = getDateKey(date)

  return slots.filter(slot => {
    if (slot.branchId !== branchId) return false

    const matchesDayOfWeek = slot.dayOfWeek === dayOfWeek
    const matchesDate = slot.date === dateStr

    if (!matchesDayOfWeek && !matchesDate) return false

    // STRICT CONFLICT CHECK: Check if instructor is on Time Off
    if (slot.instructorStaffId) {
      // Parse slot times
      const [slotStartH, slotStartM] = slot.startTime.split(':').map(Number)
      const [slotEndH, slotEndM] = slot.endTime.split(':').map(Number)
      const slotStartMins = slotStartH * 60 + slotStartM
      const slotEndMins = slotEndH * 60 + slotEndM

      const hasConflict = mockTimeOffRequests.some(req => {
        if (req.staffId !== slot.instructorStaffId) return false
        if (!req.approved) return false

        // Check if Time Off covers this date
        const reqStart = new Date(req.range.start)
        const reqEnd = new Date(req.range.end)
        
        const currentRefDate = new Date(date) // Use the passed date
        currentRefDate.setHours(0,0,0,0) // Normalize to start of day for date comparison
        
        const reqStartDay = new Date(reqStart)
        reqStartDay.setHours(0,0,0,0)
        
        const reqEndDay = new Date(reqEnd)
        reqEndDay.setHours(0,0,0,0)
        
        // If the date is outside the broad range, no conflict
        if (currentRefDate < reqStartDay || currentRefDate > reqEndDay) return false

        // If All Day, it conflicts
        if (req.allDay) return true

        // If partial day, strict time check required
        // Note: Time Off Requests in mock data use Date objects which include time
        // We need to check if the specific day aligns, which we did. 
        // Now check if the *time* on this specific day overlaps.
        // Simplified: assuming multi-day partial time off isn't the main case or handled as allDay.
        // Handling single-day partial time off:
        if (reqStartDay.getTime() === reqEndDay.getTime()) {
           const reqStartMins = reqStart.getHours() * 60 + reqStart.getMinutes()
           const reqEndMins = reqEnd.getHours() * 60 + reqEnd.getMinutes()
           return (slotStartMins < reqEndMins && slotEndMins > reqStartMins)
        }
        
        // Multi-day partial is ambiguous in this simple scan, default to blocking if dates overlap
        return true
      })

      if (hasConflict) return false
    }

    return true
  })
}

/**
 * Get slot capacity by slot ID
 * @param slots - Array of static service slots
 * @param slotId - Slot ID
 * @returns Capacity number or 0 if not found
 */
export function getSlotCapacity(slots: import('./types').StaticServiceSlot[], slotId: string): number {
  const slot = slots.find(s => s.id === slotId)
  return slot?.capacity || 0
}

/**
 * Count slot occupancy (excluding cancelled bookings)
 * @param events - Array of calendar events
 * @param slotId - Slot ID
 * @param date - Date to check
 * @returns Number of occupied spots
 */
export function countSlotOccupancy(
  events: import('./types').CalendarEvent[],
  slotId: string,
  date: Date
): number {
  const dateStr = getDateKey(date)

  const bookings = events.filter(event => {
    const eventDateStr = getDateKey(new Date(event.start))
    return (
      event.extendedProps.slotId === slotId &&
      eventDateStr === dateStr &&
      event.extendedProps.status !== 'cancelled'
    )
  })

  // Sum up party sizes (default to 1 if not specified)
  return bookings.reduce((sum, event) => {
    return sum + (event.extendedProps.partySize || 1)
  }, 0)
}

/**
 * Get remaining capacity for a slot
 * @param events - Array of calendar events
 * @param slots - Array of static service slots
 * @param slotId - Slot ID
 * @param date - Date to check
 * @returns Object with remaining capacity and total capacity
 */
export function getSlotRemaining(
  events: import('./types').CalendarEvent[],
  slots: import('./types').StaticServiceSlot[],
  slotId: string,
  date: Date
): { remaining: number; total: number; occupied: number } {
  const capacity = getSlotCapacity(slots, slotId)
  const occupied = countSlotOccupancy(events, slotId, date)
  const remaining = Math.max(0, capacity - occupied)

  return { remaining, total: capacity, occupied }
}

/**
 * TWO-LAYER GROUPING FOR STAFF
 * Layer 1: Separates Staff from Rooms
 * Layer 2: Separates staff by type (Dynamic/Static), and static staff further by room
 *
 * Returns:
 * - dynamic: Dynamic staff (no fixed room)
 * - static: All static staff with room assignments
 * - staticByRoom: Static staff grouped by assigned room name
 */
export function groupStaffByType(staff: typeof mockStaff) {
  const dynamic = staff.filter(s => s.staffType !== 'static' || !s.roomAssignments?.length)
  const staticStaff = staff.filter(s => s.staffType === 'static' && s.roomAssignments?.length)

  // Layer 2: Group static staff by room
  const staticByRoom: Record<string, typeof staff> = {}
  staticStaff.forEach(s => {
    const roomName = s.roomAssignments?.[0]?.roomName || 'Unassigned'
    if (!staticByRoom[roomName]) {
      staticByRoom[roomName] = []
    }
    staticByRoom[roomName].push(s)
  })

  return {
    // Layer 1 + Layer 2 Structure
    dynamic, // Layer 2: Dynamic staff
    static: staticStaff, // Layer 2: All static staff
    staticByRoom, // Layer 2: Static staff grouped by room name
    allStaff: staff // Complete list for reference
  }
}

/**
 * Group staff by type AND assignment status (4 categories)
 * Creates a comprehensive grouping structure for calendar display:
 * 1. Dynamic Unassigned - flexible booking, no room assignment
 * 2. Dynamic Assigned - flexible booking, from specific workspace(s)
 * 3. Static Unassigned - fixed slot scheduling, no room assignment (pool/flexible location)
 * 4. Static Assigned - fixed slot scheduling, assigned to specific room(s)
 */
export function groupStaffByTypeAndAssignment(staff: typeof mockStaff) {
  // Category 1: Dynamic unassigned (flexible booking, no room assignment)
  const dynamicUnassigned = staff.filter(
    s => s.staffType !== 'static' && (!s.roomAssignments || s.roomAssignments.length === 0)
  )

  // Category 2: Dynamic assigned (flexible booking, with room assignment(s))
  const dynamicAssigned = staff.filter(
    s => s.staffType !== 'static' && s.roomAssignments && s.roomAssignments.length > 0
  )

  // Category 3: Static unassigned (fixed slots, no room assignment)
  const staticUnassigned = staff.filter(
    s => s.staffType === 'static' && (!s.roomAssignments || s.roomAssignments.length === 0)
  )

  // Category 4: Static assigned (fixed slots, with room assignment(s))
  const staticAssigned = staff.filter(
    s => s.staffType === 'static' && s.roomAssignments && s.roomAssignments.length > 0
  )

  // Group assigned static staff by room for secondary grouping
  const staticAssignedByRoom: Record<string, typeof staff> = {}
  staticAssigned.forEach(s => {
    const roomName = s.roomAssignments?.[0]?.roomName || 'Unassigned'
    if (!staticAssignedByRoom[roomName]) {
      staticAssignedByRoom[roomName] = []
    }
    staticAssignedByRoom[roomName].push(s)
  })

  return {
    // 4 Primary Categories
    dynamicUnassigned,  // Flexible staff without room assignments
    dynamicAssigned,    // Flexible staff with room assignments
    staticUnassigned,   // Fixed slot staff without room assignments
    staticAssigned,     // Fixed slot staff with room assignments

    // Secondary grouping for assigned staff
    staticAssignedByRoom, // Static assigned staff grouped by room

    // Convenience groupings
    allDynamic: [...dynamicUnassigned, ...dynamicAssigned],
    allStatic: [...staticUnassigned, ...staticAssigned],
    allAssigned: [...dynamicAssigned, ...staticAssigned],
    allUnassigned: [...dynamicUnassigned, ...staticUnassigned],
    allStaff: staff
  }
}

/**
 * Group static staff assignments by room
 */
export function groupStaticStaffByRoom(staff: typeof mockStaff) {
  const staffByRoom: Record<string, typeof staff> = {}

  staff.forEach(s => {
    if (s.staffType === 'static' && s.roomAssignments?.length) {
      s.roomAssignments.forEach(assignment => {
        const key = assignment.roomName
        if (!staffByRoom[key]) {
          staffByRoom[key] = []
        }
        staffByRoom[key].push(s)
      })
    }
  })

  return staffByRoom
}

/**
 * Get staff capacity (max concurrent bookings) for a specific shift
 */
export function getStaffShiftCapacity(
  staffId: string,
  workingHours: Record<string, any>
): number {
  const staff = mockStaff.find(s => s.id === staffId)
  if (!staff) return 1

  return staff.maxConcurrentBookings || 1
}

/**
 * Check if staff is working at a specific time on a given date
 */
export function isStaffWorkingAtTime(
  staffId: string,
  date: Date,
  time: string,
  workingHours: Record<string, any>
): boolean {
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
  const schedule = workingHours[staffId]?.[dayOfWeek]

  if (!schedule || !schedule.isWorking) return false

  const [hours, minutes] = time.split(':').map(Number)
  const timeInMinutes = hours * 60 + minutes

  return schedule.shifts?.some((shift: any) => {
    const [startH, startM] = shift.start.split(':').map(Number)
    const [endH, endM] = shift.end.split(':').map(Number)
    const startMins = startH * 60 + startM
    const endMins = endH * 60 + endM

    return timeInMinutes >= startMins && timeInMinutes < endMins
  })
}

/**
 * Get room type categorization with counts
 */
export function categorizeRooms(rooms: any[]) {
  return {
    fixed: rooms.filter(r => r.roomType === 'static' || r.roomType === 'fixed'),
    flexible: rooms.filter(r => r.roomType === 'dynamic' || r.roomType === 'flexible'),
    unspecified: rooms.filter(r => !r.roomType)
  }
}

/**
 * Get available capacity for dynamic staff at a specific time
 * Dynamic staff capacity is booking-based (maxConcurrentBookings)
 * @param staffId - Staff member ID
 * @param time - Current time or check time
 * @param bookings - Array of all bookings
 * @returns Available capacity (remaining slots) or null if not dynamic staff
 */
export function getStaffAvailableCapacity(staffId: string, time: Date, bookings: Booking[]): number | null {
  const staff = mockStaff.find(s => s.id === staffId)
  if (!staff || staff.staffType !== 'dynamic') return null

  const maxCapacity = staff.maxConcurrentBookings || 1

  // Count how many bookings this staff has at this time
  const bookingsAtTime = bookings.filter(booking => {
    if (booking.staffMemberName !== staff.name) return false

    const bookingStart = new Date(booking.date)
    const { hours, minutes } = parseTime12h(booking.time)
    bookingStart.setHours(hours, minutes, 0, 0)

    const bookingEnd = new Date(bookingStart)
    bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.duration)

    return bookingStart <= time && time < bookingEnd
  }).length

  return Math.max(0, maxCapacity - bookingsAtTime)
}

/**
 * Get capacity color based on available slots
 * @param availableCapacity - Number of available slots
 * @returns Color code: 'error' (red, 0), 'warning' (yellow, 1), or 'success' (green, 2+)
 */
export function getCapacityColor(availableCapacity: number | null): 'error' | 'warning' | 'success' {
  if (availableCapacity === 0) return 'error'
  if (availableCapacity === 1) return 'warning'
  return 'success'
}

/**
 * Check if a specific time slot is available for booking
 * For runtime availability checking against bookings
 * @param resourceId - Staff ID or Room ID
 * @param date - Date to check
 * @param timeSlot - Time slot in "HH:MM" format
 * @param duration - Duration in minutes
 * @param bookings - Array of all bookings
 * @returns Whether the slot is available
 */
export function checkSlotAvailabilityByTime(
  resourceId: string,
  date: Date,
  timeSlot: string,
  duration: number,
  bookings: Booking[]
): boolean {
  const [slotHours, slotMinutes] = timeSlot.split(':').map(Number)
  const slotStart = new Date(date)
  slotStart.setHours(slotHours, slotMinutes, 0, 0)

  const slotEnd = new Date(slotStart)
  slotEnd.setMinutes(slotEnd.getMinutes() + duration)

  // Check for booking conflicts at this time
  const conflictingBookings = bookings.filter(booking => {
    const bookingStart = new Date(booking.date)
    const { hours, minutes } = parseTime12h(booking.time)
    bookingStart.setHours(hours, minutes, 0, 0)

    const bookingEnd = new Date(bookingStart)
    bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.duration)

    // Check for time overlap
    return !(slotEnd <= bookingStart || slotStart >= bookingEnd)
  })

  return conflictingBookings.length === 0
}

/**
 * Get dynamic room availability (total capacity only, not per-slot)
 * @param roomId - Room ID
 * @param rooms - Array of all rooms
 * @returns Room availability object or null if not dynamic room
 */
export function getDynamicRoomAvailability(
  roomId: string,
  rooms: any[]
): { totalCapacity: number; roomName: string; status: 'Available' } | null {
  const room = rooms.find(r => r.id === roomId && (r.roomType === 'dynamic' || r.roomType === 'flexible'))
  if (!room) return null

  return {
    totalCapacity: room.capacity || 1,
    roomName: room.name,
    status: 'Available'
  }
}

/**
 * Check if staff is working in a specific room on a given date
 * Works for both dynamic and static staff with room assignments
 * @param staffId - Staff member ID
 * @param roomId - Room ID
 * @param date - Date to check
 * @returns true if staff is assigned to work in room on that date
 */
export function isStaffWorkingInRoom(staffId: string, roomId: string, date: Date): boolean {
  const staff = mockStaff.find(s => s.id === staffId)
  if (!staff || !staff.roomAssignments) return false

  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]

  return staff.roomAssignments.some(assignment =>
    assignment.roomId === roomId && assignment.dayOfWeek === dayName
  )
}

/**
 * Get staff's room assignment for a specific date and time
 * @param staffId - Staff member ID
 * @param date - Date to check
 * @param timeStr - Time string in HH:MM format (optional, for time-specific check)
 * @returns First matching room assignment or null
 */
export function getStaffRoomAssignment(staffId: string, date: Date, timeStr?: string): any | null {
  const staff = mockStaff.find(s => s.id === staffId)
  if (!staff || !staff.roomAssignments) return null

  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]

  return staff.roomAssignments.find(assignment => {
    if (assignment.dayOfWeek !== dayName) return false

    // If time provided, check if it falls within assignment hours
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const timeInMinutes = hours * 60 + minutes
      const [startHours, startMins] = assignment.startTime.split(':').map(Number)
      const [endHours, endMins] = assignment.endTime.split(':').map(Number)
      const startInMinutes = startHours * 60 + startMins
      const endInMinutes = endHours * 60 + endMins

      return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes
    }

    return true
  })
}

/**
 * Get all staff assigned to a specific room on a given date
 * @param roomId - Room ID
 * @param date - Date to check
 * @returns Array of staff members assigned to that room
 */
export function getStaffAssignedToRoom(roomId: string, date: Date): any[] {
  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]

  return mockStaff.filter(staff =>
    staff.roomAssignments?.some(
      assignment => assignment.roomId === roomId && assignment.dayOfWeek === dayName
    )
  )
}

/**
 * Get all rooms a staff member is assigned to on a given date
 * @param staffId - Staff member ID
 * @param date - Date to check
 * @returns Array of room assignments
 */
export function getStaffRoomsForDate(staffId: string, date: Date): any[] {
  const staff = mockStaff.find(s => s.id === staffId)
  if (!staff || !staff.roomAssignments) return []

  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]

  return staff.roomAssignments.filter(assignment => assignment.dayOfWeek === dayName)
}
