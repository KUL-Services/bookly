'use client'

import { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  Paper,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  Badge
} from '@mui/material'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { BusinessHoursModal } from './business-hours-modal'
import { StaffEditWorkingHoursModal } from './staff-edit-working-hours-modal'
import { TimeOffModal } from './time-off-modal'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const TIMELINE_HOURS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
  '10:00 PM',
  '11:00 PM',
  '12:00 AM'
]

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function timeToPosition(time: string): number {
  const [hourStr, period] = time.split(' ')
  let [hours, minutes = 0] = hourStr.split(':').map(Number)

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const totalMinutes = hours * 60 + minutes
  const startMinutes = 10 * 60
  const endMinutes = 24 * 60

  return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
}

function calculateWidth(start: string, end: string): number {
  const startPos = timeToPosition(start)
  const endPos = timeToPosition(end)
  return endPos - startPos
}

// Add drag and drop types
interface DragData {
  type: 'shift'
  staffId: string
  shiftId: string
  originalTime: { start: string; end: string }
}

interface DropData {
  type: 'timeSlot'
  timeSlot: string
  date: Date
}

// Draggable Shift Component
function DraggableShift({
  shiftData,
  children,
  onEdit
}: {
  shiftData: DragData
  children: React.ReactNode
  onEdit: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `shift-${shiftData.staffId}-${shiftData.shiftId}`,
    data: shiftData
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        bgcolor: 'rgba(139, 195, 74, 0.3)',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 1,
        borderColor: 'success.light',
        '&:hover': {
          bgcolor: 'rgba(139, 195, 74, 0.4)',
          borderColor: 'success.main'
        }
      }}
      onDoubleClick={onEdit}
    >
      {children}
    </Box>
  )
}

// Droppable Time Slot Component
function DroppableTimeSlot({ dropData, children }: { dropData: DropData; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `timeslot-${dropData.timeSlot}-${dropData.date.getTime()}`,
    data: dropData
  })

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 1,
        position: 'relative',
        m: 1,
        borderRadius: 1,
        border: isOver ? '2px dashed' : '1px solid transparent',
        borderColor: isOver ? 'primary.main' : 'transparent',
        bgcolor: isOver ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {children}
    </Box>
  )
}

