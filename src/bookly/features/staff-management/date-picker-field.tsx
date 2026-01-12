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
  minDate?: Date
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
  minDate,
  size = 'medium',
  sx,
  fullWidth = false,
  error,
  helperText
}: DatePickerFieldProps & { error?: boolean; helperText?: string }) {
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
        error={error}
        helperText={helperText}
        InputProps={{
          readOnly: true,
          endAdornment: <i className='ri-calendar-line' style={{ fontSize: 20, opacity: 0.5 }} />
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
                    theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.08)',
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
              '& .rdp-day_button': {
                width: '40px',
                height: '40px',
                fontSize: '0.9375rem',
                fontWeight: 500,
                borderRadius: '50%',
                backgroundColor: 'transparent',
                color: theme => theme.palette.text.primary,
                border: '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:not(:disabled):hover': {
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.08)',
                  borderColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.3)' : 'rgba(10, 44, 36, 0.2)',
                  color: theme => (theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)')
                }
              },
              '& [data-today="true"]:not([data-selected="true"]) .rdp-day_button': {
                fontWeight: 700,
                color: theme => theme.palette.text.primary,
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.2)',
                border: '2px solid',
                borderColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgba(156, 163, 175, 0.6)' : 'rgba(107, 114, 128, 0.5)',
                boxShadow: theme =>
                  theme.palette.mode === 'dark'
                    ? '0 0 0 2px rgba(156, 163, 175, 0.2)'
                    : '0 0 0 2px rgba(156, 163, 175, 0.15)'
              },
              '& [data-selected="true"] .rdp-day_button': {
                backgroundColor: theme => theme.palette.primary.main + ' !important',
                color: theme => theme.palette.primary.contrastText + ' !important',
                fontWeight: 700,
                border: '2px solid !important',
                borderColor: theme => theme.palette.primary.dark + ' !important',
                boxShadow: theme =>
                  theme.palette.mode === 'dark'
                    ? '0 0 0 3px rgba(10, 44, 36, 0.25) !important'
                    : '0 0 0 3px rgba(10, 44, 36, 0.2) !important',
                transform: 'scale(1.05) !important',
                zIndex: 10,
                '&:hover': {
                  backgroundColor: theme => theme.palette.primary.dark + ' !important',
                  transform: 'scale(1.08) !important'
                }
              },
              '& [data-outside="true"] .rdp-day_button': {
                color: theme => theme.palette.text.disabled,
                opacity: 0.3
              },
              '& [data-disabled="true"] .rdp-day_button': {
                color: theme => theme.palette.text.disabled,
                opacity: 0.4,
                cursor: 'not-allowed',
                pointerEvents: 'none',
                textDecoration: 'line-through'
              }
            }}
          >
            <Calendar
              mode='single'
              selected={dateValue}
              onSelect={handleDateSelect}
              disabled={minDate ? { before: minDate } : undefined}
            />
          </Box>
        </Box>
      </Popover>
    </>
  )
}
