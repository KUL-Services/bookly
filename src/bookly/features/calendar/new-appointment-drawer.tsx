'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Checkbox,
  FormControlLabel,
  Chip,
  InputAdornment
} from '@mui/material'
import { mockStaff } from '@/bookly/data/mock-data'
import type { DateRange } from './types'
import type { User } from '@/bookly/data/types'
import { useCalendarStore } from './state'
import { isStaffAvailable, hasConflict } from './utils'
import ClientPickerDialog from './client-picker-dialog'

interface NewAppointmentDrawerProps {
  open: boolean
  initialDate?: Date | null
  initialDateRange?: DateRange | null
  initialStaffId?: string | null
  onClose: () => void
  onSave?: (appointment: any) => void
}

export default function NewAppointmentDrawer({
  open,
  initialDate,
  initialDateRange,
  initialStaffId,
  onClose,
  onSave
}: NewAppointmentDrawerProps) {
  const [activeTab, setActiveTab] = useState(0)
  const events = useCalendarStore(state => state.events)

  // Form state
  const [date, setDate] = useState(initialDate || new Date())
  const [startTime, setStartTime] = useState('11:15')
  const [endTime, setEndTime] = useState('11:30')
  const [staffId, setStaffId] = useState(initialStaffId || '')
  const [selectedClient, setSelectedClient] = useState<User | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [service, setService] = useState('')
  const [servicePrice, setServicePrice] = useState(0)
  const [notes, setNotes] = useState('')
  const [requestedByClient, setRequestedByClient] = useState(false)
  const [staffManuallyChosen, setStaffManuallyChosen] = useState(!!initialStaffId)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null)
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false)

  // Service pricing map
  const servicePrices: Record<string, number> = {
    haircut: 65,
    manicure: 35,
    massage: 80,
    color: 120,
    pedicure: 40,
    facial: 90,
    waxing: 45
  }

  // Update state when props change
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate)
    }
    if (initialDateRange) {
      const start = new Date(initialDateRange.start)
      const end = new Date(initialDateRange.end)
      setStartTime(start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    }
    if (initialStaffId) {
      setStaffId(initialStaffId)
      setStaffManuallyChosen(true)
    }
  }, [initialDate, initialDateRange, initialStaffId, open])

  // Check availability in real-time and show as warning
  useEffect(() => {
    if (!staffId || !startTime || !endTime) {
      setAvailabilityWarning(null)
      return
    }

    // Check staff availability
    const availability = isStaffAvailable(staffId, date, startTime, endTime)
    if (!availability.available) {
      setAvailabilityWarning(availability.reason || 'Staff is not available at this time')
      return
    }

    // Check for conflicts
    const conflict = hasConflict(events, staffId, date, startTime, endTime)
    if (conflict.conflict) {
      const conflictStart = new Date(conflict.conflictingEvent!.start)
      const conflictEnd = new Date(conflict.conflictingEvent!.end)
      const conflictTimeStr = `${conflictStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${conflictEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
      setAvailabilityWarning(`Conflicts with existing appointment (${conflictTimeStr})`)
      return
    }

    setAvailabilityWarning(null)
  }, [staffId, date, startTime, endTime, events])

  const handleSave = () => {
    // Clear previous validation errors
    setValidationError(null)

    // Validate required fields only
    if (!staffId) {
      setValidationError('Please select a staff member')
      return
    }

    // Validate time format and order
    if (startTime >= endTime) {
      setValidationError('End time must be after start time')
      return
    }

    // Note: Availability and conflict checks are shown as warnings, not blocking errors
    // This allows booking outside normal hours if needed (emergency bookings, etc.)

    const appointment = {
      date,
      startTime,
      endTime,
      staffId,
      clientName,
      clientEmail,
      clientPhone,
      service,
      servicePrice,
      notes,
      requestedByClient,
      staffManuallyChosen
    }
    onSave?.(appointment)
    handleClose()
  }

  const handleServiceChange = (newService: string) => {
    setService(newService)
    setServicePrice(servicePrices[newService] || 0)
  }

  const handleClientSelect = (client: User | null) => {
    setSelectedClient(client)
    if (client) {
      setClientName(`${client.firstName} ${client.lastName}`)
      setClientEmail(client.email)
      setClientPhone(client.phone)
    } else {
      // Walk-in - clear fields
      setClientName('')
      setClientEmail('')
      setClientPhone('')
    }
  }

  const handleClose = () => {
    // Reset form
    setActiveTab(0)
    setSelectedClient(null)
    setClientName('')
    setClientEmail('')
    setClientPhone('')
    setService('')
    setServicePrice(0)
    setNotes('')
    setRequestedByClient(false)
    setValidationError(null)
    setAvailabilityWarning(null)
    onClose()
  }

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight={600}>
            New Appointment
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>

        {/* Client Selection */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box
            onClick={() => setIsClientPickerOpen(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              border: '2px dashed',
              borderColor: selectedClient ? 'primary.main' : 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: selectedClient ? 'action.selected' : 'transparent',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <Avatar
              src={selectedClient?.profileImage}
              sx={{ width: 56, height: 56, bgcolor: 'grey.200' }}
            >
              {selectedClient ? (
                `${selectedClient.firstName[0]}${selectedClient.lastName[0]}`
              ) : (
                <i className="ri-user-line" style={{ fontSize: '2rem', color: '#999' }} />
              )}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              {selectedClient ? (
                <>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedClient.firstName} {selectedClient.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedClient.email}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Select a client or leave empty for walk-in
                </Typography>
              )}
            </Box>
            <IconButton onClick={e => {
              e.stopPropagation()
              if (selectedClient) {
                setSelectedClient(null)
                setClientName('')
                setClientEmail('')
                setClientPhone('')
              } else {
                setIsClientPickerOpen(true)
              }
            }}>
              <i className={selectedClient ? 'ri-close-line' : 'ri-add-line'} />
            </IconButton>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="APPOINTMENT" />
            <Tab label="NOTES & INFO" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Date */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  {formatDate(date)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<i className="ri-group-line" />}
                    sx={{ textTransform: 'none' }}
                  >
                    Group Booking
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<i className="ri-repeat-line" />}
                    sx={{ textTransform: 'none' }}
                  >
                    Recurring
                  </Button>
                </Box>
              </Box>

              <Divider />

              {/* Service Selection */}
              <FormControl fullWidth>
                <TextField
                  select
                  label="Select service"
                  value={service}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <i className="ri-arrow-right-s-line" />
                      </InputAdornment>
                    )
                  }}
                >
                  <MenuItem value="">Select service</MenuItem>
                  <MenuItem value="haircut">Haircut & Style - $65</MenuItem>
                  <MenuItem value="manicure">Manicure - $35</MenuItem>
                  <MenuItem value="massage">Massage - $80</MenuItem>
                  <MenuItem value="color">Hair Color - $120</MenuItem>
                  <MenuItem value="pedicure">Pedicure - $40</MenuItem>
                  <MenuItem value="facial">Facial - $90</MenuItem>
                  <MenuItem value="waxing">Waxing - $45</MenuItem>
                </TextField>
              </FormControl>

              {/* Time Selection */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="START"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }} // 15 min intervals
                />
                <TextField
                  label="END"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }}
                />
              </Box>

              {/* Staff Selection */}
              <FormControl fullWidth>
                <InputLabel>STAFF</InputLabel>
                <Select
                  value={staffId}
                  label="STAFF"
                  onChange={(e) => {
                    setStaffId(e.target.value)
                    setStaffManuallyChosen(true)
                  }}
                >
                  {mockStaff.slice(0, 7).map((staff) => (
                    <MenuItem key={staff.id} value={staff.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={staff.photo} sx={{ width: 24, height: 24 }}>
                          {staff.name[0]}
                        </Avatar>
                        {staff.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Warning if staff not available */}
              {availabilityWarning && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: theme => (theme.palette.mode === 'dark' ? 'warning.dark' : 'warning.light'),
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: theme => `1px solid ${theme.palette.warning.main}`
                  }}
                >
                  <i className="ri-information-line" />
                  <Typography variant="body2" color="warning.dark">
                    {availabilityWarning}
                  </Typography>
                </Box>
              )}

              {/* Staff Selection Options */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-user-settings-line" />
                <Typography variant="body2">
                  Staff Member chosen manually
                </Typography>
              </Box>

              {/* Requested by Client */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Checkbox
                  checked={requestedByClient}
                  onChange={(e) => setRequestedByClient(e.target.checked)}
                  icon={<i className="ri-heart-line" style={{ fontSize: '1.5rem' }} />}
                  checkedIcon={<i className="ri-heart-fill" style={{ fontSize: '1.5rem', color: '#f44336' }} />}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    Requested by client
                  </Typography>
                  <IconButton size="small">
                    <i className="ri-question-line" />
                  </IconButton>
                </Box>
              </Box>

              {/* Add Another Service */}
              <Button
                variant="text"
                startIcon={<i className="ri-add-line" />}
                sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
              >
                ADD ANOTHER SERVICE
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Client Information */}
              <TextField
                fullWidth
                label="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
              <TextField
                fullWidth
                label="Phone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />

              {/* Notes */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the appointment..."
              />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                ${servicePrice.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                To be paid
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                ${servicePrice.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleClose}
              sx={{ textTransform: 'none' }}
            >
              Discard
            </Button>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSave}
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              Save
            </Button>
          </Box>

          {/* Validation Error */}
          {validationError && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: theme => (theme.palette.mode === 'dark' ? 'error.dark' : 'error.light'),
                borderRadius: 1,
                border: theme => `1px solid ${theme.palette.error.main}`
              }}
            >
              <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-error-warning-line" />
                {validationError}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Client Picker Dialog */}
      <ClientPickerDialog
        open={isClientPickerOpen}
        onClose={() => setIsClientPickerOpen(false)}
        onSelect={handleClientSelect}
        selectedClientId={selectedClient?.id}
      />
    </Drawer>
  )
}
