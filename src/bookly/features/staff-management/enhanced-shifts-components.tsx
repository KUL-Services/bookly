// Enhanced imports for drag-and-drop and bulk operations
import { useState } from 'react'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  Badge
} from '@mui/material'
import { TimeSelectField } from './time-select-field'

// Drag and drop types
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className='ri-edit-box-line' style={{ color: '#0a2c24' }} />
          <Typography variant='h6'>Bulk Operations</Typography>
        </Box>
        <Typography variant='caption' display='block' color='text.secondary'>
          Apply changes to {selectedStaff.length} staff member(s)
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <FormControl fullWidth>
            <Select value={operation} onChange={e => setOperation(e.target.value)} displayEmpty>
              <MenuItem value=''>Select Operation</MenuItem>
              <MenuItem value='setWorkingHours'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-time-line' />
                  Set Working Hours
                </Box>
              </MenuItem>
              <MenuItem value='addTimeOff'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-calendar-close-line' />
                  Add Time Off
                </Box>
              </MenuItem>
              <MenuItem value='copySchedule'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-file-copy-line' />
                  Copy Schedule
                </Box>
              </MenuItem>
              <MenuItem value='clearSchedule'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-delete-bin-line' />
                  Clear Schedule
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {operation === 'setWorkingHours' && (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TimeSelectField label='Start Time' value={startTime} onChange={setStartTime} fullWidth />
                <TimeSelectField label='End Time' value={endTime} onChange={setEndTime} fullWidth />
              </Box>
              <Box>
                <Typography variant='body2' gutterBottom sx={{ fontWeight: 500 }}>
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
                          size='small'
                        />
                      }
                      label={<Typography variant='body2'>{day}</Typography>}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          {operation === 'addTimeOff' && (
            <TextField
              label='Reason'
              value={reason}
              onChange={e => setReason(e.target.value)}
              fullWidth
              variant='outlined'
              placeholder='Enter time off reason...'
            />
          )}

          {operation === 'copySchedule' && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'info.light',
                borderRadius: 1,
                border: 1,
                borderColor: 'info.main'
              }}
            >
              <Typography variant='body2' color='info.dark'>
                This will copy the current week's schedule to the next week for selected staff members.
              </Typography>
            </Box>
          )}

          {operation === 'clearSchedule' && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'error.light',
                borderRadius: 1,
                border: 1,
                borderColor: 'error.main'
              }}
            >
              <Typography variant='body2' color='error.dark'>
                ⚠️ This will clear all scheduled shifts for selected staff members. This action cannot be undone.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant='contained'
          disabled={!operation || (operation === 'setWorkingHours' && selectedDays.length === 0)}
          startIcon={<i className='ri-check-line' />}
        >
          Apply to {selectedStaff.length} Staff
        </Button>
      </DialogActions>
    </Dialog>
  )
}
