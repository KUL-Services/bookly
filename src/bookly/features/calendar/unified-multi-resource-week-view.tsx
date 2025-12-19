'use client'

import { Box, Typography, Avatar, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { mockStaff, mockServices, mockBookings } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from '../staff-management/staff-store'
import { useCalendarStore } from './state'
import {
  getBranchName,
  buildEventColors,
  groupStaffByType,
  groupStaffByTypeAndAssignment,
  categorizeRooms,
  getStaffAvailableCapacity,
  getCapacityColor,
  getDynamicRoomAvailability
} from './utils'
import type { CalendarEvent, DayOfWeek } from './types'
import { useMemo } from 'react'

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
  const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)
  const { rooms } = useStaffManagementStore()

  // Get week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Group all resources (staff and rooms) by branch
  const resourcesByBranch = useMemo(() => {
    const grouped: Record<string, any[]> = {}

    // Add all staff
    mockStaff.forEach(staff => {
      const branchId = staff.branchId || '1-1'
      if (!grouped[branchId]) {
        grouped[branchId] = []
      }
      grouped[branchId].push({ ...staff, type: 'staff' as const })
    })

    // Add all rooms
    rooms.forEach(room => {
      const branchId = room.branchId || '1-1'
      if (!grouped[branchId]) {
        grouped[branchId] = []
      }
      grouped[branchId].push({ ...room, type: 'room' as const })
    })

    return grouped
  }, [rooms])

  // Get events for a specific resource and day
  const getResourceDayEvents = (resourceId: string, resourceType: 'staff' | 'room', day: Date) => {
    if (resourceType === 'staff') {
      return events.filter(event => event.extendedProps.staffId === resourceId && isSameDay(new Date(event.start), day))
    } else {
      return events.filter(event => event.extendedProps.roomId === resourceId && isSameDay(new Date(event.start), day))
    }
  }

  // Get room assignment for BOTH dynamic and static assigned staff on a specific day
  const getStaffRoomAssignment = (staffId: string, day: Date) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (!staff || !staff.roomAssignments || staff.roomAssignments.length === 0) {
      return null
    }

    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = dayNames[day.getDay()]

    // Return room assignment for BOTH dynamic and static staff
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
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: isStaff ? 'primary.main' : 'success.main',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            {isStaff ? (
              resource.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .substring(0, 2)
            ) : (
              <i className='ri-tools-line' style={{ color: '#fff', fontSize: 18 }} />
            )}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='body2' fontWeight={600} noWrap>
              {resource.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {isStaff && resource.staffType && (
                <Chip label={resource.staffType} size='small' sx={{ height: 18, fontSize: '0.6rem' }} />
              )}
              {isStaff &&
                resource.staffType === 'dynamic' &&
                (() => {
                  const availableCapacity = getStaffAvailableCapacity(resource.id, currentDate, mockBookings)
                  const capacityColor = getCapacityColor(availableCapacity)
                  return availableCapacity !== null ? (
                    <Chip
                      label={`${availableCapacity}/${resource.maxConcurrentBookings || 1}`}
                      size='small'
                      variant='outlined'
                      color={capacityColor}
                      sx={{ height: 18, fontSize: '0.6rem' }}
                    />
                  ) : null
                })()}
              {isStaff && resource.staffType === 'static' && resource.maxConcurrentBookings && (
                <Chip
                  label={`Cap: ${resource.maxConcurrentBookings}`}
                  size='small'
                  variant='outlined'
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
              {isRoom &&
                resource.capacity &&
                (() => {
                  const isDynamicRoom = resource.roomType === 'dynamic' || resource.roomType === 'flexible'
                  const dynamicInfo = isDynamicRoom ? getDynamicRoomAvailability(resource.id, [resource]) : null
                  return (
                    <Chip
                      label={`${dynamicInfo?.totalCapacity || resource.capacity}`}
                      size='small'
                      variant='outlined'
                      color={isDynamicRoom ? 'success' : 'default'}
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        bgcolor: isDark
                          ? isDynamicRoom
                            ? 'rgba(76, 175, 80, 0.15)'
                            : 'rgba(76, 175, 80, 0.1)'
                          : isDynamicRoom
                            ? 'rgba(76, 175, 80, 0.08)'
                            : 'rgba(76, 175, 80, 0.05)',
                        fontWeight: isDynamicRoom ? 600 : 500
                      }}
                    />
                  )
                })()}
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
                  ? isDark
                    ? 'rgba(144,202,249,0.05)'
                    : 'rgba(25,118,210,0.05)'
                  : isRoom
                    ? isDark
                      ? 'rgba(76, 175, 80, 0.02)'
                      : 'rgba(76, 175, 80, 0.01)'
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
                  <Typography
                    variant='caption'
                    sx={{ fontSize: '0.6rem', fontWeight: 500, color: 'warning.dark', display: 'block' }}
                    noWrap
                  >
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
                const isStaticType = isStaff ? resource.staffType === 'static' : resource.roomType === 'static'
                return (
                  <Box
                    key={event.id}
                    onClick={e => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                    sx={{
                      mb: 0.5,
                      p: 0.6,
                      minHeight: 50,
                      bgcolor: colors.bg,
                      borderRadius: 0,
                      border: isStaticType ? `2px solid ${colors.border}` : `1px solid ${colors.border}40`,
                      borderLeft: isStaticType ? `4px solid ${colors.border}` : `1px solid ${colors.border}40`,
                      backgroundImage: isStaticType
                        ? `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 5px,
                            ${colors.border}40 5px,
                            ${colors.border}40 10px
                          )`
                        : 'none',
                      opacity: 1,
                      overflow: 'visible',
                      boxShadow: isStaticType ? 'none' : '0px 2px 8px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: isStaticType ? 'none' : '0px 4px 12px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {(() => {
                        const service = mockServices.find(s => s.name === event.extendedProps?.serviceName)
                        return service?.color ? (
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
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
                          fontSize: '0.6rem',
                          color: colors.text,
                          opacity: 0.8
                        }}
                        noWrap
                      >
                        {event.extendedProps?.serviceName || event.title}
                      </Typography>
                    </Box>

                    {/* Capacity Display for Static/Fixed Resources ONLY */}
                    {(() => {
                      // Show capacity chip ONLY for:
                      // 1. ALL events on static staff (staffType === 'static') - diagonal stripes
                      // 2. ALL events in static/fixed rooms (roomType === 'static') - diagonal stripes
                      // The event's slotId doesn't matter - only the RESOURCE type matters
                      const isStaticStaff = isStaff && resource.staffType === 'static'
                      const isStaticRoom = !isStaff && resource.roomType === 'static'
                      const shouldShowChip = isStaticStaff || isStaticRoom

                      // Extract slotId for capacity calculation (if it exists)
                      const slotId = event.extendedProps?.slotId

                      console.log('🔍 WEEK VIEW Capacity Check:', {
                        eventId: event.id,
                        eventStart: event.start,
                        resourceId: resource.id,
                        resourceName: resource.name,
                        isStaff,
                        staffType: resource.staffType,
                        roomType: resource.roomType,
                        isStaticStaff,
                        isStaticRoom,
                        shouldShowChip,
                        slotId
                      })

                      if (!shouldShowChip) {
                        console.log('❌ Resource is not static/fixed - capacity chip will not display')
                        return null
                      }

                      // Get capacity info for this slot (only if slotId exists)
                      const eventDate = new Date(event.start)
                      const capacityInfo = slotId ? isSlotAvailable(slotId, eventDate) : null

                      console.log('📊 Capacity Info:', { slotId, eventDate, capacityInfo })

                      // For static resources, ALWAYS show chip (even without detailed slot data)
                      let bookedCount: number
                      let totalCapacity: number
                      let chipColor: 'success' | 'warning' | 'error'

                      if (capacityInfo) {
                        // Use real capacity data from slot
                        bookedCount = capacityInfo.total - capacityInfo.remainingCapacity
                        totalCapacity = capacityInfo.total
                        const percentRemaining = (capacityInfo.remainingCapacity / totalCapacity) * 100
                        chipColor = percentRemaining > 50 ? 'success' : percentRemaining > 20 ? 'warning' : 'error'
                      } else {
                        // No slot data - count bookings manually for this resource
                        const resourceEvents = events.filter(e => {
                          if (isStaticStaff) {
                            return e.extendedProps.staffId === resource.id && 
                                   isSameDay(new Date(e.start), eventDate) &&
                                   e.extendedProps.status !== 'cancelled'
                          } else {
                            return e.extendedProps.roomId === resource.id && 
                                   isSameDay(new Date(e.start), eventDate) &&
                                   e.extendedProps.status !== 'cancelled'
                          }
                        })
                        bookedCount = resourceEvents.length
                        totalCapacity = resource.maxConcurrentBookings || resource.capacity || 10
                        const percentRemaining = ((totalCapacity - bookedCount) / totalCapacity) * 100
                        chipColor = percentRemaining > 50 ? 'success' : percentRemaining > 20 ? 'warning' : 'error'
                      }

                      console.log('✅ RENDERING CHIP:', {
                        bookedCount,
                        totalCapacity,
                        hasSlotData: !!capacityInfo,
                        chipColor
                      })

                      return (
                        <Box sx={{ mt: 0.25 }}>
                          <Chip
                            icon={<i className='ri-user-line' style={{ fontSize: '0.6rem' }} />}
                            label={`${bookedCount}/${totalCapacity}`}
                            color={chipColor}
                            size='small'
                            sx={{
                              height: '14px',
                              fontSize: '0.55rem',
                              fontWeight: 600,
                              '& .MuiChip-icon': {
                                fontSize: '0.6rem',
                                marginLeft: '2px'
                              },
                              '& .MuiChip-label': {
                                padding: '0 3px'
                              }
                            }}
                          />
                        </Box>
                      )
                    })()}
                  </Box>
                )
              })}

              {/* Empty state */}
              {dayEvents.length === 0 && !roomAssignment && (
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60, opacity: 0.3 }}
                >
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
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <Box
          sx={{
            minWidth: { xs: `${220 + weekDays.length * 120}px`, md: '100%' },
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}
        >
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

          {/* Branch Sections */}
          {Object.entries(resourcesByBranch).map(([branchId, resources], branchIndex) => {
            const branchName = getBranchName(branchId)
            return (
              <Box key={`branch-${branchId}`}>
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: isDark ? 'rgba(33, 150, 243, 0.12)' : 'rgba(33, 150, 243, 0.1)',
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <i className='ri-building-line' style={{ fontSize: 14, color: isDark ? '#64b5f6' : '#1976d2' }} />
                  <Typography variant='body2' fontWeight={700} color='primary.dark'>
                    {branchName}
                  </Typography>
                  <Chip
                    label={resources.length}
                    size='small'
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                      ml: 'auto'
                    }}
                  />
                </Box>

                {/* Resources in this branch */}
                {resources.map((resource, resourceIndex) => {
                  return renderResourceRow(resource, branchIndex * 1000 + resourceIndex)
                })}
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
