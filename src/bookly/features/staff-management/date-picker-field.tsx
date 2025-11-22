'use client'

import { useState } from 'react'
import { Box, TextField, Popover, TextFieldProps } from '@mui/material'
import { Calendar } from '@/bookly/components/ui/calendar'
import { format } from 'date-fns'

interface DatePickerFieldProps {
  label?: string
  value: Date | string
  onChange: (date: Date) => void
  required?: boolean
  disabled?: boolean
  size?: TextFieldProps['size']
  sx?: TextFieldProps['sx']
  fullWidth?: boolean
}

export function DatePickerField({
  label = 'Date',
  value,
  onChange,
  required = false,
  disabled = false,
  size = 'medium',
  sx,
  fullWidth = false
}: DatePickerFieldProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  // Convert value to Date if it's a string
  const dateValue = typeof value === 'string' ? new Date(value) : value

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date)
      handleClose()
    }
  }

  // Format the display value
  const displayValue = dateValue ? format(dateValue, 'MMM dd, yyyy') : ''

  return (
    <>
      <TextField
        label={label}
        value={displayValue}
        onClick={handleOpen}
        required={required}
        disabled={disabled}
        size={size}
        fullWidth={fullWidth}
        InputProps={{
          readOnly: true,
          endAdornment: <i className="ri-calendar-line" style={{ fontSize: 20, opacity: 0.5 }} />
        }}
        InputLabelProps={{ shrink: true }}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          '& .MuiInputBase-input': {
            cursor: disabled ? 'default' : 'pointer'
          },
          ...sx
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Box sx={{ p: 3, minWidth: 320 }}>
          <Box
            sx={{
              '& .rdp': {
                '--rdp-cell-size': '40px',
                '--rdp-accent-color': theme => theme.palette.primary.main,
                margin: 0
              },
              '& .rdp-months': {
                width: '100%'
              },
              '& .rdp-month': {
                width: '100%'
              },
              '& .rdp-caption': {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.5rem 0',
                marginBottom: '0.5rem'
              },
              '& .rdp-caption_label': {
                fontSize: '1rem',
                fontWeight: 600,
                color: theme => theme.palette.text.primary,
                padding: '0 1rem'
              },
              '& .rdp-nav': {
                display: 'flex',
                gap: '0.5rem'
              },
              '& .rdp-nav_button': {
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: 'none',
                color: theme => theme.palette.text.primary,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                  color: theme => (theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)')
                }
              },
              '& .rdp-head_cell': {
                fontWeight: 600,
                fontSize: '0.75rem',
                color: theme => theme.palette.text.secondary,
                padding: '0.5rem 0',
                textTransform: 'uppercase'
              },
              '& .rdp-cell': {
                padding: '2px'
              },
              '& .rdp-day': {
                width: '40px',
                height: '40px',
                fontSize: '0.9375rem',
                fontWeight: 500,
                borderRadius: '50%',
                backgroundColor: 'transparent',
                color: theme => theme.palette.text.primary,
                border: '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover:not(.rdp-day_selected):not(.rdp-day_disabled)': {
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                  borderColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.2)',
                  color: theme => (theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)')
                }
              },
              '& .rdp-day_today:not(.rdp-day_selected)': {
                fontWeight: 700,
                color: theme => (theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)'),
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                border: '1px solid',
                borderColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.2)'
              },
              '& .rdp-day_selected': {
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgb(20, 184, 166) !important' : 'rgb(20, 184, 166) !important',
                color: theme => (theme.palette.mode === 'dark' ? '#0f172a !important' : '#ffffff !important'),
                fontWeight: 700,
                border: 'none !important',
                '&:hover': {
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgb(13, 148, 136) !important' : 'rgb(13, 148, 136) !important'
                }
              },
              '& .rdp-day_outside': {
                color: theme => theme.palette.text.disabled,
                opacity: 0.3
              }
            }}
          >
            <Calendar mode="single" selected={dateValue} onSelect={handleDateSelect} />
          </Box>
        </Box>
      </Popover>
    </>
  )
}
