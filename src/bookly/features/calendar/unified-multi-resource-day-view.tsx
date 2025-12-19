'use client'

import { Box, Typography, Avatar, Chip, Divider } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, addMinutes, isSameDay, isToday } from 'date-fns'
import { useState, useEffect, useMemo, useRef } from 'react'
import { mockStaff, mockServices, mockBookings } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from '../staff-management/staff-store'
import { useCalendarStore } from './state'
import {
  getBranchName,
  buildEventColors,
  groupStaffByType,
  categorizeRooms,
  getStaffAvailableCapacity,
  getCapacityColor,
  getDynamicRoomAvailability
} from './utils'
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
  const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)
  const { rooms, staffWorkingHours } = useStaffManagementStore()

  // Refs for scroll synchronization
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const timeGridScrollRef = useRef<HTMLDivElement>(null)

  // Synchronize horizontal scroll between header and time grid
  useEffect(() => {
    const handleHeaderScroll = () => {
      if (headerScrollRef.current && timeGridScrollRef.current) {
        timeGridScrollRef.current.scrollLeft = headerScrollRef.current.scrollLeft
      }
    }

    const handleTimeGridScroll = () => {
      if (timeGridScrollRef.current && headerScrollRef.current) {
        headerScrollRef.current.scrollLeft = timeGridScrollRef.current.scrollLeft
      }
    }

    const headerElement = headerScrollRef.current
    const timeGridElement = timeGridScrollRef.current

    if (headerElement) {
      headerElement.addEventListener('scroll', handleHeaderScroll)
    }
    if (timeGridElement) {
      timeGridElement.addEventListener('scroll', handleTimeGridScroll)
    }

    return () => {
      if (headerElement) {
        headerElement.removeEventListener('scroll', handleHeaderScroll)
      }
      if (timeGridElement) {
        timeGridElement.removeEventListener('scroll', handleTimeGridScroll)
      }
    }
  }, [])

  // Build ordered resource list with two-layer grouping
  // Layer 1: Branches
  // Layer 2: Staff vs Rooms
  const orderedResources = useMemo(() => {
    const resources: Array<any> = []

    // Get unique branches from staff and rooms
    const branches = new Set<string>()
    mockStaff.forEach(staff => branches.add(staff.branchId || '1-1'))
    rooms.forEach(room => branches.add(room.branchId || '1-1'))

    // Sort branches for consistent ordering
    const sortedBranches = Array.from(branches).sort()

    sortedBranches.forEach(branchId => {
      // Layer 2: STAFF (within branch) - all staff
      mockStaff.forEach(staff => {
        if ((staff.branchId || '1-1') === branchId) {
          resources.push({
            ...staff,
            type: 'staff' as const,
            primaryGroup: branchId,
            secondaryGroup: 'staff'
          })
        }
      })

      // Layer 2: ROOMS (within branch) - all rooms
      rooms.forEach(room => {
        if ((room.branchId || '1-1') === branchId) {
          resources.push({
            ...room,
            type: 'room' as const,
            primaryGroup: branchId,
            secondaryGroup: 'rooms',
            photo: undefined
          })
        }
      })
    })

    return resources
  }, [rooms])

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

          // Determine if this is a static/fixed resource vs dynamic/flexible
          const isStaticType = isStaff ? resource.staffType === 'static' : resource.roomType === 'static'
          const isDynamicType = isStaff
            ? resource.staffType === 'dynamic'
            : resource.roomType === 'flexible' || resource.roomType === 'dynamic'

          return (
            <Box
              key={event.id}
              onClick={e => {
                e.stopPropagation()
                onEventClick?.(event)
              }}
              sx={{
                position: 'absolute',
                left: 4,
                right: 4,
                top: style.top,
                height: Math.max(style.height, 60),
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
                p: 0.75,
                overflow: 'visible',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: 1,
                boxShadow: isStaticType ? 'none' : '0px 2px 8px rgba(0,0,0,0.06)',
                '&:hover': {
                  boxShadow: isStaticType ? 'none' : '0px 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
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

              {/* Capacity Display for Static/Fixed Resources ONLY */}
              {(() => {
                // Show capacity chip on ALL events on static/fixed resources (diagonal stripes)
                // This includes both slot-based bookings and regular appointments
                const isStaticStaff = isStaff && resource.staffType === 'static'
                const isStaticRoom = !isStaff && resource.roomType === 'static'
                const shouldShowChip = isStaticStaff || isStaticRoom

                if (!shouldShowChip) {
                  return null // Don't show chip on dynamic resources
                }

                // Extract slotId for capacity calculation (if it exists)
                const slotId = event.extendedProps?.slotId
                // This prevents showing "2/1" multiple times when there are multiple bookings
                if (slotId) {
                  // If has slotId, only show on first event of that slot
                  const slotEventsInResource = resourceEvents.filter(e => e.extendedProps?.slotId === slotId)
                  const isFirstEventInSlot = slotEventsInResource[0]?.id === event.id
                  if (!isFirstEventInSlot) {
                    return null
                  }
                } else {
                  // If no slotId, only show on first event for this resource
                  const isFirstEventOfResource = resourceEvents[0]?.id === event.id
                  if (!isFirstEventOfResource) {
                    return null
                  }
                }

                console.log('🔍 DAY VIEW Capacity Check:', {
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
                  const allResourceEvents = events.filter(e => {
                    if (isStaticStaff) {
                      return (
                        e.extendedProps.staffId === resource.id &&
                        isSameDay(new Date(e.start), eventDate) &&
                        e.extendedProps.status !== 'cancelled'
                      )
                    } else {
                      return (
                        e.extendedProps.roomId === resource.id &&
                        isSameDay(new Date(e.start), eventDate) &&
                        e.extendedProps.status !== 'cancelled'
                      )
                    }
                  })
                  // Sum party sizes (default to 1 if not specified) - matches isSlotAvailable logic
                  bookedCount = allResourceEvents.reduce((sum, e) => sum + (e.extendedProps.partySize || 1), 0)
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
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      icon={<i className='ri-user-line' style={{ fontSize: '0.7rem' }} />}
                      label={`${bookedCount}/${totalCapacity}`}
                      color={chipColor}
                      size='small'
                      sx={{
                        height: '16px',
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          fontSize: '0.7rem',
                          marginLeft: '2px'
                        },
                        '& .MuiChip-label': {
                          padding: '0 4px'
                        }
                      }}
                    />
                  </Box>
                )
              })()}
            </Box>
          )
        })}
      </Box>
    )
  }

  // Helper to get primary grouping label (branches)
  const getPrimaryGroupLabel = (group: string) => {
    return getBranchName(group)
  }

  // Helper to get secondary grouping label (staff vs rooms)
  const getSecondaryGroupLabel = (group: string) => {
    if (group === 'staff') return 'Staff'
    if (group === 'rooms') return 'Rooms'
    return group
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
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        <Box
          sx={{
            minWidth: { xs: `${60 + orderedResources.length * 150}px`, md: '100%' },
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}
        >
          {/* Header with three-layer grouping */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              display: 'flex',
              overflow: 'hidden'
            }}
          >
            {/* Empty time column space for header alignment */}
            <Box sx={{ width: 60, flexShrink: 0, borderRight: 1, borderColor: 'divider' }} />

            {/* Header scroll container - synced with time grid scroll */}
            <Box
              ref={headerScrollRef}
              sx={{
                flex: 1,
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none'
                }
              }}
              className='header-scroll-container'
            >
              {/* Layer 1: Primary grouping (Branches) */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: `repeat(${orderedResources.length}, 150px)`,
                    md: `repeat(${orderedResources.length}, minmax(180px, 1fr))`
                  },
                  borderBottom: 1,
                  borderColor: 'divider',
                  minWidth: 'min-content',
                  '& > *': {
                    minWidth: 0,
                    overflow: 'hidden'
                  }
                }}
              >
                {/* Primary group headers (Branches) */}
                {Object.entries(groupingStructure).map(([primaryGroup, secondaryGroups], groupIndex) => {
                  const resourcesInPrimaryGroup = Object.values(secondaryGroups).flat().flat()
                  const isFirstGroup = groupIndex === 0
                  return (
                    <Box
                      key={`primary-${primaryGroup}`}
                      sx={{
                        gridColumn: `span ${resourcesInPrimaryGroup.length}`,
                        p: 1.5,
                        bgcolor: isDark ? 'rgba(33, 150, 243, 0.12)' : 'rgba(33, 150, 243, 0.08)',
                        borderRight: isFirstGroup ? 3 : 1,
                        borderColor: isFirstGroup ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') : 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      <i className='ri-building-line' style={{ fontSize: 16 }} />
                      <Typography variant='body2' fontWeight={700} color='text.primary'>
                        {getPrimaryGroupLabel(primaryGroup)}
                      </Typography>
                      <Chip
                        label={resourcesInPrimaryGroup.length}
                        size='small'
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  )
                })}
              </Box>

              {/* Layer 2: Secondary grouping (Staff vs Rooms) */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: `repeat(${orderedResources.length}, 150px)`,
                    md: `repeat(${orderedResources.length}, minmax(180px, 1fr))`
                  },
                  borderBottom: 1,
                  borderColor: 'divider',
                  minWidth: 'min-content',
                  '& > *': {
                    minWidth: 0,
                    overflow: 'hidden'
                  }
                }}
              >
                {/* Secondary group headers */}
                {Object.entries(groupingStructure).map(([primaryGroup, secondaryGroups], primaryIndex) => {
                  return Object.entries(secondaryGroups).map(([secondaryGroup, resources], secondaryIndex) => {
                    const isStaffGroup = secondaryGroup === 'staff'
                    const isFirstSecondaryOfRooms = !isStaffGroup && secondaryIndex === 0
                    return (
                      <Box
                        key={`secondary-${primaryGroup}-${secondaryGroup}`}
                        sx={{
                          gridColumn: `span ${resources.length}`,
                          p: 1,
                          bgcolor: isStaffGroup
                            ? isDark
                              ? 'rgba(33, 150, 243, 0.08)'
                              : 'rgba(33, 150, 243, 0.05)'
                            : isDark
                              ? 'rgba(76, 175, 80, 0.08)'
                              : 'rgba(76, 175, 80, 0.05)',
                          borderRight: isFirstSecondaryOfRooms ? 3 : 1,
                          borderColor: isFirstSecondaryOfRooms
                            ? isDark
                              ? 'rgba(255,255,255,0.2)'
                              : 'rgba(0,0,0,0.1)'
                            : 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5
                        }}
                      >
                        <i
                          className={isStaffGroup ? 'ri-team-line' : 'ri-tools-line'}
                          style={{ fontSize: 12, opacity: 0.7 }}
                        />
                        <Typography
                          variant='caption'
                          fontWeight={600}
                          color='text.secondary'
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {getSecondaryGroupLabel(secondaryGroup)}
                        </Typography>
                        <Chip
                          label={resources.length}
                          size='small'
                          variant='outlined'
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            ml: 'auto'
                          }}
                        />
                      </Box>
                    )
                  })
                })}
              </Box>

              {/* Resource headers row */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: `repeat(${orderedResources.length}, 150px)`,
                    md: `repeat(${orderedResources.length}, minmax(180px, 1fr))`
                  },
                  minWidth: 'min-content',
                  '& > *': {
                    minWidth: 0,
                    overflow: 'hidden'
                  }
                }}
              >
                {/* Resource headers */}
                {orderedResources.map(resource => {
                  const isRoom = resource.type === 'room'

                  return (
                    <Box
                      key={resource.id}
                      sx={{
                        p: 1.5,
                        borderRight: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.75,
                        cursor: 'pointer',
                        bgcolor: isRoom
                          ? isDark
                            ? 'rgba(76, 175, 80, 0.03)'
                            : 'rgba(76, 175, 80, 0.01)'
                          : 'transparent',
                        '&:hover': {
                          bgcolor: isRoom
                            ? isDark
                              ? 'rgba(76, 175, 80, 0.08)'
                              : 'rgba(76, 175, 80, 0.05)'
                            : isDark
                              ? 'rgba(255,255,255,0.05)'
                              : 'rgba(0,0,0,0.03)'
                        }
                      }}
                      onClick={() => {
                        if (resource.type === 'staff' && onStaffClick) onStaffClick(resource.id)
                        else if (resource.type === 'room' && onRoomClick) onRoomClick(resource.id)
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: resource.type === 'staff' ? 'primary.main' : 'success.main',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}
                      >
                        {resource.type === 'staff' ? (
                          resource.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .substring(0, 2)
                        ) : (
                          <i className='ri-tools-line' style={{ color: '#fff', fontSize: 14 }} />
                        )}
                      </Avatar>
                      <Box sx={{ textAlign: 'center', width: '100%' }}>
                        <Typography variant='body2' fontWeight={600} noWrap fontSize='0.8rem'>
                          {resource.name}
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.25, justifyContent: 'center', mt: 0.25 }}
                        >
                          {resource.type === 'staff' &&
                            resource.staffType === 'dynamic' &&
                            (() => {
                              const availableCapacity = getStaffAvailableCapacity(
                                resource.id,
                                currentDate,
                                mockBookings
                              )
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
                            })()}
                          {resource.type === 'staff' &&
                            resource.staffType === 'static' &&
                            resource.maxConcurrentBookings && (
                              <Chip
                                label={`Cap: ${resource.maxConcurrentBookings}`}
                                size='small'
                                variant='outlined'
                                sx={{ height: 16, fontSize: '0.55rem' }}
                              />
                            )}
                          {resource.type === 'room' &&
                            resource.capacity &&
                            (() => {
                              const isDynamicRoom = resource.roomType === 'dynamic' || resource.roomType === 'flexible'
                              const dynamicInfo = isDynamicRoom
                                ? getDynamicRoomAvailability(resource.id, [resource])
                                : null
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
                  )
                })}
              </Box>
            </Box>
          </Box>

          {/* Time grid - Flex layout with sticky time column */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Time labels column - truly sticky */}
            <Box
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 11,
                borderRight: 1,
                borderColor: 'divider',
                bgcolor: 'background.default',
                flexShrink: 0,
                width: 60
              }}
            >
              {timeSlots
                .filter((_, i) => i % 4 === 0)
                .map((slot, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 160,
                      borderBottom: 1,
                      borderColor: 'divider',
                      pt: 1,
                      pr: 1,
                      textAlign: 'right',
                      bgcolor: 'background.default'
                    }}
                  >
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                      {format(slot, 'h:mm a')}
                    </Typography>
                  </Box>
                ))}
            </Box>

            {/* Horizontally scrollable resources area */}
            <Box
              ref={timeGridScrollRef}
              sx={{
                flex: 1,
                overflowX: 'auto',
                overflowY: 'hidden',
                position: 'relative',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none'
                }
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: `repeat(${orderedResources.length}, 150px)`,
                    md: `repeat(${orderedResources.length}, minmax(180px, 1fr))`
                  },
                  minWidth: 'min-content'
                }}
              >
                {/* Resource columns */}
                {orderedResources.map((resource, index) => {
                  const isRoom = resource.type === 'room'
                  const bgColor = isRoom
                    ? isDark
                      ? 'rgba(76, 175, 80, 0.01)'
                      : 'rgba(76, 175, 80, 0.005)'
                    : 'transparent'

                  return (
                    <Box key={resource.id} sx={{ position: 'relative' }}>
                      {timeSlots
                        .filter((_, i) => i % 4 === 0)
                        .map((_, slotIndex) => (
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
              </Box>

              {/* Current time indicator */}
              {currentTimeIndicator && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
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
    </Box>
  )
}
