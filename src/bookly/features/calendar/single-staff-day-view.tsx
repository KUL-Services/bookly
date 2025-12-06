'use client'

import { Box, Typography, IconButton, Avatar, Button, Chip, Select, MenuItem, FormControl } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, isSameDay, isToday } from 'date-fns'
import { useState, useRef, useEffect } from 'react'
import { mockServices } from '@/bookly/data/mock-data'
import { useCalendarStore } from './state'
import { getBranchName, buildEventColors } from './utils'
import type { CalendarEvent } from './types'

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
  const colorScheme = useCalendarStore(state => state.colorScheme)

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
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          {onBack && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<i className="ri-arrow-left-line" />}
              onClick={onBack}
            >
              All Staff
            </Button>
          )}

          {staffOptions.length > 0 && onStaffChange && onBack && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={staff.id}
                onChange={(e) => {
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
                <MenuItem value="all-staff">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="ri-group-line" style={{ fontSize: '1.25rem' }} />
                    <Typography variant="body2" fontWeight={600}>All Staff</Typography>
                  </Box>
                </MenuItem>
                {staffOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={option.photo}
                        sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                      >
                        {option.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body2">{option.name}</Typography>
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
              bgcolor: theme.palette.primary.main,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {staff.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" fontWeight={600}>
                {staff.name}
              </Typography>
              {staff.branchId && (
                <Chip
                  icon={<i className='ri-map-pin-line' style={{ fontSize: '0.75rem' }} />}
                  label={getBranchName(staff.branchId)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    '& .MuiChip-icon': { fontSize: '0.75rem', ml: 0.5 },
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                    color: theme => theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)'
                  }}
                />
              )}
            </Box>
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
                    '&::after': showDashedLine ? {
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
                    } : {}
                  }}
                >
                  {minutes === 0 && (
                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.7rem', mt: -0.5 }}>
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
                    '&::after': showDashedLine ? {
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
                    } : {}
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
                  bgcolor: '#ef4444',
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
                    bgcolor: '#ef4444'
                  },
                  '&::after': {
                    content: `"${currentTimeIndicator.time}"`,
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: '#ef4444',
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
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.15)',
                      border: 2,
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.5)' : 'rgba(20, 184, 166, 0.6)',
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
                        variant="caption"
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
                        {Math.round((endMinutes - startMinutes) / 60 * 10) / 10}h
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
            {todayEvents.map(event => {
              const { top, height } = getEventStyle(event)
              const colors = buildEventColors(colorScheme, event.extendedProps.status)

              return (
                <Box
                  key={event.id}
                  data-event="true"
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
                    display: 'flex',
                    flexDirection: 'column',
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
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: colors.text,
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
                    {event.extendedProps.starred && '⭐ '}
                    {event.extendedProps.customerName}
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
                            bgcolor: service.color,
                            flexShrink: 0
                          }}
                        />
                      ) : null
                    })()}
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text,
                        fontSize: '0.8rem',
                        opacity: 0.9,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {event.extendedProps.serviceName || event.title}
                    </Typography>
                  </Box>
                  {height > 100 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: colors.text,
                        fontSize: '0.7rem',
                        opacity: 0.8,
                        flexShrink: 0
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
