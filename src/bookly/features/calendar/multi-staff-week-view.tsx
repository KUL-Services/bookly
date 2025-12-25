'use client'

import { Box, Typography, Avatar, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { useCalendarStore } from './state'
import { getBranchName, buildEventColors } from './utils'
import type { CalendarEvent } from './types'

const adjustColorOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  }
  if (color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`)
  }
  return color
}

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
  const colorScheme = useCalendarStore(state => state.colorScheme)

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

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      {/* Horizontal scroll wrapper */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        WebkitOverflowScrolling: 'touch'
      }}>
        {/* Inner container with minimum width */}
        <Box sx={{
          minWidth: { xs: `${220 + weekDays.length * 120}px`, md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}>
          {/* Week header with days */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: `220px repeat(${weekDays.length}, 120px)`,
                md: `220px repeat(${weekDays.length}, 1fr)`
              },
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              '& > *': {
                minWidth: 0,
                overflow: 'hidden'
              }
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
              bgcolor: isToday(day) ? (isDark ? 'rgba(10, 44, 36, 0.08)' : 'rgba(10, 44, 36, 0.08)') : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: isDark ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.12)'
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

          {/* Staff rows */}
          <Box sx={{ flex: 1 }}>
            {staffMembers.map((staff, staffIndex) => (
              <Box
                key={staff.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: `220px repeat(${weekDays.length}, 120px)`,
                    md: `220px repeat(${weekDays.length}, 1fr)`
                  },
                  borderBottom: 1,
                  borderColor: 'divider',
                  minHeight: 120,
                  bgcolor: staffIndex % 2 === 0 ? 'transparent' : isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                  '& > *': {
                    minWidth: 0,
                    overflow: 'hidden'
                  }
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
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
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
                      maxWidth: '100%',
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      },
                      '& .MuiChip-icon': { fontSize: '0.65rem', ml: 0.5 },
                      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.08)',
                      color: theme => theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)'
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Days for this staff */}
            {weekDays.map(day => {
              const dayEvents = getStaffDayEvents(staff.id, day)
              const displayLimit = 3
              const hasMore = dayEvents.length > displayLimit

              return (
                <Box
                  key={`${staff.id}-${day.toISOString()}`}
                  sx={{
                    p: { xs: 0.5, md: 1 },
                    borderRight: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 0.5, md: 0.75 },
                    bgcolor: isToday(day) ? (isDark ? 'rgba(10, 44, 36, 0.03)' : 'rgba(10, 44, 36, 0.03)') : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(10, 44, 36, 0.08)' : 'rgba(10, 44, 36, 0.08)'
                    },
                    minWidth: 0,
                    overflow: 'visible',
                    position: 'relative'
                  }}
                  onClick={(e) => {
                    // Only navigate if clicking on the cell itself (not on an event)
                    const target = e.target as HTMLElement
                    if (target === e.currentTarget || !target.closest('[data-event-card]')) {
                      onCellClick?.(staff.id, day)
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, md: 0.75 }, flex: 1, minHeight: 0 }}>
                    {dayEvents.length === 0 ? (
                      <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', py: { xs: 1, md: 2 } }}>
                        -
                      </Typography>
                    ) : (
                    <>
                      {dayEvents.slice(0, displayLimit).map(event => {
                        const colors = buildEventColors(colorScheme, event.extendedProps.status)
                        const baseFillOpacity = isDark ? 0.22 : 0.16
                        const fillColor = adjustColorOpacity(colors.border, baseFillOpacity)
                        const textColor = theme.palette.text.primary

                        return (
                          <Box
                            key={event.id}
                            data-event-card
                              onClick={(e) => {
                                e.stopPropagation()
                                onEventClick?.(event)
                              }}
                              sx={{
                              bgcolor: fillColor,
                              border: 'none',
                              borderLeft: `4px solid ${colors.border}`,
                              borderRadius: 0.75,
                              p: { xs: 0.5, md: 0.75 },
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              '&:hover': {
                                boxShadow: 1,
                                transform: 'translateX(2px)'
                              },
                              minWidth: 0,
                              overflow: 'hidden',
                              position: 'relative'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                              <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                  color: textColor,
                                    fontSize: { xs: '0.6rem', md: '0.65rem' },
                                    lineHeight: 1
                                  }}
                                >
                                {format(new Date(event.start), 'h:mm a')}
                              </Typography>
                              {event.extendedProps.starred && (
                                <i
                                  className="ri-star-fill"
                                  style={{ fontSize: '0.6rem', color: 'var(--mui-palette-customColors-coral)' }}
                                />
                              )}
                            </Box>
                            <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    fontWeight: 600,
                                  color: textColor,
                                    fontSize: { xs: '0.65rem', md: '0.7rem' },
                                    lineHeight: 1.2,
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
                      {hasMore && (
                        <Box
                          onClick={(e) => {
                            e.stopPropagation()
                            onDateClick?.(day)
                          }}
                          sx={{
                            textAlign: 'center',
                            py: 0.5,
                            px: 1,
                            bgcolor: isDark ? 'rgba(10, 44, 36, 0.1)' : 'rgba(10, 44, 36, 0.1)',
                            borderRadius: 0.75,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: isDark ? 'rgba(10, 44, 36, 0.2)' : 'rgba(10, 44, 36, 0.2)',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'primary.main',
                              fontWeight: 700,
                              fontSize: { xs: '0.65rem', md: '0.7rem' }
                            }}
                          >
                            +{dayEvents.length - displayLimit} more
                          </Typography>
                        </Box>
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
      </Box>
    </Box>
  )
}
