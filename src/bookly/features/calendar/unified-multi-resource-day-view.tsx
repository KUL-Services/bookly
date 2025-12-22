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

// Helper to adjust color opacity for faded events
const adjustColorOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  // Handle rgb colors
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  }
  // Handle rgba colors - replace existing opacity
  if (color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`)
  }
  return color
}

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
  const allEvents = useCalendarStore(state => state.events)
  const isSearchActive = useCalendarStore(state => state.isSearchActive)
  const isEventMatchedBySearch = useCalendarStore(state => state.isEventMatchedBySearch)
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

  // Helper to check if a time is within working hours for a staff member
  const getStaffNonWorkingBlocks = (staffId: string) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (!staff) return []

    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = dayNames[currentDate.getDay()]
    const workingHours = staffWorkingHours[staffId]?.[dayOfWeek]

    const nonWorkingBlocks: Array<{ top: number; height: number }> = []
    const slotHeight = 40
    const startHour = 6
    const endHour = 22

    if (!workingHours || !workingHours.isWorking || !workingHours.shifts || workingHours.shifts.length === 0) {
      // Entire day is non-working
      const totalMinutes = (endHour - startHour) * 60
      nonWorkingBlocks.push({
        top: 0,
        height: (totalMinutes / 15) * slotHeight
      })
      return nonWorkingBlocks
    }

    // Check for gaps before first shift, between shifts, and after last shift
    const shifts = [...workingHours.shifts].sort((a, b) => {
      const aStart = parseInt(a.start.replace(':', ''))
      const bStart = parseInt(b.start.replace(':', ''))
      return aStart - bStart
    })

    let currentMins = startHour * 60

    shifts.forEach((shift, index) => {
      const [shiftStartH, shiftStartM] = shift.start.split(':').map(Number)
      const [shiftEndH, shiftEndM] = shift.end.split(':').map(Number)
      const shiftStartMins = shiftStartH * 60 + shiftStartM
      const shiftEndMins = shiftEndH * 60 + shiftEndM

      // Add block before this shift
      if (currentMins < shiftStartMins) {
        const duration = shiftStartMins - currentMins
        const top = ((currentMins - startHour * 60) / 15) * slotHeight
        nonWorkingBlocks.push({
          top,
          height: (duration / 15) * slotHeight
        })
      }

      // Add break times within shift
      if (shift.breaks && shift.breaks.length > 0) {
        shift.breaks.forEach(breakTime => {
          const [breakStartH, breakStartM] = breakTime.start.split(':').map(Number)
          const [breakEndH, breakEndM] = breakTime.end.split(':').map(Number)
          const breakStartMins = breakStartH * 60 + breakStartM
          const breakEndMins = breakEndH * 60 + breakEndM

          const top = ((breakStartMins - startHour * 60) / 15) * slotHeight
          const duration = breakEndMins - breakStartMins
          nonWorkingBlocks.push({
            top,
            height: (duration / 15) * slotHeight
          })
        })
      }

      currentMins = Math.max(currentMins, shiftEndMins)
    })

    // Add block after last shift
    const endMins = endHour * 60
    if (currentMins < endMins) {
      const duration = endMins - currentMins
      const top = ((currentMins - startHour * 60) / 15) * slotHeight
      nonWorkingBlocks.push({
        top,
        height: (duration / 15) * slotHeight
      })
    }

    return nonWorkingBlocks
  }

  // Helper to get time-off blocks for a staff member
  const getStaffTimeOffBlocks = (staffId: string) => {
    const timeOffEvents = todayEvents.filter(
      event => event.extendedProps.type === 'timeOff' && event.extendedProps.staffId === staffId
    )

    return timeOffEvents.map(event => {
      const style = getEventStyle(event)
      return { top: style.top, height: style.height }
    })
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
    const allResourceEvents = getResourceEvents(resource.id, resource.type)
    // Filter out timeOff and reservation events - they'll be shown as stripes
    const resourceEvents = allResourceEvents.filter(
      event => event.extendedProps.type !== 'timeOff' && event.extendedProps.type !== 'reservation'
    )
    const roomBlocks = isStaff ? getStaffRoomBlocks(resource.id) : []
    const nonWorkingBlocks = isStaff ? getStaffNonWorkingBlocks(resource.id) : []
    const timeOffBlocks = isStaff ? getStaffTimeOffBlocks(resource.id) : []

    // NOTE: Staff/room click disabled - only slots/bookings are clickable
    // const handleClick = () => {
    //   if (isStaff && onStaffClick) {
    //     onStaffClick(resource.id)
    //   } else if (!isStaff && onRoomClick) {
    //     onRoomClick(resource.id)
    //   }
    // }

    // NOTE: Cell click disabled - only slots/bookings are clickable
    // const handleCellClickInternal = () => {
    //   if (onCellClick) {
    //     onCellClick(resource.id, resource.type, currentDate)
    //   }
    // }

    return (
      <Box
        key={resource.id}
        sx={{
          borderRight: 1,
          borderColor: 'divider',
          position: 'relative'
          // cursor: 'pointer', // Disabled - only slots/bookings are clickable
          // '&:hover': { // Disabled - only slots/bookings are clickable
          //   bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
          // }
        }}
        // onClick disabled - only slots/bookings are clickable
        // onClick={handleCellClickInternal}
      >
        {/* Non-working hours overlay (diagonal stripes) */}
        {nonWorkingBlocks.map((block, idx) => (
          <Box
            key={`non-working-${idx}`}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: block.top,
              height: block.height,
              pointerEvents: 'none',
              zIndex: 1,
              backgroundImage: isDark
                ? 'repeating-linear-gradient(45deg, rgba(100, 100, 100, 0.15) 0px, rgba(100, 100, 100, 0.15) 8px, transparent 8px, transparent 16px)'
                : 'repeating-linear-gradient(45deg, rgba(200, 200, 200, 0.2) 0px, rgba(200, 200, 200, 0.2) 8px, transparent 8px, transparent 16px)'
            }}
          />
        ))}

        {/* Time-off overlay (diagonal stripes) */}
        {timeOffBlocks.map((block, idx) => (
          <Box
            key={`time-off-${idx}`}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: block.top,
              height: block.height,
              pointerEvents: 'none',
              zIndex: 2,
              backgroundImage: isDark
                ? 'repeating-linear-gradient(45deg, rgba(100, 100, 100, 0.15) 0px, rgba(100, 100, 100, 0.15) 8px, transparent 8px, transparent 16px)'
                : 'repeating-linear-gradient(45deg, rgba(200, 200, 200, 0.2) 0px, rgba(200, 200, 200, 0.2) 8px, transparent 8px, transparent 16px)'
            }}
          />
        ))}
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
          const isStaticType = isStaff
            ? resource.staffType === 'static'
            : resource.roomType === 'static' || resource.roomType === 'fixed'
          const isDynamicType = isStaff
            ? resource.staffType === 'dynamic'
            : resource.roomType === 'flexible' || resource.roomType === 'dynamic'

          // Search highlighting - check if event matches search
          const isMatchedBySearch = isEventMatchedBySearch(event.id)
          const isFaded = isSearchActive && !isMatchedBySearch
          const isHighlighted = isSearchActive && isMatchedBySearch

          // Adjust colors for faded events
          const effectiveBgColor = isFaded ? adjustColorOpacity(colors.bg, 0.25) : colors.bg
          const effectiveBorderColor = isFaded ? adjustColorOpacity(colors.border, 0.3) : colors.border
          const effectiveTextColor = isFaded ? adjustColorOpacity(colors.text, 0.4) : colors.text

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
                bgcolor: effectiveBgColor,
                borderRadius: 1.5,
                border: isStaticType ? `2px solid ${effectiveBorderColor}` : `1px solid ${effectiveBorderColor}40`,
                borderLeft: isStaticType ? `4px solid ${effectiveBorderColor}` : `1px solid ${effectiveBorderColor}40`,
                backgroundImage: isStaticType
                  ? `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 5px,
                      ${effectiveBorderColor}40 5px,
                      ${effectiveBorderColor}40 10px
                    )`
                  : 'none',
                p: 0.75,
                overflow: 'visible',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: isFaded ? 0.4 : 1,
                filter: isFaded ? 'grayscale(50%)' : 'none',
                boxShadow: isHighlighted
                  ? '0px 0px 0px 3px rgba(20, 184, 166, 0.5), 0px 4px 12px rgba(0,0,0,0.15)'
                  : isStaticType
                    ? 'none'
                    : '0px 2px 8px rgba(0,0,0,0.06)',
                transform: isHighlighted ? 'scale(1.02)' : 'none',
                zIndex: isHighlighted ? 5 : 'auto',
                '&:hover': {
                  boxShadow: isHighlighted
                    ? '0px 0px 0px 3px rgba(20, 184, 166, 0.7), 0px 6px 16px rgba(0,0,0,0.2)'
                    : isStaticType
                      ? 'none'
                      : '0px 4px 12px rgba(0,0,0,0.1)',
                  transform: isHighlighted ? 'scale(1.03) translateY(-2px)' : 'translateY(-2px)',
                  zIndex: 10,
                  opacity: isFaded ? 0.6 : 1
                }
              }}
            >
              <Typography
                variant='caption'
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  display: 'block',
                  color: effectiveTextColor,
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
                        bgcolor: isFaded ? adjustColorOpacity(service.color, 0.3) : service.color,
                        flexShrink: 0
                      }}
                    />
                  ) : null
                })()}
                <Typography
                  variant='caption'
                  sx={{
                    fontSize: '0.65rem',
                    color: effectiveTextColor,
                    opacity: isFaded ? 0.5 : 0.8
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
                const isStaticRoom = !isStaff && (resource.roomType === 'static' || resource.roomType === 'fixed')
                const shouldShowChip = isStaticStaff || isStaticRoom

                if (!shouldShowChip) {
                  return null // Don't show chip on dynamic resources
                }

                // Extract slotId for capacity calculation (if it exists)
                const slotId = event.extendedProps?.slotId
                const eventStartTime = format(new Date(event.start), 'HH:mm')
                const eventEndTime = format(new Date(event.end), 'HH:mm')

                // This prevents showing "2/1" multiple times when there are multiple bookings
                if (slotId) {
                  // If has slotId, only show on first event of that slot
                  const slotEventsInResource = resourceEvents.filter(e => e.extendedProps?.slotId === slotId)
                  const isFirstEventInSlot = slotEventsInResource[0]?.id === event.id
                  if (!isFirstEventInSlot) {
                    return null
                  }
                } else {
                  // If no slotId, show chip only on first event within the same time slot
                  const sameTimeSlotEvents = resourceEvents.filter(e => {
                    const eStartTime = format(new Date(e.start), 'HH:mm')
                    const eEndTime = format(new Date(e.end), 'HH:mm')
                    // Events with overlapping time
                    return eStartTime < eventEndTime && eEndTime > eventStartTime
                  })
                  const isFirstInTimeSlot = sameTimeSlotEvents[0]?.id === event.id
                  if (!isFirstInTimeSlot) {
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

                // Check if we have valid slot data (total > 0 means slot was found)
                const hasValidSlotData = capacityInfo && capacityInfo.total > 0

                if (hasValidSlotData) {
                  // Use real capacity data from slot
                  bookedCount = capacityInfo.total - capacityInfo.remainingCapacity
                  totalCapacity = capacityInfo.total
                  const percentRemaining = (capacityInfo.remainingCapacity / totalCapacity) * 100
                  chipColor = percentRemaining > 50 ? 'success' : percentRemaining > 20 ? 'warning' : 'error'
                } else {
                  // No slot data - count bookings manually for this resource's time slot
                  const allResourceEvents = allEvents.filter(e => {
                    // Must be same day and not cancelled
                    if (!isSameDay(new Date(e.start), eventDate)) return false
                    if (e.extendedProps.status === 'cancelled') return false

                    // Match by resource (staff or room)
                    if (isStaticStaff && e.extendedProps.staffId !== resource.id) return false
                    if (isStaticRoom && e.extendedProps.roomId !== resource.id) return false

                    // Only count events in overlapping time slots
                    const eStartTime = format(new Date(e.start), 'HH:mm')
                    const eEndTime = format(new Date(e.end), 'HH:mm')
                    const hasOverlap = eStartTime < eventEndTime && eEndTime > eventStartTime

                    return hasOverlap
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
                {/* NOTE: Resource header click disabled - only slots/bookings are clickable */}
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
                        // cursor: 'pointer', // Disabled - only slots/bookings are clickable
                        bgcolor: isRoom
                          ? isDark
                            ? 'rgba(76, 175, 80, 0.03)'
                            : 'rgba(76, 175, 80, 0.01)'
                          : 'transparent'
                        // '&:hover': { // Disabled - only slots/bookings are clickable
                        //   bgcolor: isRoom
                        //     ? isDark
                        //       ? 'rgba(76, 175, 80, 0.08)'
                        //       : 'rgba(76, 175, 80, 0.05)'
                        //     : isDark
                        //       ? 'rgba(255,255,255,0.05)'
                        //       : 'rgba(0,0,0,0.03)'
                        // }
                      }}
                      // onClick disabled - only slots/bookings are clickable
                      // onClick={() => {
                      //   if (resource.type === 'staff' && onStaffClick) onStaffClick(resource.id)
                      //   else if (resource.type === 'room' && onRoomClick) onRoomClick(resource.id)
                      // }}
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
