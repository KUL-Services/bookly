'use client'

import { Box, Typography, Avatar, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { useCalendarStore } from './state'
import { buildEventColors } from './utils'
import type { CalendarEvent } from './types'

interface SingleStaffWeekViewProps {
  events: CalendarEvent[]
  staff: { id: string; name: string; photo?: string; workingHours?: string }
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onBack?: () => void
  onDateClick?: (date: Date) => void
}

export default function SingleStaffWeekView({
  events,
  staff,
  currentDate,
  onEventClick,
  onBack,
  onDateClick
}: SingleStaffWeekViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const colorScheme = useCalendarStore(state => state.colorScheme)

  // Get week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Filter events for this staff
  const staffEvents = events.filter(event => event.extendedProps.staffId === staff.id)

  // Get events for a specific day
  const getDayEvents = (day: Date) => {
    return staffEvents.filter(event => isSameDay(new Date(event.start), day))
  }

  // Get total appointments for the week
  const weekAppointments = staffEvents.filter(event => {
    const eventDate = new Date(event.start)
    return eventDate >= weekStart && eventDate <= weekEnd
  })

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header with back button and staff info */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        {onBack && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<i className="ri-arrow-left-line" />}
            onClick={onBack}
            sx={{ flexShrink: 0 }}
          >
            All Staff
          </Button>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Avatar
            src={staff.photo}
            sx={{
              width: 48,
              height: 48,
              bgcolor: theme.palette.primary.main,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {staff.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {staff.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {staff.workingHours || '10:00 AM-7:00 PM'} • {weekAppointments.length} appointments this week
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Week view content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${weekDays.length}, 1fr)`,
            gap: 2,
            minHeight: '100%'
          }}
        >
          {weekDays.map(day => {
            const dayEvents = getDayEvents(day)

            return (
              <Box
                key={day.toISOString()}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: 1,
                  borderColor: isToday(day) ? 'primary.main' : 'divider',
                  boxShadow: isToday(day) ? 2 : 0
                }}
              >
                {/* Day header */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: isToday(day) ? 'primary.main' : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderBottom: 1,
                    borderColor: 'divider',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: isToday(day) ? 'primary.dark' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                    }
                  }}
                  onClick={() => onDateClick?.(day)}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: 600,
                      color: isToday(day) ? 'primary.contrastText' : 'text.secondary',
                      mb: 0.5
                    }}
                  >
                    {format(day, 'EEE')}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                      color: isToday(day) ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: isToday(day) ? 'primary.contrastText' : 'text.secondary',
                      opacity: 0.8
                    }}
                  >
                    {dayEvents.length} appointment{dayEvents.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>

                {/* Day events */}
                <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto' }}>
                  {dayEvents.length === 0 ? (
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 4
                      }}
                    >
                      <Typography variant="caption" color="text.disabled">
                        No appointments
                      </Typography>
                    </Box>
                  ) : (
                    dayEvents.map(event => {
                      const colors = buildEventColors(colorScheme, event.extendedProps.status)

                      return (
                        <Box
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          sx={{
                            bgcolor: colors.bg,
                            border: 2,
                            borderColor: colors.border,
                            borderRadius: 1.5,
                            p: 1.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 3,
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              fontWeight: 700,
                              color: colors.text,
                              fontSize: '0.7rem',
                              mb: 0.5
                            }}
                          >
                            {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: colors.text,
                              fontSize: '0.85rem',
                              lineHeight: 1.4,
                              mb: 0.25
                            }}
                          >
                            {event.extendedProps.starred && '⭐ '}
                            {event.extendedProps.customerName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              color: colors.text,
                              fontSize: '0.7rem',
                              opacity: 0.9,
                              lineHeight: 1.3
                            }}
                          >
                            {event.extendedProps.serviceName || event.title}
                          </Typography>
                        </Box>
                      )
                    })
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
