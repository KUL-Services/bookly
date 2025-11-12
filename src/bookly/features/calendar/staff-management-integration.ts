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
    backgroundColor: timeOff.approved ? 'rgba(121, 85, 72, 0.2)' : 'rgba(255, 152, 0, 0.2)',
    borderColor: timeOff.approved ? '#795548' : '#ff9800',
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
export function reservationToCalendarEvent(reservation: TimeReservation, staffName: string): CalendarEvent {
  return {
    id: `reservation-${reservation.id}`,
    title: `${staffName} - ${reservation.reason}`,
    start: new Date(reservation.start),
    end: new Date(reservation.end),
    display: 'background',
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderColor: '#2196f3',
    classNames: ['time-reservation-event'],
    extendedProps: {
      type: 'reservation',
      reservationId: reservation.id,
      staffId: reservation.staffId,
      staffName,
      reason: reservation.reason,
      note: reservation.note,
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
  }
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
  staffId: string,
  start: Date,
  end: Date,
  reservations: TimeReservation[]
): { hasConflict: boolean; conflictingReservation?: TimeReservation } {
  const reservation = reservations.find(res => {
    if (res.staffId !== staffId) return false

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
    if (res.staffId !== staffId) return

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
  staffId: string,
  start: Date,
  end: Date,
  timeOffRequests: TimeOffRequest[],
  reservations: TimeReservation[]
): { valid: boolean; error?: string } {
  // Check time off conflicts
  const timeOffCheck = hasTimeOffConflict(staffId, start, end, timeOffRequests)
  if (timeOffCheck.hasConflict) {
    return {
      valid: false,
      error: `Staff member has approved time off (${timeOffCheck.conflictingTimeOff?.reason}) during this time`
    }
  }

  // Check reservation conflicts
  const reservationCheck = hasReservationConflict(staffId, start, end, reservations)
  if (reservationCheck.hasConflict) {
    return {
      valid: false,
      error: `Time is reserved for: ${reservationCheck.conflictingReservation?.reason}`
    }
  }

  return { valid: true }
}
