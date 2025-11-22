'use client'

import { FormControl, InputLabel, Select, MenuItem, SelectProps } from '@mui/material'

interface TimeSelectFieldProps {
  label?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  size?: SelectProps['size']
  sx?: SelectProps['sx']
  fullWidth?: boolean
}

// Generate time options in 15-minute increments
function generateTimeOptions(): string[] {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      times.push(`${h}:${m}`)
    }
  }
  return times
}

// Format time from 24h to 12h format for display
function formatTime12h(time24: string): string {
  const [hourStr, minStr] = time24.split(':')
  let hour = parseInt(hourStr)
  const minute = minStr
  const period = hour >= 12 ? 'PM' : 'AM'

  if (hour === 0) hour = 12
  else if (hour > 12) hour -= 12

  return `${hour}:${minute} ${period}`
}

const TIME_OPTIONS = generateTimeOptions()

export function TimeSelectField({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  size = 'small',
  sx,
  fullWidth = false
}: TimeSelectFieldProps) {
  return (
    <FormControl size={size} disabled={disabled} required={required} fullWidth={fullWidth} sx={sx}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
        displayEmpty={!label}
      >
        {TIME_OPTIONS.map((time) => (
          <MenuItem key={time} value={time}>
            {formatTime12h(time)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
