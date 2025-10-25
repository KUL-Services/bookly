import { create } from 'zustand'
import { mockBookings, mockStaff } from '@/bookly/data/mock-data'
import { mapBookingToEvent, filterEvents } from './utils'
import type {
  CalendarState,
  CalendarView,
  DisplayMode,
  ColorScheme,
  BranchFilter,
  StaffFilter,
  HighlightFilters,
  CalendarEvent,
  DateRange
} from './types'

// LocalStorage keys
const STORAGE_KEYS = {
  view: 'bookly.calendar.view',
  displayMode: 'bookly.calendar.displayMode',
  colorScheme: 'bookly.calendar.colorScheme',
  branches: 'bookly.calendar.branches',
  staff: 'bookly.calendar.staff',
  highlights: 'bookly.calendar.highlights',
  starred: 'bookly.calendar.starred'
}

// Load preferences from localStorage
function loadPreference<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

// Save preference to localStorage
function savePreference<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save preference:', e)
  }
}

// Initial state
const initialBranchFilter: BranchFilter = {
  allBranches: true,
  branchIds: []
}

const initialStaffFilter: StaffFilter = {
  onlyMe: false,
  staffIds: [],
  selectedStaffId: null
}

const initialHighlights: HighlightFilters = {
  payments: [],
  statuses: [],
  selection: [],
  details: []
}

// Generate initial events from mock bookings
function getInitialEvents(): CalendarEvent[] {
  const starredIds = new Set(loadPreference<string[]>(STORAGE_KEYS.starred, []))
  return mockBookings.map(booking => {
    // Find staff ID from booking
    const staff = mockStaff.find(s => s.name === booking.staffMemberName)
    return mapBookingToEvent(booking, staff?.id || '1', starredIds)
  })
}

interface CalendarStore extends CalendarState {
  // Actions
  setView: (view: CalendarView) => void
  setDisplayMode: (mode: DisplayMode) => void
  setColorScheme: (scheme: ColorScheme) => void
  setVisibleDateRange: (range: DateRange | null) => void
  setBranchFilters: (filters: BranchFilter) => void
  setStaffFilters: (filters: StaffFilter) => void
  setHighlights: (highlights: HighlightFilters) => void
  toggleStarred: (eventId: string) => void
  updateEvent: (event: CalendarEvent) => void
  setSelectedEvent: (event: CalendarEvent | null) => void
  toggleSettings: () => void
  toggleNotifications: () => void
  toggleSidebar: () => void
  openNewBooking: (date?: Date, dateRange?: DateRange) => void
  closeNewBooking: () => void
  clearHighlights: () => void
  clearBranchFilters: () => void
  getFilteredEvents: () => CalendarEvent[]
  selectSingleStaff: (staffId: string) => void
  goBackToAllStaff: () => void
  navigateToDate: (date: Date, switchView?: CalendarView) => void
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  view: loadPreference(STORAGE_KEYS.view, 'timeGridWeek' as CalendarView),
  displayMode: loadPreference(STORAGE_KEYS.displayMode, 'full' as DisplayMode),
  colorScheme: loadPreference(STORAGE_KEYS.colorScheme, 'vivid' as ColorScheme),
  visibleDateRange: null,
  branchFilters: loadPreference(STORAGE_KEYS.branches, initialBranchFilter),
  staffFilters: loadPreference(STORAGE_KEYS.staff, initialStaffFilter),
  highlights: loadPreference(STORAGE_KEYS.highlights, initialHighlights),
  starredIds: new Set(loadPreference<string[]>(STORAGE_KEYS.starred, [])),
  events: getInitialEvents(),
  selectedEvent: null,
  isSettingsOpen: false,
  isNotificationsOpen: false,
  isSidebarOpen: true,
  isNewBookingOpen: false,
  selectedDate: null,
  selectedDateRange: null,
  previousStaffFilters: null,

  // Actions
  setView: (view) => {
    savePreference(STORAGE_KEYS.view, view)
    set({ view })
  },

