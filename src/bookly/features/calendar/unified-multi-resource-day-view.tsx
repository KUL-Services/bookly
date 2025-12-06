'use client'

import { Box, Typography, Avatar, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, addMinutes, isSameDay, isToday } from 'date-fns'
import { useState, useEffect } from 'react'
import { mockStaff, mockServices } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from '../staff-management/staff-store'
import { useCalendarStore } from './state'
import { getBranchName, buildEventColors } from './utils'
import type { CalendarEvent, DayOfWeek } from './types'

interface UnifiedMultiResourceDayViewProps {
  events: CalendarEvent[]
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onStaffClick?: (staffId: string) => void
  onRoomClick?: (roomId: string) => void
  onCellClick?: (resourceId: string, resourceType: 'staff' | 'room', date: Date) => void
}

export default function UnifiedMultiResourceDayView({
  events,
  currentDate,
  onEventClick,
  onStaffClick,
  onRoomClick,
  onCellClick
}: UnifiedMultiResourceDayViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const colorScheme = useCalendarStore(state => state.colorScheme)
  const { rooms } = useStaffManagementStore()

  // Combine staff and rooms into resource list
  const staffResources = mockStaff.map(staff => ({
    ...staff,
    type: 'staff' as const
  }))

  const roomResources = rooms.map(room => ({
    ...room,
    type: 'room' as const,
    name: room.name,
    photo: undefined
  }))

  // Filter events for current date
  const todayEvents = events.filter(event => isSameDay(new Date(event.start), currentDate))

  // Generate time slots (6 AM to 10 PM, 15 min intervals)
  const timeSlots: Date[] = []
  const startHour = 6
  const endHour = 22
  const minutesPerSlot = 15
  const baseDate = new Date(currentDate)
  baseDate.setHours(startHour, 0, 0, 0)

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += minutesPerSlot) {
      const slot = new Date(currentDate)
      slot.setHours(hour, minute, 0, 0)
      timeSlots.push(slot)
    }
  }

  // Current time tracking
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Get events for a specific resource
  const getResourceEvents = (resourceId: string, resourceType: 'staff' | 'room') => {
    if (resourceType === 'staff') {
      return todayEvents.filter(event => event.extendedProps.staffId === resourceId)
    } else {
      return todayEvents.filter(event => event.extendedProps.roomId === resourceId)
    }
  }

  // Get room assignment blocks for static staff
  const getStaffRoomBlocks = (staffId: string) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (!staff || staff.staffType !== 'static' || !staff.roomAssignments) {
      return []
    }

    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = dayNames[currentDate.getDay()]

    return staff.roomAssignments.filter(assignment => assignment.dayOfWeek === dayOfWeek)
  }

  // Calculate event position and height
  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const startMinutes = start.getHours() * 60 + start.getMinutes() - startHour * 60
    const duration = (end.getTime() - start.getTime()) / (1000 * 60)
    const slotHeight = 40
    const top = (startMinutes / minutesPerSlot) * slotHeight
    const height = (duration / minutesPerSlot) * slotHeight

    return { top, height }
  }

  // Calculate room block style
  const getRoomBlockStyle = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)

    const startMins = startHours * 60 + startMinutes - startHour * 60
    const endMins = endHours * 60 + endMinutes - startHour * 60
    const duration = endMins - startMins

    const slotHeight = 40
    const top = (startMins / minutesPerSlot) * slotHeight
    const height = (duration / minutesPerSlot) * slotHeight

    return { top, height }
  }

  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    if (!isToday(currentDate)) return null

    const now = currentTime
    const currentMinutes = now.getHours() * 60 + now.getMinutes() - startHour * 60

    if (currentMinutes < 0 || currentMinutes > (endHour - startHour) * 60) return null

    const slotHeight = 40
    const top = (currentMinutes / minutesPerSlot) * slotHeight

    return { top, time: format(now, 'h:mm a') }
  }

  const currentTimeIndicator = getCurrentTimePosition()

  const renderResourceColumn = (resource: any, index: number) => {
    const isStaff = resource.type === 'staff'
    const resourceEvents = getResourceEvents(resource.id, resource.type)
    const roomBlocks = isStaff ? getStaffRoomBlocks(resource.id) : []

    const handleClick = () => {
      if (isStaff && onStaffClick) {
        onStaffClick(resource.id)
      } else if (!isStaff && onRoomClick) {
        onRoomClick(resource.id)
      }
    }

    const handleCellClickInternal = () => {
      if (onCellClick) {
        onCellClick(resource.id, resource.type, currentDate)
      }
    }

    return (
      <Box
        key={resource.id}
        sx={{
          borderRight: 1,
          borderColor: 'divider',
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
          }
        }}
        onClick={handleCellClickInternal}
      >
        {/* Room assignment blocks (for static staff) */}
        {roomBlocks.map((block, idx) => {
          const style = getRoomBlockStyle(block.startTime, block.endTime)
          return (
            <Box
              key={idx}
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: style.top,
                height: style.height,
                bgcolor: isDark ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                border: '2px dashed',
                borderColor: 'warning.main',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1
              }}
            >
              <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'warning.dark' }}>
                {block.roomName}
              </Typography>
            </Box>
          )
        })}

        {/* Events */}
        {resourceEvents.map((event, eventIndex) => {
          const style = getEventStyle(event)
          const colors = buildEventColors(colorScheme, event.extendedProps.status)

          return (
            <Box
              key={event.id}
              onClick={(e) => {
                e.stopPropagation()
                onEventClick?.(event)
              }}
              sx={{
                position: 'absolute',
                left: 4,
                right: 4,
                top: style.top,
                height: Math.max(style.height, 30),
                bgcolor: colors.bg,
                borderLeft: `3px solid ${colors.border}`,
                borderRadius: 0.5,
                p: 0.5,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateX(2px)',
                  zIndex: 10
                }
              }}
            >
              <Typography
                variant='caption'
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  display: 'block',
                  color: colors.text,
                  lineHeight: 1.2
                }}
                noWrap
              >
                {format(event.start, 'h:mm a')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                  variant='caption'
                  sx={{
                    fontSize: '0.65rem',
                    color: colors.text,
                    opacity: 0.8
                  }}
                  noWrap
                >
                  {event.extendedProps?.serviceName || event.title}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Box sx={{ minWidth: { xs: `${60 + (staffResources.length + roomResources.length) * 150}px`, md: '100%' }, display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: `60px repeat(${staffResources.length + roomResources.length}, 150px)`,
                md: `60px repeat(${staffResources.length + roomResources.length}, minmax(180px, 1fr))`
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
            {/* Time column header */}
            <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider' }} />

            {/* Staff headers */}
            {staffResources.map(staff => (
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
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }
                }}
                onClick={() => onStaffClick?.(staff.id)}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='body2' fontWeight={600} noWrap>
                    {staff.name}
                  </Typography>
                  {staff.staffType && (
                    <Chip
                      label={staff.staffType}
                      size='small'
                      sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>
            ))}

            {/* Room headers */}
            {roomResources.map(room => (
              <Box
                key={room.id}
                sx={{
                  p: 2,
                  borderRight: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  bgcolor: isDark ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.02)',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(76, 175, 80, 0.08)' : 'rgba(76, 175, 80, 0.05)'
                  }
                }}
                onClick={() => onRoomClick?.(room.id)}
              >
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: room.color || 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className='ri-door-open-line' style={{ color: '#fff', fontSize: 16 }} />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='body2' fontWeight={600} noWrap>
                    {room.name}
                  </Typography>
                  {room.capacity && (
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                      Cap: {room.capacity}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Time grid */}
          <Box sx={{ position: 'relative', flex: 1, display: 'grid', gridTemplateColumns: { xs: `60px repeat(${staffResources.length + roomResources.length}, 150px)`, md: `60px repeat(${staffResources.length + roomResources.length}, minmax(180px, 1fr))` } }}>
            {/* Time labels column */}
            <Box sx={{ borderRight: 1, borderColor: 'divider' }}>
              {timeSlots.filter((_, i) => i % 4 === 0).map((slot, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 160,
                    borderBottom: 1,
                    borderColor: 'divider',
                    pt: 1,
                    pr: 1,
                    textAlign: 'right'
                  }}
                >
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                    {format(slot, 'h:mm a')}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Staff columns */}
            {staffResources.map((staff, index) => (
              <Box key={staff.id} sx={{ position: 'relative' }}>
                {timeSlots.filter((_, i) => i % 4 === 0).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 160,
                      borderBottom: 1,
                      borderRight: 1,
                      borderColor: 'divider'
                    }}
                  />
                ))}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  {renderResourceColumn(staff, index)}
                </Box>
              </Box>
            ))}

            {/* Room columns */}
            {roomResources.map((room, index) => (
              <Box key={room.id} sx={{ position: 'relative' }}>
                {timeSlots.filter((_, i) => i % 4 === 0).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 160,
                      borderBottom: 1,
                      borderRight: 1,
                      borderColor: 'divider',
                      bgcolor: isDark ? 'rgba(76, 175, 80, 0.02)' : 'rgba(76, 175, 80, 0.01)'
                    }}
                  />
                ))}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  {renderResourceColumn(room, index)}
                </Box>
              </Box>
            ))}

            {/* Current time indicator */}
            {currentTimeIndicator && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 60,
                  right: 0,
                  top: currentTimeIndicator.top,
                  height: 2,
                  bgcolor: 'error.main',
                  zIndex: 5,
                  pointerEvents: 'none',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -6,
                    top: -4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'error.main'
                  }
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
