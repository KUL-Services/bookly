'use client'

import { useState, useRef, useMemo } from 'react'
import { Box, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material'
import FullCalendar from '@fullcalendar/react'
import { useCalendarStore } from './state'
import { mockStaff } from '@/bookly/data/mock-data'
import { addDays, addWeeks, addMonths } from './utils'
import CalendarHeader from './calendar-header'
import CalendarSidebar from './calendar-sidebar'
import FullCalendarView from './fullcalendar-view'
import MultiStaffDayView from './multi-staff-day-view'
import SingleStaffDayView from './single-staff-day-view'
import MultiStaffWeekView from './multi-staff-week-view'
import SingleStaffWeekView from './single-staff-week-view'
import MultiRoomDayView from './multi-room-day-view'
import MultiRoomWeekView from './multi-room-week-view'
import AppointmentDrawer from './appointment-drawer'
import NewAppointmentDrawer from './new-appointment-drawer'
import CalendarSettings from './calendar-settings'
import CalendarNotifications from './calendar-notifications'
import type { CalendarEvent, DateRange } from './types'

interface CalendarShellProps {
  lang: string
}

export default function CalendarShell({ lang }: CalendarShellProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const calendarRef = useRef<FullCalendar>(null)

  // Zustand store
  const view = useCalendarStore(state => state.view)
  const displayMode = useCalendarStore(state => state.displayMode)
  const colorScheme = useCalendarStore(state => state.colorScheme)
  const highlights = useCalendarStore(state => state.highlights)
  const staffFilters = useCalendarStore(state => state.staffFilters)
  const roomFilters = useCalendarStore(state => state.roomFilters)
  const branchFilters = useCalendarStore(state => state.branchFilters)
  const schedulingMode = useCalendarStore(state => state.schedulingMode)
  const isSettingsOpen = useCalendarStore(state => state.isSettingsOpen)
  const isNotificationsOpen = useCalendarStore(state => state.isNotificationsOpen)
  const isSidebarOpen = useCalendarStore(state => state.isSidebarOpen)
  const isNewBookingOpen = useCalendarStore(state => state.isNewBookingOpen)
  const lastActionError = useCalendarStore(state => state.lastActionError)
  const visibleDateRange = useCalendarStore(state => state.visibleDateRange)
  const getFilteredEvents = useCalendarStore(state => state.getFilteredEvents)
  const getRoomsByBranch = useCalendarStore(state => state.getRoomsByBranch)
  const setVisibleDateRange = useCalendarStore(state => state.setVisibleDateRange)
  const openNewBooking = useCalendarStore(state => state.openNewBooking)
  const closeNewBooking = useCalendarStore(state => state.closeNewBooking)
  const createEvent = useCalendarStore(state => state.createEvent)
  const toggleSettings = useCalendarStore(state => state.toggleSettings)
  const toggleNotifications = useCalendarStore(state => state.toggleNotifications)
  const selectSingleStaff = useCalendarStore(state => state.selectSingleStaff)
  const goBackToAllStaff = useCalendarStore(state => state.goBackToAllStaff)
  const openAppointmentDrawer = useCalendarStore(state => state.openAppointmentDrawer)
  const clearError = useCalendarStore(state => state.clearError)

  // Local state
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get filtered events
  const events = getFilteredEvents()

  // Determine which staff are being shown (dynamic mode)
  const activeStaffIds = useMemo(() => {
    if (schedulingMode === 'static') return []

    if (staffFilters.onlyMe) {
      return ['1'] // Current user ID
    }
    // If no specific staff selected, show all staff (first 7 for performance)
    return staffFilters.staffIds.length > 0 ? staffFilters.staffIds : mockStaff.slice(0, 7).map(s => s.id)
  }, [staffFilters, schedulingMode])

  const activeStaffMembers = useMemo(() => {
    return mockStaff.filter(staff => activeStaffIds.includes(staff.id))
  }, [activeStaffIds])

  // Determine which rooms are being shown (static mode)
  const activeRooms = useMemo(() => {
    if (schedulingMode === 'dynamic') return []

    // Get first branch ID from branch filters, or default to '1-1'
    const branchId = branchFilters.allBranches
      ? '1-1'
      : branchFilters.branchIds[0] || '1-1'

    const branchRooms = getRoomsByBranch(branchId)

    // If specific rooms are selected, filter to those
    if (!roomFilters.allRooms && roomFilters.roomIds.length > 0) {
      return branchRooms.filter(room => roomFilters.roomIds.includes(room.id))
    }

    // Otherwise show all rooms for the branch (limit to first 7 for performance)
    return branchRooms.slice(0, 7)
  }, [schedulingMode, branchFilters, roomFilters, getRoomsByBranch])

  // Determine which view to show
  const shouldUseCustomDayView = view === 'timeGridDay' && (
    (schedulingMode === 'dynamic' && activeStaffIds.length > 0) ||
    (schedulingMode === 'static' && activeRooms.length > 0)
  )
  const shouldUseCustomWeekView = view === 'timeGridWeek' && (
    (schedulingMode === 'dynamic' && activeStaffIds.length > 0) ||
    (schedulingMode === 'static' && activeRooms.length > 0)
  )
  const isSingleStaffView = schedulingMode === 'dynamic' && staffFilters.selectedStaffId !== null && staffFilters.selectedStaffId !== undefined
  const isMultiStaffView = schedulingMode === 'dynamic' && activeStaffIds.length > 1 && !isSingleStaffView
  const isMultiRoomView = schedulingMode === 'static' && activeRooms.length > 0

  // Calendar API navigation
  const handlePrev = () => {
    // For custom views, handle navigation manually
    if (shouldUseCustomDayView || shouldUseCustomWeekView) {
      let newDate: Date
      if (view === 'timeGridDay') {
        newDate = addDays(currentDate, -1)
      } else if (view === 'timeGridWeek') {
        newDate = addWeeks(currentDate, -1)
      } else {
        newDate = addMonths(currentDate, -1)
      }
      setCurrentDate(newDate)
    } else {
      const api = calendarRef.current?.getApi()
      if (api) {
        api.prev()
        setCurrentDate(api.getDate())
      }
    }
  }

  const handleNext = () => {
    // For custom views, handle navigation manually
    if (shouldUseCustomDayView || shouldUseCustomWeekView) {
      let newDate: Date
      if (view === 'timeGridDay') {
        newDate = addDays(currentDate, 1)
      } else if (view === 'timeGridWeek') {
        newDate = addWeeks(currentDate, 1)
      } else {
        newDate = addMonths(currentDate, 1)
      }
      setCurrentDate(newDate)
    } else {
      const api = calendarRef.current?.getApi()
      if (api) {
        api.next()
        setCurrentDate(api.getDate())
      }
    }
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)

    // Also update FullCalendar if it's being used
    if (!shouldUseCustomDayView && !shouldUseCustomWeekView) {
      const api = calendarRef.current?.getApi()
      if (api) {
        api.today()
      }
    }
  }

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)

    // Also update FullCalendar if it's being used
    if (!shouldUseCustomDayView && !shouldUseCustomWeekView) {
      const api = calendarRef.current?.getApi()
      if (api) {
        api.gotoDate(date)
      }
    }
  }

  // Event handlers
  const handleDateRangeChange = (range: DateRange) => {
    setVisibleDateRange(range)
    setCurrentDate(range.start)
  }

  const handleDateClick = (date: Date) => {
    // In month view, clicking a date should navigate to day view
    if (view === 'dayGridMonth') {
      useCalendarStore.getState().setView('timeGridDay')
      setCurrentDate(date)
    } else if (view === 'timeGridWeek' && !shouldUseCustomWeekView) {
      // In FullCalendar week view, clicking header navigates to day view
      useCalendarStore.getState().setView('timeGridDay')
      setCurrentDate(date)
    } else {
      // In day view, clicking opens new booking (but drag selections handled by handleSelectRange)
      openNewBooking(date)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    openAppointmentDrawer(event)
  }

  const handleSelectRange = (start: Date, end: Date) => {
    openNewBooking(start, { start, end })
  }

  const handleEventDrop = (event: CalendarEvent, start: Date, end: Date) => {
    const updatedEvent: CalendarEvent = { ...event, start, end }
    useCalendarStore.getState().updateEvent(updatedEvent)
  }

  const handleEventResize = (event: CalendarEvent, start: Date, end: Date) => {
    const updatedEvent: CalendarEvent = { ...event, start, end }
    useCalendarStore.getState().updateEvent(updatedEvent)
  }

  const handleStaffClick = (staffId: string) => {
    selectSingleStaff(staffId)
  }

  const handleBackToAllStaff = () => {
    goBackToAllStaff()
  }

  const handleSaveNewAppointment = (appointment: any) => {
    // Generate unique ID for the new event
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Convert appointment data to CalendarEvent
    const newEvent: CalendarEvent = {
      id: eventId,
      title: appointment.clientName || 'Walk-in',
      start: new Date(
        appointment.date.getFullYear(),
        appointment.date.getMonth(),
        appointment.date.getDate(),
        parseInt(appointment.startTime.split(':')[0]),
        parseInt(appointment.startTime.split(':')[1])
      ),
      end: new Date(
        appointment.date.getFullYear(),
        appointment.date.getMonth(),
        appointment.date.getDate(),
        parseInt(appointment.endTime.split(':')[0]),
        parseInt(appointment.endTime.split(':')[1])
      ),
      extendedProps: {
        staffId: appointment.staffId,
        staffName: mockStaff.find(s => s.id === appointment.staffId)?.name || 'Unknown Staff',
        serviceName: appointment.service || 'No service selected',
        customerName: appointment.clientName || 'Walk-in',
        price: appointment.servicePrice || 0,
        status: 'confirmed' as const,
        paymentStatus: 'unpaid' as const,
        selectionMethod: appointment.requestedByClient ? ('by_client' as const) : ('automatically' as const),
        notes: appointment.notes || '',
        starred: false,
        bookingId: eventId
      }
    }

    // Add to store
    createEvent(newEvent)
  }

  const handleDateClickInWeekView = (date: Date) => {
    // When clicking a date in week view, navigate to that day in day view
    useCalendarStore.getState().setView('timeGridDay')
    setCurrentDate(date)
  }

  const handleCellClickInWeekView = (staffId: string, date: Date) => {
    // When clicking on a cell (staff + date), navigate to single-staff day view for that date
    selectSingleStaff(staffId)
    useCalendarStore.getState().setView('timeGridDay')
    setCurrentDate(date)
  }

  // Render the appropriate calendar view
  const renderCalendarView = () => {
    // STATIC MODE VIEWS
    // Multiple room day view (static mode)
    if (shouldUseCustomDayView && isMultiRoomView && schedulingMode === 'static') {
      return (
        <MultiRoomDayView
          events={events}
          rooms={activeRooms}
          currentDate={currentDate}
          onEventClick={handleEventClick}
          onSlotClick={(slotId, date) => {
            // Open new booking drawer with slot prefilled
            openNewBooking(date)
          }}
        />
      )
    }

    // Multiple room week view (static mode)
    if (shouldUseCustomWeekView && isMultiRoomView && schedulingMode === 'static') {
      return (
        <MultiRoomWeekView
          events={events}
          rooms={activeRooms}
          currentDate={currentDate}
          onEventClick={handleEventClick}
          onSlotClick={(slotId, date) => {
            // Open new booking drawer with slot prefilled
            openNewBooking(date)
          }}
        />
      )
    }

    // DYNAMIC MODE VIEWS
    // Single staff day view
    if (shouldUseCustomDayView && isSingleStaffView && activeStaffMembers.length === 1) {
      return (
        <SingleStaffDayView
          events={events}
          staff={activeStaffMembers[0]}
          currentDate={currentDate}
          onEventClick={handleEventClick}
          onBack={handleBackToAllStaff}
          onTimeRangeSelect={handleSelectRange}
        />
      )
    }

    // Multiple staff day view
    if (shouldUseCustomDayView && isMultiStaffView) {
      return (
        <MultiStaffDayView
          events={events}
          staffMembers={activeStaffMembers}
          currentDate={currentDate}
          onEventClick={handleEventClick}
          onStaffClick={handleStaffClick}
          onCellClick={handleCellClickInWeekView}
        />
      )
    }

    // Single staff week view
    if (shouldUseCustomWeekView && isSingleStaffView && activeStaffMembers.length === 1) {
      return (
        <SingleStaffWeekView
          events={events}
          staff={activeStaffMembers[0]}
          currentDate={currentDate}
          onEventClick={handleEventClick}
          onBack={handleBackToAllStaff}
          onDateClick={handleDateClickInWeekView}
        />
      )
    }

    // Multiple staff week view
    if (shouldUseCustomWeekView && isMultiStaffView) {
      return (
        <MultiStaffWeekView
          events={events}
          staffMembers={activeStaffMembers}
          currentDate={currentDate}
          onEventClick={handleEventClick}
          onStaffClick={handleStaffClick}
          onDateClick={handleDateClickInWeekView}
          onCellClick={handleCellClickInWeekView}
        />
      )
    }

    // Default FullCalendar view (for month, list, and default day/week)
    return (
      <FullCalendarView
        ref={calendarRef}
        events={events}
        view={view}
        displayMode={displayMode}
        colorScheme={colorScheme}
        highlights={highlights}
        schedulingMode={schedulingMode}
        rooms={activeRooms}
        onDateRangeChange={handleDateRangeChange}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        onSelectRange={handleSelectRange}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
      />
    )
  }

  return (
    <Box
      sx={{
        height: { xs: '100dvh', md: '100vh' }, // dvh for mobile to account for browser toolbars
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <CalendarHeader
        currentDate={currentDate}
        dateRange={visibleDateRange || undefined}
        filteredEvents={events}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onNewBooking={() => openNewBooking()}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Sidebar */}
        {!isMobile && isSidebarOpen && (
          <CalendarSidebar currentDate={currentDate} onDateChange={handleDateChange} isMobile={false} />
        )}

        {/* Mobile Sidebar Drawer */}
        {isMobile && <CalendarSidebar currentDate={currentDate} onDateChange={handleDateChange} isMobile={true} />}

        {/* Calendar View */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderCalendarView()}
        </Box>
      </Box>

      {/* Unified Appointment Drawer */}
      <AppointmentDrawer />

      {/* Settings Drawer */}
      <CalendarSettings open={isSettingsOpen} onClose={toggleSettings} />

      {/* Notifications Drawer */}
      <CalendarNotifications open={isNotificationsOpen} onClose={toggleNotifications} />

      {/* New Appointment Drawer */}
      <NewAppointmentDrawer
        open={isNewBookingOpen}
        initialDate={useCalendarStore.getState().selectedDate}
        initialDateRange={useCalendarStore.getState().selectedDateRange}
        initialStaffId={staffFilters.selectedStaffId}
        onClose={closeNewBooking}
        onSave={handleSaveNewAppointment}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!lastActionError}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
          {lastActionError}
        </Alert>
      </Snackbar>
    </Box>
  )
}
