'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
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
  FormControlLabel
} from '@mui/material'
import { format, parse } from 'date-fns'
import type { Session, CreateSessionRequest } from '@/lib/api/types'
import type { Resource } from '../calendar/types'

interface SessionEditorDrawerProps {
  open: boolean
  onClose: () => void
  session: Session | null // null = create new, otherwise edit
  resources: Resource[] // Resources with STATIC booking mode
  services: { id: string; name: string; duration: number }[]
  onSave: (data: CreateSessionRequest | Partial<Session>) => Promise<void>
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

  const isEditMode = !!session

  // Load session data when editing
  useEffect(() => {
    if (open) {
      if (session) {
        setName(session.name)
        setDescription(session.description || '')
        setResourceId(session.resourceId)
        setServiceId(session.serviceId || '')
        setSessionType(session.dayOfWeek !== undefined ? 'recurring' : 'one-time')
        setDayOfWeek(session.dayOfWeek ?? 1)
        setDate(session.date || '')
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

    // Compare times
    const start = parse(startTime, 'HH:mm', new Date())
    const end = parse(endTime, 'HH:mm', new Date())
    if (end <= start) {
      alert('End time must be after start time')
      return
    }

    setIsSaving(true)

    try {
      const sessionData: CreateSessionRequest | Partial<Session> = {
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

  // Filter resources to only show STATIC booking mode ones
  const staticResources = resources.filter(r => (r as any).bookingMode === 'STATIC')

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 } }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <i className='ri-calendar-schedule-line' style={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant='h6' fontWeight={600}>
                {isEditMode ? 'Edit Session' : 'Create Session'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {isEditMode ? 'Update session details' : 'Define a new session for booking'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Form */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
              {services.map(service => (
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type='time'
              label='Start Time'
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              type='time'
              label='End Time'
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Box>

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
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='outlined' onClick={onClose} fullWidth disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleSave}
            fullWidth
            disabled={isSaving || staticResources.length === 0}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Session'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
