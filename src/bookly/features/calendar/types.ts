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
  templateId?: string    // If generated from a template
  isOverride?: boolean   // If overriding a template occurrence
  isCancelled?: boolean  // If cancelling a template occurrence
  overrideDate?: string  // Specific date this override applies to (YYYY-MM-DD)
}

// Weekly pattern definition for schedule templates
export interface WeeklySlotPattern {
  id: string  // Unique ID for this pattern slot
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  serviceId: string
  serviceName: string
  roomId: string
  capacity: number
  instructorStaffId?: string
  price: number
}

// Schedule template (creates recurring weekly slots)
export interface ScheduleTemplate {
  id: string
  name: string
  businessId: string
  branchId: string
  activeFrom: Date
  activeUntil: Date | null  // null = ongoing
  isActive: boolean
  weeklyPattern: WeeklySlotPattern[]  // All slots for the week
  createdAt: Date
  updatedAt: Date
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
    branchId?: string  // Branch where this appointment takes place
    branchName?: string  // Branch name for display
    type?: 'booking' | 'timeOff' | 'reservation'  // Event type for filtering
    timeOffId?: string  // ID of time off request
    reservationId?: string  // ID of time reservation
    reason?: string  // Reason for time off/reservation
    approved?: boolean  // For time off approval status
    allDay?: boolean  // For all-day time off
    note?: string  // Additional notes
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
  workingStaffOnly: boolean // Filter to show only staff working on current date/week
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
  scheduleTemplates: ScheduleTemplate[]
  isTemplateManagementOpen: boolean  // For template management drawer
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

// ============================================================================
// Staff Management Types
// ============================================================================

export interface BreakRange {
  id: string
  start: string  // "HH:MM"
  end: string    // "HH:MM"
}

export interface StaffShift {
  id: string
  start: string  // "HH:MM"
  end: string    // "HH:MM"
  breaks?: BreakRange[]
}

export interface StaffShiftInstance extends StaffShift {
  date: string  // "YYYY-MM-DD"
  reason?: 'manual' | 'business_hours_change' | 'copy'
}

export interface WeeklyStaffHours {
  [day in DayOfWeek]: {
    isWorking: boolean
    shifts: StaffShift[]
  }
}

export interface WeeklyBusinessHours {
  [day in DayOfWeek]: {
    isOpen: boolean
    shifts: { start: string; end: string }[]
  }
}

export interface TimeReservation {
  id: string
  staffId: string
  start: Date
  end: Date
  reason: string
  note?: string
}

export type TimeOffReasonGroup = 'Personal' | 'Sick' | 'Vacation' | 'Training' | 'No-Show' | 'Late' | 'Other'

export interface TimeOffRequest {
  id: string
  staffId: string
  range: { start: Date; end: Date }
  allDay: boolean
  repeat?: { until: Date }
  reason: TimeOffReasonGroup
  approved: boolean
  note?: string
}

export interface Resource {
  id: string
  branchId: string
  name: string
  capacity: number
  floor?: string
  amenities: string[]
  color?: string
  serviceIds?: string[]  // Services assigned to this resource
}

export interface CommissionPolicy {
  id: string
  scope: 'serviceCategory' | 'service' | 'product' | 'giftCard' | 'membership' | 'package'
  scopeRefId?: string
  type: 'percent' | 'fixed'
  value: number
  appliesTo: 'serviceProvider' | 'seller'
  staffScope: 'all' | { staffIds: string[] }
}

export interface ShiftRuleSet {
  duplication: { allowCopy: boolean; allowPrint: boolean }
  tutorialsSeen: boolean
}

// ============================================================================
// Room Management Types (extends Resource with scheduling)
// ============================================================================

export interface RoomShift {
  id: string
  start: string  // "HH:MM"
  end: string    // "HH:MM"
  serviceIds: string[]  // Services available during this shift
}

export interface RoomShiftInstance extends RoomShift {
  date: string  // "YYYY-MM-DD"
  reason?: 'manual' | 'copy'
}

export interface WeeklyRoomSchedule {
  [day in DayOfWeek]: {
    isAvailable: boolean
    shifts: RoomShift[]
  }
}

export interface ManagedRoom extends Resource {
  weeklySchedule: WeeklyRoomSchedule
  shiftOverrides: RoomShiftInstance[]
}
