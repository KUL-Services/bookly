/**
 * Staff Management Integration with Calendar
 *
 * Converts time off requests and reservations from staff management
 * into calendar background events
 */

import type { CalendarEvent } from './types'
import type { TimeOffRequest, TimeReservation } from './types'

/**
 * Convert time off request to calendar background event
 */
export function timeOffToCalendarEvent(timeOff: TimeOffRequest, staffName: string): CalendarEvent {
  const start = new Date(timeOff.range.start)
  const end = new Date(timeOff.range.end)

  return {
    id: `timeoff-${timeOff.id}`,
    title: `${staffName} - ${timeOff.reason}${timeOff.approved ? ' ✓' : ' (Pending)'}`,
    start,
    end,
    display: 'background',
    backgroundColor: timeOff.approved ? 'rgba(232, 134, 130, 0.18)' : 'rgba(119, 182, 163, 0.18)',
    borderColor: timeOff.approved ? '#e88682' : '#77b6a3',
    classNames: ['time-off-event'],
    extendedProps: {
      type: 'timeOff',
      timeOffId: timeOff.id,
      staffId: timeOff.staffId,
      staffName,
      reason: timeOff.reason,
      approved: timeOff.approved,
      allDay: timeOff.allDay,
      note: timeOff.note,
      // Required props for calendar event
      status: 'confirmed' as const,
      paymentStatus: 'unpaid' as const,
      selectionMethod: 'automatically' as const,
      starred: false,
      serviceName: 'Time Off',
      customerName: staffName,
      price: 0,
      bookingId: timeOff.id
    }
  }
}

/**
 * Convert time reservation to calendar background event
 */
export function reservationToCalendarEvents(
  reservation: TimeReservation,
  staffLookup: Record<string, { name: string; branchId?: string }>,
  roomLookup: Record<string, { name: string; branchId?: string }>
): CalendarEvent[] {
  const events: CalendarEvent[] = []

  reservation.staffIds.forEach(staffId => {
    const staffInfo = staffLookup[staffId]
    const staffName = staffInfo?.name || 'Staff Member'
    events.push({
      id: `reservation-${reservation.id}-staff-${staffId}`,
      title: `${staffName} - ${reservation.reason}`,
      start: new Date(reservation.start),
      end: new Date(reservation.end),
      display: 'background',
      backgroundColor: 'rgba(81, 180, 183, 0.18)',
      borderColor: '#51b4b7',
      classNames: ['time-reservation-event'],
      extendedProps: {
        type: 'reservation',
        reservationId: reservation.id,
        staffId,
        staffName,
        reason: reservation.reason,
        note: reservation.note,
        branchId: staffInfo?.branchId,
        // Required props for calendar event
        status: 'confirmed' as const,
        paymentStatus: 'unpaid' as const,
        selectionMethod: 'automatically' as const,
        starred: false,
        serviceName: 'Reserved',
        customerName: staffName,
        price: 0,
        bookingId: reservation.id
      }
    })
  })

  reservation.roomIds.forEach(roomId => {
    const roomInfo = roomLookup[roomId]
    const roomName = roomInfo?.name || 'Room'
    events.push({
      id: `reservation-${reservation.id}-room-${roomId}`,
      title: `${roomName} - ${reservation.reason}`,
      start: new Date(reservation.start),
      end: new Date(reservation.end),
      display: 'background',
      backgroundColor: 'rgba(81, 180, 183, 0.18)',
      borderColor: '#51b4b7',
      classNames: ['time-reservation-event'],
      extendedProps: {
        type: 'reservation',
        reservationId: reservation.id,
        staffId: '',
        staffName: roomName,
        roomId,
        reason: reservation.reason,
        note: reservation.note,
        branchId: roomInfo?.branchId,
        // Required props for calendar event
        status: 'confirmed' as const,
        paymentStatus: 'unpaid' as const,
        selectionMethod: 'automatically' as const,
        starred: false,
        serviceName: 'Reserved',
        customerName: roomName,
        price: 0,
        bookingId: reservation.id
      }
    })
  })

  return events
}

/**
 * Check if a time slot conflicts with time off
 */
