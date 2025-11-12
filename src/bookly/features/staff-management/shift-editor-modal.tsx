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
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  List,
  ListItem
} from '@mui/material'
import type { BreakRange } from '../calendar/types'

interface ShiftEditorModalProps {
  open: boolean
  onClose: () => void
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export function ShiftEditorModal({ open, onClose }: ShiftEditorModalProps) {
  const [isWorking, setIsWorking] = useState(true)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [breaks, setBreaks] = useState<BreakRange[]>([])

  const handleAddBreak = () => {
    setBreaks([
      ...breaks,
      {
        id: crypto.randomUUID(),
        start: '12:00',
        end: '13:00'
      }
    ])
  }

  const handleRemoveBreak = (id: string) => {
    setBreaks(breaks.filter(b => b.id !== id))
  }

  const handleUpdateBreak = (id: string, field: 'start' | 'end', value: string) => {
    setBreaks(breaks.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ))
  }

  const handleSave = () => {
    // Save logic here
    onClose()
  }

  const handleCancel = () => {
    // Reset form
    setIsWorking(true)
    setStartTime('09:00')
    setEndTime('17:00')
    setBreaks([])
    onClose()
  }

  const duration = isWorking ? calculateDuration(startTime, endTime) : '0h 0m'

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight={600}>
          Edit Shift
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Adjust working hours and breaks
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Working Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isWorking}
                onChange={(e) => setIsWorking(e.target.checked)}
                color="primary"
              />
            }
            label={<Typography fontWeight={500}>Working this day</Typography>}
          />

          {isWorking && (
            <>
              {/* Start/End Times */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  type="time"
                  label="Start Time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }} // 15 min increments
                  fullWidth
                />
                <Typography color="text.secondary">—</Typography>
                <TextField
                  type="time"
                  label="End Time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }} // 15 min increments
                  fullWidth
                />
              </Box>

              {/* Duration Display */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'primary.50',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  Total Duration
                </Typography>
                <Chip label={duration} color="primary" />
              </Box>

              {/* Breaks */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Breaks
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<i className="ri-add-line" />}
                    onClick={handleAddBreak}
                  >
                    Add Break
                  </Button>
                </Box>

                {breaks.length === 0 ? (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      color: 'text.secondary'
                    }}
                  >
                    <i className="ri-cup-line" style={{ fontSize: 32, opacity: 0.3 }} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      No breaks added
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {breaks.map((breakRange, index) => (
                      <ListItem
                        key={breakRange.id}
                        sx={{
                          p: 2,
                          mb: 1,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                          <i className="ri-cup-line" style={{ fontSize: 20, opacity: 0.5 }} />
                          <TextField
                            type="time"
                            label="Start"
                            value={breakRange.start}
                            onChange={(e) => handleUpdateBreak(breakRange.id, 'start', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ width: 120 }}
                          />
                          <Typography variant="body2" color="text.secondary">—</Typography>
                          <TextField
                            type="time"
                            label="End"
                            value={breakRange.end}
                            onChange={(e) => handleUpdateBreak(breakRange.id, 'end', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ width: 120 }}
                          />
                          <Chip
                            size="small"
                            label={calculateDuration(breakRange.start, breakRange.end)}
                            variant="outlined"
                          />
                          <Box sx={{ flexGrow: 1 }} />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveBreak(breakRange.id)}
                          >
                            <i className="ri-delete-bin-line" />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
