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
  Tabs,
  Tab,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Menu,
  ListItemIcon
} from '@mui/material'
import { mockStaff, mockServices, mockBranches } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { EditServicesModal } from './edit-services-modal'
import { WorkingHoursEditor } from './working-hours-editor'
import { TimeOffModal } from './time-off-modal'
import { TimeReservationModal } from './time-reservation-modal'
import { AddStaffMemberDrawer } from './add-staff-member-drawer'
import { useCalendarStore } from '../calendar/state'

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

// Helper function to get 2 initials from a name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}

export function StaffMembersTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTab, setCurrentTab] = useState(0)
  const [isAddStaffDrawerOpen, setIsAddStaffDrawerOpen] = useState(false)
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [branchFilter, setBranchFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<{ id: string; name: string } | null>(null)
  const [editingStaff, setEditingStaff] = useState<(typeof mockStaff)[0] | null>(null)

  // Action Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null)

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
    toggleTimeReservation,
    deleteStaffMember
  } = useStaffManagementStore()

  const { setStaffFilters } = useCalendarStore()

  // Get selected staff
  const selectedStaff = mockStaff.find(s => s.id === selectedStaffId)

  // Filter staff by search - only show base staff members (IDs 1-7) matching other tabs
  const filteredStaff = mockStaff
    .filter(s => ['1', '2', '3', '4', '5', '6', '7'].includes(s.id))
    .filter(
      staff =>
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

  // Filter by branch if selected
  const filteredByBranch =
    branchFilter !== 'all' ? filteredStaff.filter(staff => staff.branchId === branchFilter) : filteredStaff

  // Filter by service if selected
  const filteredByService =
    serviceFilter !== 'all'
      ? filteredByBranch.filter(staff => {
          const assignedServices = getStaffServices(staff.id)
          return assignedServices.includes(serviceFilter)
        })
      : filteredByBranch

  // Always group by branch
  const groupedStaff: Record<string, { name: string; staff: typeof mockStaff }> = {}

  filteredByService.forEach(staff => {
    const branchId = staff.branchId
    const branch = mockBranches.find(b => b.id === branchId)

    if (!groupedStaff[branchId]) {
      groupedStaff[branchId] = { name: branch?.name || branchId, staff: [] }
    }
    groupedStaff[branchId].staff.push(staff)
  })

  // Sort groups and staff within groups
  const sortedGroups = Object.entries(groupedStaff)
    .map(([id, group]) => ({
      id,
      name: group.name,
      staff: group.staff.sort((a, b) => a.name.localeCompare(b.name))
    }))
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

  const handleDeleteClick = (staff: { id: string; name: string }) => {
    setStaffToDelete(staff)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (staffToDelete) {
      deleteStaffMember(staffToDelete.id)
      setDeleteDialogOpen(false)
      setStaffToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setStaffToDelete(null)
  }

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchor(event.currentTarget)
  }

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null)
  }

  const handleMenuAction = (action: 'edit' | 'calendar' | 'delete') => {
    handleCloseActionMenu()
    if (!selectedStaff) return

    switch (action) {
      case 'edit':
        setEditingStaff(selectedStaff)
        setIsAddStaffDrawerOpen(true)
        break
      case 'calendar':
        handleShowCalendar()
        break
      case 'delete':
        handleDeleteClick({ id: selectedStaff.id, name: selectedStaff.name })
        break
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
      {/* Left Sidebar - Team Directory */}
      <Paper
        elevation={0}
        sx={{
          width: 340,
          flexShrink: 0,
          borderRadius: 3,
          border: '1px solid',
          borderColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.15)' : 'rgba(10, 44, 36, 0.04)'),
            borderBottom: '1px solid',
            borderColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
          }}
        >
          <Typography variant='subtitle1' fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className='ri-team-line' style={{ fontSize: 18 }} />
            Team Directory
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
            {filteredByService.length} team member{filteredByService.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          <TextField
            fullWidth
            size='small'
            placeholder='Search by name or role...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' style={{ fontSize: 16, opacity: 0.6 }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Location</InputLabel>
              <Select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} label='Location'>
                <MenuItem value='all'>All Locations</MenuItem>
                {mockBranches.map(branch => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size='small'>
              <InputLabel>Service</InputLabel>
              <Select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} label='Service'>
                <MenuItem value='all'>All Services</MenuItem>
                {mockServices.map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Staff List - Grouped by Location */}
        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {sortedGroups.map(group => (
            <Box key={group.id}>
              {/* Location Header */}
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  borderBottom: '1px solid',
                  borderColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant='caption'
                  fontWeight={700}
                  color='text.primary'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    letterSpacing: 0.5,
                    fontFamily: 'var(--font-fira-code)'
                  }}
                >
                  <i className='ri-map-pin-2-line' style={{ fontSize: 14, opacity: 0.7 }} />
                  {group.name}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={500}
                  sx={{ fontFamily: 'var(--font-fira-code)' }}
                >
                  {group.staff.length}
                </Typography>
              </Box>

              {/* Team Members in Location */}
              {group.staff.map(staff => (
                <ListItemButton
                  key={staff.id}
                  selected={selectedStaffId === staff.id}
                  onClick={() => selectStaff(staff.id)}
                  sx={{
                    py: 1.5,
                    borderLeft: 3,
                    borderColor: selectedStaffId === staff.id ? 'primary.main' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&.Mui-selected': {
                      bgcolor: theme =>
                        theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.2)' : 'rgba(10, 44, 36, 0.06)',
                      '&:hover': {
                        bgcolor: theme =>
                          theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.25)' : 'rgba(10, 44, 36, 0.08)'
                      }
                    },
                    '&:hover': {
                      bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      alt={staff.name}
                      sx={{
                        bgcolor: staff.color || 'primary.main',
                        color: '#fff',
                        width: 42,
                        height: 42,
                        fontSize: '0.95rem',
                        fontWeight: 600
                      }}
                    >
                      {getInitials(staff.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={staff.name}
                    secondary={staff.title}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      fontFamily: 'var(--font-fira-code)'
                    }}
                  />
                </ListItemButton>
              ))}
            </Box>
          ))}
        </List>
      </Paper>

      {/* Right Panel - Staff Details */}
      {selectedStaff ? (
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            borderRadius: 3,
            border: '1px solid',
            borderColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
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
              borderColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
              bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(10, 44, 36, 0.08)' : 'rgba(10, 44, 36, 0.02)')
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 2 }}>
              <Avatar
                alt={selectedStaff.name}
                sx={{
                  bgcolor: selectedStaff.color || 'primary.main',
                  color: '#fff',
                  width: 72,
                  height: 72,
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {getInitials(selectedStaff.name)}
              </Avatar>
              <Box sx={{ flexGrow: 1, pt: 0.5 }}>
                <Typography variant='h5' fontWeight={700} sx={{ mb: 0.5 }}>
                  {selectedStaff.name}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 1.5, fontFamily: 'var(--font-fira-code)' }}
                >
                  {selectedStaff.title}
                </Typography>

                {/* Contact Info with improved styling */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {selectedStaff.email && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: theme =>
                          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <i className='ri-mail-line' style={{ fontSize: 14, opacity: 0.7 }} />
                      <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                        {selectedStaff.email}
                      </Typography>
                    </Box>
                  )}
                  {selectedStaff.phone && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: theme =>
                          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <i className='ri-phone-line' style={{ fontSize: 14, opacity: 0.7 }} />
                      <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                        {selectedStaff.phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Action Menu Button */}
              <IconButton
                onClick={handleOpenActionMenu}
                sx={{
                  bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  '&:hover': {
                    bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
                  }
                }}
              >
                <i className='ri-more-2-fill' />
              </IconButton>

              <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={handleCloseActionMenu}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
              >
                <MenuItem onClick={() => handleMenuAction('edit')}>
                  <ListItemIcon>
                    <i className='ri-edit-line' style={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText>Edit Details</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction('calendar')}>
                  <ListItemIcon>
                    <i className='ri-calendar-line' style={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText>Show Calendar</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <i
                      className='ri-delete-bin-line'
                      style={{ fontSize: 20, color: 'var(--mui-palette-error-main)' }}
                    />
                  </ListItemIcon>
                  <ListItemText>Delete Staff</ListItemText>
                </MenuItem>
              </Menu>
            </Box>

            {/* Tabs */}
            <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mt: 2 }}>
              <Tab label='Services' />
              <Tab label='Working Hours' />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {/* Services Tab */}
            <TabPanel value={currentTab} index={0}>
              <Box sx={{ px: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant='h6'>Assigned Services ({assignedServices.length})</Typography>
                  <Button variant='contained' startIcon={<i className='ri-edit-line' />} onClick={openEditServices}>
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
                    <i className='ri-service-line' style={{ fontSize: 48, opacity: 0.3 }} />
                    <Typography variant='body1' sx={{ mt: 2 }}>
                      No services assigned yet
                    </Typography>
                    <Typography variant='body2'>Click "Edit Services" to assign services</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {assignedServices.map(service => (
                      <Paper
                        key={service.id}
                        variant='outlined'
                        sx={{
                          p: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Typography variant='body1' fontWeight={500}>
                            {service.name}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ fontFamily: 'var(--font-fira-code)' }}
                          >
                            {service.duration} min • {service.category}
                          </Typography>
                        </Box>
                        <Typography variant='h6' color='primary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
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
                <Typography variant='h6' sx={{ mb: 3 }}>
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
            <i className='ri-team-line' style={{ fontSize: 64, opacity: 0.3 }} />
            <Typography variant='h6' sx={{ mt: 2 }}>
              Select a staff member
            </Typography>
            <Typography variant='body2'>Choose a staff member from the list to view details</Typography>
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
      <TimeOffModal open={isTimeOffOpen} onClose={toggleTimeOff} />

      {/* Time Reservation Modal */}
      <TimeReservationModal
        open={isTimeReservationOpen}
        onClose={toggleTimeReservation}
        initialStaffId={selectedStaffId || undefined}
        branchId={branchFilter}
      />

      {/* Add Staff Member Drawer */}
      <AddStaffMemberDrawer
        open={isAddStaffDrawerOpen}
        onClose={() => {
          setIsAddStaffDrawerOpen(false)
          setEditingStaff(null)
        }}
        editingStaff={editingStaff}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth='xs' fullWidth>
        <DialogTitle>Delete Staff Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{staffToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant='contained' color='error' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sticky Add Button */}
      <Fab
        color='primary'
        onClick={() => setIsAddStaffDrawerOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          zIndex: 1050,
          boxShadow: 4
        }}
      >
        <i className='ri-add-line' style={{ fontSize: 24 }} />
      </Fab>
    </Box>
  )
}
