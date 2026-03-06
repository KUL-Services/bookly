'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  FormHelperText,
  InputAdornment,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material'
import { format } from 'date-fns'
import type { Session, CreateSessionRequest } from '@/lib/api/types'
import type { Resource } from '../calendar/types'
import { TimeSelectField } from './time-select-field'

interface SessionEditorDrawerProps {
  open: boolean
  onClose: () => void
  session: Session | null // null = create new, otherwise edit
  resources: Resource[] // Resources with STATIC booking mode
  services: { id: string; name: string; duration: number }[]
  onSave: (data: CreateSessionRequest | Partial<Session>) => Promise<void>
  onDelete?: (sessionId: string) => Promise<void>
  selectedResourceId?: string | null
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
]

export function SessionEditorDrawer({
  open,
  onClose,
  session,
  resources,
  services,
  onSave,
  onDelete,
  selectedResourceId
}: SessionEditorDrawerProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [sessionType, setSessionType] = useState<'recurring' | 'one-time'>('recurring')
  const [dayOfWeek, setDayOfWeek] = useState<number>(1) // Monday default
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [maxParticipants, setMaxParticipants] = useState(10)
  const [price, setPrice] = useState<number | ''>('')
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditMode = !!session

  // Get the selected resource name for title
  const selectedResource = resources.find(r => r.id === (session?.resourceId || selectedResourceId || resourceId))

  // Real-time time validation
  const timeValidation = useMemo(() => {
    if (!startTime || !endTime) return { hasError: false, message: '' }
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    if (startMinutes >= endMinutes) {
      return { hasError: true, message: 'End time must be after start time.' }
    }
    return { hasError: false, message: '' }
  }, [startTime, endTime])

  // Calculate session duration
  const durationLabel = useMemo(() => {
    if (!startTime || !endTime || timeValidation.hasError) return ''
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const minutes = endH * 60 + endM - (startH * 60 + startM)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
  }, [startTime, endTime, timeValidation.hasError])

  // Load session data when editing
  useEffect(() => {
    if (open) {
      if (session) {
        setName(session.name)
        setDescription(session.description || '')
        setResourceId(session.resourceId)
        setServiceId(session.serviceId || '')
        setSessionType(session.dayOfWeek != null ? 'recurring' : 'one-time')
        setDayOfWeek(session.dayOfWeek ?? 1)
        setDate(session.date ? session.date.split('T')[0] : '')
        setStartTime(session.startTime)
        setEndTime(session.endTime)
        setMaxParticipants(session.maxParticipants)
        setPrice(session.price ?? '')
        setIsActive(session.isActive)
      } else {
        // Reset for new session
        setName('')
        setDescription('')
        setResourceId(selectedResourceId || resources[0]?.id || '')
        setServiceId('')
        setSessionType('recurring')
        setDayOfWeek(1)
        setDate(format(new Date(), 'yyyy-MM-dd'))
        setStartTime('09:00')
        setEndTime('10:00')
        setMaxParticipants(10)
        setPrice('')
        setIsActive(true)
      }
    }
  }, [open, session, selectedResourceId, resources])

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      alert('Please enter a session name')
      return
    }
    if (!resourceId) {
      alert('Please select a resource')
      return
    }
    if (!startTime || !endTime) {
      alert('Please set start and end times')
      return
    }
    if (sessionType === 'one-time' && !date) {
      alert('Please select a date for the one-time session')
      return
    }
    if (maxParticipants < 1) {
      alert('Maximum participants must be at least 1')
      return
    }

    // Time validation is handled by real-time validation
    if (timeValidation.hasError) {
      return
    }

    setIsSaving(true)

    try {
      const sessionData: CreateSessionRequest | Partial<Session> = {
        ...(isEditMode && session ? { id: session.id } : {}),
        name: name.trim(),
        description: description.trim() || undefined,
        resourceId,
        serviceId: serviceId || undefined,
        startTime,
        endTime,
        maxParticipants,
        price: price !== '' ? Number(price) : undefined,
        ...(sessionType === 'recurring' ? { dayOfWeek } : { date }),
        ...(isEditMode ? { isActive } : {})
      }

      await onSave(sessionData)
      onClose()
    } catch (error) {
      console.error('Failed to save session:', error)
      alert('Failed to save session. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!session?.id || !onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(session.id)
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('Failed to delete session. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter resources to only show STATIC booking mode ones
  const staticResources = resources.filter(r => (r as any).bookingMode === 'STATIC')

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onClose} size='small'>
            <i className='ri-close-line' />
          </IconButton>
          <Typography variant='h6' fontWeight={600}>
            {isEditMode ? 'Edit session' : 'Create session'}
            {selectedResource && (
              <Typography component='span' variant='h6' fontWeight={400} color='text.secondary'>
                {' '}
                &bull; {selectedResource.name}
              </Typography>
            )}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
        {/* Session Name */}
        <TextField
          label='Session Name'
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='e.g., Morning Yoga, Group Consultation'
          required
          fullWidth
        />

        {/* Description */}
        <TextField
          label='Description'
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder='Brief description of the session...'
          multiline
          rows={2}
          fullWidth
        />

        <Divider />

        {/* Resource Selection */}
        <FormControl fullWidth required>
          <InputLabel>Resource</InputLabel>
          <Select
            value={resourceId}
            onChange={e => setResourceId(e.target.value)}
            label='Resource'
            disabled={isEditMode} // Can't change resource when editing
          >
            {staticResources.length === 0 ? (
              <MenuItem disabled>
                <Typography variant='body2' color='text.secondary'>
                  No FIXED mode resources available
                </Typography>
              </MenuItem>
            ) : (
              staticResources.map(resource => (
                <MenuItem key={resource.id} value={resource.id}>
                  {resource.name}
                </MenuItem>
              ))
            )}
          </Select>
          {staticResources.length === 0 && (
            <FormHelperText error>Create a resource with FIXED booking mode first</FormHelperText>
          )}
        </FormControl>

        {/* Service (Optional) */}
        <FormControl fullWidth>
          <InputLabel>Service (Optional)</InputLabel>
          <Select value={serviceId} onChange={e => setServiceId(e.target.value)} label='Service (Optional)'>
            <MenuItem value=''>
              <em>No specific service</em>
            </MenuItem>
            {services
              .filter(service => {
                const resource = resources.find(r => r.id === resourceId)
                const allowedIds = (resource as any)?.serviceIds
                if (!Array.isArray(allowedIds)) return true
                return allowedIds.includes(service.id)
              })
              .map(service => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name} ({service.duration} min)
                </MenuItem>
              ))}
          </Select>
          <FormHelperText>Link this session to a specific service</FormHelperText>
        </FormControl>

        <Divider />

        {/* Session Type */}
        <Box>
          <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
            Session Type
          </Typography>
          <ToggleButtonGroup
            value={sessionType}
            exclusive
            onChange={(_, value) => value && setSessionType(value)}
            fullWidth
            disabled={isEditMode}
          >
            <ToggleButton value='recurring' sx={{ textTransform: 'none', py: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <i className='ri-repeat-line' style={{ fontSize: 18 }} />
                <Typography variant='body2' fontWeight={500}>
                  Recurring
                </Typography>
              </Box>
            </ToggleButton>
            <ToggleButton value='one-time' sx={{ textTransform: 'none', py: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <i className='ri-calendar-event-line' style={{ fontSize: 18 }} />
                <Typography variant='body2' fontWeight={500}>
                  One-Time
                </Typography>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Day of Week (for recurring) or Date (for one-time) */}
        {sessionType === 'recurring' ? (
          <FormControl fullWidth>
            <InputLabel>Day of Week</InputLabel>
            <Select value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))} label='Day of Week'>
              {DAYS_OF_WEEK.map(day => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Session repeats every {DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label}
            </FormHelperText>
          </FormControl>
        ) : (
          <TextField
            type='date'
            label='Date'
            value={date}
            onChange={e => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
        )}

        {/* Time Range */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TimeSelectField
            label='Start Time'
            value={startTime}
            onChange={setStartTime}
            required
            fullWidth
            error={timeValidation.hasError}
          />
          <TimeSelectField
            label='End Time'
            value={endTime}
            onChange={setEndTime}
            required
            fullWidth
            error={timeValidation.hasError}
          />
          {durationLabel && (
            <Chip
              icon={<i className='ri-time-line' style={{ fontSize: 16 }} />}
              size='small'
              label={durationLabel}
              sx={{ flexShrink: 0 }}
            />
          )}
        </Box>

        {/* Time validation error */}
        {timeValidation.hasError && (
          <Alert severity='error' sx={{ py: 0.5 }}>
            <Typography variant='caption'>{timeValidation.message}</Typography>
          </Alert>
        )}

        <Divider />

        {/* Capacity & Price */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type='number'
            label='Max Participants'
            value={maxParticipants}
            onChange={e => setMaxParticipants(Number(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-group-line' style={{ opacity: 0.5 }} />
                </InputAdornment>
              ),
              inputProps: { min: 1 }
            }}
            required
            fullWidth
          />
          <TextField
            type='number'
            label='Price (Optional)'
            value={price}
            onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position='start'>$</InputAdornment>,
              inputProps: { min: 0, step: 0.01 }
            }}
            fullWidth
          />
        </Box>

        {/* Active Toggle (only for editing) */}
        {isEditMode && (
          <>
            <Divider />
            <FormControlLabel
              control={<Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} color='primary' />}
              label={
                <Box>
                  <Typography variant='body2' fontWeight={500}>
                    Active
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {isActive ? 'Session is available for booking' : 'Session is hidden from clients'}
                  </Typography>
                </Box>
              }
            />
          </>
        )}

        {/* Info Box */}
        <Alert severity='info' sx={{ mt: 1 }}>
          <Typography variant='caption'>
            {sessionType === 'recurring'
              ? 'This session will repeat every week on the selected day. Clients can book spots for upcoming occurrences.'
              : 'This is a one-time session on the selected date. It will not repeat.'}
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: isEditMode && onDelete ? 'space-between' : 'flex-end' }}>
        {isEditMode &&
          onDelete &&
          (showDeleteConfirm ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='body2' color='error'>
                Delete this session?
              </Typography>
              <Button size='small' color='error' variant='contained' onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button size='small' onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                No
              </Button>
            </Box>
          ) : (
            <Button
              color='error'
              startIcon={<i className='ri-delete-bin-line' />}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSaving}
            >
              Delete
            </Button>
          ))}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant='outlined' onClick={onClose} disabled={isSaving || isDeleting}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={isSaving || isDeleting || staticResources.length === 0 || timeValidation.hasError}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Session'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
