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
  TextField,
  Grid
} from '@mui/material'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { mockBranches, mockServices } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { CalendarPopover } from './calendar-popover'

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
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null)
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false)
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false)
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<any>(null)
  const [isShiftEditDialogOpen, setIsShiftEditDialogOpen] = useState(false)
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState<any>(null)

  const calendarOpen = Boolean(calendarAnchor)

  const { rooms, getRoomsForBranch, getRoomSchedule } = useStaffManagementStore()

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
    setIsEditRoomDialogOpen(true)
  }

  const handleEditShift = (room: any, shift: any, dayOfWeek: string) => {
    setSelectedShiftForEdit({ room, shift, dayOfWeek })
    setIsShiftEditDialogOpen(true)
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
          onClick={() => setIsAddRoomDialogOpen(true)}
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

    return (
      <Box key={room.id} sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: 80 }}>
        <Box sx={{ width: 250, display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
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
          </Box>
          <IconButton size='small' onClick={() => handleEditRoom(room)}>
            <i className='ri-edit-line' style={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, position: 'relative', m: 1 }}>
          {schedule.isAvailable && schedule.shifts.length > 0 ? (
            schedule.shifts.map((shift, idx) => {
              const shiftStart = formatTime12Hour(shift.start)
              const shiftEnd = formatTime12Hour(shift.end)
              const shiftServices = mockServices.filter(s => shift.serviceIds.includes(s.id))

              return (
                <Box
                  key={idx}
                  onClick={() => handleEditShift(room, shift, dayOfWeek)}
                  sx={{
                    position: 'absolute',
                    left: `${timeToPosition(shiftStart)}%`,
                    width: `${calculateWidth(shiftStart, shiftEnd)}%`,
                    top: idx * 45,
                    minHeight: 40,
                    bgcolor: `${room.color}40` || 'rgba(25, 118, 210, 0.2)',
                    borderRadius: 1,
                    border: 1,
                    borderColor: room.color || 'primary.main',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 0.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: `${room.color}60` || 'rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Typography variant='caption' fontWeight={500} color='text.primary' sx={{ fontSize: '0.65rem' }}>
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
                Closed
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
          <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ width: 250, p: 2 }}>
              <Typography variant='body2' fontWeight={600}>
                Rooms
              </Typography>
            </Box>
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

        {/* Add Room Dialog */}
        <Dialog open={isAddRoomDialogOpen} onClose={() => setIsAddRoomDialogOpen(false)} maxWidth='sm' fullWidth>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField fullWidth label='Room Name' placeholder='e.g., Studio A' />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Select displayEmpty>
                    <MenuItem value=''>Select Branch</MenuItem>
                    {mockBranches.map(branch => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Capacity' type='number' placeholder='e.g., 20' />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label='Floor' placeholder='e.g., 1st Floor' />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label='Color' type='color' defaultValue='#1976d2' />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddRoomDialogOpen(false)}>Cancel</Button>
            <Button variant='contained' onClick={() => setIsAddRoomDialogOpen(false)}>
              Add Room
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Room Dialog */}
        <Dialog open={isEditRoomDialogOpen} onClose={() => setIsEditRoomDialogOpen(false)} maxWidth='sm' fullWidth>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogContent>
            {selectedRoomForEdit && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <TextField fullWidth label='Room Name' defaultValue={selectedRoomForEdit.name} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Capacity' type='number' defaultValue={selectedRoomForEdit.capacity} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Floor' defaultValue={selectedRoomForEdit.floor || ''} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label='Color' type='color' defaultValue={selectedRoomForEdit.color} />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditRoomDialogOpen(false)}>Cancel</Button>
            <Button variant='contained' onClick={() => setIsEditRoomDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Shift Dialog */}
        <Dialog open={isShiftEditDialogOpen} onClose={() => setIsShiftEditDialogOpen(false)} maxWidth='sm' fullWidth>
          <DialogTitle>Edit Room Shift</DialogTitle>
          <DialogContent>
            {selectedShiftForEdit && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Room: {selectedShiftForEdit.room.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Start Time'
                    type='time'
                    defaultValue={selectedShiftForEdit.shift.start}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='End Time'
                    type='time'
                    defaultValue={selectedShiftForEdit.shift.end}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='body2' gutterBottom>
                    Assigned Services:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {mockServices
                      .filter(s => selectedShiftForEdit.shift.serviceIds.includes(s.id))
                      .map(service => (
                        <Chip key={service.id} label={service.name} onDelete={() => {}} />
                      ))}
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsShiftEditDialogOpen(false)}>Cancel</Button>
            <Button variant='contained' onClick={() => setIsShiftEditDialogOpen(false)}>
              Save Changes
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
          <Box sx={{ width: 200, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider' }} />

            {displayRooms.map(room => (
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
                <IconButton size='small' onClick={() => handleEditRoom(room)}>
                  <i className='ri-edit-line' style={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
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

                {displayRooms.map(room => {
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
                            bgcolor: `${room.color}40` || 'rgba(25, 118, 210, 0.2)',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 1,
                            borderColor: room.color || 'primary.main',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            p: 0.5,
                            '&:hover': {
                              bgcolor: `${room.color}60` || 'rgba(25, 118, 210, 0.4)',
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

      {/* Edit Room Dialog (shared with Day view) */}
      <Dialog open={isEditRoomDialogOpen} onClose={() => setIsEditRoomDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          {selectedRoomForEdit && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField fullWidth label='Room Name' defaultValue={selectedRoomForEdit.name} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Capacity' type='number' defaultValue={selectedRoomForEdit.capacity} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Floor' defaultValue={selectedRoomForEdit.floor || ''} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label='Color' type='color' defaultValue={selectedRoomForEdit.color} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditRoomDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={() => setIsEditRoomDialogOpen(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Shift Dialog (shared with Day view) */}
      <Dialog open={isShiftEditDialogOpen} onClose={() => setIsShiftEditDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Edit Room Shift</DialogTitle>
        <DialogContent>
          {selectedShiftForEdit && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Room: {selectedShiftForEdit.room.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Start Time'
                  type='time'
                  defaultValue={selectedShiftForEdit.shift.start}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='End Time'
                  type='time'
                  defaultValue={selectedShiftForEdit.shift.end}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='body2' gutterBottom>
                  Assigned Services:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {mockServices
                    .filter(s => selectedShiftForEdit.shift.serviceIds.includes(s.id))
                    .map(service => (
                      <Chip key={service.id} label={service.name} onDelete={() => {}} />
                    ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsShiftEditDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={() => setIsShiftEditDialogOpen(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
