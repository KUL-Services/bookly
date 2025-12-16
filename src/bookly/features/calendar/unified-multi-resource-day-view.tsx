'use client'

import { Box, Typography, Avatar, Chip, Divider } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, addMinutes, isSameDay, isToday } from 'date-fns'
import { useState, useEffect, useMemo, useRef } from 'react'
import { mockStaff, mockServices, mockBookings } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from '../staff-management/staff-store'
import { useCalendarStore } from './state'
import { getBranchName, buildEventColors, groupStaffByType, categorizeRooms, getStaffAvailableCapacity, getCapacityColor, getDynamicRoomAvailability } from './utils'
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
  const { rooms, staffWorkingHours } = useStaffManagementStore()

  // Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Group staff by type and static staff by room
  const staffGrouping = useMemo(() => groupStaffByType(mockStaff), [])

  // Static staff are already grouped by room in staffGrouping
  const staticStaffByRoom = useMemo(() => {
    return staffGrouping.staticByRoom
  }, [staffGrouping])

  // Group rooms by type
  const roomGrouping = useMemo(() => categorizeRooms(rooms), [rooms])

  // Build ordered resource list with two-layer grouping
  // Layer 1: Staff vs Rooms
  // Layer 2: Within Staff (Dynamic vs Static), Within Rooms (Fixed vs Flexible)
  const orderedResources = useMemo(() => {
    const resources: Array<any> = []

    // Layer 1: STAFF
    // Layer 2: Dynamic staff
    staffGrouping.dynamic.forEach(staff => {
      resources.push({
        ...staff,
        type: 'staff' as const,
        staffType: staff.staffType || 'dynamic',
        primaryGroup: 'staff',
        secondaryGroup: 'dynamic-staff'
      })
    })

    // Layer 2: Static staff grouped by room
    Object.entries(staticStaffByRoom).forEach(([roomName, staffList]) => {
      staffList.forEach(staff => {
        resources.push({
          ...staff,
          type: 'staff' as const,
          staffType: 'static',
          primaryGroup: 'staff',
          secondaryGroup: 'static-staff',
          roomName
        })
      })
    })

    // Layer 1: ROOMS
    // Layer 2: Fixed capacity rooms
    roomGrouping.fixed.forEach(room => {
      resources.push({
        ...room,
        type: 'room' as const,
        roomType: room.roomType || 'fixed',
        primaryGroup: 'rooms',
        secondaryGroup: 'fixed-rooms',
        photo: undefined
      })
    })

    // Layer 2: Flexible rooms
    roomGrouping.flexible.forEach(room => {
      resources.push({
        ...room,
        type: 'room' as const,
        roomType: room.roomType || 'flexible',
        primaryGroup: 'rooms',
        secondaryGroup: 'flexible-rooms',
        photo: undefined
      })
    })

    return resources
  }, [staffGrouping, staticStaffByRoom, roomGrouping])

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

  // Build two-layer grouping structure for rendering
  const groupingStructure = useMemo(() => {
    const structure: Record<string, Record<string, any[]>> = {}

    orderedResources.forEach(resource => {
      if (!structure[resource.primaryGroup]) {
        structure[resource.primaryGroup] = {}
      }
      if (!structure[resource.primaryGroup][resource.secondaryGroup]) {
        structure[resource.primaryGroup][resource.secondaryGroup] = []
      }
      structure[resource.primaryGroup][resource.secondaryGroup].push(resource)
    })

    return structure
  }, [orderedResources])

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

  // Helper to get primary grouping label
  const getPrimaryGroupLabel = (group: string) => {
    if (group === 'staff') return 'Staff'
    if (group === 'rooms') return 'Rooms'
    return group
  }

  // Helper to get secondary grouping label
  const getSecondaryGroupLabel = (group: string) => {
    if (group === 'dynamic-staff') return 'Dynamic'
    if (group === 'static-staff') return 'Static'
    if (group === 'fixed-rooms') return 'Fixed Capacity'
    if (group === 'flexible-rooms') return 'Flexible'
    return group
  }

  const totalWidth = 60 + orderedResources.length * 150
  const gridTemplateColumnsXs = `60px repeat(${orderedResources.length}, 150px)`
  const gridTemplateColumnsMd = `60px repeat(${orderedResources.length}, minmax(180px, 1fr))`

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* SCROLLABLE CONTAINER - Headers and content scroll together */}
      <Box ref={scrollContainerRef} sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', bgcolor: 'background.paper' }}>

        {/* HEADER - Sticky at top, scrollable horizontally with content */}
        <Box sx={{ display: 'grid', gridTemplateColumns: gridTemplateColumnsXs, position: 'sticky', top: 0, zIndex: 50, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', flexShrink: 0, minWidth: `${totalWidth}px`, width: '100%', isolation: 'isolate' }}>
          {/* Time column corner - sticky left */}
          <Box sx={{ width: '60px', position: 'sticky', left: 0, zIndex: 70, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', flexShrink: 0, isolation: 'isolate' }} />

          {/* Primary group headers - scrollable */}
          <Box sx={{ display: 'contents' }}>
            {Object.entries(groupingStructure).map(([primaryGroup, secondaryGroups], groupIndex) => {
              const resourcesInPrimaryGroup = Object.values(secondaryGroups).flat()
              const isStaffGroup = primaryGroup === 'staff'
              const isFirstGroup = groupIndex === 0
              return (
                <Box
                  key={`primary-${primaryGroup}`}
                  sx={{
                    gridColumn: `span ${resourcesInPrimaryGroup.length}`,
                    px: 0.5,
                    py: 0,
                    bgcolor: isStaffGroup
                      ? (isDark ? 'rgba(33, 150, 243, 0.12)' : 'rgba(33, 150, 243, 0.08)')
                      : (isDark ? 'rgba(76, 175, 80, 0.12)' : 'rgba(76, 175, 80, 0.08)'),
                    borderRight: isFirstGroup ? 3 : 1,
                    borderColor: isFirstGroup ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') : 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.25,
                    minWidth: 0,
                    overflow: 'hidden',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <i className={isStaffGroup ? 'ri-team-line' : 'ri-tools-line'} style={{ fontSize: 16 }} />
                  <Typography variant='body2' fontWeight={700} color='text.primary'>
                    {getPrimaryGroupLabel(primaryGroup)}
                  </Typography>
                  <Chip
                    label={resourcesInPrimaryGroup.length}
                    size='small'
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      bgcolor: isStaffGroup ? 'primary.main' : 'success.main',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>
              )
            })}
          </Box>
        </Box>

        {/* SECONDARY HEADER ROW - Sticky, scrolls horizontally */}
        <Box sx={{ display: 'grid', gridTemplateColumns: gridTemplateColumnsXs, position: 'sticky', top: 56, zIndex: 50, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', flexShrink: 0, minWidth: `${totalWidth}px`, width: '100%', isolation: 'isolate' }}>
          {/* Time column corner */}
          <Box sx={{ width: '60px', position: 'sticky', left: 0, zIndex: 70, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', flexShrink: 0, isolation: 'isolate' }} />

          {/* Secondary group headers */}
          <Box sx={{ display: 'contents' }}>
            {Object.entries(groupingStructure).map(([primaryGroup, secondaryGroups], primaryIndex) => {
              return Object.entries(secondaryGroups).map(([secondaryGroup, resources], secondaryIndex) => {
                const isStaffGroup = primaryGroup === 'staff'
                const isFirstSecondaryOfRooms = !isStaffGroup && secondaryIndex === 0
                return (
                  <Box
                    key={`secondary-${primaryGroup}-${secondaryGroup}`}
                    sx={{
                      gridColumn: `span ${resources.length}`,
                      px: 0.25,
                      py: 0,
                      bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                      borderRight: isFirstSecondaryOfRooms ? 3 : 1,
                      borderColor: isFirstSecondaryOfRooms ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') : 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.25,
                      minWidth: 0,
                      overflow: 'hidden',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                      {getSecondaryGroupLabel(secondaryGroup)}
                    </Typography>
                    <Chip
                      label={resources.length}
                      size='small'
                      variant='outlined'
                      sx={{
                        height: 14,
                        fontSize: '0.6rem',
                        ml: 0.5,
                        '& .MuiChip-label': { px: 0.5 }
                      }}
                    />
                  </Box>
                )
              })
            })}
          </Box>
        </Box>

        {/* RESOURCE NAMES HEADER ROW - Sticky, scrolls horizontally */}
        <Box sx={{ display: 'grid', gridTemplateColumns: gridTemplateColumnsXs, position: 'sticky', top: 102, zIndex: 50, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', flexShrink: 0, minWidth: `${totalWidth}px`, width: '100%', isolation: 'isolate' }}>
          {/* Time column header - sticky left */}
          <Box sx={{ width: '60px', p: 2, position: 'sticky', left: 0, zIndex: 70, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', flexShrink: 0, isolation: 'isolate' }} />

          {/* Resource headers */}
          <Box sx={{ display: 'contents' }}>
          {orderedResources.map((resource) => {
            const isRoom = resource.type === 'room'

            return (
              <Box
                key={resource.id}
                sx={{
                  px: 0.5,
                  py: 0.25,
                  borderRight: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.125,
                  cursor: 'pointer',
                  bgcolor: isRoom ? (isDark ? 'rgba(76, 175, 80, 0.03)' : 'rgba(76, 175, 80, 0.01)') : 'transparent',
                  '&:hover': {
                    bgcolor: isRoom
                      ? (isDark ? 'rgba(76, 175, 80, 0.08)' : 'rgba(76, 175, 80, 0.05)')
                      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
                  },
                  minWidth: 0,
                  overflow: 'hidden',
                  width: '100%',
                  height: '100%'
                }}
                onClick={() => {
                  if (resource.type === 'staff' && onStaffClick) onStaffClick(resource.id)
                  else if (resource.type === 'room' && onRoomClick) onRoomClick(resource.id)
                }}
              >
                <Avatar sx={{ width: 28, height: 28, bgcolor: resource.type === 'staff' ? 'primary.main' : 'success.main', fontSize: '0.7rem', fontWeight: 600 }}>
                  {resource.type === 'staff'
                    ? resource.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)
                    : <i className='ri-tools-line' style={{ color: '#fff', fontSize: 14 }} />
                  }
                </Avatar>
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Typography variant='body2' fontWeight={600} noWrap fontSize='0.8rem'>
                    {resource.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, justifyContent: 'center', mt: 0.25 }}>
                    {resource.type === 'staff' && resource.staffType === 'dynamic' && (
                      (() => {
                        const availableCapacity = getStaffAvailableCapacity(resource.id, currentDate, mockBookings)
                        const capacityColor = getCapacityColor(availableCapacity)
                        return availableCapacity !== null ? (
                          <Chip
                            label={`${availableCapacity}/${resource.maxConcurrentBookings || 1}`}
                            size='small'
                            variant='outlined'
                            color={capacityColor}
                            sx={{ height: 16, fontSize: '0.55rem' }}
                          />
                        ) : null
                      })()
                    )}
                    {resource.type === 'staff' && resource.staffType === 'static' && resource.maxConcurrentBookings && (
                      <Chip
                        label={`Cap: ${resource.maxConcurrentBookings}`}
                        size='small'
                        variant='outlined'
                        sx={{ height: 16, fontSize: '0.55rem' }}
                      />
                    )}
                    {resource.type === 'room' && resource.capacity && (
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
                              height: 16,
                              fontSize: '0.55rem',
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
            )
          })}
          </Box>
        </Box>

        {/* CONTENT AREA - Inside scrollable container */}
        <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
          {/* Time column - sticky left */}
          <Box sx={{ position: 'sticky', left: 0, zIndex: 60, width: '60px', flexShrink: 0, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', isolation: 'isolate' }}>
            {timeSlots.filter((_, i) => i % 4 === 0).map((slot, index) => (
              <Box
                key={index}
                sx={{
                  height: 160,
                  borderBottom: 1,
                  borderColor: 'divider',
                  pt: 1,
                  pr: 1,
                  textAlign: 'right',
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                  {format(slot, 'h:mm a')}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Calendar grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${orderedResources.length}, 150px)`, width: '100%', minWidth: `${orderedResources.length * 150}px`, position: 'relative' }}>
            {/* Resource columns */}
            {orderedResources.map((resource, index) => {
              const isRoom = resource.type === 'room'
              const bgColor = isRoom
                ? (isDark ? 'rgba(76, 175, 80, 0.01)' : 'rgba(76, 175, 80, 0.005)')
                : 'transparent'

              return (
                <Box key={resource.id} sx={{ position: 'relative' }}>
                  {timeSlots.filter((_, i) => i % 4 === 0).map((_, slotIndex) => (
                    <Box
                      key={slotIndex}
                      sx={{
                        height: 160,
                        borderBottom: 1,
                        borderRight: 1,
                        borderColor: 'divider',
                        bgcolor: bgColor
                      }}
                    />
                  ))}
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    {renderResourceColumn(resource, index)}
                  </Box>
                </Box>
              )
            })}

            {/* Current time indicator - spans all columns */}
            {currentTimeIndicator && (
              <Box
                sx={{
                  position: 'absolute',
                  left: -60,
                  right: 0,
                  top: currentTimeIndicator.top,
                  height: 2,
                  bgcolor: 'error.main',
                  zIndex: 5,
                  pointerEvents: 'none',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 54,
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
