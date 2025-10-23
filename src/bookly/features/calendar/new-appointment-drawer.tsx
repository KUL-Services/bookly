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

  // Form state
  const [date, setDate] = useState(initialDate || new Date())
  const [startTime, setStartTime] = useState('11:15')
  const [endTime, setEndTime] = useState('11:30')
  const [staffId, setStaffId] = useState(initialStaffId || '')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [service, setService] = useState('')
  const [notes, setNotes] = useState('')
  const [requestedByClient, setRequestedByClient] = useState(false)
  const [staffManuallyChosen, setStaffManuallyChosen] = useState(!!initialStaffId)

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

  const handleSave = () => {
    const appointment = {
      date,
      startTime,
      endTime,
      staffId,
      clientName,
      clientEmail,
      clientPhone,
      service,
      notes,
      requestedByClient,
      staffManuallyChosen
    }
    onSave?.(appointment)
    handleClose()
  }

  const handleClose = () => {
    // Reset form
    setActiveTab(0)
    setClientName('')
    setClientEmail('')
    setClientPhone('')
    setService('')
    setNotes('')
    setRequestedByClient(false)
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
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'grey.200' }}>
              <i className="ri-user-line" style={{ fontSize: '2rem', color: '#999' }} />
            </Avatar>
            <Typography variant="body1" sx={{ flex: 1, color: 'text.secondary' }}>
              Select a client or leave empty for walk-in
            </Typography>
            <IconButton>
              <i className="ri-add-line" />
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
                  onChange={(e) => setService(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <i className="ri-arrow-right-s-line" />
                      </InputAdornment>
                    )
                  }}
                >
                  <MenuItem value="">Select service</MenuItem>
                  <MenuItem value="haircut">Haircut & Style</MenuItem>
                  <MenuItem value="manicure">Manicure</MenuItem>
                  <MenuItem value="massage">Massage</MenuItem>
                  <MenuItem value="color">Hair Color</MenuItem>
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
              {staffId && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'warning.light',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <i className="ri-information-line" />
                  <Typography variant="body2">
                    Not working on selected date
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
                $0.00
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                To be paid
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                $0.00
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
              sx={{ textTransform: 'none', bgcolor: 'grey.400', '&:hover': { bgcolor: 'grey.500' } }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}
