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
  Divider
} from '@mui/material'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { mockBranches, mockServices } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { CalendarPopover } from './calendar-popover'
import { RoomEditorDrawer } from './room-editor-drawer'
import { RoomScheduleEditor } from './room-schedule-editor'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Generate timeline hours based on business hours for a specific day
function generateTimelineHours(dayOfWeek: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'): string[] {
  // Using 9 AM to 8 PM as default hours for rooms
  const hours: string[] = []
  for (let hour = 9; hour <= 20; hour++) {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const period = hour >= 12 ? 'PM' : 'AM'
    hours.push(`${displayHour}:00 ${period}`)
  }
  return hours
}

// Get time range for rooms (in minutes from midnight)
function getTimeRange(): { start: number; end: number } {
  return { start: 9 * 60, end: 20 * 60 }
}

function timeToPosition(time: string): number {
  const [hourStr, period] = time.split(' ')
  let [hours, minutes = 0] = hourStr.split(':').map(Number)

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const totalMinutes = hours * 60 + minutes
  const { start: startMinutes, end: endMinutes } = getTimeRange()

  return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
}

function calculateWidth(start: string, end: string): number {
  const startPos = timeToPosition(start)
  const endPos = timeToPosition(end)
  return endPos - startPos
}

export function RoomsTab() {
  const [viewMode, setViewMode] = useState('Day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBranch, setSelectedBranch] = useState(() => {
    // Default to main branch or first branch instead of 'all'
    const mainBranch = mockBranches.find(b => b.isMainBranch)
    return mainBranch?.id || mockBranches[0]?.id || 'all'
  })
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null)
  const [isRoomEditorOpen, setIsRoomEditorOpen] = useState(false)
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<any>(null)
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false)
  const [scheduleEditorContext, setScheduleEditorContext] = useState<{
    roomId: string
    roomName: string
    dayOfWeek: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
    initialShift?: { start: string; end: string; serviceIds: string[] } | null
  } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; name: string } | null>(null)
  const [roomMenuAnchor, setRoomMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedRoomForMenu, setSelectedRoomForMenu] = useState<any>(null)

  const calendarOpen = Boolean(calendarAnchor)
  const roomMenuOpen = Boolean(roomMenuAnchor)

  const { rooms, getRoomsForBranch, getRoomSchedule, deleteRoom, updateRoomType } = useStaffManagementStore()

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

  const handleEditShift = (room: any, shift: any | null, dayOfWeek: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat') => {
    setScheduleEditorContext({
      roomId: room.id,
      roomName: room.name,
      dayOfWeek,
      initialShift: shift
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

  const weekStart = startOfWeek(selectedDate)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

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
          </Box>
          <i className='ri-arrow-down-s-line' style={{ fontSize: '1.2rem' }} />
        </Box>
        <IconButton size='small' onClick={handleNextPeriod}>
          <i className='ri-arrow-right-s-line' />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title='Add Room'>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          size='small'
          onClick={handleAddRoom}
        >
          Add Room
        </Button>
      </Tooltip>
    </Box>
  )

  const renderRoomRow = (room: any) => {
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as
      | 'Sun'
      | 'Mon'
      | 'Tue'
      | 'Wed'
      | 'Thu'
      | 'Fri'
      | 'Sat'
    const schedule = getRoomSchedule(room.id, dayOfWeek)

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

    // Calculate dynamic height based on number of shifts
    const rowHeight = schedule.shifts.length > 0 ? Math.max(80, schedule.shifts.length * 50) : 80

    return (
      <Box key={room.id} sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: rowHeight }}>
        <Box sx={{ width: 250, display: 'flex', alignItems: 'center', gap: 1, p: 2, flexShrink: 0 }}>
          <Box
            sx={{
              width: 8,
              height: 40,
              borderRadius: 1,
              bgcolor: room.color || 'primary.main',
              mr: 1
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={600}>
              {room.name}
            </Typography>
            <Typography variant='caption' color='text.secondary' display='block'>
              <i className='ri-group-line' style={{ fontSize: 12, marginRight: 2 }} />
              Capacity: {room.capacity}
            </Typography>
            {room.serviceIds && room.serviceIds.length > 0 && (
              <Chip
                label={`${room.serviceIds.length} service${room.serviceIds.length > 1 ? 's' : ''}`}
                size='small'
                sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Tooltip title='More Options'>
              <IconButton size='small' onClick={(e) => handleOpenRoomMenu(e, room)}>
                <i className='ri-more-2-fill' style={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ flex: 1, position: 'relative', m: 1 }}>
          {schedule.isAvailable && schedule.shifts.length > 0 ? (
            schedule.shifts.map((shift, idx) => {
              const shiftStart = formatTime12Hour(shift.start)
              const shiftEnd = formatTime12Hour(shift.end)
              const shiftServices = mockServices.filter(s => shift.serviceIds?.includes(s.id))

              return (
                <Box
                  key={idx}
                  onClick={() => handleEditShift(room, shift, dayOfWeek)}
                  sx={{
                    position: 'absolute',
                    left: `${timeToPosition(shiftStart)}%`,
                    width: `${calculateWidth(shiftStart, shiftEnd)}%`,
                    top: idx * 48 + 2,
                    height: 42,
                    bgcolor: theme => theme.palette.mode === 'dark' ? '#424242' : '#E8F5E9',
                    borderRadius: 1,
                    border: 1,
                    borderColor: theme => theme.palette.mode === 'dark' ? '#616161' : '#81C784',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 0.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    '&:hover': {
                      bgcolor: theme => theme.palette.mode === 'dark' ? '#616161' : '#C8E6C9',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                      zIndex: 10
                    }
                  }}
                >
                  <Typography variant='caption' fontWeight={500} color='text.primary' sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                    {shiftStart.toLowerCase()} - {shiftEnd.toLowerCase()}
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
                Click to add schedule
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  if (viewMode === 'Day') {
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as
      | 'Sun'
      | 'Mon'
      | 'Tue'
      | 'Wed'
      | 'Thu'
      | 'Fri'
      | 'Sat'
    const timelineHours = generateTimelineHours(dayOfWeek)

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {renderHeader()}

        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 2 }}>
            <Box sx={{ width: 250, p: 2, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
              <Typography variant='body2' fontWeight={600}>
                Rooms
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex' }}>
              {timelineHours.map((hour, idx) => (
                <Box key={idx} sx={{ flex: 1, textAlign: 'center', py: 1, borderRight: idx < timelineHours.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Typography variant='caption' color='text.secondary'>
                    {hour}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Rooms grouped by branches */}
          {Object.entries(roomsByBranch).map(([branchId, branchRooms]) => {
            const branch = mockBranches.find(b => b.id === branchId)

            return (
              <Box key={branchId}>
                {/* Branch Header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: 'action.selected',
                    borderBottom: 2,
                    borderColor: 'divider',
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
          <MenuItem onClick={handleDeleteRoomFromMenu}>
            <ListItemIcon>
              <i className='ri-delete-bin-line' />
            </ListItemIcon>
            <ListItemText>DELETE ROOM</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleToggleRoomType}>
            <ListItemIcon>
              <i className={selectedRoomForMenu?.roomType === 'static' ? 'ri-user-follow-line' : 'ri-calendar-2-line'} />
            </ListItemIcon>
            <ListItemText>
              {selectedRoomForMenu?.roomType === 'static'
                ? 'SWITCH TO FLEXIBLE SCHEDULING'
                : 'SWITCH TO SHIFT-BASED SCHEDULING'}
            </ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    )
  }

  // Week View
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {renderHeader()}

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
          <Box sx={{ width: 200, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider' }} />

            {Object.entries(roomsByBranch).map(([branchId, branchRooms]) => {
              const branch = mockBranches.find(b => b.id === branchId)
              return (
                <Box key={branchId}>
                  {/* Branch Header */}
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
                        <Typography variant='body2' fontWeight={600} noWrap>
                          {room.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' display='block'>
                          Cap: {room.capacity}
                        </Typography>
                      </Box>
                      <Tooltip title='More Options'>
                        <IconButton size='small' onClick={(e) => handleOpenRoomMenu(e, room)}>
                          <i className='ri-more-2-fill' style={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              )
            })}
          </Box>

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

                {/* Room cells grouped by branches */}
                {Object.entries(roomsByBranch).map(([branchId, branchRooms]) => (
                  <Box key={branchId}>
                    {/* Branch header cell - matches left sidebar branch header height */}
                    <Box sx={{ height: '33px', borderBottom: 1, borderColor: 'divider', bgcolor: 'action.selected' }} />

                    {/* Room cells in this branch */}
                    {branchRooms.map(room => {
                      const dayOfWeek = WEEK_DAYS[date.getDay()] as 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
                      const schedule = getRoomSchedule(room.id, dayOfWeek)
                      const hasAvailability = schedule.isAvailable && schedule.shifts.length > 0
                      const shiftServices = hasAvailability
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
                          {hasAvailability ? (
                            <Box
                              onClick={() => handleEditShift(room, schedule.shifts[0], dayOfWeek)}
                              sx={{
                                width: '100%',
                                height: '100%',
                                bgcolor: theme => theme.palette.mode === 'dark' ? '#424242' : '#E8F5E9',
                                borderRadius: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 1,
                                borderColor: theme => theme.palette.mode === 'dark' ? '#616161' : '#81C784',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                p: 0.5,
                                '&:hover': {
                                  bgcolor: theme => theme.palette.mode === 'dark' ? '#616161' : '#C8E6C9',
                                  transform: 'scale(1.02)'
                                }
                              }}
                            >
                              <Typography variant='caption' fontWeight={500} color='text.primary' sx={{ mb: 0.5 }}>
                                {schedule.shifts.length} shift{schedule.shifts.length > 1 ? 's' : ''}
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
                                        height: 14,
                                        fontSize: '0.55rem',
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
                          ) : (
                            <Box
                              sx={{
                                width: '100%',
                                height: '100%',
                                bgcolor: 'grey.200',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
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
                ))}
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

      {/* Room Editor Drawer (shared with Day view) */}
      <RoomEditorDrawer
        open={isRoomEditorOpen}
        onClose={handleCloseRoomEditor}
        room={selectedRoomForEdit}
        selectedBranchId={selectedBranch !== 'all' ? selectedBranch : null}
      />

      {/* Room Schedule Editor (shared with Day view) */}
      <RoomScheduleEditor
        open={isScheduleEditorOpen}
        onClose={handleCloseScheduleEditor}
        roomId={scheduleEditorContext?.roomId || null}
        roomName={scheduleEditorContext?.roomName || ''}
        dayOfWeek={scheduleEditorContext?.dayOfWeek || null}
        initialShift={scheduleEditorContext?.initialShift}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth='xs'
        fullWidth
      >
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
        <MenuItem onClick={handleDeleteRoomFromMenu}>
          <ListItemIcon>
            <i className='ri-delete-bin-line' />
          </ListItemIcon>
          <ListItemText>DELETE ROOM</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleToggleRoomType}>
          <ListItemIcon>
            <i className={selectedRoomForMenu?.roomType === 'static' ? 'ri-user-follow-line' : 'ri-calendar-2-line'} />
          </ListItemIcon>
          <ListItemText>
            {selectedRoomForMenu?.roomType === 'static'
              ? 'SWITCH TO FLEXIBLE SCHEDULING'
              : 'SWITCH TO SHIFT-BASED SCHEDULING'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}
