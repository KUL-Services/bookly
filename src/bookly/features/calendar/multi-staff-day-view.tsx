'use client'

import { Box, Typography, IconButton, Avatar, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, addMinutes, isSameDay } from 'date-fns'
import { getBranchName } from './utils'
import type { CalendarEvent } from './types'

interface MultiStaffDayViewProps {
  events: CalendarEvent[]
  staffMembers: Array<{ id: string; name: string; photo?: string; branchId?: string }>
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onStaffClick?: (staffId: string) => void
  onCellClick?: (staffId: string, date: Date) => void
}

export default function MultiStaffDayView({
  events,
  staffMembers,
  currentDate,
  onEventClick,
  onStaffClick,
  onCellClick
}: MultiStaffDayViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Filter events for current date
  const todayEvents = events.filter(event => isSameDay(new Date(event.start), currentDate))

  // Generate time slots (6 AM to 10 PM, 30 min intervals)
  const timeSlots: Date[] = []
  const startHour = 6
  const endHour = 22
  const baseDate = new Date(currentDate)
  baseDate.setHours(startHour, 0, 0, 0)

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slot = new Date(currentDate)
      slot.setHours(hour, minute, 0, 0)
      timeSlots.push(slot)
    }
  }

  // Get events for a specific staff member
  const getStaffEvents = (staffId: string) => {
    return todayEvents.filter(event => event.extendedProps.staffId === staffId)
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Wrapper for horizontal scroll */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Header with staff columns */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `60px repeat(${staffMembers.length}, minmax(180px, 1fr))`,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            minWidth: `${60 + staffMembers.length * 180}px`
          }}
        >
        {/* Time column header */}
        <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider' }} />

        {/* Staff headers */}
        {staffMembers.map(staff => (
          <Box
            key={staff.id}
            sx={{
              p: 2,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
              }
            }}
            onClick={() => onStaffClick?.(staff.id)}
          >
            <Avatar
              src={staff.photo}
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {staff.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Typography variant="body2" fontWeight={600} textAlign="center" noWrap sx={{ maxWidth: '100%' }}>
              {staff.name}
            </Typography>
            {staff.branchId && (
              <Chip
                icon={<i className='ri-map-pin-line' style={{ fontSize: '0.7rem' }} />}
                label={getBranchName(staff.branchId)}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  '& .MuiChip-icon': { fontSize: '0.7rem', ml: 0.5 },
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                  color: theme => theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)'
                }}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {getStaffEvents(staff.id).length} appointments
            </Typography>
          </Box>
        ))}
      </Box>

        {/* Scrollable content */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `60px repeat(${staffMembers.length}, minmax(180px, 1fr))`,
            position: 'relative',
            minHeight: '100%',
            minWidth: `${60 + staffMembers.length * 180}px`
          }}
        >
          {/* Time slots column */}
          <Box sx={{ borderRight: 1, borderColor: 'divider' }}>
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
                  pt: 0.5,
                  position: 'relative'
                }}
              >
                {slot.getMinutes() === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {format(slot, 'h:mm a')}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          {/* Staff columns */}
          {staffMembers.map((staff, staffIndex) => (
            <Box
              key={staff.id}
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                position: 'relative',
                bgcolor: staffIndex % 2 === 0 ? 'transparent' : isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(144,202,249,0.05)' : 'rgba(25,118,210,0.05)'
                }
              }}
              onClick={(e) => {
                // Only navigate if clicking on empty space (not on an event)
                const target = e.target as HTMLElement
                if (target === e.currentTarget || !target.closest('.event-card')) {
                  onCellClick?.(staff.id, currentDate)
                }
              }}
            >
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
              {getStaffEvents(staff.id).map(event => {
                const { top, height } = getEventStyle(event)
                const colors = getEventColor(event.extendedProps.status)

                return (
                  <Box
                    key={event.id}
                    className="event-card"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                    sx={{
                      position: 'absolute',
                      top: `${top}px`,
                      left: '8px',
                      right: '8px',
                      height: `${height}px`,
                      bgcolor: colors.bg,
                      border: 2,
                      borderColor: colors.border,
                      borderRadius: 2,
                      p: 1,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'scale(1.02)',
                        zIndex: 5
                      }
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontWeight: 600,
                        color: colors.text,
                        fontSize: '0.7rem',
                        mb: 0.25
                      }}
                    >
                      {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.text,
                        fontSize: '0.8125rem',
                        lineHeight: 1.3,
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
                        opacity: 0.9
                      }}
                    >
                      {event.extendedProps.serviceName || event.title}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
