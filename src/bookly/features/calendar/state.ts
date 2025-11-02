import { create } from 'zustand'
import { mockBookings, mockStaff, mockRooms, mockStaticServiceSlots } from '@/bookly/data/mock-data'
import { mapBookingToEvent, filterEvents } from './utils'
import type {
  CalendarState,
  CalendarView,
  DisplayMode,
  ColorScheme,
  BranchFilter,
  StaffFilter,
  RoomFilter,
  HighlightFilters,
  CalendarEvent,
  DateRange,
  SchedulingMode,
  Room,
  StaticServiceSlot
} from './types'

// LocalStorage keys
const STORAGE_KEYS = {
  view: 'bookly.calendar.view',
  displayMode: 'bookly.calendar.displayMode',
  colorScheme: 'bookly.calendar.colorScheme',
  branches: 'bookly.calendar.branches',
  staff: 'bookly.calendar.staff',
  rooms: 'bookly.calendar.rooms',
  highlights: 'bookly.calendar.highlights',
  starred: 'bookly.calendar.starred',
  schedulingMode: 'bookly.calendar.schedulingMode'
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

const initialRoomFilter: RoomFilter = {
  allRooms: true,
  roomIds: []
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
  setRoomFilters: (filters: RoomFilter) => void
  setHighlights: (highlights: HighlightFilters) => void
  toggleStarred: (eventId: string) => void
  createEvent: (event: CalendarEvent) => void
  updateEvent: (event: CalendarEvent) => void
  deleteEvent: (eventId: string) => void
  setSelectedEvent: (event: CalendarEvent | null) => void
  toggleSettings: () => void
  toggleNotifications: () => void
  toggleSidebar: () => void
  openNewBooking: (date?: Date, dateRange?: DateRange) => void
  closeNewBooking: () => void
  openAppointmentDrawer: (event: CalendarEvent) => void
  closeAppointmentDrawer: () => void
  clearError: () => void
  clearHighlights: () => void
  clearBranchFilters: () => void
  clearRoomFilters: () => void
  getFilteredEvents: () => CalendarEvent[]
  selectSingleStaff: (staffId: string) => void
  goBackToAllStaff: () => void
  navigateToDate: (date: Date, switchView?: CalendarView) => void
  // Static/Dynamic scheduling actions
  setSchedulingMode: (mode: SchedulingMode) => void
  getRoomsByBranch: (branchId: string) => Room[]
  getSlotsForDate: (date: Date, branchId?: string, roomId?: string) => StaticServiceSlot[]
  getSlotBookings: (slotId: string, date: Date) => CalendarEvent[]
  isSlotAvailable: (slotId: string, date: Date) => { available: boolean; remainingCapacity: number; total: number }
  // Staff concurrent booking checking (for dynamic mode)
  getConcurrentStaffBookings: (staffId: string, start: Date, end: Date) => CalendarEvent[]
  isStaffAvailableForBooking: (staffId: string, start: Date, end: Date, excludeEventId?: string) => { available: boolean; currentCount: number; maxAllowed: number }
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  view: loadPreference(STORAGE_KEYS.view, 'timeGridWeek' as CalendarView),
  displayMode: loadPreference(STORAGE_KEYS.displayMode, 'full' as DisplayMode),
  colorScheme: loadPreference(STORAGE_KEYS.colorScheme, 'vivid' as ColorScheme),
  visibleDateRange: null,
  branchFilters: loadPreference(STORAGE_KEYS.branches, initialBranchFilter),
  staffFilters: loadPreference(STORAGE_KEYS.staff, initialStaffFilter),
  roomFilters: loadPreference(STORAGE_KEYS.rooms, initialRoomFilter),
  highlights: loadPreference(STORAGE_KEYS.highlights, initialHighlights),
  starredIds: new Set(loadPreference<string[]>(STORAGE_KEYS.starred, [])),
  events: getInitialEvents(),
  selectedEvent: null,
  isSettingsOpen: false,
  isNotificationsOpen: false,
  isSidebarOpen: true,
  isNewBookingOpen: false,
  isAppointmentDrawerOpen: false,
  selectedDate: null,
  selectedDateRange: null,
  previousStaffFilters: null,
  lastActionError: null,
  // Static/Dynamic scheduling
  schedulingMode: loadPreference(STORAGE_KEYS.schedulingMode, 'dynamic' as SchedulingMode),
  rooms: mockRooms,
  staticSlots: mockStaticServiceSlots,

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

  setRoomFilters: (filters) => {
    savePreference(STORAGE_KEYS.rooms, filters)
    set({ roomFilters: filters })
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

  createEvent: (newEvent) => {
    const { events, schedulingMode } = get()

    // Validate capacity for static scheduling
    if (schedulingMode === 'static' && newEvent.extendedProps.slotId) {
      const slotDate = new Date(newEvent.start)
      const { available, remainingCapacity } = get().isSlotAvailable(newEvent.extendedProps.slotId, slotDate)
      const partySize = newEvent.extendedProps.partySize || 1

      if (!available || remainingCapacity < partySize) {
        set({ lastActionError: `Cannot book: Only ${remainingCapacity} spot(s) remaining, but ${partySize} requested.` })
        return
      }
    }

    // Validate concurrent bookings for dynamic scheduling
    if (schedulingMode === 'dynamic' && newEvent.extendedProps.staffId) {
      const { available, currentCount, maxAllowed } = get().isStaffAvailableForBooking(
        newEvent.extendedProps.staffId,
        new Date(newEvent.start),
        new Date(newEvent.end)
      )

      if (!available) {
        const staffName = newEvent.extendedProps.staffName || 'Staff member'
        set({ lastActionError: `${staffName} is fully booked at this time (${currentCount}/${maxAllowed} concurrent appointments).` })
        return
      }
    }

    set({ events: [...events, newEvent], lastActionError: null })
  },

  updateEvent: (updatedEvent) => {
    const { events, schedulingMode } = get()
    const oldEvent = events.find(e => e.id === updatedEvent.id)

    // Validate capacity for static scheduling when changing slots or party size
    if (schedulingMode === 'static' && updatedEvent.extendedProps.slotId) {
      const slotChanged = oldEvent?.extendedProps.slotId !== updatedEvent.extendedProps.slotId
      const partySizeChanged = (oldEvent?.extendedProps.partySize || 1) !== (updatedEvent.extendedProps.partySize || 1)

      if (slotChanged || partySizeChanged) {
        const slotDate = new Date(updatedEvent.start)

        // Temporarily remove the old event from capacity calculation
        const tempEvents = events.filter(e => e.id !== updatedEvent.id)
        const tempGet = () => ({ ...get(), events: tempEvents })
        const bookingsForSlot = tempGet().events.filter(event => {
          const eventDateStr = new Date(event.start).toISOString().split('T')[0]
          const slotDateStr = slotDate.toISOString().split('T')[0]
          return event.extendedProps.slotId === updatedEvent.extendedProps.slotId &&
                 eventDateStr === slotDateStr &&
                 event.extendedProps.status !== 'cancelled'
        })

        const slot = get().staticSlots.find(s => s.id === updatedEvent.extendedProps.slotId)
        if (slot) {
          const occupiedSpots = bookingsForSlot.reduce((sum, event) => {
            return sum + (event.extendedProps.partySize || 1)
          }, 0)
          const remainingCapacity = slot.capacity - occupiedSpots
          const partySize = updatedEvent.extendedProps.partySize || 1

          if (remainingCapacity < partySize) {
            set({ lastActionError: `Cannot update: Only ${remainingCapacity} spot(s) remaining, but ${partySize} requested.` })
            return
          }
        }
      }
    }

    // Validate concurrent bookings for dynamic scheduling when changing staff or time
    if (schedulingMode === 'dynamic' && updatedEvent.extendedProps.staffId) {
      const staffChanged = oldEvent?.extendedProps.staffId !== updatedEvent.extendedProps.staffId
      const timeChanged =
        oldEvent?.start.toString() !== updatedEvent.start.toString() ||
        oldEvent?.end.toString() !== updatedEvent.end.toString()

      if (staffChanged || timeChanged) {
        // Check availability, excluding the current event from the count
        const { available, currentCount, maxAllowed } = get().isStaffAvailableForBooking(
          updatedEvent.extendedProps.staffId,
          new Date(updatedEvent.start),
          new Date(updatedEvent.end),
          updatedEvent.id // Exclude this event from count
        )

        if (!available) {
          const staffName = updatedEvent.extendedProps.staffName || 'Staff member'
          set({ lastActionError: `${staffName} is fully booked at this time (${currentCount}/${maxAllowed} concurrent appointments).` })
          return
        }
      }
    }

    const newEvents = events.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
    set({ events: newEvents, lastActionError: null })
  },

  deleteEvent: (eventId) => {
    const { events, starredIds, selectedEvent } = get()
    const newEvents = events.filter(event => event.id !== eventId)
    const newStarredIds = new Set(starredIds)
    newStarredIds.delete(eventId)

    // Update starred in localStorage
    savePreference(STORAGE_KEYS.starred, Array.from(newStarredIds))

    // Clear selected event if it's the one being deleted
    const newSelectedEvent = selectedEvent?.id === eventId ? null : selectedEvent

    set({ events: newEvents, starredIds: newStarredIds, selectedEvent: newSelectedEvent })
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

  openAppointmentDrawer: (event) => {
    set({ isAppointmentDrawerOpen: true, selectedEvent: event })
  },

  closeAppointmentDrawer: () => {
    set({ isAppointmentDrawerOpen: false, selectedEvent: null })
  },

  clearError: () => {
    set({ lastActionError: null })
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

  clearRoomFilters: () => {
    const cleared = initialRoomFilter
    savePreference(STORAGE_KEYS.rooms, cleared)
    set({ roomFilters: cleared })
  },

  getFilteredEvents: () => {
    const { events, visibleDateRange, branchFilters, staffFilters, roomFilters, highlights, schedulingMode } = get()
    return filterEvents(events, {
      range: visibleDateRange,
      branchFilters,
      staffFilters,
      roomFilters,
      highlights,
      schedulingMode
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
  },

  // Static/Dynamic scheduling actions
  setSchedulingMode: (mode) => {
    savePreference(STORAGE_KEYS.schedulingMode, mode)
    set({ schedulingMode: mode })
  },

  getRoomsByBranch: (branchId) => {
    const { rooms } = get()
    return rooms.filter(room => room.branchId === branchId)
  },

  getSlotsForDate: (date, branchId, roomId) => {
    const { staticSlots } = get()
    const dayNames: Array<'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'> = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = dayNames[date.getDay()]
    const dateStr = date.toISOString().split('T')[0]

    return staticSlots.filter(slot => {
      // Match by day of week (recurring) or specific date
      const matchesDate = slot.dayOfWeek === dayOfWeek || slot.date === dateStr

      // Match by branch if provided
      const matchesBranch = !branchId || slot.branchId === branchId

      // Match by room if provided
      const matchesRoom = !roomId || slot.roomId === roomId

      return matchesDate && matchesBranch && matchesRoom
    })
  },

  // Get all bookings for a specific slot on a specific date (excluding cancelled)
  getSlotBookings: (slotId, date) => {
    const { events } = get()
    const dateStr = date.toISOString().split('T')[0]

    return events.filter(event => {
      const eventDateStr = new Date(event.start).toISOString().split('T')[0]
      const isSameSlot = event.extendedProps.slotId === slotId
      const isSameDate = eventDateStr === dateStr
      const isNotCancelled = event.extendedProps.status !== 'cancelled'

      return isSameSlot && isSameDate && isNotCancelled
    })
  },

  isSlotAvailable: (slotId, date) => {
    const { staticSlots } = get()
    const slot = staticSlots.find(s => s.id === slotId)

    if (!slot) {
      return { available: false, remainingCapacity: 0, total: 0 }
    }

    // Count active bookings (excluding cancelled)
    const bookingsForSlot = get().getSlotBookings(slotId, date)

    // Sum up party sizes (default to 1 if not specified)
    const occupiedSpots = bookingsForSlot.reduce((sum, event) => {
      return sum + (event.extendedProps.partySize || 1)
    }, 0)

    const remainingCapacity = slot.capacity - occupiedSpots

    return {
      available: remainingCapacity > 0,
      remainingCapacity,
      total: slot.capacity
    }
  },

  // Get all bookings for a staff member that overlap with the given time range (excluding cancelled)
  getConcurrentStaffBookings: (staffId, start, end) => {
    const { events } = get()

    return events.filter(event => {
      // Check if same staff
      if (event.extendedProps.staffId !== staffId) return false

      // Exclude cancelled bookings
      if (event.extendedProps.status === 'cancelled') return false

      // Check if events overlap
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      // Events overlap if: (start1 < end2) AND (end1 > start2)
      const overlaps = eventStart < end && eventEnd > start

      return overlaps
    })
  },

  isStaffAvailableForBooking: (staffId, start, end, excludeEventId) => {
    // Get the staff member from mock data
    const staffMember = mockStaff.find(s => s.id === staffId)
    const maxAllowed = staffMember?.maxConcurrentBookings || 1 // Default to 1 if not specified

    // Get concurrent bookings
    const concurrentBookings = get().getConcurrentStaffBookings(staffId, start, end)

    // Exclude the event being edited (if any)
    const relevantBookings = excludeEventId
      ? concurrentBookings.filter(event => event.id !== excludeEventId)
      : concurrentBookings

    const currentCount = relevantBookings.length

    return {
      available: currentCount < maxAllowed,
      currentCount,
      maxAllowed
    }
  }
}))
