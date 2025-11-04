'use client'

import { useState } from 'react'
import { IconButton, Button, Typography, Box, Select, MenuItem, useTheme, useMediaQuery, Menu, ListItemIcon, ListItemText } from '@mui/material'
import { format } from 'date-fns'
import { useCalendarStore } from './state'
import { getViewTitle } from './utils'
import { exportEventsToExcel, exportSummaryToExcel } from './export-utils'
import type { CalendarView, CalendarEvent } from './types'

interface CalendarHeaderProps {
  currentDate: Date
  dateRange?: { start: Date; end: Date }
  filteredEvents?: CalendarEvent[]
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNewBooking: () => void
}

export default function CalendarHeader({ currentDate, dateRange, filteredEvents = [], onPrev, onNext, onToday, onNewBooking }: CalendarHeaderProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const view = useCalendarStore(state => state.view)
  const setView = useCalendarStore(state => state.setView)
  const toggleSidebar = useCalendarStore(state => state.toggleSidebar)
  const toggleSettings = useCalendarStore(state => state.toggleSettings)
  const toggleNotifications = useCalendarStore(state => state.toggleNotifications)
  const toggleTemplateManagement = useCalendarStore(state => state.toggleTemplateManagement)
  const branchFilters = useCalendarStore(state => state.branchFilters)
  const staffFilters = useCalendarStore(state => state.staffFilters)
  const roomFilters = useCalendarStore(state => state.roomFilters)
  const rooms = useCalendarStore(state => state.rooms)
  const schedulingMode = useCalendarStore(state => state.schedulingMode)

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null)
  const exportMenuOpen = Boolean(exportAnchorEl)

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget)
  }

  const handleExportClose = () => {
    setExportAnchorEl(null)
  }

  const handleExportDetails = () => {
    const dateRangeStr = dateRange
      ? `${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}`
      : format(currentDate, 'MMM dd, yyyy')

    // Get filter details
    const branches = branchFilters.allBranches
      ? ['All Branches']
      : branchFilters.branchIds

    const staff = staffFilters.onlyMe
      ? ['Only Me']
      : staffFilters.staffIds.length > 0
      ? staffFilters.staffIds.map(id => {
          const event = filteredEvents.find(e => e.extendedProps.staffId === id)
          return event?.extendedProps.staffName || id
        })
      : ['All Staff']

    const roomsList = schedulingMode === 'static'
      ? roomFilters.allRooms
        ? ['All Rooms']
        : roomFilters.roomIds.map(id => rooms.find(r => r.id === id)?.name || id)
      : undefined

    exportEventsToExcel(filteredEvents, {
      filterInfo: {
        view: viewOptions.find(v => v.value === view)?.label || view,
        dateRange: dateRangeStr,
        branches,
        staff,
        rooms: roomsList
      }
    })

    handleExportClose()
  }

  const handleExportSummary = () => {
    exportSummaryToExcel(filteredEvents)
    handleExportClose()
  }

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

        {/* Schedule Templates Button (Static Mode Only) */}
        {schedulingMode === 'static' && !isMobile && (
          <IconButton
            onClick={toggleTemplateManagement}
            size="small"
            title="Manage Schedule Templates"
            sx={{
              color: 'inherit'
            }}
          >
            <i className="ri-calendar-schedule-line" />
          </IconButton>
        )}

        {/* Export Button */}
        <IconButton
          onClick={handleExportClick}
          size="small"
          title="Export to Excel"
          sx={{
            color: exportMenuOpen ? 'primary.main' : 'inherit'
          }}
        >
          <i className="ri-download-2-line" />
        </IconButton>

        {/* Export Menu */}
        <Menu
          anchorEl={exportAnchorEl}
          open={exportMenuOpen}
          onClose={handleExportClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleExportDetails}>
            <ListItemIcon>
              <i className="ri-file-excel-2-line" style={{ fontSize: '1.25rem' }} />
            </ListItemIcon>
            <ListItemText
              primary="Export Details"
              secondary={`${filteredEvents.length} appointments`}
              primaryTypographyProps={{ fontSize: '0.875rem' }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          </MenuItem>
          <MenuItem onClick={handleExportSummary}>
            <ListItemIcon>
              <i className="ri-bar-chart-box-line" style={{ fontSize: '1.25rem' }} />
            </ListItemIcon>
            <ListItemText
              primary="Export Summary"
              secondary="Statistics & breakdown"
              primaryTypographyProps={{ fontSize: '0.875rem' }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          </MenuItem>
        </Menu>

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
