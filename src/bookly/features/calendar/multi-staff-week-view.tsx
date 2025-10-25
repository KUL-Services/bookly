'use client'

import { Box, Typography, Avatar, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { getBranchName } from './utils'
import type { CalendarEvent } from './types'

interface MultiStaffWeekViewProps {
  events: CalendarEvent[]
  staffMembers: Array<{ id: string; name: string; photo?: string; branchId?: string }>
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onStaffClick?: (staffId: string) => void
  onDateClick?: (date: Date) => void
  onCellClick?: (staffId: string, date: Date) => void
}

export default function MultiStaffWeekView({
  events,
  staffMembers,
  currentDate,
  onEventClick,
  onStaffClick,
  onDateClick,
  onCellClick
}: MultiStaffWeekViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Get week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Get events for a specific staff and day
  const getStaffDayEvents = (staffId: string, day: Date) => {
    return events.filter(
      event => event.extendedProps.staffId === staffId && isSameDay(new Date(event.start), day)
    )
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
      {/* Week header with days */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)`,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        {/* Staff column header */}
        <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
            Staff
          </Typography>
        </Box>

        {/* Day headers */}
        {weekDays.map(day => (
          <Box
            key={day.toISOString()}
            sx={{
              p: 2,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: isToday(day) ? (isDark ? 'rgba(144,202,249,0.08)' : 'rgba(25,118,210,0.08)') : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: isDark ? 'rgba(144,202,249,0.12)' : 'rgba(25,118,210,0.12)'
              }
            }}
            onClick={() => onDateClick?.(day)}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {format(day, 'EEE')}
            </Typography>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                color: isToday(day) ? 'primary.main' : 'text.primary'
              }}
            >
              {format(day, 'd')}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {staffMembers.map((staff, staffIndex) => (
          <Box
            key={staff.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)`,
              borderBottom: 1,
              borderColor: 'divider',
              minHeight: 120,
              bgcolor: staffIndex % 2 === 0 ? 'transparent' : isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
            }}
          >
            {/* Staff info */}
            <Box
              sx={{
                p: 2,
                borderRight: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
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
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {staff.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {staff.name}
                </Typography>
                {staff.branchId && (
                  <Chip
                    icon={<i className='ri-map-pin-line' style={{ fontSize: '0.65rem' }} />}
                    label={getBranchName(staff.branchId)}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.6rem',
                      width: 'fit-content',
                      '& .MuiChip-icon': { fontSize: '0.65rem', ml: 0.5 },
                      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                      color: theme => theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)'
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Days for this staff */}
            {weekDays.map(day => {
              const dayEvents = getStaffDayEvents(staff.id, day)
              const showAll = dayEvents.length <= 2

              return (
                <Box
                  key={`${staff.id}-${day.toISOString()}`}
                  sx={{
                    p: 1,
                    borderRight: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    bgcolor: isToday(day) ? (isDark ? 'rgba(144,202,249,0.03)' : 'rgba(25,118,210,0.03)') : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(144,202,249,0.08)' : 'rgba(25,118,210,0.08)'
                    }
                  }}
                  onClick={(e) => {
                    // Only navigate if clicking on empty space (not on an event)
                    const target = e.target as HTMLElement
                    if (target === e.currentTarget || target.closest('.day-cell-content')) {
                      onCellClick?.(staff.id, day)
                    }
                  }}
                >
                  <Box className="day-cell-content" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                    {dayEvents.length === 0 ? (
                      <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', py: 2 }}>
                        -
                      </Typography>
                    ) : (
                    <>
                      {dayEvents.slice(0, showAll ? dayEvents.length : 2).map(event => {
                        const colors = getEventColor(event.extendedProps.status)

                        return (
                          <Box
                            key={event.id}
                            onClick={() => onEventClick?.(event)}
                            sx={{
                              bgcolor: colors.bg,
                              border: 1.5,
                              borderColor: colors.border,
                              borderRadius: 1,
                              p: 0.75,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: 2,
                                transform: 'scale(1.02)'
                              }
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontWeight: 600,
                                color: colors.text,
                                fontSize: '0.65rem',
                                mb: 0.25,
                                lineHeight: 1.2
                              }}
                            >
                              {format(new Date(event.start), 'h:mm a')}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontWeight: 600,
                                color: colors.text,
                                fontSize: '0.7rem',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {event.title}
                            </Typography>
                          </Box>
                        )
                      })}
                      {!showAll && dayEvents.length > 2 && (
                        <Typography
                          variant="caption"
                          sx={{
                            textAlign: 'center',
                            color: 'primary.main',
                            fontWeight: 600,
                            cursor: 'pointer',
                            py: 0.5,
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Show all ({dayEvents.length})
                        </Typography>
                      )}
                    </>
                  )}
                  </Box>
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
