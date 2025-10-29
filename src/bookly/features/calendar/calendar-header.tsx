'use client'

import { IconButton, Button, Typography, Box, Select, MenuItem, useTheme, useMediaQuery } from '@mui/material'
import { useCalendarStore } from './state'
import { getViewTitle } from './utils'
import type { CalendarView } from './types'

interface CalendarHeaderProps {
  currentDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNewBooking: () => void
}

export default function CalendarHeader({ currentDate, onPrev, onNext, onToday, onNewBooking }: CalendarHeaderProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const view = useCalendarStore(state => state.view)
  const setView = useCalendarStore(state => state.setView)
  const toggleSidebar = useCalendarStore(state => state.toggleSidebar)
  const toggleSettings = useCalendarStore(state => state.toggleSettings)
  const toggleNotifications = useCalendarStore(state => state.toggleNotifications)

  const viewOptions: { value: CalendarView; label: string }[] = [
    { value: 'timeGridDay', label: 'Day' },
    { value: 'timeGridWeek', label: 'Week' },
    { value: 'dayGridMonth', label: 'Month' },
    { value: 'listMonth', label: 'Appointment List' }
  ]

  const title = getViewTitle(view, currentDate)

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: { xs: 1.5, sm: 2, md: 3 },
      py: { xs: 1.5, md: 2 },
      borderBottom: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
      gap: { xs: 1, md: 2 },
      flexWrap: 'nowrap'
    }}>
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 2 }, flex: 1, minWidth: 0 }}>
        {/* View Selector */}
        <Select
          value={view}
          onChange={e => setView(e.target.value as CalendarView)}
          size="small"
          sx={{
            minWidth: { xs: 80, sm: 120, md: 150 },
            fontSize: { xs: '0.75rem', md: '0.875rem' }
          }}
        >
          {viewOptions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton onClick={onPrev} size="small">
            <i className="ri-arrow-left-s-line" />
          </IconButton>
          <Button
            onClick={onToday}
            variant="outlined"
            size="small"
            sx={{
              minWidth: { xs: 50, sm: 60, md: 80 },
              px: { xs: 0.5, sm: 1, md: 2 },
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
            }}
          >
            {isMobile ? 'Now' : 'Today'}
          </Button>
          <IconButton onClick={onNext} size="small">
            <i className="ri-arrow-right-s-line" />
          </IconButton>
        </Box>

        {/* Title - Hidden on small screens */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            display: { xs: 'none', lg: 'block' },
            fontSize: { lg: '1.25rem', xl: '1.5rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexShrink: 0 }}>
        <Button
          variant="contained"
          startIcon={!isMobile && <i className="ri-add-line" />}
          onClick={onNewBooking}
          size="small"
          sx={{
            minWidth: { xs: 36, sm: 'auto' },
            px: { xs: 1, sm: 2 },
            fontSize: { xs: '0.75rem', md: '0.875rem' }
          }}
        >
          {isMobile ? <i className="ri-add-line" /> : 'New Booking'}
        </Button>

        {isMobile && (
          <IconButton onClick={toggleSidebar} size="small">
            <i className="ri-filter-line" />
          </IconButton>
        )}

        {!isMobile && (
          <>
            <IconButton onClick={toggleSettings} size="small">
              <i className="ri-settings-3-line" />
            </IconButton>

            <IconButton onClick={toggleNotifications} size="small">
              <i className="ri-notification-3-line" />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  )
}
