'use client'

import { useState, useMemo } from 'react'
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
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { mockBranches, mockServices, mockStaff } from '@/bookly/data/mock-data'
import { mockBusinessHours } from '@/bookly/data/staff-management-mock-data'
import { useStaffManagementStore } from './staff-store'
import { CalendarPopover } from './calendar-popover'
import { RoomEditorDrawer } from './room-editor-drawer'
import { RoomScheduleEditor } from './room-schedule-editor'
import { RoomEditWorkingHoursModal } from './room-edit-working-hours-modal'
import type { DayOfWeek } from '../calendar/types'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Helper to get the right terminology based on room type
const getShiftLabel = (roomType: 'dynamic' | 'static' | undefined, plural: boolean = false): string => {
  const isStatic = roomType === 'static'
  if (plural) {
    return isStatic ? 'Sessions' : 'Shifts'
  }
  return isStatic ? 'Session' : 'Shift'
}

// Helper to safely access business hours
const getBusinessHoursForDay = (day: DayOfWeek) => {
  const hours = mockBusinessHours as any
  return hours[day] as { isOpen: boolean; shifts: { start: string; end: string }[] }
}

// Generate timeline hours based on business hours for a specific day
function generateTimelineHours(dayOfWeek: DayOfWeek): string[] {
  const businessHours = getBusinessHoursForDay(dayOfWeek)

  if (!businessHours.isOpen || businessHours.shifts.length === 0) {
    // Default fallback if business is closed
    return ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
  }

  // Get first shift's start and end times
  const shift = businessHours.shifts[0]
  const [startHour] = shift.start.split(':').map(Number)
  const [endHour] = shift.end.split(':').map(Number)

  const hours: string[] = []

  // Generate hourly labels from start to end
  for (let hour = startHour; hour <= endHour; hour++) {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const period = hour >= 12 ? 'PM' : 'AM'
    hours.push(`${displayHour}:00 ${period}`)
  }

  return hours
}

// Get business hours start/end for a specific day (in minutes from midnight)
function getBusinessHoursRange(dayOfWeek: DayOfWeek): { start: number; end: number } {
  const businessHours = getBusinessHoursForDay(dayOfWeek)

  if (!businessHours.isOpen || businessHours.shifts.length === 0) {
    // Default fallback
    return { start: 9 * 60, end: 17 * 60 }
  }

  const shift = businessHours.shifts[0]
  const [startHour, startMin] = shift.start.split(':').map(Number)
  const [endHour, endMin] = shift.end.split(':').map(Number)

  return {
    start: startHour * 60 + startMin,
    end: endHour * 60 + endMin
  }
}

function timeToPosition(time: string, dayOfWeek: DayOfWeek): number {
  const [hourStr, period] = time.split(' ')
  let [hours, minutes = 0] = hourStr.split(':').map(Number)

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const totalMinutes = hours * 60 + minutes
  const { start: startMinutes, end: endMinutes } = getBusinessHoursRange(dayOfWeek)

  return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
}

function calculateWidth(start: string, end: string, dayOfWeek: DayOfWeek): number {
  const startPos = timeToPosition(start, dayOfWeek)
  const endPos = timeToPosition(end, dayOfWeek)
  return endPos - startPos
}

