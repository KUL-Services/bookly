'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateSelectArg, EventClickArg, EventDropArg, DatesSetArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'

import { buildEventColors } from './utils'
import type { CalendarEvent, CalendarView, DisplayMode, ColorScheme, HighlightFilters, DateRange, SchedulingMode, Room } from './types'

interface FullCalendarViewProps {
  events: CalendarEvent[]
  view: CalendarView
  displayMode: DisplayMode
  colorScheme: ColorScheme
  highlights: HighlightFilters
  schedulingMode?: SchedulingMode
  rooms?: Room[]
  onDateRangeChange?: (range: DateRange) => void
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onSelectRange?: (
    start: Date,
    end: Date,
    jsEvent?: MouseEvent,
    dimensions?: { top: number; left: number; width: number; height: number } | null
  ) => void
  onEventDrop?: (event: CalendarEvent, start: Date, end: Date) => boolean
  onEventResize?: (event: CalendarEvent, start: Date, end: Date) => boolean
}

const FullCalendarView = forwardRef<FullCalendar, FullCalendarViewProps>(
  (
    {
      events,
      view,
      displayMode,
      colorScheme,
      highlights,
      schedulingMode = 'dynamic',
      rooms = [],
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

    // Helper to get room info
    const getRoomById = (roomId: string | undefined) => {
      if (!roomId || schedulingMode !== 'static') return null
      return rooms.find(r => r.id === roomId)
    }

    // Expose calendar API to parent with custom methods
    useImperativeHandle(ref, () => {
      const api = calendarRef.current
      return {
        ...api,
        clearSelection: () => {
          const calendarApi = calendarRef.current?.getApi()
          if (calendarApi) {
            calendarApi.unselect()
          }
        }
      } as FullCalendar & { clearSelection: () => void }
    })

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
      // Capture the highlight element's position IMMEDIATELY, SYNCHRONOUSLY
      // This must happen before FullCalendar removes the element
      const highlightEl = document.querySelector('.fc-highlight') as HTMLElement
      let dimensions = null
      if (highlightEl) {
        const rect = highlightEl.getBoundingClientRect()
        dimensions = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      }

      // Pass the dimensions along with dates
      onSelectRange?.(arg.start, arg.end, arg.jsEvent as MouseEvent, dimensions)
    }

    // Handle event drop
    const handleEventDrop = (arg: EventDropArg) => {
      const event = events.find(e => e.id === arg.event.id)
      if (event && arg.event.start && arg.event.end) {
        const success = onEventDrop?.(event, arg.event.start, arg.event.end)
        // Revert if validation failed
        if (success === false) {
          arg.revert()
        }
      }
    }

    // Handle event resize
    const handleEventResize = (arg: EventResizeDoneArg) => {
      const event = events.find(e => e.id === arg.event.id)
      if (event && arg.event.start && arg.event.end) {
        const success = onEventResize?.(event, arg.event.start, arg.event.end)
        // Revert if validation failed
        if (success === false) {
          arg.revert()
        }
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
          p: { xs: 1, sm: 2, md: 3 },
          pe: { xs: 1, sm: 2, md: 10 },
          overflow: 'hidden',
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
          // Selection highlight styling
          '& .fc-highlight': {
            backgroundColor: isDark
              ? 'rgba(20, 184, 166, 0.2) !important'
              : 'rgba(20, 184, 166, 0.15) !important',
            border: isDark
              ? '2px solid rgba(20, 184, 166, 0.5) !important'
              : '2px solid rgba(20, 184, 166, 0.6) !important',
            borderRadius: '8px',
            opacity: 1,
            zIndex: 3
          },
          '& .fc-timegrid .fc-highlight': {
            backgroundColor: isDark
              ? 'rgba(20, 184, 166, 0.2) !important'
              : 'rgba(20, 184, 166, 0.15) !important',
          },
          '& .fc-event': {
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            border: 'none',
            overflow: 'visible',
            transition: 'all 0.15s ease',
            '&:hover': {
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              zIndex: 10
            }
          },
          '& .fc-daygrid-event': {
            mb: 0.5,
            px: 1,
            py: 0.75,
            whiteSpace: 'normal',
            minHeight: '32px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          },
          '& .fc-daygrid-event .fc-event-main': {
            overflow: 'hidden',
            width: '100%'
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
            height: '100% !important',
            overflow: 'hidden !important'
          },
          '& .fc-timegrid-event .fc-event-main-frame': {
            height: '100% !important',
            display: 'flex !important',
            flexDirection: 'column !important',
            overflow: 'hidden !important',
            width: '100% !important'
          },
          '& .fc-timegrid-event .fc-event-title-container': {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflow: 'hidden',
            width: '100%'
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
            height: '2.5rem',
            position: 'relative',
            '&:nth-of-type(2n)::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              backgroundImage: 'linear-gradient(to right, transparent 0%, transparent 50%, var(--fc-border-color) 50%, var(--fc-border-color) 100%)',
              backgroundSize: '8px 1px',
              backgroundRepeat: 'repeat-x'
            }
          },
          '& .fc-timegrid-slot-label': {
            fontSize: '0.75rem',
            verticalAlign: 'top',
            paddingTop: '4px'
          },
          '& .time-off-event, & .time-reservation-event': {
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px) !important',
            opacity: '0.15 !important',
            pointerEvents: 'none',
            zIndex: 1
          },
          '& .time-off-event': {
            color: '#795548 !important'
          },
          '& .time-reservation-event': {
            color: '#2196f3 !important'
          },
          '& .fc-col-header-cell': {
            minWidth: { xs: '100px', sm: '120px', md: '140px' }
          },
          '& .fc-timegrid-col': {
            minWidth: { xs: '100px', sm: '120px', md: '140px' }
          },
          '& .fc-scrollgrid-section-body table, & .fc-scrollgrid-section-header table': {
            width: { xs: 'max-content !important', md: 'calc(100% - 40px) !important' },
            marginLeft: 'auto',
            marginRight: 'auto'
          },
          // Mobile: Enable horizontal scrolling
          '& .fc-view': {
            overflowX: { xs: 'auto', md: 'hidden' },
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          },
          '& .fc-scroller-harness': {
            overflowX: { xs: 'auto !important', md: 'hidden !important' }
          },
          '& .fc-scroller-harness > .fc-scroller': {
            overflowX: { xs: 'visible !important', md: 'hidden !important' }
          },
          // Mobile: Ensure minimum widths for better spacing
          '& .fc-daygrid-day': {
            minWidth: { xs: '100px !important', sm: '120px !important', md: 'auto !important' },
            minHeight: { xs: '120px !important', sm: '140px !important', md: '140px !important' }
          },
          '& .fc-day': {
            minHeight: { xs: '120px !important', sm: '140px !important', md: '140px !important' }
          },
          '& .fc-daygrid-day-frame': {
            minHeight: { xs: '120px', sm: '140px', md: '140px' }
          },
          // Mobile: Week view improvements
          '& .fc-timegrid-axis': {
            minWidth: { xs: '50px !important', md: '60px !important' }
          },
          '& .fc-timegrid-slots table': {
            minWidth: { xs: 'max-content !important', md: 'auto !important' }
          },
          // Mobile: Month view table width
          '& .fc-dayGridMonth-view .fc-scrollgrid': {
            minWidth: { xs: '700px !important', sm: '800px !important', md: 'auto !important' }
          },
          '& .fc-timeGridWeek-view .fc-scrollgrid': {
            minWidth: { xs: '700px !important', sm: '800px !important', md: 'auto !important' }
          },
          // Mobile: Ensure proper scrolling container
          '@media (max-width: 900px)': {
            '& .fc-view-harness': {
              overflowX: 'auto !important',
              WebkitOverflowScrolling: 'touch'
            }
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
          unselectAuto={false}
          selectLongPressDelay={300}
          eventLongPressDelay={300}
          selectMinDistance={5}
          longPressDelay={300}
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
          slotDuration='00:15:00'
          slotLabelInterval='01:00:00'
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
          dayHeaderContent={(arg) => {
            const date = arg.date
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNumber = date.getDate()
            const monthName = view === 'timeGridDay' ? date.toLocaleDateString('en-US', { month: 'short' }) : ''
            // Default business hours (matches standard schedule from mock data: 9:00 AM-5:00 PM)
            const businessHours = '9:00 AM-5:00 PM'

            return (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  py: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}
                  >
                    {dayName}
                  </Typography>
                  {monthName && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}
                    >
                      {monthName}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}
                  >
                    {dayNumber}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.65rem',
                    opacity: 0.8
                  }}
                >
                  {businessHours}
                </Typography>
              </Box>
            )
          }}
          listDayFormat={{ month: 'long', day: 'numeric', year: 'numeric' }}
          listDaySideFormat={false}
          eventContent={arg => {
            const { event, timeText } = arg
            const props = event.extendedProps
            const room = getRoomById(props.roomId)
            const isStatic = schedulingMode === 'static'
            const isDynamic = schedulingMode === 'dynamic'

            return (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  gap: 0.25,
                  overflow: 'hidden',
                  minHeight: 0
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
                      opacity: 0.95,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
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
                    color: 'inherit',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
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
                      color: 'inherit',
                      opacity: 0.85,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {props.serviceName}
                  </Box>
                )}
                {/* Show room for static mode */}
                {room && isStatic && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 0.25,
                      minWidth: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: room.color || '#9E9E9E',
                        flexShrink: 0
                      }}
                    />
                    <Box
                      sx={{
                        fontSize: '0.65rem',
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: 'inherit',
                        opacity: 0.8,
                        flex: 1,
                        minWidth: 0
                      }}
                    >
                      {room.name}
                    </Box>
                  </Box>
                )}
                {/* Show staff for dynamic mode */}
                {props.staffName && isDynamic && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 0.25,
                      minWidth: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <i className="ri-user-line" style={{ fontSize: '0.75rem', flexShrink: 0 }} />
                    <Box
                      sx={{
                        fontSize: '0.65rem',
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: 'inherit',
                        opacity: 0.8,
                        flex: 1,
                        minWidth: 0
                      }}
                    >
                      {props.staffName}
                    </Box>
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
