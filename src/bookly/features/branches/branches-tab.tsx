'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  Fab
} from '@mui/material'
import { useBranchesStore } from './branches-store'
import { BranchEditorDrawer } from './branch-editor-drawer'

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

// Format working hours for display
const formatWorkingHours = (hours: { day: string; isOpen: boolean; openTime: string; closeTime: string }[]) => {
  const todayIndex = new Date().getDay()
  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = dayOrder[todayIndex]
  const todayHours = hours.find(h => h.day === today)

  if (!todayHours || !todayHours.isOpen) {
    return 'Closed today'
  }

  return `Today: ${todayHours.openTime} - ${todayHours.closeTime}`
}

export function BranchesTab() {
  const [currentTab, setCurrentTab] = useState(0)
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null)

  const {
    branches,
    selectedBranchId,
    searchQuery,
    statusFilter,
    isDeleteDialogOpen,
    branchToDelete,
    getFilteredBranches,
    setSelectedBranch,
    setSearchQuery,
    setStatusFilter,
    openBranchEditor,
    openDeleteDialog,
    closeDeleteDialog,
    deleteBranch,
    toggleBranchStatus,
    setPrimaryBranch
  } = useBranchesStore()

  const filteredBranches = getFilteredBranches()
  const selectedBranch = branches.find(b => b.id === selectedBranchId)

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchor(event.currentTarget)
  }

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null)
  }

  const handleMenuAction = (action: 'edit' | 'toggle' | 'primary' | 'delete') => {
    handleCloseActionMenu()
    if (!selectedBranch) return

    switch (action) {
      case 'edit':
        openBranchEditor(selectedBranch)
        break
      case 'toggle':
        toggleBranchStatus(selectedBranch.id)
        break
      case 'primary':
        setPrimaryBranch(selectedBranch.id)
        break
      case 'delete':
        openDeleteDialog(selectedBranch)
        break
    }
  }

  const handleDeleteConfirm = () => {
    if (branchToDelete) {
      deleteBranch(branchToDelete.id)
    }
    closeDeleteDialog()
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
      {/* Left Sidebar - Branches List */}
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
        {/* Search and Filters */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <TextField
            fullWidth
            size='small'
            placeholder='Search branches...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
          />

          <FormControl fullWidth size='small'>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              label='Status'
            >
              <MenuItem value='all'>All Branches</MenuItem>
              <MenuItem value='active'>Active Only</MenuItem>
              <MenuItem value='inactive'>Inactive Only</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Branches List */}
        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {filteredBranches.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <i className='ri-building-line' style={{ fontSize: 40, opacity: 0.3 }} />
              <Typography variant='body2' sx={{ mt: 1 }}>
                No branches found
              </Typography>
            </Box>
          ) : (
            filteredBranches.map(branch => (
              <ListItemButton
                key={branch.id}
                selected={selectedBranchId === branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                sx={{
                  borderLeft: 3,
                  borderColor: selectedBranchId === branch.id ? 'primary.main' : 'transparent',
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <i
                    className={branch.isActive ? 'ri-building-line' : 'ri-building-2-line'}
                    style={{
                      fontSize: 20,
                      color: branch.isActive ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-text-disabled)'
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body1' fontWeight={500}>
                        {branch.name}
                      </Typography>
                      {branch.isPrimary && (
                        <Chip label='Primary' size='small' color='primary' sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box component='span' sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {branch.city}, {branch.country}
                      </Typography>
                      <Typography variant='caption' color={branch.isActive ? 'success.main' : 'error.main'}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>

      {/* Right Panel - Branch Details */}
      {selectedBranch ? (
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
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: selectedBranch.isActive ? 'primary.main' : 'grey.400',
                  fontSize: '1.5rem'
                }}
              >
                <i className='ri-building-line' />
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant='h5' fontWeight={600}>
                    {selectedBranch.name}
                  </Typography>
                  {selectedBranch.isPrimary && <Chip label='Primary Branch' size='small' color='primary' />}
                  <Chip
                    label={selectedBranch.isActive ? 'Active' : 'Inactive'}
                    size='small'
                    color={selectedBranch.isActive ? 'success' : 'error'}
                    variant='outlined'
                  />
                </Box>

                <Typography variant='body2' color='text.secondary'>
                  {selectedBranch.address}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {selectedBranch.city}, {selectedBranch.country}
                </Typography>

                <Box sx={{ display: 'flex', gap: 3, mt: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <i className='ri-phone-line' style={{ fontSize: 14 }} />
                    <Typography variant='body2'>{selectedBranch.mobile}</Typography>
                  </Box>
                  {selectedBranch.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <i className='ri-mail-line' style={{ fontSize: 14 }} />
                      <Typography variant='body2'>{selectedBranch.email}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <i className='ri-time-line' style={{ fontSize: 14 }} />
                    <Typography variant='body2'>{formatWorkingHours(selectedBranch.workingHours)}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Action Menu */}
              <IconButton onClick={handleOpenActionMenu}>
                <i className='ri-more-2-fill' />
              </IconButton>

              <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={handleCloseActionMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => handleMenuAction('edit')}>
                  <ListItemIcon>
                    <i className='ri-edit-line' style={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText>Edit Branch</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction('toggle')}>
                  <ListItemIcon>
                    <i
                      className={selectedBranch.isActive ? 'ri-eye-off-line' : 'ri-eye-line'}
                      style={{ fontSize: 18 }}
                    />
                  </ListItemIcon>
                  <ListItemText>{selectedBranch.isActive ? 'Deactivate' : 'Activate'}</ListItemText>
                </MenuItem>
                {!selectedBranch.isPrimary && (
                  <MenuItem onClick={() => handleMenuAction('primary')}>
                    <ListItemIcon>
                      <i className='ri-star-line' style={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText>Set as Primary</ListItemText>
                  </MenuItem>
                )}
                <Divider />
                {!selectedBranch.isPrimary && (
                  <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                      <i className='ri-delete-bin-line' style={{ fontSize: 18, color: 'var(--mui-palette-error-main)' }} />
                    </ListItemIcon>
                    <ListItemText>Delete Branch</ListItemText>
                  </MenuItem>
                )}
              </Menu>
            </Box>

            {/* Tabs */}
            <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mt: 3 }}>
              <Tab label='Overview' />
              <Tab label='Services' />
              <Tab label='Staff' />
              <Tab label='Working Hours' />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {/* Overview Tab */}
            <TabPanel value={currentTab} index={0}>
              <Box sx={{ px: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 4 }}>
                  <Paper variant='outlined' sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography variant='h4' color='primary' fontWeight={600}>
                      {selectedBranch.services.length}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Services Offered
                    </Typography>
                  </Paper>
                  <Paper variant='outlined' sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography variant='h4' color='primary' fontWeight={600}>
                      {selectedBranch.staff.length}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Staff Members
                    </Typography>
                  </Paper>
                  <Paper variant='outlined' sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography variant='h4' color='primary' fontWeight={600}>
                      {selectedBranch.galleryUrls.length}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Gallery Images
                    </Typography>
                  </Paper>
                </Box>

                <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
                  Branch Information
                </Typography>
                <Paper variant='outlined' sx={{ p: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Created
                      </Typography>
                      <Typography variant='body2'>
                        {new Date(selectedBranch.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Last Updated
                      </Typography>
                      <Typography variant='body2'>
                        {new Date(selectedBranch.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </TabPanel>

            {/* Services Tab */}
            <TabPanel value={currentTab} index={1}>
              <Box sx={{ px: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant='h6'>Assigned Services ({selectedBranch.services.length})</Typography>
                  <Button
                    variant='contained'
                    startIcon={<i className='ri-edit-line' />}
                    onClick={() => openBranchEditor(selectedBranch)}
                  >
                    Manage Services
                  </Button>
                </Box>

                {selectedBranch.services.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <i className='ri-service-line' style={{ fontSize: 48, opacity: 0.3 }} />
                    <Typography variant='body1' sx={{ mt: 2 }}>
                      No services assigned yet
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedBranch.services.map(service => (
                      <Paper
                        key={service.id}
                        variant='outlined'
                        sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Box>
                          <Typography variant='body1' fontWeight={500}>
                            {service.name}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {service.duration} min
                          </Typography>
                        </Box>
                        <Typography variant='h6' color='primary'>
                          ${service.price}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Staff Tab */}
            <TabPanel value={currentTab} index={2}>
              <Box sx={{ px: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant='h6'>Assigned Staff ({selectedBranch.staff.length})</Typography>
                  <Button
                    variant='contained'
                    startIcon={<i className='ri-edit-line' />}
                    onClick={() => openBranchEditor(selectedBranch)}
                  >
                    Manage Staff
                  </Button>
                </Box>

                {selectedBranch.staff.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <i className='ri-team-line' style={{ fontSize: 48, opacity: 0.3 }} />
                    <Typography variant='body1' sx={{ mt: 2 }}>
                      No staff assigned yet
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedBranch.staff.map(staff => (
                      <Paper
                        key={staff.id}
                        variant='outlined'
                        sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, minWidth: 200 }}
                      >
                        <Avatar sx={{ bgcolor: staff.color || 'primary.main', width: 40, height: 40 }}>
                          {staff.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </Avatar>
                        <Box>
                          <Typography variant='body1' fontWeight={500}>
                            {staff.name}
                          </Typography>
                          {staff.title && (
                            <Typography variant='body2' color='text.secondary'>
                              {staff.title}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Working Hours Tab */}
            <TabPanel value={currentTab} index={3}>
              <Box sx={{ px: 3 }}>
                <Typography variant='h6' sx={{ mb: 3 }}>
                  Weekly Schedule
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedBranch.workingHours.map(hours => (
                    <Paper
                      key={hours.day}
                      variant='outlined'
                      sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: hours.isOpen ? 'transparent' : 'action.hover'
                      }}
                    >
                      <Typography variant='body1' fontWeight={500} sx={{ minWidth: 100 }}>
                        {hours.day}
                      </Typography>
                      {hours.isOpen ? (
                        <Typography variant='body1'>
                          {hours.openTime} - {hours.closeTime}
                        </Typography>
                      ) : (
                        <Typography variant='body1' color='error.main'>
                          Closed
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      ) : (
        // No branch selected
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
            <i className='ri-building-line' style={{ fontSize: 64, opacity: 0.3 }} />
            <Typography variant='h6' sx={{ mt: 2 }}>
              Select a branch
            </Typography>
            <Typography variant='body2'>Choose a branch from the list to view details</Typography>
          </Box>
        </Paper>
      )}

      {/* Branch Editor Drawer */}
      <BranchEditorDrawer />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog} maxWidth='xs' fullWidth>
        <DialogTitle>Delete Branch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{branchToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Add Button */}
      <Fab
        color='primary'
        onClick={() => openBranchEditor()}
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
