'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Button,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Menu,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { useStaffManagementStore } from './staff-store'
import { CalendarPopover } from './calendar-popover'
import { RoomEditorDrawer } from './room-editor-drawer'
import { RoomScheduleEditor } from './room-schedule-editor'
import { StaffTypeChangeDialog } from './staff-type-change-dialog'
import type { DayOfWeek } from '../calendar/types'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function RoomsTab() {
  const [viewMode, setViewMode] = useState('Day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null)
  const [isRoomEditorOpen, setIsRoomEditorOpen] = useState(false)
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<any>(null)
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false)
  const [scheduleEditorContext, setScheduleEditorContext] = useState<{
    roomId: string
    roomName: string
    dayOfWeek: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
    initialShift?: { start: string; end: string; serviceIds: string[] } | null
    roomType?: 'dynamic' | 'static'
    defaultCapacity?: number
  } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; name: string } | null>(null)
  const [roomMenuAnchor, setRoomMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedRoomForMenu, setSelectedRoomForMenu] = useState<any>(null)
  const [isRoomTypeChangeDialogOpen, setIsRoomTypeChangeDialogOpen] = useState(false)
  const [roomTypeChangeContext, setRoomTypeChangeContext] = useState<{
    roomId: string
    roomName: string
    currentType: 'dynamic' | 'static'
    targetType: 'dynamic' | 'static'
  } | null>(null)
  const [isChangingMode, setIsChangingMode] = useState(false)
  const [modeChangeError, setModeChangeError] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [roomToCancel, setRoomToCancel] = useState<{ id: string; name: string } | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const calendarOpen = Boolean(calendarAnchor)
  const roomMenuOpen = Boolean(roomMenuAnchor)

  const {
    rooms,
    apiBranches,
    apiServices,
    getRoomsForBranch,
    getRoomSchedule,
    deleteRoom,
    updateRoomType,
    cancelRoomBookingModeTransition,
    getBusinessHours,
    fetchResourcesFromApi,
    fetchServicesFromApi,
    fetchBranchesFromApi,
    fetchSchedulesFromApi
  } = useStaffManagementStore()

  // Fetch data on mount
  useEffect(() => {
    fetchResourcesFromApi()
    fetchServicesFromApi()
    fetchBranchesFromApi()
    fetchSchedulesFromApi()
  }, []) // Re-fetch schedules when date changes (week changes)

  // Helper functions to access store data (mirrored from ShiftsTab)
  const getBusinessHoursForDay = (day: DayOfWeek) => {
    // Use selectedBranch if set to a specific one, otherwise use the first known branch or a default '1-1'
    const targetBranchId =
      selectedBranch === 'all' ? (apiBranches.length > 0 ? apiBranches[0].id : '1-1') : selectedBranch
    const hours = getBusinessHours(targetBranchId, day)

    // Safety check just in case store isn't fully hydrated yet
    if (!hours) {
      return { isOpen: true, shifts: [{ start: '09:00', end: '17:00' }] }
    }
    return hours
  }

  const getBusinessHoursRange = (dayOfWeek: DayOfWeek): { start: number; end: number } => {
    let minStart = 24 * 60
    let maxEnd = 0
    let foundAnyHours = false

    const branchesToCheck =
      selectedBranch === 'all' ? (apiBranches.length > 0 ? apiBranches : [{ id: '1-1' }]) : [{ id: selectedBranch }]

    branchesToCheck.forEach(branch => {
      const businessHours = getBusinessHours(branch.id, dayOfWeek)

      if (businessHours && businessHours.isOpen && businessHours.shifts && businessHours.shifts.length > 0) {
        foundAnyHours = true
        businessHours.shifts.forEach((shift: any) => {
          const [sH, sM] = shift.start.split(':').map(Number)
          const [eH, eM] = shift.end.split(':').map(Number)
          minStart = Math.min(minStart, sH * 60 + sM)
          maxEnd = Math.max(maxEnd, eH * 60 + eM)
        })
      }
    })

    if (!foundAnyHours) {
      return { start: 9 * 60, end: 17 * 60 }
    }

    return {
      start: minStart,
      end: maxEnd
    }
  }

  const generateTimelineHours = (dayOfWeek: DayOfWeek): string[] => {
    const { start, end } = getBusinessHoursRange(dayOfWeek)

    const startHour = Math.floor(start / 60)
    const endHour = Math.ceil(end / 60)

    const hours: string[] = []

    for (let hour = startHour; hour <= endHour; hour++) {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const period = hour >= 12 ? 'PM' : 'AM'
      hours.push(`${displayHour}:00 ${period}`)
    }

    return hours
  }

  const timeToPosition = (time: string, dayOfWeek: DayOfWeek): number => {
    const [hourStr, period] = time.split(' ')
    let [hours, minutes = 0] = hourStr.split(':').map(Number)

    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    const totalMinutes = hours * 60 + minutes
    const { start: startMinutes, end: endMinutes } = getBusinessHoursRange(dayOfWeek)

    if (endMinutes === startMinutes) return 0

    return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
  }

  const calculateWidth = (start: string, end: string, dayOfWeek: DayOfWeek): number => {
    const startPos = timeToPosition(start, dayOfWeek)
    const endPos = timeToPosition(end, dayOfWeek)
    return endPos - startPos
  }

  // Filter rooms by branch
  const displayRooms = selectedBranch === 'all' ? rooms : getRoomsForBranch(selectedBranch)

  // Group rooms by branch
  const roomsByBranch = useMemo(() => {
    const grouped: Record<string, typeof rooms> = {}

    displayRooms.forEach(room => {
      if (!grouped[room.branchId]) grouped[room.branchId] = []
      grouped[room.branchId].push(room)
    })

    // Sort rooms within each branch by name
    Object.keys(grouped).forEach(branchId => {
      grouped[branchId].sort((a, b) => a.name.localeCompare(b.name))
    })

    return grouped
  }, [displayRooms])

  const handlePrevPeriod = () => {
    if (viewMode === 'Week') {
      setSelectedDate(subWeeks(selectedDate, 1))
    } else {
      setSelectedDate(subDays(selectedDate, 1))
    }
  }

  const handleNextPeriod = () => {
    if (viewMode === 'Week') {
      setSelectedDate(addWeeks(selectedDate, 1))
    } else {
      setSelectedDate(addDays(selectedDate, 1))
    }
  }

  const handleOpenCalendar = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchor(event.currentTarget)
  }

  const handleCloseCalendar = () => {
    setCalendarAnchor(null)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    handleCloseCalendar()
  }

  const handleJumpWeek = (weeks: number) => {
    setSelectedDate(addWeeks(selectedDate, weeks))
  }

  const handleEditRoom = (room: any) => {
    setSelectedRoomForEdit(room)
    setIsRoomEditorOpen(true)
  }

  const handleAddRoom = () => {
    setSelectedRoomForEdit(null)
    setIsRoomEditorOpen(true)
  }

  const handleCloseRoomEditor = () => {
    setIsRoomEditorOpen(false)
    setSelectedRoomForEdit(null)
  }

  const handleEditShift = (
    room: any,
    shift: any | null,
    dayOfWeek: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
  ) => {
    setScheduleEditorContext({
      roomId: room.id,
      roomName: room.name,
      dayOfWeek,
      initialShift: shift,
      roomType: room.roomType || 'dynamic',
      defaultCapacity: room.capacity || 10
    })
    setIsScheduleEditorOpen(true)
  }

  const handleCloseScheduleEditor = () => {
    setIsScheduleEditorOpen(false)
    setScheduleEditorContext(null)
  }

  const handleDeleteClick = (room: { id: string; name: string }) => {
    setRoomToDelete(room)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (roomToDelete) {
      deleteRoom(roomToDelete.id)
      setDeleteDialogOpen(false)
      setRoomToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setRoomToDelete(null)
  }

  const handleOpenRoomMenu = (event: React.MouseEvent<HTMLElement>, room: any) => {
    event.stopPropagation()
    setRoomMenuAnchor(event.currentTarget)
    setSelectedRoomForMenu(room)
  }

  const handleCloseRoomMenu = () => {
    setRoomMenuAnchor(null)
    setSelectedRoomForMenu(null)
  }

  const handleRoomTypeToggle = (room: any, newTypeChecked: boolean) => {
    const currentType = room.roomType === 'static' ? 'static' : 'dynamic'
    const targetType = newTypeChecked ? 'static' : 'dynamic'

    // If there's a pending mode change, offer to cancel it
    if (room.pendingBookingMode) {
      setRoomToCancel({ id: room.id, name: room.name })
      setIsCancelDialogOpen(true)
      return
    }

    setRoomTypeChangeContext({
      roomId: room.id,
      roomName: room.name,
      currentType,
      targetType
    })
    setIsRoomTypeChangeDialogOpen(true)
  }

  const handleRoomTypeChangeConfirm = async () => {
    if (!roomTypeChangeContext) return

    setIsChangingMode(true)
    setModeChangeError(null)

    try {
      await updateRoomType(roomTypeChangeContext.roomId, roomTypeChangeContext.targetType)
      setIsRoomTypeChangeDialogOpen(false)
      setRoomTypeChangeContext(null)
    } catch (error: any) {
      console.error('Failed to change room type:', error)
      setModeChangeError(error.message || 'Failed to change room type. Please try again.')
    } finally {
      setIsChangingMode(false)
    }
  }

  const handleRoomTypeChangeCancel = () => {
    setModeChangeError(null)
    setIsRoomTypeChangeDialogOpen(false)
    setRoomTypeChangeContext(null)
  }

  const handleToggleRoomType = () => {
    if (!selectedRoomForMenu) return
    const currentType = selectedRoomForMenu.roomType === 'static' ? 'static' : 'dynamic'
    const targetType = selectedRoomForMenu.roomType === 'static' ? 'dynamic' : 'static'

    setRoomTypeChangeContext({
      roomId: selectedRoomForMenu.id,
      roomName: selectedRoomForMenu.name,
      currentType,
      targetType
    })
    setIsRoomTypeChangeDialogOpen(true)
    handleCloseRoomMenu()
  }

  const handleEditRoomFromMenu = () => {
    if (selectedRoomForMenu) {
      handleEditRoom(selectedRoomForMenu)
    }
    handleCloseRoomMenu()
  }

  const handleDeleteRoomFromMenu = () => {
    if (selectedRoomForMenu) {
      handleDeleteClick(selectedRoomForMenu)
    }
    handleCloseRoomMenu()
  }

  const handleCancelRoomModeTransition = async (roomId: string) => {
    setCancelError(null)
    setIsCancelling(true)
    try {
      await cancelRoomBookingModeTransition(roomId)
      handleCloseRoomMenu()
      setIsCancelDialogOpen(false)
      setRoomToCancel(null)
    } catch (error: any) {
      setCancelError(error.message || 'Cannot cancel. There may be bookings after the effective date.')
      handleCloseRoomMenu()
      setIsCancelDialogOpen(false)
      setRoomToCancel(null)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleCancelDialogClose = () => {
    setIsCancelDialogOpen(false)
    setRoomToCancel(null)
  }

  const handleCancelDialogConfirm = () => {
    if (roomToCancel) {
      handleCancelRoomModeTransition(roomToCancel.id)
    }
  }

  const weekStart = startOfWeek(selectedDate)

  const getDateDisplay = () => {
    if (viewMode === 'Week') {
      const endDate = addDays(weekStart, 6)
      return `${format(weekStart, 'MMM d')} - ${format(endDate, 'MMM d')}`
    }
    return format(selectedDate, 'EEE, dd MMM')
  }

  const renderHeader = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <FormControl size='small' sx={{ minWidth: 120 }}>
        <Select value={viewMode} onChange={e => setViewMode(e.target.value)}>
          <MenuItem value='Day'>Day</MenuItem>
          {/* Week view temporarily disabled as focus is on Day timeline */}
          {/* <MenuItem value='Week'>Week</MenuItem> */}
        </Select>
      </FormControl>

      <FormControl size='small' sx={{ minWidth: 180 }}>
        <Select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
          <MenuItem value='all'>All Branches</MenuItem>
          {apiBranches.map(branch => (
            <MenuItem key={branch.id} value={branch.id}>
              {branch.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size='small' onClick={handlePrevPeriod}>
          <i className='ri-arrow-left-s-line' />
        </IconButton>
        <Box
          onClick={handleOpenCalendar}
          sx={{
            minWidth: 180,
            textAlign: 'center',
            py: 0.5,
            px: 2,
            cursor: 'pointer',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <Box>
            <Typography variant='body2' fontWeight={600}>
              {getDateDisplay()}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {(() => {
                // Get business hours for the selected branch and date
                if (selectedBranch === 'all') {
                  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
                    selectedDate.getDay()
                  ] as DayOfWeek
                  const hours = getBusinessHours('1-1', dayOfWeek) // Use first branch as reference
                  if (hours.isOpen && hours.shifts.length > 0) {
                    return `${hours.shifts[0].start} - ${hours.shifts[hours.shifts.length - 1].end}`
                  }
                  return 'Multiple Branches'
                }

                const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as DayOfWeek
                const businessHours = getBusinessHoursForDay(dayOfWeek)

                if (
                  !businessHours ||
                  !businessHours.isOpen ||
                  !businessHours.shifts ||
                  businessHours.shifts.length === 0
                ) {
                  return 'Closed'
                }

                // Format time from 24h to 12h
                const formatTime = (time24: string) => {
                  const [hourStr, minStr] = time24.split(':')
                  let hour = parseInt(hourStr)
                  const minute = minStr
                  const period = hour >= 12 ? 'pm' : 'am'
                  if (hour === 0) hour = 12
                  else if (hour > 12) hour -= 12
                  return `${hour}:${minute} ${period}`
                }

                const firstShift = businessHours.shifts[0]
                const lastShift = businessHours.shifts[businessHours.shifts.length - 1]

                return `${formatTime(firstShift.start)} – ${formatTime(lastShift.end)}`
              })()}
            </Typography>
          </Box>
          <i className='ri-arrow-down-s-line' style={{ fontSize: '1.2rem' }} />
        </Box>
        <IconButton size='small' onClick={handleNextPeriod}>
          <i className='ri-arrow-right-s-line' />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title='Add Room'>
        <Button variant='contained' startIcon={<i className='ri-add-line' />} size='small' onClick={handleAddRoom}>
          Add Room
        </Button>
      </Tooltip>
    </Box>
  )

  const getEffectiveRoomType = (room: any) => {
    if (room.pendingBookingMode && room.bookingModeEffectiveDate) {
      const effectiveDate = new Date(room.bookingModeEffectiveDate)
      effectiveDate.setHours(0, 0, 0, 0)
      const viewDate = new Date(selectedDate)
      viewDate.setHours(0, 0, 0, 0)
      if (viewDate >= effectiveDate) {
        return room.pendingBookingMode === 'STATIC' ? 'static' : 'dynamic'
      }
    }
    return room.roomType || 'dynamic'
  }

  const renderRoomRow = (room: any) => {
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as DayOfWeek
    const schedule = getRoomSchedule(room.id, dayOfWeek)
    const effectiveRoomType = getEffectiveRoomType(room)

    const isFlexible = effectiveRoomType !== 'static'

    // For flexible rooms, get business hours instead of room schedule
    const businessHours = isFlexible ? getBusinessHours(room.branchId, dayOfWeek) : null

    // Helper function to convert 24h time to 12h format
    const formatTime12Hour = (time24: string) => {
      const [hourStr, minStr] = time24.split(':')
      let hour = parseInt(hourStr)
      const minute = minStr
      const period = hour >= 12 ? 'PM' : 'AM'

      if (hour === 0) hour = 12
      else if (hour > 12) hour -= 12

      return `${hour}:${minute} ${period}`
    }

    // Calculate dynamic height based on number of shifts (or 80 for flexible rooms)
    const rowHeight = isFlexible ? 80 : schedule.shifts.length > 0 ? Math.max(80, schedule.shifts.length * 50) : 80

    return (
      <Box key={room.id} sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: rowHeight }}>
        <Box sx={{ width: 250, display: 'flex', flexDirection: 'column', gap: 0.5, p: 2, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='body2' fontWeight={600} noWrap sx={{ flex: 1 }}>
              {room.name}
            </Typography>
            <IconButton size='small' onClick={e => handleOpenRoomMenu(e, room)}>
              <i className='ri-edit-line' style={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Room Type Toggle */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(() => {
                // Use effective room type that accounts for pending changes and selected date
                const isFixed = effectiveRoomType === 'static'
                const hasPendingChange = !!(room as any).pendingBookingMode

                // Check if we're viewing a date where the pending change has taken effect
                const isPendingEffective = (() => {
                  if (!room.pendingBookingMode || !room.bookingModeEffectiveDate) return false
                  const effectiveDate = new Date(room.bookingModeEffectiveDate)
                  effectiveDate.setHours(0, 0, 0, 0)
                  const viewDate = new Date(selectedDate)
                  viewDate.setHours(0, 0, 0, 0)
                  return viewDate >= effectiveDate
                })()

                return (
                  <>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isFixed}
                          onChange={e => {
                            // If pending change exists, this will trigger cancel dialog
                            // Otherwise, trigger mode change dialog
                            handleRoomTypeToggle(room, e.target.checked)
                          }}
                          size='small'
                          color={hasPendingChange && !isPendingEffective ? 'warning' : 'primary'}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <i
                            className={isFixed ? 'ri-calendar-schedule-line' : 'ri-time-line'}
                            style={{ fontSize: 12 }}
                          />
                          <Typography variant='caption' fontSize='0.65rem'>
                            {isFixed ? 'Fixed' : 'Flex'}
                          </Typography>
                        </Box>
                      }
                      sx={{ ml: 0, mr: 1 }}
                    />
                    <Tooltip
                      title={
                        isFixed ? (
                          <Box sx={{ p: 1 }}>
                            <Typography
                              variant='caption'
                              fontWeight={600}
                              display='block'
                              gutterBottom
                              sx={{ fontSize: '0.75rem', color: 'common.white' }}
                            >
                              Default Capacity
                            </Typography>
                            <Typography
                              variant='caption'
                              display='block'
                              sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}
                            >
                              Fixed rooms run scheduled sessions with default capacity.
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ p: 1 }}>
                            <Typography
                              variant='caption'
                              fontWeight={600}
                              display='block'
                              gutterBottom
                              sx={{ fontSize: '0.75rem', color: 'common.white' }}
                            >
                              Flex Availability
                            </Typography>
                            <Typography
                              variant='caption'
                              display='block'
                              sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}
                            >
                              Room accepts individual appointments during business hours.
                            </Typography>
                          </Box>
                        )
                      }
                      arrow
                      placement='right'
                    >
                      <IconButton size='small' sx={{ p: 0.25 }}>
                        <i className='ri-information-line' style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)' }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )
              })()}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontSize: '0.65rem',
                  color: 'text.secondary',
                  ml: 'auto'
                }}
              >
                {effectiveRoomType === 'static' && <Typography variant='caption'>Cap: {room.capacity}</Typography>}
              </Box>
            </Box>

            {/* Pending Mode Change Indicator - only show if viewing a date before the effective date */}
            {(room as any).pendingBookingMode &&
              (() => {
                const effectiveDate = new Date((room as any).bookingModeEffectiveDate)
                effectiveDate.setHours(0, 0, 0, 0)
                const viewDate = new Date(selectedDate)
                viewDate.setHours(0, 0, 0, 0)
                const isPendingEffective = viewDate >= effectiveDate

                // Don't show the chip if viewing a date where change has taken effect
                if (isPendingEffective) return null

                return (
                  <Chip
                    label={`→ ${(room as any).pendingBookingMode === 'STATIC' ? 'Fixed' : 'Flex'} on ${(room as any).bookingModeEffectiveDate ? format(new Date((room as any).bookingModeEffectiveDate), 'MMM d') : '...'}`}
                    size='small'
                    color='warning'
                    variant='filled'
                    icon={<i className='ri-time-line' style={{ fontSize: 10, marginLeft: 4 }} />}
                    sx={{
                      height: 18,
                      fontSize: '0.55rem',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                )
              })()}
          </Box>
        </Box>

        <Box sx={{ flex: 1, position: 'relative', m: 1 }}>
          {/* Flexible Room - Show business hours */}
          {isFlexible ? (
            businessHours?.isOpen && businessHours.shifts.length > 0 ? (
              <Box
                sx={{
                  position: 'absolute',
                  left: `${timeToPosition(formatTime12Hour(businessHours.shifts[0].start), dayOfWeek)}%`,
                  width: `${calculateWidth(formatTime12Hour(businessHours.shifts[0].start), formatTime12Hour(businessHours.shifts[0].end), dayOfWeek)}%`,
                  top: 2,
                  height: 42,
                  bgcolor: theme => (theme.palette.mode === 'dark' ? '#1a237e' : '#E3F2FD'),
                  borderRadius: 1,
                  border: 1,
                  borderColor: theme => (theme.palette.mode === 'dark' ? '#3949ab' : '#64B5F6'),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.5,
                  overflow: 'hidden'
                }}
              >
                <Typography
                  variant='caption'
                  fontWeight={500}
                  color='text.primary'
                  sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                >
                  Business Hours: {formatTime12Hour(businessHours.shifts[0].start).toLowerCase()} -{' '}
                  {formatTime12Hour(businessHours.shifts[0].end).toLowerCase()}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  bgcolor: 'transparent',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant='body2' color='text.secondary' fontWeight={500}>
                  Closed
                </Typography>
              </Box>
            )
          ) : schedule.isAvailable && schedule.shifts.length > 0 ? (
            schedule.shifts.map((shift, idx) => {
              const shiftStart = formatTime12Hour(shift.start)
              const shiftEnd = formatTime12Hour(shift.end)
              const shiftServices = apiServices.filter(s => shift.serviceIds?.includes(s.id))

              return (
                <Box
                  key={idx}
                  onClick={() => handleEditShift(room, shift, dayOfWeek)}
                  sx={{
                    position: 'absolute',
                    left: `${timeToPosition(shiftStart, dayOfWeek)}%`,
                    width: `${calculateWidth(shiftStart, shiftEnd, dayOfWeek)}%`,
                    top: idx * 48 + 2,
                    height: 42,
                    bgcolor: theme => (theme.palette.mode === 'dark' ? '#424242' : '#E8F5E9'),
                    borderRadius: 1,
                    border: 1,
                    borderColor: theme => (theme.palette.mode === 'dark' ? '#616161' : '#81C784'),
                    display: 'flex',
                    flexDirection: 'column',
                    p: 0.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    '&:hover': {
                      bgcolor: theme => (theme.palette.mode === 'dark' ? '#616161' : '#C8E6C9'),
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                      zIndex: 10
                    }
                  }}
                >
                  <Typography
                    variant='caption'
                    fontWeight={500}
                    color='text.primary'
                    sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                  >
                    {shiftStart.toLowerCase()} - {shiftEnd.toLowerCase()}
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontSize: '0.6rem', lineHeight: 1.1, display: 'block' }}
                  >
                    Cap: {shift.capacity ?? room.capacity}
                  </Typography>
                  {shiftServices.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {shiftServices.slice(0, 2).map(service => (
                        <Chip
                          key={service.id}
                          label={service.name}
                          size='small'
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            bgcolor: service.color ? `${service.color}20` : 'rgba(0,0,0,0.08)',
                            color: service.color || 'text.primary',
                            border: service.color ? `1px solid ${service.color}40` : 'none',
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              px: 0.5
                            }
                          }}
                        />
                      ))}
                      {shiftServices.length > 2 && (
                        <Chip
                          label={`+${shiftServices.length - 2}`}
                          size='small'
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            bgcolor: 'rgba(0,0,0,0.08)',
                            '& .MuiChip-label': {
                              px: 0.5
                            }
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              )
            })
          ) : (
            <Box
              onClick={() => handleEditShift(room, null, dayOfWeek)}
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                bgcolor: 'transparent',
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  borderColor: 'primary.main'
                }
              }}
            >
              <Typography variant='body2' color='text.secondary' fontWeight={500}>
                {isFlexible ? 'Click to add business hours' : 'Click to add session'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {renderHeader()}

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
        <Box
          sx={{
            display: 'flex',
            borderBottom: 1,
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            zIndex: 2
          }}
        >
          <Box sx={{ width: 250, p: 2, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
            <Typography variant='body2' fontWeight={600}>
              Rooms
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: 'flex' }}>
            {generateTimelineHours(
              ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as DayOfWeek
            ).map((hour, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 1,
                  borderRight: 1,
                  borderColor: 'divider'
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  {hour}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Rooms grouped by branches */}
        {Object.entries(roomsByBranch).map(([branchId, branchRooms]) => {
          const branch = apiBranches.find(b => b.id === branchId)
          const fixedRooms = branchRooms.filter(room => getEffectiveRoomType(room) === 'static')
          const flexRooms = branchRooms.filter(room => getEffectiveRoomType(room) !== 'static')

          return (
            <Box key={branchId}>
              {/* Branch Header */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(10,44,36,0.28)' : 'rgba(10,44,36,0.1)'),
                  borderBottom: 2,
                  borderColor: 'rgba(10,44,36,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <i className='ri-building-line' style={{ fontSize: 16 }} />
                <Typography variant='subtitle2' fontWeight={600}>
                  {branch?.name || branchId}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  ({branchRooms.length} room{branchRooms.length === 1 ? '' : 's'})
                </Typography>
              </Box>

              {fixedRooms.length > 0 && (
                <>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(119,182,163,0.14)' : 'rgba(119,182,163,0.12)'),
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <i className='ri-calendar-schedule-line' style={{ fontSize: 14, color: '#0a2c24' }} />
                    <Typography variant='caption' fontWeight={700} sx={{ letterSpacing: 0.4 }}>
                      FIXED ROOMS
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      ({fixedRooms.length})
                    </Typography>
                  </Box>
                  {fixedRooms.map(renderRoomRow)}
                </>
              )}

              {flexRooms.length > 0 && (
                <>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.04)'),
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <i className='ri-time-line' style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }} />
                    <Typography variant='caption' fontWeight={700} sx={{ letterSpacing: 0.4 }}>
                      FLEX ROOMS
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      ({flexRooms.length})
                    </Typography>
                  </Box>
                  {flexRooms.map(renderRoomRow)}
                </>
              )}
            </Box>
          )
        })}

        {displayRooms.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <i className='ri-hotel-bed-line' style={{ fontSize: 64, opacity: 0.3 }} />
            <Typography variant='h6' sx={{ mt: 2 }}>
              No rooms found
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {selectedBranch === 'all' ? 'No rooms have been created yet' : 'No rooms in this branch'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Day View Footer */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Button
          variant='outlined'
          size='small'
          onClick={() => setSelectedDate(new Date())}
          sx={{ borderRadius: 2, textTransform: 'uppercase', px: 3 }}
        >
          Today
        </Button>
      </Box>

      {/* Calendar Picker Popover */}
      <CalendarPopover
        open={calendarOpen}
        anchorEl={calendarAnchor}
        onClose={handleCloseCalendar}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onJumpWeek={handleJumpWeek}
      />

      {/* Room Editor Drawer */}
      <RoomEditorDrawer
        open={isRoomEditorOpen}
        onClose={handleCloseRoomEditor}
        room={selectedRoomForEdit}
        selectedBranchId={selectedBranch !== 'all' ? selectedBranch : null}
      />

      {/* Room Schedule Editor */}
      <RoomScheduleEditor
        open={isScheduleEditorOpen}
        onClose={handleCloseScheduleEditor}
        roomId={scheduleEditorContext?.roomId || null}
        roomName={scheduleEditorContext?.roomName || ''}
        dayOfWeek={scheduleEditorContext?.dayOfWeek || null}
        initialShift={scheduleEditorContext?.initialShift}
        roomType={scheduleEditorContext?.roomType}
        defaultCapacity={scheduleEditorContext?.defaultCapacity}
      />

      {/* Room Actions Menu */}
      <Menu
        anchorEl={roomMenuAnchor}
        open={roomMenuOpen}
        onClose={handleCloseRoomMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem onClick={handleEditRoomFromMenu}>
          <ListItemIcon>
            <i className='ri-edit-line' />
          </ListItemIcon>
          <ListItemText>EDIT ROOM</ListItemText>
        </MenuItem>
        {!selectedRoomForMenu?.pendingBookingMode && (
          <MenuItem onClick={handleToggleRoomType}>
            <ListItemIcon>
              <i className='ri-exchange-line' />
            </ListItemIcon>
            <ListItemText>CHANGE TO {selectedRoomForMenu?.roomType === 'static' ? 'FLEX' : 'FIXED'}</ListItemText>
          </MenuItem>
        )}
        {selectedRoomForMenu?.pendingBookingMode && (
          <MenuItem
            onClick={() => {
              if (selectedRoomForMenu) {
                handleCancelRoomModeTransition(selectedRoomForMenu.id)
              }
            }}
          >
            <ListItemIcon>
              <i className='ri-close-circle-line' style={{ color: 'var(--mui-palette-warning-main)' }} />
            </ListItemIcon>
            <ListItemText sx={{ color: 'warning.main' }}>CANCEL MODE CHANGE</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteRoomFromMenu}>
          <ListItemIcon>
            <i className='ri-delete-bin-line' />
          </ListItemIcon>
          <ListItemText>DELETE ROOM</ListItemText>
        </MenuItem>
      </Menu>

      {/* Room Type Change Confirmation Dialog */}
      <StaffTypeChangeDialog
        open={isRoomTypeChangeDialogOpen}
        onClose={handleRoomTypeChangeCancel}
        staffId={roomTypeChangeContext?.roomId || ''}
        staffName={roomTypeChangeContext?.roomName || ''}
        currentType={roomTypeChangeContext?.currentType || 'dynamic'}
        targetType={roomTypeChangeContext?.targetType || 'static'}
        onConfirm={handleRoomTypeChangeConfirm}
        isChanging={isChangingMode}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {roomToDelete?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Mode Change Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onClose={handleCancelDialogClose}>
        <DialogTitle>Cancel Scheduled Mode Change?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {roomToCancel?.name} has a scheduled booking mode change. Would you like to cancel this scheduled change?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} disabled={isCancelling}>
            Keep Scheduled Change
          </Button>
          <Button onClick={handleCancelDialogConfirm} color='warning' variant='contained' disabled={isCancelling}>
            {isCancelling ? 'Cancelling...' : 'Cancel Mode Change'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar for Cancel/Mode Change failures */}
      <Snackbar
        open={!!cancelError || !!modeChangeError}
        autoHideDuration={8000}
        onClose={() => {
          setCancelError(null)
          setModeChangeError(null)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity='error'
          onClose={() => {
            setCancelError(null)
            setModeChangeError(null)
          }}
          sx={{ width: '100%' }}
        >
          {cancelError || modeChangeError}
        </Alert>
      </Snackbar>
    </Box>
  )
}
