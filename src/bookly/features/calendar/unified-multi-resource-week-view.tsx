'use client'

import { Box, Typography, Avatar, Chip, Tooltip } from '@mui/material'
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
import type { CalendarEvent, DayOfWeek, WeeklyStaffHours } from './types'
import { useMemo } from 'react'

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

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant='caption' sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: '#fff', fontSize: '0.75rem' }}>
        {extendedProps.serviceName || event.title}
      </Typography>
      <Typography variant='caption' sx={{ display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem' }}>
        {extendedProps.customerName}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
        {/* Payment Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <i
            className={extendedProps.paymentStatus === 'paid' ? 'ri-money-dollar-circle-fill' : 'ri-money-dollar-circle-line'}
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
              extendedProps.status === 'confirmed' ? 'ri-checkbox-circle-fill' :
              extendedProps.status === 'pending' ? 'ri-time-line' :
              extendedProps.status === 'completed' ? 'ri-check-double-line' :
              extendedProps.status === 'cancelled' ? 'ri-close-circle-fill' :
              extendedProps.status === 'no_show' ? 'ri-user-unfollow-line' :
              'ri-question-line'
            }
            style={{
              fontSize: '14px',
              color:
                extendedProps.status === 'confirmed' ? '#10b981' :
                extendedProps.status === 'pending' ? '#f59e0b' :
                extendedProps.status === 'completed' ? '#3b82f6' :
                extendedProps.status === 'cancelled' ? '#ef4444' :
                extendedProps.status === 'no_show' ? '#9ca3af' :
                '#9ca3af'
            }}
          />
          <Typography variant='caption' sx={{ fontSize: '0.65rem', textTransform: 'capitalize', color: 'rgba(255,255,255,0.9)' }}>
            {extendedProps.status.replace('_', ' ')}
          </Typography>
        </Box>

        {/* Starred */}
        {extendedProps.starred && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <i className='ri-star-fill' style={{ fontSize: '14px', color: '#fbbf24' }} />
            <Typography variant='caption' sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.9)' }}>Starred</Typography>
          </Box>
        )}

        {/* Booking Method */}
        {extendedProps.selectionMethod && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <i
              className={extendedProps.selectionMethod === 'by_client' ? 'ri-smartphone-line' : 'ri-robot-line'}
              style={{ fontSize: '14px', color: '#8b5cf6' }}
            />
            <Typography variant='caption' sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.9)' }}>
              {extendedProps.selectionMethod === 'by_client' ? 'By Client' : 'Auto'}
            </Typography>
          </Box>
        )}

        {/* Walk-in Indicator */}
        {extendedProps.arrivalTime && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <i className='ri-walk-line' style={{ fontSize: '14px', color: '#ec4899' }} />
            <Typography variant='caption' sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.9)' }}>Walk-in</Typography>
          </Box>
        )}
      </Box>
      {extendedProps.notes && (
        <Typography variant='caption' sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem' }}>
          Note: {extendedProps.notes}
        </Typography>
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
  const isSearchActive = useCalendarStore(state => state.isSearchActive)
  const isEventMatchedBySearch = useCalendarStore(state => state.isEventMatchedBySearch)
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
    const selectedBranchIds = branchFilters.allBranches || branchFilters.branchIds.length === 0
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
            const workingHours = staffWorkingHours[staff.id]?.[dayOfWeek as keyof WeeklyStaffHours] as { isWorking: boolean, shifts: any[] } | undefined
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
    const allEvents = resourceType === 'staff'
      ? events.filter(event => event.extendedProps.staffId === resourceId && isSameDay(new Date(event.start), day))
      : events.filter(event => event.extendedProps.roomId === resourceId && isSameDay(new Date(event.start), day))

    // Filter out timeOff and reservation events - they'll be shown as stripes
    const regularEvents = allEvents.filter(
      event => event.extendedProps.type !== 'timeOff' && event.extendedProps.type !== 'reservation'
    )

    // STRICT CONFLICT CHECK: Filter out events overlapping with Time Off
    if (resourceType === 'staff') {
      const timeOffEvents = events.filter(
        e => e.extendedProps.type === 'timeOff' && e.extendedProps.staffId === resourceId && isSameDay(new Date(e.start), day)
      )

      if (timeOffEvents.length > 0) {
        return regularEvents.filter(event => {
          const eventStart = new Date(event.start)
          const eventEnd = new Date(event.end)
          const eventStartMins = eventStart.getHours() * 60 + eventStart.getMinutes()
          const eventEndMins = eventEnd.getHours() * 60 + eventEnd.getMinutes()

          const hasConflict = timeOffEvents.some(timeOff => {
             const toStart = new Date(timeOff.start)
             const toEnd = new Date(timeOff.end)
             
             // Handle ALL DAY: Check if dates overlap
             if (timeOff.extendedProps.allDay) {
                const toStartDay = new Date(toStart.getFullYear(), toStart.getMonth(), toStart.getDate())
                const toEndDay = new Date(toEnd.getFullYear(), toEnd.getMonth(), toEnd.getDate())
                const currentDay = new Date(day.getFullYear(), day.getMonth(), day.getDate())
                return currentDay >= toStartDay && currentDay <= toEndDay
             }

             // Strict time check for partial days
             const toStartMins = toStart.getHours() * 60 + toStart.getMinutes()
             const toEndMins = toEnd.getHours() * 60 + toEnd.getMinutes()

             return eventStartMins < toEndMins && eventEndMins > toStartMins
          })

          return !hasConflict
        })
      }
    }

    return regularEvents
  }

  // Check if staff is working on a given day
  const isStaffWorking = (staffId: string, day: Date) => {
    const { staffWorkingHours } = useStaffManagementStore.getState()
    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = dayNames[day.getDay()] as DayOfWeek
    const workingHours = staffWorkingHours[staffId]?.[dayOfWeek as keyof WeeklyStaffHours] as { isWorking: boolean, shifts: any[] } | undefined

    return workingHours?.isWorking && workingHours.shifts && workingHours.shifts.length > 0
  }

  // Check if staff has time-off on a given day - ONLY if it covers the whole day or working hours
  const hasStaffTimeOff = (staffId: string, day: Date) => {
    return events.some(event => {
      if (event.extendedProps.type !== 'timeOff' || event.extendedProps.staffId !== staffId)
        return false
      if (!isSameDay(new Date(event.start), day)) return false

      // Rule: Show only if "All Day" OR covers the entire working hours
      if (event.extendedProps.allDay) return true

      const { staffWorkingHours } = useStaffManagementStore.getState()
      const dayNames: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayOfWeek = dayNames[day.getDay()] as DayOfWeek
      const workingHours = staffWorkingHours[staffId]?.[dayOfWeek as keyof WeeklyStaffHours] as { isWorking: boolean, shifts: any[] } | undefined

      // If no working hours defined or not working, simple overlap counts as "whole day" conceptually for display
      if (
        !workingHours ||
        !workingHours.isWorking ||
        !workingHours.shifts ||
        workingHours.shifts.length === 0
      ) {
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
              <i
                className='ri-tools-line'
                style={{ color: 'var(--mui-palette-common-white)', fontSize: 18 }}
              />
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
                  : isRoom
                    ? isDark
                      ? 'rgba(10, 44, 36, 0.02)'
                      : 'rgba(10, 44, 36, 0.01)'
                    : 'transparent'
                // cursor: 'pointer', // Disabled - only slots/bookings are clickable
                // transition: 'background-color 0.15s',
                // '&:hover': { // Disabled - only slots/bookings are clickable
                //   bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                // }
              }}
              // onClick disabled - only slots/bookings are clickable
              // onClick={() => onCellClick?.(resource.id, resource.type, day)}
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
                    ? isDark ? 'rgba(10, 44, 36, 0.4)' : 'rgba(10, 44, 36, 0.25)' // Solid Teal
                    : hasStaffTimeOff(resource.id, day)
                      ? isDark ? 'rgba(232, 134, 130, 0.25)' : 'rgba(232, 134, 130, 0.2)' // Solid Coral
                      : isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)' // Solid Non-Working
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

              {/* Events */}
              {dayEvents.map(event => {
                const colors = buildEventColors(colorScheme, event.extendedProps.status)
                const isStaticType = isStaff
                  ? resource.staffType === 'static'
                  : resource.roomType === 'static' || resource.roomType === 'fixed'

                // Search highlighting - check if event matches search
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
                const stripeColor = adjustColorOpacity(effectiveBorderColor, isFaded ? 0.2 : 0.35)

                return (
                  <Tooltip
                    key={event.id}
                    title={renderEventTooltip(event)}
                    arrow
                    placement="top"
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
                      backgroundImage: isStaticType
                        ? `radial-gradient(${stripeColor} 1px, transparent 1px)` // Dots for static slots
                        : 'none',
                      backgroundSize: isStaticType ? '12px 12px' : 'auto',
                      borderStyle: isStaticType ? 'dashed' : 'solid',
                      borderWidth: isStaticType ? '2px' : '0 0 0 4px',
                      borderColor: isStaticType ? stripeColor : effectiveBorderColor,
                      opacity: isFaded ? 0.4 : 1,
                      filter: isFaded ? 'grayscale(50%)' : 'none',
                      overflow: 'visible',
                      boxShadow: isHighlighted
                        ? '0px 0px 0px 3px rgba(10, 44, 36, 0.5), 0px 4px 12px rgba(0,0,0,0.15)'
                        : isStaticType
                          ? 'none'
                          : '0px 2px 8px rgba(0,0,0,0.06)',
                      transform: 'none',
                      zIndex: isHighlighted ? 5 : 'auto',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: isHighlighted
                          ? '0px 0px 0px 3px rgba(10, 44, 36, 0.7), 0px 6px 16px rgba(0,0,0,0.2)'
                          : isStaticType
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

                      // Extract slotId and time info for capacity calculation
                      const slotId = event.extendedProps?.slotId
                      const eventStartTime = format(new Date(event.start), 'HH:mm')
                      const eventEndTime = format(new Date(event.end), 'HH:mm')

                      // This prevents showing "2/1" multiple times when there are multiple bookings
                      if (slotId) {
                        // If has slotId, only show on first event of that slot
                        const slotEventsInDay = dayEvents.filter(e => e.extendedProps?.slotId === slotId)
                        const isFirstEventInSlot = slotEventsInDay[0]?.id === event.id
                        if (!isFirstEventInSlot) {
                          return null
                        }
                      } else {
                        // If no slotId, show chip only on first event within the same time slot
                        const sameTimeSlotEvents = dayEvents.filter(e => {
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
                        <Box sx={{ mt: 0.25 }}>
                          <Chip
                            icon={<i className='ri-user-line' style={{ fontSize: '0.6rem' }} />}
                            label={`${bookedCount}/${totalCapacity}`}
                            color='default' // Use default to allow custom bgcolor override
                            size='small'
                            sx={{
                              height: '14px',
                              fontSize: '0.55rem',
                              fontWeight: 700,
                              bgcolor: 
                                chipColor === 'success' ? (isDark ? '#1b5e20' : '#2e7d32') : 
                                chipColor === 'warning' ? (isDark ? '#e65100' : '#ef6c00') : 
                                (isDark ? '#b71c1c' : '#c62828'),
                              color: '#fff', // Always white text for contrast on dark background
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
                      )
                    })()}
                  </Box>
                  </Tooltip>
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
                  bgcolor: isToday(day) ? (isDark ? 'rgba(10, 44, 36, 0.08)' : 'rgba(10, 44, 36, 0.08)') : 'transparent'
                  // cursor: 'pointer', // Disabled - only slots/bookings are clickable
                  // transition: 'background-color 0.2s',
                  // '&:hover': { // Disabled - only slots/bookings are clickable
                  //   bgcolor: isDark ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.12)'
                  // }
                }}
                // onClick disabled - only slots/bookings are clickable
                // onClick={() => onDateClick?.(day)}
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
                    bgcolor: isDark ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.1)',
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
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
