'use client'

import { Box, Typography, Avatar, Button, Select, MenuItem, FormControl, Popover, List, ListItemButton, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { useState, useEffect, useMemo } from 'react'
import { mockServices } from '@/bookly/data/mock-data'
import { useCalendarStore } from './state'
import { buildEventColors } from './utils'
import type { CalendarEvent } from './types'

// Helper to adjust color opacity for faded events
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

interface SingleStaffWeekViewProps {
  events: CalendarEvent[]
  staff: { id: string; name: string; photo?: string; workingHours?: string }
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onBack?: () => void
  onDateClick?: (date: Date) => void
  staffOptions?: Array<{ id: string; name: string; photo?: string }>
  onStaffChange?: (staffId: string) => void
}

interface DisplayWeekEvent {
  event: CalendarEvent
  isConsolidated: boolean
  bookingCount: number
  totalCapacity: number
  attendedCount: number
  attendanceBase: number
  slotEvents: CalendarEvent[]
}

export default function SingleStaffWeekView({
  events,
  staff,
  currentDate,
  onEventClick,
  onBack,
  onDateClick,
  staffOptions = [],
  onStaffChange
}: SingleStaffWeekViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const brandPrimary = '#0a2c24'
  const colorScheme = useCalendarStore(state => state.colorScheme)
  const isSearchActive = useCalendarStore(state => state.isSearchActive)
  const isEventMatchedBySearch = useCalendarStore(state => state.isEventMatchedBySearch)
  const staticSlots = useCalendarStore(state => state.staticSlots)

  // Current time tracking for live indicator
  const [currentTime, setCurrentTime] = useState(new Date())
  const [overflowAnchorEl, setOverflowAnchorEl] = useState<HTMLElement | null>(null)
  const [overflowItems, setOverflowItems] = useState<DisplayWeekEvent[]>([])
  const [overflowDay, setOverflowDay] = useState<Date | null>(null)

  const handleOverflowClose = () => {
    setOverflowAnchorEl(null)
    setOverflowItems([])
    setOverflowDay(null)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

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

  const consolidateDayEvents = useMemo(() => {
    return (dayEvents: CalendarEvent[]): DisplayWeekEvent[] => {
      const entries: DisplayWeekEvent[] = []
      const slotGroups = new Map<string, CalendarEvent[]>()

      dayEvents.forEach(event => {
        const slotId = event.extendedProps?.slotId
        if (slotId) {
          if (!slotGroups.has(slotId)) slotGroups.set(slotId, [])
          slotGroups.get(slotId)!.push(event)
          return
        }

        entries.push({
          event,
          isConsolidated: false,
          bookingCount: 1,
          totalCapacity: 1,
          attendedCount: event.extendedProps.status === 'attended' ? 1 : 0,
          attendanceBase: 1,
          slotEvents: [event]
        })
      })

      slotGroups.forEach((slotEvents, slotId) => {
        const firstEvent = slotEvents[0]
        const activeBookings = slotEvents.filter(e => e.extendedProps?.status !== 'cancelled')
        const attendedCount = activeBookings.filter(e => e.extendedProps?.status === 'attended').length
        const staticSlot = staticSlots.find(s => s.id === slotId)
        const totalCapacity = staticSlot?.capacity || activeBookings.length
        const attendanceBase = activeBookings.length > 0 ? activeBookings.length : totalCapacity

        entries.push({
          event: firstEvent,
          isConsolidated: true,
          bookingCount: activeBookings.length,
          totalCapacity,
          attendedCount,
          attendanceBase,
          slotEvents
        })
      })

      return entries.sort((a, b) => new Date(a.event.start).getTime() - new Date(b.event.start).getTime())
    }
  }, [staticSlots])

  // Get total appointments for the week
  const weekAppointments = staffEvents.filter(event => {
    const eventDate = new Date(event.start)
    return eventDate >= weekStart && eventDate <= weekEnd
  })

  // Calculate current time indicator position for a given day
  const getCurrentTimeIndicator = (day: Date) => {
    if (!isToday(day)) return null

    const now = currentTime
    const hours = now.getHours()
    const minutes = now.getMinutes()

    // Only show if within working hours (6 AM to 10 PM)
    if (hours < 6 || hours >= 22) return null

    return {
      time: format(now, 'h:mm a'),
      hours,
      minutes
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header with back button and staff info */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'rgba(10,44,36,0.16)',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          {onBack && (
            <Button variant='outlined' size='small' startIcon={<i className='ri-arrow-left-line' />} onClick={onBack}>
              All Staff
            </Button>
          )}

          {staffOptions.length > 0 && onStaffChange && onBack && (
            <FormControl size='small' sx={{ minWidth: 180 }}>
              <Select
                value={staff.id}
                onChange={e => {
                  const value = e.target.value
                  if (value === 'all-staff') {
                    onBack()
                  } else {
                    onStaffChange(value)
                  }
                }}
                displayEmpty
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value='all-staff'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-group-line' style={{ fontSize: '1.25rem' }} />
                    <Typography variant='body2' fontWeight={600}>
                      All Staff
                    </Typography>
                  </Box>
                </MenuItem>
                {staffOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={option.photo} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {option.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </Avatar>
                      <Typography variant='body2'>{option.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Avatar
            src={staff.photo}
            sx={{
              width: 48,
              height: 48,
              bgcolor: brandPrimary,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {staff.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </Avatar>
          <Box>
            <Typography variant='h6' fontWeight={600}>
              {staff.name}
            </Typography>
            <Typography variant='caption' color='text.secondary' fontFamily='var(--font-fira-code)'>
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
            const timeIndicator = getCurrentTimeIndicator(day)

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
                    borderColor: 'rgba(10,44,36,0.12)',
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
                    variant='caption'
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
                    variant='h5'
                    fontWeight={700}
                    fontFamily='var(--font-fira-code)'
                    sx={{
                      color: isToday(day) ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      color: isToday(day) ? 'primary.contrastText' : 'text.secondary',
                      opacity: 0.8,
                      mb: 0.25
                    }}
                  >
                    {dayEvents.length} appointment{dayEvents.length !== 1 ? 's' : ''}
                  </Typography>
                  <Typography
                    variant='caption'
                    fontFamily='var(--font-fira-code)'
                    sx={{
                      display: 'block',
                      color: isToday(day) ? 'primary.contrastText' : 'text.secondary',
                      opacity: 0.7,
                      fontSize: '0.65rem'
                    }}
                  >
                    {staff.workingHours || '10:00 AM-7:00 PM'}
                  </Typography>
                </Box>

                {/* Day events */}
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    overflow: 'auto',
                    position: 'relative'
                  }}
                >
                  {/* Current time indicator */}
                  {timeIndicator && (
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        bgcolor: 'var(--mui-palette-error-main)',
                        zIndex: 100,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'var(--mui-palette-error-main)'
                        }
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'var(--mui-palette-error-main)',
                          color: 'white',
                          px: 1,
                          py: 0.25,
                          borderRadius: 0.5,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          boxShadow: 2
                        }}
                      >
                        {timeIndicator.time}
                      </Typography>
                    </Box>
                  )}

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
                      <Typography variant='caption' color='text.disabled' fontFamily='var(--font-fira-code)'>
                        No appointments
                      </Typography>
                    </Box>
                  ) : (
                    (() => {
                      const consolidatedEvents = consolidateDayEvents(dayEvents)
                      const maxVisibleEvents = 4
                      const visibleEvents = consolidatedEvents.slice(0, maxVisibleEvents)
                      const overflowCount = consolidatedEvents.length - maxVisibleEvents

                      return (
                        <>
                          {visibleEvents.map(item => {
                      const event = item.event
                      const colors = buildEventColors(colorScheme, item.isConsolidated ? 'confirmed' : event.extendedProps.status)

                      // Search highlighting logic
                      const isMatchedBySearch = item.slotEvents.some(slotEvent => isEventMatchedBySearch(slotEvent.id))
                      const isFaded = isSearchActive && !isMatchedBySearch
                      const isHighlighted = isSearchActive && isMatchedBySearch

                      const effectiveBorderColor = isFaded ? adjustColorOpacity(colors.border, 0.3) : colors.border
                      const baseFillOpacity = isDark ? 0.22 : 0.16
                      const effectiveBgColor = adjustColorOpacity(
                        effectiveBorderColor,
                        isFaded ? baseFillOpacity * 0.6 : baseFillOpacity
                      )
                      const baseTextColor = theme.palette.text.primary
                      const effectiveTextColor = isFaded
                        ? adjustColorOpacity(baseTextColor, isDark ? 0.5 : 0.6)
                        : baseTextColor

                          return (
                            <Tooltip
                              key={event.id}
                              title={
                                item.isConsolidated ? (
                                  <Box sx={{ p: 1, minWidth: 220 }}>
                                    <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 700 }}>
                                      {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                                    </Typography>
                                    <Typography
                                      variant='caption'
                                      sx={{ color: 'rgba(255,255,255,0.9)', display: 'block', mt: 0.5, mb: 0.75 }}
                                    >
                                      {item.attendedCount}/{item.attendanceBase} Attended • {item.bookingCount}/
                                      {item.totalCapacity} booked
                                    </Typography>
                                    {item.slotEvents
                                      .filter(slotEvent => slotEvent.extendedProps?.status !== 'cancelled')
                                      .slice(0, 8)
                                      .map(slotEvent => (
                                        <Box
                                          key={slotEvent.id}
                                          sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.25 }}
                                        >
                                          <Typography
                                            variant='caption'
                                            sx={{ color: 'common.white', fontSize: '0.68rem' }}
                                          >
                                            {slotEvent.extendedProps.customerName || 'Client'}
                                          </Typography>
                                          <Typography
                                            variant='caption'
                                            sx={{
                                              color: 'rgba(255,255,255,0.85)',
                                              fontSize: '0.65rem',
                                              textTransform: 'capitalize'
                                            }}
                                          >
                                            {(slotEvent.extendedProps.status || 'pending').replace('_', ' ')}
                                          </Typography>
                                        </Box>
                                      ))}
                                  </Box>
                                ) : (
                                  ''
                                )
                              }
                              arrow={item.isConsolidated}
                              disableHoverListener={!item.isConsolidated}
                              placement='top'
                            >
                              <Box
                                onClick={() => onEventClick?.(event)}
                                sx={{
                                  position: 'relative',
                                  bgcolor: effectiveBgColor,
                                  border: 'none',
                                  borderLeft: `4px solid ${effectiveBorderColor}`,
                                  borderRadius: 1.5,
                                  p: 1.5,
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  opacity: isFaded ? 0.4 : 1,
                                  filter: isFaded ? 'grayscale(50%)' : 'none',
                                  boxShadow: isHighlighted
                                    ? '0px 0px 0px 3px rgba(10, 44, 36, 0.5), 0px 4px 12px rgba(0,0,0,0.15)'
                                    : 'none',
                                  transform: isHighlighted ? 'scale(1.02)' : 'none',
                                  zIndex: isHighlighted ? 5 : 'auto',
                                  '&:hover': {
                                    boxShadow: isHighlighted
                                      ? '0px 0px 0px 3px rgba(10, 44, 36, 0.7), 0px 6px 16px rgba(0,0,0,0.2)'
                                      : 3,
                                    transform: 'scale(1.02)',
                                    opacity: isFaded ? 0.6 : 1
                                  }
                                }}
                              >
                                {(item.isConsolidated || event.extendedProps.slotId) && (
                                  <Box sx={{ position: 'absolute', top: 6, right: 6, lineHeight: 1 }}>
                                    <i className='ri-star-fill' style={{ fontSize: 10, color: '#fbbf24' }} />
                                  </Box>
                                )}
                                <Typography
                                  variant='caption'
                                  fontFamily='var(--font-fira-code)'
                                  sx={{
                                    display: 'block',
                                    fontWeight: 700,
                                    color: effectiveTextColor,
                                    fontSize: '0.7rem',
                                    mb: 0.5
                                  }}
                                >
                                  {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                                </Typography>
                                <Typography
                                  variant='body2'
                                  fontFamily='var(--font-fira-code)'
                                  sx={{
                                    fontWeight: 700,
                                    color: effectiveTextColor,
                                    fontSize: '0.85rem',
                                    lineHeight: 1.4,
                                    mb: 0.25
                                  }}
                                >
                                  {item.isConsolidated
                                    ? event.extendedProps.serviceName || event.title
                                    : event.extendedProps.customerName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {(() => {
                                    const service = mockServices.find(s => s.name === event.extendedProps?.serviceName)
                                    return service?.color ? (
                                      <Box
                                        sx={{
                                          width: 5,
                                          height: 5,
                                          borderRadius: '50%',
                                          bgcolor: isFaded ? adjustColorOpacity(service.color, 0.3) : service.color,
                                          flexShrink: 0
                                        }}
                                      />
                                    ) : null
                                  })()}
                                  <Typography
                                    variant='caption'
                                    sx={{
                                      color: effectiveTextColor,
                                      fontSize: '0.7rem',
                                      opacity: isFaded ? 0.5 : 0.9,
                                      lineHeight: 1.3
                                    }}
                                  >
                                    {item.isConsolidated
                                      ? `${item.bookingCount}/${item.totalCapacity} booked`
                                      : event.extendedProps.serviceName || event.title}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant='caption'
                                  sx={{
                                    color: effectiveTextColor,
                                    fontSize: '0.68rem',
                                    opacity: isFaded ? 0.4 : 0.8,
                                    textTransform: 'capitalize',
                                    display: 'block',
                                    mt: 0.25
                                  }}
                                >
                                  {item.isConsolidated
                                    ? `${item.attendedCount}/${item.attendanceBase} Attended`
                                    : (event.extendedProps.status || 'pending').replace('_', ' ')}
                                </Typography>
                              </Box>
                            </Tooltip>
                          )
                        })}

                          {overflowCount > 0 && (
                            <Box
                              onClick={e => {
                                e.stopPropagation()
                                setOverflowAnchorEl(e.currentTarget)
                                setOverflowItems(consolidatedEvents.slice(maxVisibleEvents))
                                setOverflowDay(day)
                              }}
                              sx={{
                                mt: 0.5,
                                p: 0.75,
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.selected' }
                              }}
                            >
                              <Typography variant='caption' sx={{ fontWeight: 600, color: 'primary.main' }}>
                                +{overflowCount} more
                              </Typography>
                            </Box>
                          )}
                        </>
                      )
                    })()
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>

      <Popover
        open={Boolean(overflowAnchorEl)}
        anchorEl={overflowAnchorEl}
        onClose={handleOverflowClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ minWidth: 280, maxWidth: 360, p: 1 }}>
          <Typography variant='subtitle2' fontWeight={700} sx={{ px: 1, pb: 0.5 }}>
            {overflowDay ? format(overflowDay, 'EEE, MMM d') : 'More bookings'}
          </Typography>
          <List dense disablePadding>
            {overflowItems.map(item => (
              <ListItemButton
                key={item.event.id}
                onClick={() => {
                  onEventClick?.(item.event)
                  handleOverflowClose()
                }}
                sx={{ borderRadius: 1, alignItems: 'flex-start', mb: 0.25 }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                    {format(new Date(item.event.start), 'h:mm a')}
                  </Typography>
                  <Typography variant='body2' fontWeight={600} sx={{ lineHeight: 1.3 }}>
                    {item.event.extendedProps.serviceName || item.event.title}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {item.isConsolidated
                      ? `${item.attendedCount}/${item.attendanceBase} Attended • ${item.bookingCount}/${item.totalCapacity}`
                      : `${item.event.extendedProps.customerName || 'Client'} • ${(item.event.extendedProps.status || 'pending').replace('_', ' ')}`}
                  </Typography>
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Popover>
    </Box>
  )
}