// Bulk Operations Dialog
function BulkOperationsDialog({
  open,
  onClose,
  selectedStaff,
  onApply
}: {
  open: boolean
  onClose: () => void
  selectedStaff: string[]
  onApply: (operation: string, params: any) => void
}) {
  const [operation, setOperation] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [reason, setReason] = useState('')

  const handleApply = () => {
    onApply(operation, {
      startTime,
      endTime,
      selectedDays,
      reason,
      staffIds: selectedStaff
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        Bulk Operations
        <Typography variant='caption' display='block' color='text.secondary'>
          {selectedStaff.length} staff member(s) selected
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <FormControl fullWidth>
            <Select value={operation} onChange={e => setOperation(e.target.value)} displayEmpty>
              <MenuItem value=''>Select Operation</MenuItem>
              <MenuItem value='setWorkingHours'>Set Working Hours</MenuItem>
              <MenuItem value='addTimeOff'>Add Time Off</MenuItem>
              <MenuItem value='copySchedule'>Copy Schedule</MenuItem>
              <MenuItem value='clearSchedule'>Clear Schedule</MenuItem>
            </Select>
          </FormControl>

          {operation === 'setWorkingHours' && (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label='Start Time'
                  type='time'
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label='End Time'
                  type='time'
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
              <Box>
                <Typography variant='body2' gutterBottom>
                  Apply to days:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          checked={selectedDays.includes(day)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedDays([...selectedDays, day])
                            } else {
                              setSelectedDays(selectedDays.filter(d => d !== day))
                            }
                          }}
                        />
                      }
                      label={day}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          {operation === 'addTimeOff' && (
            <TextField label='Reason' value={reason} onChange={e => setReason(e.target.value)} fullWidth />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleApply}
          variant='contained'
          disabled={!operation || (operation === 'setWorkingHours' && selectedDays.length === 0)}
        >
          Apply to {selectedStaff.length} Staff
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function ShiftsTab() {
  const [viewMode, setViewMode] = useState('Day')
  const [selectedStaff, setSelectedStaff] = useState('Staff')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)

  const [isBusinessHoursModalOpen, setIsBusinessHoursModalOpen] = useState(false)
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false)
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false)
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<{ id: string; name: string } | null>(null)

  const [staffMenuAnchor, setStaffMenuAnchor] = useState<null | HTMLElement>(null)
  const [staffMenuOpen, setStaffMenuOpen] = useState(false)

  const { timeOffRequests } = useStaffManagementStore()

  const displayStaff =
    selectedStaff === 'Staff' ? mockStaff.slice(0, 2) : mockStaff.filter(s => s.name === selectedStaff)

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

  const handleOpenBusinessHoursModal = () => {
    setIsBusinessHoursModalOpen(true)
  }

  const handleOpenStaffMenu = (event: React.MouseEvent<HTMLElement>, staff: { id: string; name: string }) => {
    setStaffMenuAnchor(event.currentTarget)
    setSelectedStaffForEdit(staff)
    setStaffMenuOpen(true)
  }

  const handleCloseStaffMenu = () => {
    setStaffMenuOpen(false)
  }

  const handleOpenWorkingHoursModal = () => {
    setIsWorkingHoursModalOpen(true)
    handleCloseStaffMenu()
  }

  const handleOpenTimeOffModal = () => {
    setIsTimeOffModalOpen(true)
    handleCloseStaffMenu()
  }

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event

    if (!over) return

    const dragData = active.data.current as DragData
    const dropData = over.data.current as DropData

    if (dragData?.type === 'shift' && dropData?.type === 'timeSlot') {
      console.log('Moving shift:', dragData, 'to:', dropData)
    }
  }, [])

  const handleBulkApply = useCallback((operation: string, params: any) => {
    console.log('Applying bulk operation:', operation, params)
  }, [])

  const toggleStaffSelection = useCallback((staffId: string) => {
    setSelectedStaffIds(prev => (prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]))
  }, [])

  const weekStart = startOfWeek(selectedDate)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getDateDisplay = () => {
    if (viewMode === 'Week') {
      const endDate = addDays(weekStart, 6)
      return `${format(weekStart, 'MMM d')} - ${format(endDate, 'MMM d')}`
    }
    return format(selectedDate, 'EEE, dd MMM')
  }

  const renderEnhancedHeader = () => (
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

      <FormControlLabel
        control={<Checkbox checked={bulkMode} onChange={e => setBulkMode(e.target.checked)} color='primary' />}
        label='Bulk Edit'
      />

      {bulkMode && (
        <Badge badgeContent={selectedStaffIds.length} color='primary'>
          <Button
            variant='outlined'
            startIcon={<i className='ri-edit-box-line' />}
            onClick={() => setBulkDialogOpen(true)}
            disabled={selectedStaffIds.length === 0}
          >
            Bulk Operations
          </Button>
        </Badge>
      )}

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size='small' onClick={handlePrevPeriod}>
          <i className='ri-arrow-left-s-line' />
        </IconButton>
        <Box sx={{ minWidth: 180, textAlign: 'center', py: 0.5, px: 2 }}>
          <Typography variant='body2' fontWeight={600}>
            {getDateDisplay()}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Closed
          </Typography>
        </Box>
        <IconButton size='small' onClick={handleNextPeriod}>
          <i className='ri-arrow-right-s-line' />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title='Print Schedule'>
        <IconButton size='small'>
          <i className='ri-printer-line' />
        </IconButton>
      </Tooltip>
      <Button variant='outlined' startIcon={<i className='ri-file-copy-line' />}>
        COPY
      </Button>
      <Button variant='contained' startIcon={<i className='ri-save-line' />}>
        SAVE
      </Button>
    </Box>
  )

  const renderEnhancedStaffRow = (staff: any) => {
    const isSelected = selectedStaffIds.includes(staff.id)
    const timeOff = timeOffRequests.find(
      req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, selectedDate)
    )

    return (
      <Box key={staff.id} sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: 60 }}>
        <Box sx={{ width: 200, display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
          {bulkMode && <Checkbox checked={isSelected} onChange={() => toggleStaffSelection(staff.id)} size='small' />}

          <Typography variant='body2' fontWeight={600}>
            {staff.name}
          </Typography>
          <IconButton size='small' onClick={e => handleOpenStaffMenu(e, { id: staff.id, name: staff.name })}>
            <i className='ri-edit-line' style={{ fontSize: 16 }} />
          </IconButton>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', fontSize: '0.65rem', color: 'text.secondary', ml: 'auto' }}
          >
            <Typography variant='caption'>D 9h/9h</Typography>
            <Typography variant='caption'>W 45h/45h</Typography>
            <Typography variant='caption'>M 149h 45min</Typography>
          </Box>
        </Box>

        <DroppableTimeSlot
          dropData={{
            type: 'timeSlot',
            timeSlot: '10:00-19:00',
            date: selectedDate
          }}
        >
          {!timeOff && (
            <DraggableShift
              shiftData={{
                type: 'shift',
                staffId: staff.id,
                shiftId: 'main-shift',
                originalTime: { start: '10:00', end: '19:00' }
              }}
              onEdit={() => handleOpenWorkingHoursModal()}
            >
              <Typography variant='body2' fontWeight={500} color='text.primary'>
                10:00 am - 7:00 pm
              </Typography>
              <IconButton size='small' sx={{ ml: 'auto', mr: 1, color: 'text.primary' }}>
                <i className='ri-drag-move-line' style={{ fontSize: 16 }} />
              </IconButton>
            </DraggableShift>
          )}
          {timeOff && (
            <Box
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
                justifyContent: 'center'
              }}
            >
              <Typography variant='body2' sx={{ color: '#fff' }} fontWeight={500}>
                {timeOff.reason} (9h)
              </Typography>
            </Box>
          )}
        </DroppableTimeSlot>
      </Box>
    )
  }

  if (viewMode === 'Day') {
    return (
      <DndContext onDragEnd={handleDragEnd}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          {renderEnhancedHeader()}

          <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ width: 200, p: 2 }}>
                {bulkMode && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        indeterminate={selectedStaffIds.length > 0 && selectedStaffIds.length < displayStaff.length}
                        checked={selectedStaffIds.length === displayStaff.length}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedStaffIds(displayStaff.map(s => s.id))
                          } else {
                            setSelectedStaffIds([])
                          }
                        }}
                      />
                    }
                    label='Select All'
                  />
                )}
              </Box>
              <Box sx={{ flex: 1, display: 'flex', px: 2 }}>
                {TIMELINE_HOURS.map((hour, idx) => (
                  <Box key={idx} sx={{ flex: 1, textAlign: 'center', py: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      {hour}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: 60 }}>
              <Box sx={{ width: 200, display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                <Typography variant='body2' fontWeight={600}>
                  Business Hours
                </Typography>
                <Tooltip title='Edit Business Hours'>
                  <IconButton size='small' onClick={handleOpenBusinessHoursModal}>
                    <i className='ri-edit-line' style={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Typography variant='caption' color='text.secondary'>
                  Off
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#424242',
                  m: 1,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Typography variant='body2' sx={{ color: '#fff' }}>
                  Closed
                </Typography>
                <IconButton size='small' sx={{ color: '#fff', ml: 'auto', mr: 1 }}>
                  <i className='ri-edit-line' style={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>

            {displayStaff.map(renderEnhancedStaffRow)}
          </Box>

          <BulkOperationsDialog
            open={bulkDialogOpen}
            onClose={() => setBulkDialogOpen(false)}
            selectedStaff={selectedStaffIds}
            onApply={handleBulkApply}
          />

          <Menu
            anchorEl={staffMenuAnchor}
            open={staffMenuOpen}
            onClose={handleCloseStaffMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleOpenWorkingHoursModal}>
              <ListItemIcon>
                <i className='ri-time-line' />
              </ListItemIcon>
              <ListItemText>EDIT WORKING HOURS</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleOpenTimeOffModal}>
              <ListItemIcon>
                <i className='ri-calendar-close-line' />
              </ListItemIcon>
              <ListItemText>ADD TIME OFF</ListItemText>
            </MenuItem>
          </Menu>

          <BusinessHoursModal open={isBusinessHoursModalOpen} onClose={() => setIsBusinessHoursModalOpen(false)} />

          {selectedStaffForEdit && (
            <StaffEditWorkingHoursModal
              open={isWorkingHoursModalOpen}
              onClose={() => setIsWorkingHoursModalOpen(false)}
              staffId={selectedStaffForEdit.id}
              staffName={selectedStaffForEdit.name}
            />
          )}

          <TimeOffModal open={isTimeOffModalOpen} onClose={() => setIsTimeOffModalOpen(false)} />
        </Box>
      </DndContext>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {renderEnhancedHeader()}

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
          <Box sx={{ width: 150, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider' }} />

            <Box
              sx={{ height: 60, display: 'flex', alignItems: 'center', px: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Typography variant='body2' fontWeight={600}>
                Business Hours
              </Typography>
              <IconButton size='small' onClick={handleOpenBusinessHoursModal} sx={{ ml: 'auto' }}>
                <i className='ri-edit-line' style={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {displayStaff.map(staff => (
              <Box
                key={staff.id}
                sx={{
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body2' fontWeight={600}>
                    {staff.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Typography variant='caption' color='text.secondary'>
                      W 45h/45h
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      M 149h 45min/149h 45min
                    </Typography>
                  </Box>
                </Box>
                <IconButton size='small' onClick={e => handleOpenStaffMenu(e, { id: staff.id, name: staff.name })}>
                  <i className='ri-edit-line' style={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>

          {weekDates.map((date, dayIndex) => {
            const isToday = isSameDay(date, new Date())
            const dayName = WEEK_DAYS[dayIndex]

            return (
              <Box
                key={dayIndex}
                sx={{
                  minWidth: 150,
                  flexShrink: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                  bgcolor: isToday ? 'rgba(20, 184, 166, 0.05)' : 'transparent'
                }}
              >
                <Box
                  sx={{
                    height: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: isToday ? 'primary.main' : 'transparent',
                    color: isToday ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant='caption' fontWeight={600}>
                    {dayName} {format(date, 'd')}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'grey.900',
                    m: 1,
                    borderRadius: 1
                  }}
                >
                  <Typography variant='body2' color='white'>
                    Closed
                  </Typography>
                  <IconButton size='small' sx={{ ml: 'auto', mr: 0.5, color: 'white' }}>
                    <i className='ri-edit-line' style={{ fontSize: 14 }} />
                  </IconButton>
                </Box>

                {displayStaff.map(staff => {
                  const timeOff = timeOffRequests.find(
                    req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, date)
                  )

                  return (
                    <Box
                      key={staff.id}
                      sx={{
                        height: 60,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: 1,
                        borderColor: 'divider',
                        position: 'relative',
                        m: 1,
                        borderRadius: 1
                      }}
                    >
                      {!timeOff && (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: staff.id === '1' ? 'rgba(139, 195, 74, 0.3)' : 'rgba(255, 193, 7, 0.3)',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 1,
                            borderColor: staff.id === '1' ? 'success.light' : 'warning.light',
                            p: 0.5
                          }}
                        >
                          <Typography variant='caption' fontWeight={500} color='text.primary'>
                            10:00 am
                          </Typography>
                          <Typography variant='caption' fontWeight={500} color='text.primary'>
                            7:00 pm
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            9h (9h)
                          </Typography>
                          <IconButton
                            size='small'
                            sx={{ position: 'absolute', top: 2, right: 2, color: 'text.primary' }}
                            onClick={e => handleOpenStaffMenu(e, { id: staff.id, name: staff.name })}
                          >
                            <i className='ri-edit-line' style={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      )}
                      {timeOff && (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: '#424242',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 0.5
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant='caption' sx={{ color: '#fff' }} fontWeight={500}>
                              {timeOff.reason}
                            </Typography>
                            <Typography variant='caption' sx={{ color: '#fff' }} display='block'>
                              (9h) • Sick Day
                            </Typography>
                          </Box>
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

      <BulkOperationsDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        selectedStaff={selectedStaffIds}
        onApply={handleBulkApply}
      />

      <Menu
        anchorEl={staffMenuAnchor}
        open={staffMenuOpen}
        onClose={handleCloseStaffMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleOpenWorkingHoursModal}>
          <ListItemIcon>
            <i className='ri-time-line' />
          </ListItemIcon>
          <ListItemText>EDIT WORKING HOURS</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenTimeOffModal}>
          <ListItemIcon>
            <i className='ri-calendar-close-line' />
          </ListItemIcon>
          <ListItemText>ADD TIME OFF</ListItemText>
        </MenuItem>
      </Menu>

      <BusinessHoursModal open={isBusinessHoursModalOpen} onClose={() => setIsBusinessHoursModalOpen(false)} />

      {selectedStaffForEdit && (
        <StaffEditWorkingHoursModal
          open={isWorkingHoursModalOpen}
          onClose={() => setIsWorkingHoursModalOpen(false)}
          staffId={selectedStaffForEdit.id}
          staffName={selectedStaffForEdit.name}
        />
      )}

      <TimeOffModal open={isTimeOffModalOpen} onClose={() => setIsTimeOffModalOpen(false)} />
    </Box>
  )
}
