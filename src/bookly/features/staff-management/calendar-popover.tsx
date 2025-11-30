'use client'

import { Box, Typography, Popover, Divider } from '@mui/material'
import { Calendar } from '@/bookly/components/ui/calendar'

interface CalendarPopoverProps {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  selectedDate: Date
  onDateSelect: (date: Date | undefined) => void
  onJumpWeek: (weeks: number) => void
}

export function CalendarPopover({
  open,
  anchorEl,
  onClose,
  selectedDate,
  onDateSelect,
  onJumpWeek
}: CalendarPopoverProps) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    >
      <Box sx={{ p: 3, minWidth: 320 }}>
        {/* Calendar with custom theme-aware styling */}
        <Box
          sx={{
            mb: 3,
            '& .rdp': {
              '--rdp-cell-size': '40px',
              margin: 0
            },
            '& .rdp-months': {
              justifyContent: 'center'
            },
            '& .rdp-month': {
              margin: 0
            },
            '& .rdp-caption': {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1rem',
              padding: 0
            },
            '& .rdp-caption_label': {
              fontSize: '1rem',
              fontWeight: 600,
              color: theme => theme.palette.text.primary
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
          <Calendar mode='single' selected={selectedDate} onSelect={onDateSelect} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Jump By Week */}
        <Box>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
            Jump By Week
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6].map((week, index) => (
              <Box key={`plus-${week}`} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant='body2'
                  onClick={() => onJumpWeek(week)}
                  sx={{
                    cursor: 'pointer',
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: theme =>
                        theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                      color: 'primary.main'
                    }
                  }}
                >
                  +{week}
                </Typography>
                {index < 5 && (
                  <Typography variant='body2' color='text.disabled' sx={{ mx: 0.5 }}>
                    |
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            {[-1, -2, -3, -4, -5, -6].map((week, index) => (
              <Box key={`minus-${week}`} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant='body2'
                  onClick={() => onJumpWeek(week)}
                  sx={{
                    cursor: 'pointer',
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: theme =>
                        theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                      color: 'primary.main'
                    }
                  }}
                >
                  {week}
                </Typography>
                {index < 5 && (
                  <Typography variant='body2' color='text.disabled' sx={{ mx: 0.5 }}>
                    |
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Popover>
  )
}
