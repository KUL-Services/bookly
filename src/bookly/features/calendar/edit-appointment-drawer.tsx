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
  Chip
} from '@mui/material'
import { useCalendarStore } from './state'
import type { CalendarEvent, AppointmentStatus } from './types'

interface EditAppointmentDrawerProps {
  open: boolean
  event: CalendarEvent | null
  onClose: () => void
}

export default function EditAppointmentDrawer({ open, event, onClose }: EditAppointmentDrawerProps) {
  const updateEvent = useCalendarStore(state => state.updateEvent)

  // Local state for form - must be declared before early return
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [staff, setStaff] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('confirmed')

  // Update local state when event changes
  useEffect(() => {
    if (event && event.extendedProps) {
      setStartTime(new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
      setEndTime(new Date(event.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
      setStaff(event.extendedProps.staffName)
      setStatus(event.extendedProps.status)
    }
  }, [event])

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
    return status.toUpperCase().replace('_', ' ')
  }

  const handleSave = () => {
    // Update event logic here
    onClose()
  }

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

        {/* Client Info */}
        <Box sx={{ bgcolor: 'background.paper', p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-3">
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'grey.300' }}>
                <Typography variant="h6" sx={{ color: 'grey.700' }}>
                  {extendedProps.customerName.split(' ').map(n => n[0]).join('')}
                </Typography>
              </Avatar>
              <Box>
                <Box className="flex items-center gap-2">
                  <Typography variant="h6" className="font-semibold">
                    {extendedProps.customerName}
                  </Typography>
                  <i className="ri-arrow-right-s-line" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  +20 12 81474122
                </Typography>
              </Box>
            </Box>
            <IconButton>
              <i className="ri-close-line" />
            </IconButton>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box className="flex">
            <Button
              sx={{
                flex: 1,
                borderRadius: 0,
                borderBottom: 2,
                borderColor: 'primary.main',
                color: 'text.primary',
                fontWeight: 600
              }}
            >
              APPOINTMENT
            </Button>
            <Button
              sx={{
                flex: 1,
                borderRadius: 0,
                color: 'text.secondary'
              }}
            >
              NOTES & INFO
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <Box className="flex-1 overflow-auto p-4">
          {/* Date/Time Selector */}
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{ justifyContent: 'space-between', p: 2, textTransform: 'none' }}
              endIcon={<i className="ri-arrow-down-s-line" />}
            >
              <Box>
                <Typography variant="h6">{formatDate(event.start)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatTimeRange(event.start, event.end)}
                </Typography>
              </Box>
            </Button>
          </Box>

          {/* Action Buttons */}
          <Box className="flex gap-2 mb-4">
            <Button
              variant="outlined"
              fullWidth
              startIcon={<i className="ri-group-line" />}
            >
              GROUP BOOKING
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<i className="ri-repeat-line" />}
            >
              RECURRING
            </Button>
          </Box>

          {/* Service */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderLeft: 4,
              borderLeftColor: 'success.main',
              p: 2,
              mb: 3,
              borderRadius: 1
            }}
          >
            <Box className="flex items-center justify-between">
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold">
                  {extendedProps.serviceName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  40min
                </Typography>
              </Box>
              <Box className="flex items-center gap-2">
                <Typography variant="h6" className="font-semibold">
                  ${extendedProps.price}
                </Typography>
                <i className="ri-arrow-right-s-line" />
              </Box>
            </Box>
          </Box>

          {/* Time Selection */}
          <Box className="grid grid-cols-2 gap-3 mb-3">
            <FormControl fullWidth>
              <InputLabel size="small">START</InputLabel>
              <Select
                value={startTime}
                label="START"
                onChange={e => setStartTime(e.target.value)}
                size="small"
              >
                <MenuItem value="10:00">10:00 AM</MenuItem>
                <MenuItem value="10:30">10:30 AM</MenuItem>
                <MenuItem value="11:00">11:00 AM</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel size="small">END</InputLabel>
              <Select
                value={endTime}
                label="END"
                onChange={e => setEndTime(e.target.value)}
                size="small"
              >
                <MenuItem value="11:00">11:00 AM</MenuItem>
                <MenuItem value="11:30">11:30 AM</MenuItem>
                <MenuItem value="12:00">12:00 PM</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Staff Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>STAFF</InputLabel>
            <Select
              value={staff}
              label="STAFF"
              onChange={e => setStaff(e.target.value)}
            >
              <MenuItem value="Kareem Gamal">Kareem Gamal</MenuItem>
              <MenuItem value="John Doe">John Doe</MenuItem>
            </Select>
          </FormControl>

          <Box className="flex items-center gap-2 mb-3">
            <i className="ri-user-line" />
            <Typography variant="body2">Staff Member chosen manually</Typography>
          </Box>

          {/* Requested by client */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3
            }}
          >
            <i className="ri-heart-line text-2xl" />
            <Typography variant="body1">Requested by client</Typography>
            <IconButton size="small">
              <i className="ri-question-line" />
            </IconButton>
          </Box>

          {/* Add Another Service */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<i className="ri-add-line" />}
            sx={{ mb: 4, textTransform: 'none' }}
          >
            ADD ANOTHER SERVICE
          </Button>
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
            <IconButton sx={{ bgcolor: 'background.default' }}>
              <i className="ri-chat-3-line" />
            </IconButton>
            <Box>
              <Typography variant="caption" color="text.secondary">
                To be paid
              </Typography>
              <Typography variant="h4" className="font-bold">
                ${extendedProps.price}
              </Typography>
            </Box>
          </Box>
          <Box className="grid grid-cols-2 gap-2 p-3">
            <Button variant="outlined" size="large" fullWidth>
              BOOK AGAIN
            </Button>
            <Button variant="contained" size="large" fullWidth onClick={handleSave}>
              CHECKOUT
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}
