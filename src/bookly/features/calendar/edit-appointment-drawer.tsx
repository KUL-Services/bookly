'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Avatar,
  Divider,
  Chip,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem as MuiMenuItem
} from '@mui/material'
import { useCalendarStore } from './state'
import type { CalendarEvent, AppointmentStatus } from './types'
import { mockStaff } from '@/bookly/data/mock-data'

interface EditAppointmentDrawerProps {
  open: boolean
  event: CalendarEvent | null
  onClose: () => void
}

export default function EditAppointmentDrawer({ open, event, onClose }: EditAppointmentDrawerProps) {
  const updateEvent = useCalendarStore(state => state.updateEvent)

  // Local state for form
  const [activeTab, setActiveTab] = useState(0)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [staffId, setStaffId] = useState('')
  const [staffName, setStaffName] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('confirmed')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [requestedByClient, setRequestedByClient] = useState(false)
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null)

  // Update local state when event changes
  useEffect(() => {
    if (event && event.extendedProps) {
      const start = new Date(event.start)
      const end = new Date(event.end)

      setStartTime(start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setStaffId(event.extendedProps.staffId)
      setStaffName(event.extendedProps.staffName)
      setStatus(event.extendedProps.status)
      setCustomerName(event.extendedProps.customerName || '')
      setNotes(event.extendedProps.notes || '')
      setRequestedByClient(event.extendedProps.selectionMethod === 'by_client')

      // Try to extract email/phone if they exist (they might not be in old mock data)
      setCustomerEmail('')
      setCustomerPhone('')
    }
  }, [event, open])

  if (!event || !event.extendedProps) return null

  const { extendedProps } = event

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimeRange = (start: Date, end: Date) => {
    const startStr = new Date(start).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    const endStr = new Date(end).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    return `${startStr} - ${endStr}`
  }

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return endMinutes - startMinutes
  }

  const getStatusColor = (status: AppointmentStatus) => {
    const colors = {
      confirmed: 'success',
      pending: 'warning',
      completed: 'default',
      cancelled: 'error',
      need_confirm: 'info',
      no_show: 'error'
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      confirmed: 'CONFIRMED',
      pending: 'PENDING',
      completed: 'COMPLETED',
      cancelled: 'CANCELLED',
      need_confirm: 'NEED CONFIRM',
      no_show: 'NO SHOW'
    }
    return labels[status] || status.toUpperCase()
  }

  const handleSave = () => {
    if (!event) return

    // Parse times and create new Date objects
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const originalDate = new Date(event.start)
    const newStart = new Date(originalDate)
    newStart.setHours(startHour, startMin, 0, 0)

    const newEnd = new Date(originalDate)
    newEnd.setHours(endHour, endMin, 0, 0)

    // Create updated event
    const updatedEvent: CalendarEvent = {
      ...event,
      start: newStart,
      end: newEnd,
      title: customerName || event.title,
      extendedProps: {
        ...extendedProps,
        staffId,
        staffName,
        status,
        customerName,
        notes,
        selectionMethod: requestedByClient ? 'by_client' : extendedProps.selectionMethod
      }
    }

    updateEvent(updatedEvent)
    onClose()
  }

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    setStatus(newStatus)
    setStatusMenuAnchor(null)
  }

  const handleStaffChange = (newStaffId: string) => {
    setStaffId(newStaffId)
    const staff = mockStaff.find(s => s.id === newStaffId)
    if (staff) {
      setStaffName(staff.name)
    }
  }

  // Generate time slots from 6:00 AM to 11:00 PM in 15-minute intervals
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        slots.push(timeStr)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()
  const duration = calculateDuration()

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with Status */}
        <Box sx={{ bgcolor: getStatusColor(status) + '.main', color: 'white', p: 2 }}>
          <Box className="flex items-center justify-between mb-2">
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <i className="ri-close-line" />
            </IconButton>
            <Typography variant="h6" className="font-semibold">
              {getStatusLabel(status)}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
              endIcon={<i className="ri-arrow-down-s-line" />}
            >
              CHANGE
            </Button>
          </Box>
          <Typography variant="caption" className="opacity-90">
            Business Booking ID: {extendedProps.bookingId}
          </Typography>
        </Box>

        {/* Status Change Menu */}
        <Menu
          anchorEl={statusMenuAnchor}
          open={Boolean(statusMenuAnchor)}
          onClose={() => setStatusMenuAnchor(null)}
        >
          {['confirmed', 'pending', 'need_confirm', 'completed', 'no_show', 'cancelled'].map((s) => (
            <MuiMenuItem
              key={s}
              onClick={() => handleStatusChange(s as AppointmentStatus)}
              selected={s === status}
            >
              {getStatusLabel(s as AppointmentStatus)}
            </MuiMenuItem>
          ))}
        </Menu>

        {/* Client Info */}
        <Box sx={{ bgcolor: 'background.paper', p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box className="flex items-center gap-3">
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'grey.300' }}>
              <Typography variant="h6" sx={{ color: 'grey.700' }}>
                {customerName?.split(' ').map(n => n[0]).join('') || 'W'}
              </Typography>
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="font-semibold">
                {customerName || 'Walk-in'}
              </Typography>
              {customerPhone && (
                <Typography variant="body2" color="text.secondary">
                  {customerPhone}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="APPOINTMENT" />
            <Tab label="NOTES & INFO" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box className="flex-1 overflow-auto p-4">
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Date Display */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {formatDate(event.start)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Original time: {formatTimeRange(event.start, event.end)}
                </Typography>
              </Box>

              <Divider />

              {/* Service Display */}
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderLeft: 4,
                  borderLeftColor: 'success.main',
                  p: 2,
                  borderRadius: 1
                }}
              >
                <Typography variant="h6" className="font-semibold">
                  {extendedProps.serviceName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {duration} min
                </Typography>
                <Typography variant="h6" className="font-semibold" sx={{ mt: 1 }}>
                  ${extendedProps.price}
                </Typography>
              </Box>

              {/* Time Selection */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  select
                  label="START"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  size="small"
                  SelectProps={{
                    native: true
                  }}
                >
                  {timeSlots.map(slot => (
                    <option key={`start-${slot}`} value={slot}>
                      {slot}
                    </option>
                  ))}
                </TextField>
                <TextField
                  select
                  label="END"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  size="small"
                  SelectProps={{
                    native: true
                  }}
                >
                  {timeSlots.map(slot => (
                    <option key={`end-${slot}`} value={slot}>
                      {slot}
                    </option>
                  ))}
                </TextField>
              </Box>

              {/* Staff Selection */}
              <TextField
                select
                fullWidth
                label="STAFF"
                value={staffId}
                onChange={(e) => handleStaffChange(e.target.value)}
                SelectProps={{
                  native: true
                }}
              >
                {mockStaff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </TextField>

              <Box className="flex items-center gap-2">
                <i className="ri-user-line" />
                <Typography variant="body2">Staff Member chosen manually</Typography>
              </Box>

              {/* Requested by client */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={requestedByClient}
                    onChange={(e) => setRequestedByClient(e.target.checked)}
                    icon={<i className="ri-heart-line" style={{ fontSize: '1.5rem' }} />}
                    checkedIcon={<i className="ri-heart-fill" style={{ fontSize: '1.5rem', color: '#f44336' }} />}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Requested by client</Typography>
                  </Box>
                }
              />
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Client Information */}
              <TextField
                fullWidth
                label="Client Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter client name"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="client@example.com"
              />
              <TextField
                fullWidth
                label="Phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />

              {/* Notes */}
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the appointment..."
              />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box className="flex items-center justify-between p-4">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h4" className="font-bold">
                ${extendedProps.price}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="h6" className="font-bold">
                {duration} min
              </Typography>
            </Box>
          </Box>
          <Box className="grid grid-cols-2 gap-2 p-3">
            <Button variant="outlined" size="large" fullWidth onClick={onClose}>
              CANCEL
            </Button>
            <Button variant="contained" size="large" fullWidth onClick={handleSave} color="primary">
              SAVE CHANGES
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}
