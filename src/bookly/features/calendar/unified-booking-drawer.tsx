'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Paper
} from '@mui/material'
import { mockStaff, mockServices, mockBookings, mockRooms } from '@/bookly/data/mock-data'
import type { AppointmentStatus, DateRange, CalendarEvent, DayOfWeek, WeeklyStaffHours, TimeOffRequest } from './types'
import type { User } from '@/bookly/data/types'
import { useCalendarStore } from './state'
import { isStaffAvailable, hasConflict, getStaffAvailableCapacity, getStaffRoomAssignment } from './utils'
import { hasTimeOffConflict } from './staff-management-integration'
import { useStaffManagementStore } from '../staff-management/staff-store'
import ClientPickerDialog from './client-picker-dialog'
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'
import { DatePickerField } from '@/bookly/features/staff-management/date-picker-field'

// Helper function to get 2 initials from a name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}

// Generate booking reference
const generateBookingReference = () => {
  const prefix = 'BK'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

const getDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTimeKey = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const isTimeWithinSlot = (time: string, startTime: string, endTime: string): boolean => {
  const current = timeToMinutes(time)
  return current >= timeToMinutes(startTime) && current < timeToMinutes(endTime)
}

const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase()
}

// Email validation function
const isValidEmail = (email: string): boolean => {
  if (!email.trim()) return true // Empty is valid (optional field)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

// Phone validation function
const isValidPhone = (phone: string): boolean => {
  if (!phone.trim()) return true // Empty is valid (optional field)
  // Allow digits, spaces, hyphens, parentheses, and + sign
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/
  const digitsOnly = phone.replace(/\D/g, '')
  return phoneRegex.test(phone.trim()) && digitsOnly.length >= 7 && digitsOnly.length <= 15
}

type PaymentMethod = 'pay_on_arrival' | 'mock_card'

// Helper to generate available time slots for a staff member on a given date
interface AvailableSlot {
  time: string
  available: boolean
  reason?: string
}

const generateAvailableSlots = (
  staffId: string,
  date: Date,
  serviceDuration: number,
  events: CalendarEvent[],
  staffWorkingHours: Record<string, WeeklyStaffHours>,
  timeOffRequests: TimeOffRequest[] = []
): AvailableSlot[] => {
  const slots: AvailableSlot[] = []
  const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayOfWeek = dayNames[date.getDay()]
  const workingHours = staffWorkingHours[staffId]?.[dayOfWeek as keyof WeeklyStaffHours] as { isWorking: boolean, shifts: any[] } | undefined

  // If not working, return empty
  if (!workingHours || !workingHours.isWorking || !workingHours.shifts || workingHours.shifts.length === 0) {
    return []
  }

  // Get all shifts for the day
  const shifts = [...workingHours.shifts].sort((a, b) => {
    const aStart = parseInt(a.start.replace(':', ''))
    const bStart = parseInt(b.start.replace(':', ''))
    return aStart - bStart
  })

  // Get existing bookings for this staff on this date
  const dateStr = getDateKey(date)
  const staffBookings = events.filter(e => {
    const eventDate = getDateKey(new Date(e.start))
    return eventDate === dateStr &&
           e.extendedProps.staffId === staffId &&
           e.extendedProps.status !== 'cancelled'
  })

  // Generate slots based on working hours (15 min intervals)
  shifts.forEach(shift => {
    const [startH, startM] = shift.start.split(':').map(Number)
    const [endH, endM] = shift.end.split(':').map(Number)
    const shiftStartMins = startH * 60 + startM
    const shiftEndMins = endH * 60 + endM

    // Get break times
    const breaks: { start: number; end: number }[] = []
    if (shift.breaks && shift.breaks.length > 0) {
      shift.breaks.forEach((b: { start: string; end: string }) => {
        const [bStartH, bStartM] = b.start.split(':').map(Number)
        const [bEndH, bEndM] = b.end.split(':').map(Number)
        breaks.push({ start: bStartH * 60 + bStartM, end: bEndH * 60 + bEndM })
      })
    }

    // Generate slots every 15 minutes
    for (let mins = shiftStartMins; mins + serviceDuration <= shiftEndMins; mins += 15) {
      const slotEndMins = mins + serviceDuration
      const hours = Math.floor(mins / 60)
      const minutes = mins % 60
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

      // Check if slot is during a break
      const duringBreak = breaks.some(b =>
        (mins >= b.start && mins < b.end) ||
        (slotEndMins > b.start && slotEndMins <= b.end) ||
        (mins <= b.start && slotEndMins >= b.end)
      )

      if (duringBreak) {
        slots.push({ time: timeStr, available: false, reason: 'Break time' })
        continue
      }

      // Check if slot is during time-off
      const slotStart = new Date(date)
      slotStart.setHours(hours, minutes, 0, 0)
      const slotEnd = new Date(date)
      slotEnd.setHours(Math.floor(slotEndMins / 60), slotEndMins % 60, 0, 0)

      const timeOffCheck = hasTimeOffConflict(staffId, slotStart, slotEnd, timeOffRequests)
      if (timeOffCheck.hasConflict) {
        slots.push({ time: timeStr, available: false, reason: `Time off: ${timeOffCheck.conflictingTimeOff?.reason || 'Unavailable'}` })
        continue
      }

      // Check if slot conflicts with existing bookings
      const hasBookingConflict = staffBookings.some(booking => {
        const bookingStart = new Date(booking.start)
        const bookingEnd = new Date(booking.end)
        const bookingStartMins = bookingStart.getHours() * 60 + bookingStart.getMinutes()
        const bookingEndMins = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()

        return (mins >= bookingStartMins && mins < bookingEndMins) ||
               (slotEndMins > bookingStartMins && slotEndMins <= bookingEndMins) ||
               (mins <= bookingStartMins && slotEndMins >= bookingEndMins)
      })

      if (hasBookingConflict) {
        slots.push({ time: timeStr, available: false, reason: 'Already booked' })
      } else {
        slots.push({ time: timeStr, available: true })
      }
    }
  })

  return slots
}

// Helper to format time to 12h format
const formatTime12h = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${suffix}`
}

// Type for client in static slot
interface SlotClient {
  id: string
  bookingRef: string
  name: string
  email: string
  phone: string
  bookedAt: string
  status: 'confirmed' | 'no_show' | 'attended' | 'pending'
  arrivalTime?: string
  paymentStatus: 'paid' | 'unpaid'
  paymentMethod: PaymentMethod
  paymentReference: string
}

interface UnifiedBookingDrawerProps {
  open: boolean
  mode: 'create' | 'edit'
  initialDate?: Date | null
  initialDateRange?: DateRange | null
  initialStaffId?: string | null
  initialServiceId?: string | null
  existingEvent?: CalendarEvent | null
  onClose: () => void
  onSave?: (booking: any) => void
  onDelete?: (bookingId: string) => void
}

export default function UnifiedBookingDrawer({
  open,
  mode,
  initialDate,
  initialDateRange,
  initialStaffId,
  initialServiceId,
  existingEvent,
  onClose,
  onSave,
  onDelete
}: UnifiedBookingDrawerProps) {
  const events = useCalendarStore(state => state.events)
  const schedulingMode = useCalendarStore(state => state.schedulingMode)
  const getSlotsForDate = useCalendarStore(state => state.getSlotsForDate)
  const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)
  const getSlotBookings = useCalendarStore(state => state.getSlotBookings)
  const getRoomsByBranch = useCalendarStore(state => state.getRoomsByBranch)
  const createEvent = useCalendarStore(state => state.createEvent)
  const updateEvent = useCalendarStore(state => state.updateEvent)
  const deleteEvent = useCalendarStore(state => state.deleteEvent)
  const staticSlots = useCalendarStore(state => state.staticSlots)
  const { staffWorkingHours, timeOffRequests } = useStaffManagementStore()

  // Dynamic mode form state
  const [bookingReference, setBookingReference] = useState('')
  const [date, setDate] = useState(initialDate || new Date())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('09:30')
  const [staffId, setStaffId] = useState(initialStaffId || '')
  const [selectedClient, setSelectedClient] = useState<User | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [dynamicEmailError, setDynamicEmailError] = useState<string | null>(null)
  const [dynamicPhoneError, setDynamicPhoneError] = useState<string | null>(null)
  const [serviceId, setServiceId] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState(0)
  const [serviceDuration, setServiceDuration] = useState(30)
  const [requestedByClient, setRequestedByClient] = useState(false)
  const [status, setStatus] = useState<AppointmentStatus>('confirmed')
  const [starred, setStarred] = useState(false)
  const [instapayReference, setInstapayReference] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid')

  // Static mode state
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [slotClients, setSlotClients] = useState<SlotClient[]>([])
  const [realSlotData, setRealSlotData] = useState<any>(null)
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isSessionClientsOpen, setIsSessionClientsOpen] = useState(false)

  // UI state
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null)
  const [showAvailableSlots, setShowAvailableSlots] = useState(true)

  // Get only dynamic staff for selection
  const dynamicStaff = mockStaff.filter(s => s.staffType === 'dynamic')

  // Determine if this event is from a static slot (overrides global schedulingMode)
  // Check by:
  // 1. Event properties (slotId or isStaticSlot)
  // 2. Staff type (if staffId is for a static staff member)
  // 3. Room type (if roomId is for a fixed/static room)
  const isStaticSlotEvent = (() => {
    if (mode === 'edit' && existingEvent && existingEvent.extendedProps) {
      const props = existingEvent.extendedProps as any
      const eventStaff = mockStaff.find(s => s.id === props.staffId)

      // Dynamic staff should always open as dynamic, even if slot data exists.
      if (eventStaff?.staffType === 'dynamic') {
        return false
      }

      // Check for explicit slot properties
      if (props.slotId || props.isStaticSlot) {
        return true
      }

      // Check if the staff is static type
      if (eventStaff?.staffType === 'static') {
        return true
      }

      // Check if the room is static/fixed type
      const eventRoom = mockRooms.find(r => r.id === props.roomId)
      if (eventRoom?.roomType === 'static' || eventRoom?.roomType === 'fixed') {
        return true
      }
    }
    return false
  })()

  // Use event-specific mode if available, otherwise fall back to global
  const effectiveSchedulingMode = isStaticSlotEvent ? 'static' : schedulingMode

  // Reset form when drawer opens in create mode
  useEffect(() => {
    if (open && mode === 'create') {
      setBookingReference(generateBookingReference())
      setDate(initialDate || new Date())
      setStartTime('09:00')
      setEndTime('09:30')
      setStaffId(initialStaffId || '')
      setSelectedClient(null)
      setClientName('')
      setClientEmail('')
      setClientPhone('')
      setDynamicEmailError(null)
      setDynamicPhoneError(null)
      setServiceId('')
      setServiceName('')
      setServicePrice(0)
      setServiceDuration(30)
      setRequestedByClient(false)
      setStatus('confirmed')
      setStarred(false)
      setInstapayReference('')
      setPaymentStatus('unpaid')
      setSelectedSlotId(null)
      setSlotClients([])
      setIsSessionClientsOpen(false)
      setValidationError(null)
      setAvailabilityWarning(null)
    }
  }, [open, mode, initialDate, initialStaffId])

  // Load existing event data in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingEvent && existingEvent.extendedProps && open) {
      setSelectedSlotId(null)
      setSlotClients([])
      setRealSlotData(null)
      setIsAddingClient(false)
      setNewClientName('')
      setNewClientEmail('')
      setNewClientPhone('')
      setEmailError(null)
      setPhoneError(null)
      setIsSessionClientsOpen(false)
      setValidationError(null)
      setAvailabilityWarning(null)

      const props = existingEvent.extendedProps as any
      console.log('🎯 DRAWER Opening in edit mode:', {
        eventId: existingEvent.id,
        props,
        hasSlotId: !!props.slotId,
        isStaticSlot: props.isStaticSlot,
        effectiveSchedulingMode
      })

      const start = new Date(existingEvent.start)
      const end = new Date(existingEvent.end)
      setDate(start)
      setStartTime(start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setStaffId(props.staffId || '')
      setClientName(props.customerName || '')
      setClientEmail(props.email || props.customerEmail || '')
      setClientPhone(props.phone || props.customerPhone || '')
      setServiceName(props.serviceName || '')
      setServicePrice(props.price || 0)
      setRequestedByClient(props.selectionMethod === 'by_client')

      const existingStatus = props.status || 'confirmed'
      if (['pending', 'need_confirm', 'confirmed', 'no_show', 'attended'].includes(existingStatus)) {
        setStatus(existingStatus as AppointmentStatus)
      } else {
        setStatus('confirmed')
      }

      setStarred(props.starred || false)
      setBookingReference(props.bookingId || existingEvent.id || '')
      setInstapayReference(props.instapayReference || '')
      setPaymentStatus(props.paymentStatus === 'paid' ? 'paid' : 'unpaid')

      // Load service details
      const existingServiceId = props.serviceId
      if (existingServiceId) {
        setServiceId(existingServiceId)
        const svc = mockServices.find(s => s.id === existingServiceId)
        if (svc) setServiceDuration(svc.duration)
      }

      // Load slot data if static mode (use effectiveSchedulingMode to detect)
      if (effectiveSchedulingMode === 'static' || props.slotId || props.isStaticSlot) {
        const resolved = resolveSlotForEvent(existingEvent)
        const slotId = resolved?.slotId || null
        const slot = resolved?.slot || null

        // CRITICAL: Don't use event ID as fallback - this causes slot fragmentation
        // If we still don't have a slotId, this event shouldn't be treated as a static slot
        if (!slotId) {
          console.error('❌ DRAWER No slot found for event - cannot edit as static slot', {
            eventId: existingEvent.id,
            props,
            staticSlotsCount: staticSlots.length
          })
          // Don't set slotId - this will prevent treating this as a static slot
          return
        }

        setSelectedSlotId(slotId)

        console.log('🔍 DRAWER Loading slot data:', {
          slotId,
          foundSlot: !!slot,
          slot,
          effectiveSchedulingMode,
          allStaticSlotsCount: staticSlots.length,
          searchMethod: props.slotId ? 'direct' : slot ? 'matched' : 'fallback'
        })
        setRealSlotData(slot)

        // Load service name from slot if available
        if (slot?.serviceName) {
          setServiceName(slot.serviceName)
        }
        if (slot?.startTime && slot?.endTime) {
          setStartTime(slot.startTime)
          setEndTime(slot.endTime)
        }

        // Get all real bookings for this slot
        // IMPORTANT: Always use time/location matching to catch ALL bookings in this slot,
        // even if they have wrong/missing slotId
        const dateStr = getDateKey(start)
        let slotBookings: CalendarEvent[] = []

        if (slot) {
          // Find ALL events that match this slot's time and location
          slotBookings = events.filter(e => {
            const eventStart = new Date(e.start)
            const eventDateStr = getDateKey(eventStart)
            if (eventDateStr !== dateStr) return false
            if (e.extendedProps.status === 'cancelled') return false
            if (e.extendedProps.type === 'timeOff' || e.extendedProps.type === 'reservation') return false

            const eventTime = getTimeKey(eventStart)
            if (!isTimeWithinSlot(eventTime, slot.startTime, slot.endTime)) return false

            // Match by room or staff
            if (slot.roomId && e.extendedProps.roomId === slot.roomId) return true
            if (slot.instructorStaffId && e.extendedProps.staffId === slot.instructorStaffId) return true

            return false
          })
          console.log('📋 DRAWER Slot bookings by time/location (primary):', { slotBookings })
        } else {
          // Fallback to slotId-only matching if we don't have slot data
          slotBookings = getSlotBookings(slotId, start)
          console.log('📋 DRAWER Slot bookings by slotId (fallback):', {
            slotId,
            bookingsCount: slotBookings.length,
            slotBookings
          })
        }

        // Convert events to SlotClient format
        const clients: SlotClient[] = slotBookings.map(booking => {
          // Extract email/phone from notes field (format: "Email: xxx, Phone: yyy")
          const notes = booking.extendedProps.notes || ''
          const emailMatch = notes.match(/Email:\s*([^,]+)/)
          const phoneMatch = notes.match(/Phone:\s*(.+)/)

          return {
            id: booking.id,
            bookingRef: booking.extendedProps.bookingId || booking.id,
            name: booking.extendedProps.customerName || 'Walk-in Client',
            email: emailMatch ? emailMatch[1].trim() : '',
            phone: phoneMatch ? phoneMatch[1].trim() : '',
            bookedAt: new Date(booking.start).toISOString(),
            status: ['confirmed', 'no_show', 'attended', 'pending'].includes(booking.extendedProps.status)
              ? (booking.extendedProps.status as 'confirmed' | 'no_show' | 'attended' | 'pending')
              : 'confirmed',
            arrivalTime: booking.extendedProps.arrivalTime || '',
            paymentStatus: booking.extendedProps.paymentStatus === 'paid' ? 'paid' : 'unpaid',
            paymentMethod: booking.extendedProps.paymentMethod || 'pay_on_arrival',
            paymentReference: booking.extendedProps.instapayReference || ''
          }
        })

        setSlotClients(clients)
      }
    }
  }, [mode, existingEvent, open, staticSlots, getSlotBookings, events])

  // Auto-calculate end time when service or start time changes
  useEffect(() => {
    if (serviceId && startTime && mode === 'create') {
      const [hours, minutes] = startTime.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + serviceDuration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      setEndTime(`${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`)
    }
  }, [serviceId, startTime, serviceDuration, mode])

  // Check availability for dynamic mode
  useEffect(() => {
    if (effectiveSchedulingMode !== 'dynamic' || mode === 'edit') return
    if (!staffId || !startTime || !endTime) {
      setAvailabilityWarning(null)
      return
    }

    const availability = isStaffAvailable(staffId, date, startTime, endTime)
    if (!availability.available) {
      setAvailabilityWarning(availability.reason || 'Staff is not available at this time')
      return
    }

    const conflict = hasConflict(events, staffId, date, startTime, endTime)
    if (conflict.conflict) {
      const conflictStart = new Date(conflict.conflictingEvent!.start)
      const conflictEnd = new Date(conflict.conflictingEvent!.end)
      const conflictTimeStr = `${conflictStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${conflictEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
      setAvailabilityWarning(`Conflicts with existing appointment (${conflictTimeStr})`)
      return
    }

    setAvailabilityWarning(null)
  }, [staffId, date, startTime, endTime, events, effectiveSchedulingMode, mode])

  const getSlotCapacity = () => {
    const fallbackSlot = selectedSlotId ? staticSlots.find(s => s.id === selectedSlotId) : null
    const staffCapacity = staffId ? mockStaff.find(s => s.id === staffId)?.maxConcurrentBookings : null
    const roomId = existingEvent?.extendedProps?.roomId
    const roomCapacity = roomId ? mockRooms.find(r => r.id === roomId)?.capacity : null
    return realSlotData?.capacity ?? fallbackSlot?.capacity ?? roomCapacity ?? staffCapacity ?? 10
  }

  const hasDuplicateEmail = (email: string) => {
    const normalized = normalizeEmail(email)
    if (!normalized) return false
    return slotClients.some(client => normalizeEmail(client.email) === normalized)
  }

  const resolveSlotForEvent = (event?: CalendarEvent | null) => {
    if (!event) return null

    const props = event.extendedProps as any
    const directSlotId = props?.slotId || null
    const directSlot = directSlotId ? staticSlots.find(s => s.id === directSlotId) : null
    if (directSlotId && directSlot) {
      return { slotId: directSlotId, slot: directSlot }
    }

    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const eventTime = getTimeKey(eventStart)
    const dayNames: Array<'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'> = [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat'
    ]
    const dayOfWeek = dayNames[eventStart.getDay()]
    const dateStr = getDateKey(eventStart)

    const matchingSlot = staticSlots.find(s => {
      const dayMatch = s.date === dateStr || s.dayOfWeek === dayOfWeek
      if (!dayMatch) return false
      if (!isTimeWithinSlot(eventTime, s.startTime, s.endTime)) return false

      const eventRoomId = props?.roomId
      const eventStaffId = props?.staffId
      if (eventRoomId && s.roomId === eventRoomId) return true
      if (eventStaffId && s.instructorStaffId === eventStaffId) return true
      return false
    })

    if (matchingSlot) {
      return { slotId: matchingSlot.id, slot: matchingSlot }
    }

    const staffId = props?.staffId || ''
    const roomId = props?.roomId || ''
    if (!staffId && !roomId) {
      return directSlotId ? { slotId: directSlotId, slot: directSlot } : null
    }

    const staff = staffId ? mockStaff.find(s => s.id === staffId) : null
    const room = roomId ? mockRooms.find(r => r.id === roomId) : null
    const startTime = getTimeKey(eventStart)
    const endTime = getTimeKey(eventEnd)
    const fallbackSlotId =
      directSlotId ||
      `virtual-${roomId || staffId}-${dateStr}-${startTime.replace(':', '')}-${endTime.replace(':', '')}`
    const fallbackSlot = {
      id: fallbackSlotId,
      roomId: roomId || '',
      branchId: props?.branchId || staff?.branchId || room?.branchId || '',
      dayOfWeek: dayNames[eventStart.getDay()],
      date: dateStr,
      startTime,
      endTime,
      serviceId: props?.serviceId || '',
      serviceName: props?.serviceName || event.title || 'Service',
      capacity: room?.capacity ?? staff?.maxConcurrentBookings ?? 10,
      instructorStaffId: staffId || '',
      price: props?.price || 0
    }

    return { slotId: fallbackSlotId, slot: fallbackSlot }
  }

  const handleServiceChange = (newServiceId: string) => {
    const selectedService = mockServices.find(s => s.id === newServiceId)
    if (selectedService) {
      setServiceId(newServiceId)
      setServiceName(selectedService.name)
      setServicePrice(selectedService.price)
      setServiceDuration(selectedService.duration)
    }
  }

  const handleClientSelect = (client: User | null) => {
    setSelectedClient(client)
    if (client) {
      const fullName = `${client.firstName} ${client.lastName}`
      setClientName(fullName)
      setClientEmail(client.email)
      setClientPhone(client.phone || '')

      // If in static mode and adding client, add to slot clients list
      if (effectiveSchedulingMode === 'static' && isAddingClient) {
        // At least one of email or phone is required
        if (!client.email?.trim() && !client.phone?.trim()) {
          setValidationError('Please enter either email or phone number')
          return
        }
        if (client.email?.trim() && hasDuplicateEmail(client.email)) {
          setValidationError('This client is already booked in this session')
          return
        }

        const totalCapacity = getSlotCapacity()
        if (slotClients.length >= totalCapacity) {
          setValidationError('Cannot add client: Session is at maximum capacity')
          return
        }

        const bookingRef = generateBookingReference()
        const newClient: SlotClient = {
          id: bookingRef,
          bookingRef,
          name: fullName,
          email: client.email,
          phone: client.phone || '',
          bookedAt: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'unpaid',
          paymentMethod: 'pay_on_arrival',
          paymentReference: ''
        }
        setSlotClients([...slotClients, newClient])
        setIsAddingClient(false)
        setNewClientName('')
        setNewClientEmail('')
        setNewClientPhone('')
      }
    }
  }

  const handleAddClientToSlot = () => {
    // Clear previous errors
    setValidationError(null)
    setEmailError(null)
    setPhoneError(null)

    if (!newClientName.trim()) {
      setValidationError('Please enter client name')
      return
    }

    // At least one of email or phone is required
    if (!newClientEmail.trim() && !newClientPhone.trim()) {
      setValidationError('Please enter either email or phone number')
      return
    }

    // Validate email format if provided
    if (newClientEmail.trim() && !isValidEmail(newClientEmail)) {
      setEmailError('Invalid email format')
      return
    }

    // Validate phone format if provided
    if (newClientPhone.trim() && !isValidPhone(newClientPhone)) {
      setPhoneError('Invalid phone number')
      return
    }

    if (newClientEmail.trim() && hasDuplicateEmail(newClientEmail)) {
      setValidationError('This client is already booked in this session')
      return
    }

    // Capacity validation using local state for real-time accuracy
    const totalCapacity = getSlotCapacity()
    const currentCount = slotClients.length
    const availableCapacity = totalCapacity - currentCount

    if (availableCapacity === 0) {
      setValidationError('Cannot add client: Session is at maximum capacity')
      return
    }

    const bookingRef = generateBookingReference()
    const newClient: SlotClient = {
      id: bookingRef,
      bookingRef,
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      bookedAt: new Date().toISOString(),
      status: 'confirmed',
      paymentStatus: 'unpaid',
      paymentMethod: 'pay_on_arrival',
      paymentReference: ''
    }

    setSlotClients([...slotClients, newClient])
    setNewClientName('')
    setNewClientEmail('')
    setNewClientPhone('')
    setEmailError(null)
    setPhoneError(null)
    setIsAddingClient(false)
  }

  const handleRemoveClientFromSlot = (clientId: string) => {
    setSlotClients(slotClients.filter(c => c.id !== clientId))
  }

  const handleClientStatusChange = (clientId: string, newStatus: SlotClient['status']) => {
    setSlotClients(slotClients.map(c => (c.id === clientId ? { ...c, status: newStatus } : c)))
  }

  const handleClientArrivalChange = (clientId: string, arrivalTime: string) => {
    setSlotClients(
      slotClients.map(c =>
        c.id === clientId
          ? {
              ...c,
              arrivalTime,
              status: arrivalTime ? 'attended' : c.status
            }
          : c
      )
    )
  }

  const handleClientPaymentStatusChange = (clientId: string, newStatus: 'paid' | 'unpaid') => {
    setSlotClients(slotClients.map(c => (c.id === clientId ? { ...c, paymentStatus: newStatus } : c)))
  }

  const handleClientPaymentMethodChange = (clientId: string, newMethod: PaymentMethod) => {
    setSlotClients(slotClients.map(c => (c.id === clientId ? { ...c, paymentMethod: newMethod } : c)))
  }

  const handleClientPaymentReferenceChange = (clientId: string, newReference: string) => {
    setSlotClients(slotClients.map(c => (c.id === clientId ? { ...c, paymentReference: newReference } : c)))
  }

  const handleSave = () => {
    setValidationError(null)
    setDynamicEmailError(null)
    setDynamicPhoneError(null)

    if (effectiveSchedulingMode === 'dynamic') {
      // Dynamic mode validation
      if (!clientName.trim()) {
        setValidationError('Please enter client name')
        return
      }
      // At least one of email or phone is required
      if (!clientEmail.trim() && !clientPhone.trim()) {
        setValidationError('Please enter either email or phone number')
        return
      }
      // Validate email format if provided
      if (clientEmail.trim() && !isValidEmail(clientEmail)) {
        setDynamicEmailError('Invalid email format')
        return
      }
      // Validate phone format if provided
      if (clientPhone.trim() && !isValidPhone(clientPhone)) {
        setDynamicPhoneError('Invalid phone number')
        return
      }
      if (!serviceId) {
        setValidationError('Please select a service')
        return
      }
      if (!staffId) {
        setValidationError('Please select a staff member')
        return
      }

      // Create or update dynamic booking
      if (mode === 'create') {
        const [hours, minutes] = startTime.split(':').map(Number)
        const startDate = new Date(date)
        startDate.setHours(hours, minutes, 0, 0)

        const [endHours, endMinutes] = endTime.split(':').map(Number)
        const endDate = new Date(date)
        endDate.setHours(endHours, endMinutes, 0, 0)

        const newEvent: CalendarEvent = {
          id: bookingReference,
          title: serviceName,
          start: startDate,
          end: endDate,
          extendedProps: {
            status,
            paymentStatus,
            staffId,
            staffName: mockStaff.find(s => s.id === staffId)?.name || '',
            selectionMethod: requestedByClient ? 'by_client' : 'automatically',
            starred,
            serviceName,
            customerName: clientName,
            price: servicePrice,
            bookingId: bookingReference,
            serviceId,
            notes: `Email: ${clientEmail}, Phone: ${clientPhone}`,
            instapayReference: instapayReference || undefined
          }
        }
        createEvent(newEvent)
      } else {
        // Update existing event
        if (existingEvent) {
          const updatedEvent: CalendarEvent = {
            ...existingEvent,
            extendedProps: {
              ...existingEvent.extendedProps,
              status,
              starred,
              instapayReference: instapayReference || undefined,
              paymentStatus
            }
          }
          updateEvent(updatedEvent)
        }
      }
    } else {
      // Static mode - update all slot client bookings
      let slotIdForSave = selectedSlotId
      if (!slotIdForSave && existingEvent) {
        const resolved = resolveSlotForEvent(existingEvent)
        if (resolved?.slotId) {
          slotIdForSave = resolved.slotId
          setSelectedSlotId(resolved.slotId)
          if (resolved.slot) {
            setRealSlotData(resolved.slot)
          }
        }
      }

      if (!slotIdForSave) {
        setValidationError('Session ID not found')
        return
      }

      // If no slot data, try to get it from the calendar state
      let slotDataForSave = realSlotData
      if (!slotDataForSave) {
        slotDataForSave = staticSlots.find(s => s.id === slotIdForSave)
        if (!slotDataForSave) {
          // Last resort: create minimal slot data from event
          if (existingEvent) {
            const props = existingEvent.extendedProps as any
            slotDataForSave = {
              id: slotIdForSave,
              serviceName: serviceName || props.serviceName || 'Service',
              serviceId: serviceId || props.serviceId || '',
              instructorStaffId: staffId || props.staffId || '',
              roomId: props.roomId || '',
              price: servicePrice || props.price || 0,
              startTime,
              endTime,
              capacity: 10 // Default capacity
            }
            console.warn('⚠️ DRAWER Using fallback slot data:', slotDataForSave)
          } else {
            setValidationError('Session data not available - please refresh and try again')
            return
          }
        }
      }

      // Get existing bookings for this slot using time/location matching
      // CRITICAL: Must use same matching logic as when loading to avoid creating duplicates
      const dateStr = getDateKey(date)
      let existingBookings: CalendarEvent[] = []

      if (slotDataForSave && (slotDataForSave.roomId || slotDataForSave.instructorStaffId)) {
        // Find ALL events matching this slot's time and location
        existingBookings = events.filter(e => {
          const eventStart = new Date(e.start)
          const eventDateStr = getDateKey(eventStart)
          if (eventDateStr !== dateStr) return false
          if (e.extendedProps.status === 'cancelled') return false
          if (e.extendedProps.type === 'timeOff' || e.extendedProps.type === 'reservation') return false

          const eventTime = getTimeKey(eventStart)
          if (!isTimeWithinSlot(eventTime, slotDataForSave.startTime, slotDataForSave.endTime)) return false

          // Match by room or staff
          if (slotDataForSave.roomId && e.extendedProps.roomId === slotDataForSave.roomId) return true
          if (slotDataForSave.instructorStaffId && e.extendedProps.staffId === slotDataForSave.instructorStaffId)
            return true

          return false
        })
        console.log('💾 DRAWER Save: Found existing bookings by time/location:', {
          count: existingBookings.length,
          existingBookings
        })
      } else {
        // Fallback to slotId-only matching
        existingBookings = getSlotBookings(slotIdForSave, date)
        console.log('💾 DRAWER Save: Found existing bookings by slotId:', {
          count: existingBookings.length,
          existingBookings
        })
      }

      const existingBookingIds = new Set(existingBookings.map(b => b.id))
      const currentClientIds = new Set(slotClients.map(c => c.id))

      // Delete removed clients
      existingBookings.forEach(booking => {
        if (!currentClientIds.has(booking.id)) {
          console.log('🗑️ DRAWER Deleting removed client:', booking.id)
          deleteEvent(booking.id)
        }
      })

      // Update or create client bookings
      slotClients.forEach(client => {
        const [hours, minutes] = startTime.split(':').map(Number)
        const startDate = new Date(date)
        startDate.setHours(hours, minutes, 0, 0)

        const [endHours, endMinutes] = endTime.split(':').map(Number)
        const endDate = new Date(date)
        endDate.setHours(endHours, endMinutes, 0, 0)

        if (existingBookingIds.has(client.id)) {
          // Update existing booking - IMPORTANT: Also update slotId to ensure consistency
          const existingBooking = existingBookings.find(b => b.id === client.id)
          if (existingBooking) {
            const updatedEvent: CalendarEvent = {
              ...existingBooking,
              extendedProps: {
                ...existingBooking.extendedProps,
                slotId: slotIdForSave, // Ensure slotId is consistent
                status: client.status,
                customerName: client.name,
                arrivalTime: client.arrivalTime,
                paymentStatus: client.paymentStatus,
                paymentMethod: client.paymentMethod,
                instapayReference: client.paymentReference || undefined,
                bookingId: client.bookingRef,
                notes: `Email: ${client.email}, Phone: ${client.phone}`
              }
            }
            console.log('✏️ DRAWER Updating existing booking:', client.id)
            updateEvent(updatedEvent)
          }
        } else {
          // Create new booking for this client in the slot
          const newEvent: CalendarEvent = {
            id: client.id,
            title: slotDataForSave.serviceName,
            start: startDate,
            end: endDate,
            extendedProps: {
              status: client.status,
              paymentStatus: client.paymentStatus,
              paymentMethod: client.paymentMethod,
              staffId: slotDataForSave.instructorStaffId || '',
              staffName: mockStaff.find(s => s.id === slotDataForSave.instructorStaffId)?.name || '',
              selectionMethod: 'automatically',
              starred: false,
              serviceName: slotDataForSave.serviceName,
              customerName: client.name,
              price: slotDataForSave.price,
              bookingId: client.bookingRef,
              serviceId: slotDataForSave.serviceId,
              slotId: slotIdForSave,
              isStaticSlot: true, // Mark as static slot for future detection
              roomId: slotDataForSave.roomId,
              partySize: 1,
              arrivalTime: client.arrivalTime,
              instapayReference: client.paymentReference || undefined,
              notes: `Email: ${client.email}, Phone: ${client.phone}`
            }
          }
          console.log('➕ DRAWER Creating new booking:', client.id)
          createEvent(newEvent)
        }
      })
    }

    onSave?.({
      bookingReference,
      date,
      startTime,
      endTime,
      staffId,
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      serviceName,
      servicePrice,
      serviceDuration,
      requestedByClient,
      status,
      starred,
      ...(effectiveSchedulingMode === 'static' && {
        slotId: slotIdForSave,
        slotClients
      })
    })
    handleClose()
  }

  const handleClose = () => {
    setValidationError(null)
    setAvailabilityWarning(null)
    setIsSessionClientsOpen(false)
    onClose()
  }

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatShortDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Status chip color
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'confirmed':
        return 'success'
      case 'no_show':
        return 'error'
      case 'attended':
        return 'info'
      case 'pending':
        return 'warning'
      case 'need_confirm':
        return 'warning'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Box>
            <Typography variant='h6' fontWeight={600}>
              {mode === 'create'
                ? effectiveSchedulingMode === 'static'
                  ? 'Add to Session'
                  : 'New Appointment'
                : effectiveSchedulingMode === 'static'
                  ? 'Manage Session'
                  : 'Booking Details'}
            </Typography>
            {mode === 'create' && (
              <Typography variant='caption' color='text.secondary'>
                Ref: {bookingReference}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleClose} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {/* ===== DYNAMIC/FLEXIBLE MODE ===== */}
          {effectiveSchedulingMode === 'dynamic' && (
            <>
              {mode === 'create' ? (
                // CREATE MODE - Full editable form
                <Stack spacing={2.5}>
                  {/* Booking Reference (read-only) */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      BOOKING REFERENCE
                    </Typography>
                    <Typography variant='body1' fontWeight={500}>
                      {bookingReference}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Client Selection */}
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      fontWeight={600}
                      sx={{ mb: 1, display: 'block' }}
                    >
                      CLIENT INFORMATION
                    </Typography>
                    <Box
                      onClick={() => setIsClientPickerOpen(true)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        border: '1px dashed',
                        borderColor: selectedClient ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        mb: 2,
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                      }}
                    >
                      <Avatar sx={{ width: 40, height: 40, bgcolor: selectedClient ? 'primary.main' : 'grey.300' }}>
                        {selectedClient ? (
                          getInitials(`${selectedClient.firstName} ${selectedClient.lastName}`)
                        ) : (
                          <i className='ri-user-add-line' />
                        )}
                      </Avatar>
                      <Typography variant='body2' color={selectedClient ? 'text.primary' : 'text.secondary'}>
                        {selectedClient
                          ? `${selectedClient.firstName} ${selectedClient.lastName}`
                          : 'Select existing client or enter manually'}
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      <TextField
                        fullWidth
                        label='Client Name'
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        size='small'
                        required
                      />
                      <TextField
                        fullWidth
                        label='Email'
                        type='email'
                        value={clientEmail}
                        onChange={e => {
                          setClientEmail(e.target.value)
                          if (dynamicEmailError) setDynamicEmailError(null)
                        }}
                        size='small'
                        error={!!dynamicEmailError}
                        helperText={dynamicEmailError || ''}
                      />
                      <TextField
                        fullWidth
                        label='Phone Number'
                        value={clientPhone}
                        onChange={e => {
                          setClientPhone(e.target.value)
                          if (dynamicPhoneError) setDynamicPhoneError(null)
                        }}
                        size='small'
                        error={!!dynamicPhoneError}
                        helperText={dynamicPhoneError || ''}
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Date Selection */}
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      fontWeight={600}
                      sx={{ mb: 1, display: 'block' }}
                    >
                      APPOINTMENT DATE & TIME
                    </Typography>
                    <DatePickerField label='Appointment Date' value={date} onChange={setDate} size='small' fullWidth />

                    {/* Available Slots Display */}
                    {staffId && serviceId && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant='caption' color='text.secondary' fontWeight={600}>
                            AVAILABLE TIME SLOTS
                          </Typography>
                          <Button
                            size='small'
                            variant='text'
                            onClick={() => setShowAvailableSlots(!showAvailableSlots)}
                            sx={{ fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}
                          >
                            {showAvailableSlots ? 'Hide' : 'Show'}
                          </Button>
                        </Box>
                        {showAvailableSlots && (() => {
                          const availableSlots = generateAvailableSlots(
                            staffId,
                            date,
                            serviceDuration,
                            events,
                            staffWorkingHours,
                            timeOffRequests
                          )
                          const freeSlots = availableSlots.filter(s => s.available)

                          if (availableSlots.length === 0) {
                            return (
                              <Paper sx={{ p: 2, bgcolor: 'warning.lighter', border: 1, borderColor: 'warning.main' }}>
                                <Typography variant='body2' color='warning.dark'>
                                  <i className='ri-calendar-close-line' style={{ marginRight: 8 }} />
                                  Staff member is not working on this date
                                </Typography>
                              </Paper>
                            )
                          }

                          return (
                            <Box>
                              <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                                {freeSlots.length} slots available • Click to select
                              </Typography>
                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(4, 1fr)',
                                  gap: 0.75,
                                  maxHeight: 180,
                                  overflowY: 'auto',
                                  p: 0.5,
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  bgcolor: 'background.paper'
                                }}
                              >
                                {availableSlots.map((slot, idx) => (
                                  <Chip
                                    key={idx}
                                    label={formatTime12h(slot.time)}
                                    size='small'
                                    variant={startTime === slot.time ? 'filled' : 'outlined'}
                                    color={startTime === slot.time ? 'primary' : slot.available ? 'default' : 'default'}
                                    disabled={!slot.available}
                                    onClick={() => slot.available && setStartTime(slot.time)}
                                    sx={{
                                      fontSize: '0.7rem',
                                      height: 28,
                                      cursor: slot.available ? 'pointer' : 'not-allowed',
                                      opacity: slot.available ? 1 : 0.4,
                                      bgcolor: startTime === slot.time ? 'primary.main' : slot.available ? 'transparent' : 'action.disabledBackground',
                                      '&:hover': slot.available && startTime !== slot.time ? {
                                        bgcolor: 'primary.lighter',
                                        borderColor: 'primary.main'
                                      } : {},
                                      '& .MuiChip-label': {
                                        px: 1
                                      }
                                    }}
                                  />
                                ))}
                              </Box>
                              {startTime && (
                                <Paper sx={{ p: 1.5, mt: 1.5, bgcolor: 'success.lighter', border: 1, borderColor: 'success.main' }}>
                                  <Typography variant='body2' color='success.dark' fontWeight={500}>
                                    <i className='ri-check-line' style={{ marginRight: 8 }} />
                                    Selected: {formatTime12h(startTime)} - {formatTime12h(endTime)}
                                  </Typography>
                                  <Typography variant='caption' color='success.dark'>
                                    {serviceDuration} minute {serviceName || 'service'}
                                  </Typography>
                                </Paper>
                              )}
                            </Box>
                          )
                        })()}
                      </Box>
                    )}

                    {/* Manual Time Selection (fallback when no staff/service selected) */}
                    {(!staffId || !serviceId) && (
                      <Box sx={{ mt: 1.5 }}>
                        <TimeSelectField
                          label='Start Time'
                          value={startTime}
                          onChange={setStartTime}
                          size='small'
                          fullWidth
                        />
                        {serviceId && (
                          <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
                            End time: {endTime} (based on {serviceDuration}min service duration)
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Prompt to select staff and service first */}
                    {(!staffId || !serviceId) && (
                      <Paper sx={{ p: 1.5, mt: 1.5, bgcolor: 'info.lighter', border: 1, borderColor: 'info.main' }}>
                        <Typography variant='caption' color='info.dark'>
                          <i className='ri-information-line' style={{ marginRight: 6 }} />
                          Select a staff member and service to see available time slots
                        </Typography>
                      </Paper>
                    )}
                  </Box>

                  <Divider />

                  {/* Staff Selection (only dynamic staff) */}
                  <FormControl fullWidth size='small' required>
                    <InputLabel>Staff Member</InputLabel>
                    <Select value={staffId} label='Staff Member' onChange={e => setStaffId(e.target.value)}>
                      <MenuItem value=''>Select staff</MenuItem>
                      {dynamicStaff.map(staff => (
                        <MenuItem key={staff.id} value={staff.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {getInitials(staff.name)}
                            </Avatar>
                            {staff.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Availability Warning */}
                  {availabilityWarning && (
                    <Paper sx={{ p: 1.5, bgcolor: 'warning.lighter', border: 1, borderColor: 'warning.main' }}>
                      <Typography variant='body2' color='warning.dark'>
                        <i className='ri-alert-line' style={{ marginRight: 8 }} />
                        {availabilityWarning}
                      </Typography>
                    </Paper>
                  )}

                  <Divider />

                  {/* Service Selection */}
                  <FormControl fullWidth size='small' required>
                    <InputLabel>Service</InputLabel>
                    <Select value={serviceId} label='Service' onChange={e => handleServiceChange(e.target.value)}>
                      <MenuItem value=''>Select service</MenuItem>
                      {mockServices.map(svc => (
                        <MenuItem key={svc.id} value={svc.id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span>{svc.name}</span>
                            <Typography variant='caption' color='text.secondary'>
                              {svc.duration}min • ${svc.price}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  {/* Booking Status */}
                  <FormControl fullWidth size='small'>
                    <InputLabel>Booking Status</InputLabel>
                    <Select
                      value={status}
                      label='Booking Status'
                      onChange={e => setStatus(e.target.value as AppointmentStatus)}
                    >
                      <MenuItem value='pending'>Pending / Unconfirmed</MenuItem>
                      <MenuItem value='need_confirm'>Confirmation</MenuItem>
                      <MenuItem value='attended'>Attended</MenuItem>
                      <MenuItem value='confirmed'>Confirmed</MenuItem>
                      <MenuItem value='no_show'>No Show</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={requestedByClient}
                        onChange={e => setRequestedByClient(e.target.checked)}
                        // icon={<i className='ri-heart-line' />}
                        checkedIcon={
                          <i className='ri-heart-fill' style={{ color: 'var(--mui-palette-customColors-coral)' }} />
                        }
                      />
                    }
                    label='Requested by client'
                  />

                  <Divider />

                  {/* Payment Status */}
                  <FormControl fullWidth size='small' sx={{ mb: 0.5 }}>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={paymentStatus}
                      label='Payment Status'
                      onChange={e => setPaymentStatus(e.target.value as 'paid' | 'unpaid')}
                    >
                      <MenuItem value='unpaid'>Unpaid</MenuItem>
                      <MenuItem value='paid'>Paid</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Payment Reference */}
                  <TextField
                    fullWidth
                    label='Payment Reference Number'
                    value={instapayReference}
                    onChange={e => setInstapayReference(e.target.value)}
                    size='small'
                    placeholder='Enter payment reference'
                  />
                </Stack>
              ) : (
                // EDIT MODE - Simple, clean read-only view
                <Stack spacing={1.5}>
                  {/* Booking Info - Clean compact display */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'monospace' }}>
                      {bookingReference}
                    </Typography>
                  </Box>

                  {/* Client Name - Main heading */}
                  <Typography variant='h6' fontWeight={600}>
                    {clientName || 'Unknown Client'}
                  </Typography>

                  {/* Contact Info - Compact single line */}
                  <Typography variant='body2' color='text.secondary'>
                    {[clientEmail, clientPhone].filter(Boolean).join(' • ') || 'No contact info'}
                  </Typography>

                  {/* Service & Time - Key info */}
                  <Box sx={{ py: 1.5 }}>
                    <Typography variant='body1' fontWeight={500}>
                      {serviceName || 'Service'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {formatShortDate(date)} • {formatTime12h(startTime)} - {formatTime12h(endTime)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      with {mockStaff.find(s => s.id === staffId)?.name || 'Staff'} • {serviceDuration} min
                    </Typography>
                  </Box>

                  {/* Price */}
                  <Typography variant='h5' fontWeight={600} color='primary.main'>
                    ${servicePrice.toFixed(2)}
                  </Typography>

                  {/* Status indicators - compact chips */}
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', py: 1 }}>
                    <Chip
                      size='small'
                      label={status.replace('_', ' ')}
                      color={getStatusColor(status) as any}
                      sx={{ textTransform: 'capitalize' }}
                    />
                    <Chip
                      size='small'
                      label={paymentStatus}
                      color={paymentStatus === 'paid' ? 'success' : 'warning'}
                      variant='outlined'
                      sx={{ textTransform: 'capitalize' }}
                    />
                    {requestedByClient && (
                      <Chip
                        size='small'
                        icon={<i className='ri-heart-fill' style={{ fontSize: '0.75rem' }} />}
                        label='Requested'
                        variant='outlined'
                        sx={{ '& .MuiChip-icon': { color: 'var(--mui-palette-customColors-coral)' } }}
                      />
                    )}
                    {starred && (
                      <Chip
                        size='small'
                        icon={<i className='ri-star-fill' style={{ fontSize: '0.75rem' }} />}
                        label='Starred'
                        variant='outlined'
                        sx={{ '& .MuiChip-icon': { color: '#fbbf24' } }}
                      />
                    )}
                  </Box>

                  {/* Editable controls - Clean section */}
                  <Box sx={{ pt: 2, mt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant='caption' color='text.secondary' fontWeight={600} sx={{ mb: 1.5, display: 'block' }}>
                      UPDATE STATUS
                    </Typography>

                    <Stack spacing={1.5}>
                      <FormControl fullWidth size='small'>
                        <InputLabel>Booking Status</InputLabel>
                        <Select
                          value={status}
                          label='Booking Status'
                          onChange={e => setStatus(e.target.value as AppointmentStatus)}
                        >
                          <MenuItem value='pending'>Pending</MenuItem>
                          <MenuItem value='need_confirm'>Needs Confirmation</MenuItem>
                          <MenuItem value='confirmed'>Confirmed</MenuItem>
                          <MenuItem value='attended'>Attended</MenuItem>
                          <MenuItem value='no_show'>No Show</MenuItem>
                        </Select>
                      </FormControl>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <FormControl size='small' sx={{ flex: 1 }}>
                          <InputLabel>Payment</InputLabel>
                          <Select
                            value={paymentStatus}
                            label='Payment'
                            onChange={e => setPaymentStatus(e.target.value as 'paid' | 'unpaid')}
                          >
                            <MenuItem value='unpaid'>Unpaid</MenuItem>
                            <MenuItem value='paid'>Paid</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label='Reference'
                          value={instapayReference}
                          onChange={e => setInstapayReference(e.target.value)}
                          size='small'
                          placeholder='Payment ref'
                          sx={{ flex: 1.5 }}
                        />
                      </Box>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={starred}
                            onChange={e => setStarred(e.target.checked)}
                            size='small'
                            icon={<i className='ri-star-line' />}
                            checkedIcon={<i className='ri-star-fill' style={{ color: '#fbbf24' }} />}
                          />
                        }
                        label={<Typography variant='body2'>Star this booking</Typography>}
                      />
                    </Stack>
                  </Box>
                </Stack>
              )}
            </>
          )}

          {/* ===== STATIC/FIXED MODE ===== */}
          {effectiveSchedulingMode === 'static' &&
            (() => {
              // Calculate capacity - use LOCAL state (slotClients) for accurate real-time count
              // This ensures the UI reflects unsaved changes immediately

              // Determine slot ID and slot data synchronously for immediate display
              let effectiveSlotId = selectedSlotId
              let displaySlotData = realSlotData

              // If no slotId in state, try to determine it from event properties
              if (!effectiveSlotId && existingEvent) {
                const resolved = resolveSlotForEvent(existingEvent)
                if (resolved?.slotId) {
                  effectiveSlotId = resolved.slotId
                  displaySlotData = resolved.slot || displaySlotData
                }
              }

              // Get slot data synchronously for display (if not already set above)
              if (effectiveSlotId && !displaySlotData) {
                displaySlotData = staticSlots.find(s => s.id === effectiveSlotId)
                console.log('⚠️ DRAWER Sync slot data fetch:', {
                  effectiveSlotId,
                  found: !!displaySlotData,
                  displaySlotData
                })
              }

              // Get total capacity from slot data
              let totalCapacity = displaySlotData?.capacity ?? getSlotCapacity()

              // Use slotClients.length for real-time capacity tracking
              // This ensures the UI updates immediately when adding/removing clients
              const bookedCount = slotClients.length

              console.log('💡 DRAWER Capacity calculation:', {
                selectedSlotId,
                effectiveSlotId,
                hasRealSlotData: !!realSlotData,
                hasDisplaySlotData: !!displaySlotData,
                totalCapacity,
                bookedCount,
                slotClientsLength: slotClients.length,
                slotClients,
                calculationMethod: 'slotClients.length (real-time)'
              })
              const availableCapacity = totalCapacity - bookedCount
              const isLow = availableCapacity < totalCapacity * 0.3
              const isFull = availableCapacity === 0

              return (
                <>
                  <Stack spacing={2.5}>
                  {/* Session Info Header */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      SESSION INFORMATION
                    </Typography>
                    <Typography variant='body1' fontWeight={500}>
                      {serviceName || 'Group Session'} • {formatShortDate(date)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {startTime} - {endTime}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Capacity Display */}
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: isFull ? 'error.lighter' : isLow ? 'warning.lighter' : 'success.lighter',
                      border: 1,
                      borderColor: isFull ? 'error.main' : isLow ? 'warning.main' : 'success.main',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => setIsSessionClientsOpen(true)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          Capacity Status
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {bookedCount} booked • {availableCapacity} spots remaining
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                          Click to manage session clients
                        </Typography>
                      </Box>
                      <Chip
                        label={`${bookedCount}/${totalCapacity}`}
                        size='small'
                        color={isFull ? 'error' : isLow ? 'warning' : 'success'}
                        icon={<i className='ri-user-line' style={{ fontSize: '0.75rem' }} />}
                      />
                    </Box>
                  </Paper>

                  </Stack>
                  <Dialog
                  open={isSessionClientsOpen}
                  onClose={() => {
                    setIsSessionClientsOpen(false)
                    setIsAddingClient(false)
                  }}
                  maxWidth='md'
                  fullWidth
                  PaperProps={{ sx: { borderRadius: 2 } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                    <Box>
                      <Typography variant='h6' fontWeight={600}>
                        Session Clients
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {serviceName || 'Group Session'} • {formatShortDate(date)} • {startTime} - {endTime}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => setIsSessionClientsOpen(false)} size='small'>
                      <i className='ri-close-line' />
                    </IconButton>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2.5 }}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: isFull ? 'error.lighter' : isLow ? 'warning.lighter' : 'success.lighter',
                        border: 1,
                        borderColor: isFull ? 'error.main' : isLow ? 'warning.main' : 'success.main',
                        mb: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant='body2' fontWeight={600}>
                            Capacity Status
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {bookedCount} booked • {availableCapacity} spots remaining
                          </Typography>
                        </Box>
                        <Chip
                          label={`${bookedCount}/${totalCapacity}`}
                          size='small'
                          color={isFull ? 'error' : isLow ? 'warning' : 'success'}
                          icon={<i className='ri-user-line' style={{ fontSize: '0.75rem' }} />}
                        />
                      </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant='caption' color='text.secondary' fontWeight={600}>
                        BOOKED CLIENTS ({slotClients.length})
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      {slotClients.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }} variant='outlined'>
                          <Typography variant='body2' color='text.secondary'>
                            No clients booked yet
                          </Typography>
                        </Paper>
                      ) : (
                        slotClients.map(client => (
                          <Paper key={client.id} sx={{ p: 2 }} variant='outlined'>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 1.5
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                                  {getInitials(client.name)}
                                </Avatar>
                                <Box>
                                  <Typography variant='body2' fontWeight={600}>
                                    {client.name}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    Booking Ref: {client.bookingRef}
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton
                                size='small'
                                onClick={() => handleRemoveClientFromSlot(client.id)}
                                sx={{ color: 'error.main' }}
                              >
                                <i className='ri-delete-bin-line' />
                              </IconButton>
                            </Box>

                            <Stack spacing={1} sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className='ri-mail-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
                                <Typography variant='body2' color={client.email ? 'text.primary' : 'text.secondary'}>
                                  {client.email || 'No email'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className='ri-phone-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
                                <Typography variant='body2' color={client.phone ? 'text.primary' : 'text.secondary'}>
                                  {client.phone || 'No phone'}
                                </Typography>
                              </Box>
                              <Typography variant='caption' color='text.secondary'>
                                Added:{' '}
                                {new Date(client.bookedAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </Typography>
                            </Stack>

                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                              <FormControl size='small' sx={{ minWidth: 140, flex: 1 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                  value={client.status}
                                  label='Status'
                                  onChange={e =>
                                    handleClientStatusChange(client.id, e.target.value as SlotClient['status'])
                                  }
                                >
                                  <MenuItem value='confirmed'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <i
                                        className='ri-checkbox-circle-line'
                                        style={{ color: 'var(--mui-palette-success-main)' }}
                                      />
                                      Confirmed
                                    </Box>
                                  </MenuItem>
                                  <MenuItem value='pending'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <i className='ri-time-line' style={{ color: 'var(--mui-palette-warning-main)' }} />
                                      Not Yet Confirmed / Pending Confirmation
                                    </Box>
                                  </MenuItem>
                                  <MenuItem value='no_show'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <i className='ri-close-circle-line' style={{ color: 'var(--mui-palette-error-main)' }} />
                                      No Show
                                    </Box>
                                  </MenuItem>
                                  <MenuItem value='attended'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <i className='ri-check-double-line' style={{ color: 'var(--mui-palette-info-main)' }} />
                                      Attended
                                    </Box>
                                  </MenuItem>
                                </Select>
                              </FormControl>
                              <Box sx={{ minWidth: 160, flex: 1 }}>
                                <TimeSelectField
                                  label='Arrival Time'
                                  value={client.arrivalTime || ''}
                                  onChange={time => handleClientArrivalChange(client.id, time)}
                                  size='small'
                                  fullWidth
                                />
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                              <FormControl size='small' sx={{ minWidth: 140, flex: 1 }}>
                                <InputLabel>Payment Status</InputLabel>
                                <Select
                                  value={client.paymentStatus}
                                  label='Payment Status'
                                  onChange={e =>
                                    handleClientPaymentStatusChange(client.id, e.target.value as 'paid' | 'unpaid')
                                  }
                                >
                                  <MenuItem value='unpaid'>Unpaid</MenuItem>
                                  <MenuItem value='paid'>Paid</MenuItem>
                                </Select>
                              </FormControl>
                              <FormControl size='small' sx={{ minWidth: 160, flex: 1 }}>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                  value={client.paymentMethod}
                                  label='Payment Method'
                                  onChange={e =>
                                    handleClientPaymentMethodChange(client.id, e.target.value as PaymentMethod)
                                  }
                                >
                                  <MenuItem value='pay_on_arrival'>Pay on Arrival</MenuItem>
                                  <MenuItem value='mock_card'>Card (Mock)</MenuItem>
                                </Select>
                              </FormControl>
                              <TextField
                                fullWidth
                                label='Payment Reference Number'
                                value={client.paymentReference}
                                onChange={e => handleClientPaymentReferenceChange(client.id, e.target.value)}
                                size='small'
                                placeholder='Enter payment reference'
                                sx={{ minWidth: 200, flex: 2 }}
                              />
                            </Box>
                          </Paper>
                        ))
                      )}

                      {isAddingClient ? (
                        <Paper sx={{ p: 2, border: '2px solid', borderColor: 'primary.main' }} variant='outlined'>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant='body2' fontWeight={600}>
                              Add New Client to Session
                            </Typography>
                            <IconButton size='small' onClick={() => setIsAddingClient(false)}>
                              <i className='ri-close-line' />
                            </IconButton>
                          </Box>

                          <Box
                            onClick={() => setIsClientPickerOpen(true)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              mb: 2,
                              border: '1px dashed',
                              borderColor: 'divider',
                              borderRadius: 1,
                              cursor: 'pointer',
                              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                            }}
                          >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300' }}>
                              <i className='ri-user-search-line' />
                            </Avatar>
                            <Typography variant='body2' color='text.secondary'>
                              Search existing clients...
                            </Typography>
                          </Box>

                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ display: 'block', mb: 1.5, textAlign: 'center' }}
                          >
                            — or enter manually —
                          </Typography>

                          <Stack spacing={1.5}>
                            <TextField
                              fullWidth
                              label='Client Name'
                              value={newClientName}
                              onChange={e => setNewClientName(e.target.value)}
                              size='small'
                              required
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                fullWidth
                                label='Email'
                                value={newClientEmail}
                                onChange={e => {
                                  setNewClientEmail(e.target.value)
                                  if (emailError) setEmailError(null)
                                }}
                                size='small'
                                error={!!emailError}
                                helperText={emailError || ''}
                              />
                              <TextField
                                fullWidth
                                label='Phone'
                                value={newClientPhone}
                                onChange={e => {
                                  setNewClientPhone(e.target.value)
                                  if (phoneError) setPhoneError(null)
                                }}
                                size='small'
                                error={!!phoneError}
                                helperText={phoneError || ''}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Button variant='outlined' size='small' onClick={() => {
                                setIsAddingClient(false)
                                setEmailError(null)
                                setPhoneError(null)
                                setNewClientName('')
                                setNewClientEmail('')
                                setNewClientPhone('')
                              }}>
                                Cancel
                              </Button>
                              <Button variant='contained' size='small' onClick={handleAddClientToSlot}>
                                Add to Session
                              </Button>
                            </Box>
                          </Stack>
                        </Paper>
                      ) : (
                        <Button
                          fullWidth
                          variant='outlined'
                          startIcon={<i className='ri-user-add-line' />}
                          onClick={() => setIsAddingClient(true)}
                          disabled={isFull}
                          sx={{
                            borderStyle: 'dashed',
                            py: 1.5,
                            '&:hover': { borderStyle: 'solid' }
                          }}
                        >
                          {isFull ? 'Session Full - Cannot Add Clients' : 'Add Client to Session'}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                  </Dialog>
                </>
              )
            })()}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2.5, borderTop: 1, borderColor: 'divider' }}>
          {/* Validation Error */}
          {validationError && (
            <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'error.lighter', border: 1, borderColor: 'error.main' }}>
              <Typography variant='body2' color='error.dark'>
                <i className='ri-error-warning-line' style={{ marginRight: 8 }} />
                {validationError}
              </Typography>
            </Paper>
          )}

          {/* Price Display for Dynamic Mode */}
          {effectiveSchedulingMode === 'dynamic' && servicePrice > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Total
              </Typography>
              <Typography variant='h6' fontWeight={700}>
                ${servicePrice.toFixed(2)}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {mode === 'edit' && (
              <Button
                variant='outlined'
                color='error'
                onClick={() => {
                  onDelete?.(existingEvent?.id || '')
                  handleClose()
                }}
              >
                Cancel Booking
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button variant='outlined' onClick={handleClose}>
              {mode === 'edit' ? 'Close' : 'Discard'}
            </Button>
            {(mode === 'create' || effectiveSchedulingMode === 'static') && (
              <Button variant='contained' onClick={handleSave}>
                {mode === 'create' ? 'Create Booking' : 'Save Changes'}
              </Button>
            )}
            {mode === 'edit' && effectiveSchedulingMode === 'dynamic' && (
              <Button variant='contained' onClick={handleSave}>
                Update Status
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Client Picker Dialog */}
      <ClientPickerDialog
        open={isClientPickerOpen}
        onClose={() => setIsClientPickerOpen(false)}
        onSelect={handleClientSelect}
        selectedClientId={selectedClient?.id}
      />
    </Dialog>
  )
}
