'use client'

import { Box, Typography, IconButton, Avatar, Button, Chip, Select, MenuItem, FormControl, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, isSameDay, isToday } from 'date-fns'
import { useState, useRef, useEffect, useMemo } from 'react'
import { mockServices } from '@/bookly/data/mock-data'
import { useCalendarStore } from './state'
import { getBranchName, buildEventColors } from './utils'
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

interface SingleStaffDayViewProps {
  events: CalendarEvent[]
  staff: { id: string; name: string; photo?: string; workingHours?: string; branchId?: string }
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onBack?: () => void
  onTimeRangeSelect?: (
    start: Date,
    end: Date,
    jsEvent?: MouseEvent,
    dimensions?: { top: number; left: number; width: number; height: number } | null
  ) => void
  staffOptions?: Array<{ id: string; name: string; photo?: string }>
  onStaffChange?: (staffId: string) => void
}

interface DisplayStaffEvent {
  event: CalendarEvent
  isConsolidated: boolean
  bookingCount: number
  totalCapacity: number
  attendedCount: number
  attendanceBase: number
  slotEvents: CalendarEvent[]
}

export default function SingleStaffDayView({
  events,
  staff,
  currentDate,
  onEventClick,
  onBack,
  onTimeRangeSelect,
  staffOptions = [],
  onStaffChange
}: SingleStaffDayViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const brandPrimary = '#0a2c24'
  const colorScheme = useCalendarStore(state => state.colorScheme)
  const isSearchActive = useCalendarStore(state => state.isSearchActive)
  const isEventMatchedBySearch = useCalendarStore(state => state.isEventMatchedBySearch)
  const staticSlots = useCalendarStore(state => state.staticSlots)

  // Drag-to-select state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)
  const eventsColumnRef = useRef<HTMLDivElement>(null)
  const selectionBoxRef = useRef<HTMLDivElement>(null)

  // Filter events for current date and staff
  const todayEvents = events.filter(
    event => isSameDay(new Date(event.start), currentDate) && event.extendedProps.staffId === staff.id
  )

  // Generate time slots (6 AM to 10 PM, 15 min intervals)
  const timeSlots: Date[] = []
  const startHour = 6
  const endHour = 22
  const minutesPerSlot = 15

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += minutesPerSlot) {
      const slot = new Date(currentDate)
      slot.setHours(hour, minute, 0, 0)
      timeSlots.push(slot)
    }
  }

  // Current time tracking for live indicator
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Calculate event position and height
  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const startMinutes = start.getHours() * 60 + start.getMinutes() - startHour * 60
    const duration = (end.getTime() - start.getTime()) / (1000 * 60)
    const slotHeight = 40 // 40px per 15 min slot
    const top = (startMinutes / minutesPerSlot) * slotHeight
    const height = (duration / minutesPerSlot) * slotHeight

    return { top, height }
  }

  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    if (!isToday(currentDate)) return null

    const now = currentTime
    const currentMinutes = now.getHours() * 60 + now.getMinutes() - startHour * 60

    // Only show if within working hours
    if (currentMinutes < 0 || currentMinutes > (endHour - startHour) * 60) return null

    const slotHeight = 40 // 40px per 15 min slot
    const top = (currentMinutes / minutesPerSlot) * slotHeight

    return { top, time: format(now, 'h:mm a') }
  }

  // Convert Y position to time in minutes from start hour
  const getMinutesFromY = (y: number): number => {
    const slotHeight = 40 // 40px per 15 min slot
    const minutes = Math.floor((y / slotHeight) * minutesPerSlot)
    // Round to nearest 15 minutes
    return Math.round(minutes / minutesPerSlot) * minutesPerSlot
  }

  // Convert minutes to Date object
  const minutesToDate = (minutes: number): Date => {
    const startHour = 6
    const date = new Date(currentDate)
    date.setHours(Math.floor(minutes / 60) + startHour, minutes % 60, 0, 0)
    return date
  }

  // Handle mouse down to start drag selection
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't start drag if clicking on an event
    const target = e.target as HTMLElement
    if (target.closest('[data-event]')) {
      return
    }

    const rect = eventsColumnRef.current?.getBoundingClientRect()
    if (!rect) return

    const y = e.clientY - rect.top + (eventsColumnRef.current?.parentElement?.scrollTop || 0)
    const minutes = getMinutesFromY(y)

    setIsDragging(true)
    setDragStart(minutes)
    setDragEnd(minutes)
  }

  // Handle mouse move during drag
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || dragStart === null) return

    const rect = eventsColumnRef.current?.getBoundingClientRect()
    if (!rect) return

    const y = e.clientY - rect.top + (eventsColumnRef.current?.parentElement?.scrollTop || 0)
    const minutes = getMinutesFromY(y)

    setDragEnd(minutes)
  }

  // Handle mouse up to complete drag selection
  const handleMouseUp = () => {
    if (!isDragging || dragStart === null || dragEnd === null) {
      setIsDragging(false)
      setDragStart(null)
      setDragEnd(null)
      return
    }

    const startMinutes = Math.min(dragStart, dragEnd)
    const endMinutes = Math.max(dragStart, dragEnd)

    // Only trigger if selection is at least 15 minutes
    if (endMinutes - startMinutes >= 15) {
      const startDate = minutesToDate(startMinutes)
      const endDate = minutesToDate(endMinutes)

      // Capture selection box dimensions before clearing state
      let dimensions = null
      if (selectionBoxRef.current) {
        const rect = selectionBoxRef.current.getBoundingClientRect()
        dimensions = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      }

      onTimeRangeSelect?.(startDate, endDate, undefined, dimensions)
    }

    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  // Get drag selection style
  const getDragSelectionStyle = () => {
    if (!isDragging || dragStart === null || dragEnd === null) return null

    const startMinutes = Math.min(dragStart, dragEnd)
    const endMinutes = Math.max(dragStart, dragEnd)
    const slotHeight = 40 // 40px per 15 min slot
    const top = (startMinutes / minutesPerSlot) * slotHeight
    const height = ((endMinutes - startMinutes) / minutesPerSlot) * slotHeight

    return { top, height }
  }

  const currentTimeIndicator = getCurrentTimePosition()

  const displayEvents = useMemo<DisplayStaffEvent[]>(() => {
    const entries: DisplayStaffEvent[] = []
    const slotGroups = new Map<string, CalendarEvent[]>()

    todayEvents.forEach(event => {
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
  }, [todayEvents, staticSlots])

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant='h6' fontWeight={600}>
                {staff.name}
              </Typography>
              {staff.branchId && (
                <Chip
                  icon={<i className='ri-map-pin-line' style={{ fontSize: '0.75rem' }} />}
                  label={getBranchName(staff.branchId)}
                  size='small'
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    '& .MuiChip-icon': { fontSize: '0.75rem', ml: 0.5 },
                    bgcolor: theme =>
                      theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.08)',
                    color: theme => (theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)')
                  }}
                />
              )}
            </Box>
            <Typography variant='caption' color='text.secondary'>
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
          <Box
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
            }}
          >
            {timeSlots.map((slot, index) => {
              const minutes = slot.getMinutes()
              const showDashedLine = minutes === 15 || minutes === 30 || minutes === 45

                return (
                  <Box
                  key={index}
                  sx={{
                    height: 40,
                    borderBottom: minutes === 0 ? 1 : 0,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    pt: minutes === 0 ? 0 : 0.5,
                    position: 'relative',
                    '&::after': showDashedLine
                      ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '1px',
                          backgroundImage: isDark
                            ? 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.12) 100%)'
                            : 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.12) 100%)',
                          backgroundSize: '8px 1px',
                          backgroundRepeat: 'repeat-x'
                        }
                      : {}
                  }}
                >
                  {minutes === 0 && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      fontWeight={500}
                      sx={{ fontSize: '0.7rem', mt: -0.5 }}
                    >
                      {format(slot, 'h a')}
                    </Typography>
                  )}
                </Box>
              )
            })}
          </Box>

          {/* Events column */}
          <Box
            ref={eventsColumnRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            sx={{
              position: 'relative',
              cursor: isDragging ? 'row-resize' : 'pointer',
              userSelect: 'none'
            }}
          >
            {/* Time slot grid lines */}
            {timeSlots.map((slot, index) => {
              const minutes = slot.getMinutes()
              const showDashedLine = minutes === 15 || minutes === 30 || minutes === 45

              return (
                <Box
                  key={index}
                  sx={{
                    height: 40,
                    borderBottom: minutes === 0 ? 1 : 0,
                    borderColor: 'divider',
                    position: 'relative',
                    '&::after': showDashedLine
                      ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '1px',
                          backgroundImage: isDark
                            ? 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.12) 100%)'
                            : 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.12) 100%)',
                          backgroundSize: '8px 1px',
                          backgroundRepeat: 'repeat-x'
                        }
                      : {}
                  }}
                />
              )
            })}

            {/* Current time indicator */}
            {currentTimeIndicator && (
              <Box
                sx={{
                  position: 'absolute',
                  top: `${currentTimeIndicator.top}px`,
                  left: 0,
                  right: 0,
                  height: '2px',
                  bgcolor: 'var(--mui-palette-error-main)',
                  zIndex: 100,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'var(--mui-palette-error-main)'
                  },
                  '&::after': {
                    content: `"${currentTimeIndicator.time}"`,
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
                  }
                }}
              />
            )}

            {/* Drag selection indicator */}
            {(() => {
              const dragStyle = getDragSelectionStyle()
              if (!dragStyle || dragStart === null || dragEnd === null) return null

              const startMinutes = Math.min(dragStart, dragEnd)
              const endMinutes = Math.max(dragStart, dragEnd)
              const startDate = minutesToDate(startMinutes)
              const endDate = minutesToDate(endMinutes)

              return (
                <>
                  {/* Selection box */}
                  <Box
                    ref={selectionBoxRef}
                    sx={{
                      position: 'absolute',
                      top: `${dragStyle.top}px`,
                      left: 8,
                      right: 8,
                      height: `${dragStyle.height}px`,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.2)' : 'rgba(10, 44, 36, 0.15)',
                      border: 2,
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.5)' : 'rgba(10, 44, 36, 0.6)',
                      borderRadius: 1,
                      pointerEvents: 'none',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1
                    }}
                  >
                    {/* Start time indicator */}
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: 2
                      }}
                    >
                      {format(startDate, 'h:mm a')}
                    </Box>

                    {/* Duration indicator (only if selection is tall enough) */}
                    {dragStyle.height > 120 && (
                      <Typography
                        variant='caption'
                        sx={{
                          bgcolor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
                          color: 'primary.main',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: 700,
                          fontSize: '0.7rem'
                        }}
                      >
                        {Math.round(((endMinutes - startMinutes) / 60) * 10) / 10}h
                      </Typography>
                    )}

                    {/* End time indicator */}
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: 2
                      }}
                    >
                      {format(endDate, 'h:mm a')}
                    </Box>
                  </Box>
                </>
              )
            })()}

            {/* Events */}
            {displayEvents.map(item => {
              const event = item.event
              const { top, height } = getEventStyle(event)
              const colors = buildEventColors(colorScheme, item.isConsolidated ? 'confirmed' : event.extendedProps.status)

              // Search highlighting logic
              const isMatchedBySearch = item.slotEvents.some(slotEvent => isEventMatchedBySearch(slotEvent.id))
              const isFaded = isSearchActive && !isMatchedBySearch
              const isHighlighted = isSearchActive && isMatchedBySearch

              // Adjust colors for faded events
              const effectiveBorderColor = isFaded ? adjustColorOpacity(colors.border, 0.3) : colors.border
              const baseFillOpacity = isDark ? 0.22 : 0.16
              const effectiveBgColor = adjustColorOpacity(
                effectiveBorderColor,
                isFaded ? baseFillOpacity * 0.6 : baseFillOpacity
              )
              const baseTextColor = theme.palette.text.primary
              const effectiveTextColor = isFaded ? adjustColorOpacity(baseTextColor, isDark ? 0.5 : 0.6) : baseTextColor

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
                          {item.attendedCount}/{item.attendanceBase} Attended • {item.bookingCount}/{item.totalCapacity}{' '}
                          booked
                        </Typography>
                        {item.slotEvents
                          .filter(slotEvent => slotEvent.extendedProps?.status !== 'cancelled')
                          .slice(0, 8)
                          .map(slotEvent => (
                            <Box
                              key={slotEvent.id}
                              sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.25 }}
                            >
                              <Typography variant='caption' sx={{ color: 'common.white', fontSize: '0.68rem' }}>
                                {slotEvent.extendedProps.customerName || 'Client'}
                              </Typography>
                              <Typography
                                variant='caption'
                                sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.65rem', textTransform: 'capitalize' }}
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
                    data-event='true'
                    onClick={() => onEventClick?.(event)}
                    sx={{
                      position: 'absolute',
                      top: `${top}px`,
                      left: 8,
                      right: 8,
                      height: `${height}px`,
                      bgcolor: effectiveBgColor,
                      border: 'none',
                      borderLeft: `4px solid ${effectiveBorderColor}`,
                      borderRadius: 1.5,
                      p: 1.5,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      opacity: isFaded ? 0.4 : 1,
                      filter: isFaded ? 'grayscale(50%)' : 'none',
                      boxShadow: isHighlighted
                        ? '0px 0px 0px 3px rgba(10, 44, 36, 0.5), 0px 4px 12px rgba(0,0,0,0.15)'
                        : 2,
                      transform: isHighlighted ? 'scale(1.02)' : 'none',
                      zIndex: isHighlighted ? 5 : 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: isHighlighted
                          ? '0px 0px 0px 3px rgba(10, 44, 36, 0.7), 0px 6px 16px rgba(0,0,0,0.2)'
                          : 6,
                        transform: isHighlighted ? 'scale(1.03) translateX(4px)' : 'translateX(4px)',
                        zIndex: 5,
                        opacity: isFaded ? 0.6 : 1
                      }
                    }}
                  >
                    {(item.isConsolidated || event.extendedProps.slotId) && (
                      <Box sx={{ position: 'absolute', top: 6, right: 6, lineHeight: 1 }}>
                        <i className='ri-star-fill' style={{ fontSize: 11, color: '#fbbf24' }} />
                      </Box>
                    )}
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        fontWeight: 700,
                        color: effectiveTextColor,
                        fontSize: '0.75rem',
                        mb: 0.5,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flexShrink: 0
                      }}
                    >
                      {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                    </Typography>
                    <Typography
                      variant='body1'
                      sx={{
                        fontWeight: 700,
                        color: effectiveTextColor,
                        fontSize: '0.95rem',
                        lineHeight: 1.4,
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                        flexShrink: 1
                      }}
                    >
                      {item.isConsolidated ? event.extendedProps.serviceName || event.title : event.extendedProps.customerName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: height > 100 ? 0.5 : 0 }}>
                      {(() => {
                        const service = mockServices.find(s => s.name === event.extendedProps?.serviceName)
                        return service?.color ? (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: isFaded ? adjustColorOpacity(service.color, 0.3) : service.color,
                              flexShrink: 0
                            }}
                          />
                        ) : null
                      })()}
                      <Typography
                        variant='body2'
                        sx={{
                          color: effectiveTextColor,
                          fontSize: '0.8rem',
                          opacity: isFaded ? 0.5 : 0.9,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
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
                        display: 'block',
                        color: effectiveTextColor,
                        fontSize: '0.68rem',
                        opacity: isFaded ? 0.4 : 0.8,
                        textTransform: 'capitalize'
                      }}
                    >
                      {item.isConsolidated
                        ? `${item.attendedCount}/${item.attendanceBase} Attended`
                        : (event.extendedProps.status || 'pending').replace('_', ' ')}
                    </Typography>
                    {height > 100 && !item.isConsolidated && (
                      <Typography
                        variant='caption'
                        sx={{
                          display: 'block',
                          color: effectiveTextColor,
                          fontSize: '0.7rem',
                          opacity: isFaded ? 0.4 : 0.8,
                          flexShrink: 0
                        }}
                      >
                        EGP {event.extendedProps.price}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
