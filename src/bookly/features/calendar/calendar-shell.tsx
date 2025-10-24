'use client'

import { useState, useRef, useMemo } from 'react'
import { Box, useTheme, useMediaQuery } from '@mui/material'
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
import EventPopover from './event-popover'
import EditAppointmentDrawer from './edit-appointment-drawer'
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
  const isSettingsOpen = useCalendarStore(state => state.isSettingsOpen)
  const isNotificationsOpen = useCalendarStore(state => state.isNotificationsOpen)
  const isSidebarOpen = useCalendarStore(state => state.isSidebarOpen)
  const isNewBookingOpen = useCalendarStore(state => state.isNewBookingOpen)
  const getFilteredEvents = useCalendarStore(state => state.getFilteredEvents)
  const setVisibleDateRange = useCalendarStore(state => state.setVisibleDateRange)
  const openNewBooking = useCalendarStore(state => state.openNewBooking)
  const closeNewBooking = useCalendarStore(state => state.closeNewBooking)
  const toggleSettings = useCalendarStore(state => state.toggleSettings)
  const toggleNotifications = useCalendarStore(state => state.toggleNotifications)
  const selectSingleStaff = useCalendarStore(state => state.selectSingleStaff)
  const goBackToAllStaff = useCalendarStore(state => state.goBackToAllStaff)

  // Local state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)

  // Get filtered events
  const events = getFilteredEvents()

  // Determine which staff are being shown
  const activeStaffIds = useMemo(() => {
    if (staffFilters.onlyMe) {
      return ['1'] // Current user ID
    }
    return staffFilters.staffIds.length > 0 ? staffFilters.staffIds : []
  }, [staffFilters])

  const activeStaffMembers = useMemo(() => {
    if (activeStaffIds.length === 0) {
      return []
    }
    return mockStaff.filter(staff => activeStaffIds.includes(staff.id))
  }, [activeStaffIds])

  // Determine which view to show
  const shouldUseCustomDayView = view === 'timeGridDay' && activeStaffIds.length > 0
  const shouldUseCustomWeekView = view === 'timeGridWeek' && activeStaffIds.length > 0
  const isSingleStaffView = staffFilters.selectedStaffId !== null && staffFilters.selectedStaffId !== undefined
  const isMultiStaffView = activeStaffIds.length > 1 && !isSingleStaffView

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

  const handleEventClick = (event: CalendarEvent, target: HTMLElement) => {
    setSelectedEvent(event)
    setPopoverAnchor(target)
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

  const handleEditEvent = (event: CalendarEvent) => {
    setIsEditDrawerOpen(true)
    setPopoverAnchor(null)
  }

  const handleClosePopover = () => {
    setPopoverAnchor(null)
    setSelectedEvent(null)
  }

  const handleCloseEditDrawer = () => {
    setIsEditDrawerOpen(false)
    setSelectedEvent(null)
  }

  const handleStaffClick = (staffId: string) => {
    selectSingleStaff(staffId)
  }

  const handleBackToAllStaff = () => {
    goBackToAllStaff()
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
    // Single staff day view
    if (shouldUseCustomDayView && isSingleStaffView && activeStaffMembers.length === 1) {
      return (
        <SingleStaffDayView
          events={events}
          staff={activeStaffMembers[0]}
          currentDate={currentDate}
          onEventClick={(event) => {
            const eventEl = document.querySelector(`[data-event-id="${event.id}"]`) as HTMLElement
            handleEventClick(event, eventEl || document.body)
          }}
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
          onEventClick={(event) => {
            const eventEl = document.querySelector(`[data-event-id="${event.id}"]`) as HTMLElement
            handleEventClick(event, eventEl || document.body)
          }}
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
          onEventClick={(event) => {
            const eventEl = document.querySelector(`[data-event-id="${event.id}"]`) as HTMLElement
            handleEventClick(event, eventEl || document.body)
          }}
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
          onEventClick={(event) => {
            const eventEl = document.querySelector(`[data-event-id="${event.id}"]`) as HTMLElement
            handleEventClick(event, eventEl || document.body)
          }}
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
        onDateRangeChange={handleDateRangeChange}
        onDateClick={handleDateClick}
        onEventClick={(event) => {
          const eventEl = document.querySelector(`[data-event-id="${event.id}"]`) as HTMLElement
          handleEventClick(event, eventEl || document.body)
        }}
        onSelectRange={handleSelectRange}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
      />
    )
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <CalendarHeader
        currentDate={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onNewBooking={() => openNewBooking()}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        {!isMobile && isSidebarOpen && (
          <CalendarSidebar currentDate={currentDate} onDateChange={handleDateChange} isMobile={false} />
        )}

        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <CalendarSidebar currentDate={currentDate} onDateChange={handleDateChange} isMobile={true} />
        )}

        {/* Calendar View */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {renderCalendarView()}
        </Box>
      </Box>

      {/* Event Details Drawer */}
      <EventPopover
        anchorEl={popoverAnchor}
        event={selectedEvent}
        onClose={handleClosePopover}
        onEdit={handleEditEvent}
      />

      {/* Edit Appointment Drawer */}
      <EditAppointmentDrawer
        open={isEditDrawerOpen}
        event={selectedEvent}
        onClose={handleCloseEditDrawer}
      />

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
      />
    </Box>
  )
}
