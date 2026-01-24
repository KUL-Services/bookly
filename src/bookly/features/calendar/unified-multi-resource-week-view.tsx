'use client'

import { Box, Typography, Avatar, Chip, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isPast, startOfDay } from 'date-fns'
import { mockStaff, mockServices, mockBookings } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from '../staff-management/staff-store'
import { useCalendarStore } from './state'
import {
  getBranchName,
  getBranchHours,
  buildEventColors,
  groupStaffByType,
  groupStaffByTypeAndAssignment,
  categorizeRooms,
  getStaffAvailableCapacity,
  getCapacityColor,
  getDynamicRoomAvailability
} from './utils'
import type { CalendarEvent, DayOfWeek, WeeklyStaffHours } from './types'
import { useMemo } from 'react'

import { BrandWatermark } from '@/bookly/components/atoms/brand-watermark'

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

  // Get week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Group all resources (staff and rooms) by branch with filtering
  const resourcesByBranch = useMemo(() => {
    const grouped: Record<string, any[]> = {}

    // Determine which branches to show
    const selectedBranchIds =
      branchFilters.allBranches || branchFilters.branchIds.length === 0
        ? Array.from(new Set([...mockStaff.map(s => s.branchId || '1-1'), ...rooms.map(r => r.branchId || '1-1')]))
        : branchFilters.branchIds

    selectedBranchIds.forEach(branchId => {
      // Filter staff for this branch
      let filteredStaff = mockStaff.filter(staff => (staff.branchId || '1-1') === branchId)

      // Apply staff filters
      if (staffFilters.onlyMe) {
        filteredStaff = filteredStaff.filter(staff => staff.id === '1')
      } else if (staffFilters.staffIds.length > 0) {
        filteredStaff = filteredStaff.filter(staff => staffFilters.staffIds.includes(staff.id))
      }

      // Apply workingStaffOnly filter (check if staff works on ANY day of the week)
      if (staffFilters.workingStaffOnly) {
        filteredStaff = filteredStaff.filter(staff => {
          const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          return weekDays.some(day => {
            const dayOfWeek = dayNames[day.getDay()] as DayOfWeek
            const workingHours = staffWorkingHours[staff.id]?.[dayOfWeek as keyof WeeklyStaffHours] as
              | { isWorking: boolean; shifts: any[] }
              | undefined
            return workingHours?.isWorking && workingHours.shifts && workingHours.shifts.length > 0
          })
        })
      }

      // Filter rooms for this branch
      let filteredRooms = rooms.filter(room => (room.branchId || '1-1') === branchId)

      // Apply room filters
      if (!roomFilters.allRooms && roomFilters.roomIds.length > 0) {
        filteredRooms = filteredRooms.filter(room => roomFilters.roomIds.includes(room.id))
      }

      // Add filtered staff
      if (!grouped[branchId]) {
        grouped[branchId] = []
      }
      filteredStaff.forEach(staff => {
        grouped[branchId].push({ ...staff, type: 'staff' as const })
      })

      // Add filtered rooms
      filteredRooms.forEach(room => {
        grouped[branchId].push({ ...room, type: 'room' as const })
      })
    })

    return grouped
  }, [rooms, branchFilters, staffFilters, roomFilters, weekDays, staffWorkingHours])

  // Get events for a specific resource and day
  const getResourceDayEvents = (resourceId: string, resourceType: 'staff' | 'room', day: Date) => {
    const allEvents =
      resourceType === 'staff'
        ? events.filter(event => event.extendedProps.staffId === resourceId && isSameDay(new Date(event.start), day))
        : events.filter(event => event.extendedProps.roomId === resourceId && isSameDay(new Date(event.start), day))

    // Filter out timeOff and reservation events - they'll be shown as overlays
    // Note: We no longer filter out bookings during time-off periods -
    // time-off is displayed as a background overlay, and bookings remain visible
    const regularEvents = allEvents.filter(
      event => event.extendedProps.type !== 'timeOff' && event.extendedProps.type !== 'reservation'
    )

    return regularEvents
  }

  // Check if staff is working on a given day
  const isStaffWorking = (staffId: string, day: Date) => {
    const { staffWorkingHours } = useStaffManagementStore.getState()
    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = dayNames[day.getDay()] as DayOfWeek
    const workingHours = staffWorkingHours[staffId]?.[dayOfWeek as keyof WeeklyStaffHours] as
      | { isWorking: boolean; shifts: any[] }
      | undefined

    return workingHours?.isWorking && workingHours.shifts && workingHours.shifts.length > 0
  }

  // Check if staff has time-off on a given day - ONLY if it covers the whole day or working hours
  const hasStaffTimeOff = (staffId: string, day: Date) => {
    return events.some(event => {
      if (event.extendedProps.type !== 'timeOff' || event.extendedProps.staffId !== staffId) return false
      if (!isSameDay(new Date(event.start), day)) return false

      // Rule: Show only if "All Day" OR covers the entire working hours
      if (event.extendedProps.allDay) return true

      const { staffWorkingHours } = useStaffManagementStore.getState()
      const dayNames: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
      ]
      const dayOfWeek = dayNames[day.getDay()] as DayOfWeek
      const workingHours = staffWorkingHours[staffId]?.[dayOfWeek as keyof WeeklyStaffHours] as
        | { isWorking: boolean; shifts: any[] }
        | undefined

      // If no working hours defined or not working, simple overlap counts as "whole day" conceptually for display
      if (!workingHours || !workingHours.isWorking || !workingHours.shifts || workingHours.shifts.length === 0) {
        return true
      }

      // Check if time off covers all shifts
      // Simplified check: Time Off Start <= First Shift Start AND Time Off End >= Last Shift End
      // Note: This assumes time off is continuous. If multiple shifts, this ensures it covers the span.
      const shifts = workingHours.shifts
      if (shifts.length === 0) return true

      // Find earliest start and latest end of shifts
      let earliestStart = 24 * 60 // minutes
      let latestEnd = 0 // minutes

      shifts.forEach((shift: { start: string; end: string }) => {
        const [sH, sM] = shift.start.split(':').map(Number)
        const [eH, eM] = shift.end.split(':').map(Number)
        const startMins = sH * 60 + sM
        const endMins = eH * 60 + eM
        if (startMins < earliestStart) earliestStart = startMins
        if (endMins > latestEnd) latestEnd = endMins
      })

      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const eventStartMins = eventStart.getHours() * 60 + eventStart.getMinutes()
      const eventEndMins = eventEnd.getHours() * 60 + eventEnd.getMinutes()

      // Allow 15 min buffer/tolerance if needed, but strict check for now
      return eventStartMins <= earliestStart && eventEndMins >= latestEnd
    })
  }

  const hasResourceReservation = (resourceId: string, resourceType: 'staff' | 'room', day: Date) => {
    return events.some(event => {
      if (event.extendedProps.type !== 'reservation') return false
      if (!isSameDay(new Date(event.start), day)) return false
      return resourceType === 'staff'
        ? event.extendedProps.staffId === resourceId
        : event.extendedProps.roomId === resourceId
    })
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
        {/* NOTE: Staff/room click disabled - only slots/bookings are clickable */}
        <Box
          sx={{
            p: 2,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            // cursor: 'pointer', // Disabled - only slots/bookings are clickable
            bgcolor: isRoom ? (isDark ? 'rgba(10, 44, 36, 0.05)' : 'rgba(10, 44, 36, 0.02)') : 'transparent'
            // '&:hover': { // Disabled - only slots/bookings are clickable
            //   bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
            // }
          }}
          // onClick disabled - only slots/bookings are clickable
          // onClick={() => {
          //   if (isStaff && onStaffClick) {
          //     onStaffClick(resource.id)
          //   } else if (isRoom && onRoomClick) {
          //     onRoomClick(resource.id)
          //   }
          // }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: isStaff ? 'primary.main' : 'success.main',
              color: 'common.white',
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
              <i className='ri-tools-line' style={{ color: 'var(--mui-palette-common-white)', fontSize: 18 }} />
            )}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='body2' fontWeight={600} noWrap>
              {resource.name}
            </Typography>
          </Box>
        </Box>

        {/* Day cells */}
        {weekDays.map(day => {
          const dayEvents = getResourceDayEvents(resource.id, resource.type, day)
          const roomAssignment = isStaff ? getStaffRoomAssignment(resource.id, day) : null

          const showNonWorkingStripes = isStaff && !isStaffWorking(resource.id, day)
          const showTimeOffStripes = isStaff && hasStaffTimeOff(resource.id, day)
          const showReservationStripes = hasResourceReservation(resource.id, resource.type, day)

          // Check if this day is in the past
          const dayIsPast = isPast(startOfDay(day)) && !isToday(day)

          // Determine if this is a static/fixed resource OR if events have static slot properties
          // Check resource type first
          let isStaticType = isStaff
            ? resource.staffType === 'static'
            : resource.roomType === 'static' || resource.roomType === 'fixed'

          // Also check if events themselves indicate static slots:
          // - Events with slotId are from static scheduling
          // - Events linked to a static room should be consolidated
          if (!isStaticType && dayEvents.length > 0) {
            const hasStaticSlotEvents = dayEvents.some(event => {
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

          // For static resources, consolidate events by slotId to avoid showing multiple overlapping cards
          let consolidatedEvents: Array<{
            event: CalendarEvent
            isConsolidated: boolean
            bookingCount: number
            totalCapacity: number
            allEvents: CalendarEvent[]
          }> = []

          if (isStaticType) {
            // Group events by slotId
            const slotGroups = new Map<string, CalendarEvent[]>()
            dayEvents.forEach(event => {
              const slotId = event.extendedProps?.slotId || `time-${format(event.start, 'HHmm')}`
              if (!slotGroups.has(slotId)) {
                slotGroups.set(slotId, [])
              }
              slotGroups.get(slotId)!.push(event)
            })

            // Create consolidated entries
            slotGroups.forEach((slotEvents, slotId) => {
              const firstEvent = slotEvents[0]
              const activeBookings = slotEvents.filter(e => e.extendedProps?.status !== 'cancelled')
              const staticSlot = staticSlots.find(s => s.id === firstEvent.extendedProps?.slotId)
              consolidatedEvents.push({
                event: firstEvent,
                isConsolidated: true,
                bookingCount: activeBookings.length,
                totalCapacity: staticSlot?.capacity || activeBookings.length,
                allEvents: slotEvents
              })
            })
          } else {
            // For dynamic resources, keep individual events
            consolidatedEvents = dayEvents.map(event => ({
              event,
              isConsolidated: false,
              bookingCount: 1,
              totalCapacity: 1,
              allEvents: [event]
            }))
          }

          // Limit visible events to 2, show overflow count
          const maxVisibleEvents = 2
          const visibleEvents = consolidatedEvents.slice(0, maxVisibleEvents)
          const overflowCount = consolidatedEvents.length - maxVisibleEvents

          // NOTE: Cell click disabled - only slots/bookings are clickable
          return (
            <Box
              key={day.toISOString()}
              sx={{
                p: 1,
                borderRight: 1,
                borderColor: 'divider',
                position: 'relative',
                bgcolor: isToday(day)
                  ? isDark
                    ? 'rgba(10, 44, 36, 0.05)'
                    : 'rgba(10, 44, 36, 0.05)'
                  : dayIsPast
                    ? isDark
                      ? 'rgba(0, 0, 0, 0.12)'
                      : 'rgba(0, 0, 0, 0.03)'
                    : isRoom
                      ? isDark
                        ? 'rgba(10, 44, 36, 0.02)'
                        : 'rgba(10, 44, 36, 0.01)'
                      : 'transparent',
                opacity: dayIsPast ? 0.65 : 1
              }}
            >
              {/* Non-working hours or time-off overlay (diagonal stripes) */}
              {(showNonWorkingStripes || showTimeOffStripes || showReservationStripes) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 1,
                    backgroundImage: showReservationStripes
                      ? isDark // Reservation: Solid (remove stripes in week view as requested)
                        ? 'none'
                        : 'none'
                      : hasStaffTimeOff(resource.id, day) // Time Off: Solid (remove stripes in week view as requested)
                        ? 'none'
                        : isDark // Default non-working hours: Solid
                          ? 'none'
                          : 'none',
                    backgroundColor: showReservationStripes
                      ? isDark
                        ? 'rgba(10, 44, 36, 0.4)'
                        : 'rgba(10, 44, 36, 0.25)' // Solid Teal
                      : hasStaffTimeOff(resource.id, day)
                        ? isDark
                          ? 'rgba(232, 134, 130, 0.25)'
                          : 'rgba(232, 134, 130, 0.2)' // Solid Coral
                        : isDark
                          ? 'rgba(0, 0, 0, 0.2)'
                          : 'rgba(0, 0, 0, 0.04)' // Solid Non-Working
                  }}
                />
              )}
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

              {/* Events - Limited to show max 2, with overflow count */}
              {visibleEvents.map(({ event, isConsolidated, bookingCount, totalCapacity, allEvents: slotEvents }) => {
                const colors = buildEventColors(colorScheme, isConsolidated ? 'confirmed' : event.extendedProps.status)

                // Search highlighting - check if event (or any in slot) matches search
                const isMatchedBySearch = isConsolidated
                  ? slotEvents.some(e => isEventMatchedBySearch(e.id))
                  : isEventMatchedBySearch(event.id)
                const isFaded = isSearchActive && !isMatchedBySearch
                const isHighlighted = isSearchActive && isMatchedBySearch

                const effectiveBorderColor = isFaded ? adjustColorOpacity(colors.border, 0.3) : colors.border
                const baseFillOpacity = isDark ? 0.22 : 0.16
                const effectiveBgColor = adjustColorOpacity(
                  effectiveBorderColor,
                  isFaded ? baseFillOpacity * 0.6 : baseFillOpacity
                )
                const baseTextColor = theme.palette.text.primary
                const effectiveTextColor = isFaded
                  ? adjustColorOpacity(baseTextColor, isDark ? 0.5 : 0.6)
                  : baseTextColor
                const stripeColor = adjustColorOpacity(effectiveBorderColor, isFaded ? 0.2 : 0.35)

                return (
                  <Tooltip
                    key={event.id}
                    title={
                      isConsolidated ? (
                        <Box sx={{ p: 1, minWidth: 200 }}>
                          <Typography
                            variant='caption'
                            sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: '#fff' }}
                          >
                            {event.extendedProps?.serviceName || event.title}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{ display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.85)' }}
                          >
                            {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{ display: 'block', mb: 0.75, color: 'rgba(255,255,255,0.9)' }}
                          >
                            {bookingCount} / {totalCapacity} booked
                          </Typography>
                          {slotEvents.filter(e => e.extendedProps?.status !== 'cancelled').length > 0 && (
                            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', pt: 0.75 }}>
                              <Typography
                                variant='caption'
                                sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}
                              >
                                Clients:{' '}
                                {slotEvents
                                  .filter(e => e.extendedProps?.status !== 'cancelled')
                                  .slice(0, 5)
                                  .map(e => e.extendedProps?.customerName || 'Client')
                                  .join(', ')}
                                {slotEvents.filter(e => e.extendedProps?.status !== 'cancelled').length > 5 &&
                                  ` +${slotEvents.filter(e => e.extendedProps?.status !== 'cancelled').length - 5} more`}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        renderEventTooltip(event)
                      )
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
                        onEventClick?.(event)
                      }}
                      sx={{
                        mb: 0.5,
                        p: 0.6,
                        minHeight: 50,
                        bgcolor: effectiveBgColor,
                        borderRadius: 1.5,
                        backgroundImage: isConsolidated
                          ? `radial-gradient(${stripeColor} 1px, transparent 1px)` // Dots for static slots
                          : 'none',
                        backgroundSize: isConsolidated ? '12px 12px' : 'auto',
                        borderStyle: isConsolidated ? 'dashed' : 'solid',
                        borderWidth: isConsolidated ? '2px' : '0 0 0 4px',
                        borderColor: isConsolidated ? stripeColor : effectiveBorderColor,
                        opacity: isFaded ? 0.4 : 1,
                        filter: isFaded ? 'grayscale(50%)' : 'none',
                        overflow: 'visible',
                        boxShadow: isHighlighted
                          ? '0px 0px 0px 3px rgba(10, 44, 36, 0.5), 0px 4px 12px rgba(0,0,0,0.15)'
                          : isConsolidated
                            ? 'none'
                            : '0px 2px 8px rgba(0,0,0,0.06)',
                        transform: 'none',
                        zIndex: isHighlighted ? 5 : 'auto',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: isHighlighted
                            ? '0px 0px 0px 3px rgba(10, 44, 36, 0.7), 0px 6px 16px rgba(0,0,0,0.2)'
                            : isConsolidated
                              ? 'none'
                              : '0px 4px 12px rgba(0,0,0,0.1)',
                          transform: isHighlighted ? 'translateY(-2px)' : 'translateY(-2px)',
                          zIndex: 10,
                          opacity: isFaded ? 0.6 : 1
                        }
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{
                          fontSize: '0.65rem',
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
                                width: 5,
                                height: 5,
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
                            opacity: isFaded ? 0.5 : 0.8
                          }}
                          noWrap
                        >
                          {isConsolidated
                            ? event.extendedProps?.serviceName || event.title
                            : event.extendedProps?.customerName || event.extendedProps?.serviceName || event.title}
                        </Typography>
                      </Box>

                      {/* Search matched fields indicator */}
                      {isSearchActive &&
                        isHighlighted &&
                        (() => {
                          const matchedFields = getSearchMatchedFields(event.id)
                          if (matchedFields.length === 0) return null
                          return (
                            <Typography
                              variant='caption'
                              sx={{ fontSize: '0.5rem', color: 'primary.main', fontWeight: 600, mt: 0.25 }}
                            >
                              Match: {matchedFields.join(', ')}
                            </Typography>
                          )
                        })()}

                      {/* Capacity Display - For consolidated (static) events, show capacity chip */}
                      {isConsolidated && (
                        <Box sx={{ mt: 0.25 }}>
                          <Chip
                            icon={<i className='ri-user-line' style={{ fontSize: '0.6rem' }} />}
                            label={`${bookingCount}/${totalCapacity}`}
                            size='small'
                            sx={{
                              height: '14px',
                              fontSize: '0.55rem',
                              fontWeight: 700,
                              bgcolor:
                                bookingCount >= totalCapacity
                                  ? isDark
                                    ? '#b71c1c'
                                    : '#c62828'
                                  : bookingCount >= totalCapacity * 0.7
                                    ? isDark
                                      ? '#e65100'
                                      : '#ef6c00'
                                    : isDark
                                      ? '#1b5e20'
                                      : '#2e7d32',
                              color: '#fff',
                              '& .MuiChip-icon': {
                                fontSize: '0.6rem',
                                marginLeft: '2px',
                                color: 'inherit'
                              },
                              '& .MuiChip-label': {
                                padding: '0 3px'
                              }
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                )
              })}

              {/* Overflow indicator - shows "+X more" when there are more than 2 events */}
              {overflowCount > 0 && (
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant='caption' sx={{ fontWeight: 600, color: '#fff' }}>
                        {overflowCount} more {isStaticType ? 'slot' : 'booking'}
                        {overflowCount > 1 ? 's' : ''}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {consolidatedEvents.slice(maxVisibleEvents).map((item, idx) => (
                          <Typography
                            key={idx}
                            variant='caption'
                            sx={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem' }}
                          >
                            • {format(item.event.start, 'h:mm a')} -{' '}
                            {item.event.extendedProps?.serviceName || item.event.title}
                            {item.isConsolidated && ` (${item.bookingCount}/${item.totalCapacity})`}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  }
                  arrow
                  placement='top'
                >
                  <Box
                    onClick={e => {
                      e.stopPropagation()
                      onDateClick?.(day)
                    }}
                    sx={{
                      mt: 0.5,
                      p: 0.5,
                      bgcolor: isDark ? 'rgba(10, 44, 36, 0.15)' : 'rgba(10, 44, 36, 0.1)',
                      borderRadius: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(10, 44, 36, 0.25)' : 'rgba(10, 44, 36, 0.15)'
                      }
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      +{overflowCount} more
                    </Typography>
                  </Box>
                </Tooltip>
              )}

              {/* Empty state */}
              {consolidatedEvents.length === 0 && !roomAssignment && (
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
          WebkitOverflowScrolling: 'touch',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            minWidth: { xs: `${220 + weekDays.length * 120}px`, md: '100%' },
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            position: 'relative'
          }}
        >
          {/* Brand Watermark - Inside scrollable content */}
          <BrandWatermark position='bottom-right' size={500} offsetX={-50} offsetY={50} rotate={-20} />

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
            {weekDays.map(day => {
              const dayIsPast = isPast(startOfDay(day)) && !isToday(day)
              return (
                <Box
                  key={day.toISOString()}
                  sx={{
                    p: 2,
                    borderRight: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: isToday(day)
                      ? isDark
                        ? 'rgba(10, 44, 36, 0.08)'
                        : 'rgba(10, 44, 36, 0.08)'
                      : dayIsPast
                        ? isDark
                          ? 'rgba(0, 0, 0, 0.15)'
                          : 'rgba(0, 0, 0, 0.04)'
                        : 'transparent',
                    opacity: dayIsPast ? 0.7 : 1,
                    position: 'relative'
                  }}
                >
                  {/* Past day indicator dash */}
                  {dayIsPast && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 12,
                        height: 2,
                        bgcolor: 'text.disabled',
                        borderRadius: 1
                      }}
                    />
                  )}
                  <Typography
                    variant='caption'
                    fontWeight={500}
                    sx={{ color: dayIsPast ? 'text.disabled' : 'text.secondary' }}
                  >
                    {format(day, 'EEE')}
                  </Typography>
                  <Typography
                    variant='h6'
                    fontWeight={600}
                    sx={{
                      color: isToday(day) ? 'primary.main' : dayIsPast ? 'text.disabled' : 'text.primary'
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          {/* Branch Sections */}
          {Object.entries(resourcesByBranch).map(([branchId, resources], branchIndex) => {
            const branchName = getBranchName(branchId)
            return (
              <Box key={`branch-${branchId}`}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: `220px repeat(${weekDays.length}, 120px)`,
                      md: `220px repeat(${weekDays.length}, 1fr)`
                    },
                    bgcolor: isDark ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.1)',
                    borderBottom: 1,
                    borderColor: 'divider'
                  }}
                >
                  {/* Branch name column */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      borderRight: 1,
                      borderColor: 'divider'
                    }}
                  >
                    <i className='ri-building-line' style={{ fontSize: 14, color: isDark ? '#77b6a3' : '#0a2c24' }} />
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

                  {/* Business hours for each day */}
                  {weekDays.map(day => {
                    const branchHours = getBranchHours(branchId, day)
                    const isClosed = branchHours === 'Closed'
                    return (
                      <Box
                        key={`${branchId}-${day.toISOString()}`}
                        sx={{
                          px: 1,
                          py: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRight: 1,
                          borderColor: 'divider',
                          bgcolor: isClosed ? (isDark ? 'rgba(255,0,0,0.05)' : 'rgba(255,0,0,0.03)') : 'transparent'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <i
                            className='ri-time-line'
                            style={{
                              fontSize: 11,
                              opacity: 0.6,
                              color: isClosed ? (isDark ? '#ff6b6b' : '#d32f2f') : 'inherit'
                            }}
                          />
                          <Typography
                            variant='caption'
                            sx={{
                              fontSize: '0.65rem',
                              opacity: isClosed ? 0.9 : 0.75,
                              color: isClosed ? (isDark ? '#ff6b6b' : '#d32f2f') : 'text.secondary',
                              fontWeight: isClosed ? 600 : 400
                            }}
                          >
                            {branchHours}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  })}
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
