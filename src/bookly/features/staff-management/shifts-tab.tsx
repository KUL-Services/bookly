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
  Divider,
  Alert,
  Snackbar
} from '@mui/material'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'

import { useStaffManagementStore } from './staff-store'
import { BusinessHoursModal } from './business-hours-modal'
import { BusinessHoursDayEditorModal } from './business-hours-day-editor-modal'
import type { DayOfWeek, StaffShiftInstance } from '../calendar/types'
import { StaffEditWorkingHoursModal } from './staff-edit-working-hours-modal'
import { TimeOffModal } from './time-off-modal'
import { ShiftEditorModal } from './shift-editor-modal'
import { SessionEditorDrawer } from './session-editor-drawer'
import type { Session, CreateSessionRequest } from '@/lib/api/types'
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
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkEditError, setBulkEditError] = useState<string | null>(null)

  // Optimistic state for staff type toggles
  const [optimisticStaffTypes, setOptimisticStaffTypes] = useState<Record<string, 'static' | 'dynamic' | null>>({})

  const [isCancelChangeDialogOpen, setIsCancelChangeDialogOpen] = useState(false)
  const [cancelChangeStaffId, setCancelChangeStaffId] = useState<string | null>(null)
  const [isCancellingMode, setIsCancellingMode] = useState(false)

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

  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null)
  const calendarOpen = Boolean(calendarAnchor)

  // SessionEditorDrawer state
  const [isSessionEditorOpen, setIsSessionEditorOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [sessionResourceFilter, setSessionResourceFilter] = useState<string | null>(null)

  // Staff type change dialog state
  const [isStaffTypeChangeDialogOpen, setIsStaffTypeChangeDialogOpen] = useState(false)
  const [isChangingMode, setIsChangingMode] = useState(false)
  const [modeChangeError, setModeChangeError] = useState<string | null>(null)
  const [staffTypeChangeContext, setStaffTypeChangeContext] = useState<{
    staffId: string
    staffName: string
    currentType: 'dynamic' | 'static'
    targetType: 'dynamic' | 'static'
  } | null>(null)

  const {
    timeOffRequests,
    staffMembers,
    staffServiceAssignments,
    apiBranches,
    getStaffWorkingHours,
    getStaffShiftsForDate,
    getRoomSchedule,
    getBusinessHours,
    updateStaffType,
    getStaffType,
    getStaffTypeForDate,
    cancelStaffBookingModeTransition,
    updateCounter,
    isSpecialDaysModalOpen,
    openSpecialDays,
    closeSpecialDays,
    fetchStaffFromApi,
    fetchServicesFromApi,
    fetchBranchesFromApi,
    fetchSchedulesFromApi,
    fetchResourcesFromApi,
    rooms,
    apiServices,
    sessions
  } = useStaffManagementStore()

  // Fetch data on mount
  useEffect(() => {
    fetchStaffFromApi()
    fetchServicesFromApi()
    fetchBranchesFromApi()
    fetchSchedulesFromApi()
    fetchResourcesFromApi()
  }, [])

  // Service name lookup by ID
  const serviceNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    apiServices.forEach((s: any) => {
      map[s.id] = s.name
    })
    return map
  }, [apiServices])

  // Helper functions to access store data
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

  // Filter staff by branch and staff selection
  const displayStaff = useMemo(() => {
    let filtered = selectedStaff === 'Staff' ? staffMembers : staffMembers.filter(s => s.name === selectedStaff)

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(s => s.branchId === selectedBranch)
    }

    return filtered
  }, [selectedStaff, selectedBranch, staffMembers])

  console.log('RENDER: ShiftsTab', { isSpecialDaysModalOpen })

  // Group staff by branch and sort by shift start time
  const staffByBranch = useMemo(() => {
    const grouped: Record<string, typeof staffMembers> = {}

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
    resource: { id: string; name: string; type?: 'staff' | 'room' },
    date: Date,
    existingShift: StaffShiftInstance | null
  ) => {
    const isRoom = resource.type === 'room'
    const staffType = isRoom ? 'static' : getStaffTypeForDate(resource.id, date)

    if (staffType === 'static') {
      setSessionResourceFilter(resource.id)
      setSelectedSession(null) // Create new session
      setIsSessionEditorOpen(true)
      return
    }

    setShiftEditorContext({
      staffId: resource.id,
      staffName: resource.name,
      staffType,
      date,
      hasShift: !!existingShift,
      startTime: existingShift?.start || '10:00',
      endTime: existingShift?.end || '19:00'
    })
    setIsShiftEditorOpen(true)
    handleCloseStaffMenu()
  }

  const closeSessionEditor = () => {
    setIsSessionEditorOpen(false)
    setSelectedSession(null)
    setSessionResourceFilter(null)
  }

  const handleSessionSave = async (data: CreateSessionRequest | Partial<Session>) => {
    try {
      const { SessionsService } = await import('@/lib/api/services/sessions.service')
      if ('id' in data && data.id) {
        await SessionsService.updateSession(data.id, data as any)
      } else {
        await SessionsService.createSession(data as CreateSessionRequest)
      }
      closeSessionEditor()
      fetchSchedulesFromApi()
    } catch (error) {
      console.error('Failed to save session:', error)
      alert('Failed to save session. Please try again.')
    }
  }

  const handleSessionDelete = async (sessionId: string) => {
    const { SessionsService } = await import('@/lib/api/services/sessions.service')
    await SessionsService.deleteSession(sessionId)
    closeSessionEditor()
    fetchSchedulesFromApi()
  }

  const closeShiftEditor = () => {
    setIsShiftEditorOpen(false)
    setShiftEditorContext(null)
  }

  const handleShiftEditorSave = async (data: {
    hasShift: boolean
    startTime: string
    endTime: string
    breaks: any[]
  }) => {
    if (!shiftEditorContext) return

    try {
      const { staffId, date } = shiftEditorContext

      // Format data into what saveShiftsExceptions expects
      const shifts = data.hasShift
        ? [
            {
              id: crypto.randomUUID(),
              start: data.startTime,
              end: data.endTime,
              date: format(date, 'yyyy-MM-dd'),
              breaks: data.breaks,
              reason: 'manual' as const
            }
          ]
        : [] // Empty array or a 00:00-00:00 shift denotes a day off depending on the store, but store handles empty array gracefully

      // Save to backend via store
      await useStaffManagementStore.getState().saveShiftsExceptions(staffId, format(date, 'yyyy-MM-dd'), shifts)

      closeShiftEditor()
    } catch (error) {
      console.error('Failed to save shift exceptions:', error)
      alert('Failed to save shift data. Please try again.')
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

  const handlePrint = () => {
    window.print()
  }

  const handleStaffTypeToggle = (staffId: string, staffName: string, newTypeChecked: boolean) => {
    const currentType = getStaffTypeForDate(staffId, selectedDate)
    const targetType = newTypeChecked ? 'static' : 'dynamic'

    // Backend source of truth for pending booking mode transitions
    const pendingChange = staffMembers.find(member => member.id === staffId)?.pendingBookingMode

    if (pendingChange) {
      // Ask for confirmation before cancelling
      setCancelChangeStaffId(staffId)
      setIsCancelChangeDialogOpen(true)
      return
    }

    setStaffTypeChangeContext({
      staffId,
      staffName,
      currentType,
      targetType
    })
    setIsStaffTypeChangeDialogOpen(true)
  }

  const handleStaffTypeChangeConfirm = async () => {
    if (!staffTypeChangeContext) return

    setIsChangingMode(true)
    setModeChangeError(null)
    // Optimistically update UI
    setOptimisticStaffTypes(prev => ({ ...prev, [staffTypeChangeContext.staffId]: staffTypeChangeContext.targetType }))

    try {
      await updateStaffType(staffTypeChangeContext.staffId, staffTypeChangeContext.targetType)
      setIsStaffTypeChangeDialogOpen(false)
      setStaffTypeChangeContext(null)
    } catch (error: any) {
      console.error('Failed to change staff type:', error)
      setModeChangeError(error.message || 'Failed to change staff type. Please try again.')
      // Revert optimistic state
      setOptimisticStaffTypes(prev => {
        const newState = { ...prev }
        delete newState[staffTypeChangeContext.staffId]
        return newState
      })
    } finally {
      setIsChangingMode(false)
    }
  }

  const handleStaffTypeChangeCancel = () => {
    setModeChangeError(null)
    setIsStaffTypeChangeDialogOpen(false)
    setStaffTypeChangeContext(null)
  }

  const handleConfirmCancelChange = async () => {
    if (!cancelChangeStaffId) return

    setIsCancellingMode(true)
    setModeChangeError(null)

    try {
      await cancelStaffBookingModeTransition(cancelChangeStaffId)
      setOptimisticStaffTypes(prev => {
        const newState = { ...prev }
        delete newState[cancelChangeStaffId]
        return newState
      })
      setCancelChangeStaffId(null)
      setIsCancelChangeDialogOpen(false)
    } catch (error: any) {
      setModeChangeError(error?.message || 'Failed to cancel scheduled booking mode change.')
    } finally {
      setIsCancellingMode(false)
    }
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
    setBulkEditError(null) // Clear error when selection changes
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
          <MenuItem value='Staff'>All Staff</MenuItem>
          {staffMembers
            .filter(s => selectedBranch === 'all' || s.branchId === selectedBranch)
            .map(staff => (
            <MenuItem key={staff.id} value={staff.name}>
              {staff.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size='small' sx={{ minWidth: 180 }}>
        <Select value={selectedBranch} onChange={e => { setSelectedBranch(e.target.value); setSelectedStaff('Staff') }}>
          <MenuItem value='all'>All Branches</MenuItem>
          {apiBranches.map(branch => (
            <MenuItem key={branch.id} value={branch.id}>
              {branch.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            checked={bulkMode}
            onChange={e => {
              setBulkMode(e.target.checked)
              if (!e.target.checked) {
                setBulkEditError(null)
              }
            }}
            color='primary'
          />
        }
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
                // Check if selected staff have mixed types (dynamic and static)
                const staffTypes = selectedStaffIds.map(id => getStaffTypeForDate(id, selectedDate))
                const hasDynamic = staffTypes.includes('dynamic')
                const hasStatic = staffTypes.includes('static')

                if (hasDynamic && hasStatic) {
                  // Show error - cannot bulk edit mixed types
                  setBulkEditError(
                    'Cannot bulk edit staff with mixed schedule types. Please select only Flex or only Fixed staff members.'
                  )
                  return
                }

                setBulkEditError(null)
                const firstStaff = staffMembers.find(s => s.id === selectedStaffIds[0])
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
      {bulkEditError && (
        <Alert
          severity='error'
          onClose={() => setBulkEditError(null)}
          sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.8rem' } }}
        >
          {bulkEditError}
        </Alert>
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

      <Button
        variant='outlined'
        startIcon={<i className='ri-calendar-event-line' />}
        size='small'
        onClick={openSpecialDays}
      >
        HOLIDAY HOURS
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

    // Use date-based staff type for display
    const staffTypeForDate = getStaffTypeForDate(staff.id, selectedDate)

    // Filter sessions for this staff and date (only when staff is static on this date)
    const staffSessions =
      staffTypeForDate === 'static'
        ? sessions.filter(
            s =>
              s.resourceId === staff.id && (s.date?.split('T')[0] === dateStr || s.dayOfWeek === selectedDate.getDay())
          )
        : []

    // Calculate dynamic height — static staff use auto height (flex cards), dynamic use fixed
    const itemCount = staffTypeForDate === 'static' ? 1 : Math.max(1, shifts.length)
    const containerMinHeight = itemCount > 1 ? 80 + (itemCount - 1) * 50 : 80

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
                const effectiveStaffType = getStaffTypeForDate(staff.id, selectedDate)
                const optimisticType = optimisticStaffTypes[staff.id]
                const displayType = optimisticType ?? effectiveStaffType
                const isFixed = displayType === 'static'

                return (
                  <>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isFixed}
                          onChange={e => {
                            handleStaffTypeToggle(staff.id, staff.name, e.target.checked)
                          }}
                          size='small'
                          color='primary'
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
                              Fixed Schedule
                            </Typography>
                            <Typography
                              variant='caption'
                              display='block'
                              sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}
                            >
                              Works in pre-defined time slots with set capacity.
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
                              Flex Schedule
                            </Typography>
                            <Typography
                              variant='caption'
                              display='block'
                              sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}
                            >
                              Available during working hours via individual appointments.
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
                <Typography variant='caption'>
                  {staffTypeForDate === 'static'
                    ? `${staffSessions.length} session${staffSessions.length !== 1 ? 's' : ''}`
                    : hasShift && firstShift
                      ? `D ${Math.floor((parseInt(firstShift.end.split(':')[0]) * 60 + parseInt(firstShift.end.split(':')[1]) - (parseInt(firstShift.start.split(':')[0]) * 60 + parseInt(firstShift.start.split(':')[1]))) / 60)}h`
                      : 'D 0h'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            position: staffTypeForDate === 'static' ? 'static' : 'relative',
            m: 1,
            ...(staffTypeForDate === 'static'
              ? { display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'stretch' }
              : {})
          }}
        >
          {/* Timeline background / Add slot for static (hidden when sessions exist — + button used instead) */}

          {hasShift &&
            !timeOff &&
            staffTypeForDate !== 'static' &&
            shifts.map((shift, idx) => {
              // Calculate break duration for display
              const getBreakDuration = (brk: { start: string; end: string }) => {
                const [startH, startM] = brk.start.split(':').map(Number)
                const [endH, endM] = brk.end.split(':').map(Number)
                return endH * 60 + endM - (startH * 60 + startM)
              }

              return (
                <Box
                  key={shift.id}
                  onClick={() => {
                    if (staffTypeForDate === 'dynamic') {
                      openShiftEditor({ id: staff.id, name: staff.name, type: 'staff' }, selectedDate, {
                        id: shift.id,
                        start: shift.start,
                        end: shift.end,
                        date: format(selectedDate, 'yyyy-MM-dd')
                      })
                    } else {
                      setSessionResourceFilter(staff.id)
                      setSelectedSession(null) // New session
                      setIsSessionEditorOpen(true)
                    }
                  }}
                  sx={{
                    position: 'absolute',
                    left: `${timeToPosition(formatTime12Hour(shift.start), dayOfWeek)}%`,
                    width: `${calculateWidth(shift.start, shift.end, dayOfWeek)}%`,
                    top: shifts.length > 1 ? `${idx * (100 / shifts.length)}%` : 0,
                    height: shifts.length > 1 ? `${Math.floor(90 / shifts.length)}%` : '100%',
                    bgcolor: staffTypeForDate === 'dynamic' ? 'rgba(10, 44, 36, 0.3)' : 'rgba(158, 158, 158, 0.2)',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: staffTypeForDate === 'dynamic' ? 'success.light' : 'grey.400',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    py: 0.5,
                    zIndex: 2,
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    '&:hover': {
                      bgcolor: staffTypeForDate === 'dynamic' ? 'rgba(139, 195, 74, 0.4)' : 'rgba(158, 158, 158, 0.3)',
                      borderColor: staffTypeForDate === 'dynamic' ? 'success.main' : 'grey.500',
                      boxShadow: 1
                    }
                  }}
                >
                  {/* Time labels on the left */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 60 }}>
                    <Typography variant='caption' fontWeight={500} sx={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
                      {formatTime12Hour(shift.start).toLowerCase()}
                    </Typography>
                    <Typography variant='caption' fontWeight={500} sx={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
                      {formatTime12Hour(shift.end).toLowerCase()}
                    </Typography>
                  </Box>

                  {/* Breaks displayed inline in the middle */}
                  {shift.breaks && shift.breaks.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', flex: 1, mx: 1 }}>
                      {shift.breaks.map(brk => (
                        <Box
                          key={brk.id}
                          sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 0.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            py: 0.25,
                            px: 0.75,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <i className='ri-cup-line' style={{ fontSize: 10, opacity: 0.6 }} />
                          <Typography
                            variant='caption'
                            sx={{ fontSize: '0.6rem', color: 'text.secondary', whiteSpace: 'nowrap' }}
                          >
                            Break ({getBreakDuration(brk)}min)
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Edit icon on the right */}
                  <IconButton
                    size='small'
                    sx={{
                      p: 0.25,
                      opacity: 0.6,
                      '&:hover': { opacity: 1 }
                    }}
                    onClick={e => {
                      e.stopPropagation()
                      openShiftEditor({ id: staff.id, name: staff.name, type: 'staff' }, selectedDate, {
                        id: shift.id,
                        start: shift.start,
                        end: shift.end,
                        date: format(selectedDate, 'yyyy-MM-dd')
                      })
                    }}
                  >
                    <i className='ri-edit-line' style={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              )
            })}

          {/* Sessions — flex cards with dynamic width for static staff */}
          {staffSessions.map(session => (
            <Box
              key={session.id}
              onClick={e => {
                e.stopPropagation()
                setSelectedSession(session)
                setSessionResourceFilter(staff.id)
                setIsSessionEditorOpen(true)
              }}
              sx={{
                minWidth: 130,
                bgcolor: 'rgba(33, 150, 243, 0.12)',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'info.light',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                zIndex: 3,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(33, 150, 243, 0.22)',
                  borderColor: 'info.main',
                  boxShadow: 1
                }
              }}
            >
              {/* Session name */}
              <Typography
                variant='caption'
                fontWeight={700}
                noWrap
                sx={{ fontSize: '0.75rem', lineHeight: 1.3, color: 'info.dark' }}
              >
                {session.name}
              </Typography>
              {/* Time range */}
              <Typography variant='caption' sx={{ fontSize: '0.7rem', lineHeight: 1.4, color: 'text.secondary' }}>
                {formatTime12Hour(session.startTime).toLowerCase()} - {formatTime12Hour(session.endTime).toLowerCase()}
              </Typography>
              {/* Details: participants, price, service */}
              <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <i className='ri-group-line' style={{ fontSize: 12, opacity: 0.6 }} />
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem', lineHeight: 1 }}>
                    {session.maxParticipants}
                  </Typography>
                </Box>
                {session.price != null && Number(session.price) > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <i className='ri-money-dollar-circle-line' style={{ fontSize: 12, opacity: 0.6 }} />
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem', lineHeight: 1 }}>
                      ${session.price}
                    </Typography>
                  </Box>
                )}
                {session.serviceId && serviceNameMap[session.serviceId] && (
                  <Typography
                    variant='caption'
                    noWrap
                    sx={{ fontSize: '0.65rem', lineHeight: 1, color: 'info.main', fontWeight: 500 }}
                  >
                    {serviceNameMap[session.serviceId]}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}

          {/* Add session button for static staff */}
          {staffTypeForDate === 'static' && (
            <Box
              onClick={() => {
                setSessionResourceFilter(staff.id)
                setSelectedSession(null)
                setIsSessionEditorOpen(true)
              }}
              sx={{
                minWidth: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'grey.400',
                borderRadius: 1.5,
                cursor: 'pointer',
                px: 1.5,
                py: 1,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'info.main' }
              }}
            >
              <i className='ri-add-line' style={{ fontSize: 18, opacity: 0.5 }} />
            </Box>
          )}

          {!hasShift && !timeOff && staffTypeForDate !== 'static' && (
            <Box
              onClick={() => openShiftEditor({ id: staff.id, name: staff.name, type: 'staff' }, selectedDate, null)}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Typography variant='caption' color='text.secondary'>
                No Shift
              </Typography>
            </Box>
          )}

          {timeOff && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant='caption' color='text.secondary'>
                {timeOff.reason} (Time Off)
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  // Room rows removed - rooms have their own dedicated tab (RoomsTab)

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

            {/* Room Working Hours - Only show when a specific branch is selected */}
            {selectedBranch !== 'all' &&
              (() => {
                const branchRooms = rooms.filter(r => r.branchId === selectedBranch)
                if (branchRooms.length === 0) return null

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
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    {branchRooms.map(room => {
                      const roomType = room.roomType === 'static' ? 'static' : 'dynamic'
                      const roomSchedule = getRoomSchedule(room.id, dayOfWeek)
                      const businessHours = getBusinessHours(selectedBranch, dayOfWeek)

                      const isOpen =
                        roomType === 'static'
                          ? roomSchedule.isAvailable && roomSchedule.shifts.length > 0
                          : businessHours.isOpen && businessHours.shifts.length > 0

                      const firstShift =
                        roomType === 'static' ? roomSchedule.shifts[0] : isOpen ? businessHours.shifts[0] : null
                      const lastShift =
                        roomType === 'static'
                          ? roomSchedule.shifts[roomSchedule.shifts.length - 1]
                          : isOpen
                            ? businessHours.shifts[businessHours.shifts.length - 1]
                            : null

                      return (
                        <Box
                          key={`room-hours-${room.id}`}
                          sx={{ display: 'flex', borderTop: 1, borderColor: 'divider', minHeight: 56 }}
                        >
                          <Box
                            sx={{
                              width: 200,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1.5,
                              bgcolor: 'action.hover'
                            }}
                          >
                            <i className='ri-home-4-line' style={{ fontSize: 15 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant='body2' fontWeight={600} noWrap>
                                {room.name}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {roomType === 'static' ? 'Fixed' : 'Flex'} room
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ flex: 1, position: 'relative', m: 0.75, borderRadius: 1, overflow: 'hidden' }}>
                            {isOpen && firstShift && lastShift ? (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: `${timeToPosition(formatTime12Hour(firstShift.start), dayOfWeek)}%`,
                                  width: `${calculateWidth(
                                    formatTime12Hour(firstShift.start),
                                    formatTime12Hour(lastShift.end),
                                    dayOfWeek
                                  )}%`,
                                  top: 2,
                                  bottom: 2,
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: roomType === 'static' ? '#81C784' : '#64B5F6',
                                  bgcolor:
                                    roomType === 'static' ? 'rgba(129, 199, 132, 0.22)' : 'rgba(100, 181, 246, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  px: 1
                                }}
                              >
                                <Typography variant='caption' sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                                  {formatTime12Hour(firstShift.start).toLowerCase()} -{' '}
                                  {formatTime12Hour(lastShift.end).toLowerCase()}
                                  {roomType === 'static' && roomSchedule.shifts.length > 1
                                    ? ` • ${roomSchedule.shifts.length} sessions`
                                    : ''}
                                </Typography>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Typography variant='caption' color='text.secondary'>
                                  Closed
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )
                    })}
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
                const branch = apiBranches.find(b => b.id === branchId)
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
                        {(() => {
                          const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
                            selectedDate.getDay()
                          ] as DayOfWeek
                          const targetBranchId =
                            branchId === 'all' ? (apiBranches.length > 0 ? apiBranches[0].id : '1-1') : branchId
                          const businessHours = getBusinessHours(targetBranchId, dayOfWeek) || {
                            isOpen: true,
                            shifts: [{ start: '09:00', end: '17:00' }]
                          }
                          const isOpen = businessHours.isOpen && businessHours.shifts.length > 0

                          // Format time from 24h to 12h
                          const formatTime = (time24: string) => {
                            const [hourStr, minStr] = time24.split(':')
                            let hour = parseInt(hourStr)
                            const minute = minStr
                            const period = hour >= 12 ? 'PM' : 'AM'
                            if (hour === 0) hour = 12
                            else if (hour > 12) hour -= 12
                            return `${hour}:${minute} ${period.toLowerCase()}`
                          }

                          const branchHoursDisplay = isOpen
                            ? `${formatTime(businessHours.shifts[0].start)} - ${formatTime(businessHours.shifts[businessHours.shifts.length - 1].end)}`
                            : 'Closed'

                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <i className='ri-time-line' style={{ fontSize: 14 }} />
                              <Typography variant='caption' color={isOpen ? 'text.secondary' : 'error.main'}>
                                {branchHoursDisplay}
                              </Typography>
                              <IconButton
                                size='small'
                                onClick={() => {
                                  setBusinessHoursDayEditorContext({ branchId, date: selectedDate, dayOfWeek })
                                  setIsBusinessHoursDayEditorOpen(true)
                                }}
                              >
                                <i className='ri-edit-line' style={{ fontSize: 12 }} />
                              </IconButton>
                            </Box>
                          )
                        })()}
                      </Box>
                    )}

                    {/* Staff in this branch - grouped by type */}
                    {(() => {
                      // Group staff by type based on selected date
                      const dynamicStaff = branchStaff.filter(
                        s => getStaffTypeForDate(s.id, selectedDate) === 'dynamic'
                      )
                      const staticStaff = branchStaff.filter(s => getStaffTypeForDate(s.id, selectedDate) === 'static')

                      return (
                        <>
                          {/* Flex Schedule Section */}
                          {dynamicStaff.length > 0 && (
                            <>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.75,
                                  borderBottom: 1,
                                  borderTop: showBranchHeader ? 0 : 1,
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <i
                                  className='ri-time-line'
                                  style={{ fontSize: 14, color: 'var(--mui-palette-primary-main)' }}
                                />
                                <Typography variant='caption' fontWeight={600} color='primary'>
                                  Flex
                                </Typography>
                                <Typography variant='caption' color='text.secondary' sx={{ opacity: 0.7 }}>
                                  {dynamicStaff.length}
                                </Typography>
                              </Box>
                              {dynamicStaff.map(renderEnhancedStaffRow)}
                            </>
                          )}

                          {/* Fixed Schedule Section */}
                          {staticStaff.length > 0 && (
                            <>
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.75,
                                  borderBottom: 1,
                                  borderTop: 1,
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <i
                                  className='ri-calendar-schedule-line'
                                  style={{ fontSize: 14, color: 'var(--mui-palette-text-secondary)' }}
                                />
                                <Typography variant='caption' fontWeight={600} color='text.secondary'>
                                  Fixed
                                </Typography>
                                <Typography variant='caption' color='text.secondary' sx={{ opacity: 0.7 }}>
                                  {staticStaff.length}
                                </Typography>
                              </Box>
                              {staticStaff.map(renderEnhancedStaffRow)}
                            </>
                          )}

                          {/* Rooms Section removed - rooms have their own dedicated tab */}
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
              onEditSession={session => {
                setIsWorkingHoursModalOpen(false)
                setSelectedSession(session)
                setSessionResourceFilter(session.resourceId)
                setIsSessionEditorOpen(true)
              }}
              onAddSession={resourceId => {
                setIsWorkingHoursModalOpen(false)
                setSelectedSession(null)
                setSessionResourceFilter(resourceId)
                setIsSessionEditorOpen(true)
              }}
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
            branchId={selectedBranch}
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
                    <th
                      style={{
                        border: '1px solid var(--mui-palette-divider)',
                        padding: '8px',
                        backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)'
                      }}
                    >
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
                      <td style={{ border: '1px solid var(--mui-palette-divider)', padding: '8px', fontWeight: 600 }}>
                        {staff.name}
                      </td>
                      {weekDates.map((date, idx) => {
                        const timeOff = timeOffRequests.find(
                          req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, date)
                        )
                        return (
                          <td
                            key={idx}
                            style={{
                              border: '1px solid var(--mui-palette-divider)',
                              padding: '8px',
                              textAlign: 'center'
                            }}
                          >
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
              <Box
                sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: '1px solid var(--mui-palette-divider)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
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
              onClose={handleStaffTypeChangeCancel}
              staffId={staffTypeChangeContext.staffId}
              staffName={staffTypeChangeContext.staffName}
              currentType={staffTypeChangeContext.currentType}
              targetType={staffTypeChangeContext.targetType}
              onConfirm={handleStaffTypeChangeConfirm}
              isChanging={isChangingMode}
            />
          )}

          {/* Holiday Hours Modal */}
          <SpecialDaysModal open={isSpecialDaysModalOpen} onClose={closeSpecialDays} />

          {/* Cancel Change Confirmation Dialog */}
          <Dialog
            open={isCancelChangeDialogOpen}
            onClose={() => setIsCancelChangeDialogOpen(false)}
            maxWidth='xs'
            fullWidth
          >
            <DialogTitle>Cancel Pending Change?</DialogTitle>
            <DialogContent>
              <Typography variant='body2' color='text.secondary'>
                Are you sure you want to cancel the pending booking mode change? The resource will stay in its current
                mode.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsCancelChangeDialogOpen(false)} disabled={isCancellingMode}>
                Keep Change
              </Button>
              <Button onClick={handleConfirmCancelChange} color='error' variant='contained' disabled={isCancellingMode}>
                {isCancellingMode ? 'Cancelling...' : 'Yes, Cancel Change'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Session Editor Drawer for STATIC resources (Day View) */}
          <SessionEditorDrawer
            open={isSessionEditorOpen}
            onClose={closeSessionEditor}
            session={selectedSession}
            onSave={handleSessionSave}
            onDelete={handleSessionDelete}
            selectedResourceId={sessionResourceFilter}
            resources={[
              ...staffMembers
                .filter(s => getStaffTypeForDate(s.id, selectedDate) === 'static')
                .map(s => ({
                  id: s.id,
                  name: s.name,
                  branchId: s.branchId || (apiBranches.length > 0 ? apiBranches[0].id : '1-1'),
                  type: 'staff',
                  bookingMode: 'STATIC' as const,
                  capacity: 1,
                  serviceIds: staffServiceAssignments[s.id] || s.serviceIds || []
                })),
              ...rooms
                .filter(r => r.roomType === 'static')
                .map(r => ({
                  id: r.id,
                  name: r.name,
                  branchId: r.branchId || (apiBranches.length > 0 ? apiBranches[0].id : '1-1'),
                  type: 'room',
                  bookingMode: 'STATIC' as const,
                  capacity: r.capacity || 1,
                  serviceIds: r.serviceIds || []
                }))
            ]}
            services={apiServices.map(s => ({
              id: s.id,
              name: s.name,
              duration: s.duration || 60
            }))}
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
                const branch = apiBranches.find(b => b.id === branchId)
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
                          height: 56,
                          px: 2,
                          bgcolor: 'action.hover',
                          borderBottom: 1,
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <i className='ri-building-line' style={{ fontSize: 14, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                              variant='caption'
                              fontWeight={600}
                              fontSize='0.7rem'
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {branch?.name || branchId}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              fontSize='0.65rem'
                              sx={{ flexShrink: 0 }}
                            >
                              ({branchStaff.length})
                            </Typography>
                          </Box>
                          <Typography variant='caption' color='text.secondary' fontSize='0.6rem' display='block'>
                            {branchDaysOpen}d • {branchHours}h/wk
                          </Typography>
                        </Box>
                        <IconButton size='small' onClick={handleOpenBusinessHoursModal} sx={{ flexShrink: 0 }}>
                          <i className='ri-edit-line' style={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    )}

                    {/* Staff in this branch - grouped by type */}
                    {(() => {
                      // Group staff by type based on selected date
                      const dynamicStaff = branchStaff.filter(
                        s => getStaffTypeForDate(s.id, selectedDate) === 'dynamic'
                      )
                      const staticStaff = branchStaff.filter(s => getStaffTypeForDate(s.id, selectedDate) === 'static')

                      return (
                        <>
                          {/* Flex Schedule Section */}
                          {dynamicStaff.length > 0 && (
                            <>
                              <Box
                                sx={{
                                  height: 27,
                                  px: 2,
                                  borderBottom: 1,
                                  borderTop: showBranchHeader ? 0 : 1,
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                <i
                                  className='ri-time-line'
                                  style={{ fontSize: 12, color: 'var(--mui-palette-primary-main)' }}
                                />
                                <Typography variant='caption' fontWeight={600} fontSize='0.65rem' color='primary'>
                                  Flex
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                  fontSize='0.6rem'
                                  sx={{ opacity: 0.7 }}
                                >
                                  {dynamicStaff.length}
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

                          {/* Fixed Schedule Section */}
                          {staticStaff.length > 0 && (
                            <>
                              <Box
                                sx={{
                                  height: 27,
                                  px: 2,
                                  borderBottom: 1,
                                  borderTop: 1,
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                <i
                                  className='ri-calendar-schedule-line'
                                  style={{ fontSize: 12, color: 'var(--mui-palette-text-secondary)' }}
                                />
                                <Typography
                                  variant='caption'
                                  fontWeight={600}
                                  fontSize='0.65rem'
                                  color='text.secondary'
                                >
                                  Fixed
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                  fontSize='0.6rem'
                                  sx={{ opacity: 0.7 }}
                                >
                                  {staticStaff.length}
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
                      {/* Branch header cell with business hours - only show when all branches selected */}
                      {showBranchHeader &&
                        (() => {
                          const dayOfWeek = WEEK_DAYS[dayIndex] as DayOfWeek
                          const targetBranchId =
                            branchId === 'all' ? (apiBranches.length > 0 ? apiBranches[0].id : '1-1') : branchId
                          const businessHours = getBusinessHours(targetBranchId, dayOfWeek) || {
                            isOpen: true,
                            shifts: [{ start: '09:00', end: '17:00' }]
                          }
                          const isOpen = businessHours.isOpen && businessHours.shifts.length > 0

                          // Format time from 24h to 12h
                          const formatTime = (time24: string) => {
                            const [hourStr, minStr] = time24.split(':')
                            let hour = parseInt(hourStr)
                            const minute = minStr
                            const period = hour >= 12 ? 'PM' : 'AM'
                            if (hour === 0) hour = 12
                            else if (hour > 12) hour -= 12
                            return `${hour}:${minute} ${period.toLowerCase()}`
                          }

                          return (
                            <Box
                              sx={{
                                height: 56,
                                borderBottom: 1,
                                borderColor: 'divider',
                                bgcolor: 'action.selected',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 0.5
                              }}
                            >
                              {isOpen ? (
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    bgcolor: 'rgba(10, 44, 36, 0.15)',
                                    borderRadius: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid',
                                    borderColor: 'success.light'
                                  }}
                                >
                                  <Typography
                                    variant='caption'
                                    fontWeight={500}
                                    sx={{ fontSize: '0.6rem', lineHeight: 1.2 }}
                                  >
                                    {formatTime(businessHours.shifts[0].start)}
                                  </Typography>
                                  <Typography
                                    variant='caption'
                                    fontWeight={500}
                                    sx={{ fontSize: '0.6rem', lineHeight: 1.2 }}
                                  >
                                    {formatTime(businessHours.shifts[0].end)}
                                  </Typography>
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    bgcolor: 'grey.800',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Typography variant='caption' color='grey.400' sx={{ fontSize: '0.6rem' }}>
                                    Closed
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )
                        })()}

                      {/* Flex Schedule Section */}
                      {dynamicStaff.length > 0 && (
                        <>
                          {/* Flex staff type header cell */}
                          <Box
                            sx={{
                              height: 27,
                              borderBottom: 1,
                              borderTop: showBranchHeader ? 0 : 1,
                              borderColor: 'divider'
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
                                        onClick={() => {
                                          if (getStaffTypeForDate(staff.id, date) === 'dynamic') {
                                            openShiftEditor({ id: staff.id, name: staff.name, type: 'staff' }, date, {
                                              id: shift.id,
                                              start: shift.start,
                                              end: shift.end,
                                              date: format(date, 'yyyy-MM-dd')
                                            })
                                          } else {
                                            setSessionResourceFilter(staff.id)
                                            setSelectedSession(null) // New session
                                            setIsSessionEditorOpen(true)
                                          }
                                        }}
                                        sx={{
                                          position: 'relative',
                                          width: '100%',
                                          height: shifts.length > 1 ? `calc(${100 / shifts.length}% - 4px)` : '100%',
                                          mb: shifts.length > 1 && idx < shifts.length - 1 ? 0.5 : 0,
                                          bgcolor:
                                            getStaffTypeForDate(staff.id, date) === 'dynamic'
                                              ? 'rgba(10, 44, 36, 0.3)'
                                              : 'rgba(158, 158, 158, 0.2)',
                                          borderRadius: 1,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: 1,
                                          borderColor:
                                            getStaffTypeForDate(staff.id, date) === 'dynamic'
                                              ? 'success.light'
                                              : 'grey.400',
                                          px: 0.5,
                                          py: shifts.length > 1 ? 0.25 : 0.5,
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                          overflow: 'hidden',
                                          '&:hover': {
                                            bgcolor:
                                              getStaffTypeForDate(staff.id, date) === 'dynamic'
                                                ? 'rgba(139, 195, 74, 0.4)'
                                                : 'rgba(158, 158, 158, 0.3)',
                                            borderColor:
                                              getStaffTypeForDate(staff.id, date) === 'dynamic'
                                                ? 'success.main'
                                                : 'grey.500'
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
                                        {getStaffTypeForDate(staff.id, date) === 'dynamic' && (
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
                                              openShiftEditor({ id: staff.id, name: staff.name, type: 'staff' }, date, {
                                                id: shift.id,
                                                start: shift.start,
                                                end: shift.end,
                                                date: format(date, 'yyyy-MM-dd')
                                              })
                                            }}
                                          >
                                            <i className='ri-edit-line' />
                                          </IconButton>
                                        )}
                                      </Box>
                                    )
                                  })}
                                {!hasShift && !timeOff && getStaffTypeForDate(staff.id, date) !== 'static' && (
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
                                        openShiftEditor({ id: staff.id, name: staff.name, type: 'staff' }, date, null)
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

                      {/* Fixed Schedule Section */}
                      {staticStaff.length > 0 && (
                        <>
                          {/* Fixed staff type header cell */}
                          <Box
                            sx={{
                              height: 27,
                              borderBottom: 1,
                              borderTop: 1,
                              borderColor: 'divider'
                            }}
                          />

                          {/* Fixed schedule staff cells */}
                          {staticStaff.map(staff => {
                            const timeOff = timeOffRequests.find(
                              req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, date)
                            )

                            // Get shifts for this specific date (includes date-specific overrides)
                            const dateStr = date.toISOString().split('T')[0]
                            const shifts = getStaffShiftsForDate(staff.id, dateStr)
                            const hasShift = !timeOff && shifts.length > 0 && shifts[0].start !== '00:00'

                            // Filter sessions for this staff and date (only when staff is static on this date)
                            const staffTypeOnDate = getStaffTypeForDate(staff.id, date)
                            const staffSessions =
                              staffTypeOnDate === 'static'
                                ? sessions.filter(
                                    s =>
                                      s.resourceId === staff.id &&
                                      (s.date?.split('T')[0] === dateStr || s.dayOfWeek === date.getDay())
                                  )
                                : []

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
                                {/* Render Sessions as absolute tiles */}
                                {staffSessions.map((session, sIdx) => (
                                  <Box
                                    key={session.id}
                                    onClick={e => {
                                      e.stopPropagation()
                                      setSelectedSession(session)
                                      setSessionResourceFilter(staff.id)
                                      setIsSessionEditorOpen(true)
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      top: staffSessions.length > 1 ? `${4 + sIdx * (72 / staffSessions.length)}%` : 4,
                                      bottom: staffSessions.length > 1 ? undefined : 4,
                                      height:
                                        staffSessions.length > 1
                                          ? `${Math.floor(68 / staffSessions.length)}%`
                                          : undefined,
                                      left: 4,
                                      right: 4,
                                      bgcolor: 'rgba(33, 150, 243, 0.15)',
                                      borderRadius: 1,
                                      border: '1px solid',
                                      borderColor: 'info.light',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      zIndex: 2,
                                      overflow: 'hidden',
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        bgcolor: 'rgba(33, 150, 243, 0.25)',
                                        borderColor: 'info.main',
                                        boxShadow: 1
                                      }
                                    }}
                                  >
                                    <Typography
                                      variant='caption'
                                      fontWeight={600}
                                      noWrap
                                      sx={{ fontSize: '0.6rem', px: 0.5 }}
                                    >
                                      {session.name}
                                    </Typography>
                                    <Typography variant='caption' sx={{ fontSize: '0.55rem' }} noWrap>
                                      {formatTime12Hour(session.startTime).toLowerCase()} -{' '}
                                      {formatTime12Hour(session.endTime).toLowerCase()}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                        <i className='ri-group-line' style={{ fontSize: 10, opacity: 0.5 }} />
                                        <Typography
                                          variant='caption'
                                          color='text.secondary'
                                          sx={{ fontSize: '0.5rem' }}
                                        >
                                          {session.maxParticipants}
                                        </Typography>
                                      </Box>
                                      {session.price != null && Number(session.price) > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                          <i
                                            className='ri-money-dollar-circle-line'
                                            style={{ fontSize: 10, opacity: 0.5 }}
                                          />
                                          <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{ fontSize: '0.5rem' }}
                                          >
                                            ${session.price}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                    {session.serviceId && serviceNameMap[session.serviceId] && (
                                      <Typography
                                        variant='caption'
                                        noWrap
                                        sx={{ fontSize: '0.5rem', color: 'info.main', fontWeight: 500, px: 0.5 }}
                                      >
                                        {serviceNameMap[session.serviceId]}
                                      </Typography>
                                    )}
                                  </Box>
                                ))}

                                {/* Click to add session area (covering whole background) */}
                                <Box
                                  onClick={() => {
                                    if (getStaffTypeForDate(staff.id, date) === 'dynamic') {
                                      openShiftEditor({ id: staff.id, name: staff.name }, date, null)
                                    } else {
                                      setSessionResourceFilter(staff.id)
                                      setSelectedSession(null)
                                      setIsSessionEditorOpen(true)
                                    }
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 1,
                                    cursor: 'pointer'
                                  }}
                                />

                                {!hasShift && !timeOff && getStaffTypeForDate(staff.id, date) !== 'static' && (
                                  <Box
                                    onClick={() => {
                                      if (getStaffTypeForDate(staff.id, date) === 'dynamic') {
                                        openShiftEditor({ id: staff.id, name: staff.name }, date, null)
                                      } else {
                                        setSessionResourceFilter(staff.id)
                                        setSelectedSession(null)
                                        setIsSessionEditorOpen(true)
                                      }
                                    }}
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
                                        if (getStaffTypeForDate(staff.id, date) === 'dynamic') {
                                          openShiftEditor({ id: staff.id, name: staff.name }, date, null)
                                        } else {
                                          setSessionResourceFilter(staff.id)
                                          setSelectedSession(null)
                                          setIsSessionEditorOpen(true)
                                        }
                                      }}
                                    >
                                      <i className='ri-edit-line' style={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Box>
                                )}

                                {/* Visible placeholder for static staff with no sessions */}
                                {getStaffTypeForDate(staff.id, date) === 'static' &&
                                  staffSessions.length === 0 &&
                                  !timeOff && (
                                    <Box
                                      sx={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px dashed',
                                        borderColor: 'grey.300',
                                        pointerEvents: 'none'
                                      }}
                                    >
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{ opacity: 0.6, fontSize: '0.6rem' }}
                                      >
                                        No sessions
                                      </Typography>
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
          onEditSession={session => {
            setIsWorkingHoursModalOpen(false)
            setSelectedSession(session)
            setSessionResourceFilter(session.resourceId)
            setIsSessionEditorOpen(true)
          }}
          onAddSession={resourceId => {
            setIsWorkingHoursModalOpen(false)
            setSelectedSession(null)
            setSessionResourceFilter(resourceId)
            setIsSessionEditorOpen(true)
          }}
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
        branchId={selectedBranch}
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
                <th
                  style={{
                    border: '1px solid var(--mui-palette-divider)',
                    padding: '8px',
                    backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)'
                  }}
                >
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
                  <td style={{ border: '1px solid var(--mui-palette-divider)', padding: '8px', fontWeight: 600 }}>
                    {staff.name}
                  </td>
                  {weekDates.map((date, idx) => {
                    const timeOff = timeOffRequests.find(
                      req => req.staffId === staff.id && req.approved && isSameDay(req.range.start, date)
                    )
                    return (
                      <td
                        key={idx}
                        style={{ border: '1px solid var(--mui-palette-divider)', padding: '8px', textAlign: 'center' }}
                      >
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
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid var(--mui-palette-divider)',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              https://zerv.app/staff/shifts?date={format(selectedDate, 'yyyy-MM-dd')}&view={viewMode.toLowerCase()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Holiday Hours Modal */}
      <SpecialDaysModal open={isSpecialDaysModalOpen} onClose={closeSpecialDays} />

      {/* Calendar Picker Popover */}
      <CalendarPopover
        open={calendarOpen}
        anchorEl={calendarAnchor}
        onClose={handleCloseCalendar}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onJumpWeek={handleJumpWeek}
      />

      {/* Session Editor Drawer for STATIC resources */}
      <SessionEditorDrawer
        open={isSessionEditorOpen}
        onClose={closeSessionEditor}
        session={selectedSession}
        onSave={handleSessionSave}
        onDelete={handleSessionDelete}
        selectedResourceId={sessionResourceFilter}
        resources={[
          ...staffMembers
            .filter(s => getStaffTypeForDate(s.id, selectedDate) === 'static')
            .map(s => ({
              id: s.id,
              name: s.name,
              branchId: s.branchId || (apiBranches.length > 0 ? apiBranches[0].id : '1-1'),
              type: 'staff',
              bookingMode: 'STATIC' as const,
              capacity: 1,
              serviceIds: staffServiceAssignments[s.id] || s.serviceIds || []
            })),
          ...rooms
            .filter(r => r.roomType === 'static')
            .map(r => ({
              id: r.id,
              name: r.name,
              branchId: r.branchId || (apiBranches.length > 0 ? apiBranches[0].id : '1-1'),
              type: 'room',
              bookingMode: 'STATIC' as const,
              capacity: r.capacity || 1,
              serviceIds: r.serviceIds || []
            }))
        ]}
        services={apiServices.map(s => ({
          id: s.id,
          name: s.name,
          duration: s.duration || 60
        }))}
      />

      {/* Error Snackbar for mode change failures */}
      <Snackbar
        open={!!modeChangeError}
        autoHideDuration={8000}
        onClose={() => setModeChangeError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity='error' onClose={() => setModeChangeError(null)} sx={{ width: '100%' }}>
          {modeChangeError}
        </Alert>
      </Snackbar>
    </Box>
  )
}
