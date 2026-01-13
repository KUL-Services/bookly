'use client'

import { Box, Typography, Avatar, Chip, Divider, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, addMinutes, isSameDay, isToday } from 'date-fns'
import { useState, useEffect, useMemo, useRef } from 'react'
import { mockStaff, mockServices, mockBookings } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from '../staff-management/staff-store'
import { useCalendarStore } from './state'
import {
  getBranchName,
  getBranchHours,
  buildEventColors,
  groupStaffByType,
  categorizeRooms,
  getStaffAvailableCapacity,
  getCapacityColor,
  getDynamicRoomAvailability
} from './utils'
import type { CalendarEvent, DayOfWeek, WeeklyStaffHours } from './types'

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

// Helper to render tooltip content with status icons
const renderEventTooltip = (event: CalendarEvent) => {
  const { extendedProps } = event
  const startDate = new Date(event.start)
  const endDate = new Date(event.end)

  // Format date and time
  const dateStr = format(startDate, 'EEE, MMM d')
  const timeStr = `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`

  return (
    <Box sx={{ p: 1, minWidth: 200 }}>
      {/* Booking Reference */}
      {extendedProps.bookingId && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 0.75,
            pb: 0.75,
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <i className='ri-bookmark-line' style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }} />
          <Typography
            variant='caption'
            sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-fira-code)' }}
          >
            {extendedProps.bookingId}
          </Typography>
        </Box>
      )}

      {/* Service Name */}
      <Typography
        variant='caption'
        sx={{ fontWeight: 600, display: 'block', mb: 0.25, color: '#fff', fontSize: '0.75rem' }}
      >
        {extendedProps.serviceName || event.title}
      </Typography>

      {/* Date & Time */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <i className='ri-calendar-line' style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }} />
        <Typography variant='caption' sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.85)' }}>
          {dateStr} • {timeStr}
        </Typography>
      </Box>

      {/* Customer Name */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
        <i className='ri-user-line' style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }} />
        <Typography variant='caption' sx={{ display: 'block', color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem' }}>
          {extendedProps.customerName || 'Walk-in Client'}
        </Typography>
      </Box>

      {/* Price if available */}
      {extendedProps.price && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
          <i className='ri-price-tag-3-line' style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }} />
          <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
            ${extendedProps.price.toFixed(2)}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
          mt: 1,
          pt: 0.75,
          borderTop: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        {/* Payment Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <i
            className={
              extendedProps.paymentStatus === 'paid' ? 'ri-money-dollar-circle-fill' : 'ri-money-dollar-circle-line'
            }
            style={{ fontSize: '14px', color: extendedProps.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}
          />
          <Typography variant='caption' sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.9)' }}>
            {extendedProps.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
          </Typography>
        </Box>

        {/* Booking Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <i
            className={
              extendedProps.status === 'confirmed'
                ? 'ri-checkbox-circle-fill'
                : extendedProps.status === 'pending'
                  ? 'ri-time-line'
                  : extendedProps.status === 'attended'
                    ? 'ri-check-double-line'
                    : extendedProps.status === 'cancelled'
                      ? 'ri-close-circle-fill'
                      : extendedProps.status === 'no_show'
                        ? 'ri-user-unfollow-line'
                        : 'ri-question-line'
            }
            style={{
              fontSize: '14px',
              color:
                extendedProps.status === 'confirmed'
                  ? '#10b981'
                  : extendedProps.status === 'pending'
                    ? '#f59e0b'
                    : extendedProps.status === 'attended'
                      ? '#3b82f6'
                      : extendedProps.status === 'cancelled'
                        ? '#ef4444'
                        : extendedProps.status === 'no_show'
                          ? '#9ca3af'
                          : '#9ca3af'
            }}
          />
          <Typography
            variant='caption'
            sx={{ fontSize: '0.65rem', textTransform: 'capitalize', color: 'rgba(255,255,255,0.9)' }}
          >
            {extendedProps.status.replace('_', ' ')}
          </Typography>
        </Box>

        {/* Starred */}
        {extendedProps.starred && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <i className='ri-star-fill' style={{ fontSize: '14px', color: '#fbbf24' }} />
          </Box>
        )}
      </Box>

      {/* Booked By section */}
      <Box sx={{ mt: 1, pt: 0.75, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <i
            className={extendedProps.selectionMethod === 'by_client' ? 'ri-smartphone-line' : 'ri-user-settings-line'}
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}
          />
          <Typography variant='caption' sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)' }}>
            Booked {extendedProps.selectionMethod === 'by_client' ? 'by client' : 'by business'}
          </Typography>
        </Box>

        {/* Walk-in Indicator with arrival time */}
        {extendedProps.arrivalTime && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <i className='ri-walk-line' style={{ fontSize: '12px', color: '#ec4899' }} />
            <Typography variant='caption' sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)' }}>
              Walk-in arrived at {extendedProps.arrivalTime}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Payment Reference if available */}
      {extendedProps.paymentReference && (
        <Box sx={{ mt: 0.75 }}>
          <Typography variant='caption' sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
            Payment Ref: {extendedProps.paymentReference}
          </Typography>
        </Box>
      )}
    </Box>
  )
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
  const staticSlots = useCalendarStore(state => state.staticSlots)
  const isSearchActive = useCalendarStore(state => state.isSearchActive)
  const isEventMatchedBySearch = useCalendarStore(state => state.isEventMatchedBySearch)
  const getSearchMatchedFields = useCalendarStore(state => state.getSearchMatchedFields)
  const branchFilters = useCalendarStore(state => state.branchFilters)
  const staffFilters = useCalendarStore(state => state.staffFilters)
  const roomFilters = useCalendarStore(state => state.roomFilters)
  const schedulingMode = useCalendarStore(state => state.schedulingMode)
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

    // Determine which branches to show
    const selectedBranchIds =
      branchFilters.allBranches || branchFilters.branchIds.length === 0
        ? Array.from(new Set([...mockStaff.map(s => s.branchId || '1-1'), ...rooms.map(r => r.branchId || '1-1')]))
        : branchFilters.branchIds

    // Sort branches for consistent ordering
    const sortedBranches = selectedBranchIds.sort()

    sortedBranches.forEach(branchId => {
      // Layer 2: STAFF (within branch) - filter based on staff filters
      let filteredStaff = mockStaff.filter(staff => (staff.branchId || '1-1') === branchId)

      // Apply staff filters
      if (staffFilters.onlyMe) {
        filteredStaff = filteredStaff.filter(staff => staff.id === '1')
      } else if (staffFilters.staffIds.length > 0) {
        filteredStaff = filteredStaff.filter(staff => staffFilters.staffIds.includes(staff.id))
      }

      // Apply workingStaffOnly filter
      if (staffFilters.workingStaffOnly) {
        filteredStaff = filteredStaff.filter(staff => {
          const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          const dayOfWeek = dayNames[currentDate.getDay()]
          const workingHours = staffWorkingHours[staff.id]?.[dayOfWeek as keyof WeeklyStaffHours] as
            | { isWorking: boolean; shifts: any[] }
            | undefined
          return workingHours?.isWorking && workingHours.shifts && workingHours.shifts.length > 0
        })
      }

      filteredStaff.forEach(staff => {
        resources.push({
          ...staff,
          type: 'staff' as const,
          primaryGroup: branchId,
          secondaryGroup: 'staff'
        })
      })

      // Layer 2: ROOMS (within branch) - filter based on room filters
      let filteredRooms = rooms.filter(room => (room.branchId || '1-1') === branchId)

      // Apply room filters
      if (!roomFilters.allRooms && roomFilters.roomIds.length > 0) {
        filteredRooms = filteredRooms.filter(room => roomFilters.roomIds.includes(room.id))
      }

      // TODO: Implement availableNow and availableToday filters for rooms
      // For now, these filters are placeholders - the actual logic will depend on
      // how you want to determine room availability

      filteredRooms.forEach(room => {
        resources.push({
          ...room,
          type: 'room' as const,
          primaryGroup: branchId,
          secondaryGroup: 'rooms',
          photo: undefined
        })
      })
    })

    return resources
  }, [rooms, branchFilters, staffFilters, roomFilters, currentDate, staffWorkingHours])

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
    const workingHours = staffWorkingHours[staffId]?.[dayOfWeek as keyof WeeklyStaffHours] as
      | { isWorking: boolean; shifts: any[] }
      | undefined

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
        shift.breaks.forEach((breakTime: { start: string; end: string }) => {
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

  const getReservationBlocks = (resourceId: string, resourceType: 'staff' | 'room') => {
    const reservationEvents = todayEvents.filter(event => {
      if (event.extendedProps.type !== 'reservation') return false
      return resourceType === 'staff'
        ? event.extendedProps.staffId === resourceId
        : event.extendedProps.roomId === resourceId
    })

    return reservationEvents.map(event => {
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
    // Filter out timeOff and reservation events - they'll be shown as overlays
    // Note: We no longer filter out bookings during time-off periods -
    // time-off is displayed as a background overlay, and bookings remain visible
    const resourceEvents = allResourceEvents.filter(
      event => event.extendedProps.type !== 'timeOff' && event.extendedProps.type !== 'reservation'
    )

    const roomBlocks = isStaff ? getStaffRoomBlocks(resource.id) : []
    const nonWorkingBlocks = isStaff ? getStaffNonWorkingBlocks(resource.id) : []
    const timeOffBlocks = isStaff ? getStaffTimeOffBlocks(resource.id) : []
    const reservationBlocks = getReservationBlocks(resource.id, resource.type)

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
                : 'repeating-linear-gradient(45deg, rgba(200, 200, 200, 0.2) 0px, rgba(200, 200, 200, 0.2) 8px, transparent 8px, transparent 16px)',
              backgroundColor: 'transparent'
            }}
          />
        ))}

        {/* Time-off overlay (diagonal stripes) - Reverted to stripes as requested */}
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
                : 'repeating-linear-gradient(45deg, rgba(200, 200, 200, 0.2) 0px, rgba(200, 200, 200, 0.2) 8px, transparent 8px, transparent 16px)',
              borderLeft: 'none'
            }}
          />
        ))}

        {/* Reservation overlay (diagonal stripes) - Reverted to stripes */}
        {reservationBlocks.map((block, idx) => (
          <Box
            key={`reservation-${idx}`}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: block.top,
              height: block.height,
              pointerEvents: 'none',
              zIndex: 2,
              backgroundImage: isDark
                ? 'repeating-linear-gradient(45deg, rgba(10, 44, 36, 0.2) 0px, rgba(10, 44, 36, 0.2) 8px, transparent 8px, transparent 16px)'
                : 'repeating-linear-gradient(45deg, rgba(10, 44, 36, 0.18) 0px, rgba(10, 44, 36, 0.18) 8px, transparent 8px, transparent 16px)',
              borderLeft: 'none'
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

        {/* Events - render cards (consolidated for static slots) */}
        {(() => {
          // Determine if this is a static/fixed resource OR if events have static slot properties
          // Check resource type first
          let isStaticType = isStaff
            ? resource.staffType === 'static'
            : resource.roomType === 'static' || resource.roomType === 'fixed'

          // Also check if events themselves indicate static slots:
          // - Events with slotId are from static scheduling
          // - Events linked to a static room should be consolidated
          if (!isStaticType && resourceEvents.length > 0) {
            const hasStaticSlotEvents = resourceEvents.some(event => {
              // Check if event has slotId (from static scheduling)
              if (event.extendedProps?.slotId) return true
              // Check if event's room is static type
              const eventRoomId = event.extendedProps?.roomId
              if (eventRoomId) {
                const eventRoom = rooms.find(r => r.id === eventRoomId)
                if (eventRoom?.roomType === 'static' || eventRoom?.roomType === 'fixed') return true
              }
              return false
            })
            if (hasStaticSlotEvents) {
              isStaticType = true
            }
          }

          // For static resources, group events by slotId to avoid overlapping
          // Show ONE card per slot with capacity info instead of multiple overlapping cards
          if (isStaticType) {
            // Group by slotId
            const slotGroups = new Map<string, CalendarEvent[]>()
            resourceEvents.forEach(event => {
              const slotId = event.extendedProps?.slotId || `time-${format(event.start, 'HHmm')}`
              if (!slotGroups.has(slotId)) {
                slotGroups.set(slotId, [])
              }
              slotGroups.get(slotId)!.push(event)
            })

            return Array.from(slotGroups.entries()).map(([slotId, slotEvents]) => {
              // Use first event for positioning and styling
              const firstEvent = slotEvents[0]
              const style = getEventStyle(firstEvent)

              // Count active bookings (exclude cancelled)
              const activeBookings = slotEvents.filter(e => e.extendedProps?.status !== 'cancelled')
              const bookingCount = activeBookings.length

              // Use confirmed status color for the card, or first event's status
              const colors = buildEventColors(colorScheme, 'confirmed')

              // Check search highlighting - highlight if ANY event in slot matches
              const anyMatchedBySearch = slotEvents.some(e => isEventMatchedBySearch(e.id))
              const isFaded = isSearchActive && !anyMatchedBySearch
              const isHighlighted = isSearchActive && anyMatchedBySearch

              const effectiveBorderColor = isFaded ? adjustColorOpacity(colors.border, 0.3) : colors.border
              const baseFillOpacity = isDark ? 0.22 : 0.16
              const effectiveBgColor = adjustColorOpacity(
                effectiveBorderColor,
                isFaded ? baseFillOpacity * 0.6 : baseFillOpacity
              )
              const baseTextColor = theme.palette.text.primary
              const effectiveTextColor = isFaded ? adjustColorOpacity(baseTextColor, isDark ? 0.5 : 0.6) : baseTextColor
              const stripeColor = adjustColorOpacity(effectiveBorderColor, isFaded ? 0.2 : 0.35)

              // Get slot capacity from static slots
              const staticSlot = staticSlots.find(s => s.id === firstEvent.extendedProps?.slotId)
              const totalCapacity = staticSlot?.capacity || bookingCount

              return (
                <Tooltip
                  key={slotId}
                  title={
                    <Box sx={{ p: 1, minWidth: 200 }}>
                      <Typography variant='caption' sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: '#fff' }}>
                        {firstEvent.extendedProps?.serviceName || firstEvent.title}
                      </Typography>
                      <Typography variant='caption' sx={{ display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.85)' }}>
                        {format(firstEvent.start, 'h:mm a')} - {format(firstEvent.end, 'h:mm a')}
                      </Typography>
                      <Typography variant='caption' sx={{ display: 'block', mb: 0.75, color: 'rgba(255,255,255,0.9)' }}>
                        {bookingCount} / {totalCapacity} booked
                      </Typography>
                      {activeBookings.length > 0 && (
                        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', pt: 0.75 }}>
                          <Typography variant='caption' sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                            Clients:{' '}
                            {activeBookings
                              .slice(0, 5)
                              .map(e => e.extendedProps?.customerName || 'Client')
                              .join(', ')}
                            {activeBookings.length > 5 && ` +${activeBookings.length - 5} more`}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                  arrow
                  placement='top'
                  enterDelay={300}
                  leaveDelay={0}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        maxWidth: 320,
                        '& .MuiTooltip-arrow': {
                          color: 'rgba(0, 0, 0, 0.9)'
                        }
                      }
                    }
                  }}
                >
                  <Box
                    onClick={e => {
                      e.stopPropagation()
                      onEventClick?.(firstEvent)
                    }}
                    sx={{
                      position: 'absolute',
                      left: 4,
                      right: 4,
                      top: style.top,
                      height: Math.max(style.height, 60),
                      bgcolor: effectiveBgColor,
                      borderRadius: 1.5,
                      border: 'none',
                      borderLeft: `4px solid ${effectiveBorderColor}`,
                      backgroundImage: `radial-gradient(${stripeColor} 1px, transparent 1px)`,
                      backgroundSize: '12px 12px',
                      borderStyle: 'dashed',
                      borderWidth: '2px',
                      borderColor: stripeColor,
                      p: 0.75,
                      overflow: 'hidden',
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
                          : 'none',
                        transform: isHighlighted ? 'scale(1.03) translateY(-2px)' : 'translateY(-2px)',
                        zIndex: 10,
                        opacity: isFaded ? 0.6 : 1
                      }
                    }}
                  >
                    {/* Time */}
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: effectiveTextColor,
                        lineHeight: 1.2,
                        display: 'block',
                        mb: 0.25
                      }}
                      noWrap
                    >
                      {format(firstEvent.start, 'h:mm a')}
                    </Typography>
                    {/* Service name */}
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'block',
                        color: effectiveTextColor,
                        lineHeight: 1.2,
                        mb: 0.25
                      }}
                      noWrap
                    >
                      {firstEvent.extendedProps?.serviceName || firstEvent.title}
                    </Typography>
                    {/* Capacity chip */}
                    <Chip
                      size='small'
                      label={`${bookingCount}/${totalCapacity}`}
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor:
                          bookingCount >= totalCapacity
                            ? 'error.main'
                            : bookingCount >= totalCapacity * 0.7
                              ? 'warning.main'
                              : 'success.main',
                        color: 'white',
                        '& .MuiChip-label': { px: 0.75 }
                      }}
                    />
                  </Box>
                </Tooltip>
              )
            })
          }

          // For dynamic resources, render individual cards as before
          return resourceEvents.map(event => {
            const style = getEventStyle(event)
            const colors = buildEventColors(colorScheme, event.extendedProps.status)

            const isMatchedBySearch = isEventMatchedBySearch(event.id)
            const isFaded = isSearchActive && !isMatchedBySearch
            const isHighlighted = isSearchActive && isMatchedBySearch

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
                title={renderEventTooltip(event)}
                arrow
                placement='top'
                enterDelay={300}
                leaveDelay={0}
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'rgba(0, 0, 0, 0.9)',
                      maxWidth: 320,
                      '& .MuiTooltip-arrow': {
                        color: 'rgba(0, 0, 0, 0.9)'
                      }
                    }
                  }
                }}
              >
                <Box
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
                    border: 'none',
                    borderLeft: `4px solid ${effectiveBorderColor}`,
                    p: 0.75,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isFaded ? 0.4 : 1,
                    filter: isFaded ? 'grayscale(50%)' : 'none',
                    boxShadow: isHighlighted
                      ? '0px 0px 0px 3px rgba(10, 44, 36, 0.5), 0px 4px 12px rgba(0,0,0,0.15)'
                      : '0px 2px 8px rgba(0,0,0,0.06)',
                    transform: isHighlighted ? 'scale(1.02)' : 'none',
                    zIndex: isHighlighted ? 5 : 'auto',
                    '&:hover': {
                      boxShadow: isHighlighted
                        ? '0px 0px 0px 3px rgba(10, 44, 36, 0.7), 0px 6px 16px rgba(0,0,0,0.2)'
                        : '0px 4px 12px rgba(0,0,0,0.1)',
                      transform: isHighlighted ? 'scale(1.03) translateY(-2px)' : 'translateY(-2px)',
                      zIndex: 10,
                      opacity: isFaded ? 0.6 : 1
                    }
                  }}
                >
                  {/* Time and status indicators row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: effectiveTextColor,
                        lineHeight: 1.2
                      }}
                      noWrap
                    >
                      {format(event.start, 'h:mm a')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      {event.extendedProps?.starred && (
                        <i className='ri-star-fill' style={{ fontSize: '10px', color: '#fbbf24' }} />
                      )}
                      <i
                        className={
                          event.extendedProps?.paymentStatus === 'paid'
                            ? 'ri-money-dollar-circle-fill'
                            : 'ri-money-dollar-circle-line'
                        }
                        style={{
                          fontSize: '10px',
                          color: event.extendedProps?.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'
                        }}
                      />
                      <i
                        className={
                          event.extendedProps?.status === 'confirmed'
                            ? 'ri-checkbox-circle-fill'
                            : event.extendedProps?.status === 'attended'
                              ? 'ri-check-double-fill'
                              : event.extendedProps?.status === 'pending'
                                ? 'ri-time-line'
                                : event.extendedProps?.status === 'cancelled'
                                  ? 'ri-close-circle-fill'
                                  : event.extendedProps?.status === 'no_show'
                                    ? 'ri-user-unfollow-fill'
                                    : 'ri-question-line'
                        }
                        style={{
                          fontSize: '10px',
                          color:
                            event.extendedProps?.status === 'confirmed'
                              ? '#10b981'
                              : event.extendedProps?.status === 'attended'
                                ? '#3b82f6'
                                : event.extendedProps?.status === 'pending'
                                  ? '#f59e0b'
                                  : event.extendedProps?.status === 'cancelled'
                                    ? '#ef4444'
                                    : event.extendedProps?.status === 'no_show'
                                      ? '#9ca3af'
                                      : '#9ca3af'
                        }}
                      />
                    </Box>
                  </Box>
                  {/* Client name */}
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      display: 'block',
                      color: effectiveTextColor,
                      lineHeight: 1.2
                    }}
                    noWrap
                  >
                    {event.extendedProps?.customerName || 'Unknown Client'}
                  </Typography>
                  {/* Service with color dot */}
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
                        fontSize: '0.6rem',
                        color: effectiveTextColor,
                        opacity: isFaded ? 0.5 : 0.7
                      }}
                      noWrap
                    >
                      {event.extendedProps?.serviceName || event.title}
                    </Typography>
                  </Box>

                  {/* Search matched fields indicator */}
                  {isSearchActive &&
                    isHighlighted &&
                    (() => {
                      const matchedFields = getSearchMatchedFields(event.id)
                      if (matchedFields.length === 0) return null
                      return (
                        <Box sx={{ mt: 0.25, display: 'flex', gap: 0.25, flexWrap: 'wrap' }}>
                          <Typography
                            variant='caption'
                            sx={{ fontSize: '0.55rem', color: 'primary.main', fontWeight: 600 }}
                          >
                            Match: {matchedFields.join(', ')}
                          </Typography>
                        </Box>
                      )
                    })()}
                </Box>
              </Tooltip>
            )
          })
        })()}
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

  // Helper to get staff working hours for display
  const getStaffWorkingHoursDisplay = (staffId: string) => {
    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = dayNames[currentDate.getDay()]
    const workingHours = staffWorkingHours[staffId]?.[dayOfWeek as keyof WeeklyStaffHours] as
      | { isWorking: boolean; shifts: any[] }
      | undefined

    if (!workingHours || !workingHours.isWorking || !workingHours.shifts || workingHours.shifts.length === 0) {
      return { isWorking: false, hoursText: 'Day off' }
    }

    // Sort shifts by start time and combine for display
    const shifts = [...workingHours.shifts].sort((a, b) => {
      const aStart = parseInt(a.start.replace(':', ''))
      const bStart = parseInt(b.start.replace(':', ''))
      return aStart - bStart
    })

    // Format: show first and last time like "9am - 6pm"
    const firstShift = shifts[0]
    const lastShift = shifts[shifts.length - 1]

    // Convert 24h format to 12h format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number)
      const suffix = hours >= 12 ? 'pm' : 'am'
      const hour12 = hours % 12 || 12
      return minutes === 0 ? `${hour12}${suffix}` : `${hour12}:${minutes.toString().padStart(2, '0')}${suffix}`
    }

    const startTime = formatTime(firstShift.start)
    const endTime = formatTime(lastShift.end)

    // Calculate total hours
    let totalMinutes = 0
    shifts.forEach(shift => {
      const [startH, startM] = shift.start.split(':').map(Number)
      const [endH, endM] = shift.end.split(':').map(Number)
      const shiftMinutes = endH * 60 + endM - (startH * 60 + startM)

      // Subtract break times
      if (shift.breaks && shift.breaks.length > 0) {
        shift.breaks.forEach((breakTime: { start: string; end: string }) => {
          const [breakStartH, breakStartM] = breakTime.start.split(':').map(Number)
          const [breakEndH, breakEndM] = breakTime.end.split(':').map(Number)
          totalMinutes -= breakEndH * 60 + breakEndM - (breakStartH * 60 + breakStartM)
        })
      }
      totalMinutes += shiftMinutes
    })

    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60

    return {
      isWorking: true,
      hoursText: `${startTime} - ${endTime}`,
      totalHours: remainingMinutes > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalHours}h`
    }
  }

  const primaryGroups = Object.entries(groupingStructure)
  const branchDividerWidth = 3
  const branchDividerColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'
  const staffRoomDividerWidth = 2
  const staffRoomDividerColor = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(148,163,184,0.6)'

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
                {primaryGroups.map(([primaryGroup, secondaryGroups], groupIndex) => {
                  const resourcesInPrimaryGroup = Object.values(secondaryGroups).flat().flat()
                  const isLastGroup = groupIndex === primaryGroups.length - 1
                  const borderRightWidth = isLastGroup ? 1 : branchDividerWidth
                  const borderRightColor = isLastGroup ? 'divider' : branchDividerColor
                  const branchHours = getBranchHours(primaryGroup, currentDate)
                  return (
                    <Box
                      key={`primary-${primaryGroup}`}
                      sx={{
                        gridColumn: `span ${resourcesInPrimaryGroup.length}`,
                        p: 1.5,
                        bgcolor: isDark ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.08)',
                        borderRight: borderRightWidth,
                        borderColor: borderRightColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        flexDirection: 'column',
                        py: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      {branchHours && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <i className='ri-time-line' style={{ fontSize: 12, opacity: 0.7 }} />
                          <Typography variant='caption' sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                            {branchHours}
                          </Typography>
                        </Box>
                      )}
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
                {primaryGroups.map(([primaryGroup, secondaryGroups], primaryIndex) => {
                  const secondaryEntries = Object.entries(secondaryGroups)
                  return secondaryEntries.map(([secondaryGroup, resources], secondaryIndex) => {
                    const isStaffGroup = secondaryGroup === 'staff'
                    const isLastSecondaryGroup = secondaryIndex === secondaryEntries.length - 1
                    const isLastPrimaryGroup = primaryIndex === primaryGroups.length - 1
                    const isBranchBoundary = isLastSecondaryGroup && !isLastPrimaryGroup
                    const isStaffRoomsBoundary = !isLastSecondaryGroup && !isBranchBoundary
                    const borderRightWidth = isBranchBoundary
                      ? branchDividerWidth
                      : isStaffRoomsBoundary
                        ? staffRoomDividerWidth
                        : 1
                    const borderRightColor = isBranchBoundary
                      ? branchDividerColor
                      : isStaffRoomsBoundary
                        ? staffRoomDividerColor
                        : 'divider'
                    return (
                      <Box
                        key={`secondary-${primaryGroup}-${secondaryGroup}`}
                        sx={{
                          gridColumn: `span ${resources.length}`,
                          p: 1,
                          bgcolor: isStaffGroup
                            ? isDark
                              ? 'rgba(10, 44, 36, 0.08)'
                              : 'rgba(10, 44, 36, 0.05)'
                            : isDark
                              ? 'rgba(10, 44, 36, 0.08)'
                              : 'rgba(10, 44, 36, 0.05)',
                          borderRight: borderRightWidth,
                          borderColor: borderRightColor,
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
                {orderedResources.map((resource, index) => {
                  const isRoom = resource.type === 'room'
                  const isBranchBoundary =
                    index < orderedResources.length - 1 &&
                    orderedResources[index + 1].primaryGroup !== resource.primaryGroup
                  const isStaffRoomBoundary =
                    !isBranchBoundary &&
                    resource.type === 'staff' &&
                    index < orderedResources.length - 1 &&
                    orderedResources[index + 1].type === 'room'
                  const borderRightWidth = isBranchBoundary
                    ? branchDividerWidth
                    : isStaffRoomBoundary
                      ? staffRoomDividerWidth
                      : 1
                  const borderRightColor = isBranchBoundary
                    ? branchDividerColor
                    : isStaffRoomBoundary
                      ? staffRoomDividerColor
                      : 'divider'

                  // Get working hours for staff members
                  const workingHoursInfo = resource.type === 'staff' ? getStaffWorkingHoursDisplay(resource.id) : null

                  return (
                    <Box
                      key={resource.id}
                      sx={{
                        p: 1.5,
                        borderRight: borderRightWidth,
                        borderColor: borderRightColor,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        // cursor: 'pointer', // Disabled - only slots/bookings are clickable
                        bgcolor: isRoom ? (isDark ? 'rgba(10, 44, 36, 0.03)' : 'rgba(10, 44, 36, 0.01)') : 'transparent'
                        // '&:hover': { // Disabled - only slots/bookings are clickable
                        //   bgcolor: isRoom
                        //     ? isDark
                        //       ? 'rgba(10, 44, 36, 0.08)'
                        //       : 'rgba(10, 44, 36, 0.05)'
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
                          color: 'common.white',
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
                          <i
                            className='ri-tools-line'
                            style={{ color: 'var(--mui-palette-common-white)', fontSize: 14 }}
                          />
                        )}
                      </Avatar>
                      <Box sx={{ textAlign: 'center', width: '100%' }}>
                        <Typography variant='body2' fontWeight={600} noWrap fontSize='0.8rem'>
                          {resource.name}
                        </Typography>
                        {/* Staff working hours display */}
                        {workingHoursInfo && (
                          <Tooltip
                            title={
                              workingHoursInfo.isWorking
                                ? `Working ${workingHoursInfo.totalHours} today`
                                : 'Not working today'
                            }
                            placement='bottom'
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                mt: 0.25
                              }}
                            >
                              <i
                                className={workingHoursInfo.isWorking ? 'ri-time-line' : 'ri-rest-time-line'}
                                style={{
                                  fontSize: '0.7rem',
                                  color: workingHoursInfo.isWorking
                                    ? theme.palette.success.main
                                    : theme.palette.text.disabled
                                }}
                              />
                              <Typography
                                variant='caption'
                                sx={{
                                  fontSize: '0.65rem',
                                  color: workingHoursInfo.isWorking ? 'text.secondary' : 'text.disabled',
                                  fontWeight: workingHoursInfo.isWorking ? 500 : 400
                                }}
                              >
                                {workingHoursInfo.hoursText}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}
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
                  minWidth: 'min-content',
                  position: 'relative'
                }}
              >
                {/* Resource columns */}
                {orderedResources.map((resource, index) => {
                  const isRoom = resource.type === 'room'
                  const bgColor = isRoom
                    ? isDark
                      ? 'rgba(10, 44, 36, 0.01)'
                      : 'rgba(10, 44, 36, 0.005)'
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
                              bgcolor: bgColor,
                              position: 'relative'
                            }}
                          >
                            {/* 15-minute interval lines */}
                            {[40, 80, 120].map((topPosition, lineIndex) => (
                              <Box
                                key={`line-${lineIndex}`}
                                sx={{
                                  position: 'absolute',
                                  top: topPosition,
                                  left: 0,
                                  right: 0,
                                  height: 0,
                                  borderTop: isDark
                                    ? '1px dashed rgba(255, 255, 255, 0.15)'
                                    : '1px dashed rgba(0, 0, 0, 0.12)',
                                  borderImageSlice: 1,
                                  borderImageRepeat: 'round',
                                  borderImageSource: isDark
                                    ? 'repeating-linear-gradient(to right, rgba(255, 255, 255, 0.15) 0, rgba(255, 255, 255, 0.15) 6px, transparent 6px, transparent 12px)'
                                    : 'repeating-linear-gradient(to right, rgba(0, 0, 0, 0.12) 0, rgba(0, 0, 0, 0.12) 6px, transparent 6px, transparent 12px)',
                                  pointerEvents: 'none'
                                }}
                              />
                            ))}
                          </Box>
                        ))}
                      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        {renderResourceColumn(resource, index)}
                      </Box>
                    </Box>
                  )
                })}

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
    </Box>
  )
}
