'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box } from '@mui/material'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateSelectArg, EventClickArg, EventDropArg, DatesSetArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'

import { buildEventColors } from './utils'
import type { CalendarEvent, CalendarView, DisplayMode, ColorScheme, HighlightFilters, DateRange } from './types'

interface FullCalendarViewProps {
  events: CalendarEvent[]
  view: CalendarView
  displayMode: DisplayMode
  colorScheme: ColorScheme
  highlights: HighlightFilters
  onDateRangeChange?: (range: DateRange) => void
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onSelectRange?: (start: Date, end: Date) => void
  onEventDrop?: (event: CalendarEvent, start: Date, end: Date) => void
  onEventResize?: (event: CalendarEvent, start: Date, end: Date) => void
}

const FullCalendarView = forwardRef<FullCalendar, FullCalendarViewProps>(
  (
    {
      events,
      view,
      displayMode,
      colorScheme,
      highlights,
      onDateRangeChange,
      onDateClick,
      onEventClick,
      onSelectRange,
      onEventDrop,
      onEventResize
    },
    ref
  ) => {
    const calendarRef = useRef<FullCalendar>(null)
    const theme = useTheme()

    // Expose calendar API to parent
    useImperativeHandle(ref, () => calendarRef.current as FullCalendar)

    // Update view when prop changes
    useEffect(() => {
      const calendarApi = calendarRef.current?.getApi()
      if (calendarApi && calendarApi.view.type !== view) {
        calendarApi.changeView(view)
      }
    }, [view])

    // Handle date set
    const handleDatesSet = (arg: DatesSetArg) => {
      onDateRangeChange?.({ start: arg.start, end: arg.end })
    }

    // Handle date click
    const handleDateClick = (arg: any) => {
      onDateClick?.(arg.date)
    }

    // Handle event click
    const handleEventClick = (arg: EventClickArg) => {
      const event = events.find(e => e.id === arg.event.id)
      if (event) {
        onEventClick?.(event)
      }
    }

    // Handle date range selection
    const handleSelect = (arg: DateSelectArg) => {
      onSelectRange?.(arg.start, arg.end)
    }

    // Handle event drop
    const handleEventDrop = (arg: EventDropArg) => {
      const event = events.find(e => e.id === arg.event.id)
      if (event && arg.event.start && arg.event.end) {
        onEventDrop?.(event, arg.event.start, arg.event.end)
      }
    }

    // Handle event resize
    const handleEventResize = (arg: EventResizeDoneArg) => {
      const event = events.find(e => e.id === arg.event.id)
      if (event && arg.event.start && arg.event.end) {
        onEventResize?.(event, arg.event.start, arg.event.end)
      }
    }

    // Map events to FullCalendar format with colors
    const calendarEvents = events.map(event => {
      const colors = buildEventColors(colorScheme, event.extendedProps.status)
      return {
        ...event,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text
      }
    })

    const isDark = theme.palette.mode === 'dark'

    return (
      <Box
        sx={{
          height: '100%',
          p: 3,
          pe: 10,
          '& .fc': {
            height: '100%',
            fontFamily: theme.typography.fontFamily,
            '--fc-border-color': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            '--fc-button-bg-color': theme.palette.primary.main,
            '--fc-button-border-color': theme.palette.primary.main,
            '--fc-button-hover-bg-color': theme.palette.primary.dark,
            '--fc-button-hover-border-color': theme.palette.primary.dark,
            '--fc-button-active-bg-color': theme.palette.primary.dark,
            '--fc-button-active-border-color': theme.palette.primary.dark,
            '--fc-today-bg-color': isDark ? 'rgba(144,202,249,0.08)' : 'rgba(25,118,210,0.08)'
          },
          '& .fc-theme-standard td, & .fc-theme-standard th': {
            borderColor: 'var(--fc-border-color)'
          },
          '& .fc .fc-col-header-cell': {
            fontWeight: 600,
            py: 1.5,
            color: theme.palette.text.secondary,
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
          },
          '& .fc .fc-daygrid-day-number, & .fc .fc-timegrid-slot-label': {
            color: theme.palette.text.primary,
            padding: 0.75
          },
          '& .fc .fc-day-today': {
            backgroundColor: 'var(--fc-today-bg-color) !important'
          },
          '& .fc .fc-day-today .fc-daygrid-day-number': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600
          },
          '& .fc-event': {
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            border: 'none',
            overflow: 'visible'
          },
          '& .fc-daygrid-event': {
            mb: 0.5,
            px: 1,
            py: 0.5,
            whiteSpace: 'normal'
          },
          '& .fc-timegrid-event': {
            borderRadius: '8px !important',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          },
          '& .fc-timegrid-event .fc-event-main': {
            padding: '6px 8px !important',
            display: 'flex !important',
            flexDirection: 'column !important',
            alignItems: 'flex-start !important',
            justifyContent: 'flex-start !important',
            height: '100% !important'
          },
          '& .fc-timegrid-event .fc-event-main-frame': {
            height: '100% !important',
            display: 'flex !important',
            flexDirection: 'column !important'
          },
          '& .fc-timegrid-event .fc-event-title-container': {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          },
          '& .fc-timegrid-event .fc-event-time': {
            fontSize: '0.7rem',
            fontWeight: 500,
            marginBottom: '2px',
            whiteSpace: 'nowrap'
          },
          '& .fc-timegrid-event .fc-event-title': {
            fontSize: '0.8125rem',
            fontWeight: 600,
            lineHeight: 1.3,
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            wordBreak: 'break-word'
          },
          '& .fc-list': {
            borderColor: 'transparent !important',
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-table': {
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-table tbody': {
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-table tr': {
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-day': {
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-day > *': {
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-day-cushion': {
            backgroundColor: 'transparent !important',
            padding: '16px 16px 8px 16px',
            fontWeight: 400,
            fontSize: '0.8125rem',
            color: theme.palette.text.disabled,
            borderBottom: 'none'
          },
          '& .fc-list-event': {
            cursor: 'pointer',
            backgroundColor: 'transparent !important',
            border: 'none !important',
            borderRadius: 0,
            transition: 'background-color 0.2s ease'
          },
          '& .fc-list-event:hover': {
            backgroundColor: `${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} !important`
          },
          '& .fc-list-event:hover td': {
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-event td': {
            borderColor: 'transparent !important',
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-event-dot': {
            borderWidth: '6px',
            borderRadius: '50%',
            margin: '0 12px 0 0'
          },
          '& .fc-list-event-time': {
            fontSize: '0.875rem',
            fontWeight: 400,
            color: theme.palette.text.primary,
            padding: '14px 16px',
            minWidth: '150px',
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-event-title': {
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: theme.palette.text.primary,
            padding: '14px 16px 14px 0',
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-event-graphic': {
            padding: '14px 8px',
            backgroundColor: 'transparent !important'
          },
          '& .fc-list-empty': {
            backgroundColor: 'transparent !important',
            padding: '40px',
            textAlign: 'center',
            color: theme.palette.text.secondary
          },
          '& .fc-list-sticky .fc-list-day > *': {
            backgroundColor: 'transparent !important'
          },
          '& .fc-scroller': {
            backgroundColor: 'transparent !important'
          },
          '& .fc-event-title': {
            fontWeight: 600,
            fontSize: '0.875rem',
            lineHeight: 1.4,
            overflow: 'visible',
            whiteSpace: 'normal',
            wordWrap: 'break-word'
          },
          '& .fc-event-time': {
            fontWeight: 500,
            fontSize: '0.75rem',
            opacity: 0.95,
            marginBottom: '2px',
            display: 'block'
          },
          '& .fc-timegrid-slot': {
            height: '5rem'
          },
          '& .fc-timegrid-slot-label': {
            fontSize: '0.75rem',
            verticalAlign: 'top',
            paddingTop: '4px'
          },
          '& .fc-col-header-cell': {
            minWidth: '140px'
          },
          '& .fc-timegrid-col': {
            minWidth: '140px'
          },
          '& .fc-scrollgrid-section-body table, & .fc-scrollgrid-section-header table': {
            width: 'calc(100% - 40px) !important',
            marginLeft: 'auto',
            marginRight: 'auto'
          }
        }}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={false}
          height='100%'
          events={calendarEvents}
          editable={true}
          selectable={view === 'timeGridDay' || view === 'timeGridWeek'}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
          nowIndicator={true}
          navLinks={false}
          eventResizableFromStart={true}
          datesSet={handleDatesSet}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          select={handleSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          slotMinTime='06:00:00'
          slotMaxTime='22:00:00'
          slotDuration='00:30:00'
          allDaySlot={false}
          scrollTime='08:00:00'
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          dayHeaderFormat={
            view === 'timeGridDay'
              ? { weekday: 'short', month: 'short', day: 'numeric' }
              : { weekday: 'short', day: 'numeric' }
          }
          listDayFormat={{ month: 'long', day: 'numeric', year: 'numeric' }}
          listDaySideFormat={false}
          eventContent={arg => {
            const { event, timeText } = arg
            const props = event.extendedProps

            return (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 0.25
                }}
              >
                {timeText && (
                  <Box
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2,
                      color: 'inherit',
                      opacity: 0.95
                    }}
                  >
                    {timeText}
                  </Box>
                )}
                <Box
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    color: 'inherit'
                  }}
                >
                  {props.starred && '⭐ '}
                  {event.title}
                </Box>
                {props.serviceName && (
                  <Box
                    sx={{
                      fontSize: '0.7rem',
                      lineHeight: 1.2,
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      color: 'inherit',
                      opacity: 0.85
                    }}
                  >
                    {props.serviceName}
                  </Box>
                )}
              </Box>
            )
          }}
        />
      </Box>
    )
  }
)

FullCalendarView.displayName = 'FullCalendarView'

export default FullCalendarView
