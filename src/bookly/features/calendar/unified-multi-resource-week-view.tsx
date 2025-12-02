'use client'

import { Box, Typography, Avatar, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from '../staff-management/staff-store'
import { useCalendarStore } from './state'
import { getBranchName, buildEventColors } from './utils'
import type { CalendarEvent, DayOfWeek } from './types'

interface UnifiedMultiResourceWeekViewProps {
  events: CalendarEvent[]
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onStaffClick?: (staffId: string) => void
  onRoomClick?: (roomId: string) => void
  onDateClick?: (date: Date) => void
  onCellClick?: (resourceId: string, resourceType: 'staff' | 'room', date: Date) => void
}

export default function UnifiedMultiResourceWeekView({
  events,
  currentDate,
  onEventClick,
  onStaffClick,
  onRoomClick,
  onDateClick,
  onCellClick
}: UnifiedMultiResourceWeekViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const colorScheme = useCalendarStore(state => state.colorScheme)
  const { rooms } = useStaffManagementStore()

  // Get week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Combine staff and rooms
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

  // Get events for a specific resource and day
  const getResourceDayEvents = (resourceId: string, resourceType: 'staff' | 'room', day: Date) => {
    if (resourceType === 'staff') {
      return events.filter(
        event => event.extendedProps.staffId === resourceId && isSameDay(new Date(event.start), day)
      )
    } else {
      return events.filter(
        event => event.extendedProps.roomId === resourceId && isSameDay(new Date(event.start), day)
      )
    }
  }

  // Get room assignment for static staff on a specific day
  const getStaffRoomAssignment = (staffId: string, day: Date) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (!staff || staff.staffType !== 'static' || !staff.roomAssignments) {
      return null
    }

    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = dayNames[day.getDay()]

    return staff.roomAssignments.find(assignment => assignment.dayOfWeek === dayOfWeek)
  }

  const renderResourceRow = (resource: any, resourceIndex: number) => {
    const isStaff = resource.type === 'staff'
    const isRoom = resource.type === 'room'

    return (
      <Box
        key={resource.id}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: `220px repeat(${weekDays.length}, 120px)`,
            md: `220px repeat(${weekDays.length}, 1fr)`
          },
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 100,
          bgcolor: resourceIndex % 2 === 0 ? 'transparent' : isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
          '& > *': {
            minWidth: 0,
            overflow: 'hidden'
          }
        }}
      >
        {/* Resource info column */}
        <Box
          sx={{
            p: 2,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            bgcolor: isRoom ? (isDark ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.02)') : 'transparent',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
            }
          }}
          onClick={() => {
            if (isStaff && onStaffClick) {
              onStaffClick(resource.id)
            } else if (isRoom && onRoomClick) {
              onRoomClick(resource.id)
            }
          }}
        >
          {isStaff ? (
            <Avatar src={resource.photo} sx={{ width: 40, height: 40 }}>
              {resource.name.split(' ').map((n: string) => n[0]).join('')}
            </Avatar>
          ) : (
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: resource.color || 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className='ri-door-open-line' style={{ color: '#fff', fontSize: 18 }} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='body2' fontWeight={600} noWrap>
              {resource.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              {isStaff && resource.staffType && (
                <Chip
                  label={resource.staffType}
                  size='small'
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              )}
              {isRoom && resource.capacity && (
                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                  Cap: {resource.capacity}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Day cells */}
        {weekDays.map(day => {
          const dayEvents = getResourceDayEvents(resource.id, resource.type, day)
          const roomAssignment = isStaff ? getStaffRoomAssignment(resource.id, day) : null

          return (
            <Box
              key={day.toISOString()}
              sx={{
                p: 1,
                borderRight: 1,
                borderColor: 'divider',
                bgcolor: isToday(day)
                  ? (isDark ? 'rgba(144,202,249,0.05)' : 'rgba(25,118,210,0.05)')
                  : isRoom
                    ? (isDark ? 'rgba(76, 175, 80, 0.02)' : 'rgba(76, 175, 80, 0.01)')
                    : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                }
              }}
              onClick={() => onCellClick?.(resource.id, resource.type, day)}
            >
              {/* Room assignment indicator */}
              {roomAssignment && (
                <Box
                  sx={{
                    p: 0.5,
                    mb: 0.5,
                    bgcolor: isDark ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                    border: '1px dashed',
                    borderColor: 'warning.main',
                    borderRadius: 0.5
                  }}
                >
                  <Typography variant='caption' sx={{ fontSize: '0.6rem', fontWeight: 500, color: 'warning.dark', display: 'block' }} noWrap>
                    <i className='ri-door-open-line' style={{ fontSize: 10, marginRight: 2 }} />
                    {roomAssignment.roomName}
                  </Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.55rem', color: 'warning.dark', opacity: 0.8 }}>
                    {roomAssignment.startTime}-{roomAssignment.endTime}
                  </Typography>
                </Box>
              )}

              {/* Events */}
              {dayEvents.map(event => {
                const colors = buildEventColors(colorScheme, event.extendedProps.status)
                return (
                  <Box
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                    sx={{
                      mb: 0.5,
                      p: 0.5,
                      bgcolor: colors.bg,
                      borderLeft: `3px solid ${colors.border}`,
                      borderRadius: 0.5,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': {
                        boxShadow: 1,
                        transform: 'translateX(2px)'
                      }
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        display: 'block',
                        color: colors.text,
                        lineHeight: 1.2
                      }}
                      noWrap
                    >
                      {format(event.start, 'h:mm a')}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.6rem',
                        display: 'block',
                        color: colors.text,
                        opacity: 0.8
                      }}
                      noWrap
                    >
                      {event.extendedProps?.serviceName || event.title}
                    </Typography>
                  </Box>
                )
              })}

              {/* Empty state */}
              {dayEvents.length === 0 && !roomAssignment && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60, opacity: 0.3 }}>
                  <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.6rem' }}>
                    —
                  </Typography>
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0, WebkitOverflowScrolling: 'touch' }}>
        <Box sx={{ minWidth: { xs: `${220 + weekDays.length * 120}px`, md: '100%' }, display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Week header */}
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
            {/* Resource column header */}
            <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider' }}>
              <Typography variant='subtitle2' fontWeight={600} color='text.secondary'>
                Resources
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
                <Typography variant='caption' color='text.secondary' fontWeight={500}>
                  {format(day, 'EEE')}
                </Typography>
                <Typography
                  variant='h6'
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

          {/* Staff section */}
          {staffResources.length > 0 && (
            <Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Typography variant='caption' fontWeight={600} color='text.secondary'>
                  STAFF ({staffResources.length})
                </Typography>
              </Box>
              {staffResources.map((staff, index) => renderResourceRow(staff, index))}
            </Box>
          )}

          {/* Rooms section */}
          {roomResources.length > 0 && (
            <Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: isDark ? 'rgba(76, 175, 80, 0.08)' : 'rgba(76, 175, 80, 0.05)',
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Typography variant='caption' fontWeight={600} color='text.secondary'>
                  ROOMS ({roomResources.length})
                </Typography>
              </Box>
              {roomResources.map((room, index) => renderResourceRow(room, staffResources.length + index))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
