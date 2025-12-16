'use client'

import { Box, Typography, Avatar, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { mockStaff, mockServices, mockBookings } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from '../staff-management/staff-store'
import { useCalendarStore } from './state'
import { getBranchName, buildEventColors, groupStaffByType, groupStaffByTypeAndAssignment, categorizeRooms, getStaffAvailableCapacity, getCapacityColor, getDynamicRoomAvailability } from './utils'
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
  const { rooms } = useStaffManagementStore()

  // Get week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Group staff by type AND assignment status (4 categories)
  const staffGrouping = useMemo(() => groupStaffByTypeAndAssignment(mockStaff), [])

  // Count total assigned static staff for index calculations
  const totalAssignedStaticStaff = useMemo(() => {
    return Object.values(staffGrouping.staticAssignedByRoom).flat().length
  }, [staffGrouping])

  // Group rooms by type
  const roomGrouping = useMemo(() => categorizeRooms(rooms), [rooms])

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
          <Avatar sx={{ width: 40, height: 40, bgcolor: isStaff ? 'primary.main' : 'success.main', fontSize: '0.9rem', fontWeight: 600 }}>
            {isStaff
              ? resource.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)
              : <i className='ri-tools-line' style={{ color: '#fff', fontSize: 18 }} />
            }
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='body2' fontWeight={600} noWrap>
              {resource.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {isStaff && resource.staffType && (
                <Chip
                  label={resource.staffType}
                  size='small'
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
              {isStaff && resource.staffType === 'dynamic' && (
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
                })()
              )}
              {isStaff && resource.staffType === 'static' && resource.maxConcurrentBookings && (
                <Chip
                  label={`Cap: ${resource.maxConcurrentBookings}`}
                  size='small'
                  variant='outlined'
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
              {isRoom && resource.capacity && (
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
                          ? isDynamicRoom ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)'
                          : isDynamicRoom ? 'rgba(76, 175, 80, 0.08)' : 'rgba(76, 175, 80, 0.05)',
                        fontWeight: isDynamicRoom ? 600 : 500
                      }}
                    />
                  )
                })()
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

          {/* Dynamic Unassigned Staff Section */}
          {staffGrouping.dynamicUnassigned.length > 0 && (
            <Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: isDark ? 'rgba(33, 150, 243, 0.08)' : 'rgba(33, 150, 243, 0.05)',
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Typography variant='caption' fontWeight={700} color='info.dark'>
                  DYNAMIC UNASSIGNED ({staffGrouping.dynamicUnassigned.length})
                </Typography>
              </Box>
              {staffGrouping.dynamicUnassigned.map((staff, index) => {
                const staffResource = { ...staff, type: 'staff' as const, assignmentStatus: 'unassigned' }
                return renderResourceRow(staffResource, index)
              })}
            </Box>
          )}

          {/* Dynamic Assigned Staff Section */}
          {staffGrouping.dynamicAssigned.length > 0 && (
            <Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: isDark ? 'rgba(76, 175, 80, 0.12)' : 'rgba(76, 175, 80, 0.1)',
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <i className='ri-home-office-line' style={{ fontSize: 14, color: isDark ? '#81c784' : '#4caf50' }} />
                <Typography variant='caption' fontWeight={700} color='success.dark'>
                  DYNAMIC ASSIGNED TO ROOMS ({staffGrouping.dynamicAssigned.length})
                </Typography>
              </Box>
              {staffGrouping.dynamicAssigned.map((staff, index) => {
                const staffResource = { ...staff, type: 'staff' as const, assignmentStatus: 'assigned' }
                return renderResourceRow(staffResource, staffGrouping.dynamicUnassigned.length + index)
              })}
            </Box>
          )}

          {/* Static Unassigned Staff Section */}
          {staffGrouping.staticUnassigned.length > 0 && (
            <Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: isDark ? 'rgba(156, 39, 176, 0.08)' : 'rgba(156, 39, 176, 0.05)',
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Typography variant='caption' fontWeight={700} color='text.secondary'>
                  STATIC UNASSIGNED ({staffGrouping.staticUnassigned.length})
                </Typography>
              </Box>
              {staffGrouping.staticUnassigned.map((staff, index) => {
                const staffResource = { ...staff, type: 'staff' as const, staffType: 'static', assignmentStatus: 'unassigned' }
                return renderResourceRow(staffResource, staffGrouping.dynamicUnassigned.length + staffGrouping.dynamicAssigned.length + index)
              })}
            </Box>
          )}

          {/* Static Assigned Staff Grouped by Room Section */}
          {staffGrouping.staticAssigned.length > 0 && (
            <Box>
              {/* Outer section header for static assigned staff */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: isDark ? 'rgba(255, 152, 0, 0.12)' : 'rgba(255, 152, 0, 0.1)',
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <i className='ri-home-office-line' style={{ fontSize: 14, color: isDark ? '#ffb74d' : '#ff9800' }} />
                <Typography variant='body2' fontWeight={700} color='warning.dark'>
                  STATIC ASSIGNED TO ROOMS
                </Typography>
                <Chip
                  label={staffGrouping.staticAssigned.length}
                  size='small'
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    bgcolor: 'warning.main',
                    color: 'white',
                    fontWeight: 600,
                    ml: 'auto'
                  }}
                />
              </Box>

              {/* Inner groupings by room */}
              {Object.entries(staffGrouping.staticAssignedByRoom).map(([roomName, staffList], roomIndex) => {
                let staffIndexOffset = staffGrouping.dynamicUnassigned.length + staffGrouping.dynamicAssigned.length + staffGrouping.staticUnassigned.length
                return (
                  <Box key={`static-assigned-room-${roomIndex}`}>
                    {/* Room-specific sub-header */}
                    <Box
                      sx={{
                        px: 3,
                        py: 0.75,
                        bgcolor: isDark ? 'rgba(255, 152, 0, 0.08)' : 'rgba(255, 152, 0, 0.05)',
                        borderBottom: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                        {roomName} ({staffList.length})
                      </Typography>
                    </Box>

                    {/* Staff in this room */}
                    {staffList.map((staff, index) => {
                      const staffResource = { ...staff, type: 'staff' as const, staffType: 'static', assignmentStatus: 'assigned', roomName }
                      return renderResourceRow(staffResource, staffIndexOffset + index)
                    })}
                  </Box>
                )
              })}
            </Box>
          )}

          {/* Divider between STAFF and ROOMS sections */}
          <Box
            sx={{
              height: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)',
              borderBottom: 1,
              borderColor: 'divider'
            }}
          />

          {/* Fixed Capacity Rooms Section */}
          {roomGrouping.fixed.length > 0 && (
            <Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: isDark ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.08)',
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Typography variant='caption' fontWeight={700} color='success.dark'>
                  FIXED CAPACITY ROOMS ({roomGrouping.fixed.length})
                </Typography>
              </Box>
              {roomGrouping.fixed.map((room, index) => {
                const roomResource = { ...room, type: 'room' as const, photo: undefined }
                const staffIndexOffset = staffGrouping.dynamicUnassigned.length + staffGrouping.dynamicAssigned.length + staffGrouping.staticUnassigned.length + totalAssignedStaticStaff
                return renderResourceRow(roomResource, staffIndexOffset + index)
              })}
            </Box>
          )}

          {/* Flexible Rooms Section */}
          {roomGrouping.flexible.length > 0 && (
            <Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: isDark ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.03)',
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Typography variant='caption' fontWeight={700} color='text.secondary'>
                  FLEXIBLE ROOMS ({roomGrouping.flexible.length})
                </Typography>
              </Box>
              {roomGrouping.flexible.map((room, index) => {
                const roomResource = { ...room, type: 'room' as const, photo: undefined }
                const staffIndexOffset = staffGrouping.dynamicUnassigned.length + staffGrouping.dynamicAssigned.length + staffGrouping.staticUnassigned.length + totalAssignedStaticStaff
                return renderResourceRow(roomResource, staffIndexOffset + roomGrouping.fixed.length + index)
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