export function hasTimeOffConflict(
  staffId: string,
  start: Date,
  end: Date,
  timeOffRequests: TimeOffRequest[]
): { hasConflict: boolean; conflictingTimeOff?: TimeOffRequest } {
  const timeOff = timeOffRequests.find(off => {
    if (off.staffId !== staffId) return false
    if (!off.approved) return false // Only check approved time off

    const offStart = new Date(off.range.start)
    const offEnd = new Date(off.range.end)

    // Check for overlap
    return (start < offEnd && end > offStart)
  })

  return {
    hasConflict: !!timeOff,
    conflictingTimeOff: timeOff
  }
}

/**
 * Check if a time slot conflicts with a reservation
 */
export function hasReservationConflict(
  staffId: string | null,
  roomId: string | null,
  start: Date,
  end: Date,
  reservations: TimeReservation[]
): { hasConflict: boolean; conflictingReservation?: TimeReservation } {
  const reservation = reservations.find(res => {
    const matchesStaff = staffId ? res.staffIds.includes(staffId) : false
    const matchesRoom = roomId ? res.roomIds.includes(roomId) : false
    if (!matchesStaff && !matchesRoom) return false

    const resStart = new Date(res.start)
    const resEnd = new Date(res.end)

    // Check for overlap
    return (start < resEnd && end > resStart)
  })

  return {
    hasConflict: !!reservation,
    conflictingReservation: reservation
  }
}

/**
 * Get all unavailable times for a staff member on a specific date
 */
export function getStaffUnavailability(
  staffId: string,
  date: Date,
  timeOffRequests: TimeOffRequest[],
  reservations: TimeReservation[]
): Array<{ start: Date; end: Date; reason: string; type: 'timeOff' | 'reservation' }> {
  const unavailable: Array<{ start: Date; end: Date; reason: string; type: 'timeOff' | 'reservation' }> = []

  const dateStart = new Date(date)
  dateStart.setHours(0, 0, 0, 0)

  const dateEnd = new Date(date)
  dateEnd.setHours(23, 59, 59, 999)

  // Check time off
  timeOffRequests.forEach(off => {
    if (off.staffId !== staffId || !off.approved) return

    const offStart = new Date(off.range.start)
    const offEnd = new Date(off.range.end)

    // Check if this time off falls on the given date
    if (offStart <= dateEnd && offEnd >= dateStart) {
      unavailable.push({
        start: offStart > dateStart ? offStart : dateStart,
        end: offEnd < dateEnd ? offEnd : dateEnd,
        reason: off.reason,
        type: 'timeOff'
      })
    }
  })

  // Check reservations
  reservations.forEach(res => {
    if (!res.staffIds.includes(staffId)) return

    const resStart = new Date(res.start)
    const resEnd = new Date(res.end)

    // Check if this reservation falls on the given date
    if (resStart <= dateEnd && resEnd >= dateStart) {
      unavailable.push({
        start: resStart > dateStart ? resStart : dateStart,
        end: resEnd < dateEnd ? resEnd : dateEnd,
        reason: res.reason,
        type: 'reservation'
      })
    }
  })

  return unavailable.sort((a, b) => a.start.getTime() - b.start.getTime())
}

/**
 * Validate if a booking can be created (no conflicts)
 */
export function validateBookingTime(
  staffId: string | null,
  roomId: string | null,
  start: Date,
  end: Date,
  timeOffRequests: TimeOffRequest[],
  reservations: TimeReservation[]
): { valid: boolean; error?: string } {
  // Check time off conflicts
  if (staffId) {
    const timeOffCheck = hasTimeOffConflict(staffId, start, end, timeOffRequests)
    if (timeOffCheck.hasConflict) {
      return {
        valid: false,
        error: `Staff member has approved time off (${timeOffCheck.conflictingTimeOff?.reason}) during this time`
      }
    }
  }

  // Check reservation conflicts
  const reservationCheck = hasReservationConflict(staffId, roomId, start, end, reservations)
  if (reservationCheck.hasConflict) {
    return {
      valid: false,
      error: `Time is reserved for: ${reservationCheck.conflictingReservation?.reason}`
    }
  }

  return { valid: true }
}
