'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  TextField,
  InputLabel,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Avatar,
  Alert,
  Snackbar
} from '@mui/material'
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns'
import { useStaffManagementStore } from './staff-store'

import type { DayOfWeek } from '../calendar/types'
import type { Session } from '@/lib/api/types'
import { TimeSelectField } from './time-select-field'

interface StaffEditWorkingHoursModalProps {
  open: boolean
  onClose: () => void
  staffId: string
  staffName: string
  staffType?: 'dynamic' | 'static'
  referenceDate?: Date // The date/week being viewed
  bulkStaffIds?: string[] // For bulk editing multiple staff
  onEditSession?: (session: Session) => void
  onAddSession?: (resourceId: string) => void
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DAY_LABELS: Record<DayOfWeek, string> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday'
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const durationMinutes = endMinutes - startMinutes

  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
}

export function StaffEditWorkingHoursModal({
  open,
  onClose,
  staffId,
  staffName,
  staffType = 'dynamic',
  referenceDate,
  bulkStaffIds,
  onEditSession,
  onAddSession
}: StaffEditWorkingHoursModalProps) {
  const {
    getStaffWorkingHours,
    updateStaffWorkingHours,
    updateShiftsForDate,
    staffMembers,
    apiServices,
    saveStaffWorkingHours,
    saveShiftsExceptions,
    sessions
  } = useStaffManagementStore()
  const [effectiveDate, setEffectiveDate] = useState('immediately')
  const [applyToAllWeeks, setApplyToAllWeeks] = useState(staffType === 'dynamic')
  const [isSaving, setIsSaving] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'error'
  })

  // Session data for static staff
  const staffSessions = useMemo(() => {
    if (staffType !== 'static') return []
    return sessions.filter((s: Session) => s.resourceId === staffId)
  }, [staffType, sessions, staffId])

  const sessionsByDay = useMemo(() => {
    const byDay: Record<number, Session[]> = {}
    const oneTime: Session[] = []
    for (const session of staffSessions) {
      if (session.dayOfWeek != null) {
        if (!byDay[session.dayOfWeek]) byDay[session.dayOfWeek] = []
        byDay[session.dayOfWeek].push(session)
      } else if (session.date) {
        oneTime.push(session)
      }
    }
    return { byDay, oneTime }
  }, [staffSessions])

  // Determine if this is bulk mode
  const isBulkMode = bulkStaffIds && bulkStaffIds.length > 0

  // Get all staff details for bulk mode
  const bulkStaffDetails = isBulkMode ? bulkStaffIds.map(id => staffMembers.find(s => s.id === id)).filter(Boolean) : []

  // Helper function to get initials
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }

  // Calculate the current week dates
  const weekDates = referenceDate
    ? eachDayOfInterval({
        start: startOfWeek(referenceDate, { weekStartsOn: 0 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 0 })
      })
    : []

  const handleSave = async () => {
    // Determine which staff to update
    const staffIdsToUpdate = isBulkMode ? bulkStaffIds : [staffId]

    // Validate all shifts for overlaps before saving
    for (const currentStaffId of staffIdsToUpdate) {
      for (const day of DAYS_OF_WEEK) {
        const dayHours = getStaffWorkingHours(currentStaffId, day)

        if (dayHours.isWorking && dayHours.shifts.length > 1) {
          // Check all pairs of shifts for overlaps
          for (let i = 0; i < dayHours.shifts.length; i++) {
            const shift1 = dayHours.shifts[i]
            const [startH1, startM1] = shift1.start.split(':').map(Number)
            const [endH1, endM1] = shift1.end.split(':').map(Number)
            const start1 = startH1 * 60 + startM1
            const end1 = endH1 * 60 + endM1

            // Validate end time is after start time
            if (end1 <= start1) {
              setSnackbar({
                open: true,
                message: `${DAY_LABELS[day]}: Shift ${i + 1} end time must be after start time`,
                severity: 'error'
              })
              return
            }

            for (let j = i + 1; j < dayHours.shifts.length; j++) {
              const shift2 = dayHours.shifts[j]
              const [startH2, startM2] = shift2.start.split(':').map(Number)
              const [endH2, endM2] = shift2.end.split(':').map(Number)
              const start2 = startH2 * 60 + startM2
              const end2 = endH2 * 60 + endM2

              // Check for overlap
              if (start1 < end2 && end1 > start2) {
                setSnackbar({
                  open: true,
                  message: `${DAY_LABELS[day]}: Shift ${i + 1} and Shift ${j + 1} have overlapping times. Please adjust the times so they don't conflict.`,
                  severity: 'error'
                })
                return
              }
            }
          }
        }
      }
    }

    setIsSaving(true)
    try {
      if (applyToAllWeeks) {
        // Save recurring templates to backend for all staff
        for (const currentStaffId of staffIdsToUpdate) {
          await saveStaffWorkingHours(currentStaffId)
        }
        onClose()
      } else {
        // Create shift instances for this week only
        if (!referenceDate) {
          console.warn('Cannot save for this week only without a reference date')
          onClose()
          return
        }

        // Apply to all staff (bulk mode) or just the single staff
        for (const currentStaffId of staffIdsToUpdate) {
          // Create shift instances for each day of the week
          for (let index = 0; index < weekDates.length; index++) {
            const date = weekDates[index]
            const dayOfWeek = DAYS_OF_WEEK[index]
            const dayHours = getStaffWorkingHours(currentStaffId, dayOfWeek)
            const dateStr = date.toISOString().split('T')[0]

            if (dayHours.isWorking && dayHours.shifts.length > 0) {
              // Create shift instances for all shifts on this day
              const shiftInstances = dayHours.shifts.map(shift => ({
                id: shift.id,
                date: dateStr,
                start: shift.start,
                end: shift.end,
                breaks: shift.breaks && shift.breaks.length > 0 ? shift.breaks : undefined,
                reason: 'manual' as const
              }))
              updateShiftsForDate(currentStaffId, dateStr, shiftInstances)
              await saveShiftsExceptions(currentStaffId, dateStr, shiftInstances)
            } else {
              // Create no-shift instance for this specific date
              const shiftInstances = [
                {
                  id: crypto.randomUUID(),
                  date: dateStr,
                  start: '00:00',
                  end: '00:00',
                  breaks: undefined,
                  reason: 'manual' as const
                }
              ]
              updateShiftsForDate(currentStaffId, dateStr, shiftInstances)
              await saveShiftsExceptions(currentStaffId, dateStr, shiftInstances)
            }
          }
        }

        onClose()
      }
    } catch (err) {
      console.error('Failed to save staff hours:', err)
      setSnackbar({ open: true, message: 'Failed to save working hours. Please try again.', severity: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  // Static staff: render sessions view instead of shifts
  if (staffType === 'static') {
    const formatTime12h = (time24: string): string => {
      const [hourStr, minStr] = time24.split(':')
      let hour = parseInt(hourStr)
      const minute = minStr
      const period = hour >= 12 ? 'PM' : 'AM'
      if (hour === 0) hour = 12
      else if (hour > 12) hour -= 12
      return `${hour}:${minute} ${period}`
    }

    return (
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
        <DialogTitle>
          <Typography variant='h6' fontWeight={600}>
            {staffName} &mdash; Sessions
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Schedule is defined by sessions for this fixed-mode staff member
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity='info' sx={{ py: 0.5 }}>
              <Typography variant='caption'>
                <strong>Fixed Mode</strong> &mdash; This staff member&apos;s schedule is defined by sessions. Click on a
                session to edit it, or add new sessions.
              </Typography>
            </Alert>

            {[0, 1, 2, 3, 4, 5, 6].map(dayNum => {
              const dayLabel = DAY_LABELS[DAYS_OF_WEEK[dayNum]]
              const daySessions = sessionsByDay.byDay[dayNum] || []

              return (
                <Paper
                  key={dayNum}
                  variant='outlined'
                  sx={{ p: 2, bgcolor: daySessions.length > 0 ? 'background.paper' : 'action.hover' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: daySessions.length > 0 ? 1.5 : 0 }}>
                    <Typography variant='subtitle1' fontWeight={600} sx={{ minWidth: 100 }}>
                      {dayLabel}
                    </Typography>
                    {daySessions.length === 0 && <Chip size='small' label='No Sessions' color='default' />}
                    {daySessions.length > 0 && (
                      <Chip
                        size='small'
                        label={`${daySessions.length} session${daySessions.length > 1 ? 's' : ''}`}
                        color='primary'
                        variant='outlined'
                      />
                    )}
                  </Box>
                  {daySessions.map(session => (
                    <Box
                      key={session.id}
                      onClick={() => onEditSession?.(session)}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'info.light',
                        borderRadius: 1,
                        bgcolor: 'rgba(33, 150, 243, 0.06)',
                        cursor: onEditSession ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        '&:hover': onEditSession
                          ? { bgcolor: 'rgba(33, 150, 243, 0.12)', borderColor: 'info.main' }
                          : {},
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant='body2' fontWeight={600}>
                          {session.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {formatTime12h(session.startTime)} - {formatTime12h(session.endTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant='caption' color='text.secondary'>
                          <i className='ri-group-line' style={{ fontSize: 12, marginRight: 2 }} />{' '}
                          {session.maxParticipants} spots
                        </Typography>
                        {session.price != null && (
                          <Typography variant='caption' color='text.secondary'>
                            ${session.price}
                          </Typography>
                        )}
                        {session.serviceId && (
                          <Typography variant='caption' color='info.main' fontWeight={500}>
                            {apiServices.find((s: any) => s.id === session.serviceId)?.name || 'Service'}
                          </Typography>
                        )}
                        {!session.isActive && (
                          <Chip
                            size='small'
                            label='Inactive'
                            color='default'
                            sx={{ height: 18, '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' } }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              )
            })}

            {sessionsByDay.oneTime.length > 0 && (
              <>
                <Typography variant='subtitle2' fontWeight={600} sx={{ mt: 1 }}>
                  One-Time Sessions
                </Typography>
                {sessionsByDay.oneTime.map(session => (
                  <Paper
                    key={session.id}
                    variant='outlined'
                    onClick={() => onEditSession?.(session)}
                    sx={{
                      p: 1.5,
                      cursor: onEditSession ? 'pointer' : 'default',
                      border: '1px solid',
                      borderColor: 'warning.light',
                      bgcolor: 'rgba(255, 152, 0, 0.06)',
                      transition: 'all 0.2s',
                      '&:hover': onEditSession
                        ? { bgcolor: 'rgba(255, 152, 0, 0.12)', borderColor: 'warning.main' }
                        : {}
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant='body2' fontWeight={600}>
                        {session.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip size='small' label={session.date ? session.date.split('T')[0] : ''} variant='outlined' />
                        <Typography variant='caption' color='text.secondary'>
                          {formatTime12h(session.startTime)} - {formatTime12h(session.endTime)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {session.maxParticipants} spots
                      </Typography>
                      {session.price != null && (
                        <Typography variant='caption' color='text.secondary'>
                          ${session.price}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ))}
              </>
            )}

            {staffSessions.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 1 }}>
                <i className='ri-calendar-schedule-line' style={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  No sessions created yet
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Add sessions to define when this staff member is available
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant='outlined'>
            Close
          </Button>
          {onAddSession && (
            <Button onClick={() => onAddSession(staffId)} variant='contained' startIcon={<i className='ri-add-line' />}>
              Add Session
            </Button>
          )}
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Typography variant='h6' fontWeight={600}>
          {isBulkMode ? 'Bulk Edit • Working Hours' : `Edit • Working Hours • ${staffName}`}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {isBulkMode ? 'Set working hours for multiple staff members' : `Set working hours for ${staffName}`}
        </Typography>

        {/* Bulk Staff Chips Display */}
        {isBulkMode && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {bulkStaffDetails.map(staff => {
              if (!staff) return null
              return (
                <Chip
                  key={staff.id}
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: staff.color || '#0a2c24',
                        width: 24,
                        height: 24,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                    >
                      {getInitials(staff.name)}
                    </Avatar>
                  }
                  label={staff.name}
                  sx={{
                    bgcolor: `${staff.color || '#0a2c24'}20`,
                    borderColor: staff.color || '#0a2c24',
                    '& .MuiChip-label': {
                      color: 'text.primary',
                      fontWeight: 500
                    }
                  }}
                  variant='outlined'
                />
              )
            })}
          </Box>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Apply To Toggle */}
          <Box
            sx={{
              p: 2,
              bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.08)' : 'rgba(25,118,210,0.08)'),
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.main'
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={applyToAllWeeks}
                  onChange={e => setApplyToAllWeeks(e.target.checked)}
                  color='primary'
                />
              }
              label={
                <Box>
                  <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-repeat-line' style={{ fontSize: 18 }} />
                    Apply to Future Weeks
                    <Chip
                      size='small'
                      label={applyToAllWeeks ? 'On' : 'Off'}
                      color={applyToAllWeeks ? 'primary' : 'default'}
                      variant={applyToAllWeeks ? 'filled' : 'outlined'}
                      sx={{ height: 18, fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }}
                    />
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {applyToAllWeeks
                      ? `Changes will apply to the recurring weekly schedule for ${staffName}. This sets the default working hours for each day of the week.`
                      : referenceDate
                        ? `Changes will only apply to the week of ${format(startOfWeek(referenceDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(referenceDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}. The recurring schedule will remain unchanged.`
                        : 'Changes will only apply to the current week. The recurring schedule will remain unchanged.'}
                  </Typography>
                </Box>
              }
            />
          </Box>

          {DAYS_OF_WEEK.map(day => {
            const dayHours = getStaffWorkingHours(staffId, day)

            // Check for shift overlaps for this day
            const checkShiftOverlaps = (shifts: typeof dayHours.shifts) => {
              const overlaps: Array<{ shift1: number; shift2: number }> = []

              for (let i = 0; i < shifts.length; i++) {
                const shift1 = shifts[i]
                const [startH1, startM1] = shift1.start.split(':').map(Number)
                const [endH1, endM1] = shift1.end.split(':').map(Number)
                const start1 = startH1 * 60 + startM1
                const end1 = endH1 * 60 + endM1

                // Check if end time is before start time
                if (end1 <= start1) {
                  overlaps.push({ shift1: i, shift2: i })
                  continue
                }

                for (let j = i + 1; j < shifts.length; j++) {
                  const shift2 = shifts[j]
                  const [startH2, startM2] = shift2.start.split(':').map(Number)
                  const [endH2, endM2] = shift2.end.split(':').map(Number)
                  const start2 = startH2 * 60 + startM2
                  const end2 = endH2 * 60 + endM2

                  // Check for overlap
                  if (start1 < end2 && end1 > start2) {
                    overlaps.push({ shift1: i, shift2: j })
                  }
                }
              }

              return overlaps
            }

            const shiftOverlaps = checkShiftOverlaps(dayHours.shifts)
            const hasOverlaps = shiftOverlaps.length > 0

            const handleToggleWorking = () => {
              if (dayHours.isWorking) {
                updateStaffWorkingHours(staffId, day, {
                  isWorking: false,
                  shifts: []
                })
              } else {
                updateStaffWorkingHours(staffId, day, {
                  isWorking: true,
                  shifts: [
                    {
                      id: crypto.randomUUID(),
                      start: '09:00',
                      end: '17:00',
                      breaks: []
                    }
                  ]
                })
              }
            }

            const handleUpdateShift = (shiftIndex: number, field: 'start' | 'end', value: string) => {
              const newShifts = [...dayHours.shifts]
              newShifts[shiftIndex] = {
                ...newShifts[shiftIndex],
                [field]: value
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleUpdateCapacity = (shiftIndex: number, capacity: number) => {
              const newShifts = [...dayHours.shifts]
              newShifts[shiftIndex] = {
                ...newShifts[shiftIndex],
                capacity
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleUpdateServices = (shiftIndex: number, serviceIds: string[]) => {
              const newShifts = [...dayHours.shifts]
              newShifts[shiftIndex] = {
                ...newShifts[shiftIndex],
                serviceIds
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleAddShift = () => {
              const newShifts = [
                ...dayHours.shifts,
                {
                  id: crypto.randomUUID(),
                  start: '09:00',
                  end: '17:00',
                  breaks: []
                }
              ]
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleRemoveShift = (shiftIndex: number) => {
              if (dayHours.shifts.length > 1) {
                const newShifts = dayHours.shifts.filter((_, idx) => idx !== shiftIndex)
                updateStaffWorkingHours(staffId, day, {
                  ...dayHours,
                  shifts: newShifts
                })
              }
            }

            const handleAddBreak = (shiftIndex: number) => {
              const newShifts = [...dayHours.shifts]
              const shift = newShifts[shiftIndex]
              newShifts[shiftIndex] = {
                ...shift,
                breaks: [
                  ...(shift.breaks || []),
                  {
                    id: crypto.randomUUID(),
                    start: '12:00',
                    end: '13:00'
                  }
                ]
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleRemoveBreak = (shiftIndex: number, breakId: string) => {
              const newShifts = [...dayHours.shifts]
              const shift = newShifts[shiftIndex]
              newShifts[shiftIndex] = {
                ...shift,
                breaks: (shift.breaks || []).filter(b => b.id !== breakId)
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleUpdateBreak = (shiftIndex: number, breakId: string, field: 'start' | 'end', value: string) => {
              const newShifts = [...dayHours.shifts]
              const shift = newShifts[shiftIndex]
              newShifts[shiftIndex] = {
                ...shift,
                breaks: (shift.breaks || []).map(b => (b.id === breakId ? { ...b, [field]: value } : b))
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            return (
              <Paper
                key={day}
                variant='outlined'
                sx={{
                  p: 2,
                  bgcolor: dayHours.isWorking ? 'background.paper' : 'action.hover'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: dayHours.isWorking ? 2 : 0 }}>
                  <FormControlLabel
                    control={<Switch checked={dayHours.isWorking} onChange={handleToggleWorking} color='primary' />}
                    label={
                      <Typography variant='subtitle1' fontWeight={600} sx={{ minWidth: 100 }}>
                        {DAY_LABELS[day]}
                      </Typography>
                    }
                  />

                  {dayHours.isWorking && dayHours.shifts.length > 0 && (
                    <Chip
                      size='small'
                      label={calculateDuration(dayHours.shifts[0].start, dayHours.shifts[0].end)}
                      color='primary'
                      variant='outlined'
                    />
                  )}

                  {!dayHours.isWorking && <Chip size='small' label='Not Working' color='default' />}
                </Box>

                {dayHours.isWorking && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayHours.shifts.map((shift, shiftIndex) => (
                      <Box
                        key={shift.id}
                        sx={{
                          p: 1.5,
                          border: dayHours.shifts.length > 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: dayHours.shifts.length > 1 ? 'action.hover' : 'transparent'
                        }}
                      >
                        {/* Shift Header (only show if multiple shifts) */}
                        {dayHours.shifts.length > 1 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant='caption' fontWeight={600} color='text.secondary'>
                              Shift {shiftIndex + 1}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton size='small' color='error' onClick={() => handleRemoveShift(shiftIndex)}>
                              <i className='ri-delete-bin-line' style={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <TimeSelectField
                            value={shift.start}
                            onChange={value => handleUpdateShift(shiftIndex, 'start', value)}
                            size='small'
                            sx={{ minWidth: 140 }}
                          />

                          <TimeSelectField
                            value={shift.end}
                            onChange={value => handleUpdateShift(shiftIndex, 'end', value)}
                            size='small'
                            sx={{ minWidth: 140 }}
                          />

                          <Chip
                            icon={<i className='ri-time-line' style={{ fontSize: 16 }} />}
                            size='small'
                            label={calculateDuration(shift.start, shift.end)}
                            sx={{ ml: 1 }}
                          />

                          <Button
                            size='small'
                            variant='text'
                            onClick={() => handleAddBreak(shiftIndex)}
                            sx={{ ml: 'auto' }}
                          >
                            + Add Break
                          </Button>
                        </Box>

                        {/* Breaks */}
                        {shift.breaks && shift.breaks.length > 0 && (
                          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {shift.breaks.map(breakRange => (
                              <Box key={breakRange.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', pl: 0 }}>
                                <Typography variant='body2' sx={{ minWidth: 60, color: 'text.secondary' }}>
                                  Break
                                </Typography>

                                <TimeSelectField
                                  value={breakRange.start}
                                  onChange={value => handleUpdateBreak(shiftIndex, breakRange.id, 'start', value)}
                                  size='small'
                                  sx={{ minWidth: 140 }}
                                />

                                <TimeSelectField
                                  value={breakRange.end}
                                  onChange={value => handleUpdateBreak(shiftIndex, breakRange.id, 'end', value)}
                                  size='small'
                                  sx={{ minWidth: 140 }}
                                />

                                <Chip
                                  size='small'
                                  label={calculateDuration(breakRange.start, breakRange.end)}
                                  variant='outlined'
                                />

                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => handleRemoveBreak(shiftIndex, breakRange.id)}
                                >
                                  <i className='ri-delete-bin-line' />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}

                    {/* Add Another Shift Button */}
                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<i className='ri-add-line' />}
                      onClick={handleAddShift}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Add Another Shift
                    </Button>

                    {/* Overlap Warning */}
                    {hasOverlaps && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          bgcolor: 'error.50',
                          border: '1px solid',
                          borderColor: 'error.main',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <i
                          className='ri-error-warning-line'
                          style={{ color: 'var(--mui-palette-error-main)', fontSize: 18 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='body2' fontWeight={600} color='error.main'>
                            Overlapping Shifts Detected
                          </Typography>
                          {shiftOverlaps.map((overlap, idx) => (
                            <Typography key={idx} variant='caption' color='error.dark' display='block'>
                              {overlap.shift1 === overlap.shift2
                                ? `Shift ${overlap.shift1 + 1}: End time must be after start time`
                                : `Shift ${overlap.shift1 + 1} and Shift ${overlap.shift2 + 1} have overlapping times`}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            )
          })}

          {/* Make Changes Effective */}
          <Box sx={{ mt: 2 }}>
            <Typography variant='subtitle2' gutterBottom fontWeight={600}>
              Make changes effective
            </Typography>
            <FormControl fullWidth size='small'>
              <Select value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)}>
                <MenuItem value='immediately'>Immediately</MenuItem>
                <MenuItem value='next-week'>Next Week</MenuItem>
                <MenuItem value='custom'>Custom Date</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Timeframe Info */}
          <Paper
            variant='outlined'
            sx={{
              p: 2,
              bgcolor: 'action.hover',
              borderStyle: 'dashed'
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              <strong>TIMEFRAME:</strong> These changes will apply to future scheduling for {staffName}. Existing
              appointments will not be affected.
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant='outlined'>
          CANCEL
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={DAYS_OF_WEEK.some(day => {
            const dayHours = getStaffWorkingHours(staffId, day)
            if (!dayHours.isWorking || dayHours.shifts.length <= 1) return false

            // Check for overlaps
            for (let i = 0; i < dayHours.shifts.length; i++) {
              const shift1 = dayHours.shifts[i]
              const [startH1, startM1] = shift1.start.split(':').map(Number)
              const [endH1, endM1] = shift1.end.split(':').map(Number)
              const start1 = startH1 * 60 + startM1
              const end1 = endH1 * 60 + endM1

              if (end1 <= start1) return true

              for (let j = i + 1; j < dayHours.shifts.length; j++) {
                const shift2 = dayHours.shifts[j]
                const [startH2, startM2] = shift2.start.split(':').map(Number)
                const [endH2, endM2] = shift2.end.split(':').map(Number)
                const start2 = startH2 * 60 + startM2
                const end2 = endH2 * 60 + endM2

                if (start1 < end2 && end1 > start2) return true
              }
            }
            return false
          })}
        >
          {isSaving ? 'SAVING...' : 'SAVE'}
        </Button>
      </DialogActions>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}
