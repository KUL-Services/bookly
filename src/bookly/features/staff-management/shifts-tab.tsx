'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  Badge,
  Popover,
  Divider
} from '@mui/material'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { mockStaff, mockBranches } from '@/bookly/data/mock-data'
import { mockBusinessHours } from '@/bookly/data/staff-management-mock-data'
import { useStaffManagementStore } from './staff-store'
import { BusinessHoursModal } from './business-hours-modal'
import { BusinessHoursDayEditorModal } from './business-hours-day-editor-modal'
import type { DayOfWeek } from '../calendar/types'
import { StaffEditWorkingHoursModal } from './staff-edit-working-hours-modal'
import { TimeOffModal } from './time-off-modal'
import { ShiftEditorModal } from './shift-editor-modal'
import { CalendarPopover } from './calendar-popover'
import { StaffTypeChangeDialog } from './staff-type-change-dialog'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { SpecialDaysModal } from './special-days-modal'

// Print Styles Component
function PrintStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @media print {
        @page {
          size: landscape;
          margin: 0.5cm;
        }

        #print-content {
          display: block !important;
        }

        /* Hide UI elements */
        button,
        .MuiIconButton-root,
        .no-print {
          display: none !important;
        }

        /* Ensure proper sizing */
        #print-content table {
          width: 100%;
          border-collapse: collapse;
        }

        #print-content th,
        #print-content td {
          border: 1px solid var(--mui-palette-divider);
          padding: 8px;
          text-align: left;
        }

        #print-content th {
          background-color: var(--mui-palette-customColors-tableHeaderBg);
          font-weight: 600;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  const [startHour, startMin] = shift.start.split(':').map(Number)
  const [endHour, endMin] = shift.end.split(':').map(Number)

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

function timeToPosition(time: string, dayOfWeek: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'): number {
  const [hourStr, period] = time.split(' ')
  let [hours, minutes = 0] = hourStr.split(':').map(Number)

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const totalMinutes = hours * 60 + minutes
  const { start: startMinutes, end: endMinutes } = getBusinessHoursRange(dayOfWeek)

  return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
}