  setDisplayMode: (mode) => {
    savePreference(STORAGE_KEYS.displayMode, mode)
    set({ displayMode: mode })
  },

  setColorScheme: (scheme) => {
    savePreference(STORAGE_KEYS.colorScheme, scheme)
    set({ colorScheme: scheme })
  },

  setVisibleDateRange: (range) => {
    set({ visibleDateRange: range })
  },

  setBranchFilters: (filters) => {
    savePreference(STORAGE_KEYS.branches, filters)
    set({ branchFilters: filters })
  },

  setStaffFilters: (filters) => {
    savePreference(STORAGE_KEYS.staff, filters)
    set({ staffFilters: filters })
  },

  setHighlights: (highlights) => {
    savePreference(STORAGE_KEYS.highlights, highlights)
    set({ highlights })
  },

  toggleStarred: (eventId) => {
    const { starredIds, events } = get()
    const newStarredIds = new Set(starredIds)

    if (newStarredIds.has(eventId)) {
      newStarredIds.delete(eventId)
    } else {
      newStarredIds.add(eventId)
    }

    // Update event in events array
    const updatedEvents = events.map(event =>
      event.id === eventId
        ? { ...event, extendedProps: { ...event.extendedProps, starred: newStarredIds.has(eventId) } }
        : event
    )

    savePreference(STORAGE_KEYS.starred, Array.from(newStarredIds))
    set({ starredIds: newStarredIds, events: updatedEvents })
  },

  updateEvent: (updatedEvent) => {
    const { events } = get()
    const newEvents = events.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
    set({ events: newEvents })
  },

  setSelectedEvent: (event) => {
    set({ selectedEvent: event })
  },

  toggleSettings: () => {
    set(state => ({ isSettingsOpen: !state.isSettingsOpen, isNotificationsOpen: false }))
  },

  toggleNotifications: () => {
    set(state => ({ isNotificationsOpen: !state.isNotificationsOpen, isSettingsOpen: false }))
  },

  toggleSidebar: () => {
    set(state => ({ isSidebarOpen: !state.isSidebarOpen }))
  },

  openNewBooking: (date, dateRange) => {
    set({ isNewBookingOpen: true, selectedDate: date || null, selectedDateRange: dateRange || null })
  },

  closeNewBooking: () => {
    set({ isNewBookingOpen: false, selectedDate: null, selectedDateRange: null })
  },

  clearHighlights: () => {
    const cleared = initialHighlights
    savePreference(STORAGE_KEYS.highlights, cleared)
    set({ highlights: cleared })
  },

  clearBranchFilters: () => {
    const cleared = initialBranchFilter
    savePreference(STORAGE_KEYS.branches, cleared)
    set({ branchFilters: cleared })
  },

  getFilteredEvents: () => {
    const { events, visibleDateRange, branchFilters, staffFilters, highlights } = get()
    return filterEvents(events, {
      range: visibleDateRange,
      branchFilters,
      staffFilters,
      highlights
    })
  },

  selectSingleStaff: (staffId) => {
    const { staffFilters } = get()
    // Save current filters for back navigation
    set({
      previousStaffFilters: { ...staffFilters },
      staffFilters: {
        ...staffFilters,
        selectedStaffId: staffId,
        staffIds: [staffId]
      }
    })
  },

  goBackToAllStaff: () => {
    const { previousStaffFilters } = get()
    if (previousStaffFilters) {
      set({
        staffFilters: { ...previousStaffFilters, selectedStaffId: null },
        previousStaffFilters: null
      })
    } else {
      // Fallback: reset to show all staff
      set({
        staffFilters: { ...initialStaffFilter },
        previousStaffFilters: null
      })
    }
  },

  navigateToDate: (date, switchView) => {
    if (switchView) {
      savePreference(STORAGE_KEYS.view, switchView)
      set({ view: switchView })
    }
    // The actual navigation happens in the component via calendarRef
    // This action is here to trigger the view switch if needed
  }
}))
