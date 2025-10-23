'use client'

import { Box, Typography, IconButton, Avatar, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, isSameDay } from 'date-fns'
import type { CalendarEvent } from './types'

interface SingleStaffDayViewProps {
  events: CalendarEvent[]
  staff: { id: string; name: string; photo?: string; workingHours?: string }
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onBack?: () => void
}

export default function SingleStaffDayView({
  events,
  staff,
  currentDate,
  onEventClick,
  onBack
}: SingleStaffDayViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Filter events for current date and staff
  const todayEvents = events.filter(
    event => isSameDay(new Date(event.start), currentDate) && event.extendedProps.staffId === staff.id
  )

  // Generate time slots (6 AM to 10 PM, 30 min intervals)
  const timeSlots: Date[] = []
  const startHour = 6
  const endHour = 22

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slot = new Date(currentDate)
      slot.setHours(hour, minute, 0, 0)
      timeSlots.push(slot)
    }
  }

  // Calculate event position and height
  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const startMinutes = start.getHours() * 60 + start.getMinutes() - startHour * 60
    const duration = (end.getTime() - start.getTime()) / (1000 * 60)
    const slotHeight = 80 // 80px per 30 min slot
    const top = (startMinutes / 30) * slotHeight
    const height = (duration / 30) * slotHeight

    return { top, height }
  }

  // Get event color based on status
  const getEventColor = (status: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      confirmed: { bg: '#E3F2FD', border: '#2196F3', text: '#0D47A1' },
      pending: { bg: '#FFF3E0', border: '#FF9800', text: '#E65100' },
      completed: { bg: '#F5F5F5', border: '#9E9E9E', text: '#424242' },
      cancelled: { bg: '#FFEBEE', border: '#F44336', text: '#C62828' },
      need_confirm: { bg: '#E8F5E9', border: '#4CAF50', text: '#1B5E20' },
      no_show: { bg: '#FCE4EC', border: '#E91E63', text: '#880E4F' }
    }
    return colors[status] || colors.confirmed
  }

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
              {staff.workingHours || '10:00 AM-7:00 PM'} • {todayEvents.length} appointments
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            position: 'relative',
            minHeight: '100%'
          }}
        >
          {/* Time slots column */}
          <Box sx={{ borderRight: 1, borderColor: 'divider', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
            {timeSlots.map((slot, index) => (
              <Box
                key={index}
                sx={{
                  height: 80,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  pt: 1
                }}
              >
                {slot.getMinutes() === 0 && (
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {format(slot, 'h a')}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          {/* Events column */}
          <Box sx={{ position: 'relative' }}>
            {/* Time slot grid lines */}
            {timeSlots.map((slot, index) => (
              <Box
                key={index}
                sx={{
                  height: 80,
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              />
            ))}

            {/* Events */}
            {todayEvents.map(event => {
              const { top, height } = getEventStyle(event)
              const colors = getEventColor(event.extendedProps.status)

              return (
                <Box
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  sx={{
                    position: 'absolute',
                    top: `${top}px`,
                    left: 8,
                    right: 8,
                    height: `${height}px`,
                    bgcolor: colors.bg,
                    border: 3,
                    borderColor: colors.border,
                    borderRadius: 2,
                    p: 1.5,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateX(4px)',
                      zIndex: 5
                    }
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: 700,
                      color: colors.text,
                      fontSize: '0.75rem',
                      mb: 0.5
                    }}
                  >
                    {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: colors.text,
                      fontSize: '0.95rem',
                      lineHeight: 1.4,
                      mb: 0.5
                    }}
                  >
                    {event.extendedProps.starred && '⭐ '}
                    {event.extendedProps.customerName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'block',
                      color: colors.text,
                      fontSize: '0.8rem',
                      opacity: 0.9,
                      mb: height > 100 ? 0.5 : 0
                    }}
                  >
                    {event.title}
                  </Typography>
                  {height > 100 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: colors.text,
                        fontSize: '0.7rem',
                        opacity: 0.8
                      }}
                    >
                      ${event.extendedProps.price}
                    </Typography>
                  )}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