function calculateWidth(
  start: string,
  end: string,
  dayOfWeek: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
): number {
  const startPos = timeToPosition(start, dayOfWeek)
  const endPos = timeToPosition(end, dayOfWeek)
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
        bgcolor: 'rgba(10, 44, 36, 0.3)',
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

export function ShiftsTab() {
  const [viewMode, setViewMode] = useState('Day')
  const [selectedStaff, setSelectedStaff] = useState('Staff')
  const [selectedBranch, setSelectedBranch] = useState(mockBranches[0]?.id || 'all')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
  const [bulkMode, setBulkMode] = useState(false)

  const [isBusinessHoursModalOpen, setIsBusinessHoursModalOpen] = useState(false)
  const [isBusinessHoursDayEditorOpen, setIsBusinessHoursDayEditorOpen] = useState(false)
  const [businessHoursDayEditorContext, setBusinessHoursDayEditorContext] = useState<{
    branchId: string
    date: Date
    dayOfWeek: DayOfWeek
  } | null>(null)
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false)
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false)
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<{ id: string; name: string } | null>(null)

  const [staffMenuAnchor, setStaffMenuAnchor] = useState<null | HTMLElement>(null)
  const [staffMenuOpen, setStaffMenuOpen] = useState(false)

  // ShiftEditorModal state
  const [isShiftEditorOpen, setIsShiftEditorOpen] = useState(false)
  const [shiftEditorContext, setShiftEditorContext] = useState<{
    staffId: string
    staffName: string
    staffType: 'dynamic' | 'static'
    date: Date
    hasShift: boolean
    startTime: string
    endTime: string
  } | null>(null)

  // TimeOffModal edit state
  const [editingTimeOffId, setEditingTimeOffId] = useState<string | undefined>(undefined)
  const [timeOffModalContext, setTimeOffModalContext] = useState<{
    staffId: string
    staffName: string
    date: Date
  } | null>(null)

  // Calendar popover state
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null)
  const calendarOpen = Boolean(calendarAnchor)

  // Staff type change dialog state
  const [isStaffTypeChangeDialogOpen, setIsStaffTypeChangeDialogOpen] = useState(false)
  const [staffTypeChangeContext, setStaffTypeChangeContext] = useState<{
    staffId: string
    staffName: string
    currentType: 'dynamic' | 'static'
    targetType: 'dynamic' | 'static'
  } | null>(null)

  const {
    timeOffRequests,
    getStaffWorkingHours,
    getStaffShiftsForDate,
    getBusinessHours,
    updateStaffType,
    getStaffType,
    getStaffTypeForDate,
    scheduleStaffTypeChange,
    getPendingStaffTypeChange,
    cancelStaffTypeChange,
    updateCounter,
    isSpecialDaysModalOpen,
    openSpecialDays,
    closeSpecialDays
  } = useStaffManagementStore()

  // Filter staff by branch and staff selection
  const displayStaff = useMemo(() => {
    // Show only the base 7 staff members (IDs 1-7), not the generated ones
    const baseStaff = mockStaff.filter(s => ['1', '2', '3', '4', '5', '6', '7'].includes(s.id))
    let filtered = selectedStaff === 'Staff' ? baseStaff : baseStaff.filter(s => s.name === selectedStaff)

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(s => s.branchId === selectedBranch)
    }

    return filtered
  }, [selectedStaff, selectedBranch])

  console.log('RENDER: ShiftsTab', { isSpecialDaysModalOpen })

  // Group staff by branch and sort by shift start time
  const staffByBranch = useMemo(() => {
    const grouped: Record<string, typeof mockStaff> = {}

    displayStaff.forEach(staff => {
      if (!grouped[staff.branchId]) grouped[staff.branchId] = []
      grouped[staff.branchId].push(staff)
    })

    // Sort staff within each branch: dynamic first, then static, then by shift start time
    Object.keys(grouped).forEach(branchId => {
      grouped[branchId].sort((a, b) => {
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as
          | 'Sun'
          | 'Mon'
          | 'Tue'
          | 'Wed'
          | 'Thu'
          | 'Fri'
          | 'Sat'

        // First, sort by type: dynamic (0) before static (1) - based on selected date
        const aType = getStaffTypeForDate(a.id, selectedDate) === 'dynamic' ? 0 : 1
        const bType = getStaffTypeForDate(b.id, selectedDate) === 'dynamic' ? 0 : 1
        if (aType !== bType) return aType - bType

        // Within the same type, sort by working status
        const aHours = getStaffWorkingHours(a.id, dayOfWeek)
        const bHours = getStaffWorkingHours(b.id, dayOfWeek)

        if (!aHours.isWorking) return 1 // Non-working to bottom
        if (!bHours.isWorking) return -1

        // Within working staff, sort by shift start time
        const aStart = aHours.shifts[0]?.start || '23:59'
        const bStart = bHours.shifts[0]?.start || '23:59'

        return aStart.localeCompare(bStart) // Earliest first
      })
    })

    return grouped
  }, [displayStaff, selectedDate, getStaffWorkingHours])

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
    setEditingTimeOffId(undefined)
    // Keep the selected staff context when opening from staff menu
    if (selectedStaffForEdit) {
      setTimeOffModalContext({
        staffId: selectedStaffForEdit.id,
        staffName: selectedStaffForEdit.name,
        date: selectedDate
      })
    } else {
      setTimeOffModalContext(null)
    }
    setIsTimeOffModalOpen(true)
    handleCloseStaffMenu()
  }

  const handleEditTimeOff = (timeOffId: string, staff: { id: string; name: string }, date: Date) => {
    setEditingTimeOffId(timeOffId)
    setTimeOffModalContext({
      staffId: staff.id,
      staffName: staff.name,
      date
    })
    setIsTimeOffModalOpen(true)
  }

  const openShiftEditor = (
    staff: { id: string; name: string },
    date: Date,
    existingShift?: { start: string; end: string } | null
  ) => {
    // Get staff type from store
    const staffType = getStaffType(staff.id)

    setShiftEditorContext({
      staffId: staff.id,
      staffName: staff.name,
      staffType,
      date,
      hasShift: !!existingShift,
      startTime: existingShift?.start || '10:00',
      endTime: existingShift?.end || '19:00'
    })
    setIsShiftEditorOpen(true)
  }

  const closeShiftEditor = () => {
    setIsShiftEditorOpen(false)
    setShiftEditorContext(null)
  }

  const handleShiftEditorSave = (data: { hasShift: boolean; startTime: string; endTime: string; breaks: any[] }) => {
    console.log('Saving shift data:', data, 'for context:', shiftEditorContext)
    // Here you would update your shift data store
    // For now, just log the data
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

  const handlePrint = () => {
    window.print()
  }

  const handleStaffTypeToggle = (staffId: string, staffName: string, newTypeChecked: boolean) => {
    const currentType = getStaffType(staffId)
    const targetType = newTypeChecked ? 'static' : 'dynamic'

    // Check if there's a pending change
    const pendingChange = getPendingStaffTypeChange(staffId)

    if (pendingChange) {
      // Cancel pending change and revert to original type
      cancelStaffTypeChange(staffId)
      return
    }

    // Open confirmation dialog
    setStaffTypeChangeContext({
      staffId,
      staffName,
      currentType,
      targetType
    })
    setIsStaffTypeChangeDialogOpen(true)
  }

  const handleStaffTypeChangeConfirm = (effectiveDate: Date) => {
    if (!staffTypeChangeContext) return

    scheduleStaffTypeChange(staffTypeChangeContext.staffId, staffTypeChangeContext.targetType, effectiveDate)
    setIsStaffTypeChangeDialogOpen(false)
    setStaffTypeChangeContext(null)
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

      <FormControl size='small' sx={{ minWidth: 120 }}>
        <Select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
          <MenuItem value='Staff'>Staff</MenuItem>
          {mockStaff
            .filter(s => ['1', '2', '3', '4', '5', '6', '7'].includes(s.id))
            .map(staff => (
              <MenuItem key={staff.id} value={staff.name}>
                {staff.name}
              </MenuItem>
            ))}
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

      <FormControlLabel
        control={<Checkbox checked={bulkMode} onChange={e => setBulkMode(e.target.checked)} color='primary' />}
        label='Bulk Edit'
      />

      {bulkMode && (
        <Badge badgeContent={selectedStaffIds.length} color='primary'>
          <Button
            variant='outlined'
            startIcon={<i className='ri-edit-box-line' />}
            onClick={() => {
              // Open working hours modal in bulk mode
              if (selectedStaffIds.length > 0) {
                const firstStaff = mockStaff.find(s => s.id === selectedStaffIds[0])
                setSelectedStaffForEdit({
                  id: selectedStaffIds[0],
                  name: firstStaff?.name || 'Staff'
                })
                setIsWorkingHoursModalOpen(true)
              }
            }}
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
                  return 'Multiple Branches'
                }

                const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as DayOfWeek
                const businessHours = getBusinessHours(selectedBranch, dayOfWeek)

                if (!businessHours.isOpen || businessHours.shifts.length === 0) {
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

      <Button
        variant='outlined'
        startIcon={<i className='ri-calendar-event-line' />}
        size='small'
        onClick={openSpecialDays}
      >
        SPECIAL DAYS
      </Button>
      <Button variant='outlined' startIcon={<i className='ri-file-copy-line' />} size='small'>
        COPY
      </Button>
      <Tooltip title='Print Schedule'>
        <IconButton size='small' onClick={handlePrint}>
          <i className='ri-printer-line' />
        </IconButton>
      </Tooltip>
    </Box>
  )

  const renderEnhancedStaffRow = (staff: any) => {
    const isSelected = selectedStaffIds.includes(staff.id)
    const timeOff = timeOffRequests.find(
      req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, selectedDate)
    )

    // Get the day of week from the selected date
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as
      | 'Sun'
      | 'Mon'
      | 'Tue'
      | 'Wed'
      | 'Thu'
      | 'Fri'
      | 'Sat'

    // Get shifts for this specific date (includes date-specific overrides)
    const dateStr = selectedDate.toISOString().split('T')[0]
    const shifts = getStaffShiftsForDate(staff.id, dateStr)
    const hasShift = !timeOff && shifts.length > 0 && shifts[0].start !== '00:00'

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

    // Get shift times from actual shifts for this date
    const firstShift = hasShift ? shifts[0] : null
    const shiftStart = firstShift ? formatTime12Hour(firstShift.start) : '10:00 AM'
    const shiftEnd = firstShift ? formatTime12Hour(firstShift.end) : '7:00 PM'

    // Calculate dynamic height based on number of shifts
    const containerMinHeight = shifts.length > 1 ? 80 + (shifts.length - 1) * 50 : 80

    return (
      <Box
        key={staff.id}
        sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: containerMinHeight }}
      >
        <Box sx={{ width: 200, display: 'flex', flexDirection: 'column', gap: 0.5, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {bulkMode && <Checkbox checked={isSelected} onChange={() => toggleStaffSelection(staff.id)} size='small' />}

            <Typography variant='body2' fontWeight={600} noWrap sx={{ flex: 1 }}>
              {staff.name}
            </Typography>
            <IconButton size='small' onClick={e => handleOpenStaffMenu(e, { id: staff.id, name: staff.name })}>
              <i className='ri-edit-line' style={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Staff Type Toggle */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(() => {
                // Get effective staff type for the selected date (reflects transitions)
                const effectiveStaffType = getStaffTypeForDate(staff.id, selectedDate)
                const pendingChange = getPendingStaffTypeChange(staff.id)

                return (
                  <>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={effectiveStaffType === 'static'}
                          onChange={e => {
                            handleStaffTypeToggle(staff.id, staff.name, e.target.checked)
                          }}
                          size='small'
                          color={pendingChange ? 'warning' : 'primary'}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <i
                            className={effectiveStaffType === 'static' ? 'ri-group-line' : 'ri-user-line'}
                            style={{ fontSize: 12 }}
                          />
                          <Typography variant='caption' fontSize='0.65rem'>
                            {effectiveStaffType === 'static' ? 'Static' : 'Dynamic'}
                          </Typography>
                        </Box>
                      }
                      sx={{ ml: 0, mr: 1 }}
                    />
                    <Tooltip
                      title={
                        effectiveStaffType === 'static' ? (
                          <Box sx={{ p: 1 }}>
                            <Typography
                              variant='caption'
                              fontWeight={600}
                              display='block'
                              gutterBottom
                              sx={{ fontSize: '0.75rem', color: 'var(--mui-palette-common-white)' }}
                            >
                              Static Staff / Rooms
                            </Typography>
                            <Typography
                              variant='caption'
                              display='block'
                              sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}
                            >
                              Resources with fixed, consistent schedules. They work the same hours every day (e.g.,
                              treatment rooms, equipment, or staff with fixed schedules).
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ p: 1 }}>
                            <Typography
                              variant='caption'
                              fontWeight={600}
                              display='block'
                              gutterBottom
                              sx={{ fontSize: '0.75rem', color: 'var(--mui-palette-common-white)' }}
                            >
                              Dynamic Staff
                            </Typography>
                            <Typography
                              variant='caption'
                              display='block'
                              sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}
                            >
                              Staff with flexible schedules. They work one-on-one with clients and can have varying
                              hours throughout the week.
                            </Typography>
                          </Box>
                        )
                      }
                      arrow
                      placement='right'
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: 'rgba(0, 0, 0, 0.9)',
                            maxWidth: 300,
                            '& .MuiTooltip-arrow': {
                              color: 'rgba(0, 0, 0, 0.9)'
                            }
                          }
                        }
                      }}
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
                {viewMode === 'Day' && (
                  <Typography variant='caption'>
                    {hasShift && firstShift
                      ? `D ${Math.floor((parseInt(firstShift.end.split(':')[0]) * 60 + parseInt(firstShift.end.split(':')[1]) - (parseInt(firstShift.start.split(':')[0]) * 60 + parseInt(firstShift.start.split(':')[1]))) / 60)}h`
                      : 'D 0h'}
                  </Typography>
                )}
                {viewMode === 'Week' && (
                  <>
                    <Typography variant='caption'>{hasShift ? 'D 8h' : 'D 0h'}</Typography>
                    <Typography variant='caption'>
                      W{' '}
                      {
                        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].filter(
                          day => getStaffWorkingHours(staff.id, day as any).isWorking
                        ).length
                      }
                      d
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
            {/* Pending Type Change Indicator */}
            {(() => {
              const pendingChange = getPendingStaffTypeChange(staff.id)
              return pendingChange ? (
                <Box sx={{ pl: 4 }}>
                  <Chip
                    label={
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 0.3 }}>
                        <Typography variant='caption' sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                          Changing to {pendingChange.toType}
                        </Typography>
                        <Typography variant='caption' sx={{ fontSize: '0.6rem', lineHeight: 1.2, opacity: 0.8 }}>
                          on {format(pendingChange.effectiveDate, 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    }
                    size='small'
                    color='warning'
                    variant='outlined'
                    icon={<i className='ri-calendar-event-line' style={{ fontSize: '0.7rem' }} />}
                    onDelete={() => cancelStaffTypeChange(staff.id)}
                    deleteIcon={<i className='ri-close-line' style={{ fontSize: '0.9rem' }} />}
                    sx={{
                      height: 'auto',
                      minHeight: 32,
                      fontSize: '0.65rem',
                      '& .MuiChip-label': { px: 1, py: 0.5 },
                      '& .MuiChip-icon': { ml: 0.5, alignSelf: 'flex-start', mt: 0.8 }
                    }}
                  />
                </Box>
              ) : null
            })()}
          </Box>
        </Box>

        <Box sx={{ flex: 1, position: 'relative', m: 1 }}>
          {hasShift &&
            !timeOff &&
            shifts.map((shift, idx) => {
              const shiftStart = formatTime12Hour(shift.start)
              const shiftEnd = formatTime12Hour(shift.end)
              const [startH, startM] = shift.start.split(':').map(Number)
              const [endH, endM] = shift.end.split(':').map(Number)
              const durationMinutes = endH * 60 + endM - (startH * 60 + startM)
              const hours = Math.floor(durationMinutes / 60)

              // Use date-based staff type to show transitions
              const staffTypeForDate = getStaffTypeForDate(staff.id, selectedDate)

              return (
                <Box key={shift.id}>
                  {/* Main Shift Box */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${timeToPosition(shiftStart, dayOfWeek)}%`,
                      width: `${calculateWidth(shiftStart, shiftEnd, dayOfWeek)}%`,
                      top: shifts.length > 1 ? `${idx * (100 / shifts.length)}%` : 0,
                      height: shifts.length > 1 ? `${Math.floor(90 / shifts.length)}%` : '100%',
                      bgcolor:
                        staffTypeForDate === 'dynamic'
                          ? 'rgba(10, 44, 36, 0.3)'
                          : theme =>
                              theme.palette.mode === 'dark' ? 'rgba(120, 120, 120, 0.3)' : 'rgba(158, 158, 158, 0.25)',
                      borderRadius: 1,
                      border: 1,
                      borderColor: staffTypeForDate === 'dynamic' ? 'success.light' : 'grey.400',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor:
                          staffTypeForDate === 'dynamic'
                            ? 'rgba(139, 195, 74, 0.4)'
                            : theme =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(120, 120, 120, 0.4)'
                                  : 'rgba(158, 158, 158, 0.35)',
                        borderColor: staffTypeForDate === 'dynamic' ? 'success.main' : 'grey.500'
                      }
                    }}
                  >
                    <Typography variant='caption' fontWeight={500} color='text.primary'>
                      {shiftStart.toLowerCase()}
                    </Typography>
                    <Typography variant='caption' fontWeight={500} color='text.primary'>
                      {shiftEnd.toLowerCase()}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                      {hours}h
                    </Typography>
                    {shifts.length > 1 && (
                      <Chip
                        label={`${idx + 1}/${shifts.length}`}
                        size='small'
                        sx={{ height: 16, fontSize: '0.6rem', position: 'absolute', top: 2, left: 2 }}
                      />
                    )}
                    <IconButton
                      size='small'
                      sx={{ position: 'absolute', top: 2, right: 2, color: 'text.primary' }}
                      onClick={e => {
                        e.stopPropagation()
                        openShiftEditor({ id: staff.id, name: staff.name }, selectedDate, {
                          start: shiftStart,
                          end: shiftEnd
                        })
                      }}
                    >
                      <i className='ri-edit-line' style={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>

                  {/* Break Boxes - Height is 1/3 of shift height */}
                  {shift.breaks &&
                    shift.breaks.map(breakItem => {
                      const breakStart = formatTime12Hour(breakItem.start)
                      const [breakStartH, breakStartM] = breakItem.start.split(':').map(Number)
                      const [breakEndH, breakEndM] = breakItem.end.split(':').map(Number)
                      const breakDurationMinutes = breakEndH * 60 + breakEndM - (breakStartH * 60 + breakStartM)

                      // Break height is 1/3 of the shift height, centered vertically
                      const shiftHeight = shifts.length > 1 ? 90 / shifts.length : 100
                      const breakHeight = shiftHeight / 3
                      const breakTop =
                        shifts.length > 1
                          ? idx * (100 / shifts.length) + (shiftHeight - breakHeight) / 2
                          : 100 - breakHeight

                      return (
                        <Box
                          key={breakItem.id}
                          sx={{
                            position: 'absolute',
                            left: `${timeToPosition(breakStart, dayOfWeek)}%`,
                            width: `${calculateWidth(breakItem.start, breakItem.end, dayOfWeek)}%`,
                            top: `${breakTop}%`,
                            height: `${breakHeight}%`,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            zIndex: 1
                          }}
                        >
                          <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                            Break ({breakDurationMinutes}min)
                          </Typography>
                        </Box>
                      )
                    })}
                </Box>
              )
            })}

          {!hasShift && !timeOff && (
            <Box
              onClick={() => openShiftEditor({ id: staff.id, name: staff.name }, selectedDate, null)}
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
                No Shift
              </Typography>
              <IconButton
                size='small'
                sx={{ position: 'absolute', top: 2, right: 2, color: 'text.secondary' }}
                onClick={e => {
                  e.stopPropagation()
                  openShiftEditor({ id: staff.id, name: staff.name }, selectedDate, null)
                }}
              >
                <i className='ri-edit-line' style={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}

          {timeOff && (
            <Box
              onClick={() => handleEditTimeOff(timeOff.id, { id: staff.id, name: staff.name }, selectedDate)}
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                bgcolor: 'secondary.dark',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'secondary.main'
                }
              }}
            >
              <Typography variant='body2' sx={{ color: 'secondary.contrastText' }} fontWeight={500}>
                {timeOff.reason} (9h)
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  if (viewMode === 'Day') {
    // Get the day of week for timeline generation
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
      <DndContext onDragEnd={handleDragEnd}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          <PrintStyles />
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
                {timelineHours.map((hour, idx) => (
                  <Box key={idx} sx={{ flex: 1, textAlign: 'center', py: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      {hour}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Business Hours - Only show when a specific branch is selected */}
            {selectedBranch !== 'all' &&
              (() => {
                const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as DayOfWeek
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
                  <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: 60 }}>
                    <Box
                      sx={{ width: 200, display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'action.hover' }}
                    >
                      <Typography variant='body2' fontWeight={600}>
                        Business Hours
                      </Typography>
                      <Tooltip title='Edit Business Hours'>
                        <IconButton size='small' onClick={handleOpenBusinessHoursModal}>
                          <i className='ri-edit-line' style={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Typography variant='caption' color='text.secondary'>
                        {isOpen ? 'On' : 'Off'}
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        setBusinessHoursDayEditorContext({
                          branchId: selectedBranch,
                          date: selectedDate,
                          dayOfWeek
                        })
                        setIsBusinessHoursDayEditorOpen(true)
                      }}
                      sx={{
                        flex: 1,
                        bgcolor: isOpen ? 'rgba(10, 44, 36, 0.2)' : 'secondary.dark',
                        m: 1,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        border: isOpen ? '1px solid' : 'none',
                        borderColor: isOpen ? 'success.main' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: isOpen ? 'rgba(10, 44, 36, 0.3)' : 'secondary.main'
                        }
                      }}
                    >
                      {isOpen ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant='body2' fontWeight={500}>
                            {formatTime(businessHours.shifts[0].start)} - {formatTime(businessHours.shifts[0].end)}
                          </Typography>
                          {businessHours.shifts.length > 1 && (
                            <Typography variant='caption' color='text.secondary'>
                              +{businessHours.shifts.length - 1} more shift{businessHours.shifts.length > 2 ? 's' : ''}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant='body2' sx={{ color: 'secondary.contrastText' }}>
                          Closed
                        </Typography>
                      )}
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          setBusinessHoursDayEditorContext({
                            branchId: selectedBranch,
                            date: selectedDate,
                            dayOfWeek
                          })
                          setIsBusinessHoursDayEditorOpen(true)
                        }}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          color: isOpen ? 'text.primary' : 'secondary.contrastText'
                        }}
                      >
                        <i className='ri-edit-line' style={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                )
              })()}

            {/* Staff grouped by branches - sorted by open/closed status */}
            {Object.entries(staffByBranch)
              .sort(([branchIdA], [branchIdB]) => {
                // Sort open branches first, closed branches last
                const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as DayOfWeek
                const hoursA = getBusinessHours(branchIdA, dayOfWeek)
                const hoursB = getBusinessHours(branchIdB, dayOfWeek)
                const isOpenA = hoursA.isOpen && hoursA.shifts.length > 0
                const isOpenB = hoursB.isOpen && hoursB.shifts.length > 0

                if (isOpenA && !isOpenB) return -1 // A open, B closed: A first
                if (!isOpenA && isOpenB) return 1 // A closed, B open: B first
                return 0 // Both same status: maintain order
              })
              .map(([branchId, branchStaff]) => {
                const branch = mockBranches.find(b => b.id === branchId)
                const showBranchHeader = selectedBranch === 'all' // Only show header when viewing all branches

                // Get business hours for this specific day
                const dayOfWeekForBranch = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
                  selectedDate.getDay()
                ] as DayOfWeek
                const branchBusinessHours = getBusinessHours(branchId, dayOfWeekForBranch)
                const isOpen = branchBusinessHours.isOpen && branchBusinessHours.shifts.length > 0

                // Format time from 24h to 12h
                const formatBranchTime = (time24: string) => {
                  const [hourStr, minStr] = time24.split(':')
                  let hour = parseInt(hourStr)
                  const minute = minStr
                  const period = hour >= 12 ? 'pm' : 'am'
                  if (hour === 0) hour = 12
                  else if (hour > 12) hour -= 12
                  return `${hour}:${minute}${period}`
                }

                const branchHoursDisplay = isOpen
                  ? `${formatBranchTime(branchBusinessHours.shifts[0].start)} - ${formatBranchTime(branchBusinessHours.shifts[0].end)}`
                  : 'Closed'

                return (
                  <Box key={branchId}>
                    {/* Branch Header with Business Hours - only show when all branches selected */}
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
                            ({branchStaff.length} staff)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <i className='ri-time-line' style={{ fontSize: 14 }} />
                          <Typography variant='caption' color={isOpen ? 'text.secondary' : 'error.main'}>
                            {branchHoursDisplay}
                          </Typography>
                          <IconButton size='small' onClick={handleOpenBusinessHoursModal}>
                            <i className='ri-edit-line' style={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    )}

                    {/* Staff in this branch - grouped by type */}
                    {(() => {
                      // Group staff by type based on selected date
                      const dynamicStaff = branchStaff.filter(s => getStaffTypeForDate(s.id, selectedDate) === 'dynamic')
                      const staticStaff = branchStaff.filter(s => getStaffTypeForDate(s.id, selectedDate) === 'static')

                      return (
                        <>
                          {/* Dynamic Staff Section */}
                          {dynamicStaff.length > 0 && (
                            <>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 1,
                                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                                  borderBottom: 1,
                                  borderTop: showBranchHeader ? 0 : 1,
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <i className='ri-user-line' style={{ fontSize: 14, color: '#0a2c24' }} />
                                <Typography variant='caption' fontWeight={600} color='primary'>
                                  Dynamic Staff
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  ({dynamicStaff.length})
                                </Typography>
                              </Box>
                              {dynamicStaff.map(renderEnhancedStaffRow)}
                            </>
                          )}

                          {/* Static Staff/Rooms Section */}
                          {staticStaff.length > 0 && (
                            <>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 1,
                                  bgcolor: 'rgba(158, 158, 158, 0.08)',
                                  borderBottom: 1,
                                  borderTop: 1,
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <i className='ri-group-line' style={{ fontSize: 14, color: 'var(--mui-palette-text-secondary)' }} />
                                <Typography variant='caption' fontWeight={600} color='text.secondary'>
                                  Static Staff / Rooms
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  ({staticStaff.length})
                                </Typography>
                              </Box>
                              {staticStaff.map(renderEnhancedStaffRow)}
                            </>
                          )}
                        </>
                      )
                    })()}
                  </Box>
                )
              })}
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
              color='error'
              startIcon={<i className='ri-calendar-close-line' />}
              onClick={() => setIsTimeOffModalOpen(true)}
              sx={{ textTransform: 'uppercase' }}
            >
              Add Time Off
            </Button>
          </Box>

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

          <BusinessHoursModal
            open={isBusinessHoursModalOpen}
            onClose={() => setIsBusinessHoursModalOpen(false)}
            branchId={selectedBranch !== 'all' ? selectedBranch : undefined}
          />

          {selectedStaffForEdit && (
            <StaffEditWorkingHoursModal
              open={isWorkingHoursModalOpen}
              onClose={() => setIsWorkingHoursModalOpen(false)}
              staffId={selectedStaffForEdit.id}
              staffName={selectedStaffForEdit.name}
              staffType={getStaffType(selectedStaffForEdit.id)}
              referenceDate={selectedDate}
              bulkStaffIds={bulkMode && selectedStaffIds.length > 1 ? selectedStaffIds : undefined}
            />
          )}

          <TimeOffModal
            open={isTimeOffModalOpen}
            onClose={() => {
              setIsTimeOffModalOpen(false)
              setEditingTimeOffId(undefined)
              setTimeOffModalContext(null)
            }}
            editTimeOffId={editingTimeOffId}
            initialStaffId={timeOffModalContext?.staffId}
            initialStaffName={timeOffModalContext?.staffName}
            initialDate={timeOffModalContext?.date}
          />

          <ShiftEditorModal
            open={isShiftEditorOpen}
            onClose={closeShiftEditor}
            staffId={shiftEditorContext?.staffId}
            staffName={shiftEditorContext?.staffName}
            staffType={shiftEditorContext?.staffType}
            date={shiftEditorContext?.date}
            hasShift={shiftEditorContext?.hasShift}
            initialStartTime={shiftEditorContext?.startTime}
            initialEndTime={shiftEditorContext?.endTime}
            onSave={handleShiftEditorSave}
          />

          {/* Print Content - Hidden on screen, visible when printing */}
          <Box
            id='print-content'
            sx={{
              display: 'none',
              '@media print': {
                display: 'block'
              }
            }}
          >
            <Box sx={{ p: 3 }}>
              {/* Header */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant='h5' fontWeight={600} gutterBottom>
                  Zerv
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {`${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`}
                </Typography>
              </Box>

              {/* Staff Schedule Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid var(--mui-palette-divider)', padding: '8px', backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)' }}>
                      Staff Member
                    </th>
                    {weekDates.map((date, idx) => (
                      <th
                        key={idx}
                        style={{
                          border: '1px solid var(--mui-palette-divider)',
                          padding: '8px',
                          backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)',
                          textAlign: 'center'
                        }}
                      >
                        {WEEK_DAYS[idx]}
                        <br />
                        {format(date, 'MMM d')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayStaff.map(staff => (
                    <tr key={staff.id}>
                      <td style={{ border: '1px solid var(--mui-palette-divider)', padding: '8px', fontWeight: 600 }}>{staff.name}</td>
                      {weekDates.map((date, idx) => {
                        const timeOff = timeOffRequests.find(
                          req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, date)
                        )
                        return (
                          <td key={idx} style={{ border: '1px solid var(--mui-palette-divider)', padding: '8px', textAlign: 'center' }}>
                            {timeOff ? (
                              <Box>
                                <Typography variant='caption' display='block' fontWeight={500}>
                                  {timeOff.reason}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  Sick Day
                                </Typography>
                              </Box>
                            ) : (
                              <Box>
                                <Typography variant='caption' display='block'>
                                  10:00 AM - 7:00 PM
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  9h
                                </Typography>
                              </Box>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid var(--mui-palette-divider)', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='caption' color='text.secondary'>
                  {new Date().toLocaleDateString()}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  https://zerv.app/staff/shifts?date={format(selectedDate, 'yyyy-MM-dd')}&view=day
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Business Hours Day Editor Modal */}
          {businessHoursDayEditorContext && (
            <BusinessHoursDayEditorModal
              open={isBusinessHoursDayEditorOpen}
              onClose={() => {
                setIsBusinessHoursDayEditorOpen(false)
                setBusinessHoursDayEditorContext(null)
              }}
              branchId={businessHoursDayEditorContext.branchId}
              date={businessHoursDayEditorContext.date}
              dayOfWeek={businessHoursDayEditorContext.dayOfWeek}
            />
          )}

          {/* Calendar Picker Popover */}
          <CalendarPopover
            open={calendarOpen}
            anchorEl={calendarAnchor}
            onClose={handleCloseCalendar}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onJumpWeek={handleJumpWeek}
          />

          {/* Staff Type Change Confirmation Dialog */}
          {staffTypeChangeContext && (
            <StaffTypeChangeDialog
              open={isStaffTypeChangeDialogOpen}
              onClose={() => {
                setIsStaffTypeChangeDialogOpen(false)
                setStaffTypeChangeContext(null)
              }}
              staffId={staffTypeChangeContext.staffId}
              staffName={staffTypeChangeContext.staffName}
              currentType={staffTypeChangeContext.currentType}
              targetType={staffTypeChangeContext.targetType}
              onConfirm={handleStaffTypeChangeConfirm}
            />
          )}

          {/* Special Days Modal */}
          <SpecialDaysModal
            open={isSpecialDaysModalOpen}
            onClose={closeSpecialDays}
          />
        </Box>
      </DndContext>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <PrintStyles />
      {renderEnhancedHeader()}

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
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
                    <IconButton size='small' onClick={handleOpenBusinessHoursModal}>
                      <i className='ri-edit-line' style={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                )
              })()}

            {/* Staff grouped by branches - sorted by open/closed status */}
            {Object.entries(staffByBranch)
              .sort(([branchIdA], [branchIdB]) => {
                // Sort open branches first, closed branches last (check if any day is open)
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
              .map(([branchId, branchStaff]) => {
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
                          ({branchStaff.length})
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='caption' color='text.secondary' fontSize='0.6rem'>
                            {branchDaysOpen}d • {branchHours}h/wk
                          </Typography>
                          <IconButton size='small' onClick={handleOpenBusinessHoursModal}>
                            <i className='ri-edit-line' style={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    )}

                    {/* Staff in this branch - grouped by type */}
                    {(() => {
                      // Group staff by type based on selected date
                      const dynamicStaff = branchStaff.filter(s => getStaffTypeForDate(s.id, selectedDate) === 'dynamic')
                      const staticStaff = branchStaff.filter(s => getStaffTypeForDate(s.id, selectedDate) === 'static')

                      return (
                        <>
                          {/* Dynamic Staff Section */}
                          {dynamicStaff.length > 0 && (
                            <>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.75,
                                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                                  borderBottom: 1,
                                  borderTop: showBranchHeader ? 0 : 1,
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                <i className='ri-user-line' style={{ fontSize: 12, color: '#0a2c24' }} />
                                <Typography variant='caption' fontWeight={600} fontSize='0.65rem' color='primary'>
                                  Dynamic
                                </Typography>
                                <Typography variant='caption' color='text.secondary' fontSize='0.6rem'>
                                  ({dynamicStaff.length})
                                </Typography>
                              </Box>
                              {dynamicStaff.map(staff => (
                                <Box
                                  key={staff.id}
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
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant='body2' fontWeight={600} noWrap>
                                      {staff.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                                      >
                                        W 45h/45h
                                      </Typography>
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                                      >
                                        M 149h 45min
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <IconButton
                                    size='small'
                                    onClick={e => handleOpenStaffMenu(e, { id: staff.id, name: staff.name })}
                                  >
                                    <i className='ri-edit-line' style={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              ))}
                            </>
                          )}

                          {/* Static Staff/Rooms Section */}
                          {staticStaff.length > 0 && (
                            <>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.75,
                                  bgcolor: 'rgba(158, 158, 158, 0.08)',
                                  borderBottom: 1,
                                  borderTop: 1,
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                <i className='ri-group-line' style={{ fontSize: 12, color: 'var(--mui-palette-text-secondary)' }} />
                                <Typography
                                  variant='caption'
                                  fontWeight={600}
                                  fontSize='0.65rem'
                                  color='text.secondary'
                                >
                                  Static / Rooms
                                </Typography>
                                <Typography variant='caption' color='text.secondary' fontSize='0.6rem'>
                                  ({staticStaff.length})
                                </Typography>
                              </Box>
                              {staticStaff.map(staff => (
                                <Box
                                  key={staff.id}
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
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant='body2' fontWeight={600} noWrap>
                                      {staff.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                                      >
                                        W 45h/45h
                                      </Typography>
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                                      >
                                        M 149h 45min
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <IconButton
                                    size='small'
                                    onClick={e => handleOpenStaffMenu(e, { id: staff.id, name: staff.name })}
                                  >
                                    <i className='ri-edit-line' style={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              ))}
                            </>
                          )}
                        </>
                      )
                    })()}
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
                  bgcolor: isSelected ? 'rgba(10, 44, 36, 0.05)' : 'transparent'
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
                          onClick={() => {
                            setBusinessHoursDayEditorContext({
                              branchId: selectedBranch,
                              date,
                              dayOfWeek
                            })
                            setIsBusinessHoursDayEditorOpen(true)
                          }}
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: isOpen ? 'rgba(10, 44, 36, 0.2)' : 'grey.900',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            border: isOpen ? '1px solid' : 'none',
                            borderColor: isOpen ? 'success.main' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: isOpen ? 'rgba(10, 44, 36, 0.3)' : 'grey.800'
                            }
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
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              setBusinessHoursDayEditorContext({
                                branchId: selectedBranch,
                                date,
                                dayOfWeek
                              })
                              setIsBusinessHoursDayEditorOpen(true)
                            }}
                            sx={{ position: 'absolute', top: 2, right: 2, color: isOpen ? 'text.primary' : 'white' }}
                          >
                            <i className='ri-edit-line' style={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    )
                  })()}

                {/* Staff cells grouped by branches */}
                {Object.entries(staffByBranch).map(([branchId, branchStaff]) => {
                  const showBranchHeader = selectedBranch === 'all' // Only show header when viewing all branches

                  // Group staff by type based on this column's date
                  const dynamicStaff = branchStaff.filter(s => getStaffTypeForDate(s.id, date) === 'dynamic')
                  const staticStaff = branchStaff.filter(s => getStaffTypeForDate(s.id, date) === 'static')

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

                      {/* Dynamic Staff Section */}
                      {dynamicStaff.length > 0 && (
                        <>
                          {/* Dynamic staff type header cell */}
                          <Box
                            sx={{
                              height: '27px',
                              borderBottom: 1,
                              borderColor: 'divider',
                              bgcolor: 'rgba(25, 118, 210, 0.08)'
                            }}
                          />

                          {/* Dynamic staff cells */}
                          {dynamicStaff.map(staff => {
                            const timeOff = timeOffRequests.find(
                              req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, date)
                            )

                            // Get shifts for this specific date (includes date-specific overrides)
                            const dateStr = date.toISOString().split('T')[0]
                            const shifts = getStaffShiftsForDate(staff.id, dateStr)
                            const hasShift = !timeOff && shifts.length > 0 && shifts[0].start !== '00:00'

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
                              <Box
                                key={staff.id}
                                sx={{
                                  height: 80,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'stretch',
                                  justifyContent: 'center',
                                  borderBottom: 1,
                                  borderColor: 'divider',
                                  position: 'relative',
                                  p: 1
                                }}
                              >
                                {hasShift &&
                                  !timeOff &&
                                  shifts.map((shift, idx) => {
                                    const shiftStart = formatTime12Hour(shift.start)
                                    const shiftEnd = formatTime12Hour(shift.end)

                                    // Calculate duration
                                    const [startH, startM] = shift.start.split(':').map(Number)
                                    const [endH, endM] = shift.end.split(':').map(Number)
                                    const durationMinutes = endH * 60 + endM - (startH * 60 + startM)
                                    const hours = Math.floor(durationMinutes / 60)
                                    const minutes = durationMinutes % 60

                                    return (
                                      <Box
                                        key={shift.id}
                                        onClick={() =>
                                          openShiftEditor({ id: staff.id, name: staff.name }, date, {
                                            start: shiftStart,
                                            end: shiftEnd
                                          })
                                        }
                                        sx={{
                                          position: 'relative',
                                          width: '100%',
                                          height: shifts.length > 1 ? `calc(${100 / shifts.length}% - 4px)` : '100%',
                                          mb: shifts.length > 1 && idx < shifts.length - 1 ? 0.5 : 0,
                                          bgcolor: 'rgba(10, 44, 36, 0.3)',
                                          borderRadius: 1,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: 1,
                                          borderColor: 'success.light',
                                          px: 0.5,
                                          py: shifts.length > 1 ? 0.25 : 0.5,
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                          overflow: 'hidden',
                                          '&:hover': {
                                            bgcolor: 'rgba(139, 195, 74, 0.4)',
                                            borderColor: 'success.main'
                                          }
                                        }}
                                      >
                                        {shifts.length > 1 && (
                                          <Chip
                                            label={`${idx + 1}/${shifts.length}`}
                                            size='small'
                                            sx={{
                                              height: 14,
                                              fontSize: '0.55rem',
                                              position: 'absolute',
                                              top: 1,
                                              left: 1,
                                              bgcolor: 'primary.main',
                                              color: 'white',
                                              '& .MuiChip-label': {
                                                px: 0.5,
                                                py: 0
                                              }
                                            }}
                                          />
                                        )}
                                        <Box
                                          sx={{ width: '100%', px: shifts.length > 1 ? 1.5 : 0.5, textAlign: 'center' }}
                                        >
                                          <Typography
                                            variant='caption'
                                            fontWeight={500}
                                            color='text.primary'
                                            sx={{
                                              fontSize: shifts.length > 1 ? '0.58rem' : '0.65rem',
                                              lineHeight: 1.1,
                                              display: 'block',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                          >
                                            {shiftStart.toLowerCase()}
                                          </Typography>
                                          <Typography
                                            variant='caption'
                                            fontWeight={500}
                                            color='text.primary'
                                            sx={{
                                              fontSize: shifts.length > 1 ? '0.58rem' : '0.65rem',
                                              lineHeight: 1.1,
                                              display: 'block',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                          >
                                            {shiftEnd.toLowerCase()}
                                          </Typography>
                                          <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{
                                              fontSize: shifts.length > 1 ? '0.52rem' : '0.6rem',
                                              lineHeight: 1.1,
                                              display: 'block',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                          >
                                            {hours}h{minutes > 0 ? `${minutes}m` : ''}
                                          </Typography>
                                          {shift.breaks && shift.breaks.length > 0 && (
                                            <Box
                                              sx={{
                                                mt: 0.25,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.125,
                                                width: '100%'
                                              }}
                                            >
                                              {shift.breaks.map(breakItem => {
                                                const [breakStartH, breakStartM] = breakItem.start
                                                  .split(':')
                                                  .map(Number)
                                                const [breakEndH, breakEndM] = breakItem.end.split(':').map(Number)
                                                const breakDurationMinutes =
                                                  breakEndH * 60 + breakEndM - (breakStartH * 60 + breakStartM)

                                                return (
                                                  <Box
                                                    key={breakItem.id}
                                                    sx={{
                                                      bgcolor: 'background.paper',
                                                      borderRadius: 0.5,
                                                      border: '1px solid',
                                                      borderColor: 'divider',
                                                      py: 0.25,
                                                      px: 0.5,
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      gap: 0.25
                                                    }}
                                                  >
                                                    <i className='ri-cup-line' style={{ fontSize: 8, opacity: 0.6 }} />
                                                    <Typography
                                                      variant='caption'
                                                      sx={{
                                                        fontSize: '0.5rem',
                                                        lineHeight: 1,
                                                        color: 'text.secondary',
                                                        whiteSpace: 'nowrap'
                                                      }}
                                                    >
                                                      Break ({breakDurationMinutes}min)
                                                    </Typography>
                                                  </Box>
                                                )
                                              })}
                                            </Box>
                                          )}
                                        </Box>
                                        <IconButton
                                          size='small'
                                          sx={{
                                            position: 'absolute',
                                            top: 1,
                                            right: 1,
                                            color: 'text.primary',
                                            padding: '2px',
                                            '& i': {
                                              fontSize: 12
                                            }
                                          }}
                                          onClick={e => {
                                            e.stopPropagation()
                                            openShiftEditor({ id: staff.id, name: staff.name }, date, {
                                              start: shiftStart,
                                              end: shiftEnd
                                            })
                                          }}
                                        >
                                          <i className='ri-edit-line' />
                                        </IconButton>
                                      </Box>
                                    )
                                  })}
                                {!hasShift && !timeOff && (
                                  <Box
                                    onClick={() => openShiftEditor({ id: staff.id, name: staff.name }, date, null)}
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      bgcolor: 'transparent',
                                      borderRadius: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '2px dashed',
                                      borderColor: 'divider',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                                        borderColor: 'primary.main'
                                      }
                                    }}
                                  >
                                    <Typography variant='body2' color='text.secondary' fontWeight={500}>
                                      No Shift
                                    </Typography>
                                    <IconButton
                                      size='small'
                                      sx={{ position: 'absolute', top: 2, right: 2, color: 'text.secondary' }}
                                      onClick={e => {
                                        e.stopPropagation()
                                        openShiftEditor({ id: staff.id, name: staff.name }, date, null)
                                      }}
                                    >
                                      <i className='ri-edit-line' style={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Box>
                                )}
                                {timeOff && (
                                  <Box
                                    onClick={() =>
                                      handleEditTimeOff(timeOff.id, { id: staff.id, name: staff.name }, date)
                                    }
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      bgcolor: 'grey.800',
                                      borderRadius: 1,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      p: 0.5,
                                      cursor: 'pointer',
                                      position: 'relative',
                                      transition: 'all 0.2s',
                                      overflow: 'hidden',
                                      '&:hover': {
                                        bgcolor: 'grey.700'
                                      }
                                    }}
                                  >
                                    <Box sx={{ textAlign: 'center', width: '100%', px: 2 }}>
                                      <Typography
                                        variant='caption'
                                        sx={{
                                          color: 'var(--mui-palette-common-white)',
                                          fontSize: '0.65rem',
                                          fontWeight: 500,
                                          display: 'block',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        {timeOff.reason}
                                      </Typography>
                                      <Typography
                                        variant='caption'
                                        sx={{
                                          color: 'rgba(255, 255, 255, 0.7)',
                                          fontSize: '0.6rem',
                                          display: 'block',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        All Day
                                      </Typography>
                                    </Box>
                                    <IconButton
                                      size='small'
                                      sx={{
                                        position: 'absolute',
                                        top: 1,
                                        right: 1,
                                        color: 'white',
                                        padding: '2px',
                                        '& i': {
                                          fontSize: 12
                                        }
                                      }}
                                      onClick={e => {
                                        e.stopPropagation()
                                        handleEditTimeOff(timeOff.id, { id: staff.id, name: staff.name }, date)
                                      }}
                                    >
                                      <i className='ri-edit-line' />
                                    </IconButton>
                                  </Box>
                                )}
                              </Box>
                            )
                          })}
                        </>
                      )}

                      {/* Static Staff/Rooms Section */}
                      {staticStaff.length > 0 && (
                        <>
                          {/* Static staff type header cell */}
                          <Box
                            sx={{
                              height: '27px',
                              borderBottom: 1,
                              borderColor: 'divider',
                              bgcolor: 'rgba(158, 158, 158, 0.08)'
                            }}
                          />

                          {/* Static staff cells */}
                          {staticStaff.map(staff => {
                            const timeOff = timeOffRequests.find(
                              req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, date)
                            )

                            // Get shifts for this specific date (includes date-specific overrides)
                            const dateStr = date.toISOString().split('T')[0]
                            const shifts = getStaffShiftsForDate(staff.id, dateStr)
                            const hasShift = !timeOff && shifts.length > 0 && shifts[0].start !== '00:00'

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
                              <Box
                                key={staff.id}
                                sx={{
                                  height: 80,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'stretch',
                                  justifyContent: 'center',
                                  borderBottom: 1,
                                  borderColor: 'divider',
                                  position: 'relative',
                                  p: 1
                                }}
                              >
                                {hasShift &&
                                  !timeOff &&
                                  shifts.map((shift, idx) => {
                                    const shiftStart = formatTime12Hour(shift.start)
                                    const shiftEnd = formatTime12Hour(shift.end)

                                    // Calculate duration
                                    const [startH, startM] = shift.start.split(':').map(Number)
                                    const [endH, endM] = shift.end.split(':').map(Number)
                                    const durationMinutes = endH * 60 + endM - (startH * 60 + startM)
                                    const hours = Math.floor(durationMinutes / 60)
                                    const minutes = durationMinutes % 60

                                    return (
                                      <Box
                                        key={shift.id}
                                        onClick={() =>
                                          openShiftEditor({ id: staff.id, name: staff.name }, date, {
                                            start: shiftStart,
                                            end: shiftEnd
                                          })
                                        }
                                        sx={{
                                          position: 'relative',
                                          width: '100%',
                                          height: shifts.length > 1 ? `calc(${100 / shifts.length}% - 4px)` : '100%',
                                          mb: shifts.length > 1 && idx < shifts.length - 1 ? 0.5 : 0,
                                          bgcolor: 'rgba(10, 44, 36, 0.3)',
                                          borderRadius: 1,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: 1,
                                          borderColor: 'success.light',
                                          px: 0.5,
                                          py: shifts.length > 1 ? 0.25 : 0.5,
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                          overflow: 'hidden',
                                          '&:hover': {
                                            bgcolor: 'rgba(139, 195, 74, 0.4)',
                                            borderColor: 'success.main'
                                          }
                                        }}
                                      >
                                        {shifts.length > 1 && (
                                          <Chip
                                            label={`${idx + 1}/${shifts.length}`}
                                            size='small'
                                            sx={{
                                              height: 14,
                                              fontSize: '0.55rem',
                                              position: 'absolute',
                                              top: 1,
                                              left: 1,
                                              bgcolor: 'primary.main',
                                              color: 'white',
                                              '& .MuiChip-label': {
                                                px: 0.5,
                                                py: 0
                                              }
                                            }}
                                          />
                                        )}
                                        <Box
                                          sx={{ width: '100%', px: shifts.length > 1 ? 1.5 : 0.5, textAlign: 'center' }}
                                        >
                                          <Typography
                                            variant='caption'
                                            fontWeight={500}
                                            color='text.primary'
                                            sx={{
                                              fontSize: shifts.length > 1 ? '0.58rem' : '0.65rem',
                                              lineHeight: 1.1,
                                              display: 'block',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                          >
                                            {shiftStart.toLowerCase()}
                                          </Typography>
                                          <Typography
                                            variant='caption'
                                            fontWeight={500}
                                            color='text.primary'
                                            sx={{
                                              fontSize: shifts.length > 1 ? '0.58rem' : '0.65rem',
                                              lineHeight: 1.1,
                                              display: 'block',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                          >
                                            {shiftEnd.toLowerCase()}
                                          </Typography>
                                          <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{
                                              fontSize: shifts.length > 1 ? '0.52rem' : '0.6rem',
                                              lineHeight: 1.1,
                                              display: 'block',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                          >
                                            {hours}h{minutes > 0 ? `${minutes}m` : ''}
                                          </Typography>
                                          {shift.breaks && shift.breaks.length > 0 && (
                                            <Box
                                              sx={{
                                                mt: 0.25,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.125,
                                                width: '100%'
                                              }}
                                            >
                                              {shift.breaks.map(breakItem => {
                                                const [breakStartH, breakStartM] = breakItem.start
                                                  .split(':')
                                                  .map(Number)
                                                const [breakEndH, breakEndM] = breakItem.end.split(':').map(Number)
                                                const breakDurationMinutes =
                                                  breakEndH * 60 + breakEndM - (breakStartH * 60 + breakStartM)

                                                return (
                                                  <Box
                                                    key={breakItem.id}
                                                    sx={{
                                                      bgcolor: 'background.paper',
                                                      borderRadius: 0.5,
                                                      border: '1px solid',
                                                      borderColor: 'divider',
                                                      py: 0.25,
                                                      px: 0.5,
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      gap: 0.25
                                                    }}
                                                  >
                                                    <i className='ri-cup-line' style={{ fontSize: 8, opacity: 0.6 }} />
                                                    <Typography
                                                      variant='caption'
                                                      sx={{
                                                        fontSize: '0.5rem',
                                                        lineHeight: 1,
                                                        color: 'text.secondary',
                                                        whiteSpace: 'nowrap'
                                                      }}
                                                    >
                                                      Break ({breakDurationMinutes}min)
                                                    </Typography>
                                                  </Box>
                                                )
                                              })}
                                            </Box>
                                          )}
                                        </Box>
                                        <IconButton
                                          size='small'
                                          sx={{
                                            position: 'absolute',
                                            top: 1,
                                            right: 1,
                                            color: 'text.primary',
                                            padding: '2px',
                                            '& i': {
                                              fontSize: 12
                                            }
                                          }}
                                          onClick={e => {
                                            e.stopPropagation()
                                            openShiftEditor({ id: staff.id, name: staff.name }, date, {
                                              start: shiftStart,
                                              end: shiftEnd
                                            })
                                          }}
                                        >
                                          <i className='ri-edit-line' />
                                        </IconButton>
                                      </Box>
                                    )
                                  })}
                                {!hasShift && !timeOff && (
                                  <Box
                                    onClick={() => openShiftEditor({ id: staff.id, name: staff.name }, date, null)}
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      bgcolor: 'transparent',
                                      borderRadius: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '2px dashed',
                                      borderColor: 'divider',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                                        borderColor: 'primary.main'
                                      }
                                    }}
                                  >
                                    <Typography variant='body2' color='text.secondary' fontWeight={500}>
                                      No Shift
                                    </Typography>
                                    <IconButton
                                      size='small'
                                      sx={{ position: 'absolute', top: 2, right: 2, color: 'text.secondary' }}
                                      onClick={e => {
                                        e.stopPropagation()
                                        openShiftEditor({ id: staff.id, name: staff.name }, date, null)
                                      }}
                                    >
                                      <i className='ri-edit-line' style={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Box>
                                )}
                                {timeOff && (
                                  <Box
                                    onClick={() =>
                                      handleEditTimeOff(timeOff.id, { id: staff.id, name: staff.name }, date)
                                    }
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      bgcolor: 'grey.800',
                                      borderRadius: 1,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      p: 0.5,
                                      cursor: 'pointer',
                                      position: 'relative',
                                      transition: 'all 0.2s',
                                      overflow: 'hidden',
                                      '&:hover': {
                                        bgcolor: 'grey.700'
                                      }
                                    }}
                                  >
                                    <Box sx={{ textAlign: 'center', width: '100%', px: 2 }}>
                                      <Typography
                                        variant='caption'
                                        sx={{
                                          color: 'var(--mui-palette-common-white)',
                                          fontSize: '0.65rem',
                                          fontWeight: 500,
                                          display: 'block',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        {timeOff.reason}
                                      </Typography>
                                      <Typography
                                        variant='caption'
                                        sx={{
                                          color: 'rgba(255, 255, 255, 0.7)',
                                          fontSize: '0.6rem',
                                          display: 'block',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        All Day
                                      </Typography>
                                    </Box>
                                    <IconButton
                                      size='small'
                                      sx={{
                                        position: 'absolute',
                                        top: 1,
                                        right: 1,
                                        color: 'white',
                                        padding: '2px',
                                        '& i': {
                                          fontSize: 12
                                        }
                                      }}
                                      onClick={e => {
                                        e.stopPropagation()
                                        handleEditTimeOff(timeOff.id, { id: staff.id, name: staff.name }, date)
                                      }}
                                    >
                                      <i className='ri-edit-line' />
                                    </IconButton>
                                  </Box>
                                )}
                              </Box>
                            )
                          })}
                        </>
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
        <Box sx={{ flex: 1 }} />
        <Button
          variant='contained'
          color='error'
          startIcon={<i className='ri-calendar-close-line' />}
          onClick={() => setIsTimeOffModalOpen(true)}
          sx={{ textTransform: 'uppercase' }}
        >
          Add Time Off
        </Button>
      </Box>

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

      <BusinessHoursModal
        open={isBusinessHoursModalOpen}
        onClose={() => setIsBusinessHoursModalOpen(false)}
        branchId={selectedBranch !== 'all' ? selectedBranch : undefined}
      />

      {businessHoursDayEditorContext && (
        <BusinessHoursDayEditorModal
          open={isBusinessHoursDayEditorOpen}
          onClose={() => {
            setIsBusinessHoursDayEditorOpen(false)
            setBusinessHoursDayEditorContext(null)
          }}
          branchId={businessHoursDayEditorContext.branchId}
          date={businessHoursDayEditorContext.date}
          dayOfWeek={businessHoursDayEditorContext.dayOfWeek}
        />
      )}

      {selectedStaffForEdit && (
        <StaffEditWorkingHoursModal
          open={isWorkingHoursModalOpen}
          onClose={() => {
            setIsWorkingHoursModalOpen(false)
            // Clear bulk mode selections when closing
            if (bulkMode && selectedStaffIds.length > 1) {
              // Keep bulk mode active but don't clear selections
            }
          }}
          staffId={selectedStaffForEdit.id}
          staffName={selectedStaffForEdit.name}
          staffType={getStaffType(selectedStaffForEdit.id)}
          referenceDate={selectedDate}
          bulkStaffIds={bulkMode && selectedStaffIds.length > 1 ? selectedStaffIds : undefined}
        />
      )}

      <TimeOffModal
        open={isTimeOffModalOpen}
        onClose={() => {
          setIsTimeOffModalOpen(false)
          setEditingTimeOffId(undefined)
          setTimeOffModalContext(null)
        }}
        editTimeOffId={editingTimeOffId}
        initialStaffId={timeOffModalContext?.staffId}
        initialStaffName={timeOffModalContext?.staffName}
        initialDate={timeOffModalContext?.date}
      />

      <ShiftEditorModal
        open={isShiftEditorOpen}
        onClose={closeShiftEditor}
        staffId={shiftEditorContext?.staffId}
        staffName={shiftEditorContext?.staffName}
        staffType={shiftEditorContext?.staffType}
        date={shiftEditorContext?.date}
        hasShift={shiftEditorContext?.hasShift}
        initialStartTime={shiftEditorContext?.startTime}
        initialEndTime={shiftEditorContext?.endTime}
        onSave={handleShiftEditorSave}
      />

      {/* Print Content - Hidden on screen, visible when printing */}
      <Box
        id='print-content'
        sx={{
          display: 'none',
          '@media print': {
            display: 'block'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant='h5' fontWeight={600} gutterBottom>
              Zerv
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {`${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`}
            </Typography>
          </Box>

          {/* Staff Schedule Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid var(--mui-palette-divider)', padding: '8px', backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)' }}>Staff Member</th>
                {weekDates.map((date, idx) => (
                  <th
                    key={idx}
                    style={{
                      border: '1px solid var(--mui-palette-divider)',
                      padding: '8px',
                      backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)',
                      textAlign: 'center'
                    }}
                  >
                    {WEEK_DAYS[idx]}
                    <br />
                    {format(date, 'MMM d')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayStaff.map(staff => (
                <tr key={staff.id}>
                  <td style={{ border: '1px solid var(--mui-palette-divider)', padding: '8px', fontWeight: 600 }}>{staff.name}</td>
                  {weekDates.map((date, idx) => {
                    const timeOff = timeOffRequests.find(
                      req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, date)
                    )
                    return (
                      <td key={idx} style={{ border: '1px solid var(--mui-palette-divider)', padding: '8px', textAlign: 'center' }}>
                        {timeOff ? (
                          <Box>
                            <Typography variant='caption' display='block' fontWeight={500}>
                              {timeOff.reason}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              Sick Day
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant='caption' display='block'>
                              10:00 AM - 7:00 PM
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              9h
                            </Typography>
                          </Box>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid var(--mui-palette-divider)', display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='caption' color='text.secondary'>
              {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              https://zerv.app/staff/shifts?date={format(selectedDate, 'yyyy-MM-dd')}&view={viewMode.toLowerCase()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Special Days Modal */}
      <SpecialDaysModal
        open={isSpecialDaysModalOpen}
        onClose={closeSpecialDays}
      />

      {/* Calendar Picker Popover */}
      <CalendarPopover
        open={calendarOpen}
        anchorEl={calendarAnchor}
        onClose={handleCloseCalendar}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onJumpWeek={handleJumpWeek}
      />
    </Box>
  )
}