export function RoomsTab() {
  const [viewMode, setViewMode] = useState('Day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBranch, setSelectedBranch] = useState(() => {
    // Default to first branch
    return mockBranches[0]?.id || 'all'
  })
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null)
  const [isRoomEditorOpen, setIsRoomEditorOpen] = useState(false)
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<any>(null)
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false)
  const [scheduleEditorContext, setScheduleEditorContext] = useState<{
    roomId: string
    roomName: string
    dayOfWeek: DayOfWeek
    initialShift?: { start: string; end: string; serviceIds: string[] } | null
    roomType?: 'dynamic' | 'static'
    defaultCapacity?: number
    roomServiceIds?: string[]
  } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; name: string } | null>(null)
  const [roomMenuAnchor, setRoomMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedRoomForMenu, setSelectedRoomForMenu] = useState<any>(null)
  const [isWeeklyScheduleModalOpen, setIsWeeklyScheduleModalOpen] = useState(false)
  const [weeklyScheduleContext, setWeeklyScheduleContext] = useState<{
    roomId: string
    roomName: string
    roomType: 'dynamic' | 'static'
    defaultCapacity: number
    roomServiceIds: string[]
  } | null>(null)

  const calendarOpen = Boolean(calendarAnchor)
  const roomMenuOpen = Boolean(roomMenuAnchor)

  const { rooms, getRoomsForBranch, getRoomSchedule, deleteRoom, updateRoomType, getBusinessHours } =
    useStaffManagementStore()

  // Filter rooms by branch
  const displayRooms = selectedBranch === 'all' ? rooms : getRoomsForBranch(selectedBranch)

  // Group rooms by branch and sort by schedule start time
  const roomsByBranch = useMemo(() => {
    const grouped: Record<string, typeof rooms> = {}

    displayRooms.forEach(room => {
      if (!grouped[room.branchId]) grouped[room.branchId] = []
      grouped[room.branchId].push(room)
    })

    // Sort rooms within each branch: dynamic first, then static, then by schedule start time
    Object.keys(grouped).forEach(branchId => {
      grouped[branchId].sort((a, b) => {
        const dayOfWeek = WEEK_DAYS[selectedDate.getDay()] as DayOfWeek

        // First, sort by type: dynamic (0) before static (1)
        const aType = a.roomType === 'dynamic' ? 0 : 1
        const bType = b.roomType === 'dynamic' ? 0 : 1
        if (aType !== bType) return aType - bType

        // Within the same type, sort by availability
        const aSchedule = getRoomSchedule(a.id, dayOfWeek)
        const bSchedule = getRoomSchedule(b.id, dayOfWeek)

        if (!aSchedule.isAvailable || aSchedule.shifts.length === 0) return 1
        if (!bSchedule.isAvailable || bSchedule.shifts.length === 0) return -1

        // Within available rooms, sort by schedule start time
        const aStart = aSchedule.shifts[0]?.start || '23:59'
        const bStart = bSchedule.shifts[0]?.start || '23:59'

        return aStart.localeCompare(bStart)
      })
    })

    return grouped
  }, [displayRooms, selectedDate, getRoomSchedule])

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

  const handleEditShift = (room: any, shift: any | null, dayOfWeek: DayOfWeek) => {
    setScheduleEditorContext({
      roomId: room.id,
      roomName: room.name,
      dayOfWeek,
      initialShift: shift,
      roomType: room.roomType || 'dynamic',
      defaultCapacity: room.capacity || 10,
      roomServiceIds: room.serviceIds || []
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

  const handleToggleRoomType = () => {
    if (!selectedRoomForMenu) return
    const newType = selectedRoomForMenu.roomType === 'static' ? 'dynamic' : 'static'
    updateRoomType(selectedRoomForMenu.id, newType)
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

  const handleEditScheduleFromMenu = () => {
    if (selectedRoomForMenu) {
      const dayOfWeek = WEEK_DAYS[selectedDate.getDay()] as DayOfWeek
      const schedule = getRoomSchedule(selectedRoomForMenu.id, dayOfWeek)
      handleEditShift(selectedRoomForMenu, schedule.shifts[0] || null, dayOfWeek)
    }
    handleCloseRoomMenu()
  }

  const handleEditWeeklyScheduleFromMenu = () => {
    if (selectedRoomForMenu) {
      setWeeklyScheduleContext({
        roomId: selectedRoomForMenu.id,
        roomName: selectedRoomForMenu.name,
        roomType: selectedRoomForMenu.roomType || 'dynamic',
        defaultCapacity: selectedRoomForMenu.capacity || 10,
        roomServiceIds: selectedRoomForMenu.serviceIds || []
      })
      setIsWeeklyScheduleModalOpen(true)
    }
    handleCloseRoomMenu()
  }

  const handleCloseWeeklyScheduleModal = () => {
    setIsWeeklyScheduleModalOpen(false)
    setWeeklyScheduleContext(null)
  }

  const weekStart = startOfWeek(selectedDate)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getDateDisplay = () => {
    if (viewMode === 'Week') {
      const endDate = addDays(weekStart, 6)
      return `${format(weekStart, 'MMM d')} - ${format(endDate, 'MMM d')}`
    }
    return format(selectedDate, 'EEE, dd MMM')
  }

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

  // Format time for compact display
  const formatTimeCompact = (time24: string) => {
    const [hourStr, minStr] = time24.split(':')
    let hour = parseInt(hourStr)
    const period = hour >= 12 ? 'pm' : 'am'
    if (hour === 0) hour = 12
    else if (hour > 12) hour -= 12
    return `${hour}:${minStr}${period}`
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
          <MenuItem value='Week'>Week</MenuItem>
        </Select>
      </FormControl>

      <FormControl size='small' sx={{ minWidth: 180 }}>
        <Select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
          <MenuItem value='all'>All Branches</MenuItem>
          {mockBranches.map(branch => (
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
                if (selectedBranch === 'all') {
                  return 'Multiple Branches'
                }

                const dayOfWeek = WEEK_DAYS[selectedDate.getDay()] as DayOfWeek
                const businessHours = getBusinessHours(selectedBranch, dayOfWeek)

                if (!businessHours.isOpen || businessHours.shifts.length === 0) {
                  return 'Closed'
                }

                const firstShift = businessHours.shifts[0]
                const lastShift = businessHours.shifts[businessHours.shifts.length - 1]

                return `${formatTimeCompact(firstShift.start)} – ${formatTimeCompact(lastShift.end)}`
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

      <Button variant='contained' startIcon={<i className='ri-add-line' />} size='small' onClick={handleAddRoom}>
        Add Room
      </Button>
    </Box>
  )

  const renderRoomRow = (room: any) => {
    const dayOfWeek = WEEK_DAYS[selectedDate.getDay()] as DayOfWeek
    const schedule = getRoomSchedule(room.id, dayOfWeek)
    const isFlexible = room.roomType !== 'static'

    // For flexible rooms, get business hours instead of room schedule
    const businessHours = isFlexible ? getBusinessHours(room.branchId, dayOfWeek) : null

    // Calculate dynamic height based on number of shifts
    const rowHeight = isFlexible ? 80 : schedule.shifts.length > 0 ? Math.max(80, schedule.shifts.length * 50) : 80

    // Get services assigned to this room
    const roomServices = mockServices.filter(s => room.serviceIds?.includes(s.id))

    return (
      <Box key={room.id} sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: rowHeight }}>
        {/* Left Sidebar - Room Info */}
        <Box sx={{ width: 200, display: 'flex', flexDirection: 'column', gap: 0.5, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 6,
                height: 30,
                borderRadius: 1,
                bgcolor: room.color || 'primary.main',
                flexShrink: 0
              }}
            />
            <Typography variant='body2' fontWeight={600} noWrap sx={{ flex: 1 }}>
              {room.name}
            </Typography>
            <IconButton size='small' onClick={e => handleOpenRoomMenu(e, room)}>
              <i className='ri-edit-line' style={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Room Type Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={room.roomType === 'static'}
                  onChange={() => {
                    const newType = room.roomType === 'static' ? 'dynamic' : 'static'
                    updateRoomType(room.id, newType)
                  }}
                  size='small'
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <i
                    className={room.roomType === 'static' ? 'ri-lock-line' : 'ri-equalizer-line'}
                    style={{ fontSize: 12 }}
                  />
                  <Typography variant='caption' fontSize='0.65rem'>
                    {room.roomType === 'static' ? 'Fixed' : 'Flex'}
                  </Typography>
                </Box>
              }
              sx={{ ml: 0, mr: 1 }}
            />
            <Tooltip
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant='caption' fontWeight={600} display='block' gutterBottom>
                    Flexible vs Fixed Capacity
                  </Typography>
                  <Typography variant='caption' display='block' sx={{ mb: 1 }}>
                    <strong>Flexible:</strong> Capacity varies by service/time. Each booking can have different capacity
                    limits.
                  </Typography>
                  <Typography variant='caption' display='block'>
                    <strong>Fixed:</strong> Single capacity for all bookings. Room always has the same capacity
                    regardless of service.
                  </Typography>
                </Box>
              }
              arrow
              placement='right'
            >
              <IconButton size='small' sx={{ p: 0.25 }}>
                <i className='ri-information-line' style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)' }} />
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: '0.65rem',
                color: 'text.secondary',
                ml: 'auto'
              }}
            >
              <Typography variant='caption'>
                <i className='ri-group-line' style={{ fontSize: 10, marginRight: 2 }} />
                Cap: {room.capacity}
              </Typography>
              {roomServices.length > 0 && (
                <Typography variant='caption'>
                  {roomServices.length} service{roomServices.length > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Timeline Area */}
        <Box sx={{ flex: 1, position: 'relative', m: 1 }}>
          {/* Flexible Room - Show business hours */}
          {isFlexible ? (
            businessHours?.isOpen && businessHours.shifts.length > 0 ? (
              <Box
                onClick={() => handleEditShift(room, null, dayOfWeek)}
                sx={{
                  position: 'absolute',
                  left: `${timeToPosition(formatTime12Hour(businessHours.shifts[0].start), dayOfWeek)}%`,
                  width: `${calculateWidth(formatTime12Hour(businessHours.shifts[0].start), formatTime12Hour(businessHours.shifts[0].end), dayOfWeek)}%`,
                  top: 0,
                  height: '100%',
                  bgcolor: 'rgba(139, 195, 74, 0.3)',
                  borderRadius: 1,
                  border: 1,
                  borderColor: theme => (theme.palette.mode === 'dark' ? '#3949ab' : '#64B5F6'),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: theme => (theme.palette.mode === 'dark' ? '#283593' : '#BBDEFB'),
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Typography variant='caption' fontWeight={500} color='text.primary'>
                  {formatTimeCompact(businessHours.shifts[0].start)} - {formatTimeCompact(businessHours.shifts[0].end)}
                </Typography>
                {/* <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <i className='ri-time-line' style={{ fontSize: 10 }} />
                  Follows Business Hours
                </Typography> */}
                <IconButton
                  size='small'
                  sx={{ position: 'absolute', top: 2, right: 2, color: 'text.secondary' }}
                  onClick={e => {
                    e.stopPropagation()
                    handleEditShift(room, null, dayOfWeek)
                  }}
                >
                  <i className='ri-edit-line' style={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ) : (
              <Box
                onClick={() => handleEditShift(room, null, dayOfWeek)}
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  bgcolor: '#424242',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#333333'
                  }
                }}
              >
                <Typography variant='body2' sx={{ color: '#fff' }} fontWeight={500}>
                  Branch Closed
                </Typography>
              </Box>
            )
          ) : schedule.isAvailable && schedule.shifts.length > 0 ? (
            schedule.shifts.map((shift, idx) => {
              const shiftStart = formatTime12Hour(shift.start)
              const shiftEnd = formatTime12Hour(shift.end)
              const shiftServices = mockServices.filter(s => shift.serviceIds?.includes(s.id))
              const [startH, startM] = shift.start.split(':').map(Number)
              const [endH, endM] = shift.end.split(':').map(Number)
              const durationMinutes = endH * 60 + endM - (startH * 60 + startM)
              const hours = Math.floor(durationMinutes / 60)

              return (
                <Box key={idx}>
                  {/* Main Shift Box */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${timeToPosition(shiftStart, dayOfWeek)}%`,
                      width: `${calculateWidth(shiftStart, shiftEnd, dayOfWeek)}%`,
                      top: schedule.shifts.length > 1 ? `${idx * (100 / schedule.shifts.length)}%` : 0,
                      height: schedule.shifts.length > 1 ? `${Math.floor(90 / schedule.shifts.length)}%` : '100%',
                      bgcolor: isFlexible
                        ? 'rgba(139, 195, 74, 0.3)'
                        : theme =>
                            theme.palette.mode === 'dark' ? 'rgba(120, 120, 120, 0.3)' : 'rgba(158, 158, 158, 0.25)',
                      borderRadius: 1,
                      border: 1,
                      borderColor: isFlexible ? 'success.light' : 'grey.400',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                      '&:hover': {
                        bgcolor: isFlexible
                          ? 'rgba(139, 195, 74, 0.4)'
                          : theme =>
                              theme.palette.mode === 'dark' ? 'rgba(120, 120, 120, 0.4)' : 'rgba(158, 158, 158, 0.35)',
                        borderColor: isFlexible ? 'success.main' : 'grey.500'
                      }
                    }}
                  >
                    <Typography variant='caption' fontWeight={500} color='text.primary'>
                      {formatTimeCompact(shift.start)} - {formatTimeCompact(shift.end)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                      {hours}h{shift.capacity ? ` • Cap: ${shift.capacity}` : ''}
                    </Typography>
                    {shiftServices.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, justifyContent: 'center', mt: 0.5 }}>
                        {shiftServices.slice(0, 2).map(service => (
                          <Chip
                            key={service.id}
                            label={service.name}
                            size='small'
                            sx={{
                              height: 14,
                              fontSize: '0.55rem',
                              bgcolor: service.color ? `${service.color}20` : 'rgba(0,0,0,0.08)',
                              color: service.color || 'text.primary',
                              border: service.color ? `1px solid ${service.color}40` : 'none',
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 0.5 }
                            }}
                          />
                        ))}
                        {shiftServices.length > 2 && (
                          <Chip
                            label={`+${shiftServices.length - 2}`}
                            size='small'
                            sx={{
                              height: 14,
                              fontSize: '0.55rem',
                              bgcolor: 'rgba(0,0,0,0.08)',
                              '& .MuiChip-label': { px: 0.5 }
                            }}
                          />
                        )}
                      </Box>
                    )}
                    {schedule.shifts.length > 1 && (
                      <Chip
                        label={`${idx + 1}/${schedule.shifts.length}`}
                        size='small'
                        sx={{ height: 16, fontSize: '0.6rem', position: 'absolute', top: 2, left: 2 }}
                      />
                    )}
                    <IconButton
                      size='small'
                      sx={{ position: 'absolute', top: 2, right: 2, color: 'text.primary' }}
                      onClick={e => {
                        e.stopPropagation()
                        handleEditShift(room, shift, dayOfWeek)
                      }}
                    >
                      <i className='ri-edit-line' style={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
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
                No Schedule
              </Typography>
              <IconButton
                size='small'
                sx={{ position: 'absolute', top: 2, right: 2, color: 'text.secondary' }}
                onClick={e => {
                  e.stopPropagation()
                  handleEditShift(room, null, dayOfWeek)
                }}
              >
                <i className='ri-edit-line' style={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  // Day View
  if (viewMode === 'Day') {
    const dayOfWeek = WEEK_DAYS[selectedDate.getDay()] as DayOfWeek
    const timelineHours = generateTimelineHours(dayOfWeek)

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {renderHeader()}

        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
          {/* Timeline Header */}
          <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ width: 200, p: 2 }} />
            <Box sx={{ flex: 1, display: 'flex', px: 2 }}>
              {timelineHours.map((hour, idx) => (
                <Box key={idx} sx={{ flex: 1, textAlign: 'center', py: 1 }}>
                  <Typography variant='caption' color='text.secondary'>
                    {hour}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Rooms grouped by branches - sorted by open/closed status */}
          {Object.entries(roomsByBranch)
            .sort(([branchIdA], [branchIdB]) => {
              // Sort open branches first, closed branches last
              const hoursA = getBusinessHours(branchIdA, dayOfWeek)
              const hoursB = getBusinessHours(branchIdB, dayOfWeek)
              const isOpenA = hoursA.isOpen && hoursA.shifts.length > 0
              const isOpenB = hoursB.isOpen && hoursB.shifts.length > 0

              if (isOpenA && !isOpenB) return -1
              if (!isOpenA && isOpenB) return 1
              return 0
            })
            .map(([branchId, branchRooms]) => {
              const branch = mockBranches.find(b => b.id === branchId)
              const showBranchHeader = selectedBranch === 'all'

              // Get business hours for this specific day
              const branchBusinessHours = getBusinessHours(branchId, dayOfWeek)
              const isOpen = branchBusinessHours.isOpen && branchBusinessHours.shifts.length > 0

              const branchHoursDisplay = isOpen
                ? `${formatTimeCompact(branchBusinessHours.shifts[0].start)} - ${formatTimeCompact(branchBusinessHours.shifts[0].end)}`
                : 'Closed'

              return (
                <Box key={branchId}>
                  {/* Branch Header */}
                  {showBranchHeader && (
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: 'action.hover',
                        borderBottom: 2,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='ri-building-line' style={{ fontSize: 16 }} />
                        <Typography variant='subtitle2' fontWeight={600}>
                          {branch?.name || branchId}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          ({branchRooms.length} room{branchRooms.length === 1 ? '' : 's'})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <i className='ri-time-line' style={{ fontSize: 14 }} />
                        <Typography variant='caption' color={isOpen ? 'text.secondary' : 'error.main'}>
                          {branchHoursDisplay}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Rooms in this branch */}
                  {branchRooms.map(renderRoomRow)}
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
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={handleAddRoom}
                sx={{ mt: 2 }}
              >
                Add Your First Room
              </Button>
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
          <Box sx={{ flex: 1 }} />
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            onClick={handleAddRoom}
            sx={{ textTransform: 'uppercase' }}
          >
            Add Room
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
          roomServiceIds={scheduleEditorContext?.roomServiceIds}
        />

        {/* Room Edit Weekly Schedule Modal */}
        {weeklyScheduleContext && (
          <RoomEditWorkingHoursModal
            open={isWeeklyScheduleModalOpen}
            onClose={handleCloseWeeklyScheduleModal}
            roomId={weeklyScheduleContext.roomId}
            roomName={weeklyScheduleContext.roomName}
            roomType={weeklyScheduleContext.roomType}
            defaultCapacity={weeklyScheduleContext.defaultCapacity}
            roomServiceIds={weeklyScheduleContext.roomServiceIds}
            referenceDate={selectedDate}
          />
        )}

        {/* Room Actions Menu */}
        <Menu
          anchorEl={roomMenuAnchor}
          open={roomMenuOpen}
          onClose={handleCloseRoomMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleEditWeeklyScheduleFromMenu}>
            <ListItemIcon>
              <i className='ri-calendar-schedule-line' />
            </ListItemIcon>
            <ListItemText>EDIT WEEKLY HOURS</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditScheduleFromMenu}>
            <ListItemIcon>
              <i className='ri-time-line' />
            </ListItemIcon>
            <ListItemText>EDIT TODAY'S SCHEDULE</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditRoomFromMenu}>
            <ListItemIcon>
              <i className='ri-edit-line' />
            </ListItemIcon>
            <ListItemText>EDIT ROOM</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteRoomFromMenu}>
            <ListItemIcon>
              <i className='ri-delete-bin-line' />
            </ListItemIcon>
            <ListItemText>DELETE ROOM</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleToggleRoomType}>
            <ListItemIcon>
              <i className={selectedRoomForMenu?.roomType === 'static' ? 'ri-equalizer-line' : 'ri-lock-line'} />
            </ListItemIcon>
            <ListItemText>
              {selectedRoomForMenu?.roomType === 'static' ? 'SWITCH TO FLEXIBLE' : 'SWITCH TO FIXED'}
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth='xs' fullWidth>
          <DialogTitle>Delete Room</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete <strong>{roomToDelete?.name}</strong>? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleDeleteCancel} color='inherit'>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} variant='contained' color='error' autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  // Week View
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {renderHeader()}

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
          {/* Left Sidebar - Room Names */}
          <Box sx={{ width: 150, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider' }} />

            {/* Business Hours - Only show when a specific branch is selected */}
            {selectedBranch !== 'all' &&
              (() => {
                // Calculate total hours for the week
                const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                let weekTotalMinutes = 0
                let daysOpen = 0

                dayNames.forEach(day => {
                  const dayHours = getBusinessHours(selectedBranch, day)
                  if (dayHours.isOpen && dayHours.shifts.length > 0) {
                    daysOpen++
                    dayHours.shifts.forEach((shift: { start: string; end: string }) => {
                      const [startH, startM] = shift.start.split(':').map(Number)
                      const [endH, endM] = shift.end.split(':').map(Number)
                      const minutes = endH * 60 + endM - (startH * 60 + startM)
                      weekTotalMinutes += minutes
                    })
                  }
                })

                const weekHours = Math.floor(weekTotalMinutes / 60)
                const weekMinutes = weekTotalMinutes % 60

                return (
                  <Box
                    sx={{
                      height: 70,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                      bgcolor: 'action.hover'
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body2' fontWeight={600}>
                        Business Hours
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                        >
                          {daysOpen} days open
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                        >
                          W {weekHours}h {weekMinutes > 0 ? `${weekMinutes}m` : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )
              })()}

            {Object.entries(roomsByBranch)
              .sort(([branchIdA], [branchIdB]) => {
                // Sort open branches first (check if any day is open)
                const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                const isOpenA = dayNames.some(day => {
                  const hours = getBusinessHours(branchIdA, day)
                  return hours.isOpen && hours.shifts.length > 0
                })
                const isOpenB = dayNames.some(day => {
                  const hours = getBusinessHours(branchIdB, day)
                  return hours.isOpen && hours.shifts.length > 0
                })

                if (isOpenA && !isOpenB) return -1
                if (!isOpenA && isOpenB) return 1
                return 0
              })
              .map(([branchId, branchRooms]) => {
                const branch = mockBranches.find(b => b.id === branchId)
                const showBranchHeader = selectedBranch === 'all' // Only show header when viewing all branches

                // Calculate business hours for this branch
                const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                let branchTotalMinutes = 0
                let branchDaysOpen = 0

                if (showBranchHeader) {
                  dayNames.forEach(day => {
                    const dayHours = getBusinessHours(branchId, day)
                    if (dayHours.isOpen && dayHours.shifts.length > 0) {
                      branchDaysOpen++
                      dayHours.shifts.forEach((shift: { start: string; end: string }) => {
                        const [startH, startM] = shift.start.split(':').map(Number)
                        const [endH, endM] = shift.end.split(':').map(Number)
                        const minutes = endH * 60 + endM - (startH * 60 + startM)
                        branchTotalMinutes += minutes
                      })
                    }
                  })
                }

                const branchHours = Math.floor(branchTotalMinutes / 60)

                return (
                  <Box key={branchId}>
                    {/* Branch Header with Business Hours - only show when all branches selected */}
                    {showBranchHeader && (
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: 'action.hover',
                          borderBottom: 1,
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <i className='ri-building-line' style={{ fontSize: 14 }} />
                        <Typography variant='caption' fontWeight={600} fontSize='0.7rem'>
                          {branch?.name || branchId}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' fontSize='0.65rem'>
                          ({branchRooms.length})
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='caption' color='text.secondary' fontSize='0.6rem'>
                            {branchDaysOpen}d • {branchHours}h/wk
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Simplified Branch Header - when specific branch selected */}
                    {!showBranchHeader && (
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: 'action.selected',
                          borderBottom: 1,
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <i className='ri-building-line' style={{ fontSize: 14 }} />
                        <Typography variant='caption' fontWeight={600} fontSize='0.7rem'>
                          {branch?.name || branchId}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' fontSize='0.65rem'>
                          ({branchRooms.length})
                        </Typography>
                      </Box>
                    )}

                    {/* Rooms in this branch */}
                    {branchRooms.map(room => (
                      <Box
                        key={room.id}
                        sx={{
                          height: 80,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 2,
                          borderBottom: 1,
                          borderColor: 'divider'
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 30,
                            borderRadius: 1,
                            bgcolor: room.color || 'primary.main',
                            mr: 0.5
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant='body2' fontWeight={600} noWrap>
                              {room.name}
                            </Typography>
                            <Tooltip title={room.roomType === 'static' ? 'Fixed Capacity' : 'Flexible Capacity'}>
                              <Chip
                                label={room.roomType === 'static' ? 'Fix' : 'Flex'}
                                size='small'
                                color={room.roomType === 'static' ? 'primary' : 'success'}
                                variant='outlined'
                                sx={{
                                  height: 16,
                                  minWidth: 20,
                                  fontSize: '0.55rem',
                                  fontWeight: 700,
                                  '& .MuiChip-label': { px: 0.4 }
                                }}
                              />
                            </Tooltip>
                          </Box>
                          <Typography variant='caption' color='text.secondary' display='block'>
                            Cap: {room.capacity}
                          </Typography>
                        </Box>
                        <Tooltip title='More Options'>
                          <IconButton size='small' onClick={e => handleOpenRoomMenu(e, room)}>
                            <i className='ri-more-2-fill' style={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </Box>
                )
              })}
          </Box>

          {/* Day Columns */}
          {weekDates.map((date, dayIndex) => {
            const isSelected = isSameDay(date, selectedDate)
            const dayName = WEEK_DAYS[dayIndex]

            return (
              <Box
                key={dayIndex}
                sx={{
                  minWidth: 150,
                  flexShrink: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                  bgcolor: isSelected ? 'rgba(25, 118, 210, 0.05)' : 'transparent'
                }}
              >
                {/* Day Header */}
                <Box
                  onClick={() => setSelectedDate(date)}
                  sx={{
                    height: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: isSelected ? 'primary.main' : 'transparent',
                    color: isSelected ? 'white' : 'text.primary',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: isSelected ? 'primary.main' : 'action.hover'
                    }
                  }}
                >
                  <Typography variant='caption' fontWeight={600}>
                    {dayName} {format(date, 'd')}
                  </Typography>
                </Box>

                {/* Business Hours cells - Only show when a specific branch is selected */}
                {selectedBranch !== 'all' &&
                  (() => {
                    const dayOfWeek = WEEK_DAYS[dayIndex] as DayOfWeek
                    const businessHours = getBusinessHours(selectedBranch, dayOfWeek)
                    const isOpen = businessHours.isOpen && businessHours.shifts.length > 0

                    // Format time from 24h to 12h
                    const formatTime = (time24: string) => {
                      const [hourStr, minStr] = time24.split(':')
                      let hour = parseInt(hourStr)
                      const minute = minStr
                      const period = hour >= 12 ? 'PM' : 'AM'
                      if (hour === 0) hour = 12
                      else if (hour > 12) hour -= 12
                      return `${hour}:${minute} ${period}`
                    }

                    return (
                      <Box
                        sx={{
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderBottom: 1,
                          borderColor: 'divider',
                          p: 1
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: isOpen ? 'rgba(139, 195, 74, 0.2)' : 'grey.900',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            border: isOpen ? '1px solid' : 'none',
                            borderColor: isOpen ? 'success.main' : 'transparent'
                          }}
                        >
                          {isOpen ? (
                            <>
                              <Typography variant='caption' fontWeight={500} sx={{ fontSize: '0.65rem' }}>
                                {formatTime(businessHours.shifts[0].start)}
                              </Typography>
                              <Typography variant='caption' fontWeight={500} sx={{ fontSize: '0.65rem' }}>
                                {formatTime(businessHours.shifts[0].end)}
                              </Typography>
                              {businessHours.shifts.length > 1 && (
                                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.55rem' }}>
                                  +{businessHours.shifts.length - 1}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant='body2' color='white'>
                              Closed
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )
                  })()}

                {/* Room cells grouped by branches - sorted by open/closed status */}
                {Object.entries(roomsByBranch)
                  .sort(([branchIdA], [branchIdB]) => {
                    // Sort open branches first
                    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    const isOpenA = dayNames.some(day => {
                      const hours = getBusinessHours(branchIdA, day)
                      return hours.isOpen && hours.shifts.length > 0
                    })
                    const isOpenB = dayNames.some(day => {
                      const hours = getBusinessHours(branchIdB, day)
                      return hours.isOpen && hours.shifts.length > 0
                    })

                    if (isOpenA && !isOpenB) return -1
                    if (!isOpenA && isOpenB) return 1
                    return 0
                  })
                  .map(([branchId, branchRooms]) => {
                    const showBranchHeader = selectedBranch === 'all' // Only show header when viewing all branches

                    return (
                      <Box key={branchId}>
                        {/* Branch header cell - matches left sidebar branch header height - only show when all branches selected */}
                        {showBranchHeader && (
                          <Box
                            sx={{
                              height: '33px',
                              borderBottom: 1,
                              borderColor: 'divider',
                              bgcolor: 'action.selected'
                            }}
                          />
                        )}

                        {/* Room cells in this branch */}
                        {branchRooms.map(room => {
                          const dayOfWeek = WEEK_DAYS[date.getDay()] as DayOfWeek
                          const schedule = getRoomSchedule(room.id, dayOfWeek)
                          const isFlexible = room.roomType !== 'static'
                          const businessHours = isFlexible ? getBusinessHours(room.branchId, dayOfWeek) : null
                          const hasSchedule = isFlexible
                            ? businessHours?.isOpen && businessHours.shifts.length > 0
                            : schedule.isAvailable && schedule.shifts.length > 0
                          const shiftServices =
                            hasSchedule && !isFlexible
                              ? mockServices.filter(s => schedule.shifts.some(shift => shift.serviceIds.includes(s.id)))
                              : []

                          return (
                            <Box
                              key={room.id}
                              sx={{
                                height: 80,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderBottom: 1,
                                borderColor: 'divider',
                                position: 'relative',
                                p: 1
                              }}
                            >
                              {hasSchedule ? (
                                <Box
                                  onClick={() => handleEditShift(room, schedule.shifts[0] || null, dayOfWeek)}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    bgcolor: isFlexible
                                      ? theme => (theme.palette.mode === 'dark' ? '#1a237e' : '#E3F2FD')
                                      : 'rgba(139, 195, 74, 0.3)',
                                    borderRadius: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 1,
                                    borderColor: isFlexible
                                      ? theme => (theme.palette.mode === 'dark' ? '#3949ab' : '#64B5F6')
                                      : 'success.light',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    p: 0.5,
                                    '&:hover': {
                                      bgcolor: isFlexible
                                        ? theme => (theme.palette.mode === 'dark' ? '#283593' : '#BBDEFB')
                                        : 'rgba(139, 195, 74, 0.4)',
                                      transform: 'scale(1.02)'
                                    }
                                  }}
                                >
                                  <Typography variant='caption' fontWeight={500} color='text.primary' sx={{ mb: 0.5 }}>
                                    {isFlexible
                                      ? 'Open'
                                      : `${schedule.shifts.length} shift${schedule.shifts.length > 1 ? 's' : ''}`}
                                  </Typography>
                                  {shiftServices.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, justifyContent: 'center' }}>
                                      {shiftServices.slice(0, 2).map(service => (
                                        <Chip
                                          key={service.id}
                                          label={service.name}
                                          size='small'
                                          sx={{
                                            height: 14,
                                            fontSize: '0.55rem',
                                            bgcolor: service.color ? `${service.color}20` : 'rgba(0,0,0,0.08)',
                                            color: service.color || 'text.primary',
                                            border: service.color ? `1px solid ${service.color}40` : 'none',
                                            fontWeight: 500,
                                            '& .MuiChip-label': { px: 0.5 }
                                          }}
                                        />
                                      ))}
                                      {shiftServices.length > 2 && (
                                        <Chip
                                          label={`+${shiftServices.length - 2}`}
                                          size='small'
                                          sx={{
                                            height: 14,
                                            fontSize: '0.55rem',
                                            bgcolor: 'rgba(0,0,0,0.08)',
                                            '& .MuiChip-label': { px: 0.5 }
                                          }}
                                        />
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              ) : (
                                <Box
                                  onClick={() => handleEditShift(room, null, dayOfWeek)}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    bgcolor: 'grey.200',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      bgcolor: 'grey.300'
                                    }
                                  }}
                                >
                                  <Typography variant='caption' color='text.disabled'>
                                    Closed
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )
                        })}
                      </Box>
                    )
                  })}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Week View Footer */}
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
          onClick={() => setSelectedDate(startOfWeek(new Date()))}
          sx={{ borderRadius: 2, textTransform: 'uppercase', px: 3 }}
        >
          Current Week
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={handleAddRoom}
          sx={{ textTransform: 'uppercase' }}
        >
          Add Room
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
        roomServiceIds={scheduleEditorContext?.roomServiceIds}
      />

      {/* Room Edit Weekly Schedule Modal */}
      {weeklyScheduleContext && (
        <RoomEditWorkingHoursModal
          open={isWeeklyScheduleModalOpen}
          onClose={handleCloseWeeklyScheduleModal}
          roomId={weeklyScheduleContext.roomId}
          roomName={weeklyScheduleContext.roomName}
          roomType={weeklyScheduleContext.roomType}
          defaultCapacity={weeklyScheduleContext.defaultCapacity}
          roomServiceIds={weeklyScheduleContext.roomServiceIds}
          referenceDate={selectedDate}
        />
      )}

      {/* Room Actions Menu */}
      <Menu
        anchorEl={roomMenuAnchor}
        open={roomMenuOpen}
        onClose={handleCloseRoomMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEditWeeklyScheduleFromMenu}>
          <ListItemIcon>
            <i className='ri-calendar-schedule-line' />
          </ListItemIcon>
          <ListItemText>EDIT WEEKLY HOURS</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditScheduleFromMenu}>
          <ListItemIcon>
            <i className='ri-time-line' />
          </ListItemIcon>
          <ListItemText>EDIT TODAY'S SCHEDULE</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditRoomFromMenu}>
          <ListItemIcon>
            <i className='ri-edit-line' />
          </ListItemIcon>
          <ListItemText>EDIT ROOM</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteRoomFromMenu}>
          <ListItemIcon>
            <i className='ri-delete-bin-line' />
          </ListItemIcon>
          <ListItemText>DELETE ROOM</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleToggleRoomType}>
          <ListItemIcon>
            <i className={selectedRoomForMenu?.roomType === 'static' ? 'ri-equalizer-line' : 'ri-lock-line'} />
          </ListItemIcon>
          <ListItemText>
            {selectedRoomForMenu?.roomType === 'static' ? 'SWITCH TO FLEXIBLE' : 'SWITCH TO FIXED'}
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth='xs' fullWidth>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{roomToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant='contained' color='error' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
