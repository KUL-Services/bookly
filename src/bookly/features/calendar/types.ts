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

export type ResourceType = 'staff' | 'room'

// Unified calendar resource for displaying both staff and rooms in the same view
export interface CalendarResource {
  id: string
  type: ResourceType
  name: string
  color: string
  branchId: string

  // For staff resources
  staffType?: 'dynamic' | 'static'
  roomAssignments?: Array<{
    roomId: string
    roomName: string
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
    serviceIds: string[]
  }>

  // For room resources
  capacity?: number
  serviceIds?: string[]
}

export type RoomType = 'dynamic' | 'static'

export interface Room {
  id: string
  name: string
  branchId: string
  color?: string
  roomType?: RoomType
}

export interface StaticServiceSlot {
  id: string
  roomId: string
  branchId: string
  dayOfWeek?: DayOfWeek // For recurring weekly slots
  date?: string // For specific date slots (YYYY-MM-DD)
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  serviceId: string
  serviceName: string
  capacity: number
  instructorStaffId?: string
  price: number
  templateId?: string // If generated from a template
  isOverride?: boolean // If overriding a template occurrence
  isCancelled?: boolean // If cancelling a template occurrence
  overrideDate?: string // Specific date this override applies to (YYYY-MM-DD)
}

// Weekly pattern definition for schedule templates
export interface WeeklySlotPattern {
  id: string // Unique ID for this pattern slot
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
  activeUntil: Date | null // null = ongoing
  isActive: boolean
  weeklyPattern: WeeklySlotPattern[] // All slots for the week
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
    serviceId?: string // Service ID for pre-selection
    serviceName: string
    customerName: string
    customerPhone?: string // Customer phone number for search
    customerEmail?: string // Customer email for search
    price: number
    notes?: string
    bookingId: string
    slotId?: string // For static scheduling mode - links booking to a specific slot
    roomId?: string // For static scheduling mode - indicates which room
    isStaticSlot?: boolean // Flag indicating this event belongs to a static slot
    partySize?: number // For group bookings (default 1)
    branchId?: string // Branch where this appointment takes place
    branchName?: string // Branch name for display
    type?: 'booking' | 'timeOff' | 'reservation' // Event type for filtering
    timeOffId?: string // ID of time off request
    reservationId?: string // ID of time reservation
    reason?: string // Reason for time off/reservation
    approved?: boolean // For time off approval status
    allDay?: boolean // For all-day time off
    note?: string // Additional notes
    arrivalTime?: string // Actual customer arrival/walk-in time (HH:MM format)
    instapayReference?: string // Instapay payment reference number
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
  availableNow?: boolean // Filter to show only staff available at the current moment
}

export interface RoomFilter {
  allRooms: boolean
  roomIds: string[]
  availableNow?: boolean // Filter to show only rooms available at the current moment
  availableToday?: boolean // Filter to show only rooms with availability today
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
  isAppointmentDrawerOpen: boolean // Unified drawer for view + edit
  selectedDate: Date | null
  selectedDateRange: { start: Date; end: Date } | null
  previousStaffFilters: StaffFilter | null // For back navigation
  lastActionError: string | null // For error handling (capacity, validation, etc.)
  // Static/Dynamic scheduling
  schedulingMode: SchedulingMode
  rooms: Room[]
  staticSlots: StaticServiceSlot[]
  scheduleTemplates: ScheduleTemplate[]
  isTemplateManagementOpen: boolean // For template management drawer
  // Search state
  searchQuery: string // Search query text
  searchMatchedEventIds: Set<string> // IDs of events that match the search
  isSearchActive: boolean // Whether search is active (has query)
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
  start: string // "HH:MM"
  end: string // "HH:MM"
}

export interface StaffShift {
  id: string
  start: string // "HH:MM"
  end: string // "HH:MM"
  breaks?: BreakRange[]
  capacity?: number // For static staff - max number of concurrent bookings for this shift
}

export interface StaffShiftInstance extends StaffShift {
  date: string // "YYYY-MM-DD"
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
  serviceIds?: string[] // Services assigned to this resource
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
  start: string // "HH:MM"
  end: string // "HH:MM"
  serviceIds: string[] // Services available during this shift
  capacity?: number // Optional per-slot capacity override (for flexible capacity rooms)
  staffIds?: string[] // Staff assigned to this shift (for static/fixed capacity rooms)
}

export interface RoomShiftInstance extends RoomShift {
  date: string // "YYYY-MM-DD"
  reason?: 'manual' | 'copy'
}

export interface RoomDaySchedule {
  isAvailable: boolean
  shifts: RoomShift[]
}

export interface WeeklyRoomSchedule {
  Sun: RoomDaySchedule
  Mon: RoomDaySchedule
  Tue: RoomDaySchedule
  Wed: RoomDaySchedule
  Thu: RoomDaySchedule
  Fri: RoomDaySchedule
  Sat: RoomDaySchedule
}

export interface ManagedRoom extends Resource {
  floor?: string
  amenities?: string[]
  color?: string
  description?: string
  roomType?: RoomType
  weeklySchedule: WeeklyRoomSchedule
  shiftOverrides: RoomShiftInstance[]
}
