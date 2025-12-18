'use client'

import { useState } from 'react'

import { format } from 'date-fns'
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Select,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'

import { Calendar } from '@/bookly/components/ui/calendar'
import { useCalendarStore } from './state'
import { exportEventsToExcel, exportSummaryToExcel } from './export-utils'
import { getViewTitle, addWeeks } from './utils'

import type { CalendarEvent, CalendarView } from './types'

interface CalendarHeaderProps {
  currentDate: Date
  dateRange?: { start: Date; end: Date }
  filteredEvents?: CalendarEvent[]
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNewBooking: () => void
  onDateChange?: (date: Date) => void
}

export default function CalendarHeader({
  currentDate,
  dateRange,
  filteredEvents = [],
  onPrev,
  onNext,
  onToday,
  onNewBooking,
  onDateChange
}: CalendarHeaderProps) {
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
  const [calendarAnchorEl, setCalendarAnchorEl] = useState<null | HTMLElement>(null)
  const exportMenuOpen = Boolean(exportAnchorEl)
  const calendarOpen = Boolean(calendarAnchorEl)

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget)
  }

  const handleExportClose = () => {
    setExportAnchorEl(null)
  }

  const handleCalendarOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchorEl(event.currentTarget)
  }

  const handleCalendarClose = () => {
    setCalendarAnchorEl(null)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      return
    }

    handleCalendarClose()
    onDateChange?.(date)
  }

  const handleExportDetails = () => {
    const dateRangeStr = dateRange
      ? `${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}`
      : format(currentDate, 'MMM dd, yyyy')

    // Get filter details
    const branches = branchFilters.allBranches ? ['All Branches'] : branchFilters.branchIds

    const staff = staffFilters.onlyMe
      ? ['Only Me']
      : staffFilters.staffIds.length > 0
        ? staffFilters.staffIds.map(id => {
            const event = filteredEvents.find(e => e.extendedProps.staffId === id)
            return event?.extendedProps.staffName || id
          })
        : ['All Staff']

    const roomsList =
      schedulingMode === 'static'
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

  const handleJumpWeek = (weeks: number) => {
    const newDate = addWeeks(currentDate, weeks)
    onDateChange?.(newDate)
  }

  const viewOptions: { value: CalendarView; label: string }[] = [
    { value: 'timeGridDay', label: 'Day' },
    { value: 'timeGridWeek', label: 'Week' },
    { value: 'dayGridMonth', label: 'Month' },
    { value: 'listMonth', label: 'Appointment List' }
  ]

  const title = getViewTitle(view, currentDate)

  return (
    <Box
      sx={{
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
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 2 }, flex: 1, minWidth: 0 }}>
        {/* View Selector */}
        <Select
          value={view}
          onChange={e => setView(e.target.value as CalendarView)}
          size='small'
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
          <IconButton onClick={onPrev} size='small'>
            <i className='ri-arrow-left-s-line' />
          </IconButton>
          <Button
            onClick={onToday}
            variant='outlined'
            size='small'
            sx={{
              minWidth: { xs: 50, sm: 60, md: 80 },
              px: { xs: 0.5, sm: 1, md: 2 },
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
            }}
          >
            {isMobile ? 'Now' : 'Today'}
          </Button>
          <IconButton onClick={onNext} size='small'>
            <i className='ri-arrow-right-s-line' />
          </IconButton>
        </Box>

        {/* Date Picker Dropdown - Hidden on small screens */}
        {!isMobile && (
          <>
            <Box
              onClick={handleCalendarOpen}
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                px: 2,
                py: 1.5,
                borderBottom: '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderBottomColor: 'primary.main',
                  color: 'primary.main'
                }
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'inherit'
                  }}
                >
                  {format(currentDate, 'eee, d MMM')}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    mt: 0.25
                  }}
                >
                  {format(currentDate, 'yyyy')}
                </Typography>
              </Box>
              <i className='ri-arrow-down-s-line' style={{ fontSize: '1.25rem' }} />
            </Box>

            <Popover
              open={calendarOpen}
              anchorEl={calendarAnchorEl}
              onClose={handleCalendarClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              sx={{
                '& .MuiPopover-paper': {
                  boxShadow: 3,
                  mt: 1
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    '& .rdp': {
                      '--rdp-cell-size': '40px' as any,
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
                          theme.palette.mode === 'dark'
                            ? 'rgb(13, 148, 136) !important'
                            : 'rgb(13, 148, 136) !important'
                      }
                    },
                    '& .rdp-day_outside': {
                      color: theme => theme.palette.text.disabled,
                      opacity: 0.3
                    }
                  }}
                >
                  <Calendar mode='single' selected={currentDate} onSelect={handleDateSelect} />
                </Box>

                {/* Jump By Week */}
                <Divider sx={{ my: 2 }} />
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2, px: 2 }}>
                  Jump By Week
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, flexWrap: 'wrap', px: 2 }}>
                  {[1, 2, 3, 4, 5, 6].map((week, index) => (
                    <Box key={`plus-${week}`} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant='body2'
                        onClick={() => handleJumpWeek(week)}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', px: 2 }}>
                  {[-1, -2, -3, -4, -5, -6].map((week, index) => (
                    <Box key={`minus-${week}`} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant='body2'
                        onClick={() => handleJumpWeek(week)}
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
            </Popover>
          </>
        )}
      </Box>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexShrink: 0 }}>
        <Button
          variant='contained'
          startIcon={!isMobile && <i className='ri-add-line' />}
          onClick={onNewBooking}
          size='small'
          sx={{
            minWidth: { xs: 36, sm: 'auto' },
            px: { xs: 1, sm: 2 },
            fontSize: { xs: '0.75rem', md: '0.875rem' }
          }}
        >
          {isMobile ? <i className='ri-add-line' /> : 'New Booking'}
        </Button>

        {/* Schedule Templates Button (Static Mode Only) */}
        {schedulingMode === 'static' && !isMobile && (
          <IconButton
            onClick={toggleTemplateManagement}
            size='small'
            title='Manage Schedule Templates'
            sx={{
              color: 'inherit'
            }}
          >
            <i className='ri-calendar-schedule-line' />
          </IconButton>
        )}

        {/* Export Button */}
        <IconButton
          onClick={handleExportClick}
          size='small'
          title='Export to Excel'
          sx={{
            color: exportMenuOpen ? 'primary.main' : 'inherit'
          }}
        >
          <i className='ri-download-2-line' />
        </IconButton>

        {/* Export Menu */}
        <Menu
          anchorEl={exportAnchorEl}
          open={exportMenuOpen}
          onClose={handleExportClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <MenuItem onClick={handleExportDetails}>
            <ListItemIcon>
              <i className='ri-file-excel-2-line' style={{ fontSize: '1.25rem' }} />
            </ListItemIcon>
            <ListItemText
              primary='Export Details'
              secondary={`${filteredEvents.length} appointments`}
              primaryTypographyProps={{ fontSize: '0.875rem' }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          </MenuItem>
          <MenuItem onClick={handleExportSummary}>
            <ListItemIcon>
              <i className='ri-bar-chart-box-line' style={{ fontSize: '1.25rem' }} />
            </ListItemIcon>
            <ListItemText
              primary='Export Summary'
              secondary='Statistics & breakdown'
              primaryTypographyProps={{ fontSize: '0.875rem' }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          </MenuItem>
        </Menu>

        {isMobile && (
          <IconButton onClick={toggleSidebar} size='small'>
            <i className='ri-filter-line' />
          </IconButton>
        )}

        {!isMobile && (
          <>
            <IconButton onClick={toggleSettings} size='small'>
              <i className='ri-settings-3-line' />
            </IconButton>

            <IconButton onClick={toggleNotifications} size='small'>
              <i className='ri-notification-3-line' />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  )
}
