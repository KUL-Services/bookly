import type { EventInput } from '@fullcalendar/core'
import type { Booking } from '@/bookly/data/types'

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth'

export type DisplayMode = 'full' | 'fit'

export type ColorScheme = 'vivid' | 'pastel'

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'need_confirm' | 'no_show'

export type PaymentStatus = 'paid' | 'unpaid'

export type SelectionMethod = 'by_client' | 'automatically'

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
  highlights: HighlightFilters
  starredIds: Set<string>
  events: CalendarEvent[]
  selectedEvent: CalendarEvent | null
  isSettingsOpen: boolean
  isNotificationsOpen: boolean
  isSidebarOpen: boolean
  isNewBookingOpen: boolean
  selectedDate: Date | null
  selectedDateRange: { start: Date; end: Date } | null
  previousStaffFilters: StaffFilter | null // For back navigation
}

export interface CalendarPreferences {
  view: CalendarView
  displayMode: DisplayMode
  colorScheme: ColorScheme
  branchFilters: BranchFilter
  staffFilters: StaffFilter
  highlights: HighlightFilters
}

export interface DateRange {
  start: Date
  end: Date
}
