import type { EventInput } from '@fullcalendar/core'
import type { Booking } from '@/bookly/data/types'

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth'

export type DisplayMode = 'full' | 'fit'

export type ColorScheme = 'vivid' | 'pastel'

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'need_confirm' | 'no_show'

export type PaymentStatus = 'paid' | 'unpaid'

export type SelectionMethod = 'by_client' | 'automatically'

export type SchedulingMode = 'static' | 'dynamic'

export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'

export interface Room {
  id: string
  name: string
  branchId: string
  color?: string
}

export interface StaticServiceSlot {
  id: string
  roomId: string
  branchId: string
  dayOfWeek?: DayOfWeek  // For recurring weekly slots
  date?: string          // For specific date slots (YYYY-MM-DD)
  startTime: string      // Format: "HH:MM"
  endTime: string        // Format: "HH:MM"
  serviceId: string
  serviceName: string
  capacity: number
  instructorStaffId?: string
  price: number
}

export interface CalendarEvent extends EventInput {
  id: string
  title: string
  start: Date
  end: Date
  extendedProps: {
    status: AppointmentStatus
    paymentStatus: PaymentStatus
    staffId: string
    staffName: string
    selectionMethod: SelectionMethod
    starred: boolean
    serviceName: string
    customerName: string
    price: number
    notes?: string
    bookingId: string
    slotId?: string  // For static scheduling mode - links booking to a specific slot
    roomId?: string  // For static scheduling mode - indicates which room
    partySize?: number  // For group bookings (default 1)
  }
}

export interface BranchFilter {
  allBranches: boolean
  branchIds: string[]
}

export interface StaffFilter {
  onlyMe: boolean
  staffIds: string[]
  selectedStaffId?: string | null // For single-staff view mode
}

export interface RoomFilter {
  allRooms: boolean
  roomIds: string[]
}

export interface HighlightFilters {
  payments: PaymentStatus[]
  statuses: AppointmentStatus[]
  selection: SelectionMethod[]
  details: ('starred' | 'unstarred')[]
}

export interface CalendarState {
  view: CalendarView
  displayMode: DisplayMode
  colorScheme: ColorScheme
  visibleDateRange: { start: Date; end: Date } | null
  branchFilters: BranchFilter
  staffFilters: StaffFilter
  roomFilters: RoomFilter
  highlights: HighlightFilters
  starredIds: Set<string>
  events: CalendarEvent[]
  selectedEvent: CalendarEvent | null
  isSettingsOpen: boolean
  isNotificationsOpen: boolean
  isSidebarOpen: boolean
  isNewBookingOpen: boolean
  isAppointmentDrawerOpen: boolean  // Unified drawer for view + edit
  selectedDate: Date | null
  selectedDateRange: { start: Date; end: Date } | null
  previousStaffFilters: StaffFilter | null // For back navigation
  lastActionError: string | null  // For error handling (capacity, validation, etc.)
  // Static/Dynamic scheduling
  schedulingMode: SchedulingMode
  rooms: Room[]
  staticSlots: StaticServiceSlot[]
}

export interface CalendarPreferences {
  view: CalendarView
  displayMode: DisplayMode
  colorScheme: ColorScheme
  branchFilters: BranchFilter
  staffFilters: StaffFilter
  roomFilters: RoomFilter
  highlights: HighlightFilters
  schedulingMode: SchedulingMode
}

export interface DateRange {
  start: Date
  end: Date
}
