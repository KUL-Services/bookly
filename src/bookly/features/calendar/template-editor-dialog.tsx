'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format } from 'date-fns'
import type { DayOfWeek, WeeklySlotPattern, ScheduleTemplate } from './types'

interface TemplateEditorDialogProps {
  open: boolean
  onClose: () => void
  onSave: (template: Omit<ScheduleTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  initialTemplate?: ScheduleTemplate
  businessId: string
  branchId: string
}

export default function TemplateEditorDialog({
  open,
  onClose,
  onSave,
  initialTemplate,
  businessId,
  branchId
}: TemplateEditorDialogProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Form state
  const [templateName, setTemplateName] = useState(initialTemplate?.name || '')
  const [activeFrom, setActiveFrom] = useState<string>(
    initialTemplate?.activeFrom ? format(new Date(initialTemplate.activeFrom), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  )
  const [activeUntil, setActiveUntil] = useState<string>(
    initialTemplate?.activeUntil ? format(new Date(initialTemplate.activeUntil), 'yyyy-MM-dd') : ''
  )
  const [isOngoing, setIsOngoing] = useState(initialTemplate?.activeUntil === null)
  const [weeklyPattern, setWeeklyPattern] = useState<WeeklySlotPattern[]>(
    initialTemplate?.weeklyPattern || []
  )
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Mon')

  // Slot editor state
  const [editingSlot, setEditingSlot] = useState<WeeklySlotPattern | null>(null)
  const [slotStartTime, setSlotStartTime] = useState('09:00')
  const [slotEndTime, setSlotEndTime] = useState('10:00')
  const [slotService, setSlotService] = useState('')
  const [slotRoom, setSlotRoom] = useState('')
  const [slotCapacity, setSlotCapacity] = useState(10)
  const [slotPrice, setSlotPrice] = useState(25)

  const daysOfWeek: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const handleSave = () => {
    if (!templateName || !activeFrom) {
      alert('Please fill in template name and start date')
      return
    }

    const template: Omit<ScheduleTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: templateName,
      businessId,
      branchId,
      activeFrom: new Date(activeFrom),
      activeUntil: isOngoing || !activeUntil ? null : new Date(activeUntil),
      isActive: true,
      weeklyPattern
    }

    onSave(template)
    handleClose()
  }

  const handleClose = () => {
    // Reset form
    setTemplateName('')
    setActiveFrom(format(new Date(), 'yyyy-MM-dd'))
    setActiveUntil('')
    setIsOngoing(true)
    setWeeklyPattern([])
    setSelectedDay('Mon')
    onClose()
  }

  const handleAddSlot = () => {
    if (!slotService || !slotRoom) {
      alert('Please select service and room')
      return
    }

    const newSlot: WeeklySlotPattern = {
      id: editingSlot?.id || `pattern-${selectedDay.toLowerCase()}-${Date.now()}`,
      dayOfWeek: selectedDay,
      startTime: slotStartTime,
      endTime: slotEndTime,
      serviceId: slotService,
      serviceName: slotService, // In real app, look up service name
      roomId: slotRoom,
      capacity: slotCapacity,
      price: slotPrice
    }

    if (editingSlot) {
      // Update existing slot
      setWeeklyPattern(prev => prev.map(s => s.id === editingSlot.id ? newSlot : s))
      setEditingSlot(null)
    } else {
      // Add new slot
      setWeeklyPattern(prev => [...prev, newSlot])
    }

    // Reset form
    setSlotStartTime('09:00')
    setSlotEndTime('10:00')
    setSlotService('')
    setSlotRoom('')
    setSlotCapacity(10)
    setSlotPrice(25)
  }

  const handleEditSlot = (slot: WeeklySlotPattern) => {
    setEditingSlot(slot)
    setSelectedDay(slot.dayOfWeek)
    setSlotStartTime(slot.startTime)
    setSlotEndTime(slot.endTime)
    setSlotService(slot.serviceId)
    setSlotRoom(slot.roomId)
    setSlotCapacity(slot.capacity)
    setSlotPrice(slot.price)
  }

  const handleDeleteSlot = (slotId: string) => {
    setWeeklyPattern(prev => prev.filter(s => s.id !== slotId))
  }

  const getSlotsForDay = (day: DayOfWeek) => {
    return weeklyPattern
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {initialTemplate ? 'Edit Template' : 'Create Schedule Template'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Define a weekly recurring schedule pattern
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          {/* Template Info */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Template Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                fullWidth
                required
                placeholder="e.g., Winter 2025 Fitness Schedule"
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: isOngoing ? '1fr' : '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Active From"
                  type="date"
                  value={activeFrom}
                  onChange={(e) => setActiveFrom(e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />

                {!isOngoing && (
                  <TextField
                    label="Active Until"
                    type="date"
                    value={activeUntil}
                    onChange={(e) => setActiveUntil(e.target.value)}
                    inputProps={{ min: activeFrom }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  variant={isOngoing ? 'contained' : 'outlined'}
                  onClick={() => setIsOngoing(true)}
                >
                  Ongoing
                </Button>
                <Button
                  size="small"
                  variant={!isOngoing ? 'contained' : 'outlined'}
                  onClick={() => setIsOngoing(false)}
                >
                  Set End Date
                </Button>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Weekly Pattern Editor */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Weekly Pattern ({weeklyPattern.length} slots)
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Add recurring time slots for each day of the week. These will automatically generate bookable slots.
            </Alert>

            {/* Day Tabs */}
            <Tabs
              value={selectedDay}
              onChange={(_, newDay) => setSelectedDay(newDay)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              {daysOfWeek.map(day => (
                <Tab
                  key={day}
                  label={day}
                  value={day}
                  icon={
                    <Chip
                      label={getSlotsForDay(day).length}
                      size="small"
                      color={getSlotsForDay(day).length > 0 ? 'primary' : 'default'}
                      sx={{ height: 18, fontSize: '0.65rem', minWidth: 24 }}
                    />
                  }
                  iconPosition="end"
                />
              ))}
            </Tabs>

            {/* Slots for selected day */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Slots for {selectedDay}
              </Typography>

              {getSlotsForDay(selectedDay).length === 0 ? (
                <Box
                  sx={{
                    p: 3,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    textAlign: 'center',
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No slots for this day. Add one below.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {getSlotsForDay(selectedDay).map(slot => (
                    <Box
                      key={slot.id}
                      sx={{
                        p: 1.5,
                        border: 1,
                        borderColor: editingSlot?.id === slot.id ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        bgcolor: editingSlot?.id === slot.id
                          ? (isDark ? 'rgba(10, 44, 36, 0.08)' : 'rgba(10, 44, 36, 0.08)')
                          : 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {slot.startTime} - {slot.endTime}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {slot.serviceName} • Room {slot.roomId} • {slot.capacity} capacity • ${slot.price}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleEditSlot(slot)}>
                          <i className="ri-edit-line" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteSlot(slot.id)} color="error">
                          <i className="ri-delete-bin-line" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Add/Edit Slot Form */}
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'primary.main',
                borderRadius: 1,
                bgcolor: isDark ? 'rgba(10, 44, 36, 0.05)' : 'rgba(10, 44, 36, 0.05)'
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                {editingSlot ? 'Edit Slot' : 'Add Slot'} for {selectedDay}
              </Typography>

              <Stack spacing={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={slotService}
                    onChange={(e) => setSlotService(e.target.value)}
                    label="Service"
                  >
                    <MenuItem value="Morning Yoga Class">Morning Yoga Class</MenuItem>
                    <MenuItem value="HIIT Training">HIIT Training</MenuItem>
                    <MenuItem value="Spin Class">Spin Class</MenuItem>
                    <MenuItem value="Pilates">Pilates</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Room</InputLabel>
                  <Select
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    label="Room"
                  >
                    <MenuItem value="room-1-1-1">Yoga Studio A</MenuItem>
                    <MenuItem value="room-1-1-2">Fitness Studio B</MenuItem>
                    <MenuItem value="room-1-1-3">Spin Room C</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Capacity"
                    type="number"
                    value={slotCapacity}
                    onChange={(e) => setSlotCapacity(parseInt(e.target.value))}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    label="Price ($)"
                    type="number"
                    value={slotPrice}
                    onChange={(e) => setSlotPrice(parseFloat(e.target.value))}
                    fullWidth
                    inputProps={{ min: 0, step: 5 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {editingSlot && (
                    <Button
                      onClick={() => {
                        setEditingSlot(null)
                        setSlotStartTime('09:00')
                        setSlotEndTime('10:00')
                        setSlotService('')
                        setSlotRoom('')
                        setSlotCapacity(10)
                        setSlotPrice(25)
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <Button variant="contained" onClick={handleAddSlot}>
                    {editingSlot ? 'Update Slot' : 'Add Slot'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!templateName || !activeFrom}>
          {initialTemplate ? 'Update Template' : 'Create Template'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
