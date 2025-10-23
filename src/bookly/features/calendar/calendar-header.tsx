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
      px: 3,
      py: 2,
      borderBottom: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
      gap: 2,
      flexWrap: 'wrap'
    }}>
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        {/* View Selector */}
        <Select
          value={view}
          onChange={e => setView(e.target.value as CalendarView)}
          size="small"
          sx={{ minWidth: 150 }}
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
          <Button onClick={onToday} variant="outlined" size="small" sx={{ minWidth: 80 }}>
            Today
          </Button>
          <IconButton onClick={onNext} size="small">
            <i className="ri-arrow-right-s-line" />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 600, display: { xs: 'none', md: 'block' } }}>
          {title}
        </Typography>
      </Box>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<i className="ri-add-line" />}
          onClick={onNewBooking}
          size={isMobile ? 'small' : 'medium'}
        >
          {isMobile ? 'New' : 'New Booking'}
        </Button>

        {isMobile && (
          <IconButton onClick={toggleSidebar} size="small">
            <i className="ri-filter-line" />
          </IconButton>
        )}

        <IconButton onClick={toggleSettings} size="small">
          <i className="ri-settings-3-line" />
        </IconButton>

        <IconButton onClick={toggleNotifications} size="small">
          <i className="ri-notification-3-line" />
        </IconButton>
      </Box>
    </Box>
  )
}
