'use client'

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'
import { useCalendarStore } from './state'
import type { CalendarView, DisplayMode, ColorScheme } from './types'

interface CalendarSettingsProps {
  open: boolean
  onClose: () => void
}

export default function CalendarSettings({ open, onClose }: CalendarSettingsProps) {
  const view = useCalendarStore(state => state.view)
  const displayMode = useCalendarStore(state => state.displayMode)
  const colorScheme = useCalendarStore(state => state.colorScheme)
  const setView = useCalendarStore(state => state.setView)
  const setDisplayMode = useCalendarStore(state => state.setDisplayMode)
  const setColorScheme = useCalendarStore(state => state.setColorScheme)

  const viewOptions: { value: CalendarView; label: string }[] = [
    { value: 'timeGridDay', label: 'Day' },
    { value: 'timeGridWeek', label: 'Week' },
    { value: 'dayGridMonth', label: 'Month' },
    { value: 'listMonth', label: 'Appointment List' }
  ]

  const displayModeOptions: { value: DisplayMode; label: string }[] = [
    { value: 'full', label: 'Full size' },
    { value: 'fit', label: 'Fit to page' }
  ]

  const colorSchemeOptions: { value: ColorScheme; label: string }[] = [
    { value: 'pastel', label: 'Pastel' },
    { value: 'vivid', label: 'Vivid' }
  ]

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 360 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box className="flex items-center justify-between p-4 border-b border-divider">
          <Typography variant="h6" className="font-semibold">
            Calendar Settings
          </Typography>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line text-xl" />
          </IconButton>
        </Box>

        {/* Content */}
        <Box className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Default View */}
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" className="mb-3 font-semibold text-textPrimary">
                Default view
              </FormLabel>
              <RadioGroup value={view} onChange={e => setView(e.target.value as CalendarView)}>
                {viewOptions.map(option => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                    className="mb-1"
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* Display Mode */}
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" className="mb-3 font-semibold text-textPrimary">
                Display mode
              </FormLabel>
              <RadioGroup value={displayMode} onChange={e => setDisplayMode(e.target.value as DisplayMode)}>
                {displayModeOptions.map(option => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                    className="mb-1"
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* Color Scheme */}
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" className="mb-3 font-semibold text-textPrimary">
                Color scheme
              </FormLabel>
              <RadioGroup value={colorScheme} onChange={e => setColorScheme(e.target.value as ColorScheme)}>
                {colorSchemeOptions.map(option => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                    className="mb-1"
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* Color Preview */}
            <Box className="mt-4 p-4 rounded-lg bg-actionHover">
              <Typography variant="caption" className="text-textSecondary mb-2 block">
                Preview
              </Typography>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { status: 'confirmed', label: 'Confirmed' },
                  { status: 'pending', label: 'Pending' },
                  { status: 'completed', label: 'Completed' },
                  { status: 'cancelled', label: 'Cancelled' }
                ].map(({ status, label }) => {
                  const colors =
                    colorScheme === 'vivid'
                      ? {
                          confirmed: '#3b82f6',
                          pending: '#f59e0b',
                          completed: '#9ca3af',
                          cancelled: '#ef4444'
                        }
                      : {
                          confirmed: '#93c5fd',
                          pending: '#fcd34d',
                          completed: '#d1d5db',
                          cancelled: '#fca5a5'
                        }

                  return (
                    <div
                      key={status}
                      className="px-3 py-2 rounded text-xs font-medium text-center"
                      style={{
                        backgroundColor: colors[status as keyof typeof colors],
                        color: colorScheme === 'vivid' ? '#ffffff' : '#000000'
                      }}
                    >
                      {label}
                    </div>
                  )
                })}
              </div>
            </Box>
          </div>
        </Box>
      </Box>
    </Drawer>
  )
}
