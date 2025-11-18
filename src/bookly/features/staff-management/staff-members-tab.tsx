'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  Fab,
  Typography,
  Chip,
  Tabs,
  Tab,
  Button,
  Divider
} from '@mui/material'
import { mockStaff, mockServices, mockBranches } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { EditServicesModal } from './edit-services-modal'
import { WorkingHoursEditor } from './working-hours-editor'
import { TimeOffModal } from './time-off-modal'
import { TimeReservationModal } from './time-reservation-modal'
import { useCalendarStore } from '../calendar/state'

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

export function StaffMembersTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTab, setCurrentTab] = useState(0)

  const {
    selectedStaffId,
    selectStaff,
    getStaffServices,
    isEditServicesOpen,
    openEditServices,
    closeEditServices,
    isTimeOffOpen,
    isTimeReservationOpen,
    toggleTimeOff,
    toggleTimeReservation
  } = useStaffManagementStore()

  const { setStaffFilters } = useCalendarStore()

  // Get selected staff
  const selectedStaff = mockStaff.find(s => s.id === selectedStaffId)

  // Filter staff by search
  const filteredStaff = mockStaff.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group staff by branch and sort
  const staffByBranch = filteredStaff.reduce((acc, staff) => {
    const branchId = staff.branchId
    if (!acc[branchId]) {
      acc[branchId] = []
    }
    acc[branchId].push(staff)
    return acc
  }, {} as Record<string, typeof mockStaff>)

  // Get branch information and sort branches alphabetically
  const sortedBranches = Object.keys(staffByBranch)
    .map(branchId => {
      // Find branch details from mockBranches
      const branch = mockBranches.find(b => b.id === branchId)
      return {
        id: branchId,
        name: branch?.name || branchId,
        staff: staffByBranch[branchId].sort((a, b) => a.name.localeCompare(b.name))
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  // Get assigned services for selected staff
  const assignedServiceIds = selectedStaffId ? getStaffServices(selectedStaffId) : []
  const assignedServices = mockServices.filter(s => assignedServiceIds.includes(s.id))

  const handleShowCalendar = () => {
    if (!selectedStaffId) return
    // Set calendar to show only this staff member
    setStaffFilters({
      onlyMe: false,
      staffIds: [selectedStaffId],
      selectedStaffId: selectedStaffId
    })
    // Navigate to calendar (you can add router.push here)
    window.location.href = '/en/apps/bookly/calendar'
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
      {/* Left Sidebar - Staff List */}
      <Paper
        elevation={0}
        sx={{
          width: 320,
          flexShrink: 0,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Staff List - Grouped by Branch */}
        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {sortedBranches.map((branch) => (
            <Box key={branch.id}>
              {/* Branch Header */}
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: 'action.hover',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  {branch.name}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {branch.staff.length} {branch.staff.length === 1 ? 'member' : 'members'}
                </Typography>
              </Box>

              {/* Staff Members in Branch */}
              {branch.staff.map((staff) => (
                <ListItemButton
                  key={staff.id}
                  selected={selectedStaffId === staff.id}
                  onClick={() => selectStaff(staff.id)}
                  sx={{
                    borderLeft: 3,
                    borderColor: selectedStaffId === staff.id ? 'primary.main' : 'transparent',
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={staff.photo}
                      alt={staff.name}
                      sx={{
                        bgcolor: staff.color || 'primary.main',
                        width: 40,
                        height: 40
                      }}
                    >
                      {staff.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={staff.name}
                    secondary={staff.title}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip
                    size="small"
                    label="Active"
                    color="success"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                </ListItemButton>
              ))}
            </Box>
          ))}
        </List>

        {/* Add Staff FAB */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Fab
            variant="extended"
            color="primary"
            size="small"
            fullWidth
            sx={{ textTransform: 'none' }}
          >
            <i className="ri-add-line" style={{ marginRight: 8 }} />
            Add Staff Member
          </Fab>
        </Box>
      </Paper>

      {/* Right Panel - Staff Details */}
      {selectedStaff ? (
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={selectedStaff.photo}
                alt={selectedStaff.name}
                sx={{
                  bgcolor: selectedStaff.color || 'primary.main',
                  width: 64,
                  height: 64
                }}
              >
                {selectedStaff.name[0]}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" fontWeight={600}>
                  {selectedStaff.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStaff.title}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<i className="ri-calendar-line" />}
                onClick={handleShowCalendar}
              >
                Show Calendar
              </Button>
            </Box>

            {/* Tabs */}
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
              sx={{ mt: 2 }}
            >
              <Tab label="Services" />
              <Tab label="Working Hours" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {/* Services Tab */}
            <TabPanel value={currentTab} index={0}>
              <Box sx={{ px: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Assigned Services ({assignedServices.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<i className="ri-edit-line" />}
                    onClick={openEditServices}
                  >
                    Edit Services
                  </Button>
                </Box>

                {assignedServices.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      color: 'text.secondary'
                    }}
                  >
                    <i className="ri-service-line" style={{ fontSize: 48, opacity: 0.3 }} />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      No services assigned yet
                    </Typography>
                    <Typography variant="body2">
                      Click "Edit Services" to assign services
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {assignedServices.map((service) => (
                      <Paper
                        key={service.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {service.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.duration} min • {service.category}
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary">
                          ${service.price}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Working Hours Tab */}
            <TabPanel value={currentTab} index={1}>
              <Box sx={{ px: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Weekly Schedule
                </Typography>
                <WorkingHoursEditor staffId={selectedStaffId} />
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      ) : (
        // No staff selected
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <i className="ri-team-line" style={{ fontSize: 64, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Select a staff member
            </Typography>
            <Typography variant="body2">
              Choose a staff member from the list to view details
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Edit Services Modal */}
      {selectedStaffId && (
        <EditServicesModal
          open={isEditServicesOpen}
          onClose={closeEditServices}
          staffId={selectedStaffId}
          staffName={selectedStaff?.name || ''}
        />
      )}

      {/* Time Off Modal */}
      <TimeOffModal
        open={isTimeOffOpen}
        onClose={toggleTimeOff}
      />

      {/* Time Reservation Modal */}
      <TimeReservationModal
        open={isTimeReservationOpen}
        onClose={toggleTimeReservation}
      />
    </Box>
  )
}
