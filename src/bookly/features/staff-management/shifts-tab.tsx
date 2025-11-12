'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { BusinessHoursModal } from './business-hours-modal'
import { StaffEditWorkingHoursModal } from './staff-edit-working-hours-modal'
import { TimeOffModal } from './time-off-modal'

const TIMELINE_HOURS = [
  '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM',
  '10:00 PM', '11:00 PM', '12:00 AM'
]

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function timeToPosition(time: string): number {
  const [hourStr, period] = time.split(' ')
  let [hours, minutes = 0] = hourStr.split(':').map(Number)

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const totalMinutes = hours * 60 + minutes
  const startMinutes = 10 * 60
  const endMinutes = 24 * 60

  return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
}

function calculateWidth(start: string, end: string): number {
  const startPos = timeToPosition(start)
  const endPos = timeToPosition(end)
  return endPos - startPos
}

export function ShiftsTab() {
  const [viewMode, setViewMode] = useState('Day')
  const [selectedStaff, setSelectedStaff] = useState('Staff')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const [isBusinessHoursModalOpen, setIsBusinessHoursModalOpen] = useState(false)
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false)
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false)
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<{ id: string; name: string } | null>(null)

  const [staffMenuAnchor, setStaffMenuAnchor] = useState<null | HTMLElement>(null)
  const [staffMenuOpen, setStaffMenuOpen] = useState(false)

  const { timeOffRequests } = useStaffManagementStore()

  const displayStaff = selectedStaff === 'Staff' ? mockStaff.slice(0, 2) : mockStaff.filter(s => s.name === selectedStaff)

  const handlePrevPeriod = () => {
    if (viewMode === 'Week') {
      setSelectedDate(subWeeks(selectedDate, 1))
    } else {
      setSelectedDate(subDays(selectedDate, 1))
    }
  }

  const handleNextPeriod = () => {
    if (viewMode === 'Week') {
      setSelectedDate(addWeeks(selectedDate, 1))
    } else {
      setSelectedDate(addDays(selectedDate, 1))
    }
  }

  const handleOpenBusinessHoursModal = () => {
    setIsBusinessHoursModalOpen(true)
  }

  const handleOpenStaffMenu = (event: React.MouseEvent<HTMLElement>, staff: { id: string; name: string }) => {
    setStaffMenuAnchor(event.currentTarget)
    setSelectedStaffForEdit(staff)
    setStaffMenuOpen(true)
  }

  const handleCloseStaffMenu = () => {
    setStaffMenuOpen(false)
  }

  const handleOpenWorkingHoursModal = () => {
    setIsWorkingHoursModalOpen(true)
    handleCloseStaffMenu()
  }

  const handleOpenTimeOffModal = () => {
    setIsTimeOffModalOpen(true)
    handleCloseStaffMenu()
  }

  // Get week dates
  const weekStart = startOfWeek(selectedDate)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Format date display
  const getDateDisplay = () => {
    if (viewMode === 'Week') {
      const endDate = addDays(weekStart, 6)
      return `${format(weekStart, 'MMM d')} - ${format(endDate, 'MMM d')}`
    }
    return format(selectedDate, 'EEE, dd MMM')
  }

  // Render Day View
  if (viewMode === 'Day') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {/* Header Controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <MenuItem value="Day">Day</MenuItem>
              <MenuItem value="Week">Week</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
            >
              <MenuItem value="Staff">Staff</MenuItem>
              {mockStaff.map((staff) => (
                <MenuItem key={staff.id} value={staff.name}>
                  {staff.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={handlePrevPeriod}>
              <i className="ri-arrow-left-s-line" />
            </IconButton>
            <Box sx={{ minWidth: 180, textAlign: 'center', py: 0.5, px: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                {getDateDisplay()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Closed
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleNextPeriod}>
              <i className="ri-arrow-right-s-line" />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton size="small">
            <i className="ri-printer-line" />
          </IconButton>
          <Button variant="outlined" startIcon={<i className="ri-file-copy-line" />}>
            COPY
          </Button>
        </Box>

        {/* Day View Content */}
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
          {/* Timeline Header */}
          <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ width: 200, p: 2 }} />
            <Box sx={{ flex: 1, display: 'flex', px: 2 }}>
              {TIMELINE_HOURS.map((hour, idx) => (
                <Box key={idx} sx={{ flex: 1, textAlign: 'center', py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {hour}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Business Hours Row */}
          <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: 60 }}>
            <Box sx={{ width: 200, display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                Business Hours
              </Typography>
              <IconButton size="small" onClick={handleOpenBusinessHoursModal}>
                <i className="ri-edit-line" style={{ fontSize: 16 }} />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                Off
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                bgcolor: '#424242',
                m: 1,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body2" sx={{ color: '#fff' }}>
                Closed
              </Typography>
              <IconButton size="small" sx={{ color: '#fff', ml: 'auto', mr: 1 }}>
                <i className="ri-edit-line" style={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Staff Rows */}
          {displayStaff.map((staff) => {
            const timeOff = timeOffRequests.find(
              (req) => req.staffId === staff.id && req.approved && isSameDay(req.range.start, selectedDate)
            )

            return (
              <Box key={staff.id} sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', minHeight: 60 }}>
                <Box sx={{ width: 200, display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {staff.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenStaffMenu(e, { id: staff.id, name: staff.name })}
                  >
                    <i className="ri-edit-line" style={{ fontSize: 16 }} />
                  </IconButton>
                  <Box sx={{ display: 'flex', flexDirection: 'column', fontSize: '0.65rem', color: 'text.secondary', ml: 'auto' }}>
                    <Typography variant="caption">D 9h/9h</Typography>
                    <Typography variant="caption">W 45h/45h</Typography>
                    <Typography variant="caption">M 149h 45min</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1, position: 'relative', m: 1 }}>
                  {!timeOff && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        bgcolor: staff.id === '1' ? 'rgba(139, 195, 74, 0.3)' : 'rgba(255, 193, 7, 0.3)',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 1,
                        borderColor: staff.id === '1' ? 'success.light' : 'warning.light'
                      }}
                    >
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        10:00 am - 7:00 pm
                      </Typography>
                      <IconButton size="small" sx={{ ml: 'auto', mr: 1, color: 'text.primary' }}>
                        <i className="ri-edit-line" style={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  )}
                  {timeOff && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        bgcolor: '#424242',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#fff' }} fontWeight={500}>
                        {timeOff.reason} (9h)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>

        {/* Modals and Menus */}
        <Menu
          anchorEl={staffMenuAnchor}
          open={staffMenuOpen}
          onClose={handleCloseStaffMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleOpenWorkingHoursModal}>
            <ListItemIcon>
              <i className="ri-time-line" />
            </ListItemIcon>
            <ListItemText>EDIT WORKING HOURS</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleOpenTimeOffModal}>
            <ListItemIcon>
              <i className="ri-calendar-close-line" />
            </ListItemIcon>
            <ListItemText>ADD TIME OFF</ListItemText>
          </MenuItem>
        </Menu>

        <BusinessHoursModal
          open={isBusinessHoursModalOpen}
          onClose={() => setIsBusinessHoursModalOpen(false)}
        />

        {selectedStaffForEdit && (
          <StaffEditWorkingHoursModal
            open={isWorkingHoursModalOpen}
            onClose={() => setIsWorkingHoursModalOpen(false)}
            staffId={selectedStaffForEdit.id}
            staffName={selectedStaffForEdit.name}
          />
        )}

        <TimeOffModal
          open={isTimeOffModalOpen}
          onClose={() => setIsTimeOffModalOpen(false)}
        />
      </Box>
    )
  }

  // Render Week View
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <MenuItem value="Day">Day</MenuItem>
            <MenuItem value="Week">Week</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
          >
            <MenuItem value="Staff">Staff</MenuItem>
            {mockStaff.map((staff) => (
              <MenuItem key={staff.id} value={staff.name}>
                {staff.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={handlePrevPeriod}>
            <i className="ri-arrow-left-s-line" />
          </IconButton>
          <Box sx={{ minWidth: 180, textAlign: 'center', py: 0.5, px: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              {getDateDisplay()}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleNextPeriod}>
            <i className="ri-arrow-right-s-line" />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton size="small">
          <i className="ri-printer-line" />
        </IconButton>
        <Button variant="outlined" startIcon={<i className="ri-file-copy-line" />}>
          COPY
        </Button>
      </Box>

      {/* Week View Content */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
          {/* Left column with staff names */}
          <Box sx={{ width: 150, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
            {/* Empty header cell */}
            <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider' }} />

            {/* Business Hours */}
            <Box sx={{ height: 60, display: 'flex', alignItems: 'center', px: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="body2" fontWeight={600}>
                Business Hours
              </Typography>
              <IconButton size="small" onClick={handleOpenBusinessHoursModal} sx={{ ml: 'auto' }}>
                <i className="ri-edit-line" style={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {/* Staff names */}
            {displayStaff.map((staff) => (
              <Box
                key={staff.id}
                sx={{ height: 60, display: 'flex', alignItems: 'center', gap: 1, px: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {staff.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">W 45h/45h</Typography>
                    <Typography variant="caption" color="text.secondary">M 149h 45min/149h 45min</Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenStaffMenu(e, { id: staff.id, name: staff.name })}
                >
                  <i className="ri-edit-line" style={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>

          {/* Day columns */}
          {weekDates.map((date, dayIndex) => {
            const isToday = isSameDay(date, new Date())
            const dayName = WEEK_DAYS[dayIndex]

            return (
              <Box
                key={dayIndex}
                sx={{
                  minWidth: 150,
                  flexShrink: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                  bgcolor: isToday ? 'rgba(20, 184, 166, 0.05)' : 'transparent'
                }}
              >
                {/* Day header */}
                <Box
                  sx={{
                    height: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: isToday ? 'primary.main' : 'transparent',
                    color: isToday ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    {dayName} {format(date, 'd')}
                  </Typography>
                </Box>

                {/* Business Hours cell */}
                <Box
                  sx={{
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'grey.900',
                    m: 1,
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" color="white">
                    Closed
                  </Typography>
                  <IconButton size="small" sx={{ ml: 'auto', mr: 0.5, color: 'white' }}>
                    <i className="ri-edit-line" style={{ fontSize: 14 }} />
                  </IconButton>
                </Box>

                {/* Staff shift cells */}
                {displayStaff.map((staff) => {
                  const timeOff = timeOffRequests.find(
                    (req) => req.staffId === staff.id && req.approved && isSameDay(req.range.start, date)
                  )

                  return (
                    <Box
                      key={staff.id}
                      sx={{
                        height: 60,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: 1,
                        borderColor: 'divider',
                        position: 'relative',
                        m: 1,
                        borderRadius: 1
                      }}
                    >
                      {!timeOff && (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: staff.id === '1' ? 'rgba(139, 195, 74, 0.3)' : 'rgba(255, 193, 7, 0.3)',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 1,
                            borderColor: staff.id === '1' ? 'success.light' : 'warning.light',
                            p: 0.5
                          }}
                        >
                          <Typography variant="caption" fontWeight={500} color="text.primary">
                            10:00 am
                          </Typography>
                          <Typography variant="caption" fontWeight={500} color="text.primary">
                            7:00 pm
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            9h (9h)
                          </Typography>
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 2, right: 2, color: 'text.primary' }}
                            onClick={(e) => handleOpenStaffMenu(e, { id: staff.id, name: staff.name })}
                          >
                            <i className="ri-edit-line" style={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      )}
                      {timeOff && (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: '#424242',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 0.5
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#fff' }} fontWeight={500}>
                              {timeOff.reason}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#fff' }} display="block">
                              (9h) • Sick Day
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Modals and Menus */}
      <Menu
        anchorEl={staffMenuAnchor}
        open={staffMenuOpen}
        onClose={handleCloseStaffMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleOpenWorkingHoursModal}>
          <ListItemIcon>
            <i className="ri-time-line" />
          </ListItemIcon>
          <ListItemText>EDIT WORKING HOURS</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenTimeOffModal}>
          <ListItemIcon>
            <i className="ri-calendar-close-line" />
          </ListItemIcon>
          <ListItemText>ADD TIME OFF</ListItemText>
        </MenuItem>
      </Menu>

      <BusinessHoursModal
        open={isBusinessHoursModalOpen}
        onClose={() => setIsBusinessHoursModalOpen(false)}
      />

      {selectedStaffForEdit && (
        <StaffEditWorkingHoursModal
          open={isWorkingHoursModalOpen}
          onClose={() => setIsWorkingHoursModalOpen(false)}
          staffId={selectedStaffForEdit.id}
          staffName={selectedStaffForEdit.name}
        />
      )}

      <TimeOffModal
        open={isTimeOffModalOpen}
        onClose={() => setIsTimeOffModalOpen(false)}
      />
    </Box>
  )
}
